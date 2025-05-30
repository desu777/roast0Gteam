const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { config } = require('../config/app.config');

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Only log if TEST_ENV is true when in test environment
    if (config.server.env === 'test' && !config.logging.testEnv) {
      return '';
    }
    
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [];

// Console transport (always enabled for development)
if (config.server.env === 'development' || config.logging.testEnv) {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat
    })
  );
}

// File transport (always enabled)
transports.push(
  new winston.transports.File({
    filename: config.logging.file,
    level: config.logging.level,
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  })
);

// Error-specific file transport
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
    tailable: true
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
  // Handle uncaught exceptions and unhandled rejections more safely
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
      handleExceptions: true
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
      handleRejections: true
    })
  ],
  exitOnError: false
});

// Prevent "write after end" errors by wrapping logger methods
const originalMethods = {
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger)
};

// Safe logging wrapper
const safeLog = (originalMethod, level) => {
  return function(message, meta = {}) {
    try {
      // Only log if TEST_ENV is true when in test environment
      if (config.server.env === 'test' && !config.logging.testEnv) {
        return;
      }
      
      // Check if we're not in shutdown state
      if (!process.exitCode && originalMethod) {
        originalMethod.call(this, message, meta);
      }
    } catch (error) {
      // Fallback to console if logger fails
      if (config.server.env === 'development' || config.logging.testEnv) {
        console.log(`[${level.toUpperCase()}] ${message}`, meta);
      }
    }
  };
};

// Replace logger methods with safe versions
logger.error = safeLog(originalMethods.error, 'error');
logger.warn = safeLog(originalMethods.warn, 'warn');
logger.info = safeLog(originalMethods.info, 'info');
logger.debug = safeLog(originalMethods.debug, 'debug');

// Graceful shutdown handling
let shutdownInProgress = false;

const gracefulShutdown = () => {
  if (!shutdownInProgress) {
    shutdownInProgress = true;
    console.log('Shutting down logger gracefully...');
    
    try {
      logger.end();
    } catch (error) {
      console.log('Logger shutdown error:', error.message);
    }
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
};

// Handle process termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGQUIT', gracefulShutdown);

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Enhanced logging methods with context
const createContextLogger = (context) => {
  return {
    error: (message, meta = {}) => logger.error(message, { context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),
    verbose: (message, meta = {}) => logger.verbose(message, { context, ...meta })
  };
};

// Game-specific logging methods
const gameLogger = {
  roundCreated: (roundId, character) => 
    logger.info('Round created', { 
      event: 'round_created', 
      roundId, 
      character, 
      timestamp: new Date().toISOString() 
    }),

  playerJoined: (roundId, playerAddress, playerCount) => 
    logger.info('Player joined round', { 
      event: 'player_joined', 
      roundId, 
      playerAddress, 
      playerCount, 
      timestamp: new Date().toISOString() 
    }),

  roundCompleted: (roundId, winnerId, winnerAddress, prizeAmount) => 
    logger.info('Round completed', { 
      event: 'round_completed', 
      roundId, 
      winnerId, 
      winnerAddress, 
      prizeAmount, 
      timestamp: new Date().toISOString() 
    }),

  paymentProcessed: (playerAddress, amount, transactionHash) => 
    logger.info('Payment processed', { 
      event: 'payment_processed', 
      playerAddress, 
      amount, 
      transactionHash, 
      timestamp: new Date().toISOString() 
    }),

  aiEvaluation: (roundId, character, submissionCount, duration) => 
    logger.info('AI evaluation completed', { 
      event: 'ai_evaluation', 
      roundId, 
      character, 
      submissionCount, 
      duration, 
      timestamp: new Date().toISOString() 
    }),

  error: (event, error, meta = {}) => 
    logger.error(`Game error: ${event}`, { 
      event: 'game_error', 
      error: error.message, 
      stack: error.stack, 
      ...meta, 
      timestamp: new Date().toISOString() 
    })
};

// WebSocket logging methods
const wsLogger = {
  connection: (socketId, playerAddress) => 
    logger.info('WebSocket connection', { 
      event: 'ws_connection', 
      socketId, 
      playerAddress, 
      timestamp: new Date().toISOString() 
    }),

  disconnection: (socketId, reason) => 
    logger.info('WebSocket disconnection', { 
      event: 'ws_disconnection', 
      socketId, 
      reason, 
      timestamp: new Date().toISOString() 
    }),

  roomJoin: (socketId, room) => 
    logger.debug('Socket joined room', { 
      event: 'ws_room_join', 
      socketId, 
      room, 
      timestamp: new Date().toISOString() 
    }),

  error: (event, error, socketId, meta = {}) => 
    logger.error(`WebSocket error: ${event}`, { 
      event: 'ws_error', 
      error: error.message, 
      socketId, 
      ...meta, 
      timestamp: new Date().toISOString() 
    })
};

// Performance monitoring
const perfLogger = {
  apiRequest: (method, endpoint, duration, statusCode) => 
    logger.info('API request', { 
      event: 'api_request', 
      method, 
      endpoint, 
      duration, 
      statusCode, 
      timestamp: new Date().toISOString() 
    }),

  dbQuery: (query, duration, params = {}) => 
    logger.debug('Database query', { 
      event: 'db_query', 
      query: query.substring(0, 100), // Truncate long queries
      duration, 
      params, 
      timestamp: new Date().toISOString() 
    }),

  slowQuery: (query, duration, params = {}) => 
    logger.warn('Slow database query', { 
      event: 'slow_db_query', 
      query, 
      duration, 
      params, 
      timestamp: new Date().toISOString() 
    })
};

module.exports = {
  logger,
  createContextLogger,
  gameLogger,
  wsLogger,
  perfLogger
}; 