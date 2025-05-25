const { REGEX, LIMITS, GAME_PHASES, CHARACTERS } = require('./constants');
const { config } = require('../config/app.config');

// Validate game phase
const isValidGamePhase = (phase) => {
  return Object.values(GAME_PHASES).includes(phase);
};

// Validate character
const isValidCharacter = (characterId) => {
  return Object.keys(CHARACTERS).includes(characterId);
};

// Validate round can accept new players
const canJoinRound = (round, currentPlayerCount) => {
  if (!round) return { valid: false, reason: 'Round not found' };
  
  if (round.phase !== GAME_PHASES.WAITING && round.phase !== GAME_PHASES.ACTIVE) {
    return { valid: false, reason: 'Round is not accepting new players' };
  }
  
  if (currentPlayerCount >= round.max_players) {
    return { valid: false, reason: 'Round is full' };
  }
  
  return { valid: true };
};

// Validate round can start
const canStartRound = (round, playerCount) => {
  if (!round) return { valid: false, reason: 'Round not found' };
  
  if (round.phase !== GAME_PHASES.WAITING) {
    return { valid: false, reason: 'Round already started' };
  }
  
  if (playerCount < LIMITS.MIN_PLAYERS_TO_START) {
    return { 
      valid: false, 
      reason: `Need at least ${LIMITS.MIN_PLAYERS_TO_START} players to start` 
    };
  }
  
  return { valid: true };
};

// Validate submission eligibility
const canSubmitRoast = (round, playerAddress, existingSubmissions) => {
  if (!round) return { valid: false, reason: 'Round not found' };
  
  if (round.phase !== GAME_PHASES.WAITING && round.phase !== GAME_PHASES.ACTIVE) {
    return { valid: false, reason: 'Round is not accepting submissions' };
  }
  
  const hasSubmitted = existingSubmissions.some(
    sub => sub.player_address.toLowerCase() === playerAddress.toLowerCase()
  );
  
  if (hasSubmitted) {
    return { valid: false, reason: 'Already submitted to this round' };
  }
  
  return { valid: true };
};

// Validate transaction amount
const isValidEntryFee = (amount) => {
  const expectedFee = config.zg.entryFee;
  const tolerance = 0.0001; // Allow small rounding differences
  
  return Math.abs(amount - expectedFee) < tolerance;
};

// Validate transaction recency
const isRecentTransaction = (timestamp, maxAgeMs = config.security.transactionTimeout) => {
  const now = Date.now();
  const txTime = new Date(timestamp).getTime();
  
  return (now - txTime) < maxAgeMs;
};

// Validate signature timestamp
const isValidSignatureTimestamp = (timestamp) => {
  const now = Date.now();
  const signTime = parseInt(timestamp);
  
  // Check if timestamp is valid number
  if (isNaN(signTime)) return false;
  
  // Check if not in future
  if (signTime > now) return false;
  
  // Check if not too old
  return (now - signTime) < config.security.walletSignatureTimeout;
};

// Validate pagination parameters
const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(
    LIMITS.PAGINATION_MAX,
    Math.max(1, parseInt(limit) || LIMITS.PAGINATION_DEFAULT)
  );
  
  return {
    page: validPage,
    limit: validLimit,
    offset: (validPage - 1) * validLimit
  };
};

// Validate admin access
const isAdminAddress = (address) => {
  if (!address) return false;
  
  const normalizedAddress = address.toLowerCase();
  return config.admin.addresses.some(
    adminAddr => adminAddr.toLowerCase() === normalizedAddress
  );
};

// Validate roast content (advanced)
const validateRoastContent = (text) => {
  const errors = [];
  
  // Check length
  if (text.length < LIMITS.MIN_ROAST_LENGTH) {
    errors.push(`Roast must be at least ${LIMITS.MIN_ROAST_LENGTH} characters`);
  }
  
  if (text.length > LIMITS.MAX_ROAST_LENGTH) {
    errors.push(`Roast cannot exceed ${LIMITS.MAX_ROAST_LENGTH} characters`);
  }
  
  // Check for excessive repetition (zwiększam tolerancję)
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  const maxRepetition = Math.ceil(words.length * 0.5); // Zwiększam z 30% do 50%
  const tooRepetitive = Object.values(wordCount).some(count => count > maxRepetition);
  
  if (tooRepetitive) {
    errors.push('Roast contains too much repetition');
  }
  
  // Check for spam patterns (złagodzone)
  const spamPatterns = [
    /(.)\1{15,}/g, // Same character repeated 15+ times (było 10+)
    // Usuwam wzorzec dla powtarzających się słów - zbyt restrykcyjny
    // Usuwam wzorzec dla wielkich liter - normalny roast może być caps
  ];
  
  const hasSpamPattern = spamPatterns.some(pattern => pattern.test(text));
  
  if (hasSpamPattern) {
    errors.push('Roast appears to contain spam');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Validate WebSocket message
const validateWSMessage = (message) => {
  if (!message || typeof message !== 'object') {
    return { valid: false, error: 'Invalid message format' };
  }
  
  if (!message.type) {
    return { valid: false, error: 'Message type is required' };
  }
  
  if (!message.data || typeof message.data !== 'object') {
    return { valid: false, error: 'Message data is required' };
  }
  
  return { valid: true };
};

// Validate round completion eligibility
const canCompleteRound = (round, submissionCount) => {
  if (!round) return { valid: false, reason: 'Round not found' };
  
  if (round.phase !== GAME_PHASES.JUDGING) {
    return { valid: false, reason: 'Round is not in judging phase' };
  }
  
  if (submissionCount < LIMITS.MIN_PLAYERS_TO_START) {
    return { 
      valid: false, 
      reason: 'Not enough submissions to complete round' 
    };
  }
  
  return { valid: true };
};

module.exports = {
  isValidGamePhase,
  isValidCharacter,
  canJoinRound,
  canStartRound,
  canSubmitRoast,
  isValidEntryFee,
  isRecentTransaction,
  isValidSignatureTimestamp,
  validatePagination,
  isAdminAddress,
  validateRoastContent,
  validateWSMessage,
  canCompleteRound
}; 