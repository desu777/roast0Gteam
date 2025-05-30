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
  constructor(wsEmitter = null, aiService = null, treasuryService = null, votingService = null) {
    this.wsEmitter = wsEmitter;
    this.aiService = aiService;
    this.treasuryService = treasuryService;
    this.votingService = votingService;
    this.activeTimers = new Map(); // roundId -> { timer, startTime, duration }
    this.autoStartTimer = null;
    this.nextJudgeVotingResult = null; // Store voting result for next round
    this.submissionLocked = new Map(); // roundId -> boolean
    this.lockTimers = new Map();
    
    if (config.logging.testEnv) {
      logger.info('Game service initialized', {
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
  // ROUND LIFECYCLE MANAGEMENT
  // ================================

  async createNewRound(preferredCharacter = null) {
    try {
      // Check if there's already an active round
      const currentRound = database.getCurrentRound();
      if (currentRound) {
        if (config.logging.testEnv) {
          logger.debug('Active round already exists', { currentRound });
        }
        return { success: false, error: 'Active round already exists', round: currentRound };
      }

      // Select character - use voting result or random fallback
      let selectedCharacter;
      if (preferredCharacter && this.aiService.characterExists(preferredCharacter)) {
        selectedCharacter = preferredCharacter;
        if (config.logging.testEnv) {
          logger.info('Using community-voted judge', { selectedCharacter });
        }
      } else {
        // Fallback to random selection
        const characters = Object.keys(CHARACTERS);
        selectedCharacter = characters[Math.floor(Math.random() * characters.length)];
        if (config.logging.testEnv) {
          logger.info('Using random judge (no valid vote)', { 
            selectedCharacter, 
            attemptedCharacter: preferredCharacter 
          });
        }
      }

      // Create new round
      const roundId = database.createRound(selectedCharacter);
      const newRound = database.getRoundById(roundId);

      gameLogger.roundCreated(roundId, selectedCharacter);

      // INTEGRACJA Z VOTING SERVICE
      if (this.votingService && preferredCharacter) {
        // Reset voting for new round
        this.votingService.resetVoting(null, roundId);
      }

      // Emit WebSocket event
      this.emitToAll(WS_EVENTS.ROUND_CREATED, {
        roundId: roundId,
        judgeCharacter: selectedCharacter,
        phase: GAME_PHASES.WAITING,
        prizePool: 0,
        playerCount: 0,
        votingResult: !!preferredCharacter // Indicate if this was from voting
      });

      if (config.logging.testEnv) {
        logger.info('New round created', { 
          roundId, 
          character: selectedCharacter,
          fromVoting: !!preferredCharacter
        });
      }

      return { 
        success: true, 
        round: formatRoundResponse(newRound),
        message: MESSAGES.ROUND_STARTING,
        judgeSource: preferredCharacter ? 'voting' : 'random'
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

      // DODAJ SPRAWDZENIE BLOKADY
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
      if (this.treasuryService && paymentTxHash) {
        try {
          if (config.logging.testEnv) {
            logger.info('Verifying entry fee payment', { 
              roundId: currentRound.id, 
              playerAddress, 
              paymentTxHash 
            });
          }

          const verification = await this.treasuryService.verifyEntryFeePayment(
            paymentTxHash, 
            playerAddress, 
            currentRound.id
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
              roundId: currentRound.id, 
              playerAddress, 
              amount: verification.amount 
            });
          }

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

      // Check if round should start (2+ players)
      const newPlayerCount = playerCount + 1;
      if (currentRound.phase === GAME_PHASES.WAITING && newPlayerCount >= LIMITS.MIN_PLAYERS_TO_START) {
        await this.startRound(currentRound.id);
      }

      // Emit player joined event
      this.emitToRoom(currentRound.id, WS_EVENTS.PLAYER_JOINED, {
        roundId: currentRound.id,
        playerAddress,
        playerCount: playerCount + 1,
        prizePool: newPrizePool,
        paymentVerified: !!paymentTxHash
      });

      // Emit round update
      const updatedRound = database.getRoundById(currentRound.id);
      this.emitRoundUpdate(updatedRound, playerCount + 1);

      if (config.logging.testEnv) {
        logger.info('Player joined round', { 
          roundId: currentRound.id, 
          playerAddress, 
          playerCount: playerCount + 1,
          paymentVerified: !!paymentTxHash
        });
      }

      return { 
        success: true, 
        submissionId,
        playerCount: playerCount + 1,
        round: formatRoundResponse(updatedRound),
        paymentVerified: !!paymentTxHash
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

      // DODAJ PLANOWANIE BLOKAD
      this.scheduleLocksForRound(roundId, config.game.roundTimerDuration);

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

      // AI evaluation or fallback to random
      let winnerSubmission;
      let aiReasoning;
      let evaluationResult = null;

      // Try AI evaluation if AI service is available
      if (this.aiService && config.ai.enabled) {
        try {
          if (config.logging.testEnv) {
            logger.info('Starting AI evaluation', { 
              roundId, 
              character: round.judge_character, 
              submissionsCount: submissions.length 
            });
          }

          evaluationResult = await this.aiService.evaluateRoasts(
            roundId,
            round.judge_character,
            submissions
          );

          if (evaluationResult.success) {
            // Find winner by ID
            winnerSubmission = submissions.find(sub => sub.id === evaluationResult.winnerId);
            if (winnerSubmission) {
              aiReasoning = evaluationResult.reasoning;
              
              if (config.logging.testEnv) {
                logger.info('AI evaluation successful', { 
                  roundId, 
                  winnerId: evaluationResult.winnerId,
                  fallback: evaluationResult.fallback || false,
                  duration: evaluationResult.duration
                });
              }
            } else {
              throw new Error(`AI selected invalid winner ID: ${evaluationResult.winnerId}`);
            }
          } else {
            throw new Error('AI evaluation failed without result');
          }

        } catch (aiError) {
          logger.error('AI evaluation failed, using fallback', { 
            roundId, 
            error: aiError.message 
          });
          
          // Fallback to random selection
          winnerSubmission = submissions[Math.floor(Math.random() * submissions.length)];
          aiReasoning = `${round.judge_character.toUpperCase()}: Due to technical difficulties, this roast was selected. The creativity shown here is noteworthy! (Random selection)`;
        }
      } else {
        // AI service not available, use random selection
        if (config.logging.testEnv) {
          logger.info('AI service not available, using random selection', { roundId });
        }
        
        winnerSubmission = submissions[Math.floor(Math.random() * submissions.length)];
        aiReasoning = `${round.judge_character.toUpperCase()}: This roast perfectly captures the essence of what I look for. Well done!`;
      }

      const prizeAmount = round.prize_pool * 0.95; // 95% to winner, 5% house fee

      // Create result and update stats
      const resultId = database.createResult(
        roundId, 
        winnerSubmission.id, 
        aiReasoning, 
        prizeAmount
      );

      gameLogger.roundCompleted(roundId, winnerSubmission.id, winnerSubmission.player_address, prizeAmount);

      // Automatic prize distribution
      let payoutTxHash = null;
      if (this.treasuryService && prizeAmount > 0) {
        try {
          if (config.logging.testEnv) {
            logger.info('Initiating automatic prize payout', { 
              roundId, 
              winnerAddress: winnerSubmission.player_address, 
              prizeAmount 
            });
          }

          const payout = await this.treasuryService.sendPrizePayout(
            winnerSubmission.player_address,
            roundId,
            round.prize_pool
          );
          
          payoutTxHash = payout.txHash;

          // Update result with transaction hash
          database.db.prepare(`
            UPDATE results SET payout_tx_hash = ? 
            WHERE id = ?
          `).run(payoutTxHash, resultId);

          // Emit prize distributed event
          this.emitToRoom(roundId, WS_EVENTS.PRIZE_DISTRIBUTED, {
            roundId,
            winnerAddress: winnerSubmission.player_address,
            prizeAmount: payout.amount,
            transactionHash: payoutTxHash,
            currency: config.zg.currencySymbol
          });

          this.emitToAll(WS_EVENTS.PRIZE_DISTRIBUTED, {
            roundId,
            winnerAddress: winnerSubmission.player_address,
            prizeAmount: payout.amount,
            transactionHash: payoutTxHash
          });

          if (config.logging.testEnv) {
            logger.info('Prize payout completed successfully', { 
              roundId, 
              winnerAddress: winnerSubmission.player_address, 
              prizeAmount: payout.amount,
              txHash: payoutTxHash
            });
          }

        } catch (payoutError) {
          logger.error('Automatic prize payout failed', { 
            roundId, 
            winnerAddress: winnerSubmission.player_address, 
            prizeAmount,
            error: payoutError.message 
          });

          // Emit payout failed event
          this.emitToRoom(roundId, WS_EVENTS.ERROR, {
            roundId,
            type: 'PAYOUT_FAILED',
            message: 'Prize payout failed, manual intervention required',
            winnerAddress: winnerSubmission.player_address,
            prizeAmount
          });

          // Continue with round completion even if payout fails
        }
      } else if (config.server.env === 'production' && prizeAmount > 0) {
        logger.warn('No treasury service available for prize payout', { 
          roundId, 
          winnerAddress: winnerSubmission.player_address, 
          prizeAmount 
        });
      }

      // Emit completion events
      this.emitToRoom(roundId, WS_EVENTS.ROUND_COMPLETED, {
        roundId,
        winnerId: winnerSubmission.id,
        winnerAddress: winnerSubmission.player_address,
        winningRoast: winnerSubmission.roast_text,
        aiReasoning,
        prizeAmount,
        character: round.judge_character,
        payoutTxHash
      });

      this.emitToAll(WS_EVENTS.ROUND_COMPLETED, {
        roundId,
        winnerAddress: winnerSubmission.player_address,
        prizeAmount,
        payoutTxHash,
        aiReasoning
      });

      if (config.logging.testEnv) {
        logger.info('Round completed', { 
          roundId, 
          winner: winnerSubmission.player_address, 
          prizeAmount,
          payoutTxHash
        });
      }

      // Schedule next round creation
      this.scheduleNextRound();

      return { 
        success: true, 
        winner: winnerSubmission,
        prizeAmount,
        aiReasoning,
        payoutTxHash
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

    // Schedule new round creation with voting result
    this.autoStartTimer = setTimeout(() => {
      // Use voting result if available, otherwise fallback to random
      const preferredCharacter = this.nextJudgeVotingResult;
      
      if (config.logging.testEnv) {
        logger.info('Creating next round', { 
          preferredCharacter,
          source: preferredCharacter ? 'voting' : 'random',
          delay: config.game.nextRoundDelay 
        });
      }

      // Clear the voting result after using it
      this.nextJudgeVotingResult = null;

      this.createNewRound(preferredCharacter).catch(error => {
        gameLogger.error('autoCreateRound', error);
      });
    }, config.game.nextRoundDelay * 1000);

    if (config.logging.testEnv) {
      logger.info('Next round scheduled', { delay: config.game.nextRoundDelay });
    }
  }

  /**
   * Set the voting result for next judge selection
   * @param {string} characterId - Selected character ID from community voting
   */
  setNextJudgeVotingResult(characterId) {
    if (characterId && this.aiService && this.aiService.characterExists(characterId)) {
      this.nextJudgeVotingResult = characterId;
      
      if (config.logging.testEnv) {
        logger.info('Next judge voting result set', { characterId });
      }
      
      // Emit to all clients that voting result was accepted
      this.emitToAll('voting-result-accepted', {
        nextJudge: characterId,
        source: 'community-vote'
      });
      
      return { success: true, nextJudge: characterId };
    } else {
      if (config.logging.testEnv) {
        logger.warn('Invalid character for voting result', { characterId });
      }
      
      return { success: false, error: 'Invalid character ID' };
    }
  }

  /**
   * Get current voting result for next judge
   * @returns {string|null} Character ID or null
   */
  getNextJudgeVotingResult() {
    return this.nextJudgeVotingResult;
  }

  // ================================
  // RECOVERY & CLEANUP
  // ================================

  resumeActiveRounds() {
    try {
      // Najpierw sprawdź i uruchom oczekujące rundy z wystarczającą liczbą graczy
      this.checkAndStartWaitingRounds();
      
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

    // DODAJ CLEANUP LOCK TIMERS
    this.lockTimers.forEach(timer => clearTimeout(timer));
    this.lockTimers.clear();
    this.submissionLocked.clear();

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
      
      // Jeśli czas minął, przejdź do fazy oceniania
      if (timeLeft === 0 && !this.activeTimers.has(round.id)) {
        // Zapobiegaj wielokrotnemu wywoływaniu
        this.transitionToJudging(round.id);
      }
    }

    return {
      ...formatRoundResponse(round),
      playerCount,
      timeLeft,
      character: CHARACTERS[round.judge_character] || null,
      submissions: submissions.map(sub => ({
        id: sub.id,
        player_address: sub.player_address,
        roast_text: sub.roast_text
      }))
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

  /**
   * Sprawdza wszystkie oczekujące rundy i startuje je jeśli mają wystarczającą liczbę graczy
   */
  async checkAndStartWaitingRounds() {
    try {
      // Pobierz wszystkie rundy w fazie WAITING
      const waitingRounds = database.db.prepare(`
        SELECT r.*, COUNT(s.id) as player_count 
        FROM rounds r
        LEFT JOIN submissions s ON r.id = s.round_id
        WHERE r.phase = ?
        GROUP BY r.id
      `).all(GAME_PHASES.WAITING);

      for (const round of waitingRounds) {
        if (round.player_count >= LIMITS.MIN_PLAYERS_TO_START) {
          if (config.logging.testEnv) {
            logger.info('Starting waiting round with enough players', {
              roundId: round.id,
              playerCount: round.player_count
            });
          }
          
          await this.startRound(round.id);
        }
      }
    } catch (error) {
      logger.error('Error checking waiting rounds', { error: error.message });
    }
  }

  scheduleLocksForRound(roundId, durationSeconds) {
    // Clear any existing locks for this round
    this.clearLocksForRound(roundId);

    let timeLeft = durationSeconds;
    
    const lockTimer = setInterval(() => {
      timeLeft--;

      // Emit lock update
      this.emitToAll('lock-update', {
        roundId,
        timeLeft
      });

      // Warning at 30 seconds
      if (timeLeft === 30) {
        this.emitToAll('lock-warning', {
          roundId,
          message: MESSAGES.TIMER_WARNING
        });
      }

      // Time's up
      if (timeLeft <= 0) {
        this.clearLocksForRound(roundId);
        this.submissionLocked.set(roundId, false);
      }

    }, 1000);

    // Store lock info
    this.lockTimers.set(roundId, {
      lockTimer,
      startTime: Date.now(),
      duration: durationSeconds,
      timeLeft
    });

    if (config.logging.testEnv) {
      logger.debug('Lock timer started', { roundId, duration: durationSeconds });
    }
  }

  clearLocksForRound(roundId) {
    const lockInfo = this.lockTimers.get(roundId);
    if (lockInfo) {
      clearInterval(lockInfo.lockTimer);
      this.lockTimers.delete(roundId);
      
      if (config.logging.testEnv) {
        logger.debug('Lock cleared', { roundId });
      }
    }
  }

  // ================================
  // SUBMISSION LOCKING METHODS
  // ================================

  /**
   * Lock submissions 10 seconds before round ends
   */
  lockSubmissions(roundId) {
    this.submissionLocked.set(roundId, true);
    
    // Emit submission locked event
    this.emitToRoom(roundId, 'submission-locked', { roundId });
    
    if (config.logging.testEnv) {
      logger.info('Submissions locked for round', { roundId });
    }
  }

  /**
   * Schedule submission and voting lock
   */
  scheduleLocksForRound(roundId, timeUntilLock) {
    // Clear existing timers
    if (this.lockTimers.has(roundId)) {
      clearTimeout(this.lockTimers.get(roundId));
    }

    // Schedule locks for 10 seconds before round ends
    const timer = setTimeout(() => {
      this.lockSubmissions(roundId);
      
      // Also lock voting if voting service is available
      if (this.votingService) {
        this.votingService.lockVoting(roundId);
      }
    }, (timeUntilLock - 10) * 1000);

    this.lockTimers.set(roundId, timer);
    
    if (config.logging.testEnv) {
      logger.info('Locks scheduled for round', { roundId, timeUntilLock });
    }
  }
}

module.exports = GameService; 