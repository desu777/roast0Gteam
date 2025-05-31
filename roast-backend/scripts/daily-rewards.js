#!/usr/bin/env node

/**
 * 🏆 DAILY HALL OF FAME REWARDS SCRIPT
 * 
 * Ten skrypt oblicza codzienne nagrody z 5% house fee i dystrybuuje je
 * do top graczy w 4 kategoriach zgodnie z systemem Hall of Fame.
 * 
 * Uruchamiany codziennie o północy UTC przez systemowy cron:
 * 0 0 * * * /usr/bin/node /path/to/roast-backend/scripts/daily-rewards.js
 * 
 * System nagród:
 * - Treasury: 20% fee (1% z całości)
 * - Daily rewards: 80% fee (4% z całości)
 * - 4 kategorie × 3 pozycje = 12 nagrodzonych graczy dziennie
 */

const path = require('path');
const Database = require('better-sqlite3');

// Load config from parent directory
process.chdir(path.join(__dirname, '..'));
require('dotenv').config();

const { config } = require('../src/config/app.config');
const { logger } = require('../src/services/logger.service');
const { ethers } = require('ethers');

class DailyRewardsScript {
  constructor() {
    this.db = null;
    this.provider = null;
    this.hotWallet = null;
    this.targetDate = null;
  }

