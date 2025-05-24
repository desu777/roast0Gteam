## 🏗️ **ARCHITEKTURA SYSTEMU**

### **📁 Struktura Projektu:**
```
roast-backend/
├── src/
│   ├── modules/                    # Feature modules (max 400 lines each)
│   │   ├── game/                   # Game logic & round management
│   │   │   ├── game.module.ts
│   │   │   ├── game.service.ts
│   │   │   ├── game.controller.ts
│   │   │   └── dto/
│   │   ├── players/                # Player management & authentication
│   │   │   ├── players.module.ts
│   │   │   ├── players.service.ts
│   │   │   └── dto/
│   │   ├── treasury/               # 0G payment processing
│   │   │   ├── treasury.module.ts
│   │   │   ├── treasury.service.ts
│   │   │   └── dto/
│   │   ├── ai/                     # Roast evaluation & reasoning
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.service.ts
│   │   │   └── ai.interfaces.ts
│   │   └── websocket/              # Real-time communication
│   │       ├── websocket.module.ts
│   │       ├── websocket.gateway.ts
│   │       └── events/
│   ├── database/
│   │   ├── models/                 # TypeScript interfaces
│   │   ├── migrations/             # Schema changes
│   │   ├── seeds/                  # Test data
│   │   └── database.service.ts
│   ├── services/                   # Shared business logic
│   │   ├── logger.service.ts
│   │   ├── validation.service.ts
│   │   └── crypto.service.ts
│   ├── utils/                      # Helper functions
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── config/                     # Configuration
│   │   ├── database.config.ts
│   │   ├── websocket.config.ts
│   │   └── app.config.ts
│   ├── guards/                     # Authentication & authorization
│   ├── interceptors/               # Logging & transformation
│   ├── pipes/                      # Validation pipes
│   └── main.ts                     # Application entry point
├── tests/                          # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/                         # Containerization
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                          # API documentation
├── scripts/                       # Deployment scripts
└── package.json
```

---

## 🗄️ **DATABASE SCHEMA**

### **SQLite Tables (better-sqlite3):**

```sql
-- Game rounds management
CREATE TABLE rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judge_character TEXT NOT NULL,           -- 'michael', 'ada', 'jc', 'elisha', 'ren'
    phase TEXT NOT NULL DEFAULT 'waiting',   -- 'waiting', 'active', 'judging', 'completed'
    prize_pool DECIMAL(10,8) DEFAULT 0,
    max_players INTEGER DEFAULT 20,
    timer_duration INTEGER DEFAULT 120,      -- seconds
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player submissions for each round
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    player_address TEXT NOT NULL,
    roast_text TEXT NOT NULL,
    entry_fee DECIMAL(10,8) DEFAULT 0.025,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id),
    UNIQUE(round_id, player_address)         -- One submission per player per round
);

-- Game results and winners
CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    winner_submission_id INTEGER NOT NULL,
    ai_reasoning TEXT NOT NULL,
    prize_amount DECIMAL(10,8) NOT NULL,
    transaction_hash TEXT,                   -- 0G blockchain transaction
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id),
    FOREIGN KEY (winner_submission_id) REFERENCES submissions(id)
);

-- Player statistics
CREATE TABLE player_stats (
    player_address TEXT PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_spent DECIMAL(10,8) DEFAULT 0,
    total_earned DECIMAL(10,8) DEFAULT 0,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rounds_phase ON rounds(phase);
CREATE INDEX idx_rounds_created_at ON rounds(created_at);
CREATE INDEX idx_submissions_round_id ON submissions(round_id);
CREATE INDEX idx_submissions_player ON submissions(player_address);
CREATE INDEX idx_results_round_id ON results(round_id);
```

---

## 🔌 **API ENDPOINTS**

### **REST API (NestJS Controllers):**

```typescript
// Game Management
GET    /api/game/current              // Current active round
GET    /api/game/rounds               // Recent rounds with pagination
POST   /api/game/rounds               // Create new round (admin)
GET    /api/game/rounds/:id           // Specific round details
GET    /api/game/stats                // Global game statistics

// Player Management  
GET    /api/players/profile/:address  // Player profile & stats
POST   /api/players/verify            // Verify wallet signature
GET    /api/players/leaderboard       // Top players by wins/earnings

// Treasury Operations
POST   /api/treasury/payment          // Process entry fee payment
GET    /api/treasury/balance/:address // Player 0G balance
POST   /api/treasury/withdraw         // Prize withdrawal

// AI Service
POST   /api/ai/evaluate               // Manual roast evaluation (admin)
GET    /api/ai/characters             // Character personalities & criteria
```

### **WebSocket Events (Socket.IO):**

