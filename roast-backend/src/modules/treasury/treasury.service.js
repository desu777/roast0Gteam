const { ethers } = require('ethers');
const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const database = require('../../database/database.service');

class TreasuryService {
  constructor() {
    this.provider = null;
    this.hotWallet = null;
    this.initializeProvider();
  }

  /**
   * Initialize 0G Network provider and hot wallet
   */
  initializeProvider() {
    try {
      // Create provider for 0G Network
      this.provider = new ethers.JsonRpcProvider(config.zg.networkRpc, {
        chainId: config.zg.chainId,
        name: config.zg.networkName
      });

      // Initialize hot wallet for automated payouts
      if (config.zg.hotWalletPrivateKey) {
        this.hotWallet = new ethers.Wallet(config.zg.hotWalletPrivateKey, this.provider);
        logger.info('Treasury hot wallet initialized', {
          address: this.hotWallet.address,
          network: config.zg.networkName
        });
      }

      logger.info('0G Network provider initialized', {
        rpc: config.zg.networkRpc,
        chainId: config.zg.chainId
      });
    } catch (error) {
      logger.error('Failed to initialize 0G provider:', error);
      throw error;
    }
  }

  /**
   * Get 0G balance for address
   * @param {string} address - Wallet address
   * @returns {Promise<string>} Balance in 0G
   */
  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error(`Failed to get balance for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Verify entry fee payment transaction
   * @param {string} txHash - Transaction hash
   * @param {string} playerAddress - Player wallet address
   * @param {string} roundId - Round ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyEntryFeePayment(txHash, playerAddress, roundId) {
    try {
      // Get transaction details
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        return { valid: false, reason: 'Transaction not found' };
      }

      // Wait for transaction confirmation
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      if (!receipt || receipt.status !== 1) {
        return { valid: false, reason: 'Transaction failed' };
      }

      // Verify transaction parameters
      const expectedAmount = ethers.parseEther(config.zg.entryFee.toString());
      const actualAmount = tx.value;

      const validations = {
        // Check if sent to correct treasury address
        correctRecipient: tx.to?.toLowerCase() === config.zg.treasuryPublicAddress?.toLowerCase(),
        // Check if sent correct amount (0.025 0G)
        correctAmount: actualAmount.toString() === expectedAmount.toString(),
        // Check if sent from player address
        correctSender: tx.from?.toLowerCase() === playerAddress.toLowerCase(),
        // Check transaction recency (max 5 minutes old)
        recentTransaction: this.isTransactionRecent(receipt.blockNumber)
      };

      if (!validations.correctRecipient) {
        return { valid: false, reason: 'Incorrect recipient address' };
      }

      if (!validations.correctAmount) {
        return { 
          valid: false, 
          reason: `Incorrect amount. Expected: ${config.zg.entryFee} 0G, Got: ${ethers.formatEther(actualAmount)} 0G` 
        };
      }

      if (!validations.correctSender) {
        return { valid: false, reason: 'Transaction not from player address' };
      }

      if (!validations.recentTransaction) {
        return { valid: false, reason: 'Transaction too old (max 5 minutes)' };
      }

      // Record payment in database
      await this.recordPayment({
        txHash,
        playerAddress,
        roundId,
        amount: ethers.formatEther(actualAmount),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmed: true
      });

      logger.info('Entry fee payment verified', {
        txHash,
        playerAddress,
        roundId,
        amount: ethers.formatEther(actualAmount)
      });

      return { 
        valid: true, 
        receipt,
        amount: ethers.formatEther(actualAmount)
      };

    } catch (error) {
      logger.error('Failed to verify entry fee payment:', error);
      throw error;
    }
  }

  /**
   * Send prize payout to winner
   * @param {string} winnerAddress - Winner wallet address
   * @param {string} roundId - Round ID
   * @param {number} prizeAmount - Prize amount in 0G
   * @returns {Promise<Object>} Transaction result
   */
  async sendPrizePayout(winnerAddress, roundId, prizeAmount) {
    try {
      if (!this.hotWallet) {
        throw new Error('Hot wallet not initialized');
      }

      // Calculate actual payout (95% to winner, 5% house fee)
      const houseFeePercentage = config.zg.houseFeePercentage / 100;
      const actualPayout = prizeAmount * (1 - houseFeePercentage);
      const payoutAmount = ethers.parseEther(actualPayout.toString());

      // Check hot wallet balance
      const hotWalletBalance = await this.provider.getBalance(this.hotWallet.address);
      if (hotWalletBalance < payoutAmount) {
        throw new Error(`Insufficient hot wallet balance. Need: ${actualPayout} 0G, Have: ${ethers.formatEther(hotWalletBalance)} 0G`);
      }

      // Estimate gas
      const gasEstimate = await this.provider.estimateGas({
        to: winnerAddress,
        value: payoutAmount
      });

      // Send prize transaction
      const tx = await this.hotWallet.sendTransaction({
        to: winnerAddress,
        value: payoutAmount,
        gasLimit: gasEstimate
      });

      logger.info('Prize payout transaction sent', {
        txHash: tx.hash,
        winnerAddress,
        roundId,
        amount: actualPayout
      });

      // Wait for confirmation
      const receipt = await tx.wait(1);
      
      if (receipt.status !== 1) {
        throw new Error('Prize payout transaction failed');
      }

      // Record payout in database
      await this.recordPayout({
        txHash: tx.hash,
        winnerAddress,
        roundId,
        amount: actualPayout,
        houseFee: prizeAmount * houseFeePercentage,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      logger.info('Prize payout completed successfully', {
        txHash: tx.hash,
        winnerAddress,
        roundId,
        amount: actualPayout,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        txHash: tx.hash,
        amount: actualPayout,
        receipt
      };

    } catch (error) {
      logger.error('Failed to send prize payout:', error);
      throw error;
    }
  }

  /**
   * Check if transaction is recent (within 5 minutes)
   * @param {number} blockNumber - Transaction block number
   * @returns {Promise<boolean>} True if recent
   */
  async isTransactionRecent(blockNumber) {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blockDiff = currentBlock - blockNumber;
      
      // Assuming ~2 second block time for 0G Network, 5 minutes = ~150 blocks
      const maxBlockDiff = 150;
      
      return blockDiff <= maxBlockDiff;
    } catch (error) {
      logger.error('Failed to check transaction recency:', error);
      return false;
    }
  }

  /**
   * Record payment in database
   * @param {Object} paymentData - Payment details
   */
  async recordPayment(paymentData) {
    try {
      const stmt = database.db.prepare(`
        INSERT INTO payments (
          tx_hash, player_address, round_id, amount, 
          block_number, gas_used, confirmed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      stmt.run(
        paymentData.txHash,
        paymentData.playerAddress,
        paymentData.roundId,
        paymentData.amount,
        paymentData.blockNumber,
        paymentData.gasUsed,
        paymentData.confirmed ? 1 : 0
      );

      if (config.logging.testEnv) {
        logger.debug('Payment recorded in database', paymentData);
      }
    } catch (error) {
      logger.error('Failed to record payment:', error);
      throw error;
    }
  }

