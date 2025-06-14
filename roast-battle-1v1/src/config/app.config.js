require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3002,
    env: process.env.NODE_ENV || 'development',
    testEnv: process.env.TEST_ENV === 'true'
  },

  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || './data/battle.db',
    pragmas: {
      journal_mode: 'WAL',
      synchronous: 'NORMAL',
      cache_size: 1000,
      foreign_keys: 'ON'
    }
  },

  // 0G Network Configuration
  network: {
    chainId: parseInt(process.env.ZERO_G_CHAIN_ID) || 16601,
    networkName: process.env.ZERO_G_NETWORK_NAME || '0G-Galileo-Testnet',
    rpcUrl: process.env.ZERO_G_NETWORK_URL || 'https://evmrpc-testnet.0g.ai',
    explorerUrl: process.env.ZERO_G_EXPLORER || 'https://chainscan-galileo.0g.ai/',
    currencySymbol: process.env.ZERO_G_CURRENCY_SYMBOL || '0G',
    currencyDecimals: parseInt(process.env.ZERO_G_CURRENCY_DECIMALS) || 18
  },

  // Treasury Configuration
  treasury: {
    privateKey: process.env.TREASURY_PRIVATE_KEY,
    address: process.env.TREASURY_ADDRESS,
    payoutInterval: parseInt(process.env.TREASURY_PAYOUT_INTERVAL) || 5000,
    gasLimit: parseInt(process.env.TREASURY_GAS_LIMIT) || 21000,
    payoutBatchSize: parseInt(process.env.TREASURY_PAYOUT_BATCH_SIZE) || 10,
    maxRetryAttempts: parseInt(process.env.TREASURY_MAX_RETRY_ATTEMPTS) || 3
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.8,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1500,
    streaming: process.env.OPENAI_STREAMING === 'true'
  },

  // AI Dialog Configuration
  ai: {
    maxDialogExchanges: parseInt(process.env.AI_MAX_DIALOG_EXCHANGES) || 8,
    exchangeBaseDelay: parseInt(process.env.AI_EXCHANGE_BASE_DELAY) || 3500,
    exchangeCharDelay: parseInt(process.env.AI_EXCHANGE_CHAR_DELAY) || 30,
    exchangeMaxDelay: parseInt(process.env.AI_EXCHANGE_MAX_DELAY) || 7000,
    impactMin: parseInt(process.env.AI_IMPACT_MIN) || 1,
    impactMax: parseInt(process.env.AI_IMPACT_MAX) || 10,
    scoreMin: parseInt(process.env.AI_SCORE_MIN) || 0,
    scoreMax: parseInt(process.env.AI_SCORE_MAX) || 100
  },

  // Battle Configuration
  battle: {
    betAmount: parseFloat(process.env.BET_AMOUNT) || 0.5,
    countdownDuration: parseInt(process.env.COUNTDOWN_DURATION) || 90,
    countdownTimerInterval: parseInt(process.env.COUNTDOWN_TIMER_INTERVAL) || 1000,
    battleEndDelay: parseInt(process.env.BATTLE_END_DELAY) || 15000,
    houseFeePercent: parseFloat(process.env.HOUSE_FEE_PERCENT) || 5,
    historyDefaultLimit: parseInt(process.env.BATTLE_HISTORY_DEFAULT_LIMIT) || 20,
    leaderboardDefaultLimit: parseInt(process.env.LEADERBOARD_DEFAULT_LIMIT) || 10,
    minBetsToStart: {
      og: 1,
      roaster: 1
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // WebSocket Configuration
  websocket: {
    connectionTimeout: parseInt(process.env.WS_CONNECTION_TIMEOUT) || 10000,
    reconnectMaxDelay: parseInt(process.env.WS_RECONNECT_MAX_DELAY) || 30000
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || './logs/battle-1v1.log',
    testEnv: process.env.TEST_ENV === 'true'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // Admin Configuration
  admin: {
    key: process.env.ADMIN_KEY
  }
};

// Validate required environment variables
function validateConfig() {
  const required = [
    'TREASURY_PRIVATE_KEY',
    'TREASURY_ADDRESS',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && config.server.env === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (missing.length > 0 && config.logging.testEnv) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
}

// Validate on load
validateConfig();

module.exports = { config }; 