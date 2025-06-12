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
    address: process.env.TREASURY_ADDRESS
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.8,
    maxTokens: 1500
  },

  // Battle Configuration
  battle: {
    betAmount: parseFloat(process.env.BET_AMOUNT) || 0.5,
    countdownDuration: parseInt(process.env.COUNTDOWN_DURATION) || 90,
    houseFeePercent: parseFloat(process.env.HOUSE_FEE_PERCENT) || 5,
    maxDialogExchanges: parseInt(process.env.MAX_DIALOG_EXCHANGES) || 6,
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