```typescript
// Client → Server Events
interface ClientEvents {
  'join-round': (data: { roundId: number; signature: string }) => void;
  'submit-roast': (data: { roundId: number; roastText: string; paymentTx: string }) => void;
  'leave-round': (data: { roundId: number }) => void;
  'ping': () => void;
}

// Server → Client Events  
interface ServerEvents {
  'round-created': (data: RoundCreatedEvent) => void;
  'round-updated': (data: RoundUpdatedEvent) => void;
  'player-joined': (data: PlayerJoinedEvent) => void;
  'player-left': (data: PlayerLeftEvent) => void;
  'timer-update': (data: { roundId: number; timeLeft: number }) => void;
  'judging-started': (data: { roundId: number; character: string }) => void;
  'round-completed': (data: RoundCompletedEvent) => void;
  'prize-distributed': (data: PrizeDistributedEvent) => void;
  'error': (data: { message: string; code: string }) => void;
}

// Event Data Types
interface RoundCreatedEvent {
  roundId: number;
  judgeCharacter: string;
  prizePool: number;
  phase: 'waiting';
}

interface RoundUpdatedEvent {
  roundId: number;
  phase: 'waiting' | 'active' | 'judging' | 'completed';
  timeLeft?: number;
  playerCount: number;
  prizePool: number;
}

interface PlayerJoinedEvent {
  roundId: number;
  playerAddress: string;
  roastPreview: string; // First 60 chars
  playerCount: number;
  prizePool: number;
}

interface RoundCompletedEvent {
  roundId: number;
  winnerId: number;
  winnerAddress: string;
  winningRoast: string;
  aiReasoning: string;
  prizeAmount: number;
  character: string;
}
```

---

## 🎮 **GAME FLOW LOGIC**

### **Round Lifecycle:**

```typescript
enum GamePhase {
  WAITING = 'waiting',    // 0-1 players, waiting for 2nd player
  ACTIVE = 'active',      // 2+ players, 120s timer running  
  JUDGING = 'judging',    // AI evaluating submissions (15s)
  COMPLETED = 'completed' // Winner selected, prizes distributed
}

// Round Transitions
WAITING → ACTIVE      // When 2nd player joins
ACTIVE → JUDGING      // When timer expires OR max players reached
JUDGING → COMPLETED   // When AI finishes evaluation
COMPLETED → (new round) // Auto-start new round after 30s
```

### **AI Character System:**

```typescript
interface TeamCharacter {
  id: 'michael' | 'ada' | 'jc' | 'elisha' | 'ren';
  name: string;
  role: string;
  personality: string;
  decisionStyle: string;
  evaluationCriteria: {
    creativity: number;      // Weight 0-1
    technical: number;       // Weight 0-1  
    humor: number;          // Weight 0-1
    originality: number;    // Weight 0-1
    community: number;      // Weight 0-1
  };
}

// AI Evaluation Process
1. Parse all submissions for round
2. Apply character-specific criteria
3. Score each roast (0-100)
4. Generate character-appropriate reasoning
5. Select winner with highest score
6. Return result with explanation
```

---

## 💰 **0G CRYPTOCURRENCY INTEGRATION**

### **Payment Flow:**

```typescript
// Entry Fee Payment
1. Player connects wallet (MetaMask/WalletConnect)
2. Frontend signs transaction (0.025 0G)
3. Backend verifies transaction on 0G network  
4. Player added to round upon confirmation
5. Prize pool updated (+0.025 0G)

// Prize Distribution  
1. Round completes, winner selected
2. Backend calculates prize (pool * 0.95) // 5% house fee
3. Treasury service initiates 0G transfer
4. Winner receives payment automatically
5. Transaction hash recorded in database

// Treasury Security
- Multi-signature hot wallet for automated payments
- Cold storage for large fund reserves  
- Real-time balance monitoring
- Automatic withdrawal limits
- Transaction audit trail
```

---

## 📡 **WEBSOCKET REAL-TIME SYSTEM**

### **Socket.IO Room Management:**

```typescript
// Room Structure
`game:${roundId}` - All players in specific round
`global` - All connected users for announcements
`admin` - Administrative dashboard users

// Connection Flow
1. Client connects to WebSocket
2. Verify wallet signature  
3. Join 'global' room for announcements
4. Join specific game room when entering round
5. Receive real-time updates for round events

// Performance Optimizations
- Connection pooling with Redis adapter
- Message batching for high-frequency updates
- Client-side connection recovery
- Heartbeat monitoring (30s intervals)
- Automatic reconnection handling
```

---

## 🔒 **SECURITY & VALIDATION**

### **Authentication:**
```typescript
// Wallet-based Authentication
1. Client signs challenge message with private key
2. Backend verifies signature against public address
3. JWT token issued for session management
4. All API calls require valid JWT or signature

// Rate Limiting
- 10 requests/minute per IP for API endpoints
- 1 submission per round per wallet address
- Anti-spam protection for WebSocket events
- DDoS protection with nginx reverse proxy
```

