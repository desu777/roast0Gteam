const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const database = require('../../database/database.service');
const { ethers } = require('ethers');
const { HallOfFameService } = require('./halloffame.service');

class PlayersService {
  constructor() {
    this.hallOfFameService = new HallOfFameService();
    if (config.logging.testEnv) {
      logger.info('Players service initialized');
    }
  }

  /**
   * Get player profile and statistics
   * @param {string} playerAddress - Player wallet address
   * @returns {Object} Player profile data
   */
  getPlayerProfile(playerAddress) {
    try {
      // Get player stats
      const playerStats = database.db.prepare(`
        SELECT * FROM player_stats WHERE player_address = ?
      `).get(playerAddress.toLowerCase());

      // Get recent submissions
      const recentSubmissions = database.db.prepare(`
        SELECT s.*, r.judge_character, r.completed_at
        FROM submissions s
        JOIN rounds r ON s.round_id = r.id
        WHERE s.player_address = ?
        ORDER BY s.submitted_at DESC
        LIMIT 10
      `).all(playerAddress.toLowerCase());

      // Get wins
      const wins = database.db.prepare(`
        SELECT r.id as round_id, r.judge_character, res.prize_amount, 
               res.processed_at, res.payout_tx_hash
        FROM results res
        JOIN rounds r ON res.round_id = r.id
        JOIN submissions s ON res.winner_submission_id = s.id
        WHERE s.player_address = ?
        ORDER BY res.processed_at DESC
        LIMIT 10
      `).all(playerAddress.toLowerCase());

      // Calculate additional stats
      const totalGames = recentSubmissions.length;
      const totalWins = wins.length;
      const winRate = totalGames > 0 ? (totalWins / totalGames * 100).toFixed(2) : 0;

      return {
        address: playerAddress,
        stats: {
          totalGames: playerStats?.total_games || totalGames,
          totalWins: playerStats?.total_wins || totalWins,
          totalSpent: parseFloat(playerStats?.total_spent || 0),
          totalEarned: parseFloat(playerStats?.total_earned || 0),
          winRate: parseFloat(winRate),
          netProfit: parseFloat(playerStats?.total_earned || 0) - parseFloat(playerStats?.total_spent || 0),
          lastActive: playerStats?.last_active,
          memberSince: playerStats?.created_at
        },
        recentGames: recentSubmissions.map(sub => ({
          roundId: sub.round_id,
          judgeCharacter: sub.judge_character,
          submittedAt: sub.submitted_at,
          roundCompleted: sub.completed_at
        })),
        recentWins: wins.map(win => ({
          roundId: win.round_id,
          judgeCharacter: win.judge_character,
          prizeAmount: parseFloat(win.prize_amount),
          paidOut: !!win.payout_tx_hash,
          payoutTxHash: win.payout_tx_hash,
          wonAt: win.processed_at
        }))
      };

    } catch (error) {
      logger.error('Failed to get player profile', { 
        error: error.message, 
        playerAddress 
      });
      throw error;
    }
  }