  /**
   * Record payout in database
   * @param {Object} payoutData - Payout details
   */
  async recordPayout(payoutData) {
    try {
      const stmt = database.db.prepare(`
        INSERT INTO payouts (
          tx_hash, winner_address, round_id, amount, house_fee,
          block_number, gas_used, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      stmt.run(
        payoutData.txHash,
        payoutData.winnerAddress,
        payoutData.roundId,
        payoutData.amount,
        payoutData.houseFee,
        payoutData.blockNumber,
        payoutData.gasUsed
      );

      if (config.logging.testEnv) {
        logger.debug('Payout recorded in database', payoutData);
      }
    } catch (error) {
      logger.error('Failed to record payout:', error);
      throw error;
    }
  }

  /**
   * Get treasury statistics
   * @returns {Promise<Object>} Treasury stats
   */
  async getTreasuryStats() {
    try {
      const hotWalletBalance = this.hotWallet 
        ? await this.getBalance(this.hotWallet.address)
        : '0';

      const treasuryBalance = config.zg.treasuryPublicAddress
        ? await this.getBalance(config.zg.treasuryPublicAddress)
        : '0';

      // Get database stats
      const totalPayments = database.db.prepare(`
        SELECT COUNT(*) as count, SUM(amount) as total 
        FROM payments WHERE confirmed = 1
      `).get();

      const totalPayouts = database.db.prepare(`
        SELECT COUNT(*) as count, SUM(amount) as total, SUM(house_fee) as fees
        FROM payouts
      `).get();

      return {
        hotWalletBalance,
        treasuryBalance,
        totalPaymentsReceived: totalPayments.total || 0,
        totalPaymentCount: totalPayments.count || 0,
        totalPayoutsSent: totalPayouts.total || 0,
        totalPayoutCount: totalPayouts.count || 0,
        totalHouseFees: totalPayouts.fees || 0,
        netProfit: (totalPayments.total || 0) - (totalPayouts.total || 0)
      };
    } catch (error) {
      logger.error('Failed to get treasury stats:', error);
      throw error;
    }
  }

  /**
   * Cleanup service resources
   */
  cleanup() {
    // Cleanup any active connections or timers if needed
    logger.info('Treasury service cleaned up');
  }
}

module.exports = TreasuryService; 