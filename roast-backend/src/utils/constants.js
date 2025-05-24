// Game phases
const GAME_PHASES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  JUDGING: 'judging',
  COMPLETED: 'completed'
};

// WebSocket events
const WS_EVENTS = {
  // Client to Server
  JOIN_ROUND: 'join-round',
  SUBMIT_ROAST: 'submit-roast',
  LEAVE_ROUND: 'leave-round',
  PING: 'ping',
  
  // Server to Client
  ROUND_CREATED: 'round-created',
  ROUND_UPDATED: 'round-updated',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  TIMER_UPDATE: 'timer-update',
  JUDGING_STARTED: 'judging-started',
  ROUND_COMPLETED: 'round-completed',
  PRIZE_DISTRIBUTED: 'prize-distributed',
  ERROR: 'error',
  PONG: 'pong'
};

// WebSocket rooms
const WS_ROOMS = {
  GLOBAL: 'global',
  ADMIN: 'admin',
  ROUND: (roundId) => `game:${roundId}`
};

// Error codes
const ERROR_CODES = {
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Game errors
  ROUND_NOT_FOUND: 'ROUND_NOT_FOUND',
  ROUND_NOT_ACTIVE: 'ROUND_NOT_ACTIVE',
  ROUND_FULL: 'ROUND_FULL',
  ALREADY_SUBMITTED: 'ALREADY_SUBMITTED',
  INVALID_PHASE: 'INVALID_PHASE',
  
  // Player errors
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  TRANSACTION_TIMEOUT: 'TRANSACTION_TIMEOUT',
  
  // AI errors
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_EVALUATION_FAILED: 'AI_EVALUATION_FAILED',
  
  // WebSocket errors
  WS_CONNECTION_FAILED: 'WS_CONNECTION_FAILED',
  WS_INVALID_MESSAGE: 'WS_INVALID_MESSAGE'
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Time constants (in milliseconds)
const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
};

// Regex patterns
const REGEX = {
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
  HEX_STRING: /^0x[a-fA-F0-9]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/
};

// Character data (matches frontend)
const CHARACTERS = {
  michael: {
    id: 'michael',
    name: 'Michael',
    role: 'CEO & Visionary',
    evaluationWeights: {
      creativity: 0.25,
      technical: 0.15,
      humor: 0.20,
      originality: 0.25,
      community: 0.15
    }
  },
  ada: {
    id: 'ada',
    name: 'Ada',
    role: 'CMO & Dreamer',
    evaluationWeights: {
      creativity: 0.30,
      technical: 0.10,
      humor: 0.20,
      originality: 0.20,
      community: 0.20
    }
  },
  jc: {
    id: 'jc',
    name: 'JC',
    role: 'Head of Growth',
    evaluationWeights: {
      creativity: 0.20,
      technical: 0.20,
      humor: 0.25,
      originality: 0.25,
      community: 0.10
    }
  },
  elisha: {
    id: 'elisha',
    name: 'Elisha',
    role: 'Community Voice',
    evaluationWeights: {
      creativity: 0.20,
      technical: 0.15,
      humor: 0.20,
      originality: 0.15,
      community: 0.30
    }
  },
  ren: {
    id: 'ren',
    name: 'Ren',
    role: 'CTO & Tech Monk',
    evaluationWeights: {
      creativity: 0.15,
      technical: 0.35,
      humor: 0.15,
      originality: 0.25,
      community: 0.10
    }
  },
  yon: {
    id: 'yon',
    name: 'Yon',
    role: 'Community Champion',
    evaluationWeights: {
      creativity: 0.25,
      technical: 0.10,
      humor: 0.30,
      originality: 0.15,
      community: 0.20
    }
  }
};

// Default messages
const MESSAGES = {
  ROUND_STARTING: 'A new round is starting! Get ready to roast!',
  ROUND_STARTED: 'Round has started! Submit your best roast!',
  TIMER_WARNING: 'Only 30 seconds left to submit your roast!',
  JUDGING_STARTED: 'Time\'s up! The AI judge is evaluating submissions...',
  MAINTENANCE_MODE: 'The game is currently under maintenance. Please try again later.',
  WELCOME_MESSAGE: 'Welcome to 0G Roast Arena! May the best roaster win!'
};

// Limits and boundaries
const LIMITS = {
  MIN_ROAST_LENGTH: 10,
  MAX_ROAST_LENGTH: 280,
  MIN_PLAYERS_TO_START: 2,
  MAX_PLAYERS_PER_ROUND: 20,
  MAX_USERNAME_LENGTH: 20,
  MAX_REASON_LENGTH: 500,
  PAGINATION_DEFAULT: 10,
  PAGINATION_MAX: 50,
  LEADERBOARD_DEFAULT: 10,
  LEADERBOARD_MAX: 100
};

module.exports = {
  GAME_PHASES,
  WS_EVENTS,
  WS_ROOMS,
  ERROR_CODES,
  HTTP_STATUS,
  TIME,
  REGEX,
  CHARACTERS,
  MESSAGES,
  LIMITS
}; 