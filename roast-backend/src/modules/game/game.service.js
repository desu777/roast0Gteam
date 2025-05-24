const { config } = require('../../config/app.config');
const { logger, gameLogger } = require('../../services/logger.service');
const database = require('../../database/database.service');
const { 
  GAME_PHASES, 
  WS_EVENTS, 
  WS_ROOMS, 
  ERROR_CODES, 
  CHARACTERS,
  LIMITS,
  MESSAGES 
} = require('../../utils/constants');
const {
  canJoinRound,
  canStartRound,
  canSubmitRoast,
  canCompleteRound,
  isValidCharacter
} = require('../../utils/validators');
const {
  formatRoundResponse,
  formatWSRoundUpdate,
  formatTimer
} = require('../../utils/formatters');

class GameService {
  constructor(wsEmitter = null) {
    this.wsEmitter = wsEmitter;
    this.activeTimers = new Map(); // roundId -> timer info
    this.autoStartTimer = null;
    
    // Resume any active rounds on startup
    this.resumeActiveRounds();
  }

  // ================================
  // ROUND LIFECYCLE MANAGEMENT
  // ================================

  async createNewRound() {
    try {
      // Check if there's already an active round
      const currentRound = database.getCurrentRound();
      if (currentRound) {
        if (config.logging.testEnv) {
          logger.debug('Active round already exists', { currentRound });
        }
        return { success: false, error: 'Active round already exists', round: currentRound };
      }

      // Select random character
      const characters = Object.keys(CHARACTERS);
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

      // Create new round
      const roundId = database.createRound(randomCharacter);
      const newRound = database.getRoundById(roundId);

      gameLogger.roundCreated(roundId, randomCharacter);

      // Emit WebSocket event
      this.emitToAll(WS_EVENTS.ROUND_CREATED, {
        roundId: roundId,
        judgeCharacter: randomCharacter,
        phase: GAME_PHASES.WAITING,
        prizePool: 0,
        playerCount: 0
      });

      if (config.logging.testEnv) {
        logger.info('New round created', { roundId, character: randomCharacter });
      }

      return { 
        success: true, 
        round: formatRoundResponse(newRound),
        message: MESSAGES.ROUND_STARTING 
      };

    } catch (error) {
      gameLogger.error('createNewRound', error);
      throw error;
    }
  }

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

      // Check if round should start (2nd player joined)
      if (playerCount === 0) { // This will be the 2nd player (counting from 0)
        await this.startRound(currentRound.id);
      }

      // Emit player joined event
      this.emitToRoom(currentRound.id, WS_EVENTS.PLAYER_JOINED, {
        roundId: currentRound.id,
        playerAddress,
        playerCount: playerCount + 1,
        prizePool: newPrizePool
      });

      // Emit round update
      const updatedRound = database.getRoundById(currentRound.id);
      this.emitRoundUpdate(updatedRound, playerCount + 1);

      if (config.logging.testEnv) {
        logger.info('Player joined round', { 
          roundId: currentRound.id, 
          playerAddress, 
          playerCount: playerCount + 1 
        });
      }

