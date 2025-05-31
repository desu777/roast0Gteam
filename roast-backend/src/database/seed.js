const Database = require('better-sqlite3');
const path = require('path');
const { config } = require('../config/app.config');
const { logger } = require('../services/logger.service');

// Sample addresses for testing
const sampleAddresses = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f8fA12',
  '0x3141592653589793238462643383279502884197',
  '0x271828182845904523536028747135266249195',
  '0x577215664901532860606512090082402431415',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
];

// Sample roasts for different characters
const sampleRoasts = {
  michael: [
    "Michael's vision is so grand, he needs a telescope just to see his own PowerPoint slides",
    "Claims to be building the future of AI, but still uses Internet Explorer for 'compatibility'",
    "His moon mission? Teaching GPT how to properly use LinkedIn buzzwords",
    "Michael's strategy meetings are so long, even the AI falls asleep",
    "Bridgewater taught him everything except how to make a website load in under 10 seconds"
  ],
  ada: [
    "Ada's marketing is so dreamy, even the code needs a reality check",
    "She put 'community first' but forgot to invite the community to the meeting",
    "Her inspirational quotes have more layers than our entire tech stack",
    "MIT Sloan prepared her for everything except explaining Web3 to her parents",
    "Dreams so big, the cloud storage bills are astronomical"
  ],
  jc: [
    "JC's growth hacks are so aggressive, even the servers need therapy",
    "Rebels against Big Tech by using their cloud services",
    "His memes are fire but his code still compiles with warnings",
    "Talks about revolution while his git commits say 'minor fixes'",
    "0gm? More like 0 git management"
  ],
  elisha: [
    "Translates complex tech so well, even the blockchain gets confused",
    "Community voice so loud, Discord needs noise cancellation",
    "Started in crypto at 16, still waiting for his first profitable trade",
    "Podcasts about decentralization from his centralized apartment",
    "Explains Web3 so simply, Web2 feels personally attacked"
  ],
  ren: [
    "Codes in binary because JSON is too mainstream",
    "His scalability solution? Just delete half the features",
    "11 years at Microsoft, still can't exit Vim",
    "Achieves inner peace by ignoring all error logs",
    "Zen master of blockchain, panic master of deadlines"
  ]
};

class DatabaseSeeder {
  constructor() {
    this.db = null;
  }

