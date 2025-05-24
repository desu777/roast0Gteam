const MigrationRunner = require('./migrate');
const DatabaseSeeder = require('./seed');
const { logger } = require('../services/logger.service');
const { config } = require('../config/app.config');

async function createDatabase() {
  try {
    console.log('🚀 Creating 0G Roast Arena database...\n');

    // Run migrations
    console.log('📊 Running migrations...');
    const migrationRunner = new MigrationRunner();
    await migrationRunner.run();
    console.log('✅ Migrations completed!\n');

    // Run seeder in development
    if (config.server.env !== 'production') {
      const shouldSeed = process.argv.includes('--seed') || process.argv.includes('-s');
      
      if (shouldSeed) {
        console.log('🌱 Seeding database with test data...');
        const seeder = new DatabaseSeeder();
        await seeder.run();
        console.log('✅ Seeding completed!\n');
      } else {
        console.log('💡 Tip: Use --seed flag to populate with test data\n');
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log(`📁 Database location: ${config.database.path}`);
    
    if (config.server.env !== 'production') {
      console.log('\n📋 Next steps:');
      console.log('1. Copy env.example to .env and configure');
      console.log('2. Run "npm run dev" to start the development server');
      console.log('3. Check http://localhost:3001/health for server status');
    }

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    logger.error('Database creation failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase; 