const { Server } = require('socket.io');
const { config } = require('../../config/app.config');
const { logger, wsLogger } = require('../../services/logger.service');
const { 
  WS_EVENTS, 
  WS_ROOMS, 
  ERROR_CODES,
  REGEX,
  LIMITS 
} = require('../../utils/constants');
const { validateRoastContent } = require('../../utils/validators');

class WebSocketService {
  constructor(httpServer) {
    this.io = null;
    this.gameService = null;
    this.connectedUsers = new Map(); // socketId -> userInfo
    this.userSockets = new Map(); // userAddress -> Set of socketIds
    
    if (httpServer) {
      this.initialize(httpServer);
    }
  }

  // ================================
  // INITIALIZATION
  // ================================

  initialize(httpServer) {
    try {
      // Create Socket.IO server
      this.io = new Server(httpServer, {
        cors: {
          origin: config.cors.allowedOrigins,
          credentials: true,
          methods: ['GET', 'POST']
        },
        pingTimeout: config.websocket.pingTimeout,
        pingInterval: config.websocket.pingInterval,
        upgradeTimeout: config.websocket.upgradeTimeout,
        transports: ['websocket', 'polling'],
        allowEIO3: true
      });

      // Setup event handlers
      this.setupEventHandlers();
      
      if (config.logging.testEnv) {
        logger.info('WebSocket service initialized', {
          pingTimeout: config.websocket.pingTimeout,
          pingInterval: config.websocket.pingInterval
        });
      }

      return this;

    } catch (error) {
      logger.error('Failed to initialize WebSocket service:', error);
      throw error;
    }
  }

  // ================================
  // EVENT HANDLERS
  // ================================

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      wsLogger.connection(socket.id, socket.handshake.address);
      
      // Join global room by default
      socket.join(WS_ROOMS.GLOBAL);
      
      // Welcome message
      socket.emit(WS_EVENTS.ROUND_UPDATED, {
        message: 'Connected to 0G Roast Arena!'
      });

      // Handle authentication/user identification
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Handle join round
      socket.on(WS_EVENTS.JOIN_ROUND, (data) => {
        this.handleJoinRound(socket, data);
      });

      // Handle submit roast
      socket.on(WS_EVENTS.SUBMIT_ROAST, (data) => {
        this.handleSubmitRoast(socket, data);
      });

      // Handle leave round
      socket.on(WS_EVENTS.LEAVE_ROUND, (data) => {
        this.handleLeaveRound(socket, data);
      });

