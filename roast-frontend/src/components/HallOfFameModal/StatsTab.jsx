import React from 'react';
import { 
  Users, MessageSquare, Coins, Zap, Crown, Calendar, TrendingUp, 
  Flame, Target, Activity, Award 
} from 'lucide-react';

const StatsTab = ({ 
  data, 
  isLoading, 
  formatCurrency, 
  formatTimeAgo 
}) => {
  if (isLoading) {
    return (
      <div className="stats-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p>Loading statistics...</p>
        <style jsx>{loadingStyles}</style>
      </div>
    );
  }

  const { global, judges, winStreaks, dailyActivity } = data;

  const globalStats = [
    {
      icon: Users,
      label: 'Total Roasters',
      value: global.totalPlayers.toLocaleString(),
      color: '#00D2E9',
      description: 'Unique players who joined the arena'
    },
    {
      icon: MessageSquare,
      label: 'Roasts Written',
      value: global.totalRoastsSubmitted.toLocaleString(),
      color: '#FF6B6B',
      description: 'Total roasts submitted across all rounds'
    },
    {
      icon: Coins,
      label: '0G Volume',
      value: formatCurrency(global.total0GCollected, global.currency),
      color: '#FFD700',
      description: 'Total 0G tokens collected from entry fees'
    },
    {
      icon: Award,
      label: 'Prizes Paid',
      value: formatCurrency(global.totalPrizesPaid, global.currency),
      color: '#00FF88',
      description: 'Total rewards distributed to winners'
    },
    {
      icon: Target,
      label: 'Completed Rounds',
      value: global.completedRounds.toLocaleString(),
      color: '#FF5CAA',
      description: 'Successfully completed roasting rounds'
    },
    {
      icon: TrendingUp,
      label: 'Average Prize',
      value: formatCurrency(global.averagePrize, global.currency),
      color: '#9999A5',
      description: 'Average prize per winning roast'
    }
  ];

  const getCharacterName = (character) => {
    const names = {
      'michael': 'Michael',
      'ada': 'Ada', 
      'jc': 'JC',
      'elisha': 'Elisha',
      'ren': 'Ren',
      'yon': 'Yon'
    };
    return names[character] || character;
  };

  const getCharacterColor = (character) => {
    const colors = {
      'michael': '#FFD700',
      'ada': '#FF6B6B',
      'jc': '#00D2E9', 
      'elisha': '#FF5CAA',
      'ren': '#00FF88',
      'yon': '#9B59B6'
    };
    return colors[character] || '#9999A5';
  };

  return (
    <>
      <div className="stats-tab">
        {/* Global Statistics */}
        <div className="section">
          <div className="section-header">
            <Flame size={24} className="section-icon" />
            <h3>All Time 0G Roasted Statistics</h3>
          </div>
          
          <div className="global-stats">
            {globalStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    <IconComponent size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-description">{stat.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Judge Statistics */}
        {judges.length > 0 && (
          <div className="section">
            <div className="section-header">
              <Crown size={24} className="section-icon" />
              <h3>Judge Performance</h3>
            </div>
            
            <div className="judges-grid">
              {judges.map((judge, index) => (
                <div key={judge.character} className="judge-card">
                  <div className="judge-header">
                    <div className="judge-avatar" style={{ backgroundColor: getCharacterColor(judge.character) }}>
                      <img 
                        src={`/${judge.character}.jpg`} 
                        alt={getCharacterName(judge.character)}
                        className="judge-nft-image"
                      />
                    </div>
                    <div className="judge-info">
                      <h4>{getCharacterName(judge.character)}</h4>
                      <p>{judge.roundsJudged} rounds judged</p>
                    </div>
                  </div>
                  
                  <div className="judge-stats">
                    <div className="judge-stat">
                      <span className="judge-stat-label">Roasts Received</span>
                      <span className="judge-stat-value">{judge.roastsReceived}</span>
                    </div>
                    <div className="judge-stat">
                      <span className="judge-stat-label">Total Prizes</span>
                      <span className="judge-stat-value">{formatCurrency(judge.totalPrizesAwarded, global.currency)}</span>
                    </div>
                    <div className="judge-stat">
                      <span className="judge-stat-label">Avg Prize</span>
                      <span className="judge-stat-value">{formatCurrency(judge.averagePrize, global.currency)}</span>
                    </div>
                    <div className="judge-stat">
                      <span className="judge-stat-label">Participants</span>
                      <span className="judge-stat-value">{judge.uniqueParticipants}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Win Streaks */}
        {winStreaks.length > 0 && (
          <div className="section">
            <div className="section-header">
              <Zap size={24} className="section-icon" />
              <h3>Epic Win Streaks</h3>
            </div>
            
            <div className="streaks-list">
              {winStreaks.slice(0, 5).map((streak, index) => (
                <div key={`${streak.address}-${index}`} className="streak-card">
                  <div className="streak-rank">
                    #{streak.rank}
                  </div>
                  <div className="streak-info">
                    <div className="streak-header">
                      <a 
                        href={`https://chainscan-galileo.0g.ai/address/${streak.address}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="streak-address"
                        title="View on 0G Chain Explorer"
                      >
                        0x..{streak.address.slice(-4)}
                      </a>
                      <span className="streak-length">{streak.longestStreak} wins in a row</span>
                    </div>
                    <div className="streak-period">
                      {formatTimeAgo(streak.streakStart)} → {formatTimeAgo(streak.streakEnd)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Preview */}
        {dailyActivity.length > 0 && (
          <div className="section">
            <div className="section-header">
              <Activity size={24} className="section-icon" />
              <h3>Recent Activity (Last 7 Days)</h3>
            </div>
            
            <div className="activity-summary">
              {dailyActivity.slice(0, 7).map((day, index) => (
                <div key={day.date} className="activity-day">
                  <div className="activity-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="activity-metrics">
                    <div className="activity-metric">
                      <span className="metric-value">{day.roundsPlayed}</span>
                      <span className="metric-label">rounds</span>
                    </div>
                    <div className="activity-metric">
                      <span className="metric-value">{day.activePlayers}</span>
                      <span className="metric-label">players</span>
                    </div>
                    <div className="activity-metric">
                      <span className="metric-value">{formatCurrency(day.dailyPrizes, global.currency)}</span>
                      <span className="metric-label">prizes</span>
                    </div>
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
  .stats-loading {
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
    background-color: #9999A5;
    border-radius: 50%;
    animation: blink 1.4s ease-in-out infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
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

const styles = `
  .stats-tab {
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

  .global-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
    transform: translateY(-1px);
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-label {
    color: #E6E6E6;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .stat-description {
    color: #9999A5;
    font-size: 12px;
    line-height: 1.4;
  }

  .judges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .judge-card {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .judge-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(30, 30, 40, 0.9);
  }

  .judge-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .judge-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid;
  }

  .judge-nft-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .judge-info h4 {
    margin: 0;
    color: #E6E6E6;
    font-size: 16px;
    font-weight: 600;
  }

  .judge-info p {
    margin: 0;
    color: #9999A5;
    font-size: 12px;
  }

  .judge-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .judge-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 80px;
    transition: all 0.3s ease;
  }

  .judge-card:hover .judge-stat {
    transform: translateY(-1px);
  }

  .judge-stat-label {
    color: #9999A5;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .judge-stat-value {
    color: #E6E6E6;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .streaks-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .streak-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .streak-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(30, 30, 40, 0.9);
  }

  .streak-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 215, 0, 0.1);
    border-radius: 50%;
    color: #FFD700;
    font-weight: 700;
    font-size: 14px;
  }

  .streak-info {
    flex: 1;
  }

  .streak-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .streak-address {
    font-family: 'Courier New', monospace;
    color: #E6E6E6;
    font-weight: 600;
    text-decoration: none;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;
    padding: 2px 4px;
  }

  .streak-address::after {
    content: '🔗';
    opacity: 0;
    margin-left: 4px;
    font-size: 10px;
    transition: opacity 0.3s ease;
  }

  .streak-address:hover {
    color: #FFD700;
    background: rgba(255, 215, 0, 0.1);
    transform: translateX(2px);
  }

  .streak-address:hover::after {
    opacity: 1;
  }

  .streak-card:hover .streak-address {
    color: #FFD700;
  }

  .streak-length {
    color: #FFD700;
    font-weight: 700;
  }

  .streak-period {
    color: #9999A5;
    font-size: 12px;
  }

  .activity-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .activity-day {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .activity-day:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(30, 30, 40, 0.9);
  }

  .activity-date {
    color: #E6E6E6;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .activity-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .activity-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 50px;
  }

  .metric-value {
    color: #FFD700;
    font-weight: 700;
    font-size: 16px;
  }

  .metric-label {
    color: #9999A5;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .global-stats {
      grid-template-columns: 1fr;
    }

    .judges-grid {
      grid-template-columns: 1fr;
    }

    .activity-summary {
      grid-template-columns: repeat(2, 1fr);
    }

    .judge-stats {
      gap: 12px;
    }

    .judge-stat {
      min-width: 70px;
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }

    .streak-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
`;

export default StatsTab; 