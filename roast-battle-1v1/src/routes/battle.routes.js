const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const battleService = require('../services/battle.service');
const treasuryService = require('../services/treasury.service');
const characterService = require('../services/character.service');
const { logger } = require('../services/logger.service');
const { config } = require('../config/app.config');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      errors: errors.array()
    });
  }
  next();
};

// Get current battle
router.get('/current', async (req, res) => {
  try {
    const battleState = battleService.getBattleState();
    
    if (!battleState) {
      // Initialize new battle if none exists
      await battleService.initializeBattle();
      const newBattleState = battleService.getBattleState();
      
      return res.json({
        success: true,
        data: newBattleState,
        message: 'New battle created'
      });
    }
    
    res.json({
      success: true,
      data: battleState
    });
  } catch (error) {
    logger.error('Failed to get current battle', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'BATTLE_FETCH_FAILED',
      message: error.message
    });
  }
});

// Place a bet
router.post('/bet',
  [
    body('playerAddress').isEthereumAddress().withMessage('Invalid Ethereum address'),
    body('betSide').isIn(['og', 'roaster']).withMessage('Invalid bet side'),
    body('betAmount').custom((value) => {
      const amount = parseFloat(value);
      const expectedAmount = config.battle.betAmount; // 0.05 z .env
      
      if (isNaN(amount) || amount < 0.01) {
        throw new Error('Invalid bet amount - must be a positive number');
      }
      
      // Allow exact match or validate against expected amount
      if (Math.abs(amount - expectedAmount) > 0.001) {
        throw new Error(`Invalid bet amount - expected ${expectedAmount} 0G`);
      }
      
      return true;
    }),
    body('txHash').isHexadecimal().isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash')
  ],
  validate,
  async (req, res) => {
    try {
      const { playerAddress, betSide, betAmount, txHash } = req.body;
      
      if (config.logging.testEnv) {
        logger.info('🎯 Processing bet placement', {
          playerAddress: playerAddress.substring(0, 10) + '...',
          betSide,
          betAmount,
          txHash: txHash.substring(0, 10) + '...',
          treasuryInitialized: treasuryService.isInitialized
        });
      }
      
      // Verify payment if treasury is initialized
      if (treasuryService.isInitialized) {
        const isValid = await treasuryService.verifyBetPayment(
          txHash,
          parseFloat(betAmount),
          playerAddress
        );
        
        if (!isValid) {
          if (config.logging.testEnv) {
            logger.warn('❌ Payment verification failed', {
              txHash: txHash.substring(0, 10) + '...',
              betAmount,
              playerAddress: playerAddress.substring(0, 10) + '...'
            });
          }
          return res.status(400).json({
            success: false,
            error: 'INVALID_PAYMENT',
            message: 'Payment transaction could not be verified'
          });
        }
        
        if (config.logging.testEnv) {
          logger.info('✅ Payment verified successfully');
        }
      } else {
        if (config.logging.testEnv) {
          logger.warn('⚠️ Treasury not initialized - skipping payment verification');
        }
      }
      
      // Place bet
      const battleState = await battleService.placeBet(
        playerAddress,
        betSide,
        parseFloat(betAmount),
        txHash
      );
      
      // Confirm bet
      await battleService.confirmBet(txHash);
      
      if (config.logging.testEnv) {
        logger.info('✅ Bet placed successfully', {
          battleId: battleState.battleId,
          playerAddress: playerAddress.substring(0, 10) + '...',
          betSide,
          betAmount
        });
      }
      
      res.json({
        success: true,
        data: battleState,
        message: `Bet placed successfully on ${betSide} side`
      });
      
    } catch (error) {
      if (config.logging.testEnv) {
        logger.error('❌ Failed to place bet', { 
          error: error.message,
          stack: error.stack 
        });
      }
      
      logger.error('Failed to place bet', { error: error.message });
      
      let statusCode = 500;
      let errorCode = 'BET_FAILED';
      let message = error.message;
      
      if (error.message === 'ALREADY_BET') {
        statusCode = 400;
        errorCode = 'ALREADY_BET';
        message = 'You have already placed a bet on this battle';
      } else if (error.message === 'BETTING_CLOSED') {
        statusCode = 400;
        errorCode = 'BETTING_CLOSED';
        message = 'Betting is closed for this battle';
      } else if (error.message === 'NO_ACTIVE_BATTLE') {
        statusCode = 404;
        errorCode = 'NO_ACTIVE_BATTLE';
        message = 'No active battle found';
      }
      
      res.status(statusCode).json({
        success: false,
        error: errorCode,
        message
      });
    }
  }
);

// Get battle history
router.get('/history',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Invalid offset')
  ],
  validate,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || config.battle.historyDefaultLimit;
      const offset = parseInt(req.query.offset) || 0;
      
      const history = await battleService.getBattleHistory(limit, offset);
      
      res.json({
        success: true,
        data: history,
        pagination: {
          limit,
          offset,
          count: history.length
        }
      });
    } catch (error) {
      logger.error('Failed to get battle history', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'HISTORY_FETCH_FAILED',
        message: error.message
      });
    }
  }
);

// Get specific battle by ID
router.get('/history/:battleId',
  [
    param('battleId').notEmpty().withMessage('Battle ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { battleId } = req.params;
      
      // This would need to be implemented in battle service
      const battle = await battleService.getBattleById(battleId);
      
      if (!battle) {
        return res.status(404).json({
          success: false,
          error: 'BATTLE_NOT_FOUND',
          message: 'Battle not found'
        });
      }
      
      res.json({
        success: true,
        data: battle
      });
    } catch (error) {
      logger.error('Failed to get battle', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'BATTLE_FETCH_FAILED',
        message: error.message
      });
    }
  }
);

