# 🏗️ PM2 Cluster Mode + Redis + WebSocket Synchronization

## 📋 Przegląd Rozwiązania

To rozwiązanie umożliwia uruchomienie aplikacji w trybie cluster PM2 z pełną synchronizacją timerów WebSocket przez Redis.

### 🎯 Główne Komponenty:
- **PM2 Cluster Mode**: Wiele instancji Node.js
- **Redis**: Centralna synchronizacja stanu
- **Socket.IO Redis Adapter**: Komunikacja między instancjami WebSocket
- **Timer Synchronization**: Zsynchronizowane timery między procesami

---

## 📋 Krok 1: Przygotowanie Środowiska

### Instalacja Redis na VPS
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server -y

# Konfiguracja Redis
sudo nano /etc/redis/redis.conf

# Znajdź i zmień:
# bind 127.0.0.1 ::1
# uncomment następną linię jeśli chcesz remote access (ostrożnie!)
# bind 0.0.0.0

# Dla bezpieczeństwa zostaw domyślnie:
bind 127.0.0.1

# Ustaw hasło (zalecane)
requirepass your-strong-redis-password

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo systemctl status redis-server

# Test połączenia
redis-cli
AUTH your-strong-redis-password
ping  # Powinno odpowiedzieć: PONG
exit
```

### Instalacja Dependencies
```bash
# W folderze projektu
npm install @socket.io/redis-adapter redis ioredis

# Opcjonalnie dla monitoringu
npm install redis-info
```

---

## 📋 Krok 2: Rozszerz Konfigurację

### Dodaj Redis do `app.config.js`
```javascript
// src/config/app.config.js

const config = {
  // ... istniejąca konfiguracja

  // Redis Configuration (NOWE)
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true' || process.env.NODE_ENV === 'production',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'roast:',
    
    // Connection settings
    connectTimeout: 10000,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    
    // Cluster settings (jeśli używasz Redis Cluster)
    enableOfflineQueue: false,
    
    // WebSocket adapter settings
    adapter: {
      key: 'socket.io',
      requestsTimeout: 5000
    }
  },

  // WebSocket Configuration (ROZSZERZONE)
  websocket: {
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT) || 30000,
    pingInterval: parseInt(process.env.WS_PING_INTERVAL) || 25000,
    upgradeTimeout: parseInt(process.env.WS_UPGRADE_TIMEOUT) || 10000,
    
    // Cluster-specific settings (NOWE)
    enableStickySession: process.env.WS_STICKY_SESSION === 'true',
    redisAdapter: process.env.WS_REDIS_ADAPTER === 'true' || process.env.NODE_ENV === 'production'
  },

  // ... reszta konfiguracji
};
```

### Aktualizuj `.env`
```env
# Redis Configuration
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your-strong-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX=roast:

# WebSocket Cluster Settings
WS_REDIS_ADAPTER=true
WS_STICKY_SESSION=true
```

---

## 📋 Krok 3: Utwórz Redis Service

### `src/services/redis.service.js`
```javascript
const Redis = require('ioredis');
const { config } = require('../config/app.config');
const { logger } = require('./logger.service');

class RedisService {
  constructor() {
    this.client = null;
    this.pubClient = null;
    this.subClient = null;
    this.isConnected = false;
  }

  // ================================
  // INITIALIZATION
  // ================================

