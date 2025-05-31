import React, { useState, useEffect } from 'react';
import { Gift, Calendar, TrendingUp, Target, Activity, Crown, CheckCircle, Clock, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

const RewardsDistributionTab = ({ 
  dailyRewards,
  loadDailyRewards,
  loadDailyRewardsHistory,
  formatAddress,
  formatCurrency,
  formatTimeAgo,
  isLoading
}) => {
  const [selectedDate, setSelectedDate] = useState('yesterday');
  const [viewMode, setViewMode] = useState('current'); // current | history
  const [expandedCategories, setExpandedCategories] = useState({
    topEarners: true,
    mostWins: false,
    bestWinRate: false,
    mostActive: false
  });

  // Load data when component mounts or date changes
  useEffect(() => {
    if (viewMode === 'current') {
      const dateParam = selectedDate === 'yesterday' ? null : selectedDate;
      loadDailyRewards(dateParam);
    } else {
      loadDailyRewardsHistory(14);
    }
  }, [selectedDate, viewMode, loadDailyRewards, loadDailyRewardsHistory]);

  const categories = [
    { 
      id: 'topEarners', 
      title: 'Top Earners', 
      icon: TrendingUp, 
      color: '#FFD700',
      description: 'Highest earnings in a single day'
    },
    { 
      id: 'mostWins', 
      title: 'Most Wins', 
      icon: Crown, 
      color: '#FF6B6B',
      description: 'Most victories in a single day'
    },
    { 
      id: 'bestWinRate', 
      title: 'Best Win Rate', 
      icon: Target, 
      color: '#00D2E9',
      description: 'Highest win percentage (min. 2 wins)'
    },
    { 
      id: 'mostActive', 
      title: 'Most Active', 
      icon: Activity, 
      color: '#FF5CAA',
      description: 'Most games played in a single day'
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getPositionEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getPaymentStatus = (reward) => {
    if (reward.isPaid) {
      return {
        icon: CheckCircle,
        color: '#00FF88',
        text: 'Paid',
        className: 'paid'
      };
    } else {
      return {
        icon: Clock,
        color: '#FFD700',
        text: 'Pending',
        className: 'pending'
      };
    }
  };

  const renderCurrentRewards = () => {
    const data = dailyRewards.data;
    if (!data) return null;

    return (
      <>
        {/* Header with date and summary */}
        <div className="rewards-header">
          <div className="rewards-title">
            <Gift size={24} className="title-icon" />
            <div>
              <h3>Daily Hall of Fame Rewards</h3>
              <p>Distribution for {data.date}</p>
            </div>
          </div>
          
          <div className="date-selector">
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-select"
            >
              <option value="yesterday">Yesterday</option>
              <option value="2024-01-30">2024-01-30</option>
              <option value="2024-01-29">2024-01-29</option>
              <option value="2024-01-28">2024-01-28</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon" style={{ color: '#FFD700' }}>
              <Crown size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{data.summary.totalRewards}</span>
              <span className="summary-label">Total Rewards</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon" style={{ color: '#00FF88' }}>
              <TrendingUp size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{formatCurrency(data.summary.totalRewardsDistributed)}</span>
              <span className="summary-label">Distributed</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon" style={{ color: data.summary.failedPayments > 0 ? '#FF6B6B' : '#00FF88' }}>
              <CheckCircle size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{data.summary.successfulPayments}/{data.summary.totalRewards}</span>
              <span className="summary-label">Success Rate</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon" style={{ color: '#00D2E9' }}>
              <Activity size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{data.dailyStats.qualifiedPlayers}</span>
              <span className="summary-label">Qualified Players</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="categories-list">
          {categories.map((category) => {
            const categoryData = data.categories[category.id] || [];
            const isExpanded = expandedCategories[category.id];
            const IconComponent = category.icon;

            return (
              <div key={category.id} className="category-section">
                <button 
                  className="category-header"
                  onClick={() => toggleCategory(category.id)}
                  style={{ '--category-color': category.color }}
                >
                  <div className="category-info">
                    <IconComponent size={20} style={{ color: category.color }} />
                    <div>
                      <h4>{category.title}</h4>
                      <span className="category-count">{categoryData.length} rewards</span>
                    </div>
                  </div>
                  {isExpanded ? 
                    <ChevronDown size={16} style={{ color: '#FFD700' }} /> : 
                    <ChevronRight size={16} style={{ color: '#FFD700' }} />
                  }
                </button>

                {isExpanded && (
                  <div className="category-rewards">
                    {categoryData.map((reward, index) => {
                      const status = getPaymentStatus(reward);
                      const StatusIcon = status.icon;

                      return (
                        <div key={`${category.id}-${index}`} className="reward-card">
                          <div className="reward-position">
                            <span className="position-emoji">{getPositionEmoji(reward.position)}</span>
                            <span className="position-label">{reward.positionLabel}</span>
                          </div>
                          
                          <div className="reward-info">
                            <div className="reward-address">
                              <a 
                                href={`https://chainscan-galileo.0g.ai/address/${reward.playerAddress}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="address-link"
                              >
                                {formatAddress(reward.playerAddress)}
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            <div className="reward-details">
                              <span className="reward-amount">
                                {formatCurrency(reward.rewardAmount)} ({reward.percentage}%)
                              </span>
                            </div>
                          </div>
                          
                          <div className={`reward-status ${status.className}`}>
                            <StatusIcon size={14} style={{ color: status.color }} />
                            <span>{status.text}</span>
                            {reward.txHash && (
                              <a 
                                href={`https://chainscan-galileo.0g.ai/tx/${reward.txHash}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="tx-link"
                                title="View transaction"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderHistoryView = () => {
    const history = dailyRewards.history || [];
    
    return (
      <div className="history-view">
        <div className="history-header">
          <Calendar size={24} className="title-icon" />
          <div>
            <h3>Rewards History</h3>
            <p>Last 14 days of daily distributions</p>
          </div>
        </div>

        <div className="history-list">
          {history.map((dayData, index) => (
            <div key={dayData.date} className="history-card">
              <div className="history-date">
                <span className="date-label">{dayData.date}</span>
                <span className="days-ago">{index === 0 ? 'Yesterday' : `${index + 1} days ago`}</span>
              </div>
              
              <div className="history-summary">
                <div className="history-stat">
                  <span className="stat-value">{dayData.summary.totalRewards}</span>
                  <span className="stat-label">Rewards</span>
                </div>
                <div className="history-stat">
                  <span className="stat-value">{formatCurrency(dayData.summary.totalRewardsDistributed)}</span>
                  <span className="stat-label">Distributed</span>
                </div>
                <div className="history-stat">
                  <span className="stat-value">{dayData.summary.successfulPayments}/{dayData.summary.totalRewards}</span>
                  <span className="stat-label">Success</span>
                </div>
              </div>
              
              <button 
                className="view-details-btn"
                onClick={() => {
                  setSelectedDate(dayData.date);
                  setViewMode('current');
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading || dailyRewards.isLoading) {
    return (
      <div className="rewards-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p>Loading rewards distribution...</p>
        <style jsx>{loadingStyles}</style>
      </div>
    );
  }

  if (dailyRewards.error) {
    return (
      <div className="rewards-error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load rewards data</h3>
        <p>{dailyRewards.error}</p>
        <button 
          className="retry-btn"
          onClick={() => viewMode === 'current' ? loadDailyRewards() : loadDailyRewardsHistory()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rewards-tab">
        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'current' ? 'active' : ''}`}
            onClick={() => setViewMode('current')}
          >
            <Gift size={16} />
            Current
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            <Calendar size={16} />
            History
          </button>
        </div>

        {/* Content */}
        {viewMode === 'current' ? renderCurrentRewards() : renderHistoryView()}
      </div>

      <style jsx>{rewardsTabStyles}</style>
    </>
  );
};

const loadingStyles = `
  .rewards-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #E6E6E6;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 215, 0, 0.3);
    border-top: 3px solid #FFD700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-dots {
    display: flex;
    gap: 8px;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    background: #FFD700;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
  }

  .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
  .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    } 40% {
      transform: scale(1);
    }
  }
`;

const rewardsTabStyles = `
  .rewards-tab {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .view-toggle {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #9999A5;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #E6E6E6;
  }

  .toggle-btn.active {
    background: rgba(255, 215, 0, 0.1);
    border-color: #FFD700;
    color: #FFD700;
  }

  .rewards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: rgba(255, 215, 0, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 215, 0, 0.2);
  }

  .rewards-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon {
    color: #FFD700;
  }

  .rewards-title h3 {
    margin: 0;
    color: #E6E6E6;
    font-size: 18px;
  }

  .rewards-title p {
    margin: 0;
    color: #9999A5;
    font-size: 14px;
  }

  .date-selector .date-select {
    padding: 8px 12px;
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 6px;
    color: #E6E6E6;
    font-size: 14px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin: 20px 0;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(30, 30, 40, 0.6);
    border-radius: 8px;
    border: 1px solid rgba(60, 75, 95, 0.3);
    transition: all 0.3s ease;
  }

  .summary-card:hover {
    border-color: rgba(255, 215, 0, 0.4);
    transform: translateY(-2px);
  }

  .summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .summary-content {
    display: flex;
    flex-direction: column;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 600;
    color: #E6E6E6;
  }

  .summary-label {
    font-size: 12px;
    color: #9999A5;
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-section {
    background: rgba(30, 30, 40, 0.6);
    border-radius: 8px;
    border: 1px solid rgba(60, 75, 95, 0.3);
    overflow: hidden;
  }

  .category-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .category-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .category-info h4 {
    margin: 0;
    color: #E6E6E6;
    font-size: 16px;
  }

  .category-count {
    color: #9999A5;
    font-size: 12px;
  }

  .category-rewards {
    padding: 0 16px 16px 16px;
    border-top: 1px solid rgba(60, 75, 95, 0.3);
  }

  .reward-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    margin: 8px 0;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    border: 1px solid rgba(60, 75, 95, 0.2);
    transition: all 0.3s ease;
  }

  .reward-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }

  .reward-position {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 60px;
  }

  .position-emoji {
    font-size: 20px;
  }

  .position-label {
    font-size: 10px;
    color: #9999A5;
  }

  .reward-info {
    flex: 1;
    margin: 0 16px;
  }

  .address-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #00D2E9;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
  }

  .address-link:hover {
    color: #FFD700;
  }

  .reward-amount {
    color: #00FF88;
    font-weight: 600;
    font-size: 14px;
  }

  .reward-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .reward-status.paid {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
    color: #00FF88;
  }

  .reward-status.pending {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    color: #FFD700;
  }

  .tx-link {
    color: inherit;
    text-decoration: none;
    margin-left: 4px;
  }

  .history-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .history-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: rgba(0, 210, 233, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(0, 210, 233, 0.2);
  }

  .history-header .title-icon {
    color: #00D2E9;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: rgba(30, 30, 40, 0.6);
    border-radius: 8px;
    border: 1px solid rgba(60, 75, 95, 0.3);
    transition: all 0.3s ease;
  }

  .history-card:hover {
    border-color: rgba(0, 210, 233, 0.4);
    transform: translateY(-1px);
  }

  .history-date {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .date-label {
    color: #E6E6E6;
    font-weight: 600;
    font-size: 14px;
  }

  .days-ago {
    color: #9999A5;
    font-size: 12px;
  }

  .history-summary {
    display: flex;
    gap: 24px;
  }

  .history-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .history-stat .stat-value {
    color: #E6E6E6;
    font-weight: 600;
    font-size: 14px;
  }

  .history-stat .stat-label {
    color: #9999A5;
    font-size: 11px;
  }

  .view-details-btn {
    padding: 8px 16px;
    background: rgba(0, 210, 233, 0.1);
    border: 1px solid rgba(0, 210, 233, 0.3);
    border-radius: 6px;
    color: #00D2E9;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  .view-details-btn:hover {
    background: rgba(0, 210, 233, 0.2);
    transform: scale(1.05);
  }

  .rewards-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .rewards-error h3 {
    color: #FF6B6B;
    margin: 0 0 8px 0;
  }

  .rewards-error p {
    color: #9999A5;
    margin: 0 0 20px 0;
  }

  .retry-btn {
    padding: 10px 20px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid #FF6B6B;
    border-radius: 6px;
    color: #FF6B6B;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-btn:hover {
    background: rgba(255, 107, 107, 0.2);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .reward-card {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .history-card {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .history-summary {
      justify-content: space-around;
      width: 100%;
    }
  }
`;

export default RewardsDistributionTab; 