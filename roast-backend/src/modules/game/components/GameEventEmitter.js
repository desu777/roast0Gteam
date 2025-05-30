const { config } = require('../../../config/app.config');
const { logger } = require('../../../services/logger.service');
const { 
  WS_EVENTS, 
  WS_ROOMS, 
  CHARACTERS 
} = require('../../../utils/constants');
const {
  formatRoundResponse,
  formatWSRoundUpdate
} = require('../../../utils/formatters');

class GameEventEmitter {
  constructor(wsService = null) {
    this.wsService = wsService;
    
    if (config.logging.testEnv) {
      logger.info('GameEventEmitter initialized', { wsService: !!wsService });
    }
  }

  // ================================
  // WEBSOCKET EMISSION METHODS
  // ================================

  emitToRoom(roundId, event, data) {
    if (this.wsService && this.wsService.io) {
      const room = WS_ROOMS.ROUND(roundId);
      this.wsService.io.to(room).emit(event, data);
      
      if (config.logging.testEnv) {
        logger.debug('Event emitted to room', { roundId, event, room });
      }
    }
  }

  emitToAll(event, data) {
    if (this.wsService && this.wsService.io) {
      this.wsService.io.to(WS_ROOMS.GLOBAL).emit(event, data);
      
      if (config.logging.testEnv) {
        logger.debug('Event emitted to all', { event });
      }
    }
  }

  emitToAdmin(event, data) {
    if (this.wsService && this.wsService.io) {
      this.wsService.io.to(WS_ROOMS.ADMIN).emit(event, data);
      
      if (config.logging.testEnv) {
        logger.debug('Event emitted to admin', { event });
      }
    }
  }

  // ================================
  // ROUND EVENT EMISSION
  // ================================

  emitRoundCreated(round, votingResult = false) {
    const eventData = {
      roundId: round.id,
      judgeCharacter: round.judge_character,
      phase: round.phase,
      prizePool: 0,
      playerCount: 0,
      votingResult,
      character: CHARACTERS[round.judge_character] || null
    };

    this.emitToAll(WS_EVENTS.ROUND_CREATED, eventData);
    
    if (config.logging.testEnv) {
      logger.info('Round created event emitted', { 
        roundId: round.id, 
        character: round.judge_character,
        votingResult 
      });
    }
  }

  emitRoundStarted(roundId, playerCount, timerDuration) {
    const eventData = {
      roundId,
      phase: 'active',
      timeLeft: timerDuration,
      playerCount,
      message: 'Round has started! Submit your best roast!'
    };

    this.emitToRoom(roundId, WS_EVENTS.ROUND_UPDATED, eventData);
    this.emitToAll(WS_EVENTS.ROUND_UPDATED, {
      roundId,
      phase: 'active',
      message: 'A new round has started!'
    });
    
    if (config.logging.testEnv) {
      logger.info('Round started event emitted', { roundId, playerCount, timerDuration });
    }
  }

  emitRoundUpdate(round, playerCount, timeLeft = null) {
    const updateData = formatWSRoundUpdate(round, playerCount, timeLeft);
    
    this.emitToRoom(round.id, WS_EVENTS.ROUND_UPDATED, updateData);
    this.emitToAll(WS_EVENTS.ROUND_UPDATED, updateData);
    
    if (config.logging.testEnv) {
      logger.debug('Round update event emitted', { roundId: round.id, phase: round.phase });
    }
  }

  emitJudgingStarted(roundId, character, submissionCount) {
    const eventData = {
      roundId,
      character,
      submissionCount,
      message: 'Time\'s up! The AI judge is evaluating submissions...'
    };

    this.emitToRoom(roundId, WS_EVENTS.JUDGING_STARTED, eventData);
    this.emitToAll(WS_EVENTS.ROUND_UPDATED, {
      roundId,
      phase: 'judging',
      message: 'AI is evaluating roasts...'
    });
    
    if (config.logging.testEnv) {
      logger.info('Judging started event emitted', { roundId, character, submissionCount });
    }
  }

  emitRoundCompleted(roundData) {
    const {
      roundId,
      winnerId,
      winnerAddress,
      winningRoast,
      aiReasoning,
      prizeAmount,
      character,
      payoutTxHash
    } = roundData;

    // Emit to round participants
    this.emitToRoom(roundId, WS_EVENTS.ROUND_COMPLETED, {
      roundId,
      winnerId,
      winnerAddress,
      winningRoast,
      aiReasoning,
      prizeAmount,
      character,
      payoutTxHash
    });

    // Emit to all users (summary)
    this.emitToAll(WS_EVENTS.ROUND_COMPLETED, {
      roundId,
      winnerAddress,
      prizeAmount,
      payoutTxHash,
      aiReasoning: aiReasoning.substring(0, 100) + '...' // Truncated for global broadcast
    });
    
    if (config.logging.testEnv) {
      logger.info('Round completed event emitted', { 
        roundId, 
        winnerAddress, 
        prizeAmount 
      });
    }
  }

  // ================================
  // PLAYER EVENT EMISSION
  // ================================

  emitPlayerJoined(roundId, playerAddress, playerCount, prizePool, paymentVerified = false) {
    const eventData = {
      roundId,
      playerAddress,
      playerCount,
      prizePool,
      paymentVerified
    };

    this.emitToRoom(roundId, WS_EVENTS.PLAYER_JOINED, eventData);
    
    if (config.logging.testEnv) {
      logger.info('Player joined event emitted', { 
        roundId, 
        playerAddress, 
        playerCount 
      });
    }
  }

