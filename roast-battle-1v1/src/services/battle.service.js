const { EventEmitter } = require('events');
const { config } = require('../config/app.config');
const { logger } = require('./logger.service');
const db = require('./database.service');
const characterService = require('./character.service');
const aiService = require('./ai.service');
const treasuryService = require('./treasury.service');

class BattleService extends EventEmitter {
  constructor() {
    super();
    this.currentBattle = null;
    this.countdownTimer = null;
    this.battleInProgress = false;
  }

  // Initialize or get current battle
  async initializeBattle() {
    try {
      // Check if there's an active battle
      this.currentBattle = db.getCurrentBattle();
      
      if (this.currentBattle) {
        logger.info('Resuming existing battle', { battleId: this.currentBattle.battle_id });
        
        // Resume countdown if needed
        if (this.currentBattle.status === 'countdown' && this.currentBattle.countdown_end) {
          this.resumeCountdown();
        }
        
        return this.getBattleState();
      }
      
      // Create new battle
      return await this.createNewBattle();
    } catch (error) {
      logger.error('Failed to initialize battle', { error: error.message });
      throw error;
    }
  }

  // Create a new battle
  async createNewBattle() {
    try {
      logger.info('🎯 Creating new battle...');
      
      // Clear any existing battle
      logger.info('🧹 Clearing previous battle data...');
      db.clearCurrentBattle();
      
      // Generate random matchup
      logger.info('🎲 Generating random character matchup...');
      const matchup = characterService.generateRandomMatchup();
      
      // Create battle in database
      logger.info('💾 Creating battle in database...');
      this.currentBattle = db.createBattle(
        matchup.og.id,
        matchup.roaster.id
      );
      
      logger.info('✅ New battle created successfully', {
        battleId: this.currentBattle.battle_id,
        og: matchup.og.id,
        roaster: matchup.roaster.id
      });
      
      // Emit battle created event
      this.emit('battle:created', {
        battleId: this.currentBattle.battle_id,
        og: matchup.og,
        roaster: matchup.roaster
      });
      
      return this.getBattleState();
    } catch (error) {
      logger.error('Failed to create new battle', { error: error.message });
      throw error;
    }
  }

  // Get current battle state
  getBattleState() {
    if (!this.currentBattle) {
      return null;
    }
    
    // Get bets summary
    const { summary } = db.getBattleBets(this.currentBattle.battle_id);
    
    // Get character details
    const ogCharacter = characterService.getCharacterForBattle(
      this.currentBattle.og_character_id, 
      'og'
    );
    const roasterCharacter = characterService.getCharacterForBattle(
      this.currentBattle.roaster_character_id, 
      'roaster'
    );
    
    // Calculate countdown remaining
    let countdownRemaining = null;
    if (this.currentBattle.status === 'countdown' && this.currentBattle.countdown_end) {
      const remaining = new Date(this.currentBattle.countdown_end) - new Date();
      countdownRemaining = Math.max(0, Math.floor(remaining / 1000));
    }
    
    return {
      battleId: this.currentBattle.battle_id,
      status: this.currentBattle.status,
      ogCharacter,
      roasterCharacter,
      bets: summary,
      totalPot: summary.og.total + summary.roaster.total,
      countdownRemaining,
      countdownEnd: this.currentBattle.countdown_end,
      dialog: this.currentBattle.dialog || [],
      winner: this.currentBattle.winner_side,
      winnerReasoning: this.currentBattle.winner_reasoning,
      createdAt: this.currentBattle.created_at,
      canStart: this.canStartBattle(summary)
    };
  }

  // Check if battle can start
  canStartBattle(betsSummary) {
    return betsSummary.og.count >= config.battle.minBetsToStart.og &&
           betsSummary.roaster.count >= config.battle.minBetsToStart.roaster;
  }

