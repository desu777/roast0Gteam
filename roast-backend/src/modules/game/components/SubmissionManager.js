const { config } = require('../../../config/app.config');
const { logger, gameLogger } = require('../../../services/logger.service');
const database = require('../../../database/database.service');
const { 
  GAME_PHASES, 
  WS_EVENTS, 
  ERROR_CODES, 
  LIMITS 
} = require('../../../utils/constants');
const {
  canJoinRound,
  canSubmitRoast
} = require('../../../utils/validators');
const {
  formatRoundResponse
} = require('../../../utils/formatters');

class SubmissionManager {
  constructor(eventEmitter = null, treasuryService = null) {
    this.eventEmitter = eventEmitter;
    this.treasuryService = treasuryService;
    this.submissionLocked = new Map(); // roundId -> boolean
    
    if (config.logging.testEnv) {
      logger.info('SubmissionManager initialized');
    }
  }

  // ================================
  // SUBMISSION MANAGEMENT
  // ================================

  async joinRound(playerAddress, roastText, paymentTxHash = null) {
    try {
      const currentRound = database.getCurrentRound();
      if (!currentRound) {
        return { 
          success: false, 
          error: ERROR_CODES.ROUND_NOT_FOUND, 
          message: 'No active round found' 
        };
      }

      // Check if submissions are locked
      if (this.submissionLocked.get(currentRound.id)) {
        return {
          success: false,
          error: ERROR_CODES.SUBMISSIONS_LOCKED,
          message: 'Submissions are locked for this round'
        };
      }

      // Get current submissions to check player count
      const existingSubmissions = database.getSubmissionsByRound(currentRound.id);
      const playerCount = existingSubmissions.length;

      // Validate join eligibility
      const joinValidation = canJoinRound(currentRound, playerCount);
      if (!joinValidation.valid) {
        return { 
          success: false, 
          error: ERROR_CODES.ROUND_FULL, 
          message: joinValidation.reason 
        };
      }

      // Validate submission eligibility
      const submitValidation = canSubmitRoast(currentRound, playerAddress, existingSubmissions);
      if (!submitValidation.valid) {
        return { 
          success: false, 
          error: ERROR_CODES.ALREADY_SUBMITTED, 
          message: submitValidation.reason 
        };
      }

      // Verify entry fee payment
      const paymentResult = await this.verifyPayment(currentRound.id, playerAddress, paymentTxHash);
      if (!paymentResult.success) {
        return paymentResult;
      }

      // Create submission
      const submissionId = database.createSubmission(
        currentRound.id, 
        playerAddress, 
        roastText, 
        config.zg.entryFee
      );

      // Update prize pool
      const newPrizePool = (playerCount + 1) * config.zg.entryFee;
      database.db.prepare(`
        UPDATE rounds SET prize_pool = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(newPrizePool, currentRound.id);

      gameLogger.playerJoined(currentRound.id, playerAddress, playerCount + 1);

      // Emit player joined event
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(currentRound.id, WS_EVENTS.PLAYER_JOINED, {
          roundId: currentRound.id,
          playerAddress,
          playerCount: playerCount + 1,
          prizePool: newPrizePool,
          paymentVerified: paymentResult.verified
        });

        // Emit round update
        const updatedRound = database.getRoundById(currentRound.id);
        this.eventEmitter.emitRoundUpdate(updatedRound, playerCount + 1);
      }

      if (config.logging.testEnv) {
        logger.info('Player joined round', { 
          roundId: currentRound.id, 
          playerAddress, 
          playerCount: playerCount + 1,
          paymentVerified: paymentResult.verified
        });
      }

      return { 
        success: true, 
        submissionId,
        playerCount: playerCount + 1,
        round: formatRoundResponse(database.getRoundById(currentRound.id)),
        paymentVerified: paymentResult.verified
      };

    } catch (error) {
      gameLogger.error('joinRound', error, { playerAddress, roastText });
      throw error;
    }
  }

  // ================================
  // PAYMENT VERIFICATION
  // ================================

  async verifyPayment(roundId, playerAddress, paymentTxHash) {
    if (this.treasuryService && paymentTxHash) {
      try {
        if (config.logging.testEnv) {
          logger.info('Verifying entry fee payment', { 
            roundId, 
            playerAddress, 
            paymentTxHash 
          });
        }

        const verification = await this.treasuryService.verifyEntryFeePayment(
          paymentTxHash, 
          playerAddress, 
          roundId
        );
        
        if (!verification.valid) {
          return { 
            success: false, 
            error: ERROR_CODES.PAYMENT_FAILED,
            message: `Payment verification failed: ${verification.reason}`
          };
        }

        gameLogger.paymentProcessed(playerAddress, verification.amount, paymentTxHash);

        if (config.logging.testEnv) {
          logger.info('Entry fee payment verified successfully', { 
            roundId, 
            playerAddress, 
            amount: verification.amount 
          });
        }

        return { success: true, verified: true, amount: verification.amount };

      } catch (paymentError) {
        logger.error('Payment verification error', { 
          error: paymentError.message, 
          playerAddress, 
          paymentTxHash 
        });
        
        return { 
          success: false, 
          error: ERROR_CODES.PAYMENT_FAILED,
          message: 'Payment verification failed. Please try again.'
        };
      }
    } else if (config.server.env === 'production') {
      // In production, payment is required
      return { 
        success: false, 
        error: ERROR_CODES.PAYMENT_FAILED,
        message: 'Payment transaction hash is required'
      };
    }

    // In development, allow joining without payment for testing
    return { success: true, verified: false };
  }

  // ================================
  // SUBMISSION LOCKING
  // ================================

  lockSubmissions(roundId) {
    this.submissionLocked.set(roundId, true);
    
    // Emit submission locked event
    if (this.eventEmitter) {
      this.eventEmitter.emitToRoom(roundId, 'submission-locked', { roundId });
    }
    
    if (config.logging.testEnv) {
      logger.info('Submissions locked for round', { roundId });
    }
  }

  unlockSubmissions(roundId) {
    this.submissionLocked.set(roundId, false);
    
    // Emit submission unlocked event
    if (this.eventEmitter) {
      this.eventEmitter.emitToRoom(roundId, 'submission-unlocked', { roundId });
    }
    
    if (config.logging.testEnv) {
      logger.info('Submissions unlocked for round', { roundId });
    }
  }

  isSubmissionLocked(roundId) {
    return this.submissionLocked.get(roundId) || false;
  }

  clearSubmissionLock(roundId) {
    this.submissionLocked.delete(roundId);
    
    if (config.logging.testEnv) {
      logger.debug('Submission lock cleared for round', { roundId });
    }
  }

  // ================================
  // SUBMISSION QUERIES
  // ================================

  getRoundSubmissions(roundId, includeFullText = false) {
    return database.getSubmissionsByRound(roundId)
      .map(sub => ({
        id: sub.id,
        playerAddress: sub.player_address,
        roastText: includeFullText ? sub.roast_text : sub.roast_text.substring(0, 60) + '...',
        submittedAt: sub.submitted_at,
        entryFee: sub.entry_fee
      }));
  }

  getSubmissionCount(roundId) {
    const result = database.db.prepare(`
      SELECT COUNT(*) as count FROM submissions WHERE round_id = ?
    `).get(roundId);
    
    return result.count || 0;
  }

  hasPlayerSubmitted(roundId, playerAddress) {
    const submission = database.db.prepare(`
      SELECT id FROM submissions WHERE round_id = ? AND player_address = ?
    `).get(roundId, playerAddress.toLowerCase());
    
    return !!submission;
  }

  getPlayerSubmission(roundId, playerAddress) {
    return database.db.prepare(`
      SELECT * FROM submissions WHERE round_id = ? AND player_address = ?
    `).get(roundId, playerAddress.toLowerCase());
  }

  // ================================
  // ROUND STATE CHECKS
  // ================================

  canPlayerJoin(roundId, playerAddress) {
    const round = database.getRoundById(roundId);
    if (!round) {
      return { canJoin: false, reason: 'Round not found' };
    }

    // Check if submissions are locked
    if (this.submissionLocked.get(roundId)) {
      return { canJoin: false, reason: 'Submissions are locked' };
    }

    const existingSubmissions = database.getSubmissionsByRound(roundId);
    const playerCount = existingSubmissions.length;

    // Check round capacity
    const joinValidation = canJoinRound(round, playerCount);
    if (!joinValidation.valid) {
      return { canJoin: false, reason: joinValidation.reason };
    }

    // Check if player already submitted
    const submitValidation = canSubmitRoast(round, playerAddress, existingSubmissions);
    if (!submitValidation.valid) {
      return { canJoin: false, reason: submitValidation.reason };
    }

    return { canJoin: true };
  }

  shouldRoundStart(roundId) {
    const round = database.getRoundById(roundId);
    if (!round || round.phase !== GAME_PHASES.WAITING) {
      return false;
    }

    const submissionCount = this.getSubmissionCount(roundId);
    return submissionCount >= LIMITS.MIN_PLAYERS_TO_START;
  }

  // ================================
  // CLEANUP
  // ================================

  cleanup() {
    // Clear all submission locks
    this.submissionLocked.clear();
    
    if (config.logging.testEnv) {
      logger.info('SubmissionManager cleanup completed');
    }
  }

  // ================================
  // STATUS METHODS
  // ================================

  getSubmissionStatus() {
    const status = {};
    
    this.submissionLocked.forEach((locked, roundId) => {
      status[roundId] = {
        locked,
        submissionCount: this.getSubmissionCount(roundId)
      };
    });

    return status;
  }

  getAllSubmissionStats() {
    const activeRound = database.getCurrentRound();
    if (!activeRound) {
      return { activeRound: null };
    }

    const submissions = this.getRoundSubmissions(activeRound.id, false);
    
    return {
      activeRound: {
        id: activeRound.id,
        phase: activeRound.phase,
        submissionCount: submissions.length,
        maxPlayers: activeRound.max_players,
        isLocked: this.isSubmissionLocked(activeRound.id),
        submissions: submissions
      }
    };
  }
}

module.exports = SubmissionManager; 