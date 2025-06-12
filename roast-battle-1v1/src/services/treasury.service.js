const { ethers } = require('ethers');
const { config } = require('../config/app.config');
const { logger } = require('./logger.service');
const db = require('./database.service');

class TreasuryService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.isInitialized = false;
    this.payoutQueue = [];
    this.isProcessingPayouts = false;
  }

  async initialize() {
    try {
      if (!config.treasury.privateKey || !config.treasury.address) {
        logger.warn('Treasury service not configured - running in test mode');
        return;
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(config.network.rpcUrl);
      
      // Initialize wallet
      this.wallet = new ethers.Wallet(config.treasury.privateKey, this.provider);
      
      // Verify wallet address matches config
      if (this.wallet.address.toLowerCase() !== config.treasury.address.toLowerCase()) {
        throw new Error('Treasury wallet address mismatch');
      }
      
      // Get initial balance
      const balance = await this.getBalance();
      
      logger.info('Treasury service initialized', {
        address: this.wallet.address,
        balance: ethers.formatEther(balance),
        network: config.network.networkName
      });
      
      this.isInitialized = true;
      
      // Start payout processor
      this.startPayoutProcessor();
      
    } catch (error) {
      logger.error('Failed to initialize treasury service', { error: error.message });
      throw error;
    }
  }

  // Get treasury balance
  async getBalance() {
    try {
      if (!this.provider) {
        throw new Error('Treasury not initialized');
      }
      
      const balance = await this.provider.getBalance(config.treasury.address);
      return balance;
    } catch (error) {
      logger.error('Failed to get treasury balance', { error: error.message });
      throw error;
    }
  }

  // Verify incoming bet payment
  async verifyBetPayment(txHash, expectedAmount, playerAddress) {
    try {
      // In test mode, auto-confirm all payments
      if (config.server.testEnv) {
        logger.warn('TEST_ENV mode - auto-confirming bet payment', {
          txHash: txHash.substring(0, 10) + '...',
          playerAddress: playerAddress.substring(0, 10) + '...',
          amount: expectedAmount
        });
        return true;
      }

      if (!this.provider) {
        logger.warn('Treasury not initialized - auto-confirming bet');
        return true;
      }
      
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        throw new Error('Transaction not found');
      }
      
      if (!receipt.status) {
        throw new Error('Transaction failed');
      }
      
      // Get transaction details
      const tx = await this.provider.getTransaction(txHash);
      
      // Verify sender
      if (tx.from.toLowerCase() !== playerAddress.toLowerCase()) {
        throw new Error('Transaction sender mismatch');
      }
      
      // Verify recipient
      if (tx.to.toLowerCase() !== config.treasury.address.toLowerCase()) {
        throw new Error('Transaction recipient is not treasury');
      }
      
      // Verify amount
      const amountInEther = ethers.formatEther(tx.value);
      if (parseFloat(amountInEther) !== expectedAmount) {
        throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${amountInEther}`);
      }
      
      logger.info('Bet payment verified', {
        txHash,
        from: playerAddress,
        amount: expectedAmount
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to verify bet payment', { 
        error: error.message, 
        txHash,
        playerAddress 
      });
      return false;
    }
  }

  // Queue payout for processing
  async queuePayout(battleId, winnerAddress, amount) {
    if (!this.isInitialized) {
      logger.warn('Treasury not initialized - skipping payout');
      return;
    }
    
    this.payoutQueue.push({
      battleId,
      winnerAddress,
      amount,
      queuedAt: new Date(),
      attempts: 0
    });
    
    logger.info('Payout queued', {
      battleId,
      winnerAddress,
      amount,
      queueLength: this.payoutQueue.length
    });
  }

  // Process payouts from queue
  async startPayoutProcessor() {
    setInterval(async () => {
      if (this.isProcessingPayouts || this.payoutQueue.length === 0) {
        return;
      }
      
      this.isProcessingPayouts = true;
      
      try {
        await this.processPayoutQueue();
      } catch (error) {
        logger.error('Payout processor error', { error: error.message });
      } finally {
        this.isProcessingPayouts = false;
      }
    }, config.treasury.payoutInterval);
  }

  // Process payout queue
  async processPayoutQueue() {
    const batch = this.payoutQueue.splice(0, config.treasury.payoutBatchSize);
    
    for (const payout of batch) {
      try {
        const txHash = await this.sendPayout(
          payout.winnerAddress,
          payout.amount
        );
        
        // Record successful payout
        db.recordPayout(
          payout.battleId,
          payout.winnerAddress,
          payout.amount,
          txHash
        );
        
        logger.info('Payout processed successfully', {
          battleId: payout.battleId,
          winnerAddress: payout.winnerAddress,
          amount: payout.amount,
          txHash
        });
        
      } catch (error) {
        logger.error('Failed to process payout', {
          error: error.message,
          payout
        });
        
        // Retry logic
        payout.attempts++;
        if (payout.attempts < config.treasury.maxRetryAttempts) {
          this.payoutQueue.push(payout); // Re-queue for retry
        } else {
          logger.error('Payout failed after maximum attempts', { payout });
          // TODO: Add to failed payouts table for manual processing
        }
      }
    }
  }

  // Send payout transaction
  async sendPayout(recipientAddress, amount) {
    try {
      if (!this.wallet) {
        throw new Error('Treasury wallet not initialized');
      }
      
      // Check balance
      const balance = await this.getBalance();
      const amountWei = ethers.parseEther(amount.toString());
      
      if (balance < amountWei) {
        throw new Error('Insufficient treasury balance');
      }
      
      // Prepare transaction
      const tx = {
        to: recipientAddress,
        value: amountWei,
        gasLimit: config.treasury.gasLimit,
      };
      
      // Estimate gas price
      const feeData = await this.provider.getFeeData();
      tx.gasPrice = feeData.gasPrice;
      
      // Send transaction
      logger.info('Sending payout transaction', {
        to: recipientAddress,
        amount: amount.toString(),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei')
      });
      
      const transaction = await this.wallet.sendTransaction(tx);
      
      // Wait for confirmation
      const receipt = await transaction.wait();
      
      if (!receipt.status) {
        throw new Error('Transaction failed');
      }
      
      return receipt.hash;
      
    } catch (error) {
      logger.error('Failed to send payout', {
        error: error.message,
        recipient: recipientAddress,
        amount
      });
      throw error;
    }
  }

  // Process battle payouts
  async processBattlePayouts(battleId, winners, perWinnerAmount) {
    try {
      if (!this.isInitialized) {
        logger.warn('Treasury not initialized - skipping payouts');
        return;
      }
      
      logger.info('Processing battle payouts', {
        battleId,
        winnersCount: winners.length,
        perWinnerAmount
      });
      
      // Queue payouts for each winner
      for (const winner of winners) {
        await this.queuePayout(
          battleId,
          winner.address,
          perWinnerAmount
        );
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to process battle payouts', {
        error: error.message,
        battleId
      });
      throw error;
    }
  }

  // Get payout history
  async getPayoutHistory(battleId) {
    return db.getPayouts(battleId);
  }

  // Get treasury stats
  async getTreasuryStats() {
    try {
      const balance = await this.getBalance();
      
      return {
        address: config.treasury.address,
        balance: ethers.formatEther(balance),
        currency: config.network.currencySymbol,
        network: config.network.networkName,
        queuedPayouts: this.payoutQueue.length,
        isProcessing: this.isProcessingPayouts
      };
    } catch (error) {
      logger.error('Failed to get treasury stats', { error: error.message });
      return {
        address: config.treasury.address,
        error: error.message
      };
    }
  }

  // Emergency withdraw (admin only)
  async emergencyWithdraw(recipientAddress, amount, adminKey) {
    if (adminKey !== config.admin.key) {
      throw new Error('UNAUTHORIZED');
    }
    
    if (!this.wallet) {
      throw new Error('Treasury not initialized');
    }
    
    logger.warn('Emergency withdraw initiated', {
      recipient: recipientAddress,
      amount
    });
    
    return await this.sendPayout(recipientAddress, amount);
  }

  // Estimate gas for payout
  async estimatePayoutGas() {
    try {
      const feeData = await this.provider.getFeeData();
      const gasLimit = config.treasury.gasLimit; // Use configured gas limit
      const gasCost = feeData.gasPrice * BigInt(gasLimit);
      
      return {
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        gasLimit,
        estimatedCost: ethers.formatEther(gasCost)
      };
    } catch (error) {
      logger.error('Failed to estimate gas', { error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new TreasuryService();