const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const database = require('../../database/database.service');
const { CHARACTERS, ERROR_CODES } = require('../../utils/constants');

class VotingService {
  constructor(wsEmitter = null) {
    this.wsEmitter = wsEmitter;
    this.votingLocked = new Map(); // roundId -> boolean
    this.lockTimers = new Map(); // roundId -> timer
    
    if (config.logging.testEnv) {
      logger.info('Voting service initialized');
    }
  }

  /**
   * Cast a vote for next judge
   * @param {number} roundId - Current round ID
   * @param {string} voterAddress - Wallet address of voter
   * @param {string} characterId - Character being voted for
   * @returns {Object} Vote result
   */
  async castVote(roundId, voterAddress, characterId) {
    try {
      // Validate inputs
      if (!Object.keys(CHARACTERS).includes(characterId)) {
        return { success: false, error: ERROR_CODES.INVALID_CHARACTER };
      }

      if (this.votingLocked.get(roundId)) {
        return { success: false, error: ERROR_CODES.VOTING_LOCKED };
      }

      // Check if round exists and is active
      const round = database.getRoundById(roundId);
      if (!round) {
        return { success: false, error: ERROR_CODES.ROUND_NOT_FOUND };
      }

      if (round.phase === 'completed') {
        return { success: false, error: ERROR_CODES.INVALID_PHASE };
      }

      // Use transaction to ensure consistency
      const result = database.transaction(() => {
        // Check if user already voted for this round
        const existingVote = database.db.prepare(`
          SELECT id FROM judge_votes 
          WHERE round_id = ? AND voter_address = ?
        `).get(roundId, voterAddress.toLowerCase());

        if (existingVote) {
          return { success: false, error: ERROR_CODES.ALREADY_VOTED };
        }

        // Insert vote
        const voteInfo = database.db.prepare(`
          INSERT INTO judge_votes (round_id, voter_address, character_id)
          VALUES (?, ?, ?)
        `).run(roundId, voterAddress.toLowerCase(), characterId);

        // Update or insert voting stats
        database.db.prepare(`
          INSERT INTO voting_stats (round_id, character_id, vote_count)
          VALUES (?, ?, 1)
          ON CONFLICT(round_id, character_id) 
          DO UPDATE SET 
            vote_count = vote_count + 1,
            last_updated = CURRENT_TIMESTAMP
        `).run(roundId, characterId);

        return { success: true, voteId: voteInfo.lastInsertRowid };
      });

      if (!result.success) {
        return result;
      }

      // Get updated voting stats
      const votingStats = this.getVotingStats(roundId);
      
      // Emit real-time update to all clients
      this.emitVotingUpdate(roundId, votingStats, voterAddress, characterId);

      if (config.logging.testEnv) {
        logger.info('Vote cast successfully', {
          roundId,
          voterAddress,
          characterId,
          totalVotes: votingStats.totalVotes
        });
      }

      return {
        success: true,
        voteId: result.voteId,
        votingStats
      };

    } catch (error) {
      logger.error('Failed to cast vote', { error: error.message, roundId, voterAddress, characterId });
      throw error;
    }
  }

  /**
   * Get voting statistics for a round
   * @param {number} roundId - Round ID
   * @returns {Object} Voting statistics
   */
  getVotingStats(roundId) {
    try {
      const stats = database.db.prepare(`
        SELECT character_id, vote_count
        FROM voting_stats
        WHERE round_id = ?
        ORDER BY vote_count DESC
      `).all(roundId);

      const totalVotes = stats.reduce((sum, stat) => sum + stat.vote_count, 0);
      
      // Convert to map for easier access
      const votesByCharacter = {};
      stats.forEach(stat => {
        votesByCharacter[stat.character_id] = stat.vote_count;
      });

      // Get winner (most voted)
      const winner = stats.length > 0 ? stats[0] : null;

      return {
        roundId,
        votesByCharacter,
        totalVotes,
        winner: winner ? {
          characterId: winner.character_id,
          votes: winner.vote_count
        } : null,
        isLocked: this.votingLocked.get(roundId) || false
      };

    } catch (error) {
      logger.error('Failed to get voting stats', { error: error.message, roundId });
      throw error;
    }
  }

  /**
   * Lock voting for a round (called 10 seconds before round ends)
   * @param {number} roundId - Round ID
   */
  lockVoting(roundId) {
    this.votingLocked.set(roundId, true);
    
    // Clear any existing timer
    if (this.lockTimers.has(roundId)) {
      clearTimeout(this.lockTimers.get(roundId));
    }

    // Emit voting locked event
    this.emitToRoom(roundId, 'voting-locked', { roundId });
    
    if (config.logging.testEnv) {
      logger.info('Voting locked for round', { roundId });
    }
  }

