import { io } from 'socket.io-client';

/**
 * BattleWebSocketService - Dedicated WebSocket for OneVSone Battle System
 * Connects to port 3002 (battle backend) separate from main game
 */
class BattleWebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.battleRoomJoined = false;
  }

  // Connect to battle WebSocket server
  connect() {
    const BATTLE_WS_URL = import.meta.env.VITE_BATTLE_WS_URL || 'http://localhost:3002';
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🎯 Connecting to Battle WebSocket:', BATTLE_WS_URL);
    }
    
    this.socket = io(BATTLE_WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  // Setup core WebSocket event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Battle WebSocket connected');
      }
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Auto-join battle room
      this.joinBattleRoom();
      
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Battle WebSocket disconnected:', reason);
      }
      this.isConnected = false;
      this.battleRoomJoined = false;
      this.emit('connection-status', { connected: false, reason });
      
      // Auto-reconnect logic
      if (reason !== 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('🎯 Battle WebSocket error:', error);
      }
      this.emit('error', error);
    });

    // Battle room events
    this.socket.on('joined_battle_room', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Joined battle room:', data);
      }
      this.battleRoomJoined = true;
      this.emit('joined_battle_room', data);
    });

    // Battle state events
    this.socket.on('battle_state', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎮 Battle state update:', data);
      }
      this.emit('battle_state', data);
    });

    this.socket.on('battle_created', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🆕 Battle created:', data);
      }
      this.emit('battle_created', data);
    });

    // Betting events
    this.socket.on('bet_placed', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💰 Bet placed:', data);
      }
      this.emit('bet_placed', data);
    });

    this.socket.on('bet_confirmed', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('✅ Bet confirmed:', data);
      }
      this.emit('bet_confirmed', data);
    });

    // Countdown events
    this.socket.on('countdown_started', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('⏰ Countdown started:', data);
      }
      this.emit('countdown_started', data);
    });

    this.socket.on('countdown_tick', (data) => {
      this.emit('countdown_tick', data);
    });

    this.socket.on('countdown_complete', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏁 Countdown complete:', data);
      }
      this.emit('countdown_complete', data);
    });

    // Battle progress events
    this.socket.on('battle_generating', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🤖 Battle generating:', data);
      }
      this.emit('battle_generating', data);
    });

    this.socket.on('dialog_ready', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💬 Dialog ready:', data);
      }
      this.emit('dialog_ready', data);
    });

    this.socket.on('dialog_exchange', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💬 Dialog exchange:', data);
      }
      this.emit('dialog_exchange', data);
    });

    this.socket.on('dialog_complete', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💬 Dialog complete:', data);
      }
      this.emit('dialog_complete', data);
    });

    // Battle completion events
    this.socket.on('battle_complete', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 Battle complete:', data);
      }
      this.emit('battle_complete', data);
    });

    this.socket.on('battle_error', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('❌ Battle error:', data);
      }
      this.emit('battle_error', data);
    });

    this.socket.on('battle_cancelled', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('❌ Battle cancelled:', data);
      }
      this.emit('battle_cancelled', data);
    });
  }

  // Auto-reconnect logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('🎯 Battle WebSocket max reconnect attempts reached');
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`🎯 Battle WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    }

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  // Join battle room
  joinBattleRoom() {
    if (this.socket && this.isConnected && !this.battleRoomJoined) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Joining battle room...');
      }
      this.socket.emit('join_battle_room', {});
    }
  }

  // Leave battle room
  leaveBattleRoom() {
    if (this.socket && this.isConnected && this.battleRoomJoined) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Leaving battle room...');
      }
      this.socket.emit('leave_battle_room', {});
      this.battleRoomJoined = false;
    }
  }

  // Get current battle status
  getBattleStatus() {
    if (this.socket && this.isConnected) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Requesting battle status...');
      }
      this.socket.emit('get_battle_status', {});
    }
  }

  // Place bet via WebSocket (alternative to API)
  placeBet(playerAddress, betSide, betAmount, txHash) {
    if (this.socket && this.isConnected) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Placing bet via WebSocket:', { betSide, betAmount });
      }
      this.socket.emit('place_bet', {
        playerAddress,
        betSide,
        betAmount,
        txHash
      });
    } else {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('🎯 Cannot place bet - WebSocket not connected');
      }
    }
  }

  // Get battle history
  getBattleHistory(limit = 1000000, offset = 0) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_battle_history', { limit, offset });
    }
  }

  // Get player stats
  getPlayerStats(playerAddress) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_player_stats', { playerAddress });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    // Prevent duplicate callbacks
    const callbacks = this.listeners.get(event);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callback) {
        // Remove specific callback
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        // Remove all callbacks for this event
        this.listeners.set(event, []);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.error('🎯 Error in battle WebSocket callback:', error);
          }
        }
      });
    }
  }

  // Cleanup and disconnect
  disconnect() {
    if (this.socket) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Disconnecting Battle WebSocket...');
      }
      
      this.leaveBattleRoom();
      
      // Remove all event listeners
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.battleRoomJoined = false;
      this.listeners.clear();
      this.reconnectAttempts = 0;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      battleRoomJoined: this.battleRoomJoined,
      socket: !!this.socket,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Singleton instance for battle WebSocket
export const battleWebSocket = new BattleWebSocketService();
export default battleWebSocket; 