const { config } = require('../../../config/app.config');
const { logger } = require('../../../services/logger.service');
const database = require('../../../database/database.service');
const { 
  GAME_PHASES, 
  CHARACTERS,
  LIMITS
} = require('../../../utils/constants');
const {
  formatRoundResponse
} = require('../../../utils/formatters');

const RoundManager = require('./RoundManager');
const TimerManager = require('./TimerManager');
const SubmissionManager = require('./SubmissionManager');
const GameEventEmitter = require('./GameEventEmitter');

class GameOrchestrator {
  constructor(wsEmitter = null, aiService = null, treasuryService = null, votingService = null) {
    // Initialize event emitter first
    this.eventEmitter = new GameEventEmitter(wsEmitter);
    
    // Initialize managers with event emitter
    this.roundManager = new RoundManager(this.eventEmitter, aiService, treasuryService, votingService);
    this.timerManager = new TimerManager(this.eventEmitter);
    this.submissionManager = new SubmissionManager(this.eventEmitter, treasuryService);
    
    // Store service references
    this.aiService = aiService;
    this.treasuryService = treasuryService;
    this.votingService = votingService;
    
    if (config.logging.testEnv) {
      logger.info('GameOrchestrator initialized', {
        wsEmitter: !!wsEmitter,
        aiService: !!aiService,
        treasuryService: !!treasuryService,
        votingService: !!votingService
      });
    }
    
    // Resume any active rounds on startup
    this.resumeActiveRounds();
  }

  // ================================
  // MAIN GAME FLOW ORCHESTRATION
  // ================================

  async createNewRound(preferredCharacter = null) {
    try {
      const result = await this.roundManager.createNewRound(preferredCharacter);
      
      if (result.success) {
        // Emit the round created event via event emitter
        this.eventEmitter.emitRoundCreated(result.round, !!preferredCharacter);
      }
      
      return result;
    } catch (error) {
      logger.error('GameOrchestrator.createNewRound failed', { error: error.message });
      throw error;
    }
  }

