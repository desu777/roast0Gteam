const { logger } = require('../services/logger.service');
const battleService = require('../services/battle.service');
const treasuryService = require('../services/treasury.service');
const { config } = require('../config/app.config');

class WebSocketEvents {
  constructor(io) {
    this.io = io;
    this.battleRoom = 'battle_room';
    this.adminRoom = 'admin_room';
  }

  setupEvents() {
    // Setup battle service event listeners
    this.setupBattleListeners();
    
    // Setup socket connection handlers
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
    
    logger.info('WebSocket events initialized');
  }

  // Setup battle service event listeners
  setupBattleListeners() {
    // Battle created
    battleService.on('battle:created', (data) => {
      this.io.to(this.battleRoom).emit('battle_created', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Bet placed
    battleService.on('bet:placed', (data) => {
      this.io.to(this.battleRoom).emit('bet_placed', {
        battleId: data.battleId,
        playerAddress: data.playerAddress,
        betSide: data.betSide,
        betAmount: data.betAmount,
        battleState: data.battleState,
        timestamp: new Date().toISOString()
      });
    });

    // Bet confirmed
    battleService.on('bet:confirmed', (data) => {
      this.io.to(this.battleRoom).emit('bet_confirmed', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Countdown started
    battleService.on('countdown:started', (data) => {
      this.io.to(this.battleRoom).emit('countdown_started', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Countdown update
    battleService.on('countdown:update', (data) => {
      this.io.to(this.battleRoom).emit('countdown_tick', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Countdown complete
    battleService.on('countdown:complete', (data) => {
      this.io.to(this.battleRoom).emit('countdown_complete', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Battle generating
    battleService.on('battle:generating', (data) => {
      this.io.to(this.battleRoom).emit('battle_generating', {
        ...data,
        message: 'AI is creating an epic roast battle...',
        timestamp: new Date().toISOString()
      });
    });

    // Dialog ready
    battleService.on('dialog:ready', (data) => {
      this.io.to(this.battleRoom).emit('dialog_ready', {
        battleId: data.battleId,
        totalExchanges: data.dialog.exchanges.length,
        timestamp: new Date().toISOString()
      });
    });

    // Dialog exchange
    battleService.on('dialog:exchange', (data) => {
      this.io.to(this.battleRoom).emit('dialog_exchange', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Dialog complete
    battleService.on('dialog:complete', (data) => {
      this.io.to(this.battleRoom).emit('dialog_complete', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Battle complete
    battleService.on('battle:complete', (data) => {
      this.io.to(this.battleRoom).emit('battle_complete', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Battle error
    battleService.on('battle:error', (data) => {
      this.io.to(this.battleRoom).emit('battle_error', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Battle cancelled
    battleService.on('battle:cancelled', (data) => {
      this.io.to(this.battleRoom).emit('battle_cancelled', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Handle socket connection
  handleConnection(socket) {
    logger.ws.connection(socket.id, socket.handshake.headers['user-agent']);

    // Join battle room
    socket.on('join_battle_room', async (data) => {
      try {
        logger.ws.event(socket.id, 'join_battle_room', data);
        
        socket.join(this.battleRoom);
        
        // Get current battle state
        const battleState = battleService.getBattleState();
        
        socket.emit('joined_battle_room', {
          success: true,
          message: 'Joined battle room successfully',
          battleState,
          connectedUsers: this.io.sockets.sockets.size
        });
        
        // Send current battle state
        if (battleState) {
          socket.emit('battle_state', battleState);
        }
      } catch (error) {
        logger.error('Failed to join battle room', { error: error.message });
        socket.emit('error', {
          event: 'join_battle_room',
          error: error.message
        });
      }
    });

    // Leave battle room
    socket.on('leave_battle_room', () => {
      logger.ws.event(socket.id, 'leave_battle_room', {});
      socket.leave(this.battleRoom);
      socket.emit('left_battle_room', {
        success: true
      });
    });

    // Get battle status
    socket.on('get_battle_status', async () => {
      try {
        logger.ws.event(socket.id, 'get_battle_status', {});
        
        const battleState = battleService.getBattleState();
        
        socket.emit('battle_state', battleState || {
          status: 'no_active_battle',
          message: 'No active battle. New battle will start soon!'
        });
      } catch (error) {
        logger.error('Failed to get battle status', { error: error.message });
        socket.emit('error', {
          event: 'get_battle_status',
          error: error.message
        });
      }
    });

    // Place bet
    socket.on('place_bet', async (data) => {
      try {
        logger.ws.event(socket.id, 'place_bet', data);
        
        const { playerAddress, betSide, betAmount, txHash } = data;
        
        // Validate input
        if (!playerAddress || !betSide || !betAmount || !txHash) {
          throw new Error('Missing required fields');
        }
        
        if (!['og', 'roaster'].includes(betSide)) {
          throw new Error('Invalid bet side');
        }
        
        // Verify payment (if treasury is initialized)
        if (treasuryService.isInitialized) {
          const isValid = await treasuryService.verifyBetPayment(
            txHash,
            betAmount,
            playerAddress
          );
          
          if (!isValid) {
            throw new Error('Invalid payment transaction');
          }
        }
        
        // Place bet
        const battleState = await battleService.placeBet(
          playerAddress,
          betSide,
          betAmount,
          txHash
        );
        
        // Confirm bet
        await battleService.confirmBet(txHash);
        
        socket.emit('bet_placed_success', {
          success: true,
          battleState,
          message: `Bet placed on ${betSide} side!`
        });
        
      } catch (error) {
        logger.error('Failed to place bet', { error: error.message });
        
        let errorMessage = error.message;
        if (error.message === 'ALREADY_BET') {
          errorMessage = 'You have already placed a bet on this battle';
        } else if (error.message === 'BETTING_CLOSED') {
          errorMessage = 'Betting is closed for this battle';
        } else if (error.message === 'NO_ACTIVE_BATTLE') {
          errorMessage = 'No active battle to bet on';
        }
        
        socket.emit('bet_placed_error', {
          success: false,
          error: errorMessage
        });
      }
    });

    // Get battle history
    socket.on('get_battle_history', async (data) => {
      try {
        logger.ws.event(socket.id, 'get_battle_history', data);
        
        const limit = data?.limit || config.battle.historyDefaultLimit;
        const offset = data?.offset || 0;
        
        const history = await battleService.getBattleHistory(limit, offset);
        
        socket.emit('battle_history', {
          success: true,
          history,
          limit,
          offset
        });
      } catch (error) {
        logger.error('Failed to get battle history', { error: error.message });
        socket.emit('error', {
          event: 'get_battle_history',
          error: error.message
        });
      }
    });

    // Get player stats
    socket.on('get_player_stats', async (data) => {
      try {
        logger.ws.event(socket.id, 'get_player_stats', data);
        
        const { playerAddress } = data;
        
        if (!playerAddress) {
          throw new Error('Player address required');
        }
        
        const stats = await battleService.getPlayerStats(playerAddress);
        
        socket.emit('player_stats', {
          success: true,
          stats
        });
      } catch (error) {
        logger.error('Failed to get player stats', { error: error.message });
        socket.emit('error', {
          event: 'get_player_stats',
          error: error.message
        });
      }
    });

    // Get leaderboard
    socket.on('get_leaderboard', async (data) => {
      try {
        logger.ws.event(socket.id, 'get_leaderboard', data);
        
        const limit = data?.limit || config.battle.leaderboardDefaultLimit;
        const leaderboard = await battleService.getLeaderboard(limit);
        
        socket.emit('leaderboard', {
          success: true,
          leaderboard,
          limit
        });
      } catch (error) {
        logger.error('Failed to get leaderboard', { error: error.message });
        socket.emit('error', {
          event: 'get_leaderboard',
          error: error.message
        });
      }
    });

    // Admin events
    socket.on('admin_auth', async (data) => {
      try {
        const { adminKey } = data;
        
        if (adminKey === config.admin.key) {
          socket.join(this.adminRoom);
          socket.emit('admin_auth_success', {
            success: true,
            message: 'Admin authenticated'
          });
          
          // Send treasury stats
          const treasuryStats = await treasuryService.getTreasuryStats();
          socket.emit('treasury_stats', treasuryStats);
        } else {
          throw new Error('Invalid admin key');
        }
      } catch (error) {
        socket.emit('admin_auth_error', {
          success: false,
          error: 'Authentication failed'
        });
      }
    });

    // Force start countdown (admin)
    socket.on('admin_force_start', async (data) => {
      try {
        if (!socket.rooms.has(this.adminRoom)) {
          throw new Error('Unauthorized');
        }
        
        await battleService.startCountdown();
        
        socket.emit('admin_action_success', {
          action: 'force_start',
          success: true
        });
      } catch (error) {
        socket.emit('admin_action_error', {
          action: 'force_start',
          error: error.message
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.ws.disconnection(socket.id, reason);
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString()
      });
    });
  }

  // Broadcast to all clients in battle room
  broadcastToBattleRoom(event, data) {
    this.io.to(this.battleRoom).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Get room statistics
  getRoomStats() {
    const battleRoomSockets = this.io.sockets.adapter.rooms.get(this.battleRoom);
    const adminRoomSockets = this.io.sockets.adapter.rooms.get(this.adminRoom);
    
    return {
      totalConnected: this.io.sockets.sockets.size,
      battleRoom: battleRoomSockets ? battleRoomSockets.size : 0,
      adminRoom: adminRoomSockets ? adminRoomSockets.size : 0
    };
  }
}

// Export setup function
module.exports = {
  setupWebSocketEvents: (io) => {
    const wsEvents = new WebSocketEvents(io);
    wsEvents.setupEvents();
    return wsEvents;
  }
};