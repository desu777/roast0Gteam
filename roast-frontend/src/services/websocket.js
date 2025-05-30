import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.userAddress = null;
  }

  // Połącz z serwerem WebSocket
  connect(userAddress = null) {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    
    this.userAddress = userAddress;
    
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventHandlers();

    return this.socket;
  }

  // Uwierzytelnienie użytkownika
  authenticate(address) {
    if (this.socket && this.isConnected) {
      console.log('🔐 Authenticating WebSocket with address:', address);
      this.socket.emit('authenticate', { address });
    } else {
      console.warn('⚠️ Cannot authenticate - WebSocket not connected');
    }
  }

  // Konfiguracja podstawowych event handlerów
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection-status', { connected: true });
      
      if (this.userAddress) {
        this.authenticate(this.userAddress);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection-status', { connected: false, reason });
      
      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      this.handleReconnect();
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
      this.emit('authenticated', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Game events
    this.socket.on('round-created', (data) => {
      this.emit('round-created', data);
    });

    this.socket.on('round-updated', (data) => {
      this.emit('round-updated', data);
    });

    this.socket.on('player-joined', (data) => {
      this.emit('player-joined', data);
    });

    this.socket.on('player-left', (data) => {
      this.emit('player-left', data);
    });

    this.socket.on('timer-update', (data) => {
      this.emit('timer-update', data);
    });

    this.socket.on('judging-started', (data) => {
      this.emit('judging-started', data);
    });

    this.socket.on('round-completed', (data) => {
      this.emit('round-completed', data);
    });

    this.socket.on('prize-distributed', (data) => {
      this.emit('prize-distributed', data);
    });

    this.socket.on('roast-submitted', (data) => {
      this.emit('roast-submitted', data);
    });

    // Voting events - Live System
    this.socket.on('voting-update', (data) => {
      this.emit('voting-update', data);
    });

    this.socket.on('vote-cast-success', (data) => {
      this.emit('vote-cast-success', data);
    });

    this.socket.on('voting-locked', (data) => {
      this.emit('voting-locked', data);
    });

    this.socket.on('voting-reset', (data) => {
      this.emit('voting-reset', data);
    });

    // Submission locking events
    this.socket.on('submission-locked', (data) => {
      this.emit('submission-locked', data);
    });
  }

  // Obsługa ponownego łączenia
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.socket.connect();
        }
      }, delay);
    }
  }

  // Dołącz do rundy
  joinRound(roundId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-round', { roundId });
    }
  }

  // Opuść rundę
  leaveRound(roundId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-round', { roundId });
    }
  }

  // Wyślij roast
  submitRoast(roundId, roastText, paymentTx) {
    if (this.socket && this.isConnected) {
      console.log('📤 Submitting roast via WebSocket:', { roundId, roastText: roastText.substring(0, 50) + '...', paymentTx });
      this.socket.emit('submit-roast', {
        roundId,
        roastText,
        paymentTx
      });
    } else {
      console.error('❌ Cannot submit roast - WebSocket not connected');
    }
  }

  // Ping serwera
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Cast vote for next judge
  castVote(roundId, characterId) {
    if (this.socket && this.isConnected) {
      console.log('📤 Casting vote via WebSocket:', { roundId, characterId });
      this.socket.emit('cast-vote', {
        roundId,
        characterId
      });
    } else {
      console.error('❌ Cannot cast vote - WebSocket not connected');
    }
  }

  // Dodaj listener dla eventu
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Usuń listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Emit event do listenerów
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  // Rozłącz
  disconnect() {
    if (this.socket) {
      // Usuń wszystkie event listenery socket.io
      this.socket.off('connect');
      this.socket.off('disconnect');
      this.socket.off('authenticated');
      this.socket.off('error');
      
      // Game events
      this.socket.off('round-created');
      this.socket.off('round-updated');
      this.socket.off('player-joined');
      this.socket.off('player-left');
      this.socket.off('timer-update');
      this.socket.off('judging-started');
      this.socket.off('round-completed');
      this.socket.off('prize-distributed');
      this.socket.off('roast-submitted');
      
      // Voting events cleanup
      this.socket.off('voting-update');
      this.socket.off('vote-cast-success');
      this.socket.off('voting-locked');
      this.socket.off('voting-reset');
      this.socket.off('submission-locked');
      
      // Complete cleanup
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      this.reconnectAttempts = 0;
      this.userAddress = null;
      
      console.log('🔌 WebSocket disconnected and cleaned up');
    }
  }

  // Sprawdź status połączenia
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socket: !!this.socket,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Singleton instance
export const wsService = new WebSocketService();
export default wsService; 