  async initialize() {
    if (!config.redis.enabled) {
      logger.info('Redis disabled, skipping initialization');
      return this;
    }

    try {
      const redisConfig = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix,
        connectTimeout: config.redis.connectTimeout,
        lazyConnect: config.redis.lazyConnect,
        maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        retryDelayOnFailover: config.redis.retryDelayOnFailover,
        enableOfflineQueue: config.redis.enableOfflineQueue
      };

      // Main client for general operations
      this.client = new Redis(redisConfig);

      // Dedicated clients for Socket.IO adapter
      this.pubClient = new Redis(redisConfig);
      this.subClient = new Redis(redisConfig);

      // Setup event handlers
      this.setupEventHandlers();

      // Connect all clients
      await Promise.all([
        this.client.connect(),
        this.pubClient.connect(),
        this.subClient.connect()
      ]);

      this.isConnected = true;
      logger.info('Redis service initialized successfully', {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db
      });

      return this;

    } catch (error) {
      logger.error('Failed to initialize Redis service:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    const clients = [this.client, this.pubClient, this.subClient];
    
    clients.forEach((client, index) => {
      const clientName = ['main', 'pub', 'sub'][index];
      
      client.on('connect', () => {
        logger.debug(`Redis ${clientName} client connected`);
      });

      client.on('ready', () => {
        logger.debug(`Redis ${clientName} client ready`);
      });

      client.on('error', (error) => {
        logger.error(`Redis ${clientName} client error:`, error);
      });

      client.on('close', () => {
        logger.warn(`Redis ${clientName} client connection closed`);
        this.isConnected = false;
      });

      client.on('reconnecting', () => {
        logger.info(`Redis ${clientName} client reconnecting...`);
      });
    });
  }

  // ================================
  // TIMER SYNCHRONIZATION METHODS
  // ================================

  async setTimer(roundId, timerData) {
    if (!this.isConnected) return false;

    try {
      const key = `timer:${roundId}`;
      const data = JSON.stringify({
        ...timerData,
        updatedAt: Date.now(),
        processId: process.pid
      });

      await this.client.setex(key, timerData.duration + 60, data); // +60s buffer
      
      // Publish timer update to all instances
      await this.pubClient.publish('timer:update', JSON.stringify({
        roundId,
        action: 'set',
        data: timerData
      }));

      return true;
    } catch (error) {
      logger.error('Failed to set timer in Redis:', error);
      return false;
    }
  }

  async getTimer(roundId) {
    if (!this.isConnected) return null;

    try {
      const key = `timer:${roundId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get timer from Redis:', error);
      return null;
    }
  }

  async deleteTimer(roundId) {
    if (!this.isConnected) return false;

    try {
      const key = `timer:${roundId}`;
      await this.client.del(key);
      
      // Publish timer deletion to all instances
      await this.pubClient.publish('timer:update', JSON.stringify({
        roundId,
        action: 'delete'
      }));

      return true;
    } catch (error) {
      logger.error('Failed to delete timer from Redis:', error);
      return false;
    }
  }

  // ================================
  // WEBSOCKET SYNCHRONIZATION
  // ================================

  async setUserSession(socketId, userInfo) {
    if (!this.isConnected) return false;

    try {
      const key = `session:${socketId}`;
      await this.client.setex(key, 3600, JSON.stringify(userInfo)); // 1h TTL
      return true;
    } catch (error) {
      logger.error('Failed to set user session:', error);
      return false;
    }
  }

  async getUserSession(socketId) {
    if (!this.isConnected) return null;

    try {
      const key = `session:${socketId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get user session:', error);
      return null;
    }
  }

  async deleteUserSession(socketId) {
    if (!this.isConnected) return false;

    try {
      const key = `session:${socketId}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Failed to delete user session:', error);
      return false;
    }
  }

  // ================================
  // SOCKET.IO ADAPTER CLIENTS
  // ================================

  getAdapterClients() {
    return {
      pubClient: this.pubClient,
      subClient: this.subClient
    };
  }

  // ================================
  // HEALTH CHECK
  // ================================

  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected', redis: false };
    }

    try {
      const ping = await this.client.ping();
      const info = await this.client.info('memory');
      
      return {
        status: 'connected',
        redis: true,
        ping: ping === 'PONG',
        memory: this.parseRedisInfo(info)
      };
    } catch (error) {
      return {
        status: 'error',
        redis: false,
        error: error.message
      };
    }
  }

  parseRedisInfo(infoString) {
    const lines = infoString.split('\r\n');
    const info = {};
    
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          info[key] = value;
        }
      }
    });

    return {
      used_memory_human: info.used_memory_human,
      used_memory_peak_human: info.used_memory_peak_human,
      connected_clients: info.connected_clients
    };
  }

  // ================================
  // CLEANUP
  // ================================

  async cleanup() {
    if (this.client) await this.client.quit();
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
    
    this.isConnected = false;
    logger.info('Redis service cleanup completed');
  }
}

// Singleton instance
const redisService = new RedisService();

module.exports = {
  RedisService,
  redisService
};
```

---

## 📋 Krok 4: Zmodyfikuj WebSocket Service

### Aktualizuj `src/modules/websocket/websocket.service.js`
```javascript
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { config } = require('../../config/app.config');
const { logger, wsLogger } = require('../../services/logger.service');
const { redisService } = require('../../services/redis.service');

class WebSocketService {
  constructor(httpServer) {
    this.io = null;
    this.gameService = null;
    this.votingService = null;
    this.connectedUsers = new Map();
    this.userSockets = new Map();
    
    if (httpServer) {
      this.initialize(httpServer);
    }
  }

  // ================================
  // INITIALIZATION
  // ================================

  async initialize(httpServer) {
    try {
      const socketConfig = {
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
      };

      // Add Redis adapter for cluster mode
      if (config.websocket.redisAdapter && redisService.isConnected) {
        const { pubClient, subClient } = redisService.getAdapterClients();
        
        socketConfig.adapter = createAdapter(pubClient, subClient, {
          key: config.redis.adapter.key,
          requestsTimeout: config.redis.adapter.requestsTimeout
        });

        logger.info('Socket.IO Redis adapter enabled for cluster mode');
      }

      // Create Socket.IO server
      this.io = new Server(httpServer, socketConfig);

      // Setup event handlers
      this.setupEventHandlers();
      
      // Setup Redis timer synchronization
      this.setupRedisTimerSync();
      
      if (config.logging.testEnv) {
        logger.info('WebSocket service initialized', {
          pingTimeout: config.websocket.pingTimeout,
          pingInterval: config.websocket.pingInterval,
          redisAdapter: config.websocket.redisAdapter
        });
      }

      return this;

    } catch (error) {
      logger.error('Failed to initialize WebSocket service:', error);
      throw error;
    }
  }

  // ================================
  // REDIS TIMER SYNCHRONIZATION
  // ================================

  setupRedisTimerSync() {
    if (!redisService.isConnected) return;

    // Subscribe to timer updates from other instances
    const { subClient } = redisService.getAdapterClients();
    
    subClient.subscribe('timer:update');
    subClient.on('message', (channel, message) => {
      if (channel === 'timer:update') {
        try {
          const timerUpdate = JSON.parse(message);
          this.handleRedisTimerUpdate(timerUpdate);
        } catch (error) {
          logger.error('Failed to parse Redis timer update:', error);
        }
      }
    });

    logger.info('Redis timer synchronization setup completed');
  }

  handleRedisTimerUpdate(timerUpdate) {
    const { roundId, action, data } = timerUpdate;
    
    // Don't process updates from the same process
    if (data && data.processId === process.pid) return;

    switch (action) {
      case 'set':
        // Timer started on another instance
        if (this.gameService) {
          this.gameService.syncTimerFromRedis(roundId, data);
        }
        break;
        
      case 'delete':
        // Timer stopped on another instance
        if (this.gameService) {
          this.gameService.clearTimerFromRedis(roundId);
        }
        break;
        
      case 'update':
        // Timer tick update from another instance
        this.emitTimerUpdateToRoom(roundId, data);
        break;
    }

    if (config.logging.testEnv) {
      logger.debug('Processed Redis timer update', { roundId, action });
    }
  }

  emitTimerUpdateToRoom(roundId, timerData) {
    this.io.to(`game:${roundId}`).emit('timer-update', {
      roundId,
      timeLeft: timerData.timeLeft,
      serverTimestamp: Date.now(),
      phase: timerData.timeLeft > 0 ? 'active' : 'completing'
    });
  }

  // ================================
  // ENHANCED SESSION MANAGEMENT
  // ================================

  async handleAuthentication(socket, data) {
    try {
      // ... existing authentication logic

      // Store session in Redis for cluster sync
      if (redisService.isConnected) {
        await redisService.setUserSession(socket.id, {
          address: userAddress,
          isAdmin: isAdmin,
          connectedAt: Date.now(),
          lastSeen: Date.now()
        });
      }

      // ... rest of authentication logic

    } catch (error) {
      logger.error('Authentication error:', error);
      socket.emit('error', {
        message: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  }

  async handleDisconnection(socket, reason) {
    const userInfo = this.connectedUsers.get(socket.id);
    
    if (userInfo) {
      // Clean up Redis session
      if (redisService.isConnected) {
        await redisService.deleteUserSession(socket.id);
      }

      // ... existing cleanup logic
    }

    // ... rest of disconnection logic
  }

  // ================================
  // REST OF EXISTING METHODS
  // ================================
  // ... wszystkie pozostałe metody bez zmian

}

module.exports = { WebSocketService };
```

---

## 📋 Krok 5: Zmodyfikuj Timer Manager

### Aktualizuj `src/modules/game/components/TimerManager.js`
```javascript
const { config } = require('../../../config/app.config');
const { logger } = require('../../../services/logger.service');
const { redisService } = require('../../../services/redis.service');

class TimerManager {
  constructor(eventEmitter = null) {
    this.eventEmitter = eventEmitter;
    this.activeTimers = new Map();
    this.lockTimers = new Map();
    this.autoStartTimer = null;
    
    // Redis sync setup
    this.setupRedisSync();
  }

  // ================================
  // REDIS SYNCHRONIZATION
  // ================================

  setupRedisSync() {
    if (!redisService.isConnected) return;

    // Check for existing timers on startup
    this.loadExistingTimers();
  }

  async loadExistingTimers() {
    if (!redisService.isConnected) return;

    try {
      // Load all active timers from Redis
      const keys = await redisService.client.keys('roast:timer:*');
      
      for (const key of keys) {
        const roundId = key.replace('roast:timer:', '');
        const timerData = await redisService.getTimer(roundId);
        
        if (timerData) {
          const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
          const timeLeft = Math.max(0, timerData.duration - elapsed);
          
          if (timeLeft > 0) {
            // Resume timer
            this.resumeTimerFromRedis(roundId, timeLeft, timerData);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load existing timers from Redis:', error);
    }
  }

  // ================================
  // ENHANCED TIMER METHODS
  // ================================

  async startTimer(roundId, durationSeconds, onComplete) {
    // Clear any existing timer for this round
    this.clearTimer(roundId);

    let timeLeft = durationSeconds;
    const startTime = Date.now();
    
    // Store in Redis for cluster sync
    if (redisService.isConnected) {
      await redisService.setTimer(roundId, {
        duration: durationSeconds,
        startTime: startTime,
        timeLeft: timeLeft,
        processId: process.pid
      });
    }
    
    const timer = setInterval(async () => {
      timeLeft--;

      // Update Redis every tick for cross-instance sync
      if (redisService.isConnected && timeLeft % 5 === 0) { // Every 5 seconds to reduce load
        await redisService.setTimer(roundId, {
          duration: durationSeconds,
          startTime: startTime,
          timeLeft: timeLeft,
          processId: process.pid
        });
      }

      // Emit timer update
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(roundId, 'timer-update', {
          roundId,
          timeLeft,
          serverTimestamp: Date.now(),
          phase: timeLeft > 0 ? 'active' : 'completing'
        });
      }

      // Warning at 30 seconds
      if (timeLeft === 30) {
        if (this.eventEmitter) {
          this.eventEmitter.emitToRoom(roundId, 'round-updated', {
            roundId,
            message: 'Only 30 seconds left!'
          });
        }
      }

      // Time's up
      if (timeLeft <= 0) {
        this.clearTimer(roundId);
        
        // Clean up Redis
        if (redisService.isConnected) {
          await redisService.deleteTimer(roundId);
        }
        
        if (onComplete) {
          onComplete(roundId);
        }
      }

    }, 1000);

    // Store timer info
    this.activeTimers.set(roundId, {
      timer,
      startTime,
      duration: durationSeconds,
      timeLeft
    });

    if (config.logging.testEnv) {
      logger.debug('Timer started with Redis sync', { roundId, duration: durationSeconds });
    }

    return timer;
  }

  resumeTimerFromRedis(roundId, timeLeft, redisData) {
    if (timeLeft <= 0) return null;

    const timer = setInterval(async () => {
      timeLeft--;

      // Emit timer update
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(roundId, 'timer-update', {
          roundId,
          timeLeft,
          serverTimestamp: Date.now(),
          phase: timeLeft > 0 ? 'active' : 'completing'
        });
      }

      // Time's up
      if (timeLeft <= 0) {
        this.clearTimer(roundId);
        
        // Clean up Redis
        if (redisService.isConnected) {
          await redisService.deleteTimer(roundId);
        }
      }

    }, 1000);

    // Store timer info
    this.activeTimers.set(roundId, {
      timer,
      startTime: redisData.startTime,
      duration: redisData.duration,
      timeLeft
    });

    logger.info('Timer resumed from Redis', { roundId, timeLeft });
    return timer;
  }

  // Metody do synchronizacji z Redis (wywoływane przez WebSocket service)
  syncTimerFromRedis(roundId, timerData) {
    // Synchronizuj timer z innej instancji
    const existing = this.activeTimers.get(roundId);
    if (!existing) {
      // Uruchom timer na tej instancji
      const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
      const timeLeft = Math.max(0, timerData.duration - elapsed);
      this.resumeTimerFromRedis(roundId, timeLeft, timerData);
    }
  }

  clearTimerFromRedis(roundId) {
    // Wyczyść timer na polecenie z Redis
    this.clearTimer(roundId);
  }

  // ================================
  // EXISTING METHODS (bez zmian)
  // ================================
  
  clearTimer(roundId) {
    const timerInfo = this.activeTimers.get(roundId);
    if (timerInfo) {
      clearInterval(timerInfo.timer);
      this.activeTimers.delete(roundId);
    }
  }

  // ... reszta istniejących metod bez zmian
}

module.exports = TimerManager;
```

---

## 📋 Krok 6: Aktualizuj Server.js

### Zmodyfikuj `src/server.js`
```javascript
// ... existing imports
const { redisService } = require('./services/redis.service');

const startServer = async () => {
  try {
    // 1. Validate configuration
    validateConfig();
    
    // 2. Initialize database
    await database.initialize();
    logger.info('Database initialized');

    // 3. Initialize Redis (NOWE)
    await redisService.initialize();
    
    // 4. Initialize services
    treasuryService = new TreasuryService();
    await treasuryService.initialize();
    
    // ... reszta bez zmian

    // Enhanced graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          
          // Cleanup services
          if (wsService) wsService.cleanup();
          if (gameService) gameService.cleanup();
          if (redisService) await redisService.cleanup(); // NOWE
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        });
      }
    };

    // ... reszta bez zmian

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

---

## 📋 Krok 7: Nowy Ecosystem Config

### `ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'roast-backend',
    script: 'src/server.js',
    instances: 2,                    // ← Cluster mode z Redis
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      
      // Redis config
      REDIS_ENABLED: 'true',
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'your-strong-redis-password',
      REDIS_DB: '0',
      REDIS_KEY_PREFIX: 'roast:',
      
      // WebSocket cluster config
      WS_REDIS_ADAPTER: 'true',
      WS_STICKY_SESSION: 'true'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data'],
    
    // Cluster-specific settings
    restart_delay: 2000,             // Opóźnienie restart dla Redis sync
    max_restarts: 5,
    min_uptime: '15s'                // Dłuższy czas dla Redis connection
  }]
};
```

---

## 🚀 Deployment

```bash
# 1. Zatrzymaj aplikację
pm2 stop roast-backend
pm2 delete roast-backend

# 2. Zainstaluj nowe dependencies
npm install @socket.io/redis-adapter redis ioredis

# 3. Sprawdź Redis
redis-cli ping

# 4. Uruchom nową konfigurację
pm2 start ecosystem.config.js

# 5. Monitoruj logi
pm2 logs roast-backend --lines 100 | grep -i "redis\|cluster\|timer"

# 6. Test WebSocket
curl -v http://localhost:3001/socket.io/

# 7. Zapisz konfigurację
pm2 save
```

---

## 🔍 Monitoring Cluster Mode

### Test Script
```bash
# Sprawdź czy wszystkie instancje działają
pm2 status

# Monitor Redis connections
redis-cli info clients

# Test timer synchronization
curl -X POST http://localhost:3001/api/game/start-round
# Sprawdź logi z obu instancji
pm2 logs roast-backend --lines 50

# Sprawdź Redis keys
redis-cli
AUTH your-strong-redis-password
KEYS roast:*
exit
```

### Health Check Endpoint
```bash
# Test health check z Redis info
curl http://localhost:3001/health

# Powinno zwrócić:
{
  "status": "healthy",
  "redis": {
    "status": "connected",
    "ping": true,
    "memory": {
      "used_memory_human": "1.23M",
      "connected_clients": "4"
    }
  }
}
```

---

## 🎯 Zalety Rozwiązania

### ✅ Co Zyskujesz:
- **Wysoką Dostępność**: Jedna instancja może upaść, druga pracuje
- **Lepszą Wydajność**: Load balancing między procesami
- **Synchronizację Timerów**: Wszystkie instancje mają ten sam stan
- **Skalowanie**: Łatwo dodać więcej instancji
- **Monitoring**: Redis daje wgląd w stan aplikacji

### ⚠️ Uwagi:
- **Wyższa Kompleksowość**: Więcej komponentów do zarządzania
- **Redis Dependency**: Aplikacja zależy od Redis
- **Wyższe Zużycie RAM**: Redis + wiele instancji Node.js
- **Debugowanie**: Trudniejsze śledzenie problemów

---

## 🚨 Troubleshooting

### Problem: Redis Connection Failed
```bash
# Sprawdź status Redis
sudo systemctl status redis-server

# Sprawdź logi Redis
sudo tail -f /var/log/redis/redis-server.log

# Test manualny
redis-cli
AUTH your-password
ping
```

### Problem: Timer Desync
```bash
# Sprawdź Redis keys
redis-cli
AUTH your-password
KEYS roast:timer:*
GET roast:timer:1

# Sprawdź logi PM2
pm2 logs roast-backend | grep -i timer
```

### Problem: WebSocket Issues
```bash
# Test Socket.IO adapter
redis-cli
AUTH your-password
MONITOR
# W drugiej konsoli: curl http://localhost:3001/socket.io/
```

---

**To rozwiązanie zapewnia pełną synchronizację timerów i WebSocket w trybie cluster!** 🚀
