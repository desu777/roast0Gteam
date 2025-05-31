const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');

/**
 * Creates router for Players endpoints
 * @param {PlayersController} playersController - Players Controller instance
 * @returns {express.Router} Express router
 */
function createPlayersRoutes(playersController) {
  const router = express.Router();

  // Rate limiting for players endpoints
  const playersRateLimit = rateLimit({
    windowMs: 60000, // 1 minute
    max: 30, // 30 requests per minute per IP
    message: {
      error: true,
      message: 'Too many player requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Rate limiting for verification endpoint (more restrictive)
  const verificationRateLimit = rateLimit({
    windowMs: 60000, // 1 minute
    max: 5, // 5 verification requests per minute per IP
    message: {
      error: true,
      message: 'Too many verification requests, please try again later',
      code: 'VERIFICATION_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Apply general rate limiting to all players routes
  router.use(playersRateLimit);

  /**
   * @route GET /api/players/health
   * @desc Health check for players service
   * @access Public
   */
  router.get('/health', async (req, res) => {
    await playersController.getHealthStatus(req, res);
  });

  /**
   * @route GET /api/players/profile/:address
   * @desc Get player profile and statistics
   * @access Public
   */
  router.get('/profile/:address',
    param('address')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid wallet address format'),
    async (req, res) => {
      await playersController.getProfile(req, res);
    }
  );

  /**
   * @route POST /api/players/verify
   * @desc Verify wallet signature for authentication
   * @access Public
   */
  router.post('/verify',
    verificationRateLimit, // Apply stricter rate limiting
    [
      body('address')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Invalid wallet address format'),
      body('signature')
        .isLength({ min: 130, max: 132 })
        .withMessage('Invalid signature format'),
      body('message')
        .isString()
        .isLength({ min: 10, max: 200 })
        .withMessage('Invalid message format'),
      body('timestamp')
        .isInt({ min: 1 })
        .withMessage('Invalid timestamp')
    ],
    async (req, res) => {
      await playersController.verifyWallet(req, res);
    }
  );

  /**
   * @route GET /api/players/leaderboard
   * @desc Get top players leaderboard
   * @access Public
   */
  router.get('/leaderboard',
    [
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('sortBy')
        .optional()
        .isIn(['wins', 'earnings', 'games', 'winRate'])
        .withMessage('Invalid sortBy option')
    ],
    async (req, res) => {
      await playersController.getLeaderboard(req, res);
    }
  );

  /**
   * @route GET /api/players/payments/:address
   * @desc Get player payment history
   * @access Public
   */
  router.get('/payments/:address',
    [
      param('address')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Invalid wallet address format'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be non-negative')
    ],
    async (req, res) => {
      await playersController.getPaymentHistory(req, res);
    }
  );

  /**
   * @route GET /api/players/stats
   * @desc Get service statistics
   * @access Public
   */
  router.get('/stats', async (req, res) => {
    await playersController.getServiceStats(req, res);
  });

  /**
   * @route GET /api/players/hall-of-fame
   * @desc Get Hall of Fame with multiple leaderboard categories
   * @access Public
   */
  router.get('/hall-of-fame',
    [
      query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
    ],
    async (req, res) => {
      await playersController.getHallOfFame(req, res);
    }
  );

  /**
   * @route GET /api/players/all-time-roasted
   * @desc Get comprehensive all-time roasting statistics
   * @access Public
   */
  router.get('/all-time-roasted', async (req, res) => {
    await playersController.getAllTimeRoasted(req, res);
  });

  // Error handling middleware specific to Players routes
  router.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: true,
        message: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      });
    }

    if (error.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        error: true,
        message: 'Invalid CSRF token',
        code: 'INVALID_CSRF'
      });
    }

    // Pass to global error handler
    next(error);
  });

  return router;
}

module.exports = { createPlayersRoutes }; 