const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const database = require('../../database/database.service');
const { 
  HTTP_STATUS, 
  ERROR_CODES,
  LIMITS 
} = require('../../utils/constants');
const { 
  validatePagination,
  isAdminAddress,
  validateRoastContent 
} = require('../../utils/validators');
const GameService = require('./game.service');

class GameController {
  constructor(gameService) {
    this.gameService = gameService;
  }

  // ================================
  // GAME ENDPOINTS
  // ================================

  /**
   * GET /api/game/current - Get current active round
   */
  async getCurrentRound(req, res) {
    try {
      const currentRound = this.gameService.getCurrentRound();
      
      if (!currentRound) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_CODES.ROUND_NOT_FOUND,
          message: 'No active round found'
        });
      }

      if (config.logging.testEnv) {
        logger.debug('Current round requested', { roundId: currentRound.id });
      }

      res.json({
        success: true,
        data: currentRound
      });

    } catch (error) {
      logger.error('Error getting current round', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to get current round'
      });
    }
  }

  /**
   * GET /api/game/rounds - Get recent rounds with pagination
   */
  async getRecentRounds(req, res) {
    try {
      const { page, limit, offset } = validatePagination(req.query.page, req.query.limit);
      
      const rounds = database.getRecentRounds(limit, offset);
      const totalCount = database.db.prepare(
        'SELECT COUNT(*) as count FROM rounds'
      ).get().count;

      if (config.logging.testEnv) {
        logger.debug('Recent rounds requested', { page, limit, totalCount });
      }

      res.json({
        success: true,
        data: {
          rounds,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: (page * limit) < totalCount,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Error getting recent rounds', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to get recent rounds'
      });
    }
  }

  /**
   * POST /api/game/rounds - Create new round (admin only)
   */
  async createRound(req, res) {
    try {
      // Check admin permissions
      const adminAddress = req.headers['x-admin-address'];
      if (!adminAddress || !isAdminAddress(adminAddress)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: ERROR_CODES.FORBIDDEN,
          message: 'Admin access required'
        });
      }

      const result = await this.gameService.createNewRound();
      
      if (!result.success) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: result.error,
          message: result.message || 'Failed to create round'
        });
      }

      if (config.logging.testEnv) {
        logger.info('Round created by admin', { 
          adminAddress,
          roundId: result.round.id 
        });
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: result.round,
        message: result.message
      });

    } catch (error) {
      logger.error('Error creating round', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to create round'
      });
    }
  }

  /**
   * GET /api/game/rounds/:id - Get specific round details
   */
  async getRoundById(req, res) {
    try {
      const roundId = parseInt(req.params.id);
      
      if (isNaN(roundId) || roundId <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid round ID'
        });
      }

      const round = database.getRoundById(roundId);
      if (!round) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_CODES.ROUND_NOT_FOUND,
          message: 'Round not found'
        });
      }

      // Get submissions for this round
      const submissions = this.gameService.getRoundSubmissions(roundId, false);
      
      // Get result if round is completed
      let result = null;
      if (round.phase === 'completed') {
        result = database.db.prepare(
          'SELECT * FROM results WHERE round_id = ?'
        ).get(roundId);
      }

      if (config.logging.testEnv) {
        logger.debug('Round details requested', { roundId });
      }

      res.json({
        success: true,
        data: {
          round: {
            ...round,
            playerCount: submissions.length
          },
          submissions,
          result
        }
      });

    } catch (error) {
      logger.error('Error getting round details', { 
        error: error.message,
        roundId: req.params.id 
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to get round details'
      });
    }
  }

  /**
   * GET /api/game/stats - Get global game statistics
   */
  async getGameStats(req, res) {
    try {
      const stats = this.gameService.getGameStats();

      if (config.logging.testEnv) {
        logger.debug('Game stats requested');
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error getting game stats', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to get game statistics'
      });
    }
  }

  /**
   * POST /api/game/join - Join current round with roast submission
   */
  async joinRound(req, res) {
    try {
      const { playerAddress, roastText, paymentTxHash } = req.body;

      // Validate required fields
      if (!playerAddress || !roastText) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Player address and roast text are required'
        });
      }

      // Validate roast content
      const contentValidation = validateRoastContent(roastText);
      if (!contentValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: contentValidation.errors.join(', ')
        });
      }

      // Payment verification is now handled by GameService

      const result = await this.gameService.joinRound(
        playerAddress, 
        roastText, 
        paymentTxHash
      );

      if (!result.success) {
        const statusCode = result.error === ERROR_CODES.ROUND_NOT_FOUND 
          ? HTTP_STATUS.NOT_FOUND 
          : HTTP_STATUS.BAD_REQUEST;

        return res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }

      if (config.logging.testEnv) {
        logger.info('Player joined round via API', { 
          playerAddress,
          roundId: result.round.id,
          playerCount: result.playerCount
        });
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          submissionId: result.submissionId,
          playerCount: result.playerCount,
          round: result.round
        },
        message: 'Successfully joined round'
      });

    } catch (error) {
      logger.error('Error joining round', { 
        error: error.message,
        playerAddress: req.body.playerAddress 
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to join round'
      });
    }
  }

  /**
   * POST /api/game/rounds/:id/complete - Force complete round (admin only)
   */
  async forceCompleteRound(req, res) {
    try {
      // Check admin permissions
      const adminAddress = req.headers['x-admin-address'];
      if (!adminAddress || !isAdminAddress(adminAddress)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: ERROR_CODES.FORBIDDEN,
          message: 'Admin access required'
        });
      }

      const roundId = parseInt(req.params.id);
      
      if (isNaN(roundId) || roundId <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid round ID'
        });
      }

      const result = await this.gameService.completeRound(roundId);

      if (!result.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.INVALID_PHASE,
          message: result.message
        });
      }

      if (config.logging.testEnv) {
        logger.info('Round force completed by admin', { 
          adminAddress,
          roundId,
          winner: result.winner.player_address
        });
      }

      res.json({
        success: true,
        data: {
          winner: result.winner,
          prizeAmount: result.prizeAmount,
          aiReasoning: result.aiReasoning
        },
        message: 'Round completed successfully'
      });

    } catch (error) {
      logger.error('Error force completing round', { 
        error: error.message,
        roundId: req.params.id 
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to complete round'
      });
    }
  }

  /**
   * GET /api/game/rounds/:id/submissions - Get submissions for a round
   */
  async getRoundSubmissions(req, res) {
    try {
      const roundId = parseInt(req.params.id);
      const includeFullText = req.query.full === 'true';
      
      if (isNaN(roundId) || roundId <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid round ID'
        });
      }

      // Check if round exists
      const round = database.getRoundById(roundId);
      if (!round) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: ERROR_CODES.ROUND_NOT_FOUND,
          message: 'Round not found'
        });
      }

      // Only show full text for completed rounds or admins
      const adminAddress = req.headers['x-admin-address'];
      const canViewFullText = includeFullText && 
        (round.phase === 'completed' || isAdminAddress(adminAddress));

      const submissions = this.gameService.getRoundSubmissions(roundId, canViewFullText);

      if (config.logging.testEnv) {
        logger.debug('Round submissions requested', { 
          roundId, 
          includeFullText: canViewFullText 
        });
      }

      res.json({
        success: true,
        data: {
          roundId,
          submissions,
          totalCount: submissions.length
        }
      });

    } catch (error) {
      logger.error('Error getting round submissions', { 
        error: error.message,
        roundId: req.params.id 
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to get round submissions'
      });
    }
  }

  /**
   * POST /api/game/vote-next-judge - Set voting result for next judge
   */
  async setNextJudgeVoting(req, res) {
    try {
      const { characterId, totalVotes } = req.body;

      if (!characterId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Character ID is required'
        });
      }

      const result = this.gameService.setNextJudgeVotingResult(characterId);
      
      if (!result.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: result.error
        });
      }

      if (config.logging.testEnv) {
        logger.info('Next judge voting result submitted', { 
          characterId,
          totalVotes: totalVotes || 'unknown'
        });
      }

      res.json({
        success: true,
        data: {
          nextJudge: result.nextJudge,
          totalVotes: totalVotes || 0
        },
        message: 'Voting result accepted'
      });

    } catch (error) {
      logger.error('Error setting next judge voting result', { 
        error: error.message,
        body: req.body 
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to set voting result'
      });
    }
  }

  // ================================
  // HEALTH CHECK
  // ================================

  /**
   * GET /api/game/health - Game service health check
   */
  async healthCheck(req, res) {
    try {
      const currentRound = this.gameService.getCurrentRound();
      const activeTimers = this.gameService.activeTimers.size;
      
      res.json({
        success: true,
        data: {
          status: 'healthy',
          currentRound: currentRound ? {
            id: currentRound.id,
            phase: currentRound.phase,
            playerCount: currentRound.playerCount
          } : null,
          activeTimers,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Game health check failed', { error: error.message });
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Game service unhealthy'
      });
    }
  }
}

module.exports = GameController; 