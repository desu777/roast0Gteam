# 🎮 0G Roast Arena - Complete Documentation

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [For Users](#for-users)
3. [For Developers](#for-developers)
4. [API Reference](#api-reference)
5. [System Architecture](#system-architecture)
6. [Deployment Guide](#deployment-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🌟 Project Overview

### What is 0G Roast Arena?

**0G Roast Arena** is an AI-powered, real-time roast battle game built on the 0G Network blockchain. Players compete in rounds by writing creative roasts about 0G team members, with AI judges evaluating submissions and distributing cryptocurrency prizes.

### Key Features

- **🤖 AI-Powered Judging**: 8 unique AI characters with distinct personalities judge your roasts
- **💰 Crypto Rewards**: Win 0G tokens for the best roasts (95% of entry fees to winners)
- **⚡ Real-Time**: Live WebSocket-based gameplay with instant updates
- **🏆 Daily Hall of Fame**: Daily rewards system for top performers across 4 categories
- **🗳️ Community Voting**: Vote for the next AI judge character
- **📊 Rich Statistics**: Comprehensive player stats, leaderboards, and analytics

### Game Economics

- **Entry Fee**: 0.025 0G per round
- **Prize Distribution**: 95% to winner, 5% house fee
- **Daily Rewards**: 4% of daily fees distributed to top players
- **Treasury Management**: 1% for operations, automated payouts

---

## 👤 For Users

### How to Play

#### 1. **Connect Your Wallet**
- Support for MetaMask and WalletConnect
- Must have 0G tokens for entry fees
- Connect to 0G Network (Chain ID: 16601)

#### 2. **Join a Round**
- Pay 0.025 0G entry fee
- Wait for other players (min 2, max 20)
- Round starts automatically when ready

#### 3. **Submit Your Roast**
- Write a creative roast (10-280 characters)
- Focus on 0G team members mentioned in the prompt
- Submit before the 120-second timer ends

#### 4. **AI Judging**
- One of 8 AI characters judges your submission
- Each character has unique evaluation criteria
- Results announced in ~15 seconds

#### 5. **Win Prizes**
- Winner takes 95% of the prize pool
- Automatic payouts to your wallet
- Track your stats and climb leaderboards

### AI Judge Characters

#### 🤴 **Michael** - CEO & Visionary
- **Personality**: Strategic, business-focused, professional
- **Likes**: Vision, creativity, strategic thinking
- **Evaluation Focus**: 25% creativity, 25% originality, 20% humor

#### 🎨 **Ada** - CMO & Dreamer
- **Personality**: Optimistic, community-focused, inspiring
- **Likes**: Unity, bridge-building humor, creativity
- **Evaluation Focus**: 30% creativity, 20% community, 20% humor

#### 🚀 **JC** - Head of Growth
- **Personality**: Rebellious, growth-oriented, meme-savvy
- **Likes**: Revolutionary content, provocative humor
- **Evaluation Focus**: 25% humor, 25% originality, 20% technical

#### 🌍 **Elisha** - Community Voice
- **Personality**: Friendly, educational, storytelling
- **Likes**: Accessible humor, educational content
- **Evaluation Focus**: 30% community, 20% creativity, 20% humor

#### ⚙️ **Ren** - CTO & Tech Monk
- **Personality**: Technical, calm, precision-focused
- **Likes**: Technical elegance, sophisticated wit
- **Evaluation Focus**: 35% technical, 25% originality, 15% creativity

#### 🎉 **Yon** - Community Champion
- **Personality**: Energetic, meme-master, community-building
- **Likes**: Community humor, meme potential
- **Evaluation Focus**: 30% humor, 25% creativity, 20% community

#### 🫧 **Zer0** - DeFAI Oracle
- **Personality**: Sweet but sharp, dreamy yet precise
- **Likes**: Elegant duality, bubble/floating wordplay
- **Evaluation Focus**: 40% humor, 30% creativity, 20% technical

#### ⚖️ **DAO Agent** - Governance Justice
- **Personality**: Fair, merit-focused, anti-freeloader
- **Likes**: Contribution-based humor, fairness themes
- **Evaluation Focus**: 25% technical, 25% originality, 20% creativity

### Daily Hall of Fame System

Every day at midnight UTC, the top players in 4 categories receive rewards from the daily fee pool:

#### 🏆 **Categories & Rewards**
- **Top Earners**: Players who earned most 0G (1st: 12%, 2nd: 8%, 3rd: 5%)
- **Most Wins**: Players with most round victories (1st: 12%, 2nd: 8%, 3rd: 5%)
- **Best Win Rate**: Highest win percentage (min 3 games, 2 wins) (1st: 12%, 2nd: 8%, 3rd: 5%)
- **Most Active**: Players with most games played (1st: 12%, 2nd: 8%, 3rd: 5%)

#### 📋 **Qualification Requirements**
- Minimum 3 games played per day
- Best Win Rate: minimum 2 wins required
- Only 1 reward per wallet address per day
- Rewards distributed automatically via smart contract

### Player Statistics

#### 📊 **Profile Metrics**
- **Total Games**: Number of rounds participated
- **Total Wins**: Rounds won
- **Win Rate**: Percentage of games won
- **Total Earned**: 0G tokens won from prizes
- **Total Spent**: 0G tokens paid in entry fees
- **Net Profit**: Earnings minus spending
- **Recent Games**: Last 10 submissions with details
- **Recent Wins**: Last 10 victories with prize amounts

#### 🥇 **Leaderboards**
- **Global Rankings**: Top players by various metrics
- **Hall of Fame**: Multi-category leaderboards
- **Daily Champions**: Yesterday's reward winners
- **Win Streaks**: Longest consecutive victories
- **All-Time Stats**: Historical performance data

### Community Features

#### 🗳️ **Judge Voting**
- Vote for next round's AI judge
- Community-driven character selection
- Tie-breaker system for fair results
- Real-time voting updates

#### 💬 **Real-Time Experience**
- Live round updates via WebSocket
- See players joining/leaving
- Timer synchronization
- Instant result notifications

---

## 💻 For Developers

### Technology Stack

#### **Backend Framework**
- **Node.js** 18+ with Express.js
- **WebSocket**: Socket.IO for real-time communication
- **Database**: SQLite with better-sqlite3 for performance
- **Blockchain**: ethers.js for 0G Network integration

#### **AI Integration**
- **OpenRouter API**: Multiple AI model support
- **Character System**: 8 unique AI personalities
- **Evaluation Engine**: Multi-criteria roast scoring
- **Fallback System**: Redundancy for AI failures

#### **Security & Performance**
- **JWT Authentication**: Wallet signature verification
- **Rate Limiting**: DDoS protection and spam prevention
- **Input Validation**: Joi schemas for all endpoints
- **Logging**: Winston with structured logging
- **Error Handling**: Comprehensive error management

### Project Structure

```
roast-backend/
├── src/
│   ├── modules/                    # Feature modules
│   │   ├── game/                   # Game logic & rounds
│   │   │   ├── components/         # Modular components
│   │   │   │   ├── GameOrchestrator.js    # Main coordinator
│   │   │   │   ├── RoundManager.js        # Round lifecycle
│   │   │   │   ├── TimerManager.js        # Timer handling
│   │   │   │   ├── SubmissionManager.js   # Player submissions
│   │   │   │   └── GameEventEmitter.js    # WebSocket events
│   │   │   ├── game.service.js     # Main game service
│   │   │   ├── game.controller.js  # HTTP endpoints
│   │   │   └── game.routes.js      # Route definitions
│   │   ├── ai/                     # AI evaluation system
│   │   │   ├── ai.service.js       # Main AI service
│   │   │   ├── character.service.js # Character management
│   │   │   ├── openrouter.service.js # AI API integration
│   │   │   └── characters.json     # Character definitions
│   │   ├── treasury/               # 0G payments & payouts
│   │   │   ├── treasury.service.js # Blockchain integration
│   │   │   ├── treasury.controller.js # Payment endpoints
│   │   │   └── treasury.routes.js  # Treasury routes
│   │   ├── players/                # Player management
│   │   │   ├── players.service.js  # Player operations
│   │   │   ├── halloffame.service.js # Daily rewards
│   │   │   ├── players.controller.js # Player endpoints
│   │   │   └── players.routes.js   # Player routes
│   │   ├── voting/                 # Judge voting system
│   │   │   ├── voting.service.js   # Voting logic
│   │   │   ├── voting.controller.js # Voting endpoints
│   │   │   └── voting.routes.js    # Voting routes
│   │   └── websocket/              # Real-time communication
│   │       ├── websocket.service.js # Socket.IO management
│   │       └── websocket.events.js # Event definitions
│   ├── database/                   # Database layer
│   │   ├── database.service.js     # DB operations
│   │   └── migrations/             # Schema migrations
│   ├── config/                     # Configuration
│   │   └── app.config.js           # Main config file
│   ├── services/                   # Shared services
│   │   ├── logger.service.js       # Winston logging
│   │   └── validation.service.js   # Input validation
│   ├── utils/                      # Utilities
│   │   ├── constants.js            # App constants
│   │   ├── formatters.js           # Data formatters
│   │   └── validators.js           # Validation helpers
│   └── server.js                   # Application entry point
├── scripts/                        # Automation scripts
│   ├── daily-rewards.js            # Daily rewards distribution
│   └── test-daily-rewards.js       # Testing script
├── data/                           # Database files
├── logs/                           # Application logs
└── docs/                           # Documentation
```

### Database Schema

#### **Core Tables**

```sql
-- Game rounds
CREATE TABLE rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judge_character TEXT NOT NULL,
    phase TEXT NOT NULL DEFAULT 'waiting',
    prize_pool DECIMAL(10,8) DEFAULT 0,
    max_players INTEGER DEFAULT 20,
    timer_duration INTEGER DEFAULT 120,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player submissions
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    player_address TEXT NOT NULL,
    roast_text TEXT NOT NULL,
    entry_fee DECIMAL(10,8) DEFAULT 0.025,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id),
    UNIQUE(round_id, player_address)
);

-- Round results
CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    winner_submission_id INTEGER NOT NULL,
    ai_reasoning TEXT NOT NULL,
    prize_amount DECIMAL(10,8) NOT NULL,
    payout_tx_hash TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player statistics
CREATE TABLE player_stats (
    player_address TEXT PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_spent DECIMAL(10,8) DEFAULT 0,
    total_earned DECIMAL(10,8) DEFAULT 0,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily rewards system
CREATE TABLE daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    player_address TEXT NOT NULL,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_earned DECIMAL(10,8) DEFAULT 0,
    total_spent DECIMAL(10,8) DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    position INTEGER NOT NULL,
    player_address TEXT NOT NULL,
    reward_amount DECIMAL(10,8) NOT NULL,
    total_pool DECIMAL(10,8) NOT NULL,
    percentage REAL NOT NULL,
    tx_hash TEXT,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Voting system
CREATE TABLE judge_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    voter_address TEXT NOT NULL,
    character_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(round_id, voter_address)
);

-- Payment tracking
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT UNIQUE NOT NULL,
    player_address TEXT NOT NULL,
    round_id INTEGER,
    amount DECIMAL(10,8) NOT NULL,
    block_number INTEGER,
    confirmed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT UNIQUE NOT NULL,
    winner_address TEXT NOT NULL,
    round_id INTEGER NOT NULL,
    amount DECIMAL(10,8) NOT NULL,
    house_fee DECIMAL(10,8) NOT NULL,
    block_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Game Flow Architecture

#### **Round Lifecycle States**

```javascript
// Game phases and transitions
const GAME_PHASES = {
  WAITING: 'waiting',    // 0-1 players, waiting for minimum
  ACTIVE: 'active',      // 2+ players, 120s timer running
  JUDGING: 'judging',    // AI evaluating submissions (15s)
  COMPLETED: 'completed' // Winner selected, prizes distributed
};

// Automatic transitions:
// WAITING → ACTIVE: When 2nd player joins
// ACTIVE → JUDGING: When timer expires OR max players reached
// JUDGING → COMPLETED: When AI finishes evaluation
// COMPLETED → (new WAITING round): Auto-start after 30s delay
```

#### **Component Architecture**

The game system uses a modular component architecture:

1. **GameOrchestrator**: Main coordinator that manages all components
2. **RoundManager**: Handles round lifecycle (create, start, complete)
3. **TimerManager**: Manages all timers with precise synchronization
4. **SubmissionManager**: Handles player submissions and validation
5. **GameEventEmitter**: Manages WebSocket communication

#### **Real-Time Communication**

```javascript
// WebSocket rooms structure
const WS_ROOMS = {
  GLOBAL: 'global',                    // All connected users
  ADMIN: 'admin',                      // Admin dashboard
  ROUND: (roundId) => `game:${roundId}` // Round-specific players
};

// Key events emitted:
- round-created: New round available
- round-updated: Round state changed
- player-joined: Someone joined round
- timer-update: Live countdown updates
- judging-started: AI evaluation began
- round-completed: Winner announced
- prize-distributed: Payout confirmed
```

### AI System Architecture

#### **Multi-Model Support**

```javascript
// OpenRouter API integration with key rotation
const AI_CONFIG = {
  model: 'meta-llama/llama-4-maverick:free',
  apiKeys: [
    'sk-or-v1-key1...',  // 1000 requests each
    'sk-or-v1-key2...',  // Auto-rotation when exhausted
    // ... up to 11 keys total
  ],
  maxRequestsPerKey: 1000,
  keyResetHours: 24
};
```

#### **Character-Based Evaluation**

```javascript
// Each character has unique personality and criteria
const CHARACTER_EXAMPLE = {
  id: 'michael',
  name: 'Michael',
  role: 'CEO & Visionary',
  personality: 'Strategic, business-focused, professional',
  evaluationCriteria: {
    creativity: 0.25,     // 25% weight
    technical: 0.15,      // 15% weight
    humor: 0.20,          // 20% weight
    originality: 0.25,    // 25% weight
    community: 0.15       // 15% weight
  },
  systemPrompt: `You are ${character.name}, ${character.role}...`
};
```

#### **Evaluation Process**

1. **Parse Submissions**: Format all roasts for AI analysis
2. **Apply Character Lens**: Use character-specific prompt and criteria
3. **Score & Rank**: AI evaluates each roast (0-100 scale)
4. **Generate Reasoning**: Character-appropriate explanation
5. **Fallback Handling**: Random selection if AI fails

### Integration Examples

#### **Joining a Round (Complete Flow)**

```javascript
// 1. Frontend submission
const joinData = {
  roundId: 123,
  roastText: "Michael thinks he's the boss, but really he's just the boss of being tall!",
  paymentTx: "0x1234...abcd"
};

// 2. WebSocket message
socket.emit('submit-roast', joinData);

// 3. Backend validation & processing
const result = await gameService.joinRound(
  userAddress, 
  roastText, 
  paymentTx
);

// 4. Treasury verification
const payment = await treasuryService.verifyEntryFeePayment(
  paymentTx, 
  userAddress, 
  roundId
);

// 5. Real-time updates
io.to(`game:${roundId}`).emit('player-joined', {
  roundId,
  playerAddress: userAddress,
  playerCount: newCount,
  prizePool: newPool
});

// 6. Auto-start if conditions met
if (playerCount >= 2 && round.phase === 'waiting') {
  await gameService.startRound(roundId);
}
```

#### **AI Evaluation Process**

```javascript
// Character selection and prompt building
const character = characterService.getCharacter(round.judge_character);
const prompt = characterService.buildEvaluationPrompt(
  characterId, 
  submissions, 
  targetMember
);

// OpenRouter API call with fallback
try {
  const aiResponse = await openRouterService.callOpenRouter(prompt, {
    maxTokens: 1600,
    temperature: 0.3
  });
  
  const result = parseAIResponse(aiResponse, submissions);
  
  // Validate and format response
  const winner = submissions.find(sub => sub.id === result.winnerId);
  const reasoning = result.reasoning;
  
} catch (error) {
  // Fallback to random selection
  const randomWinner = submissions[Math.floor(Math.random() * submissions.length)];
  const fallbackReasoning = `${character.name}: Technical difficulties, but this roast caught my attention! (Random selection)`;
}
```

### Development Setup

#### **Prerequisites**
- Node.js 18+
- 0G Network wallet with private key
- OpenRouter API keys (up to 11 for rotation)

#### **Installation**

```bash
# Clone and install
git clone <repository>
cd roast-backend
npm install

# Environment setup
cp env.example .env
# Edit .env with your configuration

# Database setup
npm run migrate
npm run seed  # Optional test data

# Start development server
npm run dev
```

#### **Required Environment Variables**

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_PATH=./data/roast.db

# 0G Network
ZERO_G_NETWORK_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_CHAIN_ID=16601
TREASURY_PRIVATE_KEY=your-hot-wallet-private-key
TREASURY_PUBLIC_ADDRESS=your-treasury-address

# AI Service (OpenRouter keys)
REACT_APP_OPEN_ROUTER_API_KEY=sk-or-v1-your-first-key
REACT_APP_OPEN_ROUTER_API_KEY2=sk-or-v1-your-second-key
# ... up to 11 keys for rotation

# Security
JWT_SECRET=your-super-secret-jwt-key
ADMIN_ADDRESSES=0x1234...,0x5678...
```

### Testing

#### **Test Categories**
- **Unit Tests**: Individual service methods
- **Integration Tests**: Cross-module functionality
- **E2E Tests**: Complete game flows
- **Load Tests**: Performance under stress

#### **Running Tests**

```bash
# All tests
npm test

# Specific test suites
npm test game.service.test.js
npm test ai.service.test.js

# With coverage
npm run test:coverage

# Daily rewards testing
node scripts/test-daily-rewards.js 2024-01-15
node scripts/test-daily-rewards.js --distribute  # Actually send rewards
```

---

## 🔌 API Reference

### Authentication

All API endpoints (except public ones) require wallet signature verification:

```http
POST /api/players/verify
Content-Type: application/json

{
  "address": "0x1234567890123456789012345678901234567890",
  "signature": "0x...",
  "message": "0G Roast Arena authentication\nAddress: 0x...\nTimestamp: 1640995200",
  "timestamp": 1640995200
}
```

### Game Endpoints

#### Get Current Round
```http
GET /api/game/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "judgeCharacter": "michael",
    "phase": "active",
    "prizePool": "0.075",
    "playerCount": 3,
    "timeLeft": 87,
    "maxPlayers": 20,
    "character": {
      "id": "michael",
      "name": "Michael",
      "role": "CEO & Visionary"
    },
    "submissions": [
      {
        "id": 1,
        "playerAddress": "0x1234...",
        "roastText": "Michael thinks he's the CEO of humor, but he's really just..."
      }
    ]
  }
}
```

#### Join Round via API
```http
POST /api/game/join
Content-Type: application/json

{
  "playerAddress": "0x1234567890123456789012345678901234567890",
  "roastText": "Your hilarious roast here!",
  "paymentTxHash": "0xabcd..."
}
```

#### Get Recent Rounds
```http
GET /api/game/rounds?page=1&limit=10
```

#### Get Round Details
```http
GET /api/game/rounds/123
```

#### Get Game Statistics
```http
GET /api/game/stats
```

### Player Endpoints

#### Get Player Profile
```http
GET /api/players/profile/0x1234567890123456789012345678901234567890
```

**Response:**
```json
{
  "success": true,
  "player": {
    "address": "0x1234567890123456789012345678901234567890",
    "stats": {
      "totalGames": 45,
      "totalWins": 12,
      "totalSpent": "1.125",
      "totalEarned": "2.340",
      "winRate": 26.67,
      "netProfit": "1.215",
      "lastActive": "2024-01-15T10:30:00.000Z"
    },
    "recentGames": [
      {
        "roundId": 123,
        "judgeCharacter": "michael",
        "submittedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "recentWins": [
      {
        "roundId": 120,
        "prizeAmount": "0.238",
        "wonAt": "2024-01-15T09:15:00.000Z"
      }
    ]
  }
}
```

#### Get Leaderboard
```http
GET /api/players/leaderboard?sortBy=earnings&limit=10
```

**Sort Options:** `wins`, `earnings`, `games`, `winRate`

#### Get Hall of Fame
```http
GET /api/players/hall-of-fame?limit=10
```

#### Get Daily Rewards
```http
GET /api/players/daily-rewards?date=2024-01-15
```

#### Get All-Time Statistics
```http
GET /api/players/all-time-roasted
```

### Treasury Endpoints

#### Get 0G Balance
```http
GET /api/treasury/balance/0x1234567890123456789012345678901234567890
```

#### Verify Payment
```http
POST /api/treasury/verify-payment
Content-Type: application/json

{
  "txHash": "0xabcd...",
  "playerAddress": "0x1234...",
  "roundId": 123
}
```

#### Get Payment History
```http
GET /api/treasury/payments/0x1234...?limit=10&offset=0
```

#### Get Treasury Configuration
```http
GET /api/treasury/config
```

**Response:**
```json
{
  "network": {
    "name": "0G-Galileo-Testnet",
    "chainId": 16601,
    "rpc": "https://evmrpc-testnet.0g.ai",
    "currency": {
      "symbol": "0G",
      "decimals": 18
    }
  },
  "game": {
    "entryFee": 0.025,
    "houseFeePercentage": 5
  }
}
```

### AI Endpoints

#### Get AI Characters
```http
GET /api/ai/characters
```

#### Get Specific Character
```http
GET /api/ai/characters/michael
```

#### Manual Evaluation (Admin)
```http
POST /api/ai/evaluate
Content-Type: application/json
Authorization: Admin

{
  "roundId": 123,
  "characterId": "michael",
  "submissions": [...],
  "targetMember": "Michael"
}
```

### Voting Endpoints

#### Cast Vote for Next Judge
```http
POST /api/voting/vote
Content-Type: application/json

{
  "roundId": 123,
  "characterId": "ada",
  "voterAddress": "0x1234..."
}
```

#### Get Voting Statistics
```http
GET /api/voting/stats/123
```

#### Check User Vote
```http
GET /api/voting/user-vote/123/0x1234...
```

### WebSocket Events

#### Client to Server

```javascript
// Join round room
socket.emit('authenticate', {
  address: '0x1234567890123456789012345678901234567890'
});

socket.emit('join-round', {
  roundId: 123
});

// Submit roast
socket.emit('submit-roast', {
  roundId: 123,
  roastText: 'Your roast here!',
  paymentTx: '0xabcd...'
});

// Cast vote
socket.emit('cast-vote', {
  roundId: 123,
  characterId: 'ada'
});
```

#### Server to Client

```javascript
// Round events
socket.on('round-created', (data) => {
  console.log('New round:', data.roundId, data.judgeCharacter);
});

socket.on('round-updated', (data) => {
  console.log('Round update:', data.phase, data.timeLeft);
});

socket.on('player-joined', (data) => {
  console.log('Player joined:', data.playerAddress, data.playerCount);
});

socket.on('timer-update', (data) => {
  console.log('Time left:', data.timeLeft);
});

socket.on('judging-started', (data) => {
  console.log('AI judging started:', data.character);
});

socket.on('round-completed', (data) => {
  console.log('Winner:', data.winnerAddress, data.prizeAmount);
});

// Voting events
socket.on('voting-update', (data) => {
  console.log('Voting stats:', data.votesByCharacter);
});

// Error handling
socket.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});
```

### Error Codes Reference

```javascript
const ERROR_CODES = {
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Game
  ROUND_NOT_FOUND: 'ROUND_NOT_FOUND',
  ROUND_FULL: 'ROUND_FULL',
  ALREADY_SUBMITTED: 'ALREADY_SUBMITTED',
  SUBMISSIONS_LOCKED: 'SUBMISSIONS_LOCKED',
  
  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  
  // AI
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_EVALUATION_FAILED: 'AI_EVALUATION_FAILED',
  
  // Voting
  VOTING_LOCKED: 'VOTING_LOCKED',
  ALREADY_VOTED: 'ALREADY_VOTED',
  INVALID_CHARACTER: 'INVALID_CHARACTER'
};
```

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                       │
│  React.js + Web3 Integration + Socket.IO Client            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                     API Gateway Layer                       │
│  Express.js + CORS + Rate Limiting + Authentication        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                   Business Logic Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Game     │ │     AI      │ │  Treasury   │          │
│  │   Module    │ │   Module    │ │   Module    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Players    │ │   Voting    │ │ WebSocket   │          │
│  │   Module    │ │   Module    │ │   Module    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                  Integration Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   SQLite    │ │ OpenRouter  │ │ 0G Network  │          │
│  │  Database   │ │ AI Service  │ │ Blockchain  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Module Dependencies

```
GameService
├── depends on: AIService, TreasuryService, VotingService
├── uses: WebSocketService for real-time events
└── components:
    ├── GameOrchestrator (main coordinator)
    ├── RoundManager (lifecycle management)
    ├── TimerManager (precise timing)
    ├── SubmissionManager (player inputs)
    └── GameEventEmitter (WebSocket events)

AIService
├── depends on: OpenRouterService, CharacterService
├── features: Multi-model support, character personalities
└── fallback: Random selection if AI fails

TreasuryService
├── depends on: ethers.js, 0G Network
├── features: Payment verification, automated payouts
└── security: Hot wallet management, transaction validation

PlayersService
├── depends on: HallOfFameService, Database
├── features: Statistics, leaderboards, daily rewards
└── authentication: Wallet signature verification

VotingService
├── depends on: Database, WebSocketService
├── features: Character voting, tie-breaker logic
└── integration: Real-time vote updates

WebSocketService
├── depends on: Socket.IO
├── features: Real-time communication, room management
└── events: Game updates, voting, errors
```

### Data Flow Architecture

#### **Game Round Lifecycle**

```
1. Round Creation
   ├── VotingService determines next judge (or random)
   ├── GameOrchestrator.createNewRound()
   ├── Database: INSERT INTO rounds
   ├── WebSocket: Emit 'round-created' to all users
   └── VotingService: Reset voting for new round

2. Player Joins
   ├── WebSocket: 'submit-roast' event received
   ├── SubmissionManager.joinRound()
   ├── TreasuryService.verifyEntryFeePayment()
   ├── Database: INSERT INTO submissions
   ├── Database: UPDATE rounds SET prize_pool
   ├── WebSocket: Emit 'player-joined' to round
   └── Auto-start if min players reached

3. Round Active
   ├── TimerManager.startTimer(120 seconds)
   ├── WebSocket: Emit 'timer-update' every second
   ├── SubmissionManager.lockSubmissions() at 10s remaining
   ├── VotingService.lockVoting() at 5s remaining
   └── Auto-transition to judging when timer expires

4. AI Judging
   ├── AIService.evaluateRoasts()
   ├── CharacterService.buildEvaluationPrompt()
   ├── OpenRouterService.callOpenRouter()
   ├── Parse and validate AI response
   ├── Database: INSERT INTO results
   └── Fallback: Random selection if AI fails

5. Round Completion
   ├── TreasuryService.sendPrizePayout()
   ├── Database: INSERT INTO payouts
   ├── Database: UPDATE player_stats
   ├── WebSocket: Emit 'round-completed' with results
   ├── WebSocket: Emit 'prize-distributed' after payout
   ├── VotingService.finalizeVotingWithTieBreaker()
   └── Schedule next round creation (30s delay)
```

#### **Daily Rewards System**

```
Daily Rewards Cron Job (00:00 UTC)
├── Calculate daily statistics from completed rounds
├── Categorize players: Top Earners, Most Wins, Best Win Rate, Most Active
├── Apply qualification filters (min 3 games, etc.)
├── Calculate reward pool (80% of daily house fees)
├── Distribute rewards: 12% / 8% / 5% per category position
├── Send 0G tokens via hot wallet
├── Record transactions in daily_rewards table
└── Update treasury_balance table
```

### Security Architecture

#### **Authentication & Authorization**

```
Wallet Signature Verification
├── Client signs challenge: "0G Roast Arena authentication\nAddress: {addr}\nTimestamp: {ts}"
├── Server verifies signature with ethers.verifyMessage()
├── Check timestamp recency (max 5 minutes old)
├── Store session info with JWT token
└── Admin check: address in ADMIN_ADDRESSES config

Payment Verification
├── Get transaction from 0G Network
├── Verify: sender = player, recipient = treasury, amount = 0.025 0G
├── Check transaction recency (max 5 minutes)
├── Prevent double-spending with tx_hash uniqueness
└── Record in payments table for audit
```

#### **Input Validation & Sanitization**

```
Roast Content Validation
├── Length: 10-280 characters
├── Spam detection: excessive repetition patterns
├── HTML/script tag removal
├── Profanity filtering (configurable)
└── Character encoding normalization

Rate Limiting
├── Global: 100 requests/minute per IP
├── WebSocket: Connection rate limiting
├── AI Evaluation: 2 requests/minute per IP  
├── Voting: 2 votes/minute per IP
└── Submission: 1 per round per wallet
```

### Performance Architecture

#### **Database Optimization**

```sql
-- SQLite performance settings
PRAGMA journal_mode = WAL;        -- Better concurrency
PRAGMA synchronous = NORMAL;      -- Balanced durability/speed
PRAGMA cache_size = 10000;        -- 10MB cache
PRAGMA mmap_size = 268435456;     -- 256MB memory mapping

-- Critical indexes
CREATE INDEX idx_rounds_phase ON rounds(phase);
CREATE INDEX idx_submissions_round_id ON submissions(round_id);
CREATE INDEX idx_submissions_player ON submissions(player_address);
CREATE INDEX idx_results_round_id ON results(round_id);
```

#### **Real-Time Performance**

```
WebSocket Optimization
├── Connection pooling with Redis adapter (production)
├── Message batching for high-frequency updates
├── Client-side connection recovery
├── Heartbeat monitoring (30s intervals)
└── Room-based message targeting

Timer Synchronization
├── Server-authoritative timing
├── 1-second update intervals for live feel
├── Client prediction with server correction
├── Graceful handling of connection drops
└── Resume capability after reconnection
```

#### **AI Service Performance**

```
OpenRouter Integration
├── API key rotation (11 keys × 1000 requests)
├── Request queuing and retry logic
├── 15-second evaluation timeout
├── Fallback to random selection
└── Usage tracking and monitoring

Character System
├── Pre-loaded character definitions
├── Prompt caching and optimization
├── Response parsing with error recovery
├── Evaluation criteria weighting
└── Recent winners tracking
```

### Scalability Considerations

#### **Horizontal Scaling**

```
Load Balancing
├── Multiple Node.js instances behind nginx
├── Redis adapter for Socket.IO clustering
├── Database read replicas for queries
├── CDN for static assets
└── Health check endpoints

Database Scaling
├── Time-based partitioning for historical data
├── Separate read/write connections
├── Archived tables for old rounds
├── Backup and recovery procedures
└── Migration scripts for schema changes
```

#### **Resource Management**

```
Memory Management
├── Connection pooling for database
├── WebSocket connection limits
├── Garbage collection monitoring
├── Memory leak detection
└── Resource cleanup on shutdown

Process Management
├── PM2 for production deployment
├── Auto-restart on failures
├── Log rotation and cleanup
├── Monitoring and alerting
└── Graceful shutdown handling
```

---

## 🚀 Deployment Guide

### Production Environment Setup

#### **Server Requirements**

```
Minimum Hardware:
├── CPU: 2 cores (4+ recommended)
├── RAM: 4GB (8GB+ recommended)
├── Storage: 50GB SSD (100GB+ recommended)
├── Network: 100Mbps connection
└── OS: Ubuntu 20.04+ or CentOS 8+

Recommended Production Stack:
├── Node.js: 18.x LTS
├── PM2: Process management
├── Nginx: Reverse proxy & load balancer
├── Certbot: SSL certificate management
└── UFW: Firewall configuration
```

#### **System Preparation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install UFW firewall
sudo apt install ufw -y
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### **Application Deployment**

```bash
# Create application user
sudo adduser roastapp
sudo usermod -aG sudo roastapp
su - roastapp

# Clone repository
git clone <your-repository-url> roast-backend
cd roast-backend

# Install dependencies
npm ci --production

# Create necessary directories
mkdir -p data/backups
mkdir -p logs

# Set up environment
cp env.example .env
nano .env  # Configure production settings
```

#### **Environment Configuration**

```env
# Production environment file
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_PATH=/home/roastapp/roast-backend/data/roast.db
DATABASE_BACKUP_PATH=/home/roastapp/roast-backend/data/backups/

# Security
JWT_SECRET=your-very-secure-random-string-here
ADMIN_ADDRESSES=0xYourAdminAddress1,0xYourAdminAddress2

# 0G Network (Production)
ZERO_G_NETWORK_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_CHAIN_ID=16601
TREASURY_PRIVATE_KEY=your-production-hot-wallet-private-key
TREASURY_PUBLIC_ADDRESS=your-production-treasury-address

# OpenRouter API Keys (Production)
REACT_APP_OPEN_ROUTER_API_KEY=sk-or-v1-production-key-1
REACT_APP_OPEN_ROUTER_API_KEY2=sk-or-v1-production-key-2
# ... configure all 11 keys for maximum throughput

# Logging
LOG_LEVEL=info
LOG_FILE=/home/roastapp/roast-backend/logs/app.log

# CORS (Your frontend domain)
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### **Database Setup**

```bash
# Run migrations
npm run migrate

# Verify database
node -e "
const db = require('./src/database/database.service');
db.initialize();
console.log('Database initialized successfully');
process.exit(0);
"

# Set proper permissions
chmod 600 data/roast.db
chmod 700 data/
```

#### **PM2 Configuration**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'roast-backend',
    script: 'src/server.js',
    instances: 2,  // Scale based on CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

#### **Start Application**

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Enable auto-startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u roastapp --hp /home/roastapp
pm2 save

# Verify running
pm2 status
pm2 logs roast-backend
```

#### **Nginx Configuration**

Create `/etc/nginx/sites-available/roast-backend`:

```nginx
upstream roast_backend {
    server 127.0.0.1:3001;
    # Add more instances for load balancing
    # server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name your-api-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-api-domain.com;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-api-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-api-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=ws:10m rate=50r/m;

    # Main API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://roast_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket connections
    location /socket.io/ {
        limit_req zone=ws burst=10 nodelay;
        
        proxy_pass http://roast_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Health check
    location /health {
        proxy_pass http://roast_backend;
        access_log off;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/roast-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **SSL Certificate Setup**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-api-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Daily Rewards Automation

#### **Cron Job Setup**

```bash
# Edit crontab for roastapp user
crontab -e

# Add daily rewards job (runs at midnight UTC)
0 0 * * * /usr/bin/node /home/roastapp/roast-backend/scripts/daily-rewards.js >> /home/roastapp/roast-backend/logs/daily-rewards.log 2>&1

# Optional: Verification job (runs at 12:05 AM)
5 0 * * * /usr/bin/node /home/roastapp/roast-backend/scripts/test-daily-rewards.js $(date -d yesterday +\%Y-\%m-\%d) >> /home/roastapp/roast-backend/logs/daily-verification.log 2>&1
```

#### **Script Permissions**

```bash
chmod +x scripts/daily-rewards.js
chmod +x scripts/test-daily-rewards.js

# Test the script
node scripts/test-daily-rewards.js 2024-01-15
```

#### **Hot Wallet Setup**

```bash
# Ensure hot wallet has sufficient 0G tokens
# Monitor balance regularly
node -e "
const { TreasuryService } = require('./src/modules/treasury');
const service = new TreasuryService();
service.getBalance('YOUR_HOT_WALLET_ADDRESS').then(balance => {
  console.log('Hot wallet balance:', balance, '0G');
  process.exit(0);
});
"
```

### Monitoring & Logging

#### **Log Management**

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/roast-backend

# Content:
/home/roastapp/roast-backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 roastapp roastapp
    postrotate
        pm2 reload roast-backend
    endscript
}
```

#### **Monitoring Setup**

```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Configure monitoring
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

#### **Health Monitoring Script**

Create `scripts/health-check.js`:

```javascript
#!/usr/bin/env node
const http = require('http');

const healthCheck = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Service healthy');
      process.exit(0);
    } else {
      console.log('❌ Service unhealthy:', res.statusCode);
      process.exit(1);
    }
  });

  req.on('error', (err) => {
    console.log('❌ Health check failed:', err.message);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.log('❌ Health check timeout');
    req.destroy();
    process.exit(1);
  });

  req.end();
};

healthCheck();
```

Add to crontab:
```bash
# Health check every 5 minutes
*/5 * * * * /home/roastapp/roast-backend/scripts/health-check.js || /usr/bin/pm2 restart roast-backend
```

### Backup Strategy

#### **Database Backup**

```bash
# Create backup script
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/roastapp/roast-backend/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/home/roastapp/roast-backend/data/roast.db"

# Create backup
sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/roast_backup_$DATE.db"

# Compress backup
gzip "$BACKUP_DIR/roast_backup_$DATE.db"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "roast_backup_*.db.gz" -mtime +30 -delete

echo "Backup completed: roast_backup_$DATE.db.gz"
EOF

chmod +x scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /home/roastapp/roast-backend/scripts/backup-db.sh >> /home/roastapp/roast-backend/logs/backup.log 2>&1
```

#### **System Backup**

```bash
# Backup configuration and logs
cat > scripts/system-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/roastapp/backups/system"
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"

# Backup configuration files
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  .env \
  ecosystem.config.js \
  /etc/nginx/sites-available/roast-backend

# Backup recent logs
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" \
  --exclude="*.gz" \
  logs/

echo "System backup completed: $DATE"
EOF

chmod +x scripts/system-backup.sh
```

### Security Hardening

#### **Firewall Configuration**

```bash
# Basic UFW setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Limit SSH attempts
sudo ufw limit ssh

# Enable firewall
sudo ufw enable
```

#### **System Security**

```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Update system regularly
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### **Application Security**

```bash
# Set proper file permissions
chmod 600 .env
chmod 700 data/
chmod 600 data/roast.db
chmod 755 scripts/*.js

# Secure log files
chmod 640 logs/*.log
chown roastapp:roastapp logs/*.log
```

### Performance Optimization

#### **Database Optimization**

```sql
-- Run ANALYZE to update query planner statistics
ANALYZE;

-- Vacuum database (run weekly)
VACUUM;

-- Check database integrity
PRAGMA integrity_check;
```

#### **Node.js Optimization**

```bash
# Increase file descriptor limits
echo "roastapp soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "roastapp hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize Node.js memory
# Already configured in ecosystem.config.js:
# node_args: '--max-old-space-size=1024'
```

#### **Nginx Optimization**

Add to nginx configuration:

```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# Enable HTTP/2
listen 443 ssl http2;

# Connection keepalive
keepalive_timeout 65;
keepalive_requests 100;

# Buffer sizes
client_body_buffer_size 128k;
client_max_body_size 10m;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### **Application Won't Start**

**Problem**: Server fails to start with error messages

**Diagnosis Steps**:
```bash
# Check application logs
pm2 logs roast-backend

# Check system logs
sudo journalctl -u pm2-roastapp

# Verify environment
node -e "console.log('Node version:', process.version)"
npm list --depth=0

# Test configuration
node -e "
try {
  require('./src/config/app.config').validateConfig();
  console.log('✅ Configuration valid');
} catch (error) {
  console.log('❌ Configuration error:', error.message);
}
"
```

**Common Solutions**:

1. **Missing Environment Variables**:
```bash
# Check .env file exists and has proper values
cat .env | grep -E "(TREASURY_PRIVATE_KEY|OPEN_ROUTER_API_KEY)"

# Verify required variables
node -e "
const required = [
  'TREASURY_PRIVATE_KEY',
  'TREASURY_PUBLIC_ADDRESS',
  'REACT_APP_OPEN_ROUTER_API_KEY',
  'JWT_SECRET'
];
required.forEach(key => {
  if (!process.env[key]) console.log('Missing:', key);
});
"
```

2. **Database Issues**:
```bash
# Check database file permissions
ls -la data/roast.db

# Test database connection
node -e "
const db = require('./src/database/database.service');
try {
  db.initialize();
  console.log('✅ Database OK');
} catch (error) {
  console.log('❌ Database error:', error.message);
}
"

# Run migrations if needed
npm run migrate
```

3. **Port Already in Use**:
```bash
# Check what's using port 3001
sudo lsof -i :3001

# Kill conflicting process
sudo kill -9 <PID>

# Or change port in .env
echo "PORT=3002" >> .env
```

#### **WebSocket Connection Issues**

**Problem**: Real-time features not working, connection errors

**Diagnosis**:
```bash
# Test WebSocket connectivity
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3001');
socket.on('connect', () => {
  console.log('✅ WebSocket connected');
  process.exit(0);
});
socket.on('connect_error', (error) => {
  console.log('❌ WebSocket error:', error.message);
  process.exit(1);
});
setTimeout(() => {
  console.log('❌ WebSocket timeout');
  process.exit(1);
}, 5000);
"
```

**Solutions**:

1. **CORS Issues**:
```bash
# Check CORS configuration
grep -E "(FRONTEND_URL|ALLOWED_ORIGINS)" .env

# Update allowed origins
echo "ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000" >> .env
pm2 restart roast-backend
```

2. **Nginx WebSocket Configuration**:
```nginx
# Ensure proper WebSocket headers in nginx config
location /socket.io/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... other headers
}
```

3. **Firewall Blocking**:
```bash
# Check if firewall is blocking connections
sudo ufw status

