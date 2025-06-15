const Database = require('better-sqlite3');
const { config } = require('../config/app.config');
const { logger } = require('./logger.service');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    this.db = null;
    this.connect();
  }

  connect() {
    try {
      this.db = new Database(config.database.path);
      
      // Apply performance pragmas
      Object.entries(config.database.pragmas).forEach(([key, value]) => {
        this.db.pragma(`${key} = ${value}`);
      });
      
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed', { error: error.message });
      throw error;
    }
  }

  // === Battle Operations ===
  
  createBattle(ogCharacterId, roasterCharacterId) {
    const battleId = `battle_${Date.now()}_${uuidv4().substring(0, 8)}`;
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO current_battle (
          battle_id, og_character_id, roaster_character_id, 
          status, created_at, updated_at
        ) VALUES (?, ?, ?, 'waiting_bets', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(battleId, ogCharacterId, roasterCharacterId);
      
      logger.battle.created(battleId, ogCharacterId, roasterCharacterId);
      
      return this.getCurrentBattle();
    } catch (error) {
      logger.error('Failed to create battle', { error: error.message });
      throw error;
    }
  }

  getCurrentBattle() {
    const battle = this.db.prepare(`
      SELECT * FROM current_battle 
      WHERE status != 'completed' 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get();
    
    if (battle && battle.dialog_json) {
      battle.dialog = JSON.parse(battle.dialog_json);
    }
    
    return battle;
  }

  updateBattleStatus(battleId, status, additionalData = {}) {
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];
    
    if (status === 'countdown' && additionalData.countdownEnd) {
      updates.push('countdown_end = ?');
      params.push(additionalData.countdownEnd);
      updates.push('started_at = CURRENT_TIMESTAMP');
    }
    
    if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
      
      if (additionalData.dialog) {
        updates.push('dialog_json = ?');
        params.push(JSON.stringify(additionalData.dialog));
      }
      
      if (additionalData.winnerSide) {
        updates.push('winner_side = ?');
        params.push(additionalData.winnerSide);
      }
      
      if (additionalData.winnerReasoning) {
        updates.push('winner_reasoning = ?');
        params.push(additionalData.winnerReasoning);
      }
    }
    
    params.push(battleId);
    
    const stmt = this.db.prepare(`
      UPDATE current_battle 
      SET ${updates.join(', ')}
      WHERE battle_id = ?
    `);
    
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  // === Bet Operations ===
  
  placeBet(battleId, playerAddress, betSide, betAmount, txHash) {
    try {
      // In test mode, auto-confirm bets immediately
      const confirmed = config.server.testEnv ? 1 : 0;
      
      const stmt = this.db.prepare(`
        INSERT INTO battle_bets (
          battle_id, player_address, bet_side, bet_amount, 
          tx_hash, confirmed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(battleId, playerAddress.toLowerCase(), betSide, betAmount, txHash, confirmed);
      
      logger.battle.betPlaced(battleId, playerAddress, betSide, betAmount);
      
      return true;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        throw new Error('ALREADY_BET');
      }
      throw error;
    }
  }

  confirmBet(txHash) {
    const stmt = this.db.prepare(`
      UPDATE battle_bets 
      SET confirmed = 1 
      WHERE tx_hash = ?
    `);
    
    const result = stmt.run(txHash);
    return result.changes > 0;
  }

  getBattleBets(battleId) {
    const bets = this.db.prepare(`
      SELECT * FROM battle_bets 
      WHERE battle_id = ? 
      ORDER BY created_at ASC
    `).all(battleId);
    
    // Aggregate by side
    const summary = {
      og: {
        count: 0,
        total: 0,
        players: []
      },
      roaster: {
        count: 0,
        total: 0,
        players: []
      }
    };
    
    bets.forEach(bet => {
      // In test mode, count all bets; in production, only confirmed bets
      if (bet.confirmed || config.server.testEnv) {
        summary[bet.bet_side].count++;
        summary[bet.bet_side].total += parseFloat(bet.bet_amount);
        summary[bet.bet_side].players.push({
          address: bet.player_address,
          amount: parseFloat(bet.bet_amount)
        });
      }
    });
    
    return { bets, summary };
  }

  hasPlayerBet(battleId, playerAddress) {
    const bet = this.db.prepare(`
      SELECT 1 FROM battle_bets 
      WHERE battle_id = ? AND player_address = ?
      LIMIT 1
    `).get(battleId, playerAddress.toLowerCase());
    
    return !!bet;
  }

  // === Battle History ===
  
  archiveBattle(battleData) {
    const stmt = this.db.prepare(`
      INSERT INTO battle_history (
        battle_id, og_character_id, roaster_character_id,
        winner_side, winner_reasoning, total_pot, house_fee,
        winners_count, losers_count, per_winner_amount,
        dialog_json, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      battleData.battleId,
      battleData.ogCharacterId,
      battleData.roasterCharacterId,
      battleData.winnerSide,
      battleData.winnerReasoning,
      battleData.totalPot,
      battleData.houseFee,
      battleData.winnersCount,
      battleData.losersCount,
      battleData.perWinnerAmount,
      battleData.dialogJson
    );
  }

  getBattleHistory(limit = 20, offset = 0) {
    const battles = this.db.prepare(`
      SELECT * FROM battle_history 
      ORDER BY completed_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    
    return battles.map(battle => ({
      ...battle,
      dialog: battle.dialog_json ? JSON.parse(battle.dialog_json) : null
    }));
  }

  getAllBattleHistory() {
    const battles = this.db.prepare(`
      SELECT * FROM battle_history 
      ORDER BY completed_at DESC
    `).all();
    
    return battles.map(battle => ({
      ...battle,
      dialog: battle.dialog_json ? JSON.parse(battle.dialog_json) : null
    }));
  }

  // === Player Statistics ===
  
  getPlayerStats(playerAddress) {
    const stats = this.db.prepare(`
      SELECT * FROM battle_stats 
      WHERE player_address = ?
    `).get(playerAddress.toLowerCase());
    
    if (!stats) {
      return {
        player_address: playerAddress.toLowerCase(),
        total_battles: 0,
        total_wins: 0,
        total_losses: 0,
        total_bet: 0,
        total_winnings: 0,
        win_rate: 0,
        favorite_side: null,
        og_bets: 0,
        roaster_bets: 0,
        og_wins: 0,
        roaster_wins: 0
      };
    }
    
    // Calculate win rate as percentage like in leaderboard
    stats.win_rate = stats.total_battles > 0 
      ? parseFloat(((stats.total_wins / stats.total_battles) * 100).toFixed(2))
      : 0;
    
    return stats;
  }

  updatePlayerStats(playerAddress, betSide, won, betAmount, winnings = 0) {
    // First, ensure player exists in stats table
    this.db.prepare(`
      INSERT OR IGNORE INTO battle_stats (
        player_address, created_at, updated_at
      ) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(playerAddress.toLowerCase());
    
    // Update stats
    const updates = [
      'total_battles = total_battles + 1',
      'total_bet = total_bet + ?',
      'updated_at = CURRENT_TIMESTAMP',
      'last_battle_at = CURRENT_TIMESTAMP'
    ];
    
    const params = [betAmount];
    
    if (won) {
      updates.push('total_wins = total_wins + 1');
      updates.push('total_winnings = total_winnings + ?');
      params.push(winnings);
    } else {
      updates.push('total_losses = total_losses + 1');
    }
    
    // Update side-specific stats
    if (betSide === 'og') {
      updates.push('og_bets = og_bets + 1');
      if (won) updates.push('og_wins = og_wins + 1');
    } else {
      updates.push('roaster_bets = roaster_bets + 1');
      if (won) updates.push('roaster_wins = roaster_wins + 1');
    }
    
    params.push(playerAddress.toLowerCase());
    
    const stmt = this.db.prepare(`
      UPDATE battle_stats 
      SET ${updates.join(', ')}
      WHERE player_address = ?
    `);
    
    stmt.run(...params);
    
    // Update favorite side
    this.updateFavoriteSide(playerAddress);
  }

  updateFavoriteSide(playerAddress) {
    const stats = this.getPlayerStats(playerAddress);
    const favoriteSide = stats.og_bets >= stats.roaster_bets ? 'og' : 'roaster';
    
    this.db.prepare(`
      UPDATE battle_stats 
      SET favorite_side = ? 
      WHERE player_address = ?
    `).run(favoriteSide, playerAddress.toLowerCase());
  }

  // === Payout Operations ===
  
  recordPayout(battleId, winnerAddress, payoutAmount, txHash) {
    const stmt = this.db.prepare(`
      INSERT INTO battle_payouts (
        battle_id, winner_address, payout_amount, 
        tx_hash, processed_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(battleId, winnerAddress.toLowerCase(), payoutAmount, txHash);
  }

  getPayouts(battleId) {
    return this.db.prepare(`
      SELECT * FROM battle_payouts 
      WHERE battle_id = ? 
      ORDER BY processed_at ASC
    `).all(battleId);
  }

  // === AI Logging ===
  
  logAI(battleId, promptType, prompt, response, model, tokensUsed, processingTime, success = true, error = null) {
    const stmt = this.db.prepare(`
      INSERT INTO ai_logs (
        battle_id, prompt_type, prompt_text, response_text,
        model_used, tokens_used, processing_time_ms,
        success, error_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      battleId,
      promptType,
      prompt,
      response,
      model,
      tokensUsed || 0,
      processingTime || 0,
      success ? 1 : 0,
      error
    );
  }

  getAILogs(battleId) {
    return this.db.prepare(`
      SELECT * FROM ai_logs 
      WHERE battle_id = ? 
      ORDER BY created_at ASC
    `).all(battleId);
  }

  getUniquePlayersCount() {
    const result = this.db.prepare(`
      SELECT COUNT(DISTINCT player_address) as count 
      FROM battle_stats
    `).get();
    
    return result ? result.count : 0;
  }

  // === Utility Methods ===
  
  clearCurrentBattle() {
    try {
      // First, delete all related battle_bets to avoid foreign key constraint
      this.db.prepare('DELETE FROM battle_bets WHERE battle_id IN (SELECT battle_id FROM current_battle)').run();
      
      // Then, delete current_battle records
      this.db.prepare('DELETE FROM current_battle').run();
      
      logger.info('Current battle and related bets cleared');
    } catch (error) {
      logger.error('Failed to clear current battle', { error: error.message });
      throw error;
    }
  }

  getLeaderboard(limit = 10) {
    return this.db.prepare(`
      SELECT 
        player_address,
        total_battles,
        total_wins,
        total_losses,
        ROUND(CAST(total_wins AS REAL) / NULLIF(total_battles, 0) * 100, 2) as win_rate,
        total_winnings,
        favorite_side
      FROM battle_stats
      WHERE total_battles > 0
      ORDER BY total_winnings DESC, win_rate DESC
      LIMIT ?
    `).all(limit);
  }
  // Get last completed battle for anti-repetition
  getLastCompletedBattle() {
    return this.db.prepare(`
      SELECT 
        og_character_id,
        roaster_character_id,
        winner_side,
        completed_at
      FROM battle_history 
      ORDER BY completed_at DESC 
      LIMIT 1
    `).get();
  }

  // Get recent battle statistics for AI balancing
  getRecentBattleStats(limit = 20) {
    const recentBattles = this.db.prepare(`
      SELECT 
        og_character_id,
        roaster_character_id, 
        winner_side,
        completed_at
      FROM battle_history 
      ORDER BY completed_at DESC 
      LIMIT ?
    `).all(limit);
    
    // Calculate win statistics
    const stats = {
      total: recentBattles.length,
      ogWins: recentBattles.filter(b => b.winner_side === 'og').length,
      roasterWins: recentBattles.filter(b => b.winner_side === 'roaster').length,
      ogWinRate: 0,
      roasterWinRate: 0,
      battles: recentBattles
    };
    
    if (stats.total > 0) {
      stats.ogWinRate = (stats.ogWins / stats.total * 100).toFixed(1);
      stats.roasterWinRate = (stats.roasterWins / stats.total * 100).toFixed(1);
    }
    
    return stats;
  }

  // Get character-specific matchup history
  getCharacterMatchupHistory(ogCharId, roasterCharId, limit = 5) {
    return this.db.prepare(`
      SELECT 
        og_character_id,
        roaster_character_id,
        winner_side,
        winner_reasoning,
        completed_at
      FROM battle_history 
      WHERE og_character_id = ? AND roaster_character_id = ?
      ORDER BY completed_at DESC 
      LIMIT ?
    `).all(ogCharId, roasterCharId, limit);
  }

  // Get overall character win rates
  getCharacterWinRates() {
    const ogStats = this.db.prepare(`
      SELECT 
        og_character_id as character_id,
        COUNT(*) as total_battles,
        SUM(CASE WHEN winner_side = 'og' THEN 1 ELSE 0 END) as wins,
        'og' as side
      FROM battle_history 
      GROUP BY og_character_id
    `).all();
    
    const roasterStats = this.db.prepare(`
      SELECT 
        roaster_character_id as character_id,
        COUNT(*) as total_battles,
        SUM(CASE WHEN winner_side = 'roaster' THEN 1 ELSE 0 END) as wins,
        'roaster' as side
      FROM battle_history 
      GROUP BY roaster_character_id
    `).all();
    
    // Calculate win rates
    const allStats = [...ogStats, ...roasterStats].map(stat => ({
      ...stat,
      win_rate: stat.total_battles > 0 ? (stat.wins / stat.total_battles * 100).toFixed(1) : '0.0'
    }));
    
    return allStats;
  }

  // Get best performers for each side
  getBestPerformers() {
    // Get best 0G team character
    const bestOg = this.db.prepare(`
      SELECT 
        og_character_id as character_id,
        COUNT(*) as total_battles,
        SUM(CASE WHEN winner_side = 'og' THEN 1 ELSE 0 END) as wins
      FROM battle_history 
      GROUP BY og_character_id
      HAVING total_battles > 0
      ORDER BY wins DESC, total_battles DESC
      LIMIT 1
    `).get();
    
    // Get best Roaster character
    const bestRoaster = this.db.prepare(`
      SELECT 
        roaster_character_id as character_id,
        COUNT(*) as total_battles,
        SUM(CASE WHEN winner_side = 'roaster' THEN 1 ELSE 0 END) as wins
      FROM battle_history 
      GROUP BY roaster_character_id
      HAVING total_battles > 0
      ORDER BY wins DESC, total_battles DESC
      LIMIT 1
    `).get();
    
    return {
      bestOg: bestOg ? {
        ...bestOg,
        win_rate: bestOg.total_battles > 0 ? (bestOg.wins / bestOg.total_battles * 100).toFixed(1) : '0.0',
        side: 'og'
      } : null,
      bestRoaster: bestRoaster ? {
        ...bestRoaster,
        win_rate: bestRoaster.total_battles > 0 ? (bestRoaster.wins / bestRoaster.total_battles * 100).toFixed(1) : '0.0',
        side: 'roaster'
      } : null
    };
  }
  
  close() {
    if (this.db) {
      this.db.close();
      logger.info('Database connection closed');
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();