const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const { ERROR_CODES, HTTP_STATUS } = require('../../utils/constants');

class AIController {
  constructor(aiService) {
    this.aiService = aiService;
    
    if (config.logging.testEnv) {
      logger.info('AI Controller initialized');
    }
  }

  /**
   * GET /api/ai/health - Status serwisu AI
   */
  async getHealthStatus(req, res) {
    try {
      const status = this.aiService.getServiceStatus();
      
      res.json({
        status: status.initialized && status.enabled ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        ...status
      });

    } catch (error) {
      logger.error('Failed to get AI health status:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to get AI service status',
        code: ERROR_CODES.AI_SERVICE_UNAVAILABLE
      });
    }
  }

  /**
   * GET /api/ai/characters - Pobiera wszystkie dostępne postacie
   */
  async getCharacters(req, res) {
    try {
      const characters = this.aiService.getAllCharacters();
      
      res.json({
        success: true,
        characters: Object.values(characters),
        count: Object.keys(characters).length
      });

    } catch (error) {
      logger.error('Failed to get characters:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to retrieve characters',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * GET /api/ai/characters/:id - Pobiera konkretną postać
   */
  async getCharacter(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Character ID is required',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      const character = this.aiService.getCharacter(id);
      
      res.json({
        success: true,
        character
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: true,
          message: error.message,
          code: ERROR_CODES.NOT_FOUND
        });
      }

      logger.error('Failed to get character:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to retrieve character',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * POST /api/ai/evaluate - Manualna evaluacja roastów (admin only)
   */
  async evaluateRoasts(req, res) {
    try {
      // TODO: Dodać middleware do sprawdzania uprawnień admina
      
      const { roundId, characterId, submissions, targetMember } = req.body;

      // Walidacja podstawowa
      if (!roundId || !characterId || !submissions || !Array.isArray(submissions)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Missing required fields: roundId, characterId, submissions',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      if (submissions.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'No submissions provided for evaluation',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      if (config.logging.testEnv) {
        logger.info('Manual AI evaluation requested', {
          roundId,
          characterId,
          submissionsCount: submissions.length,
          requestIp: req.ip
        });
      }

      // Wywołaj evaluację
      const result = await this.aiService.evaluateRoasts(
        roundId,
        characterId,
        submissions,
        targetMember
      );

      res.json({
        success: true,
        evaluation: result
      });

    } catch (error) {
      logger.error('Manual AI evaluation failed:', error);
      
      if (error.message.includes('not initialized')) {
        return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
          error: true,
          message: 'AI service not available',
          code: ERROR_CODES.AI_SERVICE_UNAVAILABLE
        });
      }

      if (error.message.includes('not found')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: error.message,
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'AI evaluation failed',
        code: ERROR_CODES.AI_EVALUATION_FAILED
      });
    }
  }

  /**
   * GET /api/ai/random-character - Pobiera losową postać
   */
  async getRandomCharacter(req, res) {
    try {
      const characterId = this.aiService.getRandomCharacter();
      const character = this.aiService.getCharacter(characterId);
      
      res.json({
        success: true,
        characterId,
        character
      });

    } catch (error) {
      logger.error('Failed to get random character:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to get random character',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * POST /api/ai/reset-counters - Reset dziennych liczników API (admin only)
   */
  async resetCounters(req, res) {
    try {
      // TODO: Dodać middleware do sprawdzania uprawnień admina
      
      this.aiService.resetDailyCounters();
      
      if (config.logging.testEnv) {
        logger.info('AI counters reset manually', { requestIp: req.ip });
      }

      res.json({
        success: true,
        message: 'API counters reset successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to reset AI counters:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to reset counters',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }
}

module.exports = { AIController }; 