import React from 'react';
import { Gift, Crown, TrendingUp, CheckCircle, Activity, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { getPositionEmoji, getPaymentStatus, rewardsCategories } from '../utils/rewardsHelpers';

const getIconComponent = (iconName) => {
  const icons = {
    TrendingUp,
    Crown,
    Target: TrendingUp, // Fallback since Target is not in lucide-react
    Activity,
    CheckCircle
  };
  return icons[iconName] || TrendingUp;
};

const CurrentRewards = ({
  data,
  selectedDate,
  setSelectedDate,
  expandedCategories,
  setExpandedCategories,
  formatAddress,
  formatCurrency,
  themeColors
}) => {
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

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
          <div className="summary-icon" style={{ color: themeColors?.primary || '#FFD700' }}>
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
        {rewardsCategories.map((category) => {
          const categoryData = data.categories[category.id] || [];
          const isExpanded = expandedCategories[category.id];
          const IconComponent = getIconComponent(category.icon);

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
                  <ChevronDown size={16} style={{ color: themeColors?.primary || '#FFD700' }} /> : 
                  <ChevronRight size={16} style={{ color: themeColors?.primary || '#FFD700' }} />
                }
              </button>

              {isExpanded && (
                <div className="category-rewards">
                  {categoryData.map((reward, index) => {
                    const status = getPaymentStatus(reward, themeColors);
                    const StatusIcon = getIconComponent(status.icon);

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

export default CurrentRewards; 