### **Input Validation:**
```typescript
// Roast Text Validation
- Max 280 characters (Twitter-style)
- Profanity filter with customizable wordlist
- No HTML/script injection
- Unicode normalization
- Spam detection (repeated submissions)

// Payment Validation  
- Verify transaction on 0G blockchain
- Confirm exact amount (0.025 0G)
- Check transaction recency (<5 minutes)
- Prevent double-spending attacks
- Validate wallet balance before acceptance
```

---

## 📊 **PERFORMANCE & MONITORING**

### **Database Optimization:**
```sql
-- Performance Pragmas
PRAGMA journal_mode = WAL;        -- Better concurrency
PRAGMA synchronous = NORMAL;      -- Balanced durability/speed  
PRAGMA cache_size = 10000;        -- 10MB cache
PRAGMA temp_store = MEMORY;       -- Temp tables in RAM
PRAGMA mmap_size = 268435456;     -- 256MB memory mapping
```

### **Monitoring & Logging:**
```typescript
// Metrics Collection
- Game round completion rates
- Average round duration  
- Player retention statistics
- AI evaluation performance
- WebSocket connection health
- Database query performance
- 0G transaction success rates

// Error Handling
- Structured logging with Winston
- Error categorization (game/payment/technical)
- Automatic error reporting to Sentry
- Performance bottleneck detection
- Automated alerting for critical issues
```

---

## 🧪 **TESTING STRATEGY**

### **Test Coverage:**
```typescript
// Unit Tests (Jest)
- Game logic service methods
- AI evaluation algorithms  
- Payment processing functions
- Database model operations
- Utility function validation

// Integration Tests
- WebSocket event handling
- Database transaction integrity
- API endpoint responses
- 0G blockchain integration
- Real-time game flow scenarios

// E2E Tests (Playwright)
- Complete game round simulation
- Multi-player concurrent testing
- Payment flow end-to-end
- Error recovery scenarios
- Performance under load
```

---

## 🚀 **DEPLOYMENT & INFRASTRUCTURE**

### **Production Setup:**
```yaml
# Docker Compose Configuration
services:
  roast-backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/roast.db
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - roast-backend
```

### **CI/CD Pipeline:**
```yaml
# GitHub Actions Workflow
1. Code push to main branch
2. Run test suite (unit + integration)
3. Build Docker image
4. Deploy to staging environment  
5. Run E2E tests on staging
6. Deploy to production (manual approval)
7. Health check verification
8. Rollback capability if issues detected
```

---

## 📋 **DEVELOPMENT PHASES**

### **Phase 1: Core Backend (Week 1-2)**
- [x] NestJS project setup with TypeScript
- [x] better-sqlite3 database integration
- [x] Basic WebSocket gateway with Socket.IO
- [x] Game round management service
- [x] Player registration and authentication
- [x] Database schema and migrations

### **Phase 2: Real-time Features (Week 3)**
- [ ] Complete WebSocket event system
- [ ] Game timer synchronization
- [ ] Live player join/leave handling
- [ ] Real-time round updates broadcasting
- [ ] Error handling and connection recovery

### **Phase 3: AI & Payments (Week 4)**
- [ ] AI service for roast evaluation
- [ ] Character personality implementation
- [ ] 0G cryptocurrency integration
- [ ] Treasury system for payments
- [ ] Prize distribution automation

### **Phase 4: Production Ready (Week 5)**
- [ ] Comprehensive error handling
- [ ] Rate limiting and security hardening
- [ ] Performance optimization
- [ ] Monitoring and logging setup
- [ ] Documentation and deployment

---

## 🎯 **SUCCESS METRICS**

### **Performance Targets:**
- Round creation: <100ms response time
- WebSocket message latency: <50ms
- Database queries: <10ms average
- AI evaluation: <5s per round
- 99.9% uptime target
- Support 100+ concurrent players

### **Business Metrics:**
- Player retention rate >70%
- Average round completion time: 2-3 minutes  
- Daily active players growth
- Total 0G volume processed
- AI evaluation accuracy (community feedback)

---

## 🔧 **MAINTENANCE & UPDATES**

### **Regular Tasks:**
- Database VACUUM every week
- Log rotation and cleanup
- Security updates for dependencies
- Performance monitoring review
- Backup verification
- AI model refinement based on feedback

### **Scaling Considerations:**
- Horizontal scaling with Redis adapter
- Database sharding by time periods
- CDN for static assets  
- Load balancer for multiple instances
- Microservice separation if needed

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation Links:**
- [NestJS Official Docs](https://docs.nestjs.com/)
- [better-sqlite3 API Reference](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [0G Network Integration Guide](https://docs.0g.ai/)

### **Code Style & Standards:**
- ESLint + Prettier configuration
- Husky pre-commit hooks
- TypeScript strict mode
- Conventional commit messages
- Code review requirements

---

*Ostatnia aktualizacja: $(date)*
*Wersja dokumentu: 1.0*