// Get player statistics
router.get('/stats/:address',
  [
    param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
  ],
  validate,
  async (req, res) => {
    try {
      const { address } = req.params;
      
      const stats = await battleService.getPlayerStats(address);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get player stats', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'STATS_FETCH_FAILED',
        message: error.message
      });
    }
  }
);

// Get leaderboard
router.get('/leaderboard',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit')
  ],
  validate,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || config.battle.leaderboardDefaultLimit;
      
      const leaderboard = await battleService.getLeaderboard(limit);
      
      res.json({
        success: true,
        data: leaderboard,
        limit
      });
    } catch (error) {
      logger.error('Failed to get leaderboard', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'LEADERBOARD_FETCH_FAILED',
        message: error.message
      });
    }
  }
);

// Get treasury statistics
router.get('/treasury', async (req, res) => {
  try {
    const stats = await treasuryService.getTreasuryStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get treasury stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'TREASURY_STATS_FAILED',
      message: error.message
    });
  }
});

// Start countdown manually (requires minimum bets)
router.post('/start-countdown', async (req, res) => {
  try {
    const battleState = await battleService.startCountdown();
    
    res.json({
      success: true,
      data: battleState,
      message: 'Countdown started successfully'
    });
  } catch (error) {
    logger.error('Failed to start countdown', { error: error.message });
    
    let statusCode = 500;
    let errorCode = 'COUNTDOWN_START_FAILED';
    let message = error.message;
    
    if (error.message === 'INSUFFICIENT_BETS') {
      statusCode = 400;
      errorCode = 'INSUFFICIENT_BETS';
      message = 'Minimum bets not reached';
    } else if (error.message === 'INVALID_BATTLE_STATUS') {
      statusCode = 400;
      errorCode = 'INVALID_STATUS';
      message = 'Battle is not in betting phase';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorCode,
      message
    });
  }
});

// Admin endpoints
router.post('/admin/force-end',
  [
    body('adminKey').notEmpty().withMessage('Admin key required')
  ],
  validate,
  async (req, res) => {
    try {
      const { adminKey } = req.body;
      
      const result = await battleService.forceEndBattle(adminKey);
      
      res.json({
        success: true,
        data: result,
        message: 'Battle ended successfully'
      });
    } catch (error) {
      logger.error('Failed to force end battle', { error: error.message });
      
      if (error.message === 'UNAUTHORIZED') {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid admin key'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'FORCE_END_FAILED',
        message: error.message
      });
    }
  }
);

router.post('/admin/emergency-withdraw',
  [
    body('adminKey').notEmpty().withMessage('Admin key required'),
    body('recipient').isEthereumAddress().withMessage('Invalid recipient address'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Invalid amount')
  ],
  validate,
  async (req, res) => {
    try {
      const { adminKey, recipient, amount } = req.body;
      
      const txHash = await treasuryService.emergencyWithdraw(
        recipient,
        parseFloat(amount),
        adminKey
      );
      
      res.json({
        success: true,
        data: { txHash },
        message: 'Emergency withdrawal successful'
      });
    } catch (error) {
      logger.error('Failed to process emergency withdrawal', { error: error.message });
      
      if (error.message === 'UNAUTHORIZED') {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid admin key'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'WITHDRAWAL_FAILED',
        message: error.message
      });
    }
  }
);

// Get gas estimates
router.get('/gas-estimate', async (req, res) => {
  try {
    const gasEstimate = await treasuryService.estimatePayoutGas();
    
    res.json({
      success: true,
      data: gasEstimate
    });
  } catch (error) {
    logger.error('Failed to estimate gas', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'GAS_ESTIMATE_FAILED',
      message: error.message
    });
  }
});

// Get battle configuration
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        betAmount: config.battle.betAmount,
        countdownDuration: config.battle.countdownDuration,
        houseFeePercent: config.battle.houseFeePercent,
        minBetsToStart: config.battle.minBetsToStart,
        network: {
          chainId: config.network.chainId,
          networkName: config.network.networkName,
          currencySymbol: config.network.currencySymbol
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get battle config', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'CONFIG_FETCH_FAILED',
      message: error.message
    });
  }
});

// Get battle global statistics
router.get('/stats', async (req, res) => {
  try {
    // Get all battle history for calculations
    const allBattles = await battleService.getAllBattleHistory();
    
    let totalVolume = 0;
    let ogWins = 0;
    let roasterWins = 0;
    
    allBattles.forEach(battle => {
      totalVolume += parseFloat(battle.total_pot || 0);
      if (battle.winner_side === 'og') {
        ogWins++;
      } else if (battle.winner_side === 'roaster') {
        roasterWins++;
      }
    });
    
    const totalBattles = allBattles.length;
    const ogWinRate = totalBattles > 0 ? ((ogWins / totalBattles) * 100).toFixed(1) : '0.0';
    const roasterWinRate = totalBattles > 0 ? ((roasterWins / totalBattles) * 100).toFixed(1) : '0.0';
    
    // Get best performers
    const bestPerformers = await battleService.getBestPerformers();
    
    res.json({
      success: true,
      data: {
        totalVolume,
        totalBattles,
        ogWins,
        roasterWins,
        ogWinRate: parseFloat(ogWinRate),
        roasterWinRate: parseFloat(roasterWinRate),
        bestPerformers
      }
    });
  } catch (error) {
    logger.error('Failed to get battle stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'BATTLE_STATS_FAILED',
      message: error.message
    });
  }
});

module.exports = router;