  // Place a bet
  async placeBet(playerAddress, betSide, betAmount, txHash) {
    try {
      if (!this.currentBattle) {
        throw new Error('NO_ACTIVE_BATTLE');
      }
      
      if (this.currentBattle.status !== 'waiting_bets') {
        throw new Error('BETTING_CLOSED');
      }
      
      // Check if player already bet
      if (db.hasPlayerBet(this.currentBattle.battle_id, playerAddress)) {
        throw new Error('ALREADY_BET');
      }
      
      // Validate bet amount
      if (betAmount !== config.battle.betAmount) {
        throw new Error('INVALID_BET_AMOUNT');
      }
      
      // Place bet in database
      db.placeBet(
        this.currentBattle.battle_id,
        playerAddress,
        betSide,
        betAmount,
        txHash
      );
      
      // Get updated state
      const battleState = this.getBattleState();
      
      // DEBUG: Log bet placement details
      logger.info('🐛 DEBUG: Bet placed', {
        battleId: this.currentBattle.battle_id,
        playerAddress: playerAddress.substring(0, 10) + '...',
        betSide,
        betAmount,
        currentStatus: this.currentBattle.status,
        betsOG: battleState.bets.og.count,
        betsRoaster: battleState.bets.roaster.count,
        canStart: battleState.canStart,
        minBetsOG: config.battle.minBetsToStart.og,
        minBetsRoaster: config.battle.minBetsToStart.roaster
      });
      
      // Emit bet placed event
      this.emit('bet:placed', {
        battleId: this.currentBattle.battle_id,
        playerAddress,
        betSide,
        betAmount,
        battleState
      });
      
      // Check if battle can start
      if (battleState.canStart && this.currentBattle.status === 'waiting_bets') {
        logger.info('🚀 Minimum bets reached, auto-starting countdown');
        await this.startCountdown();
      } else {
        logger.info('🐛 DEBUG: Auto-start conditions not met', {
          canStart: battleState.canStart,
          currentStatus: this.currentBattle.status,
          requiredStatus: 'waiting_bets'
        });
      }
      
      return battleState;
    } catch (error) {
      logger.error('Failed to place bet', { error: error.message });
      throw error;
    }
  }

  // Confirm bet payment
  async confirmBet(txHash) {
    try {
      const confirmed = db.confirmBet(txHash);
      
      if (confirmed) {
        this.emit('bet:confirmed', { txHash });
      }
      
      return confirmed;
    } catch (error) {
      logger.error('Failed to confirm bet', { error: error.message });
      throw error;
    }
  }

  // Start countdown
  async startCountdown() {
    try {
      if (!this.currentBattle) {
        throw new Error('NO_ACTIVE_BATTLE');
      }
      
      if (this.currentBattle.status !== 'waiting_bets') {
        throw new Error('INVALID_BATTLE_STATUS');
      }
      
      // Check minimum bets
      const { summary } = db.getBattleBets(this.currentBattle.battle_id);
      if (!this.canStartBattle(summary)) {
        throw new Error('INSUFFICIENT_BETS');
      }
      
      // Calculate countdown end time
      const countdownEnd = new Date(Date.now() + config.battle.countdownDuration * 1000);
      
      // Update battle status
      db.updateBattleStatus(this.currentBattle.battle_id, 'countdown', {
        countdownEnd: countdownEnd.toISOString()
      });
      
      this.currentBattle.status = 'countdown';
      this.currentBattle.countdown_end = countdownEnd.toISOString();
      
      // Start countdown timer
      this.startCountdownTimer();
      
      // Emit countdown started event
      this.emit('countdown:started', {
        battleId: this.currentBattle.battle_id,
        duration: config.battle.countdownDuration,
        endTime: countdownEnd
      });
      
      logger.battle.countdownStarted(this.currentBattle.battle_id, config.battle.countdownDuration);
      
      return this.getBattleState();
    } catch (error) {
      logger.error('Failed to start countdown', { error: error.message });
      throw error;
    }
  }

  // Start countdown timer
  startCountdownTimer() {
    // Clear any existing timer
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    // Emit countdown updates every second
    this.countdownTimer = setInterval(() => {
      if (!this.currentBattle || this.currentBattle.status !== 'countdown') {
        clearInterval(this.countdownTimer);
        return;
      }
      
      const remaining = new Date(this.currentBattle.countdown_end) - new Date();
      const secondsRemaining = Math.max(0, Math.floor(remaining / 1000));
      
      // Emit countdown update
      this.emit('countdown:update', {
        battleId: this.currentBattle.battle_id,
        secondsRemaining
      });
      
      // Check if countdown finished
      if (secondsRemaining === 0) {
        clearInterval(this.countdownTimer);
        this.onCountdownComplete();
      }
    }, config.battle.countdownTimerInterval);
  }

  // Resume countdown (for server restart)
  resumeCountdown() {
    const remaining = new Date(this.currentBattle.countdown_end) - new Date();
    
    if (remaining > 0) {
      this.startCountdownTimer();
      logger.info('Countdown resumed', {
        battleId: this.currentBattle.battle_id,
        remainingSeconds: Math.floor(remaining / 1000)
      });
    } else {
      // Countdown already finished
      this.onCountdownComplete();
    }
  }