# Allow specific ports if needed
sudo ufw allow 3001
```

#### **AI Evaluation Failures**

**Problem**: Rounds stuck in judging phase, AI timeouts

**Diagnosis**:
```bash
# Check AI service status
curl -s http://localhost:3001/api/ai/health | jq

# Test OpenRouter connectivity
node -e "
const { AIService } = require('./src/modules/ai');
const ai = new AIService();
ai.aiService.getServiceStatus().then(status => {
  console.log('AI Status:', JSON.stringify(status, null, 2));
  process.exit(0);
}).catch(error => {
  console.log('AI Error:', error.message);
  process.exit(1);
});
"
```

**Solutions**:

1. **API Key Issues**:
```bash
# Verify API keys are valid
grep -c "REACT_APP_OPEN_ROUTER_API_KEY" .env

# Test API key manually
curl -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"meta-llama/llama-4-maverick:free","messages":[{"role":"user","content":"test"}]}' \
     https://openrouter.ai/api/v1/chat/completions
```

2. **Enable AI Fallback**:
```bash
# Ensure fallback is enabled
echo "AI_FALLBACK_ENABLED=true" >> .env
pm2 restart roast-backend
```

3. **Increase Timeout**:
```bash
# Increase AI evaluation timeout
echo "AI_EVALUATION_TIMEOUT=30000" >> .env
pm2 restart roast-backend
```

#### **Payment Verification Failures**

**Problem**: Entry fees not being verified, players can't join

**Diagnosis**:
```bash
# Test 0G Network connectivity
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
provider.getBlockNumber().then(block => {
  console.log('✅ 0G Network connected, block:', block);
  process.exit(0);
}).catch(error => {
  console.log('❌ 0G Network error:', error.message);
  process.exit(1);
});
"

