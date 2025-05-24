const { WS_EVENTS, ERROR_CODES } = require('../../utils/constants');
const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');

// ================================
// EVENT DATA TYPES
// ================================

class WSEventTypes {
  // Client → Server Events
  static ClientEvents = {
    JOIN_ROUND: 'join-round',
    SUBMIT_ROAST: 'submit-roast', 
    LEAVE_ROUND: 'leave-round',
    PING: 'ping',
    AUTHENTICATE: 'authenticate'
  };

  // Server → Client Events
  static ServerEvents = {
    ROUND_CREATED: 'round-created',
    ROUND_UPDATED: 'round-updated',
    PLAYER_JOINED: 'player-joined',
    PLAYER_LEFT: 'player-left',
    TIMER_UPDATE: 'timer-update',
    JUDGING_STARTED: 'judging-started',
    ROUND_COMPLETED: 'round-completed',
    PRIZE_DISTRIBUTED: 'prize-distributed',
    ERROR: 'error',
    PONG: 'pong',
    AUTHENTICATED: 'authenticated',
    ROAST_SUBMITTED: 'roast-submitted'
  };
}

// ================================
// EVENT DATA FORMATTERS
// ================================

class WSEventFormatters {
  static formatRoundCreatedEvent(round) {
    return {
      roundId: round.id,
      judgeCharacter: round.judge_character,
      prizePool: round.prize_pool || 0,
      phase: 'waiting',
      maxPlayers: round.max_players || config.game.maxPlayersPerRound,
      createdAt: round.created_at
    };
  }

  static formatRoundUpdatedEvent(round, playerCount = 0, timeLeft = null) {
    const event = {
      roundId: round.id,
      phase: round.phase,
      playerCount: playerCount,
      prizePool: round.prize_pool || 0,
      judgeCharacter: round.judge_character,
      maxPlayers: round.max_players || config.game.maxPlayersPerRound
    };

    if (timeLeft !== null) {
      event.timeLeft = timeLeft;
    }

    if (round.started_at) {
      event.startedAt = round.started_at;
    }

    return event;
  }

  static formatPlayerJoinedEvent(roundId, playerAddress, playerCount, prizePool, roastPreview = null) {
    const event = {
      roundId,
      playerAddress,
      playerCount,
      prizePool,
      joinedAt: new Date().toISOString()
    };

    // Include roast preview if provided (first 60 chars)
    if (roastPreview) {
      event.roastPreview = roastPreview.length > 60 
        ? roastPreview.substring(0, 60) + '...' 
        : roastPreview;
    }

    return event;
  }

  static formatPlayerLeftEvent(roundId, playerAddress, playerCount, prizePool) {
    return {
      roundId,
      playerAddress,
      playerCount,
      prizePool,
      leftAt: new Date().toISOString()
    };
  }

  static formatTimerUpdateEvent(roundId, timeLeft, totalDuration = null) {
    const event = {
      roundId,
      timeLeft
    };

    if (totalDuration) {
      event.totalDuration = totalDuration;
      event.progress = Math.max(0, (totalDuration - timeLeft) / totalDuration);
    }

    return event;
  }

  static formatJudgingStartedEvent(roundId, character, submissionCount) {
    return {
      roundId,
      character,
      submissionCount,
      estimatedDuration: config.game.judgingDuration,
      startedAt: new Date().toISOString()
    };
  }

  static formatRoundCompletedEvent(result, round, winnerSubmission) {
    return {
      roundId: round.id,
      winnerId: winnerSubmission.id,
      winnerAddress: winnerSubmission.player_address,
      winningRoast: winnerSubmission.roast_text,
      aiReasoning: result.ai_reasoning,
      prizeAmount: result.prize_amount,
      character: round.judge_character,
      completedAt: result.processed_at || new Date().toISOString(),
      transactionHash: result.transaction_hash
    };
  }

  static formatPrizeDistributedEvent(roundId, winnerAddress, prizeAmount, transactionHash) {
    return {
      roundId,
      winnerAddress,
      prizeAmount,
      transactionHash,
      distributedAt: new Date().toISOString(),
      status: 'completed'
    };
  }

  static formatErrorEvent(message, code = ERROR_CODES.INTERNAL_ERROR, details = null) {
    const event = {
      message,
      code,
      timestamp: new Date().toISOString()
    };

    if (details && config.server.env !== 'production') {
      event.details = details;
    }

    return event;
  }

