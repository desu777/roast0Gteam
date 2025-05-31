#!/usr/bin/env node

/**
 * 🧪 TEST SCRIPT dla Daily Hall of Fame Rewards
 * 
 * Pozwala uruchomić daily rewards dla konkretnej daty w celach testowych.
 * 
 * Użycie:
 * node scripts/test-daily-rewards.js [YYYY-MM-DD]
 * 
 * Przykłady:
 * node scripts/test-daily-rewards.js 2024-01-15
 * node scripts/test-daily-rewards.js              # wczorajsza data
 */

const path = require('path');
const Database = require('better-sqlite3');

// Load config from parent directory
process.chdir(path.join(__dirname, '..'));
require('dotenv').config();

const { config } = require('../src/config/app.config');
const { logger } = require('../src/services/logger.service');
const DailyRewardsScript = require('./daily-rewards');

class TestDailyRewardsScript extends DailyRewardsScript {
  constructor(testDate = null) {
    super();
    this.testMode = true;
    this.customDate = testDate;
  }

  async run() {
    try {
      logger.info('🧪 Starting TEST Daily Hall of Fame Rewards calculation...');
      
      // Override target date if provided
      if (this.customDate) {
        this.targetDate = this.customDate;
        logger.info(`📅 Using custom test date: ${this.targetDate}`);
      } else {
        // Get target date (yesterday in UTC)
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        this.targetDate = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
        logger.info(`📅 Using yesterday's date: ${this.targetDate}`);
      }

      // Initialize database connection
      this.initializeDatabase();
      
      // Initialize blockchain connection
      await this.initializeBlockchain();
      
      // Show existing rewards for this date
      await this.showExistingRewards();
      
      // Show daily stats for this date
      await this.showDailyStats();
      
      // Check if rewards already processed for this date
      const existingRewards = this.checkExistingRewards();
      if (existingRewards.length > 0) {
        logger.warn(`⚠️  Rewards already processed for ${this.targetDate}:`);
        this.displayRewards(existingRewards);
        
        // Ask if user wants to continue
        const forceReprocess = process.env.FORCE_REPROCESS === 'true' || process.argv.includes('--force');
        if (!forceReprocess) {
          logger.info('💡 Use --force flag or FORCE_REPROCESS=true to reprocess existing rewards');
          return;
        } else {
          logger.info('🔄 Force reprocessing enabled. Clearing existing rewards...');
          await this.clearExistingRewards();
        }
      }

      // Step 1: Calculate daily statistics
      await this.calculateDailyStats();
      
      // Step 2: Calculate total fee pool for the day
      const feeData = await this.calculateFeePool();
      if (feeData.rewardsPool <= 0) {
        logger.info(`💰 No rewards pool for ${this.targetDate} (${feeData.rewardsPool} 0G). Skipping distribution.`);
        return;
      }
      
      // Step 3: Determine winners in each category
      const winners = await this.determineWinners();
      if (winners.length === 0) {
        logger.info(`🏆 No qualified players for ${this.targetDate}. Skipping distribution.`);
        return;
      }
      
      // Step 4: Calculate reward amounts
      const rewardDistribution = this.calculateRewardDistribution(feeData.rewardsPool, winners);
      
      // Step 5: Display what would be distributed (without actually sending)
      this.displayRewardPreview(rewardDistribution);
      
      // Ask for confirmation in test mode
      const autoDistribute = process.env.AUTO_DISTRIBUTE === 'true' || process.argv.includes('--distribute');
      if (!autoDistribute) {
        logger.info('💡 Use --distribute flag or AUTO_DISTRIBUTE=true to actually send rewards');
        logger.info('📋 This was a test run - no rewards were actually distributed');
        return;
      }
      
      // Step 6: Distribute rewards (if confirmed)
      await this.distributeRewards(rewardDistribution, feeData);
      
      logger.info('✅ Test Daily Hall of Fame Rewards completed successfully!');
      
    } catch (error) {
      logger.error('❌ Test daily rewards script failed:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  async showExistingRewards() {
    logger.info('📋 Checking existing rewards...');
    
    const existingRewards = this.db.prepare(`
      SELECT 
        category, position, player_address, reward_amount, 
        total_pool, percentage, tx_hash, paid_at
      FROM daily_rewards 
      WHERE date = ?
      ORDER BY category, position
    `).all(this.targetDate);
    
    if (existingRewards.length > 0) {
      logger.info(`Found ${existingRewards.length} existing rewards for ${this.targetDate}:`);
      this.displayRewards(existingRewards);
    } else {
      logger.info(`No existing rewards found for ${this.targetDate}`);
    }
  }

  async showDailyStats() {
    logger.info('📊 Checking daily stats...');
    
    const dailyStats = this.db.prepare(`
      SELECT 
        player_address, total_games, total_wins, total_earned, total_spent,
        CASE WHEN total_games > 0 THEN (total_wins * 100.0 / total_games) ELSE 0 END as win_rate
      FROM daily_stats 
      WHERE date = ?
      ORDER BY total_earned DESC
      LIMIT 10
    `).all(this.targetDate);
    
    if (dailyStats.length > 0) {
      logger.info(`Found ${dailyStats.length} players with daily stats for ${this.targetDate}:`);
      dailyStats.forEach((stat, i) => {
        logger.info(`  ${i + 1}. ${stat.player_address.slice(0, 10)}... - Games: ${stat.total_games}, Wins: ${stat.total_wins}, Earned: ${parseFloat(stat.total_earned).toFixed(4)} 0G, Win Rate: ${parseFloat(stat.win_rate).toFixed(1)}%`);
      });
    } else {
      logger.info(`No daily stats found for ${this.targetDate}`);
    }
  }

  displayRewards(rewards) {
    const categoryNames = {
      'top_earners': 'Top Earners',
      'most_wins': 'Most Wins', 
      'best_win_rate': 'Best Win Rate',
      'most_active': 'Most Active'
    };

    const positions = ['🥇', '🥈', '🥉'];

    rewards.forEach(reward => {
      const categoryName = categoryNames[reward.category] || reward.category;
      const positionIcon = positions[reward.position - 1] || `#${reward.position}`;
      const status = reward.tx_hash ? '✅ Paid' : '❌ Failed';
      
      logger.info(`  ${positionIcon} ${categoryName}: ${reward.player_address.slice(0, 10)}... - ${parseFloat(reward.reward_amount).toFixed(6)} 0G (${reward.percentage}%) ${status}`);
      
      if (reward.tx_hash) {
        logger.info(`    TX: ${reward.tx_hash}`);
      }
    });
  }

  displayRewardPreview(rewardDistribution) {
    logger.info('💎 REWARD DISTRIBUTION PREVIEW:');
    logger.info('=====================================');

    const categoryNames = {
      'top_earners': 'Top Earners',
      'most_wins': 'Most Wins', 
      'best_win_rate': 'Best Win Rate',
      'most_active': 'Most Active'
    };

    const positions = ['🥇', '🥈', '🥉'];
    
    let totalPreview = 0;
    
    rewardDistribution.forEach(reward => {
      const categoryName = categoryNames[reward.category] || reward.category;
      const positionIcon = positions[reward.position - 1] || `#${reward.position}`;
      
      logger.info(`${positionIcon} ${categoryName}: ${reward.player_address.slice(0, 10)}... → ${reward.reward_amount.toFixed(6)} 0G (${reward.percentage}%)`);
      totalPreview += reward.reward_amount;
    });
    
    logger.info('=====================================');
    logger.info(`💰 Total to distribute: ${totalPreview.toFixed(6)} 0G`);
    logger.info(`🎯 Recipients: ${rewardDistribution.length} players`);
  }

  async clearExistingRewards() {
    logger.info('🧹 Clearing existing rewards and treasury balance...');
    
    // Clear existing rewards
    const deleteRewards = this.db.prepare(`
      DELETE FROM daily_rewards WHERE date = ?
    `);
    const deletedRewards = deleteRewards.run(this.targetDate);
    
    // Clear treasury balance
    const deleteTreasury = this.db.prepare(`
      DELETE FROM treasury_balance WHERE date = ?
    `);
    const deletedTreasury = deleteTreasury.run(this.targetDate);
    
    logger.info(`🧹 Cleared ${deletedRewards.changes} rewards and ${deletedTreasury.changes} treasury entries for ${this.targetDate}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let testDate = null;

// Look for date argument (YYYY-MM-DD format)
for (const arg of args) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    testDate = arg;
    break;
  }
}

// Run the test script
if (require.main === module) {
  const script = new TestDailyRewardsScript(testDate);
  
  script.run()
    .then(() => {
      logger.info('🧪 Test daily rewards script completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('❌ Test daily rewards script failed:', error);
      process.exit(1);
    });
}

module.exports = TestDailyRewardsScript; 