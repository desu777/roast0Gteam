const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import configuration and services
const { config } = require('./config/app.config');
const { logger } = require('./services/logger.service');
const MigrationRunner = require('./database/migrate');

// Import routes and controllers (will create these next)
// const battleRoutes = require('./routes/battle.routes');
// const { setupWebSocketEvents } = require('./websocket/battle.events');

class BattleServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: config.cors.origin,
        credentials: config.cors.credentials,
        methods: ['GET', 'POST']
      }
    });
    
    this.connectedUsers = new Map(); // Track connected users
    this.isShuttingDown = false;
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing Battle 1v1 Microservice...');

      // Run database migrations
      await this.runMigrations();

      // Setup Express middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup WebSocket events
      this.setupWebSocket();

      // Setup error handlers
      this.setupErrorHandlers();

      // Start server
      this.startServer();

      logger.info('✅ Battle 1v1 Microservice initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Battle 1v1 Microservice', { error: error.message });
      process.exit(1);
    }
  }

  async runMigrations() {
    try {
      logger.info('📦 Running database migrations...');
      const migrationRunner = new MigrationRunner();
      await migrationRunner.run();
      logger.info('✅ Database migrations completed');
    } catch (error) {
      logger.error('❌ Database migration failed', { error: error.message });
      throw error;
    }
  }

  setupMiddleware() {
    logger.info('🔧 Setting up middleware...');

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for WebSocket connections
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors(config.cors));

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    if (config.logging.testEnv) {
      this.app.use((req, res, next) => {
        const start = Date.now();
        
        logger.api.request(req.method, req.path, req.ip, req.get('User-Agent'));

        // Log response
        res.on('finish', () => {
          const duration = Date.now() - start;
          if (res.statusCode >= 400) {
            logger.api.error(req.method, req.path, res.statusCode, new Error(`Status ${res.statusCode}`));
          } else {
            logger.api.response(req.method, req.path, res.statusCode, duration);
          }
        });

        next();
      });
    }
  }

  setupRoutes() {
    logger.info('🛤️  Setting up routes...');

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        service: 'roast-battle-1v1',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        connectedUsers: this.connectedUsers.size
      });
    });

    // API routes
    this.app.use('/api/battle', (req, res) => {
      res.json({
        success: true,
        message: 'Battle 1v1 API - Routes will be implemented next',
        endpoints: {
          'GET /api/battle/current': 'Get current battle',
          'POST /api/battle/bet': 'Place a bet',
          'GET /api/battle/history': 'Get battle history',
          'GET /api/battle/stats/:address': 'Get player stats'
        }
      });
    });

    // Character data endpoints (for frontend)
    this.app.get('/api/characters/og', (req, res) => {
      try {
        const characters = require('../data/characters-0g.json');
        res.json({
          success: true,
          data: characters
        });
      } catch (error) {
        logger.error('Failed to load OG characters', { error: error.message });
        res.status(500).json({
          success: false,
          error: 'CHARACTERS_LOAD_FAILED',
          message: 'Failed to load character data'
        });
      }
    });

    this.app.get('/api/characters/roasters', (req, res) => {
      try {
        const roasters = require('../data/roasters.json');
        res.json({
          success: true,
          data: roasters
        });
      } catch (error) {
        logger.error('Failed to load roaster characters', { error: error.message });
        res.status(500).json({
          success: false,
          error: 'ROASTERS_LOAD_FAILED',
          message: 'Failed to load roaster data'
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Endpoint not found',
        service: 'roast-battle-1v1'
      });
    });
  }

  setupWebSocket() {
    logger.info('🔌 Setting up WebSocket events...');

    this.io.on('connection', (socket) => {
      logger.ws.connection(socket.id, socket.handshake.headers['user-agent']);

      // Store user connection
      this.connectedUsers.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        lastActivity: new Date(),
        userAgent: socket.handshake.headers['user-agent']
      });

      // Basic event handlers (will expand these)
      socket.on('join_battle_room', (data) => {
        logger.ws.event(socket.id, 'join_battle_room', data);
        socket.join('battle_room');
        socket.emit('joined_battle_room', {
          success: true,
          message: 'Joined battle room successfully',
          connectedUsers: this.connectedUsers.size
        });
      });

      socket.on('get_battle_status', () => {
        logger.ws.event(socket.id, 'get_battle_status', {});
        // TODO: Implement battle status logic
        socket.emit('battle_state', {
          status: 'waiting_bets',
          message: 'Battle system is initializing...',
          ogCharacter: null,
          roasterCharacter: null,
          bets: { og: 0, roaster: 0 },
          countdown: null
        });
      });

      socket.on('disconnect', (reason) => {
        logger.ws.disconnection(socket.id, reason);
        this.connectedUsers.delete(socket.id);
      });

      // Update last activity on any event
      socket.onAny(() => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.lastActivity = new Date();
        }
      });
    });

    // Broadcast connected users count every 30 seconds
    if (config.logging.testEnv) {
      setInterval(() => {
        this.io.emit('user_count_update', {
          connectedUsers: this.connectedUsers.size,
          timestamp: new Date().toISOString()
        });
      }, 30000);
    }
  }

  setupErrorHandlers() {
    logger.info('🛡️  Setting up error handlers...');

    // Express error handler
    this.app.use((err, req, res, next) => {
      logger.error('Express error handler', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: config.server.env === 'production' 
          ? 'Internal server error' 
          : err.message
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle termination signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, starting graceful shutdown...');
      this.gracefulShutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, starting graceful shutdown...');
      this.gracefulShutdown('SIGINT');
    });
  }

  startServer() {
    this.server.listen(config.server.port, () => {
      logger.info(`🎯 Battle 1v1 Microservice running on port ${config.server.port}`);
      logger.info(`🌐 Environment: ${config.server.env}`);
      logger.info(`📊 Logging: ${config.logging.testEnv ? 'ENABLED' : 'DISABLED'}`);
      logger.info(`🔗 Network: ${config.network.networkName} (${config.network.chainId})`);
      logger.info(`💰 Bet Amount: ${config.battle.betAmount} ${config.network.currencySymbol}`);
      logger.info(`⏱️  Countdown: ${config.battle.countdownDuration} seconds`);
      
      if (config.logging.testEnv) {
        logger.info('📋 Available endpoints:');
        logger.info('   • GET  /health - Health check');
        logger.info('   • GET  /api/characters/og - 0G team characters');
        logger.info('   • GET  /api/characters/roasters - Roaster characters');
        logger.info('   • WS   /socket.io - WebSocket connection');
      }
    });
  }

  async gracefulShutdown(signal) {
    if (this.isShuttingDown) {
      logger.warn('Graceful shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`🔄 Starting graceful shutdown due to ${signal}...`);

    try {
      // Close WebSocket connections
      logger.info('🔌 Closing WebSocket connections...');
      this.io.emit('server_shutdown', {
        message: 'Server is shutting down for maintenance',
        timestamp: new Date().toISOString()
      });
      
      // Give clients time to disconnect gracefully
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.io.close();

      // Close HTTP server
      logger.info('🌐 Closing HTTP server...');
      await new Promise((resolve, reject) => {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown', { error: error.message });
      process.exit(1);
    }
  }
}

// Initialize and start server
const battleServer = new BattleServer();
battleServer.initialize().catch((error) => {
  console.error('💥 Failed to start Battle 1v1 Microservice:', error.message);
  process.exit(1);
});

module.exports = BattleServer; 