  static formatAuthenticatedEvent(address, isAdmin = false, socketId = null) {
    const event = {
      success: true,
      address,
      isAdmin,
      connectedAt: new Date().toISOString()
    };

    if (config.logging.testEnv && socketId) {
      event.socketId = socketId;
    }

    return event;
  }

  static formatRoastSubmittedEvent(submissionId, roundId, playerAddress) {
    return {
      success: true,
      submissionId,
      roundId,
      playerAddress,
      submittedAt: new Date().toISOString()
    };
  }
}

// ================================
// EVENT VALIDATORS
// ================================

class WSEventValidators {
  static validateJoinRoundData(data) {
    if (!data) {
      return { valid: false, reason: 'No data provided' };
    }

    if (typeof data.roundId !== 'number' || data.roundId < 1) {
      return { valid: false, reason: 'Invalid round ID' };
    }

    return { valid: true };
  }

  static validateSubmitRoastData(data) {
    if (!data) {
      return { valid: false, reason: 'No data provided' };
    }

    if (typeof data.roundId !== 'number' || data.roundId < 1) {
      return { valid: false, reason: 'Invalid round ID' };
    }

    if (!data.roastText || typeof data.roastText !== 'string') {
      return { valid: false, reason: 'Roast text is required' };
    }

    if (data.roastText.length < 10) {
      return { valid: false, reason: 'Roast must be at least 10 characters long' };
    }

    if (data.roastText.length > config.game.maxRoastLength) {
      return { valid: false, reason: `Roast must be less than ${config.game.maxRoastLength} characters` };
    }

    return { valid: true };
  }

  static validateLeaveRoundData(data) {
    if (!data) {
      return { valid: false, reason: 'No data provided' };
    }

    if (typeof data.roundId !== 'number' || data.roundId < 1) {
      return { valid: false, reason: 'Invalid round ID' };
    }

    return { valid: true };
  }

  static validateAuthenticationData(data) {
    if (!data) {
      return { valid: false, reason: 'No authentication data provided' };
    }

    if (!data.address || typeof data.address !== 'string') {
      return { valid: false, reason: 'Wallet address is required' };
    }

    // Basic address format validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(data.address)) {
      return { valid: false, reason: 'Invalid wallet address format' };
    }

    return { valid: true };
  }
}

// ================================
// WEBSOCKET EVENT UTILITIES
// ================================

class WSEventUtils {
  static getEventMetadata(eventName, data) {
    return {
      event: eventName,
      timestamp: new Date().toISOString(),
      dataSize: JSON.stringify(data).length,
      environment: config.server.env
    };
  }

  static logEventEmission(eventName, room, data, metadata = {}) {
    if (config.logging.testEnv) {
      logger.debug('WebSocket event emitted', {
        event: eventName,
        room,
        dataSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    }
  }

  static logEventReceived(eventName, socketId, data, metadata = {}) {
    if (config.logging.testEnv) {
      logger.debug('WebSocket event received', {
        event: eventName,
        socketId,
        dataSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    }
  }

  static createEventBatch(events) {
    return {
      batch: true,
      count: events.length,
      events,
      timestamp: new Date().toISOString()
    };
  }

  static sanitizeEventData(data) {
    // Remove sensitive information from event data
    const sanitized = { ...data };
    
    // Remove private keys, secrets, etc.
    const sensitiveFields = ['privateKey', 'secret', 'password', 'token'];
    sensitiveFields.forEach(field => {
      if (sanitized.hasOwnProperty(field)) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  static validateEventSize(data, maxSizeKB = 100) {
    const size = JSON.stringify(data).length;
    const maxSize = maxSizeKB * 1024; // Convert to bytes
    
    if (size > maxSize) {
      return {
        valid: false,
        reason: `Event data too large: ${size} bytes (max: ${maxSize} bytes)`,
        actualSize: size,
        maxSize
      };
    }

    return { valid: true, size };
  }

  static formatEventHistory(events, limit = 10) {
    return events
      .slice(-limit)
      .map(event => ({
        ...event,
        timestamp: new Date(event.timestamp).toISOString(),
        age: Date.now() - new Date(event.timestamp).getTime()
      }));
  }
}

// ================================
// EXPORTS
// ================================

module.exports = {
  WSEventTypes,
  WSEventFormatters,
  WSEventValidators,
  WSEventUtils
}; 