const { config } = require('../../../config/app.config');
const { logger, gameLogger } = require('../../../services/logger.service');
const database = require('../../../database/database.service');
const { 
  GAME_PHASES, 
  WS_EVENTS, 
  ERROR_CODES, 
  CHARACTERS,
  LIMITS,
  MESSAGES 
} = require('../../../utils/constants');
const {
  canJoinRound,
  canStartRound,
  canCompleteRound,
  canSubmitRoast
} = require('../../../utils/validators');
const {
  formatRoundResponse
} = require('../../../utils/formatters');

class RoundManager {
  constructor(eventEmitter = null, aiService = null, treasuryService = null, votingService = null) {
    this.eventEmitter = eventEmitter;
    this.aiService = aiService;
    this.treasuryService = treasuryService;
    this.votingService = votingService;
    this.nextJudgeVotingResult = null;
    
    if (config.logging.testEnv) {
      logger.info('RoundManager initialized');
    }
  }

  // ================================
  // ROUND CREATION
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

      // Reset voting for new round
      if (this.votingService && preferredCharacter) {
        this.votingService.resetVoting(null, roundId);
      }

      // Emit WebSocket event
      if (this.eventEmitter) {
        this.eventEmitter.emitToAll(WS_EVENTS.ROUND_CREATED, {
          roundId: roundId,
          judgeCharacter: selectedCharacter,
          phase: GAME_PHASES.WAITING,
          prizePool: 0,
          playerCount: 0,
          votingResult: !!preferredCharacter
        });
      }

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

  // ================================
  // ROUND START
  // ================================

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
      
      gameLogger.roundCreated(roundId, round.judge_character);

      // Emit round started events
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(roundId, WS_EVENTS.ROUND_UPDATED, {
          roundId,
          phase: GAME_PHASES.ACTIVE,
          timeLeft: config.game.roundTimerDuration,
          playerCount: submissions.length
        });

        this.eventEmitter.emitToAll(WS_EVENTS.ROUND_UPDATED, {
          roundId,
          phase: GAME_PHASES.ACTIVE,
          message: MESSAGES.ROUND_STARTED
        });
      }

      if (config.logging.testEnv) {
        logger.info('Round started', { roundId, timerDuration: config.game.roundTimerDuration });
      }

      return { success: true, roundId, phase: GAME_PHASES.ACTIVE };

    } catch (error) {
      gameLogger.error('startRound', error, { roundId });
      throw error;
    }
  }

  // ================================
  // ROUND COMPLETION
  // ================================

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

      // Complete round in database
      database.completeRound(roundId, round.prize_pool);

      // Handle automatic prize distribution
      const payoutResult = await this.handlePrizePayout(roundId, winnerSubmission, round.prize_pool, resultId);

      // Emit completion events
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(roundId, WS_EVENTS.ROUND_COMPLETED, {
          roundId,
          winnerId: winnerSubmission.id,
          winnerAddress: winnerSubmission.player_address,
          winningRoast: winnerSubmission.roast_text,
          aiReasoning,
          prizeAmount,
          character: round.judge_character,
          payoutTxHash: payoutResult.txHash
        });

        this.eventEmitter.emitToAll(WS_EVENTS.ROUND_COMPLETED, {
          roundId,
          winnerAddress: winnerSubmission.player_address,
          prizeAmount,
          payoutTxHash: payoutResult.txHash,
          aiReasoning
        });
      }

      if (config.logging.testEnv) {
        logger.info('Round completed', { 
          roundId, 
          winner: winnerSubmission.player_address, 
          prizeAmount,
          payoutTxHash: payoutResult.txHash
        });
      }

      return { 
        success: true, 
        winner: winnerSubmission,
        prizeAmount,
        aiReasoning,
        payoutTxHash: payoutResult.txHash
      };

    } catch (error) {
      gameLogger.error('completeRound', error, { roundId });
      throw error;
    }
  }

  // ================================
  // PRIZE PAYOUT HANDLING
  // ================================

  async handlePrizePayout(roundId, winnerSubmission, totalPrizePool, resultId) {
    let payoutTxHash = null;
    const prizeAmount = totalPrizePool * 0.95;

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
          totalPrizePool
        );
        
        payoutTxHash = payout.txHash;

        // Update result with transaction hash
        database.db.prepare(`
          UPDATE results SET payout_tx_hash = ? 
          WHERE id = ?
        `).run(payoutTxHash, resultId);

        // Emit prize distributed event
        if (this.eventEmitter) {
          this.eventEmitter.emitToRoom(roundId, WS_EVENTS.PRIZE_DISTRIBUTED, {
            roundId,
            winnerAddress: winnerSubmission.player_address,
            prizeAmount: payout.amount,
            transactionHash: payoutTxHash,
            currency: config.zg.currencySymbol
          });

          this.eventEmitter.emitToAll(WS_EVENTS.PRIZE_DISTRIBUTED, {
            roundId,
            winnerAddress: winnerSubmission.player_address,
            prizeAmount: payout.amount,
            transactionHash: payoutTxHash
          });
        }

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
        if (this.eventEmitter) {
          this.eventEmitter.emitToRoom(roundId, WS_EVENTS.ERROR, {
            roundId,
            type: 'PAYOUT_FAILED',
            message: 'Prize payout failed, manual intervention required',
            winnerAddress: winnerSubmission.player_address,
            prizeAmount
          });
        }
      }
    } else if (config.server.env === 'production' && prizeAmount > 0) {
      logger.warn('No treasury service available for prize payout', { 
        roundId, 
        winnerAddress: winnerSubmission.player_address, 
        prizeAmount 
      });
    }

    return { txHash: payoutTxHash, amount: prizeAmount };
  }

  // ================================
  // VOTING INTEGRATION
  // ================================

  setNextJudgeVotingResult(characterId) {
    if (characterId && this.aiService && this.aiService.characterExists(characterId)) {
      this.nextJudgeVotingResult = characterId;
      
      if (config.logging.testEnv) {
        logger.info('Next judge voting result set', { characterId });
      }
      
      // Emit to all clients that voting result was accepted
      if (this.eventEmitter) {
        this.eventEmitter.emitToAll('voting-result-accepted', {
          nextJudge: characterId,
          source: 'community-vote'
        });
      }
      
      return { success: true, nextJudge: characterId };
    } else {
      if (config.logging.testEnv) {
        logger.warn('Invalid character for voting result', { characterId });
      }
      
      return { success: false, error: 'Invalid character ID' };
    }
  }

  getNextJudgeVotingResult() {
    return this.nextJudgeVotingResult;
  }

  clearNextJudgeVotingResult() {
    this.nextJudgeVotingResult = null;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  async checkAndStartWaitingRounds() {
    try {
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
}

module.exports = RoundManager; 