  /**
   * Verify wallet signature for authentication
   * @param {string} address - Wallet address
   * @param {string} signature - Signature from wallet
   * @param {string} message - Original message that was signed
   * @param {number} timestamp - Timestamp when message was created
   * @returns {Object} Verification result
   */
  async verifyWalletSignature(address, signature, message, timestamp) {
    try {
      // Check if timestamp is recent (max 5 minutes old)
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 300; // 5 minutes
      
      if (now - timestamp > maxAge) {
        return {
          valid: false,
          reason: 'Signature timestamp too old (max 5 minutes)'
        };
      }

      // Verify that message includes the timestamp and address
      const expectedMessage = `0G Roast Arena authentication\nAddress: ${address}\nTimestamp: ${timestamp}`;
      if (message !== expectedMessage) {
        return {
          valid: false,
          reason: 'Message format invalid'
        };
      }

      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return {
          valid: false,
          reason: 'Signature does not match address'
        };
      }

      // Update last active timestamp
      this.updatePlayerLastActive(address);

      if (config.logging.testEnv) {
        logger.info('Wallet signature verified', { 
          address, 
          timestamp,
          recoveredAddress 
        });
      }

      return {
        valid: true,
        address: recoveredAddress.toLowerCase(),
        timestamp
      };

    } catch (error) {
      logger.error('Wallet signature verification failed', { 
        error: error.message, 
        address, 
        signature: signature.substring(0, 10) + '...' 
      });
      
      return {
        valid: false,
        reason: 'Signature verification failed'
      };
    }
  }

  /**
   * Get leaderboard of top players
   * @param {number} limit - Number of top players to return
   * @param {string} sortBy - Sort criteria (wins, earnings, games, winRate)
   * @returns {Array} Leaderboard data
   */
  getLeaderboard(limit = 10, sortBy = 'totalEarned') {
    try {
      let orderByClause;
      
      switch (sortBy) {
        case 'wins':
          orderByClause = 'total_wins DESC, total_earned DESC';
          break;
        case 'earnings':
          orderByClause = 'total_earned DESC, total_wins DESC';
          break;
        case 'games':
          orderByClause = 'total_games DESC, total_wins DESC';
          break;
        case 'winRate':
          orderByClause = 'CASE WHEN total_games > 0 THEN (total_wins * 1.0 / total_games) ELSE 0 END DESC, total_wins DESC';
          break;
        default:
          orderByClause = 'total_earned DESC, total_wins DESC';
      }

      const leaderboard = database.db.prepare(`
        SELECT 
          player_address,
          total_games,
          total_wins,
          total_spent,
          total_earned,
          (total_earned - total_spent) as net_profit,
          CASE 
            WHEN total_games > 0 THEN ROUND((total_wins * 100.0 / total_games), 2)
            ELSE 0 
          END as win_rate,
          last_active
        FROM player_stats
        WHERE total_games > 0
        ORDER BY ${orderByClause}
        LIMIT ?
      `).all(limit);

      return leaderboard.map((player, index) => ({
        rank: index + 1,
        address: player.player_address,
        stats: {
          totalGames: player.total_games,
          totalWins: player.total_wins,
          totalSpent: parseFloat(player.total_spent),
          totalEarned: parseFloat(player.total_earned),
          netProfit: parseFloat(player.net_profit),
          winRate: parseFloat(player.win_rate),
          lastActive: player.last_active
        }
      }));

    } catch (error) {
      logger.error('Failed to get leaderboard', { 
        error: error.message, 
        limit, 
        sortBy 
      });
      throw error;
    }
  }

  /**
   * Update player's last active timestamp
   * @param {string} playerAddress - Player wallet address
   */
  updatePlayerLastActive(playerAddress) {
    try {
      database.db.prepare(`
        INSERT INTO player_stats (player_address, last_active)
        VALUES (?, CURRENT_TIMESTAMP)
        ON CONFLICT(player_address) 
        DO UPDATE SET last_active = CURRENT_TIMESTAMP
      `).run(playerAddress.toLowerCase());

    } catch (error) {
      logger.error('Failed to update player last active', { 
        error: error.message, 
        playerAddress 
      });
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Get player's payment history
   * @param {string} playerAddress - Player wallet address  
   * @param {number} limit - Number of records to return
   * @param {number} offset - Records offset for pagination
   * @returns {Object} Payment history with pagination
   */
  getPlayerPaymentHistory(playerAddress, limit = 10, offset = 0) {
    try {
      // Get payments
      const payments = database.db.prepare(`
        SELECT tx_hash, round_id, amount, block_number, created_at, confirmed
        FROM payments 
        WHERE player_address = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).all(playerAddress.toLowerCase(), limit, offset);

      // Get total count
      const totalCount = database.db.prepare(`
        SELECT COUNT(*) as count FROM payments WHERE player_address = ?
      `).get(playerAddress.toLowerCase()).count;

      return {
        payments: payments.map(payment => ({
          txHash: payment.tx_hash,
          roundId: payment.round_id,
          amount: parseFloat(payment.amount),
          blockNumber: payment.block_number,
          timestamp: payment.created_at,
          confirmed: payment.confirmed === 1,
          currency: config.zg.currencySymbol
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: (offset + limit) < totalCount
        }
      };

    } catch (error) {
      logger.error('Failed to get player payment history', { 
        error: error.message, 
        playerAddress 
      });
      throw error;
    }
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getServiceStats() {
    try {
      const stats = database.db.prepare(`
        SELECT 
          COUNT(*) as total_players,
          SUM(total_games) as total_games_played,
          SUM(total_wins) as total_wins,
          SUM(total_spent) as total_spent,
          SUM(total_earned) as total_earned,
          AVG(CASE WHEN total_games > 0 THEN (total_wins * 1.0 / total_games) ELSE 0 END) as avg_win_rate
        FROM player_stats
        WHERE total_games > 0
      `).get();

      return {
        totalPlayers: stats.total_players,
        totalGamesPlayed: stats.total_games_played,
        totalWins: stats.total_wins,
        totalSpent: parseFloat(stats.total_spent || 0),
        totalEarned: parseFloat(stats.total_earned || 0),
        averageWinRate: parseFloat((stats.avg_win_rate * 100).toFixed(2)),
        currency: config.zg.currencySymbol
      };

    } catch (error) {
      logger.error('Failed to get service stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Hall of Fame - comprehensive leaderboard with multiple categories
   * @param {number} limit - Number of top players per category
   * @returns {Object} Hall of Fame data with multiple leaderboards
   */
  getHallOfFame(limit = 10) {
    return this.hallOfFameService.getHallOfFame(limit);
  }

  /**
   * Get All Time 0G Roasted statistics
   * @returns {Object} Comprehensive roasting statistics
   */
  getAllTimeRoasted() {
    return this.hallOfFameService.getAllTimeRoasted();
  }
}

module.exports = { PlayersService }; 