# Check hot wallet configuration
node -e "
const { config } = require('./src/config/app.config');
if (config.zg.hotWalletPrivateKey) {
  console.log('✅ Hot wallet configured');
  console.log('Address:', config.zg.treasuryPublicAddress);
} else {
  console.log('❌ Hot wallet not configured');
}
"
```

**Solutions**:

1. **Network Configuration**:
```bash
# Verify network settings
grep -E "(ZERO_G_|ZG_)" .env

# Test with different RPC if needed
echo "ZERO_G_NETWORK_RPC=https://backup-rpc-url" >> .env
```

2. **Hot Wallet Issues**:
```bash
# Check hot wallet balance
node -e "
const { TreasuryService } = require('./src/modules/treasury');
const service = new TreasuryService();
service.getBalance('YOUR_HOT_WALLET_ADDRESS').then(balance => {
  console.log('Hot wallet balance:', balance, '0G');
  if (parseFloat(balance) < 1) {
    console.log('⚠️  Low balance - fund hot wallet');
  }
}).catch(console.error);
"

# Fund hot wallet if balance is low
```

3. **Transaction Verification**:
```bash
# Test manual payment verification
node -e "
const { TreasuryService } = require('./src/modules/treasury');
const service = new TreasuryService();
service.verifyEntryFeePayment('TX_HASH', 'PLAYER_ADDRESS', 'ROUND_ID')
  .then(result => console.log('Verification result:', result))
  .catch(console.error);
