import React, { useState, useEffect } from 'react';
import { X, Crown, TrendingUp, Coins, Target, Medal } from 'lucide-react';
import { battleApi } from '../../services/api';

const PlayerStatsModal = ({ 
  isOpen, 
  onClose, 
  userAddress, 
  currentJudge 
}) => {
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const loadPlayerStats = async () => {
    try {
      setLoading(true);
      
      // Load top 100 leaderboard
      const leaderboardResponse = await battleApi.getLeaderboard(100);
      
      if (leaderboardResponse.data.success) {
        const leaderboardData = leaderboardResponse.data.data;
        setLeaderboard(leaderboardData);
        
        // Find user rank if connected
        if (userAddress) {
          const userIndex = leaderboardData.findIndex(
            player => player.player_address.toLowerCase() === userAddress.toLowerCase()
          );
          setUserRank(userIndex >= 0 ? userIndex + 1 : null);
          
          // Load user stats
          const userStatsResponse = await battleApi.getPlayerStats(userAddress);
          if (userStatsResponse.data.success) {
            setUserStats(userStatsResponse.data.data);
          }
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load player stats:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPlayerStats();
    }
  }, [isOpen, userAddress]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-slide-in" onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              <Crown size={24} className="title-icon" style={{ color: currentJudge?.color || '#FFD700' }} />
              <span className="gradient-text">Player Statistics</span>
            </h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="loading-section">
                <div className="spinner" />
                <p>Loading player statistics...</p>
              </div>
            ) : (
              <>
                {/* User Stats Section */}
                {userAddress && userStats && (
                  <div className="user-stats-section">
                    <div className="user-stats-header">
                      <div className="user-info">
                        <h3>Your Statistics</h3>
                        <a 
                          href={`https://chainscan-galileo.0g.ai/address/${userAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="user-address-link"
                        >
                          <span className="user-address">{formatAddress(userAddress)}</span>
                        </a>
                      </div>
                      {userRank && (
                        <div 
                          className="user-rank"
                          style={{
                            background: `rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.1)`,
                            border: `1px solid rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.3)`,
                            color: currentJudge?.color || '#FFD700'
                          }}
                        >
                          <Crown size={20} />
                          <span>Rank #{userRank}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="user-stats-grid">
                      <div className="stat-card">
                        <Target size={16} className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Total Battles</span>
                          <span className="stat-value">{userStats.total_battles || 0}</span>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <TrendingUp size={16} className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Win Rate</span>
                          <span className="stat-value">
                            {userStats.win_rate ? `${userStats.win_rate.toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <Crown size={16} className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Total Wins</span>
                          <span className="stat-value">{userStats.total_wins || 0}</span>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <Coins size={16} className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Total Winnings</span>
                          <span className="stat-value">
                            {(userStats.total_winnings || 0).toFixed(3)} 0G
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <Medal size={16} className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Favorite Side</span>
                          <span className="stat-value">
                            {userStats.favorite_side === 'og' ? '0G Team' : 
                             userStats.favorite_side === 'roaster' ? 'Roaster' : 'None'}
                          </span>
                        </div>
                      </div>

                      <div className="stat-card">
                        <Target size={16} className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-label">Favorite Side Bets</span>
                          <span className="stat-value">
                            {userStats.favorite_side === 'og' ? (userStats.og_bets || 0) : 
                             userStats.favorite_side === 'roaster' ? (userStats.roaster_bets || 0) : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top 100 Leaderboard */}
                <div className="leaderboard-section">
                  <h3>Top 100 Players</h3>
                  
                  <div className="leaderboard-container">
                    <div className="leaderboard-header">
                      <div className="rank-col">Rank</div>
                      <div className="address-col">Player</div>
                      <div className="battles-col">Battles</div>
                      <div className="winrate-col">Win Rate</div>
                      <div className="winnings-col">Winnings</div>
                    </div>
                    
                    <div className="leaderboard-list">
                      {leaderboard.map((player, index) => {
                        const isCurrentUser = userAddress && 
                          player.player_address.toLowerCase() === userAddress.toLowerCase();
                        
                        return (
                          <div 
                            key={player.player_address} 
                            className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
                          >
                            <div className="rank-col">
                              <span className="rank-number">#{index + 1}</span>
                            </div>
                            <div className="address-col">
                              <a 
                                href={`https://chainscan-galileo.0g.ai/address/${player.player_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="address-link"
                              >
                                <span className="address-text">
                                  {formatAddress(player.player_address)}
                                </span>
                              </a>
                            </div>
                            <div className="battles-col">
                              {player.total_battles}
                            </div>
                            <div className="winrate-col">
                              {player.win_rate ? `${player.win_rate}%` : '0%'}
                            </div>
                            <div className="winnings-col">
                              <span className="winnings-amount">
                                {(player.total_winnings || 0).toFixed(3)} 0G
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: rgba(18, 18, 24, 0.95);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 20px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .modal-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .title-icon {
          filter: drop-shadow(0 0 8px currentColor);
          animation: iconGlow 3s ease-in-out infinite alternate;
        }

        @keyframes iconGlow {
          0% { filter: drop-shadow(0 0 8px currentColor); }
          100% { filter: drop-shadow(0 0 16px currentColor); }
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .close-button {
          background: none;
          border: none;
          color: #9999A5;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          color: #E6E6E6;
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #FFD700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .user-stats-section {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          --judge-color: ${currentJudge?.color || '#FFD700'};
        }

        .user-stats-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .user-info h3 {
          margin: 0 0 4px 0;
          color: #E6E6E6;
          font-size: 18px;
        }

        .user-address {
          color: #9999A5;
          font-size: 14px;
          font-family: monospace;
        }

        .user-address-link {
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }

        .user-address-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-address-link:hover .user-address {
          color: var(--judge-color, #FFD700);
        }

        .user-rank {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
        }

        .user-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: rgba(40, 40, 50, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          color: var(--judge-color, #FFD700);
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          color: #9999A5;
          font-size: 12px;
        }

        .stat-value {
          color: #FFFFFF;
          font-size: 18px;
          font-weight: 600;
        }

        .leaderboard-section h3 {
          margin: 0 0 16px 0;
          color: #E6E6E6;
          font-size: 18px;
        }

        .leaderboard-container {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          overflow: hidden;
          --judge-color: ${currentJudge?.color || '#FFD700'};
        }

        .leaderboard-header {
          display: grid;
          grid-template-columns: 60px 1fr 80px 80px 120px;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(40, 40, 50, 0.8);
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
          font-size: 12px;
          font-weight: 600;
          color: #9999A5;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .leaderboard-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .leaderboard-row {
          display: grid;
          grid-template-columns: 60px 1fr 80px 80px 120px;
          gap: 16px;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.2);
          transition: all 0.3s ease;
          align-items: center;
        }

        .leaderboard-row:hover {
          background: rgba(40, 40, 50, 0.4);
        }

        .leaderboard-row.current-user {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .rank-number {
          font-weight: 600;
          color: #E6E6E6;
        }

        .address-text {
          font-family: monospace;
          color: #E6E6E6;
        }

        .address-link {
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }

        .address-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .address-link:hover .address-text {
          color: var(--judge-color, #FFD700);
        }

        .winnings-amount {
          color: #E6E6E6;
          font-weight: 600;
        }

        .leaderboard-row > div {
          color: #E6E6E6;
          font-size: 14px;
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar,
        .leaderboard-list::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track,
        .leaderboard-list::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .modal-body::-webkit-scrollbar-thumb,
        .leaderboard-list::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover,
        .leaderboard-list::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 140, 0.7);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
            max-height: 95vh;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-title {
            font-size: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .user-stats-grid {
            grid-template-columns: 1fr;
          }

          .leaderboard-header,
          .leaderboard-row {
            grid-template-columns: 50px 1fr 60px 70px 100px;
            gap: 8px;
            padding: 12px 16px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default PlayerStatsModal; 