  // Handle countdown completion
  async onCountdownComplete() {
    try {
      logger.info('Countdown complete, starting battle generation');
      
      this.emit('countdown:complete', {
        battleId: this.currentBattle.battle_id
      });
      
      // Start battle generation
      await this.generateBattle();
    } catch (error) {
      logger.error('Failed to handle countdown completion', { error: error.message });
      this.emit('battle:error', { error: error.message });
    }
  }

  // Generate battle dialog and determine winner
  async generateBattle() {
    try {
      if (this.battleInProgress) {
        logger.warn('Battle generation already in progress');
        return;
      }
      
      this.battleInProgress = true;
      
      // Update status to generating
      db.updateBattleStatus(this.currentBattle.battle_id, 'generating');
      this.currentBattle.status = 'generating';
      
      this.emit('battle:generating', {
        battleId: this.currentBattle.battle_id
      });
      
      // Get battle context
      const battleContext = characterService.getBattleContext(
        this.currentBattle.og_character_id,
        this.currentBattle.roaster_character_id
      );
      
      // Generate dialog using AI
      logger.info('Generating battle dialog with AI');
      const dialog = await aiService.generateBattleDialog(
        battleContext,
        this.currentBattle.battle_id
      );
      
      // Update status to dialog
      db.updateBattleStatus(this.currentBattle.battle_id, 'dialog');
      this.currentBattle.status = 'dialog';
      this.currentBattle.dialog = dialog;
      
      // Emit dialog ready event
      this.emit('dialog:ready', {
        battleId: this.currentBattle.battle_id,
        dialog
      });
      
      // Stream dialog exchanges
      await this.streamDialog(dialog);
      
      // Judge the battle
      logger.info('Judging battle winner');
      const judgment = await aiService.judgeBattle(
        dialog,
        battleContext,
        this.currentBattle.battle_id
      );
      
      // Complete the battle
      await this.completeBattle(judgment);
      
    } catch (error) {
      logger.error('Failed to generate battle', { error: error.message });
      this.emit('battle:error', { error: error.message });
      
      // Update battle status to failed
      db.updateBattleStatus(this.currentBattle.battle_id, 'failed');
      
    } finally {
      this.battleInProgress = false;
    }
  }

