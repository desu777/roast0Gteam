import React, { useEffect } from 'react';
import { 
  User, Trophy, TrendingUp, Target, Activity, Medal, Award, 
  Crown, Users, Calendar, Coins, Zap, AlertCircle 
} from 'lucide-react';
import { useHallOfFame } from '../../hooks/useHallOfFame';

const MyStatsTab = ({ userAddress }) => {
  const hallOfFame = useHallOfFame();
  const { 
    playerProfile, 
    loadPlayerProfile, 
    formatAddress, 
    formatCurrency, 
    formatPercentage, 
    formatTimeAgo
  } = hallOfFame;

  // Load player profile when component mounts or address changes
  useEffect(() => {
    if (userAddress) {
      loadPlayerProfile(userAddress);
    }
  }, [userAddress, loadPlayerProfile]);

  // Loading state
  if (playerProfile.isLoading) {
    return (
      <div className="my-stats-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p>Loading your stats...</p>
        <style jsx>{loadingStyles}</style>
      </div>
    );
  }

  // No wallet connected
  if (!userAddress) {
    return (
      <div className="my-stats-empty">
        <AlertCircle size={48} />
        <h3>Connect Your Wallet</h3>
        <p>Connect your wallet to view your personal statistics and ranking positions.</p>
        <style jsx>{emptyStyles}</style>
      </div>
    );
  }

  // Error state
  if (playerProfile.error) {
    return (
      <div className="my-stats-error">
        <AlertCircle size={48} />
        <h3>Profile Not Found</h3>
        <p>No game history found for this wallet address. Start playing to see your stats!</p>
        <div className="start-playing-hint">
          <p>🎮 Join a round to start building your roasting reputation</p>
        </div>
        <style jsx>{errorStyles}</style>
      </div>
    );
  }

  const { profile, rankings } = playerProfile;

  if (!profile) {
    return (
      <div className="my-stats-error">
        <AlertCircle size={48} />
        <h3>No Stats Available</h3>
        <p>Start playing to build your Hall of Fame profile!</p>
        <style jsx>{errorStyles}</style>
      </div>
    );
  }

  // Ranking categories
  const rankingCategories = [
    {
      id: 'topEarners',
      title: 'Top Earners',
      icon: Trophy,
      color: '#FFD700',
      description: 'Highest total earnings'
    },
    {
      id: 'mostWins',
      title: 'Most Wins',
      icon: Crown,
      color: '#FF6B6B',
      description: 'Most victories'
    },
    {
      id: 'bestWinRate',
      title: 'Best Win Rate',
      icon: Target,
      color: '#00D2E9',
      description: 'Win percentage'
    },
    {
      id: 'mostActive',
      title: 'Most Active',
      icon: Activity,
      color: '#FF5CAA',
      description: 'Most games played'
    }
  ];

  const getRankIcon = (rank) => {
    if (!rank) return <span className="rank-none">Not Ranked</span>;
    
    switch (rank) {
      case 1: return <Crown size={20} className="rank-crown" />;
      case 2: return <Medal size={20} className="rank-medal" />;
      case 3: return <Award size={20} className="rank-award" />;
      default: return <span className="rank-number">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    if (!rank) return '#666';
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#9999A5';
    }
  };

  return (
    <>
      <div className="my-stats-tab">
        {/* Player Header */}
        <div className="player-header-section">
          <div className="player-info">
            <div className="player-avatar">
              <img src="/hall.png" alt="Hall of Fame" className="hall-avatar" />
            </div>
            <div className="player-details">
              <h2>
                <a 
                  href={`https://chainscan-galileo.0g.ai/address/${userAddress}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="player-wallet-link"
                  title="View on 0G Chain Explorer"
                >
                  {formatAddress(userAddress)}
                </a>
              </h2>
              <p>Roast Arena Champion</p>
            </div>
          </div>
          <div className="player-summary">
            <div className="summary-stat">
              <span className="summary-value">{profile.stats?.totalGames || 0}</span>
              <span className="summary-label">Games</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{profile.stats?.totalWins || 0}</span>
              <span className="summary-label">Wins</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{formatPercentage(profile.stats?.winRate || 0)}</span>
              <span className="summary-label">Win Rate</span>
            </div>
            <div className="summary-stat">
              <span className={`summary-value ${(profile.stats?.netProfit || 0) >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(profile.stats?.netProfit || 0)}
              </span>
              <span className="summary-label">Net Profit</span>
            </div>
          </div>
        </div>

        {/* Ranking Positions */}
        <div className="section">
          <div className="section-header">
            <Crown size={24} className="section-icon" />
            <h3>Your Rankings</h3>
          </div>
          
          <div className="rankings-grid">
            {rankingCategories.map(category => {
              const ranking = rankings[category.id];
              const IconComponent = category.icon;
              
              return (
                <div key={category.id} className="ranking-card">
                  <div className="ranking-header">
                    <div className="ranking-icon" style={{ color: category.color }}>
                      <IconComponent size={24} />
                    </div>
                    <div className="ranking-info">
                      <h4>{category.title}</h4>
                      <p>{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="ranking-position">
                    {ranking ? (
                      <>
                        <div className="rank-display" style={{ color: getRankColor(ranking.rank) }}>
                          {getRankIcon(ranking.rank)}
                        </div>
                        <div className="rank-stats">
                          <span className="rank-text">
                            {ranking.rank} of {ranking.totalPlayers}
                          </span>
                          <span className="percentile">
                            Top {ranking.percentile}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="no-ranking">
                        <span>Not Ranked</span>
                        <p>Play more games to get ranked</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="section">
          <div className="section-header">
            <TrendingUp size={24} className="section-icon" />
            <h3>Detailed Statistics</h3>
          </div>
          
          <div className="detailed-stats">
            <div className="stat-row">
              <div className="stat-card">
                <Coins size={20} />
                <div className="stat-info">
                  <span className="stat-value">{formatCurrency(profile.stats?.totalEarned || 0)}</span>
                  <span className="stat-label">Total Earned</span>
                </div>
              </div>
              <div className="stat-card">
                <Zap size={20} />
                <div className="stat-info">
                  <span className="stat-value">{formatCurrency(profile.stats?.totalSpent || 0)}</span>
                  <span className="stat-label">Total Spent</span>
                </div>
              </div>
            </div>
            
            <div className="stat-row">
              <div className="stat-card">
                <Calendar size={20} />
                <div className="stat-info">
                  <span className="stat-value">{formatTimeAgo(profile.stats?.lastActive)}</span>
                  <span className="stat-label">Last Active</span>
                </div>
              </div>
              <div className="stat-card">
                <Users size={20} />
                <div className="stat-info">
                  <span className="stat-value">{(profile.stats?.totalGames || 0) - (profile.stats?.totalWins || 0)}</span>
                  <span className="stat-label">Losses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Games */}
        {profile.recentGames && profile.recentGames.length > 0 && (
          <div className="section">
            <div className="section-header">
              <Activity size={24} className="section-icon" />
              <h3>Recent Games</h3>
            </div>
            
            <div className="recent-games">
              {profile.recentGames.slice(0, 5).map((game, index) => (
                <div key={index} className="game-card">
                  <div className="game-header">
                    <span className="game-judge">Judge: {game.judgeCharacter}</span>
                    <span className="game-time">{formatTimeAgo(game.roundCompleted)}</span>
                  </div>
                  <div className="game-info">
                    <span className="game-round">Round #{game.roundId}</span>
                    <span className="game-submitted">{formatTimeAgo(game.submittedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{styles}</style>
    </>
  );
};

const loadingStyles = `
  .my-stats-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #9999A5;
  }

  .loading-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 215, 0, 0.1);
    border-top: 3px solid #FFD700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    background: #9999A5;
    border-radius: 50%;
    animation: blink 1.5s infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const emptyStyles = `
  .my-stats-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: #9999A5;
  }

  .my-stats-empty svg {
    color: #666;
    margin-bottom: 20px;
  }

  .my-stats-empty h3 {
    color: #E6E6E6;
    margin-bottom: 12px;
    font-size: 24px;
  }

  .my-stats-empty p {
    max-width: 400px;
    line-height: 1.6;
  }
`;

const errorStyles = `
  .my-stats-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: #9999A5;
  }

  .my-stats-error svg {
    color: #FF6B6B;
    margin-bottom: 20px;
  }

  .my-stats-error h3 {
    color: #E6E6E6;
    margin-bottom: 12px;
    font-size: 24px;
  }

  .my-stats-error p {
    max-width: 400px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .start-playing-hint {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
    color: #FFD700;
  }

  .start-playing-hint p {
    margin: 0;
    font-size: 14px;
  }
`;

const styles = `
  .my-stats-tab {
    width: 100%;
  }

  .section {
    margin-bottom: 32px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(60, 75, 95, 0.3);
  }

  .section-icon {
    color: #FFD700;
  }

  .section-header h3 {
    margin: 0;
    color: #E6E6E6;
    font-size: 20px;
    font-weight: 600;
  }

  .player-header-section {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .player-avatar {
    width: 80px;
    height: 80px;
    background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
    background-size: 200% 100%;
    border: 3px solid #FFD700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFD700;
    animation: avatarBackground 3s linear infinite;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }

  @keyframes avatarBackground {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .hall-avatar {
    width: 74px;
    height: 74px;
    border-radius: 50%;
    object-fit: cover;
    transition: all 0.3s ease;
    filter: contrast(1.1) saturate(1.2);
  }

  .player-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    animation-duration: 1.5s;
  }

  .player-avatar:hover .hall-avatar {
    transform: scale(1.02);
    filter: contrast(1.2) saturate(1.3) brightness(1.1);
  }

  .player-details h2 {
    margin: 0;
    color: #E6E6E6;
    font-size: 24px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
  }

  .player-wallet-link {
    color: #E6E6E6;
    text-decoration: none;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;
    padding: 4px 6px;
  }

  .player-wallet-link::after {
    content: '🔗';
    opacity: 0;
    margin-left: 8px;
    font-size: 16px;
    transition: opacity 0.3s ease;
  }

  .player-wallet-link:hover {
    color: #FFD700;
    background: rgba(255, 215, 0, 0.1);
    transform: translateX(2px);
  }

  .player-wallet-link:hover::after {
    opacity: 1;
  }

  .player-details p {
    margin: 4px 0 0 0;
    color: #9999A5;
    font-size: 14px;
    font-weight: 600;
    background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9, #FFD700);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: championText 4s linear infinite;
  }

  @keyframes championText {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .player-summary {
    display: flex;
    gap: 24px;
  }

  .summary-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .summary-value {
    font-size: 20px;
    font-weight: 700;
    color: #FFD700;
    margin-bottom: 4px;
  }

  .summary-value.profit {
    color: #00FF88;
  }

  .summary-value.loss {
    color: #FF6B6B;
  }

  .summary-label {
    color: #9999A5;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .rankings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .ranking-card {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .ranking-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(30, 30, 40, 0.9);
  }

  .ranking-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .ranking-icon {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ranking-info h4 {
    margin: 0;
    color: #E6E6E6;
    font-size: 16px;
    font-weight: 600;
  }

  .ranking-info p {
    margin: 4px 0 0 0;
    color: #9999A5;
    font-size: 12px;
  }

  .ranking-position {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rank-display {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 18px;
  }

  .rank-crown, .rank-medal, .rank-award {
    filter: drop-shadow(0 0 4px currentColor);
  }

  .rank-number {
    font-size: 16px;
  }

  .rank-none {
    color: #666;
    font-size: 14px;
  }

  .rank-stats {
    text-align: right;
  }

  .rank-text {
    display: block;
    color: #E6E6E6;
    font-weight: 600;
    font-size: 14px;
  }

  .percentile {
    color: #FFD700;
    font-size: 12px;
    font-weight: 600;
  }

  .no-ranking {
    text-align: center;
    color: #666;
  }

  .no-ranking span {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .no-ranking p {
    margin: 0;
    font-size: 12px;
  }

  .detailed-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(30, 30, 40, 0.9);
  }

  .stat-card svg {
    color: #FFD700;
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #E6E6E6;
    margin-bottom: 4px;
  }

  .stat-label {
    color: #9999A5;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .recent-games {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .game-card {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .game-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(30, 30, 40, 0.9);
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .game-judge {
    color: #FFD700;
    font-weight: 600;
    font-size: 14px;
  }

  .game-time {
    color: #9999A5;
    font-size: 12px;
  }

  .game-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .game-round {
    color: #FFD700;
    font-weight: 600;
    font-size: 14px;
  }

  .game-submitted {
    color: #9999A5;
    font-size: 12px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .player-header-section {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .player-avatar {
      width: 70px;
      height: 70px;
    }

    .hall-avatar {
      width: 64px;
      height: 64px;
    }

    .player-summary {
      gap: 16px;
    }

    .rankings-grid {
      grid-template-columns: 1fr;
    }

    .stat-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default MyStatsTab; 