  emitPlayerLeft(roundId, playerAddress, playerCount) {
    const eventData = {
      roundId,
      playerAddress,
      playerCount
    };

    this.emitToRoom(roundId, WS_EVENTS.PLAYER_LEFT, eventData);
    
    if (config.logging.testEnv) {
      logger.info('Player left event emitted', { roundId, playerAddress, playerCount });
    }
  }

  // ================================
  // TIMER EVENT EMISSION
  // ================================

  emitTimerUpdate(roundId, timeLeft) {
    this.emitToRoom(roundId, WS_EVENTS.TIMER_UPDATE, {
      roundId,
      timeLeft
    });
  }

  emitTimerWarning(roundId, message) {
    this.emitToRoom(roundId, WS_EVENTS.ROUND_UPDATED, {
      roundId,
      message
    });
  }

  // ================================
  // PAYMENT EVENT EMISSION
  // ================================

  emitPrizeDistributed(roundId, winnerAddress, prizeAmount, transactionHash, currency = 'OG') {
    const eventData = {
      roundId,
      winnerAddress,
      prizeAmount,
      transactionHash,
      currency
    };

    this.emitToRoom(roundId, WS_EVENTS.PRIZE_DISTRIBUTED, eventData);
    this.emitToAll(WS_EVENTS.PRIZE_DISTRIBUTED, eventData);
    
    if (config.logging.testEnv) {
      logger.info('Prize distributed event emitted', { 
        roundId, 
        winnerAddress, 
        prizeAmount,
        transactionHash 
      });
    }
  }

  emitPaymentFailed(roundId, winnerAddress, prizeAmount, reason) {
    const eventData = {
      roundId,
      type: 'PAYOUT_FAILED',
      message: 'Prize payout failed, manual intervention required',
      winnerAddress,
      prizeAmount,
      reason
    };

    this.emitToRoom(roundId, WS_EVENTS.ERROR, eventData);
    this.emitToAdmin('payout-failed', eventData);
    
    if (config.logging.testEnv) {
      logger.warn('Payment failed event emitted', { roundId, winnerAddress, reason });
    }
  }

  // ================================
  // SUBMISSION EVENT EMISSION
  // ================================

  emitSubmissionLocked(roundId) {
    this.emitToRoom(roundId, 'submission-locked', { roundId });
    
    if (config.logging.testEnv) {
      logger.info('Submission locked event emitted', { roundId });
    }
  }

  emitSubmissionUnlocked(roundId) {
    this.emitToRoom(roundId, 'submission-unlocked', { roundId });
    
    if (config.logging.testEnv) {
      logger.info('Submission unlocked event emitted', { roundId });
    }
  }

  // ================================
  // VOTING EVENT EMISSION
  // ================================

  emitVotingUpdate(roundId, votingStats, voterAddress, characterId) {
    const eventData = {
      roundId,
      votingStats,
      lastVote: {
        voterAddress,
        characterId,
        timestamp: Date.now()
      }
    };

    this.emitToAll('voting-update', eventData);
    
    if (config.logging.testEnv) {
      logger.info('Voting update event emitted', { 
        roundId, 
        voterAddress, 
        characterId,
        totalVotes: votingStats.totalVotes 
      });
    }
  }

  emitVotingLocked(roundId) {
    this.emitToAll('voting-locked', { roundId });
    
    if (config.logging.testEnv) {
      logger.info('Voting locked event emitted', { roundId });
    }
  }

  emitVotingResultAccepted(nextJudge, source) {
    this.emitToAll('voting-result-accepted', {
      nextJudge,
      source
    });
    
    if (config.logging.testEnv) {
      logger.info('Voting result accepted event emitted', { nextJudge, source });
    }
  }

  emitVotingReset(oldRoundId, newRoundId, votingStats) {
    this.emitToAll('voting-reset', { 
      oldRoundId, 
      newRoundId,
      votingStats 
    });
    
    if (config.logging.testEnv) {
      logger.info('Voting reset event emitted', { oldRoundId, newRoundId });
    }
  }

  // ================================
  // ERROR EVENT EMISSION
  // ================================

  emitError(roundId, errorCode, message, additionalData = {}) {
    const eventData = {
      error: true,
      code: errorCode,
      message,
      timestamp: Date.now(),
      ...additionalData
    };

    if (roundId) {
      this.emitToRoom(roundId, WS_EVENTS.ERROR, eventData);
    } else {
      this.emitToAll(WS_EVENTS.ERROR, eventData);
    }
    
    if (config.logging.testEnv) {
      logger.warn('Error event emitted', { roundId, errorCode, message });
    }
  }

  // ================================
  // SYSTEM EVENT EMISSION
  // ================================

  emitSystemStatus(status) {
    this.emitToAdmin('system-status', {
      timestamp: Date.now(),
      ...status
    });
  }

  emitMaintenanceMode(enabled, message) {
    this.emitToAll('maintenance-mode', {
      enabled,
      message,
      timestamp: Date.now()
    });
    
    if (config.logging.testEnv) {
      logger.info('Maintenance mode event emitted', { enabled, message });
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  setWSService(wsService) {
    this.wsService = wsService;
    
    if (config.logging.testEnv) {
      logger.info('WebSocket service updated in GameEventEmitter');
    }
  }

  isConnected() {
    return !!(this.wsService && this.wsService.io);
  }

  getConnectedUsers() {
    if (!this.wsService) return { total: 0, byRoom: {} };
    
    const io = this.wsService.io;
    const rooms = io.sockets.adapter.rooms;
    const byRoom = {};
    
    rooms.forEach((sockets, roomName) => {
      if (roomName.startsWith('game:') || roomName === 'global' || roomName === 'admin') {
        byRoom[roomName] = sockets.size;
      }
    });
    
    return {
      total: io.engine.clientsCount || 0,
      byRoom
    };
  }
}

module.exports = GameEventEmitter; 