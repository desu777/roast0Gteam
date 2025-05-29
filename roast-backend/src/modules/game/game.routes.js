const express = require('express');
const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');

function createGameRoutes(gameController) {
  const router = express.Router();

  // Middleware for logging requests in test environment
  router.use((req, res, next) => {
    if (config.logging.testEnv) {
      logger.debug('Game API request', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined
      });
    }
    next();
  });

  // ================================
  // GAME ROUTES
  // ================================

  // GET /api/game/current - Get current active round
  router.get('/current', (req, res) => {
    gameController.getCurrentRound(req, res);
  });

  // GET /api/game/rounds - Get recent rounds with pagination
  router.get('/rounds', (req, res) => {
    gameController.getRecentRounds(req, res);
  });

  // POST /api/game/rounds - Create new round (admin only)
  router.post('/rounds', (req, res) => {
    gameController.createRound(req, res);
  });

  // GET /api/game/rounds/:id - Get specific round details
  router.get('/rounds/:id', (req, res) => {
    gameController.getRoundById(req, res);
  });

  // GET /api/game/rounds/:id/submissions - Get submissions for a round
  router.get('/rounds/:id/submissions', (req, res) => {
    gameController.getRoundSubmissions(req, res);
  });

  // POST /api/game/rounds/:id/complete - Force complete round (admin only)
  router.post('/rounds/:id/complete', (req, res) => {
    gameController.forceCompleteRound(req, res);
  });

  // GET /api/game/stats - Get global game statistics
  router.get('/stats', (req, res) => {
    gameController.getGameStats(req, res);
  });

  // POST /api/game/join - Join current round with roast submission
  router.post('/join', (req, res) => {
    gameController.joinRound(req, res);
  });

  // POST /api/game/vote-next-judge - Set voting result for next judge
  router.post('/vote-next-judge', (req, res) => {
    gameController.setNextJudgeVoting(req, res);
  });

  // GET /api/game/health - Game service health check
  router.get('/health', (req, res) => {
    gameController.healthCheck(req, res);
  });

  // Error handling middleware for game routes
  router.use((err, req, res, next) => {
    logger.error('Game API error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: config.server.env === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });

  return router;
}

module.exports = createGameRoutes; 