"
```

#### **Daily Rewards Not Distributing**

**Problem**: Daily rewards cron job failing or not running

**Diagnosis**:
```bash
# Check cron job status
crontab -l

# Check cron logs
grep -i cron /var/log/syslog | tail -10

# Test daily rewards script manually
node scripts/test-daily-rewards.js $(date -d yesterday +%Y-%m-%d)

# Check script permissions
ls -la scripts/daily-rewards.js
```

**Solutions**:

1. **Cron Job Issues**:
```bash
# Ensure cron is running
sudo systemctl status cron

# Fix cron job with absolute paths
crontab -e
# Change to:
0 0 * * * /usr/bin/node /home/roastapp/roast-backend/scripts/daily-rewards.js >> /home/roastapp/roast-backend/logs/daily-rewards.log 2>&1
```

2. **Script Execution Issues**:
```bash
# Make script executable
chmod +x scripts/daily-rewards.js

# Test with full environment
cd /home/roastapp/roast-backend && NODE_ENV=production /usr/bin/node scripts/daily-rewards.js
```

3. **Hot Wallet Insufficient Balance**:
```bash
# Check if hot wallet has enough funds for rewards
node scripts/test-daily-rewards.js --dry-run

# Fund hot wallet if needed
```

#### **High Memory Usage**

**Problem**: Application consuming too much memory

**Diagnosis**:
```bash
# Check PM2 memory usage
pm2 monit