  async joinRound(playerAddress, roastText, paymentTxHash = null) {
    try {
      const result = await this.submissionManager.joinRound(playerAddress, roastText, paymentTxHash);
      
      if (result.success) {
        // Check if round should start
        const shouldStart = this.submissionManager.shouldRoundStart(result.round.id);
        
        if (shouldStart && result.round.phase === GAME_PHASES.WAITING) {
          await this.startRound(result.round.id);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('GameOrchestrator.joinRound failed', { error: error.message });
      throw error;
    }
  }

  async startRound(roundId) {
    try {
      const result = await this.roundManager.startRound(roundId);
      
      if (result.success) {
        // Start the timer with completion callback
        this.timerManager.startTimer(
          roundId, 
          config.game.roundTimerDuration, 
          (completedRoundId) => this.transitionToJudging(completedRoundId)
        );

        // Schedule submission locks 10 seconds before round ends
        this.timerManager.scheduleLockTimer(
          roundId,
          config.game.roundTimerDuration - 10,
          (lockedRoundId) => this.submissionManager.lockSubmissions(lockedRoundId)
        );

        // Schedule voting lock 5 seconds before round ends for voting finalization
        if (this.votingService) {
          this.timerManager.scheduleLockTimer(
            roundId,
            config.game.roundTimerDuration - 5,
            (lockedRoundId) => {
              if (config.logging.testEnv) {
                logger.info('Finalizing voting for round', { roundId: lockedRoundId });
              }
              this.votingService.lockVoting(lockedRoundId);
            }
          );
        }

        // Emit round started event
        const submissionCount = this.submissionManager.getSubmissionCount(roundId);
        this.eventEmitter.emitRoundStarted(roundId, submissionCount, config.game.roundTimerDuration);
      }
      
      return result;
    } catch (error) {
      logger.error('GameOrchestrator.startRound failed', { error: error.message });
      throw error;
    }
  }

  async transitionToJudging(roundId) {
    try {
      // Clear timers
      this.timerManager.clearTimer(roundId);
      this.timerManager.clearLockTimer(roundId);

      // Update round phase to judging
      database.updateRoundPhase(roundId, GAME_PHASES.JUDGING);

      const round = database.getRoundById(roundId);
      const submissionCount = this.submissionManager.getSubmissionCount(roundId);

      // Emit judging started event
      this.eventEmitter.emitJudgingStarted(roundId, round.judge_character, submissionCount);

      if (config.logging.testEnv) {
        logger.info('Round transitioned to judging', { roundId });
      }

      // Start judging timer (will trigger AI evaluation)
      setTimeout(() => {
        this.completeRound(roundId);
      }, config.game.judgingDuration * 1000);

      return { success: true };

    } catch (error) {
      logger.error('GameOrchestrator.transitionToJudging failed', { error: error.message });
      throw error;
    }
  }

  async completeRound(roundId) {
    try {
      const result = await this.roundManager.completeRound(roundId);
      
      if (result.success) {
        // SYNCHRONOUS VOTING FINALIZATION - przed scheduleNextRound!
        if (this.votingService) {
          try {
            if (config.logging.testEnv) {
              logger.info('Finalizing voting before scheduling next round', { roundId });
            }
            const finalResult = this.votingService.finalizeVotingWithTieBreaker(roundId);
            if (finalResult.winner) {
              this.setNextJudgeVotingResult(finalResult.winner.characterId);
              if (config.logging.testEnv) {
                logger.info('Voting result set for next round', { 
                  roundId,
                  nextJudge: finalResult.winner.characterId,
                  method: finalResult.method,
                  totalVotes: finalResult.totalVotes
                });
              }
            }
          } catch (votingError) {
            logger.warn('Failed to finalize voting in completeRound', { 
              roundId, 
              error: votingError.message 
            });
          }
        }

        // Emit round completed event
        this.eventEmitter.emitRoundCompleted({
          roundId,
          winnerId: result.winner.id,
          winnerAddress: result.winner.player_address,
          winningRoast: result.winner.roast_text,
          aiReasoning: result.aiReasoning,
          prizeAmount: result.prizeAmount,
          character: database.getRoundById(roundId).judge_character,
          payoutTxHash: result.payoutTxHash
        });

        // Schedule next round creation
        this.scheduleNextRound();
      }
      
      return result;
    } catch (error) {
      logger.error('GameOrchestrator.completeRound failed', { error: error.message });
      throw error;
    }
  }

  // ================================
  // NEXT ROUND SCHEDULING
  // ================================

  scheduleNextRound() {
    this.timerManager.scheduleNextRound(() => {
      // Get voting result for next judge
      let preferredCharacter = this.roundManager.getNextJudgeVotingResult();
      
      // FALLBACK: Jeśli nie ma voting result, spróbuj pobrać z ostatniej rundy
      if (!preferredCharacter && this.votingService) {
        try {
          if (config.logging.testEnv) {
            logger.info('No voting result found, checking last completed round');
          }
          
          // Znajdź ostatnią ukończoną rundę
          const lastRound = database.db.prepare(`
            SELECT id FROM rounds 
            WHERE phase = 'completed' 
            ORDER BY created_at DESC 
            LIMIT 1
          `).get();
          
          if (lastRound) {
            const finalResult = this.votingService.finalizeVotingWithTieBreaker(lastRound.id);
            if (finalResult.winner) {
              preferredCharacter = finalResult.winner.characterId;
              if (config.logging.testEnv) {
                logger.info('Found voting result from last round', { 
                  lastRoundId: lastRound.id,
                  nextJudge: preferredCharacter,
                  method: finalResult.method,
                  totalVotes: finalResult.totalVotes
                });
              }
            }
          }
        } catch (fallbackError) {
          logger.warn('Fallback voting check failed', { error: fallbackError.message });
        }
      }
      
      // Clear the voting result after using it
      this.roundManager.clearNextJudgeVotingResult();
      
      if (config.logging.testEnv) {
        logger.info('Creating new round with judge', { 
          preferredCharacter: preferredCharacter || 'random'
        });
      }
      
      this.createNewRound(preferredCharacter).catch(error => {
        logger.error('Auto-create next round failed', { error: error.message });
      });
    }, config.game.nextRoundDelay);
  }

  // ================================
  // VOTING INTEGRATION
  // ================================

  setNextJudgeVotingResult(characterId) {
    return this.roundManager.setNextJudgeVotingResult(characterId);
  }

  getNextJudgeVotingResult() {
    return this.roundManager.getNextJudgeVotingResult();
  }

  // ================================
  // PUBLIC API METHODS
  // ================================

  getCurrentRound() {
    const round = database.getCurrentRound();
    if (!round) return null;

    const submissions = this.submissionManager.getRoundSubmissions(round.id, true);
    const playerCount = submissions.length;

    // Calculate time left if active
    let timeLeft = null;
    if (round.phase === GAME_PHASES.ACTIVE) {
      timeLeft = this.timerManager.getTimeLeft(round.id);
      
      // If time expired but timer still active, transition to judging
      if (timeLeft === 0 && this.timerManager.isTimerActive(round.id)) {
        this.transitionToJudging(round.id);
      }
    }

    return {
      ...formatRoundResponse(round),
      playerCount,
      timeLeft,
      character: CHARACTERS[round.judge_character] || null,
      submissions: submissions,
      isSubmissionLocked: this.submissionManager.isSubmissionLocked(round.id)
    };
  }

  getRoundSubmissions(roundId, includeFullText = false) {
    return this.submissionManager.getRoundSubmissions(roundId, includeFullText);
  }

  getGameStats() {
    return database.getGlobalStats();
  }

  canPlayerJoin(roundId, playerAddress) {
    return this.submissionManager.canPlayerJoin(roundId, playerAddress);
  }

  // ================================
  // RECOVERY & CLEANUP
  // ================================

  resumeActiveRounds() {
    try {
      // Check and start waiting rounds first
      this.roundManager.checkAndStartWaitingRounds();
      
      const currentRound = database.getCurrentRound();
      if (!currentRound) {
        // No active round, schedule new one
        this.scheduleNextRound();
        return;
      }

      const now = new Date();
      const startedAt = new Date(currentRound.started_at);
      const elapsed = Math.floor((now - startedAt) / 1000);

      if (currentRound.phase === GAME_PHASES.ACTIVE) {
        const remaining = currentRound.timer_duration - elapsed;
        
        if (remaining > 0) {
          // Resume timer
          this.timerManager.resumeTimer(
            currentRound.id, 
            remaining, 
            (roundId) => this.transitionToJudging(roundId)
          );
          
          // Schedule locks if needed
          const lockTime = remaining - 10;
          if (lockTime > 0) {
            this.timerManager.scheduleLockTimer(
              currentRound.id,
              lockTime,
              (roundId) => this.submissionManager.lockSubmissions(roundId)
            );
          } else {
            // Should already be locked
            this.submissionManager.lockSubmissions(currentRound.id);
          }
          
          if (config.logging.testEnv) {
            logger.info('Resumed active round timer', { 
              roundId: currentRound.id, 
              remaining 
            });
          }
        } else {
          // Time already expired, transition to judging
          this.transitionToJudging(currentRound.id);
        }
      } else if (currentRound.phase === GAME_PHASES.WAITING) {
        // Round was waiting, check if it should start
        const shouldStart = this.submissionManager.shouldRoundStart(currentRound.id);
        if (shouldStart) {
          this.startRound(currentRound.id);
        }
        
        if (config.logging.testEnv) {
          logger.info('Resumed waiting round', { roundId: currentRound.id });
        }
      }

    } catch (error) {
      logger.error('GameOrchestrator.resumeActiveRounds failed', { error: error.message });
      // On error, schedule new round
      this.scheduleNextRound();
    }
  }

  cleanup() {
    // Cleanup all managers
    this.timerManager.cleanup();
    this.submissionManager.cleanup();
    
    if (config.logging.testEnv) {
      logger.info('GameOrchestrator cleanup completed');
    }
  }

  // ================================
  // STATUS AND MONITORING
  // ================================

  getSystemStatus() {
    return {
      timers: this.timerManager.getAllTimersStatus(),
      submissions: this.submissionManager.getSubmissionStatus(),
      connectedUsers: this.eventEmitter.getConnectedUsers(),
      currentRound: this.getCurrentRound(),
      nextJudgeVote: this.getNextJudgeVotingResult()
    };
  }

  // ================================
  // WEBSOCKET SERVICE INTEGRATION
  // ================================

  setWSService(wsService) {
    this.eventEmitter.setWSService(wsService);
  }

  // Delegate WebSocket emission methods for backward compatibility
  emitToRoom(roundId, event, data) {
    this.eventEmitter.emitToRoom(roundId, event, data);
  }

  emitToAll(event, data) {
    this.eventEmitter.emitToAll(event, data);
  }

  emitRoundUpdate(round, playerCount, timeLeft = null) {
    this.eventEmitter.emitRoundUpdate(round, playerCount, timeLeft);
  }
}

module.exports = GameOrchestrator; 