  // Stream dialog exchanges with delays
  async streamDialog(dialog) {
    for (let i = 0; i < dialog.exchanges.length; i++) {
      const exchange = dialog.exchanges[i];
      
      // Emit exchange
      this.emit('dialog:exchange', {
        battleId: this.currentBattle.battle_id,
        exchange,
        index: i,
        total: dialog.exchanges.length
      });
      
      // Wait before next exchange (simulate typing/speaking)
      const delay = config.ai.exchangeBaseDelay + (exchange.message.length * config.ai.exchangeCharDelay);
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, config.ai.exchangeMaxDelay)));
    }
    
    // Emit dialog complete
    this.emit('dialog:complete', {
      battleId: this.currentBattle.battle_id,
      peakMoment: dialog.peakMoment,
      audienceReaction: dialog.audienceReaction
    });
  }

  // Complete the battle
  async completeBattle(judgment) {
    try {
      const { summary } = db.getBattleBets(this.currentBattle.battle_id);
      
      // Calculate payouts
      const totalPot = summary.og.total + summary.roaster.total;
      const houseFee = totalPot * (config.battle.houseFeePercent / 100);
      const winnersPool = totalPot - houseFee;
      
      const winners = judgment.winner === 'og' ? summary.og : summary.roaster;
      const losers = judgment.winner === 'og' ? summary.roaster : summary.og;
      
      const perWinnerAmount = winners.count > 0 ? winnersPool / winners.count : 0;
      
      if (config.logging.testEnv) {
        logger.info('💰 Battle payout calculation:', {
          battleId: this.currentBattle.battle_id,
          totalPot,
          houseFee,
          winnersPool,
          winnersCount: winners.count,
          perWinnerAmount,
          winnerSide: judgment.winner
        });
      }
      
      // Update battle status
      db.updateBattleStatus(this.currentBattle.battle_id, 'completed', {
        dialog: this.currentBattle.dialog,
        winnerSide: judgment.winner,
        winnerReasoning: judgment.reasoning
      });
      
      // Archive battle
      db.archiveBattle({
        battleId: this.currentBattle.battle_id,
        ogCharacterId: this.currentBattle.og_character_id,
        roasterCharacterId: this.currentBattle.roaster_character_id,
        winnerSide: judgment.winner,
        winnerReasoning: judgment.reasoning,
        totalPot,
        houseFee,
        winnersCount: winners.count,
        losersCount: losers.count,
        perWinnerAmount,
        dialogJson: JSON.stringify(this.currentBattle.dialog)
      });
      
      // Update player stats
      for (const player of winners.players) {
        db.updatePlayerStats(
          player.address,
          judgment.winner,
          true,
          player.amount,
          perWinnerAmount
        );
      }
      
      for (const player of losers.players) {
        db.updatePlayerStats(
          player.address,
          judgment.winner === 'og' ? 'roaster' : 'og',
          false,
          player.amount,
          0
        );
      }
      
      // 🚀 PROCESS ACTUAL PAYOUTS!
      if (winners.count > 0 && perWinnerAmount > 0) {
        if (config.logging.testEnv) {
          logger.info('💸 Processing battle payouts:', {
            battleId: this.currentBattle.battle_id,
            winnersCount: winners.count,
            perWinnerAmount,
            winners: winners.players.map(p => p.address.substring(0, 10) + '...')
          });
        }
        
        try {
          await treasuryService.processBattlePayouts(
            this.currentBattle.battle_id,
            winners.players,
            perWinnerAmount
          );
          
          if (config.logging.testEnv) {
            logger.info('✅ Battle payouts queued successfully');
          }
        } catch (payoutError) {
          logger.error('❌ Failed to process battle payouts', {
            battleId: this.currentBattle.battle_id,
            error: payoutError.message
          });
        }
      } else {
        logger.info('💸 No payouts to process (no winners or zero amount)', {
          winnersCount: winners.count,
          perWinnerAmount
        });
      }
      
      // Emit battle complete event
      this.emit('battle:complete', {
        battleId: this.currentBattle.battle_id,
        winner: judgment.winner,
        reasoning: judgment.reasoning,
        scores: {
          og: judgment.ogScore,
          roaster: judgment.roasterScore
        },
        decisiveMoment: judgment.decisiveMoment,
        crowdFavorite: judgment.crowdFavorite,
        payouts: {
          totalPot,
          houseFee,
          winnersCount: winners.count,
          perWinnerAmount
        }
      });
      
      logger.battle.payoutProcessed(
        this.currentBattle.battle_id,
        winners.count,
        winnersPool
      );
      
      // Clear current battle and prepare for next
      logger.info('🏁 Battle completed, scheduling next battle creation');
      this.currentBattle = null;
      
      // Auto-create next battle after delay
      setTimeout(() => {
        logger.info('🔄 Creating next battle after delay');
        this.createNewBattle().catch(error => {
          logger.error('❌ Failed to auto-create next battle', { error: error.message });
        });
      }, config.battle.battleEndDelay);
      
    } catch (error) {
      logger.error('Failed to complete battle', { error: error.message });
      throw error;
    }
  }

  // Get battle history
  async getBattleHistory(limit = config.battle.historyDefaultLimit, offset = 0) {
    return db.getBattleHistory(limit, offset);
  }

  // Get all battle history for stats
  async getAllBattleHistory() {
    return db.getAllBattleHistory();
  }

  // Get best performers for each side
  async getBestPerformers() {
    return db.getBestPerformers();
  }

  // Get specific battle by ID
  async getBattleById(battleId) {
    const battles = await db.getBattleHistory(1, 0);
    return battles.find(b => b.battle_id === battleId) || null;
  }

  // Get player stats
  async getPlayerStats(playerAddress) {
    return db.getPlayerStats(playerAddress);
  }

  // Get leaderboard
  async getLeaderboard(limit = config.battle.leaderboardDefaultLimit) {
    return db.getLeaderboard(limit);
  }

  // Force end battle (admin function)
  async forceEndBattle(adminKey) {
    if (adminKey !== config.admin.key) {
      throw new Error('UNAUTHORIZED');
    }
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    db.clearCurrentBattle();
    this.currentBattle = null;
    
    this.emit('battle:cancelled', {
      reason: 'Admin force end'
    });
    
    return { success: true };
  }
}

// Export singleton instance
module.exports = new BattleService();