# Check system memory
free -h

# Analyze Node.js heap
node --expose-gc -e "
console.log('Memory usage:', process.memoryUsage());
global.gc();
console.log('After GC:', process.memoryUsage());
"
```

**Solutions**:

1. **Configure Memory Limits**:
```javascript
// Update ecosystem.config.js
module.exports = {
  apps: [{
    name: 'roast-backend',
    script: 'src/server.js',
    max_memory_restart: '512M',  // Restart if exceeds 512MB
    node_args: '--max-old-space-size=512'
  }]
};
```

2. **Database Optimization**:
```sql
-- Vacuum database to reclaim space
VACUUM;

-- Analyze for query optimization
ANALYZE;
```

3. **Connection Management**:
```bash
# Check WebSocket connections
node -e "
const { WebSocketService } = require('./src/modules/websocket');
// Add connection monitoring
"
```

#### **Database Lock Errors**

**Problem**: SQLite database locked errors

**Diagnosis**:
```bash
# Check processes using database
lsof data/roast.db

# Check database integrity
sqlite3 data/roast.db "PRAGMA integrity_check;"

# Check WAL mode
sqlite3 data/roast.db "PRAGMA journal_mode;"
```

**Solutions**:

1. **Enable WAL Mode** (should already be enabled):
```sql
PRAGMA journal_mode = WAL;
```

2. **Fix Lock Issues**:
```bash
# Stop application
pm2 stop roast-backend

