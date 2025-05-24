const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const { ERROR_CODES, HTTP_STATUS } = require('../../utils/constants');

class PlayersController {
  constructor(playersService) {
    this.playersService = playersService;
    
    if (config.logging.testEnv) {
      logger.info('Players controller initialized');
    }
  }

  /**
   * GET /api/players/profile/:address - Get player profile
   */
  async getProfile(req, res) {
    try {
      const { address } = req.params;

      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Invalid wallet address format',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      const profile = this.playersService.getPlayerProfile(address);

      res.json({
        success: true,
        player: profile
      });

    } catch (error) {
      logger.error('Failed to get player profile:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to retrieve player profile',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * POST /api/players/verify - Verify wallet signature
   */
  async verifyWallet(req, res) {
    try {
      const { address, signature, message, timestamp } = req.body;

      // Validate required fields
      if (!address || !signature || !message || !timestamp) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Missing required fields: address, signature, message, timestamp',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Invalid wallet address format',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      // Validate timestamp
      if (typeof timestamp !== 'number' || timestamp <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Invalid timestamp format',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      const verification = await this.playersService.verifyWalletSignature(
        address,
        signature,
        message,
        timestamp
      );

      if (verification.valid) {
        // Get player profile after successful verification
        const profile = this.playersService.getPlayerProfile(verification.address);

        res.json({
          success: true,
          message: 'Wallet signature verified successfully',
          address: verification.address,
          timestamp: verification.timestamp,
          player: profile
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: verification.reason,
          code: ERROR_CODES.INVALID_SIGNATURE
        });
      }

    } catch (error) {
      logger.error('Wallet verification failed:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Wallet verification failed',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * GET /api/players/leaderboard - Get leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const { 
        limit = 10, 
        sortBy = 'earnings' 
      } = req.query;

      // Validate limit
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Limit must be between 1 and 100',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      // Validate sortBy
      const validSortOptions = ['wins', 'earnings', 'games', 'winRate'];
      if (!validSortOptions.includes(sortBy)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: `Invalid sortBy option. Valid options: ${validSortOptions.join(', ')}`,
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      const leaderboard = this.playersService.getLeaderboard(parsedLimit, sortBy);

      res.json({
        success: true,
        leaderboard,
        meta: {
          total: leaderboard.length,
          sortBy,
          limit: parsedLimit
        }
      });

    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to retrieve leaderboard',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * GET /api/players/payments/:address - Get player payment history
   */
  async getPaymentHistory(req, res) {
    try {
      const { address } = req.params;
      const { 
        limit = 10, 
        offset = 0 
      } = req.query;

      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Invalid wallet address format',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      // Validate pagination parameters
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);

      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Limit must be between 1 and 100',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Offset must be non-negative',
          code: ERROR_CODES.VALIDATION_ERROR
        });
      }

      const paymentHistory = this.playersService.getPlayerPaymentHistory(
        address,
        parsedLimit,
        parsedOffset
      );

      res.json({
        success: true,
        ...paymentHistory
      });

    } catch (error) {
      logger.error('Failed to get payment history:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to retrieve payment history',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * GET /api/players/stats - Get service statistics
   */
  async getServiceStats(req, res) {
    try {
      const stats = this.playersService.getServiceStats();

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      logger.error('Failed to get service stats:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Failed to retrieve service statistics',
        code: ERROR_CODES.INTERNAL_ERROR
      });
    }
  }

  /**
   * GET /api/players/health - Health check
   */
  async getHealthStatus(req, res) {
    try {
      const stats = this.playersService.getServiceStats();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        players: {
          totalPlayers: stats.totalPlayers,
          totalGamesPlayed: stats.totalGamesPlayed
        }
      });

    } catch (error) {
      logger.error('Players health check failed:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = { PlayersController }; 