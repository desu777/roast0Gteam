const TreasuryService = require('./treasury.service');
const { logger } = require('../../services/logger.service');
const { config } = require('../../config/app.config');
const database = require('../../database/database.service');

class TreasuryController {
  constructor(treasuryService) {
    this.treasuryService = treasuryService || new TreasuryService();
  }

  /**
   * Get player's 0G balance
   * GET /api/treasury/balance/:address
   */
  async getBalance(req, res) {
    try {
      const { address } = req.params;

      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({
          error: true,
          message: 'Invalid wallet address format'
        });
      }

      const balance = await this.treasuryService.getBalance(address);

      res.json({
        address,
        balance,
        currency: config.zg.currencySymbol,
        network: config.zg.networkName
      });

    } catch (error) {
      logger.error('Failed to get balance:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve balance'
      });
    }
  }

  /**
   * Verify entry fee payment
   * POST /api/treasury/verify-payment
   * Body: { txHash, playerAddress, roundId }
   */
  async verifyPayment(req, res) {
    try {
      const { txHash, playerAddress, roundId } = req.body;

      // Validate input
      if (!txHash || !playerAddress || !roundId) {
        return res.status(400).json({
          error: true,
          message: 'Missing required fields: txHash, playerAddress, roundId'
        });
      }

      if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        return res.status(400).json({
          error: true,
          message: 'Invalid transaction hash format'
        });
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
        return res.status(400).json({
          error: true,
          message: 'Invalid wallet address format'
        });
      }

      const verification = await this.treasuryService.verifyEntryFeePayment(
        txHash, 
        playerAddress, 
        roundId
      );

      if (verification.valid) {
        res.json({
          success: true,
          message: 'Payment verified successfully',
          txHash,
          amount: verification.amount,
          currency: config.zg.currencySymbol,
          blockNumber: verification.receipt.blockNumber
        });
      } else {
        res.status(400).json({
          error: true,
          message: verification.reason,
          txHash
        });
      }

    } catch (error) {
      logger.error('Failed to verify payment:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to verify payment'
      });
    }
  }

  /**
   * Process prize payout (Admin only)
   * POST /api/treasury/payout
   * Body: { winnerAddress, roundId, prizeAmount }
   */
  async processPayout(req, res) {
    try {
      const { winnerAddress, roundId, prizeAmount } = req.body;

      // Validate input
      if (!winnerAddress || !roundId || !prizeAmount) {
        return res.status(400).json({
          error: true,
          message: 'Missing required fields: winnerAddress, roundId, prizeAmount'
        });
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(winnerAddress)) {
        return res.status(400).json({
          error: true,
          message: 'Invalid winner address format'
        });
      }

      if (typeof prizeAmount !== 'number' || prizeAmount <= 0) {
        return res.status(400).json({
          error: true,
          message: 'Invalid prize amount'
        });
      }

      const payout = await this.treasuryService.sendPrizePayout(
        winnerAddress,
        roundId,
        prizeAmount
      );

      res.json({
        success: true,
        message: 'Prize payout completed successfully',
        txHash: payout.txHash,
        amount: payout.amount,
        currency: config.zg.currencySymbol,
        winnerAddress,
        roundId
      });

    } catch (error) {
      logger.error('Failed to process payout:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to process payout'
      });
    }
  }

  /**
   * Get treasury statistics (Admin only)
   * GET /api/treasury/stats
   */
  async getTreasuryStats(req, res) {
    try {
      const stats = await this.treasuryService.getTreasuryStats();

      res.json({
        treasury: {
          ...stats,
          currency: config.zg.currencySymbol,
          network: config.zg.networkName,
          entryFee: config.zg.entryFee,
          houseFeePercentage: config.zg.houseFeePercentage
        }
      });

    } catch (error) {
      logger.error('Failed to get treasury stats:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve treasury statistics'
      });
    }
  }

  /**
   * Get payment history for player
   * GET /api/treasury/payments/:address
   */
  async getPaymentHistory(req, res) {
    try {
      const { address } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({
          error: true,
          message: 'Invalid wallet address format'
        });
      }

      // Get payment history from database
      const payments = database.db.prepare(`
        SELECT tx_hash, round_id, amount, block_number, created_at, confirmed
        FROM payments 
        WHERE player_address = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).all(address, parseInt(limit), parseInt(offset));

      const totalCount = database.db.prepare(`
        SELECT COUNT(*) as count FROM payments WHERE player_address = ?
      `).get(address).count;

      res.json({
        payments: payments.map(payment => ({
          txHash: payment.tx_hash,
          roundId: payment.round_id,
          amount: payment.amount,
          blockNumber: payment.block_number,
          timestamp: payment.created_at,
          confirmed: payment.confirmed === 1,
          currency: config.zg.currencySymbol
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      });

    } catch (error) {
      logger.error('Failed to get payment history:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve payment history'
      });
    }
  }

  /**
   * Get treasury configuration (Public)
   * GET /api/treasury/config
   */
  getTreasuryConfig(req, res) {
    try {
      res.json({
        network: {
          name: config.zg.networkName,
          chainId: config.zg.chainId,
          rpc: config.zg.networkRpc,
          explorer: config.zg.explorer,
          currency: {
            symbol: config.zg.currencySymbol,
            decimals: config.zg.currencyDecimals
          }
        },
        game: {
          entryFee: config.zg.entryFee,
          houseFeePercentage: config.zg.houseFeePercentage,
          treasuryAddress: config.zg.treasuryPublicAddress
        }
      });
    } catch (error) {
      logger.error('Failed to get treasury config:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve treasury configuration'
      });
    }
  }

  /**
   * Health check for treasury service
   * GET /api/treasury/health
   */
  async getTreasuryHealth(req, res) {
    try {
      const isProviderConnected = this.treasuryService.provider !== null;
      const isHotWalletReady = this.treasuryService.hotWallet !== null;
      
      let hotWalletBalance = '0';
      if (isHotWalletReady) {
        try {
          hotWalletBalance = await this.treasuryService.getBalance(
            this.treasuryService.hotWallet.address
          );
        } catch (error) {
          logger.warn('Could not fetch hot wallet balance for health check:', error);
        }
      }

      const healthStatus = {
        status: isProviderConnected && isHotWalletReady ? 'healthy' : 'degraded',
        provider: {
          connected: isProviderConnected,
          network: config.zg.networkName,
          chainId: config.zg.chainId
        },
        hotWallet: {
          ready: isHotWalletReady,
          balance: hotWalletBalance,
          currency: config.zg.currencySymbol
        },
        timestamp: new Date().toISOString()
      };

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthStatus);

    } catch (error) {
      logger.error('Treasury health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = TreasuryController; 