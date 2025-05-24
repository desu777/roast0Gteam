const express = require('express');
const rateLimit = require('express-rate-limit');
const { config } = require('../../config/app.config');

/**
 * Tworzy router dla AI endpoints
 * @param {AIController} aiController - AI Controller instance
 * @returns {express.Router} Express router
 */
function createAIRoutes(aiController) {
  const router = express.Router();

  // Rate limiting dla AI endpoints
  const aiRateLimit = rateLimit({
    windowMs: 60000, // 1 minuta
    max: 20, // 20 requests per minute per IP
    message: {
      error: true,
      message: 'Too many AI requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Rate limiting dla evaluation endpoint (bardziej restrykcyjny)
  const evaluationRateLimit = rateLimit({
    windowMs: 60000, // 1 minuta
    max: 2, // 2 evaluation requests per minute per IP
    message: {
      error: true,
      message: 'Too many evaluation requests, please try again later',
      code: 'EVALUATION_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Apply rate limiting do wszystkich AI routes
  router.use(aiRateLimit);

  // Health check endpoint
  router.get('/health', async (req, res) => {
    await aiController.getHealthStatus(req, res);
  });

  // Characters endpoints
  router.get('/characters', async (req, res) => {
    await aiController.getCharacters(req, res);
  });

  router.get('/characters/:id', async (req, res) => {
    await aiController.getCharacter(req, res);
  });

  router.get('/random-character', async (req, res) => {
    await aiController.getRandomCharacter(req, res);
  });

  // Evaluation endpoint (admin only z dodatkowym rate limiting)
  router.post('/evaluate', evaluationRateLimit, async (req, res) => {
    await aiController.evaluateRoasts(req, res);
  });

  // Admin endpoints
  router.post('/reset-counters', async (req, res) => {
    await aiController.resetCounters(req, res);
  });

  // Error handling middleware specific to AI routes
  router.use((error, req, res, next) => {
    if (config.logging.testEnv) {
      console.error('AI Routes Error:', error);
    }

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

module.exports = { createAIRoutes }; 