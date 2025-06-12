const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { config } = require('../config/app.config');

// Ensure logs directory exists
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for console logging
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ' ' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

// Custom format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [];

// Console transport (always enabled in development)
if (config.server.env === 'development' || config.logging.testEnv) {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat
    })
  );
}

// File transport (production or when file logging is enabled)
if (config.server.env === 'production' || config.logging.testEnv) {
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      level: config.logging.level,
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  transports,
  exitOnError: false,
  // Only log if TEST_ENV is true or in production
  silent: !config.logging.testEnv && config.server.env !== 'production'
});

// Add battle-specific logging methods
logger.battle = {
  created: (battleId, ogChar, roasterChar) => {
    if (config.logging.testEnv) {
      logger.info('Battle created', { 
        battleId, 
        ogCharacter: ogChar, 
        roasterCharacter: roasterChar,
        event: 'battle_created'
      });
    }
  },

  betPlaced: (battleId, playerAddress, side, amount) => {
    if (config.logging.testEnv) {
      logger.info('Bet placed', { 
        battleId, 
        playerAddress: playerAddress.slice(0, 6) + '...' + playerAddress.slice(-4),
        side, 
        amount,
        event: 'bet_placed'
      });
    }
  },

  countdownStarted: (battleId, duration) => {
    if (config.logging.testEnv) {
      logger.info('Countdown started', { 
        battleId, 
        duration,
        event: 'countdown_started'
      });
    }
  },

  dialogGenerated: (battleId, exchanges, winner) => {
    if (config.logging.testEnv) {
      logger.info('Dialog generated', { 
        battleId, 
        exchanges: exchanges.length, 
        winner,
        event: 'dialog_generated'
      });
    }
  },

  payoutProcessed: (battleId, winnersCount, totalAmount) => {
    if (config.logging.testEnv) {
      logger.info('Payout processed', { 
        battleId, 
        winnersCount, 
        totalAmount,
        event: 'payout_processed'
      });
    }
  },

  error: (operation, error, meta = {}) => {
    if (config.logging.testEnv) {
      logger.error(`Battle ${operation} failed`, { 
        error: error.message, 
        stack: error.stack,
        ...meta,
        event: 'battle_error'
      });
    }
  }
};

// WebSocket logging
logger.ws = {
  connection: (socketId, userAgent) => {
    if (config.logging.testEnv) {
      logger.debug('WebSocket connected', { 
        socketId: socketId.slice(0, 8) + '...', 
        userAgent,
        event: 'ws_connection'
      });
    }
  },

  disconnection: (socketId, reason) => {
    if (config.logging.testEnv) {
      logger.debug('WebSocket disconnected', { 
        socketId: socketId.slice(0, 8) + '...', 
        reason,
        event: 'ws_disconnection'
      });
    }
  },

  event: (socketId, eventName, data) => {
    if (config.logging.testEnv) {
      logger.debug('WebSocket event', { 
        socketId: socketId.slice(0, 8) + '...', 
        eventName,
        dataKeys: Object.keys(data || {}),
        event: 'ws_event'
      });
    }
  }
};

// API logging
logger.api = {
  request: (method, path, ip, userAgent) => {
    if (config.logging.testEnv) {
      logger.debug('API request', { 
        method, 
        path, 
        ip,
        userAgent,
        event: 'api_request'
      });
    }
  },

  response: (method, path, statusCode, responseTime) => {
    if (config.logging.testEnv) {
      logger.debug('API response', { 
        method, 
        path, 
        statusCode, 
        responseTime: `${responseTime}ms`,
        event: 'api_response'
      });
    }
  },

  error: (method, path, statusCode, error) => {
    if (config.logging.testEnv) {
      logger.error('API error', { 
        method, 
        path, 
        statusCode, 
        error: error.message,
        event: 'api_error'
      });
    }
  }
};

module.exports = { logger }; 