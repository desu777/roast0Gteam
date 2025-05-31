import React from 'react';
import { 
  Users, MessageSquare, Coins, Zap, Crown, Calendar, TrendingUp, 
  Flame, Target, Activity, Award 
} from 'lucide-react';
import StatsTabStyles from '../../styles/StatsTabStyles';

const StatsTab = ({ 
  data, 
  isLoading, 
  formatCurrency, 
  formatTimeAgo,
  themeColors 
}) => {
  if (isLoading) {
    const dynamicLoadingStyles = StatsTabStyles(themeColors);

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
        <style jsx>{dynamicLoadingStyles}</style>
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
      color: themeColors?.primary || '#FFD700',
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
      'yon': 'Yon',
      'zer0': 'Zer0',
      'dao_agent': 'DAO Agent'
    };
    return names[character] || character;
  };

  const getCharacterColor = (character) => {
    const colors = {
      'michael': themeColors?.primary || '#FFD700',
      'ada': '#FF6B6B',
      'jc': '#00D2E9', 
      'elisha': '#FF5CAA',
      'ren': '#00FF88',
      'yon': '#9B59B6',
      'zer0': '#F8C0D6',
      'dao_agent': '#4A90E2'
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
                        {streak.address.slice(0, 6)}...{streak.address.slice(-4)}
                      </a>
                      <span className="streak-length">{streak.length} wins</span>
                    </div>
                    <div className="streak-period">
                      {formatTimeAgo(streak.startDate)} - {formatTimeAgo(streak.endDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Activity */}
        {dailyActivity.length > 0 && (
          <div className="section">
            <div className="section-header">
              <Calendar size={24} className="section-icon" />
              <h3>Recent Daily Activity</h3>
            </div>
            
            <div className="activity-summary">
              {dailyActivity.slice(0, 7).map((day, index) => (
                <div key={day.date} className="activity-day">
                  <div className="activity-date">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="activity-metrics">
                    <div className="activity-metric">
                      <span className="metric-value">{day.rounds}</span>
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

      <style jsx>{StatsTabStyles(themeColors)}</style>
    </>
  );
};

export default StatsTab; 