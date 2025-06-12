const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { config } = require('../config/app.config');
const { logger } = require('../services/logger.service');

// Migration schemas for 1v1 Battle System
const migrations = [
  {
    version: 1,
    name: 'initial_battle_schema',
    up: `
      -- Current active battle (only 1 at a time)
      CREATE TABLE IF NOT EXISTS current_battle (
        id INTEGER PRIMARY KEY,
        battle_id TEXT NOT NULL UNIQUE,
        og_character_id TEXT NOT NULL,         -- michael, ada, jc, elisha, ren, yon, zer0, dao_agent
        roaster_character_id TEXT NOT NULL,    -- airdrop_hunter, crypto_karen, moon_boy, tech_maxi, rug_survivor, degen_gambler
        status TEXT NOT NULL DEFAULT 'waiting_bets', -- 'waiting_bets', 'countdown', 'generating', 'dialog', 'completed'
        countdown_end DATETIME,                -- When 90s countdown ends
        dialog_json TEXT,                      -- AI-generated conversation as JSON
        winner_side TEXT,                      -- 'og' or 'roaster'
        winner_reasoning TEXT,                 -- AI reasoning for winner decision
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,                   -- When countdown started
        completed_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Bets for current battle
      CREATE TABLE IF NOT EXISTS battle_bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        battle_id TEXT NOT NULL,
        player_address TEXT NOT NULL,
        bet_side TEXT NOT NULL,                -- 'og' or 'roaster'
        bet_amount DECIMAL(10,8) NOT NULL DEFAULT 0.5,
        tx_hash TEXT,                          -- Payment transaction hash
        confirmed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (battle_id) REFERENCES current_battle(battle_id),
        UNIQUE(battle_id, player_address)      -- One bet per player per battle
      );

      -- Battle history for completed battles
      CREATE TABLE IF NOT EXISTS battle_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        battle_id TEXT NOT NULL UNIQUE,
        og_character_id TEXT NOT NULL,
        roaster_character_id TEXT NOT NULL,
        winner_side TEXT NOT NULL,             -- 'og' or 'roaster'
        winner_reasoning TEXT,
        total_pot DECIMAL(10,8) NOT NULL,      -- Total amount bet
        house_fee DECIMAL(10,8) NOT NULL,      -- 5% house fee
        winners_count INTEGER NOT NULL,        -- Number of winning bettors
        losers_count INTEGER NOT NULL,         -- Number of losing bettors
        per_winner_amount DECIMAL(10,8),       -- Amount each winner received
        dialog_json TEXT,                      -- Copy of the dialog
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Battle statistics per player
      CREATE TABLE IF NOT EXISTS battle_stats (
        player_address TEXT PRIMARY KEY,
        total_battles INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_losses INTEGER DEFAULT 0,
        total_bet DECIMAL(10,8) DEFAULT 0,
        total_winnings DECIMAL(10,8) DEFAULT 0,
        favorite_side TEXT DEFAULT 'og',       -- 'og' or 'roaster' - most bet on side
        og_bets INTEGER DEFAULT 0,
        roaster_bets INTEGER DEFAULT 0,
        og_wins INTEGER DEFAULT 0,
        roaster_wins INTEGER DEFAULT 0,
        last_battle_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Payout transactions log
      CREATE TABLE IF NOT EXISTS battle_payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        battle_id TEXT NOT NULL,
        winner_address TEXT NOT NULL,
        payout_amount DECIMAL(10,8) NOT NULL,
        tx_hash TEXT,                          -- Payout transaction hash
        processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (battle_id) REFERENCES battle_history(battle_id)
      );

      -- AI interaction logs (for debugging and improvement)
      CREATE TABLE IF NOT EXISTS ai_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        battle_id TEXT NOT NULL,
        prompt_type TEXT NOT NULL,             -- 'dialog_generation'
        prompt_text TEXT NOT NULL,
        response_text TEXT NOT NULL,
        model_used TEXT NOT NULL,              -- 'gpt-4o-mini'
        tokens_used INTEGER,
        processing_time_ms INTEGER,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_current_battle_status ON current_battle(status);
      CREATE INDEX IF NOT EXISTS idx_current_battle_id ON current_battle(battle_id);
      CREATE INDEX IF NOT EXISTS idx_battle_bets_battle_id ON battle_bets(battle_id);
      CREATE INDEX IF NOT EXISTS idx_battle_bets_player ON battle_bets(player_address);
      CREATE INDEX IF NOT EXISTS idx_battle_bets_confirmed ON battle_bets(confirmed);
      CREATE INDEX IF NOT EXISTS idx_battle_history_completed_at ON battle_history(completed_at);
      CREATE INDEX IF NOT EXISTS idx_battle_stats_player ON battle_stats(player_address);
      CREATE INDEX IF NOT EXISTS idx_battle_payouts_battle_id ON battle_payouts(battle_id);
      CREATE INDEX IF NOT EXISTS idx_ai_logs_battle_id ON ai_logs(battle_id);
      CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at);
    `,
    down: `
      -- Remove indexes
      DROP INDEX IF EXISTS idx_ai_logs_created_at;
      DROP INDEX IF EXISTS idx_ai_logs_battle_id;
      DROP INDEX IF EXISTS idx_battle_payouts_battle_id;
      DROP INDEX IF EXISTS idx_battle_stats_player;
      DROP INDEX IF EXISTS idx_battle_history_completed_at;
      DROP INDEX IF EXISTS idx_battle_bets_confirmed;
      DROP INDEX IF EXISTS idx_battle_bets_player;
      DROP INDEX IF EXISTS idx_battle_bets_battle_id;
      DROP INDEX IF EXISTS idx_current_battle_id;
      DROP INDEX IF EXISTS idx_current_battle_status;
      
      -- Remove tables
      DROP TABLE IF EXISTS ai_logs;
      DROP TABLE IF EXISTS battle_payouts;
      DROP TABLE IF EXISTS battle_stats;
      DROP TABLE IF EXISTS battle_history;
      DROP TABLE IF EXISTS battle_bets;
      DROP TABLE IF EXISTS current_battle;
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