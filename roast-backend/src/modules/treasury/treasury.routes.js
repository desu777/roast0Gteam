const express = require('express');
const { body, param, query } = require('express-validator');
const TreasuryController = require('./treasury.controller');

const createTreasuryRoutes = (treasuryController) => {
  const router = express.Router();

  // Public routes
  
  /**
   * @route GET /api/treasury/config
   * @desc Get treasury configuration (public)
   * @access Public
   */
  router.get('/config', treasuryController.getTreasuryConfig.bind(treasuryController));

  /**
   * @route GET /api/treasury/health
   * @desc Get treasury service health status
   * @access Public
   */
  router.get('/health', treasuryController.getTreasuryHealth.bind(treasuryController));

  /**
   * @route GET /api/treasury/balance/:address
   * @desc Get 0G balance for wallet address
   * @access Public
   */
  router.get('/balance/:address',
    param('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid wallet address format'),
    treasuryController.getBalance.bind(treasuryController)
  );

  /**
   * @route POST /api/treasury/verify-payment
   * @desc Verify entry fee payment transaction
   * @access Public
   */
  router.post('/verify-payment',
    [
      body('txHash')
        .matches(/^0x[a-fA-F0-9]{64}$/)
        .withMessage('Invalid transaction hash format'),
      body('playerAddress')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Invalid player address format'),
      body('roundId')
        .notEmpty()
        .withMessage('Round ID is required')
    ],
    treasuryController.verifyPayment.bind(treasuryController)
  );

  /**
   * @route GET /api/treasury/payments/:address
   * @desc Get payment history for player
   * @access Public
   */
  router.get('/payments/:address',
    [
      param('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid wallet address format'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
    ],
    treasuryController.getPaymentHistory.bind(treasuryController)
  );

  /**
   * @route GET /api/treasury/recent-winners
   * @desc Get recent winners with their roasts
   * @access Public
   */
  router.get('/recent-winners',
    [
      query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
    ],
    treasuryController.getRecentWinners.bind(treasuryController)
  );

  // Admin routes (require admin authentication)
  // TODO: Add admin authentication middleware
  
  /**
   * @route GET /api/treasury/stats
   * @desc Get treasury statistics (admin only)
   * @access Admin
   */
  router.get('/stats', 
    // TODO: Add admin auth middleware
    treasuryController.getTreasuryStats.bind(treasuryController)
  );

  /**
   * @route POST /api/treasury/payout
   * @desc Process prize payout (admin only)
   * @access Admin
   */
  router.post('/payout',
    [
      // TODO: Add admin auth middleware
      body('winnerAddress')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Invalid winner address format'),
      body('roundId')
        .notEmpty()
        .withMessage('Round ID is required'),
      body('prizeAmount')
        .isFloat({ min: 0.001 })
        .withMessage('Prize amount must be a positive number')
    ],
    treasuryController.processPayout.bind(treasuryController)
  );

  return router;
};

module.exports = { createTreasuryRoutes, TreasuryController }; 