const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { config } = require('../config/app.config');
const { logger, perfLogger } = require('../services/logger.service');

class DatabaseService {
  constructor() {
    this.db = null;
    this.statements = {};
  }

  // Initialize database connection
  initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(path.resolve(config.database.path));
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create database connection
      this.db = new Database(config.database.path, {
        verbose: config.logging.testEnv ? (sql, ...params) => {
          // Just log the SQL query, don't execute it
          perfLogger.dbQuery(sql, 0, params);
        } : null
      });

      // Apply performance pragmas
      Object.entries(config.database.pragmas).forEach(([key, value]) => {
        this.db.pragma(`${key} = ${value}`);
      });

      // Prepare commonly used statements
      this.prepareStatements();

      logger.info('Database initialized successfully', {
        path: config.database.path,
        pragmas: config.database.pragmas
      });

    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
      throw error;
    }
  }

  // Prepare common statements for better performance
  prepareStatements() {
    // Round statements
    this.statements.getCurrentRound = this.db.prepare(`
      SELECT * FROM rounds 
      WHERE phase IN ('waiting', 'active', 'judging') 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    this.statements.getRoundById = this.db.prepare(`
      SELECT * FROM rounds WHERE id = ?
    `);

    this.statements.createRound = this.db.prepare(`
      INSERT INTO rounds (judge_character, phase, max_players, timer_duration)
      VALUES (?, 'waiting', ?, ?)
    `);

    this.statements.updateRoundPhase = this.db.prepare(`
      UPDATE rounds 
      SET phase = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    // Submission statements
    this.statements.getSubmissionsByRound = this.db.prepare(`
      SELECT * FROM submissions WHERE round_id = ?
    `);

    this.statements.createSubmission = this.db.prepare(`
      INSERT INTO submissions (round_id, player_address, roast_text, entry_fee)
      VALUES (?, ?, ?, ?)
    `);

    this.statements.getSubmissionCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM submissions WHERE round_id = ?
    `);

    // Player stats statements
    this.statements.getPlayerStats = this.db.prepare(`
      SELECT * FROM player_stats WHERE player_address = ?
    `);

    this.statements.updatePlayerStats = this.db.prepare(`
      INSERT INTO player_stats (player_address, total_games, total_wins, total_spent, total_earned)
      VALUES (?, 1, 0, ?, 0)
      ON CONFLICT(player_address) DO UPDATE SET
        total_games = total_games + 1,
        total_spent = total_spent + excluded.total_spent,
        last_active = CURRENT_TIMESTAMP
    `);

    // Results statements
    this.statements.createResult = this.db.prepare(`
      INSERT INTO results (round_id, winner_submission_id, ai_reasoning, prize_amount)
      VALUES (?, ?, ?, ?)
    `);

    this.statements.getLeaderboard = this.db.prepare(`
      SELECT 
        player_address,
        total_games,
        total_wins,
        total_earned,
        CASE 
          WHEN total_games > 0 THEN CAST(total_wins AS REAL) / total_games 
          ELSE 0 
        END as win_rate
      FROM player_stats
      ORDER BY total_wins DESC, total_earned DESC
      LIMIT ?
    `);
  }

  // Transaction wrapper for atomic operations
  transaction(callback) {
    const start = Date.now();
    try {
      const result = this.db.transaction(callback)();
      const duration = Date.now() - start;
      
      if (duration > 200) {
        perfLogger.slowQuery('TRANSACTION', duration);
      }
      
      return result;
    } catch (error) {
      logger.error('Transaction failed', { error: error.message });
      throw error;
    }
  }

  // Get current active round
  getCurrentRound() {
    return this.statements.getCurrentRound.get();
  }

  // Get round by ID
  getRoundById(id) {
    return this.statements.getRoundById.get(id);
  }

  // Create new round
  createRound(judgeCharacter) {
    const info = this.statements.createRound.run(
      judgeCharacter,
      config.game.maxPlayersPerRound,
      config.game.roundTimerDuration
    );
    return info.lastInsertRowid;
  }

  // Update round phase
  updateRoundPhase(roundId, phase) {
    return this.statements.updateRoundPhase.run(phase, roundId);
  }

  // Start round (update phase and timestamp)
  startRound(roundId) {
    return this.db.prepare(`
      UPDATE rounds 
      SET phase = 'active', 
          started_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(roundId);
  }

  // Complete round
  completeRound(roundId, prizePool) {
    return this.db.prepare(`
      UPDATE rounds 
      SET phase = 'completed',
          prize_pool = ?,
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(prizePool, roundId);
  }

  // Get submissions for a round
  getSubmissionsByRound(roundId) {
    return this.statements.getSubmissionsByRound.all(roundId);
  }

  // Create submission
  createSubmission(roundId, playerAddress, roastText, entryFee = config.zg.entryFee) {
    try {
      const info = this.statements.createSubmission.run(
        roundId, 
        playerAddress, 
        roastText, 
        entryFee
      );
      
      // Update player stats
      this.statements.updatePlayerStats.run(playerAddress, entryFee);
      
      return info.lastInsertRowid;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Player has already submitted to this round');
      }
      throw error;
    }
  }

  // Get submission count for round
  getSubmissionCount(roundId) {
    const result = this.statements.getSubmissionCount.get(roundId);
    return result ? result.count : 0;
  }

  // Get player statistics
  getPlayerStats(playerAddress) {
    return this.statements.getPlayerStats.get(playerAddress);
  }

  // Create game result
  createResult(roundId, winnerSubmissionId, aiReasoning, prizeAmount) {
    return this.transaction(() => {
      // Create result record
      const resultInfo = this.statements.createResult.run(
        roundId,
        winnerSubmissionId,
        aiReasoning,
        prizeAmount
      );

      // Get winner address from submission
      const submission = this.db.prepare(
        'SELECT player_address FROM submissions WHERE id = ?'
      ).get(winnerSubmissionId);

      // Update winner stats
      this.db.prepare(`
        UPDATE player_stats 
        SET total_wins = total_wins + 1,
            total_earned = total_earned + ?,
            last_active = CURRENT_TIMESTAMP
        WHERE player_address = ?
      `).run(prizeAmount, submission.player_address);

      // Complete the round
      this.completeRound(roundId, prizeAmount);

      return resultInfo.lastInsertRowid;
    });
  }

  // Get leaderboard
  getLeaderboard(limit = 10) {
    return this.statements.getLeaderboard.all(limit);
  }

  // Get recent rounds with pagination
  getRecentRounds(limit = 10, offset = 0) {
    return this.db.prepare(`
      SELECT 
        r.*,
        COUNT(s.id) as player_count,
        res.winner_submission_id,
        res.ai_reasoning,
        res.prize_amount
      FROM rounds r
      LEFT JOIN submissions s ON r.id = s.round_id
      LEFT JOIN results res ON r.id = res.round_id
      WHERE r.phase = 'completed'
      GROUP BY r.id
      ORDER BY r.completed_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  // Get global statistics
  getGlobalStats() {
    return this.db.prepare(`
      SELECT 
        COUNT(DISTINCT r.id) as total_rounds,
        COUNT(DISTINCT s.player_address) as totalPlayers,
        SUM(res.prize_amount) as total_prizes_paid,
        AVG(res.prize_amount) as average_prize,
        COUNT(DISTINCT CASE WHEN r.phase = 'completed' THEN r.id END) as completed_rounds
      FROM rounds r
      LEFT JOIN submissions s ON r.id = s.round_id
      LEFT JOIN results res ON r.id = res.round_id
    `).get();
  }

  // Update transaction hash for prize distribution
  updateResultTransaction(resultId, transactionHash) {
    return this.db.prepare(`
      UPDATE results 
      SET transaction_hash = ?
      WHERE id = ?
    `).run(transactionHash, resultId);
  }

  // Config management
  getConfig(key) {
    const result = this.db.prepare('SELECT value FROM config WHERE key = ?').get(key);
    return result ? result.value : null;
  }

  setConfig(key, value, description = null) {
    return this.db.prepare(`
      INSERT INTO config (key, value, description)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        description = COALESCE(excluded.description, description),
        updated_at = CURRENT_TIMESTAMP
    `).run(key, value, description);
  }

  // Backup database
  async backup() {
    const backupPath = path.join(
      config.database.backupPath,
      `roast-backup-${Date.now()}.db`
    );

    // Ensure backup directory exists
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Perform backup
    await this.db.backup(backupPath);
    logger.info('Database backup created', { path: backupPath });
    
    return backupPath;
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      logger.info('Database connection closed');
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService(); 