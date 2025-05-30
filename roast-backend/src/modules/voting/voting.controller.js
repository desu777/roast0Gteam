const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const { ERROR_CODES, HTTP_STATUS } = require('../../utils/constants');

class VotingController {
  constructor(votingService) {
    this.votingService = votingService;
    
    if (config.logging.testEnv) {
      logger.info('Voting controller initialized');
    }
  }

  /**
   * POST /api/voting/vote - Cast vote for next judge
   */
  async castVote(req, res) {
    try {
      const { roundId, characterId, voterAddress } = req.body;

      // Validate required fields
      if (!roundId || !characterId || !voterAddress) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Missing required fields: roundId, characterId, voterAddress'
        });
      }

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(voterAddress)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid wallet address format'
        });
      }

      const result = await this.votingService.castVote(roundId, voterAddress, characterId);

      if (result.success) {
        res.json({
          success: true,
          data: {
            voteId: result.voteId,
            votingStats: result.votingStats
          },
          message: 'Vote cast successfully'
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: result.error,
          message: result.error
        });
      }

    } catch (error) {
      logger.error('Failed to cast vote:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to cast vote'
      });
    }
  }

  /**
   * GET /api/voting/stats/:roundId - Get voting statistics for round
   */
  async getVotingStats(req, res) {
    try {
      const roundId = parseInt(req.params.roundId);
      
      if (isNaN(roundId) || roundId <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid round ID'
        });
      }

      const stats = this.votingService.getVotingStats(roundId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Failed to get voting stats:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to get voting statistics'
      });
    }
  }

  /**
   * GET /api/voting/user-vote/:roundId/:address - Check if user voted and their choice
   */
  async getUserVote(req, res) {
    try {
      const roundId = parseInt(req.params.roundId);
      const { address } = req.params;
      
      if (isNaN(roundId) || roundId <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid round ID'
        });
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid wallet address format'
        });
      }

      const hasVoted = this.votingService.hasUserVoted(roundId, address);
      const userVote = this.votingService.getUserVote(roundId, address);

      res.json({
        success: true,
        data: {
          hasVoted,
          characterId: userVote
        }
      });

    } catch (error) {
      logger.error('Failed to get user vote:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'Failed to check user vote'
      });
    }
  }

  /**
   * GET /api/voting/health - Voting service health check
   */
  async healthCheck(req, res) {
    try {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'voting'
      });
    } catch (error) {
      logger.error('Voting health check failed:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = VotingController; 