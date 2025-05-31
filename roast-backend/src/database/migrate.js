const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { config } = require('../config/app.config');
const { logger } = require('../services/logger.service');

// Migration schemas
const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      -- Game rounds management
      CREATE TABLE IF NOT EXISTS rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        judge_character TEXT NOT NULL,
        phase TEXT NOT NULL DEFAULT 'waiting',
        prize_pool DECIMAL(10,8) DEFAULT 0,
        max_players INTEGER DEFAULT 20,
        timer_duration INTEGER DEFAULT 120,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Player submissions for each round
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        player_address TEXT NOT NULL,
        roast_text TEXT NOT NULL,
        entry_fee DECIMAL(10,8) DEFAULT 0.025,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id),
        UNIQUE(round_id, player_address)
      );

      -- Game results and winners
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        winner_submission_id INTEGER NOT NULL,
        ai_reasoning TEXT NOT NULL,
        prize_amount DECIMAL(10,8) NOT NULL,
        transaction_hash TEXT,
        processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id),
        FOREIGN KEY (winner_submission_id) REFERENCES submissions(id)
      );

      -- Player statistics
      CREATE TABLE IF NOT EXISTS player_stats (
        player_address TEXT PRIMARY KEY,
        total_games INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_spent DECIMAL(10,8) DEFAULT 0,
        total_earned DECIMAL(10,8) DEFAULT 0,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- System configuration
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_rounds_phase ON rounds(phase);
      CREATE INDEX IF NOT EXISTS idx_rounds_created_at ON rounds(created_at);
      CREATE INDEX IF NOT EXISTS idx_submissions_round_id ON submissions(round_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_player ON submissions(player_address);
      CREATE INDEX IF NOT EXISTS idx_results_round_id ON results(round_id);
    `,
    down: `
      DROP INDEX IF EXISTS idx_results_round_id;
      DROP INDEX IF EXISTS idx_submissions_player;
      DROP INDEX IF EXISTS idx_submissions_round_id;
      DROP INDEX IF EXISTS idx_rounds_created_at;
      DROP INDEX IF EXISTS idx_rounds_phase;
      
      DROP TABLE IF EXISTS config;
      DROP TABLE IF EXISTS player_stats;
      DROP TABLE IF EXISTS results;
      DROP TABLE IF EXISTS submissions;
      DROP TABLE IF EXISTS rounds;
    `
  },
  {
    version: 2,
    name: 'add_migrations_table',
    up: `
      -- Migrations tracking table
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `
      DROP TABLE IF EXISTS migrations;
    `
  },
  {
    version: 3,
    name: 'add_treasury_tables',
    up: `
      -- Payment transactions tracking
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tx_hash TEXT NOT NULL UNIQUE,
        player_address TEXT NOT NULL,
        round_id TEXT NOT NULL,
        amount DECIMAL(10,8) NOT NULL,
        block_number INTEGER NOT NULL,
        gas_used TEXT,
        confirmed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Prize payout transactions tracking
      CREATE TABLE IF NOT EXISTS payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tx_hash TEXT NOT NULL UNIQUE,
        winner_address TEXT NOT NULL,
        round_id TEXT NOT NULL,
        amount DECIMAL(10,8) NOT NULL,
        house_fee DECIMAL(10,8) NOT NULL,
        block_number INTEGER NOT NULL,
        gas_used TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_payments_player ON payments(player_address);
      CREATE INDEX IF NOT EXISTS idx_payments_round ON payments(round_id);
      CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
      CREATE INDEX IF NOT EXISTS idx_payouts_winner ON payouts(winner_address);
      CREATE INDEX IF NOT EXISTS idx_payouts_round ON payouts(round_id);
      CREATE INDEX IF NOT EXISTS idx_payouts_tx_hash ON payouts(tx_hash);
      CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at);
    `,
    down: `
      DROP INDEX IF EXISTS idx_payouts_created_at;
      DROP INDEX IF EXISTS idx_payouts_tx_hash;
      DROP INDEX IF EXISTS idx_payouts_round;
      DROP INDEX IF EXISTS idx_payouts_winner;
      DROP INDEX IF EXISTS idx_payments_created_at;
      DROP INDEX IF EXISTS idx_payments_tx_hash;
      DROP INDEX IF EXISTS idx_payments_round;
      DROP INDEX IF EXISTS idx_payments_player;
      
      DROP TABLE IF EXISTS payouts;
      DROP TABLE IF EXISTS payments;
    `
  },
  {
    version: 4,
    name: 'add_payout_tx_hash_to_results',
    up: `
      -- Add payout transaction hash to results table
      ALTER TABLE results ADD COLUMN payout_tx_hash TEXT;
      
      -- Add index for performance
      CREATE INDEX IF NOT EXISTS idx_results_payout_tx_hash ON results(payout_tx_hash);
    `,
    down: `
      -- Remove index
      DROP INDEX IF EXISTS idx_results_payout_tx_hash;
      
      -- SQLite doesn't support DROP COLUMN, so we recreate the table
      CREATE TABLE IF NOT EXISTS results_backup AS SELECT 
        id, round_id, winner_submission_id, ai_reasoning, prize_amount, 
        transaction_hash, processed_at 
      FROM results;
      
      DROP TABLE results;
      
      CREATE TABLE results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        winner_submission_id INTEGER NOT NULL,
        ai_reasoning TEXT NOT NULL,
        prize_amount DECIMAL(10,8) NOT NULL,
        transaction_hash TEXT,
        processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id),
        FOREIGN KEY (winner_submission_id) REFERENCES submissions(id)
      );
      
      INSERT INTO results SELECT * FROM results_backup;
      DROP TABLE results_backup;
    `
  },
  {
    version: 5,
    name: 'add_voting_system',
    up: `
      -- Judge voting system
      CREATE TABLE IF NOT EXISTS judge_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        voter_address TEXT NOT NULL,
        character_id TEXT NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id),
        UNIQUE(round_id, voter_address)
      );

      -- Voting statistics per round
      CREATE TABLE IF NOT EXISTS voting_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        character_id TEXT NOT NULL,
        vote_count INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (round_id) REFERENCES rounds(id),
        UNIQUE(round_id, character_id)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_judge_votes_round ON judge_votes(round_id);
      CREATE INDEX IF NOT EXISTS idx_judge_votes_voter ON judge_votes(voter_address);
      CREATE INDEX IF NOT EXISTS idx_judge_votes_character ON judge_votes(character_id);
      CREATE INDEX IF NOT EXISTS idx_voting_stats_round ON voting_stats(round_id);
    `,
    down: `
      DROP INDEX IF EXISTS idx_voting_stats_round;
      DROP INDEX IF EXISTS idx_judge_votes_character;
      DROP INDEX IF EXISTS idx_judge_votes_voter;
      DROP INDEX IF EXISTS idx_judge_votes_round;
      
      DROP TABLE IF EXISTS voting_stats;
      DROP TABLE IF EXISTS judge_votes;
    `
  },
  {
    version: 6,
    name: 'add_judging_started_at',
    up: `
      -- Add judging start timestamp to rounds table
      ALTER TABLE rounds ADD COLUMN judging_started_at DATETIME;
      
      -- Update existing rounds in judging phase to use updated_at as fallback
      UPDATE rounds 
      SET judging_started_at = updated_at 
      WHERE phase = 'judging' AND judging_started_at IS NULL;
    `,
    down: `
      -- SQLite doesn't support DROP COLUMN, so we recreate the table
      CREATE TABLE IF NOT EXISTS rounds_backup AS SELECT 
        id, judge_character, phase, prize_pool, max_players, timer_duration,
        started_at, completed_at, created_at, updated_at
      FROM rounds;
      
      DROP TABLE rounds;
      
      CREATE TABLE rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        judge_character TEXT NOT NULL,
        phase TEXT NOT NULL DEFAULT 'waiting',
        prize_pool DECIMAL(10,8) DEFAULT 0,
        max_players INTEGER DEFAULT 20,
        timer_duration INTEGER DEFAULT 120,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO rounds SELECT * FROM rounds_backup;
      DROP TABLE rounds_backup;
      
      -- Recreate indexes
      CREATE INDEX IF NOT EXISTS idx_rounds_phase ON rounds(phase);
      CREATE INDEX IF NOT EXISTS idx_rounds_created_at ON rounds(created_at);
    `
  },
  {
    version: 7,
    name: 'add_daily_hall_of_fame_system',
    up: `
      -- Daily player statistics (reset every day at midnight UTC)
      CREATE TABLE IF NOT EXISTS daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,                    -- Format: YYYY-MM-DD
        player_address TEXT NOT NULL,
        total_games INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_earned DECIMAL(10,8) DEFAULT 0,
        total_spent DECIMAL(10,8) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, player_address)
      );

      -- Daily reward distributions
      CREATE TABLE IF NOT EXISTS daily_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,                    -- Format: YYYY-MM-DD
        category TEXT NOT NULL,                -- 'top_earners', 'most_wins', 'best_win_rate', 'most_active'
        position INTEGER NOT NULL,             -- 1, 2, 3
        player_address TEXT NOT NULL,
        reward_amount DECIMAL(10,8) NOT NULL,
        total_pool DECIMAL(10,8) NOT NULL,     -- Total pool for the day
        percentage DECIMAL(5,2) NOT NULL,      -- Percentage of total pool (e.g., 12.00 for 12%)
        tx_hash TEXT,                          -- Transaction hash when paid
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, category, position)
      );

      -- Treasury balance tracking (for fee accumulation)
      CREATE TABLE IF NOT EXISTS treasury_balance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,                    -- Format: YYYY-MM-DD
        total_fees_collected DECIMAL(10,8) DEFAULT 0,    -- 5% of total prize pools
        treasury_amount DECIMAL(10,8) DEFAULT 0,         -- 20% of fees (1% total)
        rewards_pool DECIMAL(10,8) DEFAULT 0,            -- 80% of fees (4% total)
        rewards_distributed DECIMAL(10,8) DEFAULT 0,     -- Actually distributed
        rewards_pending DECIMAL(10,8) DEFAULT 0,         -- Pending distribution
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date)
      );

      -- Cron job tracking for daily reward calculations
      CREATE TABLE IF NOT EXISTS cron_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_name TEXT NOT NULL,
        last_run DATETIME,
        next_run DATETIME,
        status TEXT DEFAULT 'pending',         -- 'pending', 'running', 'completed', 'failed'
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_name)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
      CREATE INDEX IF NOT EXISTS idx_daily_stats_player ON daily_stats(player_address);
      CREATE INDEX IF NOT EXISTS idx_daily_stats_date_player ON daily_stats(date, player_address);
      CREATE INDEX IF NOT EXISTS idx_daily_rewards_date ON daily_rewards(date);
      CREATE INDEX IF NOT EXISTS idx_daily_rewards_player ON daily_rewards(player_address);
      CREATE INDEX IF NOT EXISTS idx_daily_rewards_category ON daily_rewards(category);
      CREATE INDEX IF NOT EXISTS idx_treasury_balance_date ON treasury_balance(date);
      CREATE INDEX IF NOT EXISTS idx_cron_jobs_name ON cron_jobs(job_name);
      CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run);

      -- Insert initial cron job entries
      INSERT OR IGNORE INTO cron_jobs (job_name, next_run) VALUES 
        ('daily_stats_calculation', datetime('now', 'start of day', '+1 day', '-1 hour')),
        ('daily_rewards_distribution', datetime('now', 'start of day', '+1 day'));
    `,
    down: `
      -- Remove indexes
      DROP INDEX IF EXISTS idx_cron_jobs_next_run;
      DROP INDEX IF EXISTS idx_cron_jobs_name;
      DROP INDEX IF EXISTS idx_treasury_balance_date;
      DROP INDEX IF EXISTS idx_daily_rewards_category;
      DROP INDEX IF EXISTS idx_daily_rewards_player;
      DROP INDEX IF EXISTS idx_daily_rewards_date;
      DROP INDEX IF EXISTS idx_daily_stats_date_player;
      DROP INDEX IF EXISTS idx_daily_stats_player;
      DROP INDEX IF EXISTS idx_daily_stats_date;
      
      -- Remove tables
      DROP TABLE IF EXISTS cron_jobs;
      DROP TABLE IF EXISTS treasury_balance;
      DROP TABLE IF EXISTS daily_rewards;
      DROP TABLE IF EXISTS daily_stats;
    `
  }
];

