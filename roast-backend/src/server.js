const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { config, validateConfig } = require('./config/app.config');
const { logger, perfLogger } = require('./services/logger.service');
const database = require('./database/database.service');

// Import game module
const { GameService, GameController, createGameRoutes } = require('./modules/game');

// Create Express app
const app = express();
const server = http.createServer(app);

// Variables for services that will be initialized later
let gameService;
let gameController;

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    perfLogger.apiRequest(req.method, req.path, duration, res.statusCode);
  });
  
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.cors.frontendUrl],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  if (config.logging.testEnv) {
    logger.debug(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      ip: req.ip
    });
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = database.db ? 'connected' : 'disconnected';
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.env,
    database: dbStatus,
    uptime: process.uptime()
  });
});

// API version endpoint
app.get('/api', (req, res) => {
  res.json({
    name: '0G Roast Arena API',
    version: '1.0.0',
    endpoints: {
      game: '/api/game',
      players: '/api/players',
      treasury: '/api/treasury',
      ai: '/api/ai'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  const message = config.server.env === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    error: true,
    message: message,
    ...(config.server.env !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Resource not found'
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Cleanup game service timers
  if (gameService) {
    gameService.cleanup();
    logger.info('Game service cleaned up');
  }

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connection
  try {
    database.close();
    logger.info('Database connection closed');
  } catch (err) {
    logger.error('Error closing database:', err);
  }

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  process.exit(0);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise: promise,
    reason: reason
  });
});

// Start server
const startServer = async () => {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated successfully');

    // Initialize database
    database.initialize();
    logger.info('Database initialized successfully');

    // Initialize Game Module
    gameService = new GameService(); // No WebSocket emitter for now
    gameController = new GameController(gameService);
    
    // Mount game routes
    app.use('/api/game', createGameRoutes(gameController));
    
    logger.info('Game module initialized successfully');

    // TODO: Initialize other modules here
    // - WebSocket module (will pass to gameService later)
    // - Treasury module
    // - AI module

    // Start listening
    server.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 0G Roast Arena Backend running at http://${config.server.host}:${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`Database: ${config.database.path}`);
      
      if (config.logging.testEnv) {
        logger.info('Test environment logging enabled');
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = { app, server, gameService, gameController }; 