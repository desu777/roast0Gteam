const Joi = require('joi');
const { REGEX, LIMITS, ERROR_CODES } = require('../utils/constants');

// Custom Joi validators
const customJoi = Joi.extend((joi) => ({
  type: 'ethereumAddress',
  base: joi.string(),
  messages: {
    'ethereumAddress.invalid': '{{#label}} must be a valid Ethereum address'
  },
  validate(value, helpers) {
    if (!REGEX.ETH_ADDRESS.test(value)) {
      return { value, errors: helpers.error('ethereumAddress.invalid') };
    }
    return { value: value.toLowerCase() };
  }
}));

// Validation schemas
const schemas = {
  // Common schemas
  ethereumAddress: customJoi.ethereumAddress(),
  
  transactionHash: Joi.string()
    .pattern(REGEX.TRANSACTION_HASH)
    .messages({
      'string.pattern.base': 'Invalid transaction hash format'
    }),

  roundId: Joi.number()
    .integer()
    .positive()
    .required(),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(LIMITS.PAGINATION_MAX)
      .default(LIMITS.PAGINATION_DEFAULT),
    sortBy: Joi.string().valid('created_at', 'prize_amount', 'player_count').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Game schemas
  submitRoast: Joi.object({
    roundId: Joi.number().integer().positive().required(),
    roastText: Joi.string()
      .min(LIMITS.MIN_ROAST_LENGTH)
      .max(LIMITS.MAX_ROAST_LENGTH)
      .trim()
      .required()
      .messages({
        'string.min': `Roast must be at least ${LIMITS.MIN_ROAST_LENGTH} characters`,
        'string.max': `Roast cannot exceed ${LIMITS.MAX_ROAST_LENGTH} characters`
      }),
    paymentTx: Joi.string().pattern(REGEX.TRANSACTION_HASH).required()
  }),

  createRound: Joi.object({
    judgeCharacter: Joi.string()
      .valid('michael', 'ada', 'jc', 'elisha', 'ren', 'yon', 'zer0', 'dao_agent')
      .required()
  }),

  // Player schemas
  verifyWallet: Joi.object({
    address: customJoi.ethereumAddress().required(),
    signature: Joi.string().required(),
    message: Joi.string().required(),
    timestamp: Joi.number().integer().positive().required()
  }),

  // Treasury schemas
  processPayment: Joi.object({
    playerAddress: customJoi.ethereumAddress().required(),
    transactionHash: Joi.string().pattern(REGEX.TRANSACTION_HASH).required(),
    amount: Joi.number().positive().required(),
    roundId: Joi.number().integer().positive().required()
  }),

  withdrawPrize: Joi.object({
    playerAddress: customJoi.ethereumAddress().required(),
    amount: Joi.number().positive().required(),
    resultId: Joi.number().integer().positive().required()
  }),

  // WebSocket schemas
  wsJoinRound: Joi.object({
    roundId: Joi.number().integer().positive().required(),
    signature: Joi.string().required()
  }),

  wsSubmitRoast: Joi.object({
    roundId: Joi.number().integer().positive().required(),
    roastText: Joi.string()
      .min(LIMITS.MIN_ROAST_LENGTH)
      .max(LIMITS.MAX_ROAST_LENGTH)
      .trim()
      .required(),
    paymentTx: Joi.string().pattern(REGEX.TRANSACTION_HASH).required()
  }),

  // AI schemas
  evaluateRoasts: Joi.object({
    roundId: Joi.number().integer().positive().required(),
    character: Joi.string()
      .valid('michael', 'ada', 'jc', 'elisha', 'ren', 'yon', 'zer0', 'dao_agent')
      .required()
  })
};

// Validation functions
const validate = (schema, data, options = {}) => {
  const result = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    ...options
  });

  if (result.error) {
    const errors = result.error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));

    return {
      valid: false,
      errors,
      value: null
    };
  }

  return {
    valid: true,
    errors: null,
    value: result.value
  };
};

// Express middleware for validation
const validateRequest = (schemaName, source = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      throw new Error(`Validation schema '${schemaName}' not found`);
    }

    const data = req[source];
    const result = validate(schema, data);

    if (!result.valid) {
      return res.status(400).json({
        error: true,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        errors: result.errors
      });
    }

    // Replace request data with validated and sanitized values
    req[source] = result.value;
    next();
  };
};

// Standalone validation functions
const isValidEthereumAddress = (address) => {
  return REGEX.ETH_ADDRESS.test(address);
};

const isValidTransactionHash = (hash) => {
  return REGEX.TRANSACTION_HASH.test(hash);
};

const isValidRoastLength = (text) => {
  const length = text.trim().length;
  return length >= LIMITS.MIN_ROAST_LENGTH && length <= LIMITS.MAX_ROAST_LENGTH;
};

// Profanity filter (basic implementation)
const containsProfanity = (text, profanityList = []) => {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word.toLowerCase()));
};

// Sanitize functions
const sanitizeRoastText = (text) => {
  // Remove excess whitespace
  let sanitized = text.trim().replace(/\s+/g, ' ');
  
  // Remove potential HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove zero-width characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Normalize quotes
  sanitized = sanitized.replace(/[""]/g, '"').replace(/['']/g, "'");
  
  return sanitized;
};

const sanitizeAddress = (address) => {
  return address ? address.toLowerCase().trim() : '';
};

// Export validation service
module.exports = {
  schemas,
  validate,
  validateRequest,
  isValidEthereumAddress,
  isValidTransactionHash,
  isValidRoastLength,
  containsProfanity,
  sanitizeRoastText,
  sanitizeAddress
}; 