  async run() {
    try {
      logger.info('🏆 Starting Daily Hall of Fame Rewards calculation...');
      
      // Get target date (yesterday in UTC)
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      this.targetDate = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
      
      logger.info(`📅 Processing rewards for date: ${this.targetDate}`);

      // Initialize database connection
      this.initializeDatabase();
      
      // Initialize blockchain connection
      await this.initializeBlockchain();
      
      // Check if rewards already processed for this date
      const existingRewards = this.checkExistingRewards();
      if (existingRewards.length > 0) {
        logger.warn(`⚠️  Rewards already processed for ${this.targetDate}. Skipping...`);
        return;
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
      
      // Step 5: Distribute rewards
      await this.distributeRewards(rewardDistribution, feeData);
      
      logger.info('✅ Daily Hall of Fame Rewards completed successfully!');
      
    } catch (error) {
      logger.error('❌ Daily rewards script failed:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  initializeDatabase() {
    try {
      this.db = new Database(config.database.path);
      
      // Apply performance pragmas
      Object.entries(config.database.pragmas).forEach(([key, value]) => {
        this.db.pragma(`${key} = ${value}`);
      });
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      
      logger.info('📊 Database connected successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async initializeBlockchain() {
    try {
      // Create provider for 0G Network
      this.provider = new ethers.JsonRpcProvider(config.zg.networkRpc, {
        chainId: config.zg.chainId,
        name: config.zg.networkName
      });

      // Initialize hot wallet for automated payouts
      if (config.zg.hotWalletPrivateKey) {
        this.hotWallet = new ethers.Wallet(config.zg.hotWalletPrivateKey, this.provider);
        logger.info('🔑 Hot wallet initialized:', {
          address: this.hotWallet.address,
          network: config.zg.networkName
        });
      } else {
        throw new Error('Hot wallet private key not configured');
      }
      
    } catch (error) {
      logger.error('Failed to initialize blockchain connection:', error);
      throw error;
    }
  }

  checkExistingRewards() {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM daily_rewards 
      WHERE date = ?
    `);
    const result = stmt.get(this.targetDate);
    
    if (result.count > 0) {
      const existingRewards = this.db.prepare(`
        SELECT category, position, player_address, reward_amount 
        FROM daily_rewards 
        WHERE date = ?
        ORDER BY category, position
      `).all(this.targetDate);
      
      return existingRewards;
    }
    
    return [];
  }

  async calculateDailyStats() {
    logger.info('📈 Calculating daily statistics...');
    
    // Get all completed rounds from target date
    const rounds = this.db.prepare(`
      SELECT r.id, r.prize_pool, r.completed_at
      FROM rounds r
      WHERE DATE(r.completed_at) = ? 
      AND r.phase = 'completed'
    `).all(this.targetDate);
    
    logger.info(`🎮 Found ${rounds.length} completed rounds for ${this.targetDate}`);
    
    if (rounds.length === 0) {
      return;
    }
    
    // Get all submissions and results for these rounds
    const playerStats = new Map();
    
    for (const round of rounds) {
      // Get submissions for this round
      const submissions = this.db.prepare(`
        SELECT s.player_address, s.entry_fee
        FROM submissions s
        WHERE s.round_id = ?
      `).all(round.id);
      
      // Get winner for this round
      const winner = this.db.prepare(`
        SELECT s.player_address, res.prize_amount
        FROM results res
        JOIN submissions s ON res.winner_submission_id = s.id
        WHERE res.round_id = ?
      `).get(round.id);
      
      // Update player stats
      for (const submission of submissions) {
        const addr = submission.player_address.toLowerCase();
        
        if (!playerStats.has(addr)) {
          playerStats.set(addr, {
            total_games: 0,
            total_wins: 0,
            total_earned: 0,
            total_spent: 0
          });
        }
        
        const stats = playerStats.get(addr);
        stats.total_games += 1;
        stats.total_spent += parseFloat(submission.entry_fee);
        
        // Check if this player won this round
        if (winner && winner.player_address.toLowerCase() === addr) {
          stats.total_wins += 1;
          stats.total_earned += parseFloat(winner.prize_amount);
        }
      }
    }
    
    // Insert/update daily stats
    const upsertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_stats (
        date, player_address, total_games, total_wins, 
        total_earned, total_spent, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    let insertedCount = 0;
    for (const [playerAddress, stats] of playerStats) {
      upsertStmt.run(
        this.targetDate,
        playerAddress,
        stats.total_games,
        stats.total_wins,
        stats.total_earned,
        stats.total_spent
      );
      insertedCount++;
    }
    
    logger.info(`💾 Updated daily stats for ${insertedCount} players`);
  }

  async calculateFeePool() {
    logger.info('💰 Calculating daily fee pool...');
    
    // Get total fees collected from house fees (5% of prize pools)
    const feeData = this.db.prepare(`
      SELECT 
        COALESCE(SUM(house_fee), 0) as total_fees_collected,
        COUNT(*) as total_payouts
      FROM payouts 
      WHERE DATE(created_at) = ?
    `).get(this.targetDate);
    
    const totalFeesCollected = parseFloat(feeData.total_fees_collected);
    
    // Calculate distribution (80% for rewards, 20% for treasury)
    const treasuryAmount = totalFeesCollected * 0.20;  // 20% of fees = 1% of total
    const rewardsPool = totalFeesCollected * 0.80;     // 80% of fees = 4% of total
    
    // Store in treasury_balance table
    const treasuryStmt = this.db.prepare(`
      INSERT OR REPLACE INTO treasury_balance (
        date, total_fees_collected, treasury_amount, 
        rewards_pool, rewards_distributed, rewards_pending, updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
    `);
    
    treasuryStmt.run(
      this.targetDate,
      totalFeesCollected,
      treasuryAmount,
      rewardsPool,
      rewardsPool  // Initially all pending
    );
    
    logger.info(`💰 Fee pool calculated:`, {
      totalFeesCollected: totalFeesCollected.toFixed(6),
      treasuryAmount: treasuryAmount.toFixed(6),
      rewardsPool: rewardsPool.toFixed(6),
      totalPayouts: feeData.total_payouts
    });
    
    return {
      totalFeesCollected,
      treasuryAmount,
      rewardsPool
    };
  }

  async determineWinners() {
    logger.info('🏆 Determining winners in each category...');
    
    const categories = [
      {
        id: 'top_earners',
        name: 'Top Earners',
        query: `
          SELECT player_address, total_earned, total_games, total_wins,
                 CASE WHEN total_games > 0 THEN (total_wins * 100.0 / total_games) ELSE 0 END as win_rate
          FROM daily_stats 
          WHERE date = ? AND total_games >= 3
          ORDER BY total_earned DESC, total_wins DESC
          LIMIT 3
        `
      },
      {
        id: 'most_wins',
        name: 'Most Wins',
        query: `
          SELECT player_address, total_wins, total_games, total_earned,
                 CASE WHEN total_games > 0 THEN (total_wins * 100.0 / total_games) ELSE 0 END as win_rate
          FROM daily_stats 
          WHERE date = ? AND total_games >= 3
          ORDER BY total_wins DESC, total_earned DESC
          LIMIT 3
        `
      },
      {
        id: 'best_win_rate',
        name: 'Best Win Rate',
        query: `
          SELECT player_address, 
                 CASE WHEN total_games > 0 THEN (total_wins * 100.0 / total_games) ELSE 0 END as win_rate,
                 total_wins, total_games, total_earned
          FROM daily_stats 
          WHERE date = ? AND total_games >= 3 AND total_wins >= 2
          ORDER BY (total_wins * 1.0 / total_games) DESC, total_wins DESC
          LIMIT 3
        `
      },
      {
        id: 'most_active',
        name: 'Most Active',
        query: `
          SELECT player_address, total_games, total_wins, total_earned,
                 CASE WHEN total_games > 0 THEN (total_wins * 100.0 / total_games) ELSE 0 END as win_rate
          FROM daily_stats 
          WHERE date = ? AND total_games >= 3
          ORDER BY total_games DESC, total_wins DESC
          LIMIT 3
        `
      }
    ];
    
    const allWinners = [];
    
    for (const category of categories) {
      const winners = this.db.prepare(category.query).all(this.targetDate);
      
      logger.info(`🥇 ${category.name}:`, {
        winnersCount: winners.length,
        winners: winners.map((w, i) => ({
          position: i + 1,
          address: w.player_address.slice(0, 10) + '...',
          stats: w
        }))
      });
      
      winners.forEach((winner, index) => {
        allWinners.push({
          category: category.id,
          position: index + 1,
          player_address: winner.player_address,
          stats: winner
        });
      });
    }
    
    return allWinners;
  }

  calculateRewardDistribution(totalPool, winners) {
    logger.info('💎 Calculating reward distribution...');
    
    // Each category gets 25% of the pool
    const categoryPool = totalPool / 4;
    
    // Each category distribution: 1st: 12%, 2nd: 8%, 3rd: 5% = 25% total
    const positionPercentages = {
      1: 0.12,  // 12% of total pool
      2: 0.08,  // 8% of total pool  
      3: 0.05   // 5% of total pool
    };
    
    const distribution = [];
    
    for (const winner of winners) {
      const percentage = positionPercentages[winner.position];
      const rewardAmount = totalPool * percentage;
      
      distribution.push({
        ...winner,
        reward_amount: rewardAmount,
        total_pool: totalPool,
        percentage: percentage * 100  // Convert to percentage for storage
      });
    }
    
    const totalDistributed = distribution.reduce((sum, d) => sum + d.reward_amount, 0);
    
    logger.info(`💎 Reward distribution calculated:`, {
      totalPool: totalPool.toFixed(6),
      totalDistributed: totalDistributed.toFixed(6),
      categoryPool: categoryPool.toFixed(6),
      rewardsCount: distribution.length
    });
    
    return distribution;
  }

  async distributeRewards(rewardDistribution, feeData) {
    logger.info('🚀 Starting reward distribution...');
    
    if (!this.hotWallet) {
      throw new Error('Hot wallet not initialized');
    }
    
    // Check hot wallet balance
    const hotWalletBalance = await this.provider.getBalance(this.hotWallet.address);
    const totalToDistribute = rewardDistribution.reduce((sum, r) => sum + r.reward_amount, 0);
    const totalToDistributeWei = ethers.parseEther(totalToDistribute.toString());
    
    if (hotWalletBalance < totalToDistributeWei) {
      throw new Error(`Insufficient hot wallet balance. Need: ${totalToDistribute.toFixed(6)} 0G, Have: ${ethers.formatEther(hotWalletBalance)} 0G`);
    }
    
    logger.info(`💳 Hot wallet balance check passed:`, {
      available: ethers.formatEther(hotWalletBalance),
      needed: totalToDistribute.toFixed(6)
    });
    
    let successfulDistributions = 0;
    let totalDistributed = 0;
    
    // Process each reward
    for (const reward of rewardDistribution) {
      try {
        logger.info(`💸 Sending reward to ${reward.player_address.slice(0, 10)}... (${reward.category} #${reward.position}): ${reward.reward_amount.toFixed(6)} 0G`);
        
        const rewardAmountWei = ethers.parseEther(reward.reward_amount.toString());
        
        // Estimate gas
        const gasEstimate = await this.provider.estimateGas({
          to: reward.player_address,
          value: rewardAmountWei
        });
        
        // Send transaction
        const tx = await this.hotWallet.sendTransaction({
          to: reward.player_address,
          value: rewardAmountWei,
          gasLimit: gasEstimate
        });
        
        logger.info(`⏳ Transaction sent: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait(1);
        
        if (receipt.status !== 1) {
          throw new Error('Transaction failed');
        }
        
        // Record in database
        const rewardStmt = this.db.prepare(`
          INSERT INTO daily_rewards (
            date, category, position, player_address, 
            reward_amount, total_pool, percentage, 
            tx_hash, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        
        rewardStmt.run(
          this.targetDate,
          reward.category,
          reward.position,
          reward.player_address,
          reward.reward_amount,
          reward.total_pool,
          reward.percentage,
          tx.hash
        );
        
        successfulDistributions++;
        totalDistributed += reward.reward_amount;
        
        logger.info(`✅ Reward distributed successfully: ${reward.reward_amount.toFixed(6)} 0G to ${reward.player_address.slice(0, 10)}...`);
        
        // Small delay between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        logger.error(`❌ Failed to distribute reward to ${reward.player_address}:`, error);
        
        // Record failed attempt (without tx_hash)
        const rewardStmt = this.db.prepare(`
          INSERT INTO daily_rewards (
            date, category, position, player_address, 
            reward_amount, total_pool, percentage
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        rewardStmt.run(
          this.targetDate,
          reward.category,
          reward.position,
          reward.player_address,
          reward.reward_amount,
          reward.total_pool,
          reward.percentage
        );
      }
    }
    
    // Update treasury balance with actual distributed amounts
    const updateTreasuryStmt = this.db.prepare(`
      UPDATE treasury_balance 
      SET rewards_distributed = ?, 
          rewards_pending = rewards_pool - ?,
          updated_at = datetime('now')
      WHERE date = ?
    `);
    
    updateTreasuryStmt.run(totalDistributed, totalDistributed, this.targetDate);
    
    logger.info(`🎉 Daily rewards distribution completed:`, {
      date: this.targetDate,
      totalRewards: rewardDistribution.length,
      successfulDistributions,
      totalDistributed: totalDistributed.toFixed(6),
      failedDistributions: rewardDistribution.length - successfulDistributions
    });
  }
}

// Run the script
if (require.main === module) {
  const script = new DailyRewardsScript();
  
  script.run()
    .then(() => {
      logger.info('🏆 Daily rewards script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('❌ Daily rewards script failed:', error);
      process.exit(1);
    });
}

module.exports = DailyRewardsScript; 