  /**
   * Reset voting for new round
   * @param {number} oldRoundId - Previous round ID
   * @param {number} newRoundId - New round ID
   */
  resetVoting(oldRoundId, newRoundId) {
    // Clear old round data
    if (oldRoundId) {
      this.votingLocked.delete(oldRoundId);
      if (this.lockTimers.has(oldRoundId)) {
        clearTimeout(this.lockTimers.get(oldRoundId));
        this.lockTimers.delete(oldRoundId);
      }
    }

    // Initialize new round
    this.votingLocked.set(newRoundId, false);

    // Emit voting reset event
    this.emitToAll('voting-reset', { 
      oldRoundId, 
      newRoundId,
      votingStats: this.getVotingStats(newRoundId) 
    });

    if (config.logging.testEnv) {
      logger.info('Voting reset for new round', { oldRoundId, newRoundId });
    }
  }

  /**
   * Schedule voting lock for a round
   * @param {number} roundId - Round ID
   * @param {number} delaySeconds - Seconds until lock
   */
  scheduleVotingLock(roundId, delaySeconds) {
    // Clear existing timer
    if (this.lockTimers.has(roundId)) {
      clearTimeout(this.lockTimers.get(roundId));
    }

    // Schedule lock
    const timer = setTimeout(() => {
      this.lockVoting(roundId);
    }, delaySeconds * 1000);

    this.lockTimers.set(roundId, timer);
    
    if (config.logging.testEnv) {
      logger.info('Voting lock scheduled', { roundId, delaySeconds });
    }
  }

  /**
   * Get voting winner for completed round
   * @param {number} roundId - Round ID
   * @returns {string|null} Winner character ID
   */
  getVotingWinner(roundId) {
    const stats = this.getVotingStats(roundId);
    return stats.winner ? stats.winner.characterId : null;
  }

  /**
   * Check if user has voted for round
   * @param {number} roundId - Round ID
   * @param {string} voterAddress - Voter address
   * @returns {boolean} Has voted
   */
  hasUserVoted(roundId, voterAddress) {
    try {
      const vote = database.db.prepare(`
        SELECT id FROM judge_votes 
        WHERE round_id = ? AND voter_address = ?
      `).get(roundId, voterAddress.toLowerCase());

      return !!vote;
    } catch (error) {
      logger.error('Failed to check user vote status', { error: error.message, roundId, voterAddress });
      return false;
    }
  }

  /**
   * Get user's vote for round
   * @param {number} roundId - Round ID
   * @param {string} voterAddress - Voter address
   * @returns {string|null} Character ID voted for
   */
  getUserVote(roundId, voterAddress) {
    try {
      const vote = database.db.prepare(`
        SELECT character_id FROM judge_votes 
        WHERE round_id = ? AND voter_address = ?
      `).get(roundId, voterAddress.toLowerCase());

      return vote ? vote.character_id : null;
    } catch (error) {
      logger.error('Failed to get user vote', { error: error.message, roundId, voterAddress });
      return null;
    }
  }

  // ================================
  // WEBSOCKET HELPERS
  // ================================

  emitVotingUpdate(roundId, votingStats, voterAddress, characterId) {
    if (this.wsEmitter) {
      this.emitToRoom(roundId, 'voting-update', {
        ...votingStats,
        lastVote: {
          voterAddress: voterAddress.slice(0, 6) + '...' + voterAddress.slice(-4),
          characterId,
          timestamp: new Date().toISOString()
        }
      });

      this.emitToAll('voting-update', {
        roundId,
        totalVotes: votingStats.totalVotes,
        winner: votingStats.winner
      });
    }
  }

  emitToRoom(roundId, event, data) {
    if (this.wsEmitter) {
      const room = `game:${roundId}`;
      this.wsEmitter.to(room).emit(event, data);
    }
  }

  emitToAll(event, data) {
    if (this.wsEmitter) {
      this.wsEmitter.to('global').emit(event, data);
    }
  }

  setWSEmitter(wsEmitter) {
    this.wsEmitter = wsEmitter;
  }

  // ================================
  // CLEANUP
  // ================================

  cleanup() {
    // Clear all timers
    this.lockTimers.forEach(timer => clearTimeout(timer));
    this.lockTimers.clear();
    this.votingLocked.clear();

    if (config.logging.testEnv) {
      logger.info('Voting service cleaned up');
    }
  }
}

module.exports = VotingService; 