      // Handle ping/pong
      socket.on(WS_EVENTS.PING, () => {
        socket.emit(WS_EVENTS.PONG, { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // Error handling
      socket.on('error', (error) => {
        wsLogger.error('Socket error', error, socket.id);
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Connection error occurred',
          code: ERROR_CODES.WS_CONNECTION_FAILED
        });
      });
    });
  }

  // ================================
  // EVENT HANDLERS IMPLEMENTATION
  // ================================

  handleAuthentication(socket, data) {
    try {
      if (!data || !data.address || !REGEX.ETH_ADDRESS.test(data.address)) {
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Invalid wallet address',
          code: ERROR_CODES.VALIDATION_ERROR
        });
        return;
      }

      const userAddress = data.address.toLowerCase();
      
      // Store user info
      this.connectedUsers.set(socket.id, {
        address: userAddress,
        connectedAt: Date.now(),
        isAdmin: config.admin.addresses.includes(userAddress)
      });

      // Track user sockets
      if (!this.userSockets.has(userAddress)) {
        this.userSockets.set(userAddress, new Set());
      }
      this.userSockets.get(userAddress).add(socket.id);

      // Join admin room if admin
      if (config.admin.addresses.includes(userAddress)) {
        socket.join(WS_ROOMS.ADMIN);
        if (config.logging.testEnv) {
          logger.debug('Admin user authenticated', { address: userAddress });
        }
      }

      wsLogger.connection(socket.id, userAddress);

      socket.emit('authenticated', {
        success: true,
        address: userAddress,
        isAdmin: config.admin.addresses.includes(userAddress)
      });

    } catch (error) {
      wsLogger.error('Authentication error', error, socket.id);
      socket.emit(WS_EVENTS.ERROR, {
        message: 'Authentication failed',
        code: ERROR_CODES.UNAUTHORIZED
      });
    }
  }

  async handleJoinRound(socket, data) {
    try {
      const userInfo = this.connectedUsers.get(socket.id);
      if (!userInfo) {
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Please authenticate first',
          code: ERROR_CODES.UNAUTHORIZED
        });
        return;
      }

      if (!data || typeof data.roundId !== 'number') {
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Invalid round ID',
          code: ERROR_CODES.VALIDATION_ERROR
        });
        return;
      }

      const roundRoom = WS_ROOMS.ROUND(data.roundId);
      
      // Join round room
      socket.join(roundRoom);
      
      wsLogger.roomJoin(socket.id, roundRoom);

      if (config.logging.testEnv) {
        logger.debug('User joined round room', { 
          socketId: socket.id,
          address: userInfo.address,
          roundId: data.roundId 
        });
      }

      // Notify user
      socket.emit(WS_EVENTS.ROUND_UPDATED, {
        roundId: data.roundId,
        message: `Joined round ${data.roundId}`
      });

    } catch (error) {
      wsLogger.error('Join round error', error, socket.id, { data });
      socket.emit(WS_EVENTS.ERROR, {
        message: 'Failed to join round',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  async handleSubmitRoast(socket, data) {
    try {
      const userInfo = this.connectedUsers.get(socket.id);
      if (!userInfo) {
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Please authenticate first',
          code: ERROR_CODES.UNAUTHORIZED
        });
        return;
      }

      if (config.logging.testEnv) {
        logger.debug('Submit roast request', { 
          socketId: socket.id,
          address: userInfo.address,
          data: { ...data, roastText: data.roastText?.substring(0, 50) + '...' }
        });
      }

      // Validate input
      if (!data || typeof data.roundId !== 'number' || !data.roastText) {
        const errorMsg = 'Invalid submission data';
        if (config.logging.testEnv) {
          logger.warn('Submit roast validation failed - invalid data', { 
            hasData: !!data,
            roundIdType: typeof data?.roundId,
            hasRoastText: !!data?.roastText
          });
        }
        socket.emit(WS_EVENTS.ERROR, {
          message: errorMsg,
          code: ERROR_CODES.VALIDATION_ERROR
        });
        return;
      }

      // Validate roast content
      const contentValidation = validateRoastContent(data.roastText);
      if (!contentValidation.valid) {
        const errorMsg = contentValidation.errors?.join(', ') || 'Invalid roast content';
        if (config.logging.testEnv) {
          logger.warn('Submit roast validation failed - content', { 
            roastLength: data.roastText.length,
            errors: contentValidation.errors
          });
        }
        socket.emit(WS_EVENTS.ERROR, {
          message: errorMsg,
          code: ERROR_CODES.VALIDATION_ERROR
        });
        return;
      }

      // Forward to game service if available
      if (this.gameService) {
        if (config.logging.testEnv) {
          logger.debug('Forwarding to game service', { 
            address: userInfo.address,
            roundId: data.roundId,
            paymentTx: data.paymentTx
          });
        }

        const result = await this.gameService.joinRound(
          userInfo.address, 
          data.roastText, 
          data.paymentTx
        );

        if (result.success) {
          socket.emit('roast-submitted', {
            success: true,
            submissionId: result.submissionId,
            roundId: data.roundId
          });
        } else {
          if (config.logging.testEnv) {
            logger.warn('Game service rejected submission', { 
              error: result.error,
              message: result.message
            });
          }
          socket.emit(WS_EVENTS.ERROR, {
            message: result.message || result.error,
            code: result.error || ERROR_CODES.INTERNAL_ERROR
          });
        }
      } else {
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Game service not available',
          code: ERROR_CODES.INTERNAL_ERROR
        });
      }

    } catch (error) {
      wsLogger.error('Submit roast error', error, socket.id, { data });
      socket.emit(WS_EVENTS.ERROR, {
        message: 'Failed to submit roast',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  handleLeaveRound(socket, data) {
    try {
      const userInfo = this.connectedUsers.get(socket.id);
      if (!userInfo) {
        return;
      }

      if (!data || typeof data.roundId !== 'number') {
        socket.emit(WS_EVENTS.ERROR, {
          message: 'Invalid round ID',
          code: ERROR_CODES.VALIDATION_ERROR
        });
        return;
      }

      const roundRoom = WS_ROOMS.ROUND(data.roundId);
      
      // Leave round room
      socket.leave(roundRoom);
      
      if (config.logging.testEnv) {
        logger.debug('User left round room', { 
          socketId: socket.id,
          address: userInfo.address,
          roundRoom 
        });
      }

      // Emit player left event to round
      this.io.to(roundRoom).emit(WS_EVENTS.PLAYER_LEFT, {
        roundId: data.roundId,
        playerAddress: userInfo.address
      });

      socket.emit(WS_EVENTS.ROUND_UPDATED, {
        roundId: data.roundId,
        message: `Left round ${data.roundId}`
      });

    } catch (error) {
      wsLogger.error('Leave round error', error, socket.id, { data });
    }
  }

  handleDisconnection(socket, reason) {
    const userInfo = this.connectedUsers.get(socket.id);
    
    if (userInfo) {
      // Remove from user sockets tracking
      const userSockets = this.userSockets.get(userInfo.address);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(userInfo.address);
        }
      }

      wsLogger.disconnection(socket.id, reason);
    }

    // Clean up user info
    this.connectedUsers.delete(socket.id);

    if (config.logging.testEnv) {
      logger.debug('User disconnected', { socketId: socket.id, reason });
    }
  }

  // ================================
  // PUBLIC METHODS FOR GAME SERVICE
  // ================================

  setGameService(gameService) {
    this.gameService = gameService;
    if (config.logging.testEnv) {
      logger.info('Game service connected to WebSocket');
    }
  }

  // Method to be used by Game Service as wsEmitter
  to(room) {
    return this.io ? this.io.to(room) : { emit: () => {} };
  }

  emit(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getUsersByAddress(address) {
    return this.userSockets.get(address.toLowerCase()) || new Set();
  }

  isUserConnected(address) {
    return this.userSockets.has(address.toLowerCase());
  }

  disconnectUser(address, reason = 'Disconnected by admin') {
    const userSockets = this.getUsersByAddress(address);
    userSockets.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(WS_EVENTS.ERROR, {
          message: reason,
          code: ERROR_CODES.FORBIDDEN
        });
        socket.disconnect(true);
      }
    });
  }

  // ================================
  // CLEANUP
  // ================================

  cleanup() {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    
    this.connectedUsers.clear();
    this.userSockets.clear();
    
    if (config.logging.testEnv) {
      logger.info('WebSocket service cleanup completed');
    }
  }
}

module.exports = WebSocketService; 