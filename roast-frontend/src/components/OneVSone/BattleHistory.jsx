import React from 'react';
import { Trophy, TrendingUp, TrendingDown, History, User, Coins, Users } from 'lucide-react';

const BattleHistory = ({ battleHistory, playerStats, userAddress }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="battle-history">
        <div className="history-header">
          <h3>
            <History size={20} className="inline-icon" />
            Battle History
          </h3>
        </div>

        {/* Player Stats */}
        {playerStats && (
          <div className="player-stats">
            <h4>
              <User size={16} className="inline-icon" />
              Your Stats
            </h4>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Total Battles</span>
                <span className="stat-value">{playerStats.total_battles || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Wins</span>
                <span className="stat-value wins">{playerStats.total_wins || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Losses</span>
                <span className="stat-value losses">{playerStats.total_losses || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">
                  {playerStats.win_rate ? `${(playerStats.win_rate * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
              <div className="stat full-width">
                <span className="stat-label">Total Winnings</span>
                <span className="stat-value gold">
                  {(playerStats.total_winnings || 0).toFixed(3)} 0G
                </span>
              </div>
              <div className="stat full-width">
                <span className="stat-label">Favorite Side</span>
                <span className={`stat-value ${playerStats.favorite_side}`}>
                  {playerStats.favorite_side === 'og' ? '0G Team' : 
                   playerStats.favorite_side === 'roaster' ? 'Roaster' : 'None'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Battle History List */}
        <div className="history-list">
          <h4>Recent Battles</h4>
          {battleHistory && battleHistory.length > 0 ? (
            battleHistory.map((battle, index) => (
              <div key={battle.battle_id || index} className="history-item">
                <div className="battle-info">
                  <div className="battle-header">
                    <span className="battle-time">{formatDate(battle.completed_at)}</span>
                    <span className={`battle-winner ${battle.winner_side}`}>
                      <Trophy size={14} />
                      {battle.winner_side === 'og' ? '0G' : 'Roaster'} Won
                    </span>
                  </div>
                  <div className="battle-characters">
                    <span className="og-character">{battle.og_character_name || 'Unknown'}</span>
                    <span className="vs">vs</span>
                    <span className="roaster-character">{battle.roaster_character_name || 'Unknown'}</span>
                  </div>
                  <div className="battle-stats">
                    <span className="pot-size">
                      <Coins size={12} />
                      {battle.total_pot.toFixed(3)} 0G
                    </span>
                    <span className="participants">
                      <Users size={12} />
                      {battle.winners_count + battle.losers_count} players
                    </span>
                  </div>
                  {/* Show user's bet result if they participated */}
                  {battle.user_bet && (
                    <div className={`user-result ${battle.user_won ? 'won' : 'lost'}`}>
                      {battle.user_won ? (
                        <>
                          <TrendingUp size={14} />
                          <span>Won {battle.user_winnings.toFixed(3)} 0G</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={14} />
                          <span>Lost {battle.user_bet_amount.toFixed(3)} 0G</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-history">
              <p>No battles yet</p>
              <p className="hint">Place a bet to join the action!</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .battle-history {
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .history-header {
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .history-header h3 {
          color: #E6E6E6;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .player-stats {
          background: rgba(30, 30, 40, 0.5);
          border-radius: 12px;
          padding: 16px;
        }

        .player-stats h4 {
          color: #E6E6E6;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 16px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat.full-width {
          grid-column: 1 / -1;
        }

        .stat-label {
          color: #9999A5;
          font-size: 12px;
        }

        .stat-value {
          color: #E6E6E6;
          font-size: 16px;
          font-weight: 600;
        }

        .stat-value.wins {
          color: #4ADE80;
        }

        .stat-value.losses {
          color: #EF4444;
        }

        .stat-value.gold {
          color: #FFD700;
        }

        .stat-value.og {
          color: #00D2E9;
        }

        .stat-value.roaster {
          color: #FF5CAA;
        }

        .history-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .history-list h4 {
          color: #E6E6E6;
          font-size: 16px;
          margin: 0;
        }

        .history-item {
          background: rgba(30, 30, 40, 0.5);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .history-item:hover {
          background: rgba(40, 40, 50, 0.6);
          border-color: rgba(255, 215, 0, 0.2);
        }

        .battle-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .battle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .battle-time {
          color: #9999A5;
          font-size: 12px;
        }

        .battle-winner {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .battle-winner.og {
          color: #00D2E9;
          background: rgba(0, 210, 233, 0.1);
        }

        .battle-winner.roaster {
          color: #FF5CAA;
          background: rgba(255, 92, 170, 0.1);
        }

        .battle-characters {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }

        .og-character {
          color: #00D2E9;
          font-weight: 600;
        }

        .vs {
          color: #9999A5;
        }

        .roaster-character {
          color: #FF5CAA;
          font-weight: 600;
        }

        .battle-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #9999A5;
        }

        .battle-stats span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .user-result {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .user-result.won {
          color: #4ADE80;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
        }

        .user-result.lost {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .no-history {
          text-align: center;
          padding: 40px 20px;
          color: #9999A5;
        }

        .no-history p {
          margin: 0 0 8px 0;
        }

        .no-history .hint {
          font-size: 14px;
          color: #666673;
        }

        .inline-icon {
          display: inline;
          vertical-align: middle;
        }

        /* Scrollbar styling */
        .battle-history::-webkit-scrollbar,
        .history-list::-webkit-scrollbar {
          width: 6px;
        }

        .battle-history::-webkit-scrollbar-track,
        .history-list::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .battle-history::-webkit-scrollbar-thumb,
        .history-list::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .battle-history::-webkit-scrollbar-thumb:hover,
        .history-list::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 140, 0.7);
        }
      `}</style>
    </>
  );
};

export default BattleHistory; 