class MigrationRunner {
  constructor() {
    this.db = null;
  }

  async run() {
    try {
      logger.info('Starting database migration...');

      // Ensure data directory exists
      const dataDir = path.dirname(path.resolve(config.database.path));
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create database connection
      this.db = new Database(config.database.path);

      // Apply performance pragmas
      Object.entries(config.database.pragmas).forEach(([key, value]) => {
        this.db.pragma(`${key} = ${value}`);
      });

      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');

      // Check if migrations table exists
      const migrationsTableExists = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='migrations'
      `).get();

      if (!migrationsTableExists) {
        // Run the migrations table creation first
        this.runMigration(migrations[1]);
      }

      // Get applied migrations
      const appliedVersions = this.db.prepare(
        'SELECT version FROM migrations'
      ).all().map(row => row.version);

      // Run pending migrations
      for (const migration of migrations) {
        if (!appliedVersions.includes(migration.version)) {
          this.runMigration(migration);
        }
      }

      logger.info('Database migration completed successfully');
      
      // Display current schema info
      this.displaySchemaInfo();

    } catch (error) {
      logger.error('Migration failed', { error: error.message });
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  runMigration(migration) {
    logger.info(`Running migration: ${migration.name} (v${migration.version})`);

    try {
      // Execute migration in a transaction
      this.db.transaction(() => {
        // Execute SQL statements
        const statements = migration.up.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            this.db.exec(statement);
          }
        }

        // Record migration
        if (migration.version !== 2) { // Don't record the migrations table creation itself
          this.db.prepare(
            'INSERT INTO migrations (version, name) VALUES (?, ?)'
          ).run(migration.version, migration.name);
        }
      })();

      logger.info(`Migration ${migration.name} completed successfully`);
    } catch (error) {
      logger.error(`Migration ${migration.name} failed`, { error: error.message });
      throw error;
    }
  }

  displaySchemaInfo() {
    const tables = this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();

    const indexes = this.db.prepare(`
      SELECT name, tbl_name FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
      ORDER BY tbl_name, name
    `).all();

    logger.info('Database schema created:', {
      tables: tables.map(t => t.name),
      indexes: indexes.map(i => ({ name: i.name, table: i.tbl_name }))
    });

    // Count rows in each table
    const rowCounts = {};
    for (const table of tables) {
      const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      rowCounts[table.name] = count.count;
    }

    logger.info('Table row counts:', rowCounts);
  }

  // Rollback function for development/testing
  async rollback(targetVersion = 0) {
    try {
      logger.info(`Rolling back to version ${targetVersion}...`);

      this.db = new Database(config.database.path);

      const appliedMigrations = this.db.prepare(
        'SELECT version, name FROM migrations WHERE version > ? ORDER BY version DESC'
      ).all(targetVersion);

      for (const applied of appliedMigrations) {
        const migration = migrations.find(m => m.version === applied.version);
        if (migration && migration.down) {
          logger.info(`Rolling back: ${migration.name} (v${migration.version})`);
          
          this.db.transaction(() => {
            const statements = migration.down.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
              if (statement.trim()) {
                this.db.exec(statement);
              }
            }
            
            this.db.prepare('DELETE FROM migrations WHERE version = ?').run(migration.version);
          })();
        }
      }

      logger.info('Rollback completed successfully');
    } catch (error) {
      logger.error('Rollback failed', { error: error.message });
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }
}

// Run migrations if called directly
if (require.main === module) {
  const runner = new MigrationRunner();
  
  const command = process.argv[2];
  
  if (command === 'rollback') {
    const targetVersion = parseInt(process.argv[3]) || 0;
    runner.rollback(targetVersion)
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Rollback failed:', err.message);
        process.exit(1);
      });
  } else {
    runner.run()
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Migration failed:', err.message);
        process.exit(1);
      });
  }
}

module.exports = MigrationRunner; 