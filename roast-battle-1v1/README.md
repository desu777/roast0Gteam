# 🥊 Roast Battle 1v1 Microservice

AI-powered 1v1 roast battles between 0G team members and crypto roasters with real-time betting and live streaming.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment:**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The microservice will be available at `http://localhost:3002`

## 🏗️ Architecture

```
roast-battle-1v1/
├── package.json          # Dependencies and scripts
├── env.example           # Environment configuration template
├── src/
│   ├── server.js         # Main server with Express + Socket.IO
│   ├── config/
│   │   └── app.config.js # Application configuration
│   ├── database/
│   │   └── migrate.js    # SQLite database migrations
│   ├── services/
│   │   └── logger.service.js # Winston logging with TEST_ENV support
│   └── [future services] # AI, Battle, Treasury services
├── data/
│   ├── characters-0g.json   # 0G team members (8 characters)
│   └── roasters.json        # Crypto roasters (6 archetypes)
└── logs/                    # Application logs (when enabled)
```

## ⚙️ Configuration

### Environment Variables

```bash
# 0G Network Configuration
ZERO_G_NETWORK_URL=https://evmrpc-testnet.0g.ai
ZERO_G_CHAIN_ID=16601
ZERO_G_NETWORK_NAME=0G-Galileo-Testnet
ZERO_G_EXPLORER=https://chainscan-galileo.0g.ai/
ZERO_G_CURRENCY_SYMBOL=0G
ZERO_G_CURRENCY_DECIMALS=18

# Treasury & OpenAI
TREASURY_PRIVATE_KEY=your_treasury_private_key_here
TREASURY_ADDRESS=your_treasury_address_here
OPENAI_API_KEY=your_openai_api_key_here

# Battle Configuration
PORT=3002
TEST_ENV=true              # Enable detailed logging
BET_AMOUNT=0.5
COUNTDOWN_DURATION=90
HOUSE_FEE_PERCENT=5
```

## 🎮 How It Works

### Battle Flow

1. **Battle Creation**: Random 0G character vs Random roaster selected
2. **Betting Phase**: Users bet 0.5 0G on either side
3. **Minimum Requirements**: At least 1 bet on OG side + 1 bet on roaster side
4. **Countdown**: 90-second countdown begins
5. **AI Generation**: GPT-4o-mini generates dialog between characters
6. **Live Streaming**: Dialog animates like chat conversation
7. **Winner Decision**: AI judges who won the roast battle
8. **Payouts**: Winners split losers' tokens (minus 5% house fee)
9. **Reset**: New battle with new characters begins

### Character Archetypes

**0G Team (8 members):**
- Michael (CEO & Visionary)
- Ada (CMO & Dreamer) 
- JC (Head of Growth)
- Elisha (Community Voice)
- Ren (CTO & Tech Monk)
- Yon (Community Champion)
- Zer0 (DeFAI Oracle)
- DAO Agent (Governance Detective)

**Roasters (6 archetypes):**
- AirdropAlpha (Airdrop Hunter)
- FUD_Manager (Crypto Karen)
- DiamondHands_0G (Moon Boy)
- ArchMaximalist (Tech Purist)
- OnceRugged (Rug Survivor)
- AllIn_Chad (Degen Gambler)

## 🌐 API Endpoints

### Health & Info
```
GET /health                    # Service health check
GET /api/characters/og         # Get 0G team characters
GET /api/characters/roasters   # Get roaster characters
```

### Battle API (Future Implementation)
```
GET /api/battle/current        # Get current battle state
POST /api/battle/bet           # Place a bet
GET /api/battle/history        # Get battle history
GET /api/battle/stats/:address # Get player statistics
```

## 🔌 WebSocket Events

### Client → Server
```javascript
socket.emit('join_battle_room')      // Join the battle room
socket.emit('get_battle_status')     // Request current battle state
socket.emit('place_bet', {           // Place a bet (future)
  side: 'og',                        // 'og' or 'roaster'
  amount: 0.5,
  txHash: '0x...'
})
```

### Server → Client
```javascript
socket.on('battle_state', (data) => {
  // Current battle information
  // { status, ogCharacter, roasterCharacter, bets, countdown }
})

socket.on('joined_battle_room', (data) => {
  // Confirmation of joining battle room
})

socket.on('user_count_update', (data) => {
  // Real-time connected users count
})
```

## 📊 Database Schema

### Tables

- **current_battle**: Active battle (only 1 at a time)
- **battle_bets**: Bets placed on current battle
- **battle_history**: Completed battles archive
- **battle_stats**: Player statistics
- **battle_payouts**: Payout transaction log
- **ai_logs**: AI interaction logs for debugging

### Key Features

- Single active battle at a time
- One bet per player per battle
- Automatic payout processing
- Comprehensive logging for analysis
- Battle statistics tracking

## 🔧 Development

### Scripts
```bash
npm run dev        # Development mode with nodemon
npm run start      # Production mode
npm run migrate    # Run database migrations
npm run lint       # Run ESLint
npm run test       # Run tests (future)
```

### Logging

The service uses conditional logging based on `TEST_ENV`:

```javascript
// Only logs when TEST_ENV=true
logger.battle.created(battleId, ogChar, roasterChar)
logger.ws.connection(socketId, userAgent)
logger.api.request(method, path, ip, userAgent)
```

### Database Operations

```bash
# Run migrations
npm run migrate

# Rollback to specific version
node src/database/migrate.js rollback 0
```

## 🔗 Integration with Main System

### Frontend Integration
- Frontend connects to main backend (port 3001) and battle microservice (port 3002)
- Wallet connection reused from main system
- Real-time updates via WebSocket
- Battle UI integrated as `/1v1` route

### Backend Communication
- Treasury operations coordinated with main backend
- Player balance verification
- Token transfer execution
- Battle results logging

## 🚀 Deployment

### Docker (Future)
```yaml
roast-battle-1v1:
  build: ./roast-battle-1v1
  ports:
    - "3002:3002"
  environment:
    - TEST_ENV=true
    - DATABASE_PATH=/data/battle.db
  volumes:
    - battle_data:/data
    - battle_logs:/app/logs
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `TREASURY_PRIVATE_KEY`
- [ ] Set `OPENAI_API_KEY`
- [ ] Setup monitoring for logs
- [ ] Configure reverse proxy (nginx)
- [ ] Setup SSL certificates
- [ ] Database backups

## 🎯 Next Steps

1. **AI Service**: Implement GPT-4o-mini dialog generation
2. **Battle Logic**: Complete battle state management
3. **Treasury Integration**: Automatic payouts via ethers.js
4. **Frontend Components**: 1v1 battle UI
5. **Advanced Features**: Battle scheduling, tournaments

## 🐛 Debugging

### Logs Location
- Console: When `TEST_ENV=true`
- File: `./logs/battle-1v1.log` (when enabled)

### Common Issues
- **Migration fails**: Check database path and permissions
- **WebSocket disconnects**: Verify CORS configuration
- **AI errors**: Check OpenAI API key and rate limits
- **Network issues**: Verify 0G network configuration

## 📞 Support

For development questions and issues:
- Check logs when `TEST_ENV=true`
- Verify environment configuration
- Test endpoints via `/health`
- Monitor WebSocket connections

---

🔥 **Ready to battle!** The microservice is now set up and ready for the next implementation phase. 