  async run() {
    try {
      if (config.server.env === 'production') {
        logger.warn('Seeding is not allowed in production environment');
        return;
      }

      logger.info('Starting database seeding...');

      // Create database connection
      this.db = new Database(config.database.path);

      // Apply performance pragmas
      Object.entries(config.database.pragmas).forEach(([key, value]) => {
        this.db.pragma(`${key} = ${value}`);
      });

      // Clear existing data (for development only)
      await this.clearData();

      // Seed data
      await this.seedConfig();
      await this.seedCompletedRounds();
      await this.seedActiveRound();
      await this.seedPlayerStats();

      logger.info('Database seeding completed successfully');
      
      // Display seeded data summary
      this.displaySeedSummary();

    } catch (error) {
      logger.error('Seeding failed', { error: error.message });
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  async clearData() {
    logger.info('Clearing existing data...');
    
    this.db.transaction(() => {
      this.db.exec('DELETE FROM results');
      this.db.exec('DELETE FROM submissions');
      this.db.exec('DELETE FROM rounds');
      this.db.exec('DELETE FROM player_stats');
      this.db.exec('DELETE FROM config WHERE key NOT LIKE "system_%"');
    })();
  }

  async seedConfig() {
    logger.info('Seeding configuration...');

    const configs = [
      { key: 'maintenance_mode', value: 'false', description: 'System maintenance mode flag' },
      { key: 'min_players_to_start', value: '2', description: 'Minimum players to start a round' },
      { key: 'auto_start_enabled', value: 'true', description: 'Auto-start new rounds after completion' },
      { key: 'profanity_words', value: 'badword1,badword2', description: 'Comma-separated profanity filter list' },
      { key: 'system_version', value: '1.0.0', description: 'Current system version' }
    ];

    const stmt = this.db.prepare(
      'INSERT INTO config (key, value, description) VALUES (?, ?, ?)'
    );

    for (const config of configs) {
      stmt.run(config.key, config.value, config.description);
    }
  }

  async seedCompletedRounds() {
    logger.info('Seeding completed rounds...');

    const characters = config.characters;
    const roundCount = 10;

    for (let i = 0; i < roundCount; i++) {
      const character = characters[i % characters.length];
      const playerCount = 3 + Math.floor(Math.random() * 5);
      const prizePool = playerCount * config.zg.entryFee;

      // Create round
      const roundInfo = this.db.prepare(`
        INSERT INTO rounds (
          judge_character, phase, prize_pool, max_players, timer_duration,
          started_at, completed_at, created_at
        ) VALUES (?, 'completed', ?, ?, ?, datetime('now', '-${i * 2} hours'), datetime('now', '-${i * 2 - 0.05} hours'), datetime('now', '-${i * 2.1} hours'))
      `).run(
        character,
        prizePool,
        config.game.maxPlayersPerRound,
        config.game.roundTimerDuration
      );

      const roundId = roundInfo.lastInsertRowid;

      // Create submissions
      const submissions = [];
      const usedAddresses = [];
      
      for (let j = 0; j < playerCount; j++) {
        let address;
        do {
          address = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
        } while (usedAddresses.includes(address));
        
        usedAddresses.push(address);

        const roastOptions = sampleRoasts[character] || sampleRoasts.michael;
        const roast = roastOptions[Math.floor(Math.random() * roastOptions.length)];

        const subInfo = this.db.prepare(`
          INSERT INTO submissions (round_id, player_address, roast_text, entry_fee)
          VALUES (?, ?, ?, ?)
        `).run(roundId, address, roast, config.zg.entryFee);

        submissions.push({
          id: subInfo.lastInsertRowid,
          address: address
        });
      }

      // Pick winner and create result
      const winner = submissions[Math.floor(Math.random() * submissions.length)];
      const prizeAmount = prizePool * (1 - config.zg.houseFeePercentage / 100);

      this.db.prepare(`
        INSERT INTO results (
          round_id, winner_submission_id, ai_reasoning, prize_amount, transaction_hash
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        roundId,
        winner.id,
        `After careful evaluation, this roast demonstrated superior ${character === 'michael' ? 'vision' : character === 'ada' ? 'creativity' : character === 'jc' ? 'growth potential' : character === 'elisha' ? 'community spirit' : character === 'ren' ? 'technical elegance' : character === 'zer0' ? 'duality and algorithmic beauty' : character === 'dao_agent' ? 'governance insight and meritocratic justice' : 'excellence'} and wit.`,
        prizeAmount,
        '0x' + Math.random().toString(16).substr(2, 64)
      );

      // Update player stats
      for (const submission of submissions) {
        const isWinner = submission.id === winner.id;
        
        this.db.prepare(`
          INSERT INTO player_stats (
            player_address, total_games, total_wins, total_spent, total_earned
          ) VALUES (?, 1, ?, ?, ?)
          ON CONFLICT(player_address) DO UPDATE SET
            total_games = total_games + 1,
            total_wins = total_wins + ?,
            total_spent = total_spent + ?,
            total_earned = total_earned + ?
        `).run(
          submission.address,
          isWinner ? 1 : 0,
          config.zg.entryFee,
          isWinner ? prizeAmount : 0,
          isWinner ? 1 : 0,
          config.zg.entryFee,
          isWinner ? prizeAmount : 0
        );
      }
    }
  }

  async seedActiveRound() {
    logger.info('Seeding active round...');

    // Create a waiting round
    const character = 'michael';
    const roundInfo = this.db.prepare(`
      INSERT INTO rounds (
        judge_character, phase, max_players, timer_duration
      ) VALUES (?, 'waiting', ?, ?)
    `).run(
      character,
      config.game.maxPlayersPerRound,
      config.game.roundTimerDuration
    );

    const roundId = roundInfo.lastInsertRowid;

    // Add one player to the waiting round
    const address = sampleAddresses[0];
    const roast = "Michael's vision board has its own vision board";

    this.db.prepare(`
      INSERT INTO submissions (round_id, player_address, roast_text, entry_fee)
      VALUES (?, ?, ?, ?)
    `).run(roundId, address, roast, config.zg.entryFee);

    // Update round prize pool
    this.db.prepare(`
      UPDATE rounds SET prize_pool = ? WHERE id = ?
    `).run(config.zg.entryFee, roundId);
  }

  async seedPlayerStats() {
    logger.info('Updating final player stats...');

    // Add some players who haven't won anything
    const losingPlayers = sampleAddresses.slice(-3);
    
    for (const address of losingPlayers) {
      const exists = this.db.prepare(
        'SELECT 1 FROM player_stats WHERE player_address = ?'
      ).get(address);

      if (!exists) {
        this.db.prepare(`
          INSERT INTO player_stats (
            player_address, total_games, total_wins, total_spent, total_earned
          ) VALUES (?, ?, 0, ?, 0)
        `).run(
          address,
          2 + Math.floor(Math.random() * 3),
          (2 + Math.floor(Math.random() * 3)) * config.zg.entryFee
        );
      }
    }
  }

  displaySeedSummary() {
    const summary = {
      rounds: this.db.prepare('SELECT COUNT(*) as count FROM rounds').get().count,
      submissions: this.db.prepare('SELECT COUNT(*) as count FROM submissions').get().count,
      results: this.db.prepare('SELECT COUNT(*) as count FROM results').get().count,
      players: this.db.prepare('SELECT COUNT(*) as count FROM player_stats').get().count,
      configs: this.db.prepare('SELECT COUNT(*) as count FROM config').get().count
    };

    const topPlayers = this.db.prepare(`
      SELECT player_address, total_wins, total_earned
      FROM player_stats
      ORDER BY total_wins DESC, total_earned DESC
      LIMIT 3
    `).all();

    logger.info('Seed data summary:', {
      ...summary,
      topPlayers: topPlayers.map(p => ({
        address: p.player_address.substring(0, 10) + '...',
        wins: p.total_wins,
        earned: p.total_earned.toFixed(3) + ' 0G'
      }))
    });
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  
  seeder.run()
    .then(() => {
      console.log('✅ Database seeding completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Seeding failed:', err.message);
      process.exit(1);
    });
}

module.exports = DatabaseSeeder; 