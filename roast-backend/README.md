# 🎮 0G Roast Arena - Backend

AI-Powered Team Roast Battle Game Backend built with Node.js, Express, Socket.IO, and better-sqlite3.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

1. Clone the repository
```bash
cd roast-backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp env.example .env
```

4. Edit `.env` file with your configuration
- Set your 0G wallet private key
- Configure API endpoints
- Set JWT secret for production

5. Run database migrations
```bash
npm run migrate
```

6. (Optional) Seed database with test data
```bash
npm run seed
```

7. Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── database/        # Database service and migrations
├── modules/         # Feature modules (max 400 lines each)
│   ├── game/       # Game logic & round management
│   ├── players/    # Player management & authentication
│   ├── treasury/   # 0G payment processing
│   ├── ai/         # Roast evaluation & reasoning
│   └── websocket/  # Real-time communication
├── services/       # Shared services (logger, validation, crypto)
├── utils/          # Helper functions
├── guards/         # Authentication guards
├── interceptors/   # Request/response interceptors
├── pipes/          # Validation pipes
└── server.js       # Main application entry point
```

## 🗄️ Database Schema

The application uses SQLite with the following tables:
- `rounds` - Game round management
- `submissions` - Player roast submissions
- `results` - Round results and winners
- `player_stats` - Player statistics and history
- `config` - System configuration

## 🔌 API Endpoints

### Game Management
- `GET /api/game/current` - Get current active round
- `GET /api/game/rounds` - Get recent rounds with pagination
- `POST /api/game/rounds` - Create new round (admin only)
- `GET /api/game/rounds/:id` - Get specific round details
- `GET /api/game/stats` - Get global game statistics

### Player Management
- `GET /api/players/profile/:address` - Get player profile & stats
- `POST /api/players/verify` - Verify wallet signature
- `GET /api/players/leaderboard` - Get top players

### Treasury Operations
- `POST /api/treasury/payment` - Process entry fee payment
- `GET /api/treasury/balance/:address` - Get player 0G balance
- `POST /api/treasury/withdraw` - Withdraw prize

### AI Service
- `POST /api/ai/evaluate` - Evaluate roasts (admin)
- `GET /api/ai/characters` - Get character personalities

## 🔧 WebSocket Events

### Client → Server
- `join-round` - Join a game round
- `submit-roast` - Submit a roast
- `leave-round` - Leave current round
- `ping` - Keep connection alive

### Server → Client
- `round-created` - New round started
- `round-updated` - Round state changed
- `player-joined` - Player joined round
- `timer-update` - Timer countdown
- `round-completed` - Round finished with results

## 🛠️ NPM Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data
- `npm test` - Run tests
- `npm run lint` - Lint code

## 🔒 Security Features

- JWT authentication for sessions
- Wallet signature verification
- Rate limiting (10 req/min per IP)
- Input validation and sanitization
- SQL injection protection
- XSS prevention
- CORS configuration

## 🎮 Game Flow

1. **Waiting Phase** - Round created, waiting for players
2. **Active Phase** - 2+ players joined, 120s timer starts
3. **Judging Phase** - AI evaluates submissions (15s)
4. **Completed Phase** - Winner selected, prizes distributed
5. **Auto-restart** - New round starts after 30s

## 💰 0G Integration

- Entry fee: 0.025 0G per round
- Prize pool: 95% to winner, 5% house fee
- Automatic prize distribution
- Transaction verification on 0G network
- Hot wallet for automated payments

## 📊 Monitoring

- Winston logging with rotation
- Performance metrics
- Database query monitoring
- WebSocket connection tracking
- Error tracking and alerts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test game.service.test.js
```

## 🚀 Deployment

### Environment Variables (Production)
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure proper `ZG_HOT_WALLET_PRIVATE_KEY`
- Set `ADMIN_ADDRESSES` for admin access

### Database Backup
```bash
# Backup is created automatically in data/backups/
# Manual backup
node src/database/backup.js
```

### Process Management
Recommended to use PM2 for production:
```bash
pm2 start src/server.js --name "roast-backend"
pm2 logs roast-backend
pm2 monit
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Join our Discord community
- Contact the 0G team

---

Built with ❤️ by the 0G Roast Team 