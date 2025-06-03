const express = require('express');
const rateLimit = require('express-rate-limit');
const { config } = require('../../config/app.config');

/**
 * Creates router for Voting endpoints
 * @param {VotingController} votingController - Voting Controller instance
 * @returns {express.Router} Express router
 */
function createVotingRoutes(votingController) {
  const router = express.Router();

  // Rate limiting for voting endpoints - increased for production
  const votingRateLimit = rateLimit({
    windowMs: 60000, // 1 minute
    max: config.server.env === 'production' ? 50 : 10, // 50 requests per minute in production, 10 in dev
    message: {
      error: true,
      message: 'Too many voting requests, please try again later',
      code: 'VOTING_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks and stats endpoints in production
      return config.server.env === 'production' && 
             (req.path.includes('/health') || req.path.includes('/stats/'));
    }
  });

  // Rate limiting for vote casting - more lenient for production
  const voteRateLimit = rateLimit({
    windowMs: 60000, // 1 minute
    max: config.server.env === 'production' ? 5 : 2, // 5 votes per minute in production, 2 in dev
    message: {
      error: true,
      message: 'Too many vote attempts, please try again later',
      code: 'VOTE_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Apply general rate limiting
  router.use(votingRateLimit);

  /**
   * @route GET /api/voting/health
   * @desc Health check for voting service
   * @access Public
   */
  router.get('/health', async (req, res) => {
    await votingController.healthCheck(req, res);
  });

  /**
   * @route POST /api/voting/vote
   * @desc Cast vote for next judge
   * @access Public (authenticated users)
   */
  router.post('/vote', voteRateLimit, async (req, res) => {
    await votingController.castVote(req, res);
  });

  /**
   * @route GET /api/voting/stats/:roundId
   * @desc Get voting statistics for round
   * @access Public
   */
  router.get('/stats/:roundId', async (req, res) => {
    await votingController.getVotingStats(req, res);
  });

  /**
   * @route GET /api/voting/user-vote/:roundId/:address
   * @desc Check user's vote for round
   * @access Public
   */
  router.get('/user-vote/:roundId/:address', async (req, res) => {
    await votingController.getUserVote(req, res);
  });

  // Error handling middleware
  router.use((error, req, res, next) => {
    if (config.logging.testEnv) {
      console.error('Voting Routes Error:', error);
    }

    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: true,
        message: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      });
    }

    // Pass to global error handler
    next(error);
  });

  return router;
}

module.exports = { createVotingRoutes }; 