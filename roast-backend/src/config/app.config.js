const path = require('path');
require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3001,
    host: process.env.HOST || 'localhost'
  },

  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || './data/roast.db',
    backupPath: process.env.DATABASE_BACKUP_PATH || './data/backups/',
    pragmas: {
      journal_mode: 'WAL',
      synchronous: 'NORMAL',
      cache_size: 10000,
      temp_store: 'MEMORY',
      mmap_size: 268435456 // 256MB
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    testEnv: process.env.TEST_ENV === 'true'
  },

  // CORS Configuration
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:3000', 'http://localhost:3001']
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    submissionRateLimit: parseInt(process.env.SUBMISSION_RATE_LIMIT) || 1
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // 0G Network Configuration
  zg: {
    networkRpc: process.env.ZERO_G_NETWORK_RPC || process.env.ZG_NETWORK_RPC || 'https://evmrpc-testnet.0g.ai',
    chainId: parseInt(process.env.ZERO_G_CHAIN_ID || process.env.ZG_CHAIN_ID) || 16601,
    networkName: process.env.ZERO_G_NETWORK_NAME || '0G-Galileo-Testnet',
    explorer: process.env.ZERO_G_EXPLORER || 'https://chainscan-galileo.0g.ai/',
    currencySymbol: process.env.ZERO_G_CURRENCY_SYMBOL || '0G',
    currencyDecimals: parseInt(process.env.ZERO_G_CURRENCY_DECIMALS) || 18,
    hotWalletPrivateKey: process.env.TREASURY_PRIVATE_KEY || process.env.ZG_HOT_WALLET_PRIVATE_KEY,
    treasuryPublicAddress: process.env.TREASURY_PUBLIC_ADDRESS,
    entryFee: parseFloat(process.env.ZG_ENTRY_FEE) || 0.025,
    houseFeePercentage: parseInt(process.env.ZG_HOUSE_FEE_PERCENTAGE) || 5
  },

  // AI Service Configuration
  ai: {
    enabled: process.env.AI_SERVICE_ENABLED !== 'false',
    evaluationTimeout: parseInt(process.env.AI_EVALUATION_TIMEOUT) || 15000,
    fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
    
    // OpenRouter Configuration
    model: process.env.AI_MODEL || 'meta-llama/llama-4-maverick:free',
    siteUrl: process.env.AI_SITE_URL || 'https://roastarena.0g.ai',
    siteName: process.env.AI_SITE_NAME || '0G Roast Arena',
    maxRequestsPerKey: parseInt(process.env.AI_MAX_REQUESTS_PER_KEY) || 1000,
    keyResetHours: parseInt(process.env.AI_KEY_RESET_HOURS) || 24,
    
    // API Keys (rotacja sekwencyjna)
    apiKeys: [
      process.env.REACT_APP_OPEN_ROUTER_API_KEY,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY2,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY3,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY4,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY5,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY6,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY7,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY8,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY9,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY10,
      process.env.REACT_APP_OPEN_ROUTER_API_KEY11
    ].filter(key => key && key.trim() !== ''), // Filtrujemy puste klucze
    
    // OpenRouter API
    apiBaseUrl: 'https://openrouter.ai/api/v1/chat/completions'
  },

  // Game Configuration
  game: {
    roundTimerDuration: parseInt(process.env.ROUND_TIMER_DURATION) || 120,
    judgingDuration: parseInt(process.env.JUDGING_DURATION) || 15,
    nextRoundDelay: parseInt(process.env.NEXT_ROUND_DELAY) || 20,
    maxPlayersPerRound: parseInt(process.env.MAX_PLAYERS_PER_ROUND) || 20,
    maxRoastLength: parseInt(process.env.MAX_ROAST_LENGTH) || 280
  },

  // WebSocket Configuration
  websocket: {
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT) || 30000,
    pingInterval: parseInt(process.env.WS_PING_INTERVAL) || 25000,
    upgradeTimeout: parseInt(process.env.WS_UPGRADE_TIMEOUT) || 10000
  },

  // Security Configuration
  security: {
    walletSignatureTimeout: parseInt(process.env.WALLET_SIGNATURE_TIMEOUT) || 300000,
    transactionTimeout: parseInt(process.env.TRANSACTION_TIMEOUT) || 300000,
    enableProfanityFilter: process.env.ENABLE_PROFANITY_FILTER !== 'false'
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.ENABLE_METRICS !== 'false',
    port: parseInt(process.env.METRICS_PORT) || 9090
  },

  // Admin Configuration
  admin: {
    addresses: process.env.ADMIN_ADDRESSES 
      ? process.env.ADMIN_ADDRESSES.split(',').map(addr => addr.trim())
      : []
  },

  // Game Phases
  phases: {
    WAITING: 'waiting',
    ACTIVE: 'active',
    JUDGING: 'judging',
    COMPLETED: 'completed'
  },

  // Team Characters (from frontend)
  characters: ['michael', 'ada', 'jc', 'elisha', 'ren', 'yon']
};

// Validation function
const validateConfig = () => {
  const errors = [];

  if (!config.zg.hotWalletPrivateKey && config.server.env === 'production') {
    errors.push('TREASURY_PRIVATE_KEY (or ZG_HOT_WALLET_PRIVATE_KEY) is required in production');
  }

  if (!config.zg.treasuryPublicAddress && config.server.env === 'production') {
    errors.push('TREASURY_PUBLIC_ADDRESS is required in production');
  }

  if (!config.jwt.secret || config.jwt.secret === 'default-secret-change-in-production') {
    if (config.server.env === 'production') {
      errors.push('JWT_SECRET must be set in production');
    }
  }

  if (config.admin.addresses.length === 0 && config.server.env === 'production') {
    errors.push('At least one ADMIN_ADDRESS must be configured in production');
  }

  // Validate 0G Network configuration
  if (!config.zg.networkRpc) {
    errors.push('0G Network RPC URL is required (ZERO_G_NETWORK_RPC)');
  }

  if (!config.zg.chainId || config.zg.chainId <= 0) {
    errors.push('Valid 0G Chain ID is required (ZERO_G_CHAIN_ID)');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Export config and validation
module.exports = {
  config,
  validateConfig
}; 