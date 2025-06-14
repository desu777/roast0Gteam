import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Users, History } from 'lucide-react';
import { battleApi } from '../../services/api';

const BattleStatsPanel = ({ 
  currentJudge,
  userAddress,
  onShowPlayerStats,
  onShowBattleHistory
}) => {
  const [battleStats, setBattleStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load battle statistics
  const loadBattleStats = async () => {
    try {
      setLoading(true);
      const response = await battleApi.getBattleStats();
      
      if (response.data.success) {
        setBattleStats(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load battle stats:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBattleStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadBattleStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="battle-stats-panel">
        <div className="panel-header">
          <h3 className="stats-title">
            <BarChart3 size={20} className="stats-icon" style={{ color: currentJudge?.color || '#FFD700' }} />
            <span className="gradient-text">Battle Statistics</span>
          </h3>
        </div>

        {loading ? (
          <div className="loading-section">
            <div className="spinner" />
            <p>Loading statistics...</p>
          </div>
        ) : battleStats ? (
          <>
            {/* Total Volume Section */}
            <div className="total-volume-section">
              <div className="volume-card">
                <span className="volume-label">Total 0G Volume</span>
                <span className="volume-value gradient-text">
                  {battleStats.totalVolume.toFixed(3)} 0G
                </span>
              </div>
            </div>

            {/* Win Rates Section */}
            <div className="winrates-section">
              <h4>Team Win Rates</h4>
              
              <div className="winrate-display">
                <div className="winrate-card og-card">
                  <div className="winrate-header">
                    <span>0G Team</span>
                  </div>
                  <div className="winrate-value">
                    {battleStats.ogWinRate.toFixed(1)}%
                  </div>
                  <div className="winrate-stats">
                    {battleStats.ogWins} / {battleStats.totalBattles} wins
                  </div>
                </div>

                <div className="winrate-card roaster-card">
                  <div className="winrate-header">
                    <span>Roasters</span>
                  </div>
                  <div className="winrate-value">
                    {battleStats.roasterWinRate.toFixed(1)}%
                  </div>
                  <div className="winrate-stats">
                    {battleStats.roasterWins} / {battleStats.totalBattles} wins
                  </div>
                </div>
              </div>
            </div>

            {/* Best Performance Section */}
            {battleStats.bestPerformers && (
              <div className="best-performance-section">
                <h4>Best Performance</h4>
                
                <div className="performance-display">
                  <div className="performance-card og-performance">
                    <div className="performance-label">0G Team MVP</div>
                    <div className="performance-character">
                      {battleStats.bestPerformers.bestOg ? 
                        battleStats.bestPerformers.bestOg.character_id : 'N/A'}
                    </div>
                    <div className="performance-stats">
                      {battleStats.bestPerformers.bestOg ? 
                        `${battleStats.bestPerformers.bestOg.wins} wins (${battleStats.bestPerformers.bestOg.win_rate}%)` : 
                        'No data'}
                    </div>
                  </div>

                  <div className="performance-card roaster-performance">
                    <div className="performance-label">Roaster MVP</div>
                    <div className="performance-character">
                      {battleStats.bestPerformers.bestRoaster ? 
                        battleStats.bestPerformers.bestRoaster.character_id : 'N/A'}
                    </div>
                    <div className="performance-stats">
                      {battleStats.bestPerformers.bestRoaster ? 
                        `${battleStats.bestPerformers.bestRoaster.wins} wins (${battleStats.bestPerformers.bestRoaster.win_rate}%)` : 
                        'No data'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <div className="voltage-button">
                <button 
                  className="action-btn player-stats-btn"
                  onClick={onShowPlayerStats}
                  style={{
                    borderColor: currentJudge?.color || '#FFD700',
                    '--judge-color': currentJudge?.color || '#FFD700'
                  }}
                >
                  <Users size={16} />
                  <span>Player Stats</span>
                </button>
              </div>

              <div className="voltage-button">
                <button 
                  className="action-btn battle-history-btn"
                  onClick={onShowBattleHistory}
                  style={{
                    borderColor: currentJudge?.color || '#FFD700',
                    '--judge-color': currentJudge?.color || '#FFD700'
                  }}
                >
                  <History size={16} />
                  <span>Battle History</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="error-section">
            <p>Failed to load battle statistics</p>
            <button onClick={loadBattleStats} className="retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .battle-stats-panel {
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .stats-title {
          color: #E6E6E6;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0;
          line-height: 1;
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          font-weight: 700;
          display: inline-block;
          line-height: 1;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .stats-icon {
          filter: drop-shadow(0 0 8px currentColor);
          animation: iconGlow 3s ease-in-out infinite alternate;
          transition: color 0.3s ease;
          flex-shrink: 0;
        }

        @keyframes iconGlow {
          0% { 
            filter: drop-shadow(0 0 8px currentColor); 
            transform: scale(1);
          }
          100% { 
            filter: drop-shadow(0 0 16px currentColor); 
            transform: scale(1.05);
          }
        }

        .loading-section, .error-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 12px;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid #FFD700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Subtle pulse animation to indicate clickability */
        @keyframes clickableHint {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
          }
          50% { 
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
          }
        }

        .total-volume-section {
          display: flex;
          justify-content: center;
        }

        .volume-card {
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.4);
          border-radius: 12px;
          padding: 16px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .volume-label {
          color: #9999A5;
          font-size: 14px;
          font-weight: 500;
        }

        .volume-value {
          font-size: 24px;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .winrates-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .winrates-section h4 {
          color: #E6E6E6;
          font-size: 16px;
          text-align: left;
          margin: 0;
        }

        .winrate-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .winrate-card {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: clickableHint 3s ease-in-out infinite;
        }

        .winrate-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.4s ease;
        }

        .winrate-card:hover::before {
          left: 100%;
        }

        .winrate-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .winrate-card:active {
          transform: translateY(0) scale(0.98);
          transition: transform 0.1s ease;
        }

        .winrate-card:hover {
          border-color: var(--judge-color, #FFD700);
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.1);
          box-shadow: 0 6px 20px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
        }

        .winrate-card:hover .winrate-header,
        .winrate-card:hover .winrate-value {
          color: var(--judge-color, #FFD700);
          text-shadow: 0 0 8px rgba(var(--judge-color-rgb, 255, 215, 0), 0.5);
        }

        .winrate-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .winrate-header {
          color: #E6E6E6;
        }

        .winrate-value {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
        }

        .winrate-stats {
          font-size: 11px;
          color: #9999A5;
        }

        .best-performance-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .best-performance-section h4 {
          color: #E6E6E6;
          font-size: 16px;
          text-align: left;
          margin: 0;
        }

        .performance-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .performance-card {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: clickableHint 3s ease-in-out infinite;
        }

        .performance-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.4s ease;
        }

        .performance-card:hover::before {
          left: 100%;
        }

        .performance-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .performance-card:active {
          transform: translateY(0) scale(0.98);
          transition: transform 0.1s ease;
        }

        .performance-card:hover {
          border-color: var(--judge-color, #FFD700);
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.1);
          box-shadow: 0 6px 20px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
        }

        .performance-card:hover .performance-label,
        .performance-card:hover .performance-character {
          color: var(--judge-color, #FFD700);
          text-shadow: 0 0 8px rgba(var(--judge-color-rgb, 255, 215, 0), 0.5);
        }

        .performance-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .performance-label {
          color: #E6E6E6;
        }

        .performance-character {
          font-size: 14px;
          font-weight: 700;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          text-transform: capitalize;
        }

        .performance-stats {
          font-size: 11px;
          color: #9999A5;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: auto;
        }

        .voltage-button {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }

        .action-btn {
          width: 100%;
          background: rgba(18, 18, 24, 0.9);
          border: 2px solid;
          border-radius: 12px;
          padding: 14px 20px;
          color: #E6E6E6;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .action-btn:hover {
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.1);
          color: var(--judge-color, #FFD700);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .retry-btn {
          background: rgba(255, 92, 170, 0.1);
          border: 1px solid #FF5CAA;
          color: #FF5CAA;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: rgba(255, 92, 170, 0.2);
        }
      `}</style>
    </>
  );
};

export default BattleStatsPanel; 