      return { 
        success: true, 
        submissionId,
        playerCount: playerCount + 1,
        round: formatRoundResponse(updatedRound)
      };

    } catch (error) {
      gameLogger.error('joinRound', error, { playerAddress, roastText });
      throw error;
    }
  }

  async startRound(roundId) {
    try {
      const round = database.getRoundById(roundId);
      if (!round) {
        throw new Error('Round not found');
      }

      const submissions = database.getSubmissionsByRound(roundId);
      const startValidation = canStartRound(round, submissions.length);
      
      if (!startValidation.valid) {
        if (config.logging.testEnv) {
          logger.warn('Cannot start round', { roundId, reason: startValidation.reason });
        }
        return { success: false, message: startValidation.reason };
      }

      // Update round to active phase
      database.startRound(roundId);
      
      // Start countdown timer
      this.startTimer(roundId, config.game.roundTimerDuration);

      gameLogger.roundCreated(roundId, round.judge_character);

      // Emit round started event
      this.emitToRoom(roundId, WS_EVENTS.ROUND_UPDATED, {
        roundId,
        phase: GAME_PHASES.ACTIVE,
        timeLeft: config.game.roundTimerDuration,
        playerCount: submissions.length
      });

      this.emitToAll(WS_EVENTS.ROUND_UPDATED, {
        roundId,
        phase: GAME_PHASES.ACTIVE,
        message: MESSAGES.ROUND_STARTED
      });

      if (config.logging.testEnv) {
        logger.info('Round started', { roundId, timerDuration: config.game.roundTimerDuration });
      }

      return { success: true };

    } catch (error) {
      gameLogger.error('startRound', error, { roundId });
      throw error;
    }
  }

  async transitionToJudging(roundId) {
    try {
      // Clear active timer
      this.clearTimer(roundId);

      // Update round phase
      database.updateRoundPhase(roundId, GAME_PHASES.JUDGING);

      const round = database.getRoundById(roundId);
      const submissions = database.getSubmissionsByRound(roundId);

      // Emit judging started event
      this.emitToRoom(roundId, WS_EVENTS.JUDGING_STARTED, {
        roundId,
        character: round.judge_character,
        submissionCount: submissions.length
      });

      this.emitToAll(WS_EVENTS.ROUND_UPDATED, {
        roundId,
        phase: GAME_PHASES.JUDGING,
        message: MESSAGES.JUDGING_STARTED
      });

      if (config.logging.testEnv) {
        logger.info('Round transitioned to judging', { roundId });
      }

      // Start judging timer (will trigger AI evaluation)
      setTimeout(() => {
        this.completeRound(roundId);
      }, config.game.judgingDuration * 1000);

      return { success: true };

    } catch (error) {
      gameLogger.error('transitionToJudging', error, { roundId });
      throw error;
    }
  }

  async completeRound(roundId) {
    try {
      const round = database.getRoundById(roundId);
      if (!round) {
        throw new Error('Round not found');
      }

      const submissions = database.getSubmissionsByRound(roundId);
      const completionValidation = canCompleteRound(round, submissions.length);

      if (!completionValidation.valid) {
        if (config.logging.testEnv) {
          logger.warn('Cannot complete round', { roundId, reason: completionValidation.reason });
        }
        return { success: false, message: completionValidation.reason };
      }

      // TODO: AI evaluation will be implemented in AI module
      // For now, select random winner
      const winnerSubmission = submissions[Math.floor(Math.random() * submissions.length)];
      const aiReasoning = `${round.judge_character.toUpperCase()}: This roast perfectly captures the essence of what I look for. Well done!`;
      
      const prizeAmount = round.prize_pool * 0.95; // 95% to winner, 5% house fee

      // Create result and update stats
      const resultId = database.createResult(
        roundId, 
        winnerSubmission.id, 
        aiReasoning, 
        prizeAmount
      );

      gameLogger.roundCompleted(roundId, winnerSubmission.id, winnerSubmission.player_address, prizeAmount);

      // Emit completion events
      this.emitToRoom(roundId, WS_EVENTS.ROUND_COMPLETED, {
        roundId,
        winnerId: winnerSubmission.id,
        winnerAddress: winnerSubmission.player_address,
        winningRoast: winnerSubmission.roast_text,
        aiReasoning,
        prizeAmount,
        character: round.judge_character
      });

      this.emitToAll(WS_EVENTS.ROUND_COMPLETED, {
        roundId,
        winnerAddress: winnerSubmission.player_address,
        prizeAmount
      });

      if (config.logging.testEnv) {
        logger.info('Round completed', { 
          roundId, 
          winner: winnerSubmission.player_address, 
          prizeAmount 
        });
      }

      // Schedule next round creation
      this.scheduleNextRound();

      return { 
        success: true, 
        winner: winnerSubmission,
        prizeAmount,
        aiReasoning
      };

    } catch (error) {
      gameLogger.error('completeRound', error, { roundId });
      throw error;
    }
  }

  // ================================
  // TIMER MANAGEMENT
  // ================================

  startTimer(roundId, durationSeconds) {
    // Clear any existing timer for this round
    this.clearTimer(roundId);

    let timeLeft = durationSeconds;
    
    const timer = setInterval(() => {
      timeLeft--;

      // Emit timer update
      this.emitToRoom(roundId, WS_EVENTS.TIMER_UPDATE, {
        roundId,
        timeLeft
      });

      // Warning at 30 seconds
      if (timeLeft === 30) {
        this.emitToRoom(roundId, WS_EVENTS.ROUND_UPDATED, {
          roundId,
          message: MESSAGES.TIMER_WARNING
        });
      }

      // Time's up
      if (timeLeft <= 0) {
        this.clearTimer(roundId);
        this.transitionToJudging(roundId);
      }

    }, 1000);

    // Store timer info
    this.activeTimers.set(roundId, {
      timer,
      startTime: Date.now(),
      duration: durationSeconds,
      timeLeft
    });

    if (config.logging.testEnv) {
      logger.debug('Timer started', { roundId, duration: durationSeconds });
    }
  }

  clearTimer(roundId) {
    const timerInfo = this.activeTimers.get(roundId);
    if (timerInfo) {
      clearInterval(timerInfo.timer);
      this.activeTimers.delete(roundId);
      
      if (config.logging.testEnv) {
        logger.debug('Timer cleared', { roundId });
      }
    }
  }

  scheduleNextRound() {
    // Clear any existing auto-start timer
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
    }

    // Schedule new round creation
    this.autoStartTimer = setTimeout(() => {
      this.createNewRound().catch(error => {
        gameLogger.error('autoCreateRound', error);
      });
    }, config.game.nextRoundDelay * 1000);

    if (config.logging.testEnv) {
      logger.info('Next round scheduled', { delay: config.game.nextRoundDelay });
    }
  }

  // ================================
  // RECOVERY & CLEANUP
  // ================================

  resumeActiveRounds() {
    try {
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
          this.startTimer(currentRound.id, remaining);
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
        // Round was waiting, keep it waiting
        if (config.logging.testEnv) {
          logger.info('Resumed waiting round', { roundId: currentRound.id });
        }
      }

    } catch (error) {
      gameLogger.error('resumeActiveRounds', error);
      // On error, schedule new round
      this.scheduleNextRound();
    }
  }

  cleanup() {
    // Clear all timers
    this.activeTimers.forEach((timerInfo, roundId) => {
      this.clearTimer(roundId);
    });

    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
    }

    if (config.logging.testEnv) {
      logger.info('Game service cleanup completed');
    }
  }

  // ================================
  // WEBSOCKET HELPERS
  // ================================

  emitToRoom(roundId, event, data) {
    if (this.wsEmitter) {
      const room = WS_ROOMS.ROUND(roundId);
      this.wsEmitter.to(room).emit(event, data);
    }
  }

  emitToAll(event, data) {
    if (this.wsEmitter) {
      this.wsEmitter.to(WS_ROOMS.GLOBAL).emit(event, data);
    }
  }

  emitRoundUpdate(round, playerCount, timeLeft = null) {
    const updateData = formatWSRoundUpdate(round, playerCount, timeLeft);
    this.emitToRoom(round.id, WS_EVENTS.ROUND_UPDATED, updateData);
    this.emitToAll(WS_EVENTS.ROUND_UPDATED, updateData);
  }

  // ================================
  // PUBLIC API METHODS
  // ================================

  getCurrentRound() {
    const round = database.getCurrentRound();
    if (!round) return null;

    const submissions = database.getSubmissionsByRound(round.id);
    const playerCount = submissions.length;

    // Calculate time left if active
    let timeLeft = null;
    if (round.phase === GAME_PHASES.ACTIVE && round.started_at) {
      const now = new Date();
      const startedAt = new Date(round.started_at);
      const elapsed = Math.floor((now - startedAt) / 1000);
      timeLeft = Math.max(0, round.timer_duration - elapsed);
    }

    return {
      ...formatRoundResponse(round),
      playerCount,
      timeLeft,
      character: CHARACTERS[round.judge_character] || null
    };
  }

  getRoundSubmissions(roundId, includeFullText = false) {
    return database.getSubmissionsByRound(roundId)
      .map(sub => ({
        id: sub.id,
        playerAddress: sub.player_address,
        roastText: includeFullText ? sub.roast_text : sub.roast_text.substring(0, 60) + '...',
        submittedAt: sub.submitted_at
      }));
  }

  getGameStats() {
    return database.getGlobalStats();
  }
}

module.exports = GameService; 