# Remove lock files if present
rm -f data/roast.db-shm data/roast.db-wal

# Restart application
pm2 start roast-backend
```

3. **Database Backup & Restore**:
```bash
# If corruption detected, restore from backup
cp data/backups/roast_backup_LATEST.db.gz .
gunzip roast_backup_LATEST.db.gz
mv roast_backup_LATEST.db data/roast.db
pm2 restart roast-backend
```

### Performance Issues

#### **Slow API Responses**

**Investigation**:
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/game/current"

# Where curl-format.txt contains:
#     time_namelookup:  %{time_namelookup}\n
#     time_connect:     %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#     time_pretransfer: %{time_pretransfer}\n
#     time_redirect:    %{time_redirect}\n
#     time_starttransfer: %{time_starttransfer}\n
#     time_total:       %{time_total}\n
```

**Optimization**:
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_rounds_created_at ON rounds(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_player_round ON submissions(player_address, round_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_total_earned ON player_stats(total_earned);
```

#### **WebSocket Lag**

**Solutions**:
```javascript
// Optimize timer updates in TimerManager
// Reduce update frequency for non-critical updates
if (timeLeft % 5 === 0 || timeLeft <= 10) {
  this.emitToRoom(roundId, WS_EVENTS.TIMER_UPDATE, {
    roundId,
    timeLeft
  });
}
```

### Monitoring & Alerting

#### **Set up Basic Monitoring**

```bash
# Create monitoring script
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash
# Basic monitoring script

# Check if application is running
if ! pm2 status roast-backend | grep -q "online"; then
    echo "ALERT: Application is down"
    pm2 restart roast-backend
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "ALERT: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "ALERT: Memory usage is ${MEM_USAGE}%"
fi

# Check log errors
ERROR_COUNT=$(tail -100 logs/app.log | grep -c "ERROR")
if [ $ERROR_COUNT -gt 10 ]; then
    echo "ALERT: High error count: $ERROR_COUNT"
fi
EOF

chmod +x scripts/monitor.sh

# Add to crontab (run every 5 minutes)
*/5 * * * * /home/roastapp/roast-backend/scripts/monitor.sh >> /home/roastapp/roast-backend/logs/monitor.log 2>&1
```

#### **Log Analysis**

```bash
# Common log analysis commands
# Find errors in last 24 hours
grep "ERROR" logs/app.log | grep "$(date +%Y-%m-%d)"

# Count errors by type
grep "ERROR" logs/app.log | awk '{print $4}' | sort | uniq -c

# Monitor real-time logs
tail -f logs/app.log | grep -E "(ERROR|WARN)"

# Daily rewards log analysis
grep "Daily Hall of Fame" logs/app.log | tail -10
```

This comprehensive troubleshooting guide covers the most common issues you might encounter in production. Always check logs first, test individual components, and apply solutions incrementally to identify the root cause.

---

## 📞 Support & Community

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join real-time discussions
- **Documentation**: This guide and inline code comments
- **API Reference**: Complete endpoint documentation above

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### License

MIT License - see LICENSE file for details

---

**Built with ❤️ by the 0G Roast Team**