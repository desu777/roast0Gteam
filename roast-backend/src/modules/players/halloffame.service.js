const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const database = require('../../database/database.service');

class HallOfFameService {
  constructor() {
    if (config.logging.testEnv) {
      logger.info('Hall of Fame service initialized');
    }
  }

  /**
   * Get Hall of Fame - comprehensive leaderboard with multiple categories
   * @param {number} limit - Number of top players per category
   * @returns {Object} Hall of Fame data with multiple leaderboards
   */
  getHallOfFame(limit = 10) {
    try {
      // Top earners leaderboard
      const topEarners = database.db.prepare(`
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
        WHERE total_games > 0 AND total_earned > 0
        ORDER BY total_earned DESC, total_wins DESC
        LIMIT ?
      `).all(limit);

      // Most wins leaderboard
      const mostWins = database.db.prepare(`
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
        WHERE total_games > 0 AND total_wins > 0
        ORDER BY total_wins DESC, total_earned DESC
        LIMIT ?
      `).all(limit);

      // Best win rate (minimum 3 games)
      const bestWinRate = database.db.prepare(`
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
        WHERE total_games >= 3
        ORDER BY (total_wins * 1.0 / total_games) DESC, total_wins DESC
        LIMIT ?
      `).all(limit);

      // Biggest spenders (most games played)
      const mostActive = database.db.prepare(`
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
        ORDER BY total_games DESC, total_wins DESC
        LIMIT ?
      `).all(limit);

      const formatPlayerData = (player, index) => ({
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
      });

      return {
        topEarners: topEarners.map(formatPlayerData),
        mostWins: mostWins.map(formatPlayerData),
        bestWinRate: bestWinRate.map(formatPlayerData),
        mostActive: mostActive.map(formatPlayerData)
      };

    } catch (error) {
      logger.error('Failed to get Hall of Fame', { 
        error: error.message, 
        limit 
      });
      throw error;
    }
  }

  /**
   * Get All Time 0G Roasted statistics
   * @returns {Object} Comprehensive roasting statistics
   */
  getAllTimeRoasted() {
    try {
      // Global statistics
      const globalStats = database.db.prepare(`
        SELECT 
          COUNT(DISTINCT r.id) as total_rounds,
          COUNT(DISTINCT s.player_address) as total_players,
          COUNT(s.id) as total_roasts_submitted,
          SUM(res.prize_amount) as total_prizes_paid,
          SUM(s.entry_fee) as total_0g_collected,
          AVG(res.prize_amount) as average_prize,
          COUNT(DISTINCT CASE WHEN r.phase = 'completed' THEN r.id END) as completed_rounds
        FROM rounds r
        LEFT JOIN submissions s ON r.id = s.round_id
        LEFT JOIN results res ON r.id = res.round_id
      `).get();

      // Statistics by judge character
      const judgeStats = database.db.prepare(`
        SELECT 
          r.judge_character,
          COUNT(DISTINCT r.id) as rounds_judged,
          COUNT(s.id) as roasts_received,
          SUM(res.prize_amount) as total_prizes_awarded,
          AVG(res.prize_amount) as average_prize,
          COUNT(DISTINCT s.player_address) as unique_participants
        FROM rounds r
        LEFT JOIN submissions s ON r.id = s.round_id
        LEFT JOIN results res ON r.id = res.round_id
        WHERE r.phase = 'completed'
        GROUP BY r.judge_character
        ORDER BY rounds_judged DESC
      `).all();

      // Recent roasting activity (last 30 days)
      const recentActivity = database.db.prepare(`
        SELECT 
          DATE(r.created_at) as date,
          COUNT(DISTINCT r.id) as rounds_played,
          COUNT(s.id) as roasts_submitted,
          COUNT(DISTINCT s.player_address) as active_players,
          SUM(res.prize_amount) as daily_prizes
        FROM rounds r
        LEFT JOIN submissions s ON r.id = s.round_id
        LEFT JOIN results res ON r.id = res.round_id
        WHERE r.created_at >= datetime('now', '-30 days')
        AND r.phase = 'completed'
        GROUP BY DATE(r.created_at)
        ORDER BY date DESC
        LIMIT 30
      `).all();

      // Top roast winner streaks (players who won consecutive rounds)
      const winStreaks = database.db.prepare(`
        WITH winner_rounds AS (
          SELECT 
            s.player_address,
            r.id as round_id,
            r.completed_at,
            ROW_NUMBER() OVER (PARTITION BY s.player_address ORDER BY r.completed_at) as player_round_num,
            ROW_NUMBER() OVER (ORDER BY r.completed_at) as global_round_num
          FROM results res
          JOIN submissions s ON res.winner_submission_id = s.id
          JOIN rounds r ON res.round_id = r.id
          WHERE r.phase = 'completed'
        ),
        streak_groups AS (
          SELECT 
            player_address,
            round_id,
            completed_at,
            (global_round_num - player_round_num) as streak_group
          FROM winner_rounds
        ),
        streaks AS (
          SELECT 
            player_address,
            COUNT(*) as streak_length,
            MIN(completed_at) as streak_start,
            MAX(completed_at) as streak_end
          FROM streak_groups
          GROUP BY player_address, streak_group
        )
        SELECT 
          player_address,
          MAX(streak_length) as longest_streak,
          streak_start,
          streak_end
        FROM streaks
        GROUP BY player_address
        HAVING longest_streak > 1
        ORDER BY longest_streak DESC
        LIMIT 10
      `).all();

      return {
        global: {
          totalRounds: globalStats.total_rounds || 0,
          totalPlayers: globalStats.total_players || 0,
          totalRoastsSubmitted: globalStats.total_roasts_submitted || 0,
          totalPrizesPaid: parseFloat(globalStats.total_prizes_paid || 0),
          total0GCollected: parseFloat(globalStats.total_0g_collected || 0),
          averagePrize: parseFloat(globalStats.average_prize || 0),
          completedRounds: globalStats.completed_rounds || 0,
          currency: config.zg.currencySymbol
        },
        judges: judgeStats.map(judge => ({
          character: judge.judge_character,
          roundsJudged: judge.rounds_judged,
          roastsReceived: judge.roasts_received,
          totalPrizesAwarded: parseFloat(judge.total_prizes_awarded || 0),
          averagePrize: parseFloat(judge.average_prize || 0),
          uniqueParticipants: judge.unique_participants
        })),
        dailyActivity: recentActivity.map(activity => ({
          date: activity.date,
          roundsPlayed: activity.rounds_played,
          roastsSubmitted: activity.roasts_submitted,
          activePlayers: activity.active_players,
          dailyPrizes: parseFloat(activity.daily_prizes || 0)
        })),
        winStreaks: winStreaks.map((streak, index) => ({
          rank: index + 1,
          address: streak.player_address,
          longestStreak: streak.longest_streak,
          streakStart: streak.streak_start,
          streakEnd: streak.streak_end
        }))
      };

    } catch (error) {
      logger.error('Failed to get All Time Roasted stats', { 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = { HallOfFameService }; 