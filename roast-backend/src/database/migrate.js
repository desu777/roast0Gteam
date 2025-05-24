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