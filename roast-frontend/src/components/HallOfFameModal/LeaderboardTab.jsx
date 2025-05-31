import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Target, Activity, Crown, Medal, Award } from 'lucide-react';

const LeaderboardTab = ({ 
  data, 
  isLoading, 
  formatAddress, 
  formatCurrency, 
  formatPercentage, 
  formatTimeAgo,
  themeColors 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('topEarners');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  const categories = [
    { 
      id: 'topEarners', 
      title: 'Top Earners', 
      icon: Trophy, 
      color: themeColors?.primary || '#FFD700',
      description: 'Players with highest total earnings'
    },
    { 
      id: 'mostWins', 
      title: 'Most Wins', 
      icon: Crown, 
      color: '#FF6B6B',
      description: 'Players with most victories'
    },
    { 
      id: 'bestWinRate', 
      title: 'Best Win Rate', 
      icon: Target, 
      color: '#00D2E9',
      description: 'Highest win percentage (min. 3 games)'
    },
    { 
      id: 'mostActive', 
      title: 'Most Active', 
      icon: Activity, 
      color: '#FF5CAA',
      description: 'Players with most games played'
    }
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={16} className="rank-crown" />;
      case 2: return <Medal size={16} className="rank-medal" />;
      case 3: return <Award size={16} className="rank-award" />;
      default: return <span className="rank-number">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return themeColors?.primary || '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#9999A5';
    }
  };

  const getMainStat = (player, categoryId) => {
    const { stats } = player;
    switch (categoryId) {
      case 'topEarners':
        return formatCurrency(stats.totalEarned);
      case 'mostWins':
        return `${stats.totalWins} wins`;
      case 'bestWinRate':
        return formatPercentage(stats.winRate);
      case 'mostActive':
        return `${stats.totalGames} games`;
      default:
        return '---';
    }
  };

  const currentData = data[selectedCategory] || [];
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Scroll handler for back-to-top button
  const handleScroll = (e) => {
    setShowBackToTop(e.target.scrollTop > 300);
  };

  const scrollToTop = () => {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('scroll', handleScroll);
      return () => modalContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Enhanced category change with animation
  const handleCategoryChange = (newCategory) => {
    if (newCategory === selectedCategory) return;
    
    setIsChangingCategory(true);
    
    setTimeout(() => {
      setSelectedCategory(newCategory);
      setTimeout(() => {
        setIsChangingCategory(false);
      }, 50);
    }, 150);
  };

  // Dynamic styles with theme colors
  const dynamicStyles = `
    .leaderboard-tab {
      width: 100%;
      animation: slideInUp 0.4s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .category-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .category-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 12px;
      background: rgba(30, 30, 40, 0.8);
      border: 2px solid rgba(60, 75, 95, 0.3);
      border-radius: 12px;
      color: #9999A5;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px);
      animation: categoryFadeIn 0.5s ease-out forwards;
      animation-delay: var(--animation-delay);
    }

    @keyframes categoryFadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .category-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.6s ease;
    }

    .category-btn:hover::before {
      left: 100%;
    }

    .category-btn:hover {
      border-color: var(--category-color);
      background: rgba(30, 30, 40, 0.9);
      color: #E6E6E6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .category-btn.active {
      border-color: var(--category-color);
      background: rgba(30, 30, 40, 0.95);
      color: var(--category-color);
      box-shadow: 0 0 20px ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
      transform: translateY(-1px);
    }

    .category-btn.active::before {
      display: none;
    }

    .category-title {
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .category-count {
      font-size: 12px;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }

    .category-btn:hover .category-count {
      opacity: 1;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 16px;
      background: rgba(30, 30, 40, 0.6);
      border-radius: 12px;
      border: 1px solid rgba(60, 75, 95, 0.3);
      animation: headerSlideIn 0.4s ease-out;
    }

    @keyframes headerSlideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-info h3 {
      margin: 0;
      color: #E6E6E6;
      font-size: 18px;
      font-weight: 600;
    }

    .category-info p {
      margin: 0;
      color: #9999A5;
      font-size: 14px;
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      opacity: 1;
      transform: translateY(0);
      transition: all 0.3s ease;
    }

    .leaderboard-list.changing {
      opacity: 0.3;
      transform: translateY(10px);
    }

    .scroll-indicator {
      text-align: center;
      padding: 12px 16px;
      background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
      border: 1px solid ${themeColors?.primary20 || 'rgba(255, 215, 0, 0.2)'};
      border-radius: 8px;
      margin-bottom: 16px;
      color: ${themeColors?.primary || '#FFD700'};
      font-size: 14px;
      font-weight: 500;
      animation: glow 2s ease-in-out infinite alternate;
      opacity: 0;
      animation: scrollIndicatorIn 0.6s ease-out 0.2s forwards, glow 2s ease-in-out infinite alternate 0.8s;
    }

    @keyframes scrollIndicatorIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes glow {
      0% { box-shadow: 0 0 5px ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'}; }
      100% { box-shadow: 0 0 15px ${themeColors?.primary50 || 'rgba(255, 215, 0, 0.5)'}; }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9999A5;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .empty-state svg {
      margin-bottom: 12px;
      opacity: 0.5;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    .player-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 30, 40, 0.8);
      border: 1px solid rgba(60, 75, 95, 0.3);
      border-radius: 12px;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateX(-20px);
      animation: playerCardIn 0.5s ease-out forwards;
      animation-delay: var(--animation-delay);
      position: relative;
      overflow: hidden;
    }

    @keyframes playerCardIn {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .player-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.05)'}, transparent);
      transition: left 0.8s ease;
    }

    .player-card:hover::before {
      left: 100%;
    }

    .player-card:hover {
      border-color: ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
      background: rgba(30, 30, 40, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .player-rank {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .player-card:hover .player-rank {
      transform: scale(1.1);
    }

    .rank-crown, .rank-medal, .rank-award {
      filter: drop-shadow(0 0 4px currentColor);
      transition: filter 0.3s ease;
    }

    .player-card:hover .rank-crown,
    .player-card:hover .rank-medal,
    .player-card:hover .rank-award {
      filter: drop-shadow(0 0 8px currentColor);
    }

    .rank-number {
      font-size: 14px;
    }

    .player-info {
      flex: 1;
    }

    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .player-address {
      font-family: 'Courier New', monospace;
      color: #E6E6E6;
      font-weight: 600;
      font-size: 16px;
      text-decoration: none;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
      padding: 2px 4px;
    }

    .player-address::after {
      content: '🔗';
      opacity: 0;
      margin-left: 6px;
      font-size: 12px;
      transition: opacity 0.3s ease;
    }

    .player-address:hover {
      color: ${themeColors?.primary || '#FFD700'};
      background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
      transform: translateX(2px);
    }

    .player-address:hover::after {
      opacity: 1;
    }

    .player-card:hover .player-address {
      color: ${themeColors?.primary || '#FFD700'};
    }

    .main-stat {
      font-weight: 700;
      font-size: 18px;
      transition: all 0.3s ease;
    }

    .player-card:hover .main-stat {
      transform: scale(1.05);
    }

    .player-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      min-width: 80px;
      transition: all 0.3s ease;
    }

    .player-card:hover .stat-item {
      transform: translateY(-1px);
    }

    .stat-label {
      color: #9999A5;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: color 0.3s ease;
    }

    .stat-value {
      color: #E6E6E6;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .stat-value.profit {
      color: #00FF88;
    }

    .stat-value.loss {
      color: #FF5C5C;
    }

    .player-footer {
      text-align: right;
    }

    .last-active {
      color: #666;
      font-size: 11px;
      transition: color 0.3s ease;
    }

    .player-card:hover .last-active {
      color: #999;
    }

    .back-to-top {
      position: fixed;
      bottom: 100px;
      right: 40px;
      background: ${themeColors?.primary || 'rgba(255, 215, 0, 0.9)'};
      color: #000;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px ${themeColors?.primary50 || 'rgba(255, 215, 0, 0.4)'};
      animation: fadeInUp 0.3s ease;
    }

    .back-to-top:hover {
      background: ${themeColors?.primary || 'rgba(255, 215, 0, 1)'};
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${themeColors?.primary || 'rgba(255, 215, 0, 0.6)'};
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .category-selector {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .category-btn {
        padding: 12px 8px;
      }

      .category-title {
        font-size: 12px;
      }

      .player-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
      }

      .player-rank {
        min-width: auto;
        align-self: flex-end;
      }

      .player-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        width: 100%;
      }

      .player-address {
        font-size: 14px;
      }

      .main-stat {
        font-size: 16px;
        align-self: flex-end;
      }

      .player-stats {
        gap: 12px;
        width: 100%;
      }

      .stat-item {
        min-width: 70px;
      }

      .stat-label {
        font-size: 10px;
      }

      .stat-value {
        font-size: 13px;
      }

      .back-to-top {
        bottom: 80px;
        right: 20px;
        padding: 10px 16px;
        font-size: 12px;
      }
    }
  `;

  // Dynamic loading styles with theme colors
  const dynamicLoadingStyles = `
    .leaderboard-loading {
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
      margin-bottom: 16px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid ${themeColors?.primary20 || 'rgba(255, 215, 0, 0.1)'};
      border-top: 3px solid ${themeColors?.primary || '#FFD700'};
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
      background: ${themeColors?.primary || '#FFD700'};
      border-radius: 50%;
      animation: blink 1.4s infinite;
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
      50% { opacity: 0.2; }
    }
  `;

  if (isLoading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p>Loading leaderboards...</p>
        <style jsx>{dynamicLoadingStyles}</style>
      </div>
    );
  }

  return (
    <>
      <div className="leaderboard-tab">
        {/* Category Selector */}
        <div className="category-selector">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <button 
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
                style={{
                  '--category-color': category.color,
                  '--animation-delay': `${index * 0.1}s`
                }}
              >
                <IconComponent size={18} />
                <span className="category-title">{category.title}</span>
                <span className="category-count">({(data[category.id] || []).length})</span>
              </button>
            );
          })}
        </div>

        {/* Current Category Header */}
        {currentCategory && (
          <div className="category-header">
            <div className="category-info">
              <currentCategory.icon size={24} style={{ color: currentCategory.color }} />
              <div>
                <h3>{currentCategory.title}</h3>
                <p>{currentCategory.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className={`leaderboard-list ${isChangingCategory ? 'changing' : ''}`}>
          {currentData.length === 0 ? (
            <div className="empty-state">
              <Crown size={32} />
              <p>No data available for this category</p>
            </div>
          ) : (
            <>
              {/* Scroll Indicator */}
              {currentData.length > 10 && (
                <div className="scroll-indicator">
                  <span>📜 Scroll down to see all {currentData.length} players</span>
                </div>
              )}
              
              {currentData.map((player, index) => (
                <div 
                  key={`${selectedCategory}-${player.address}-${index}`} 
                  className="player-card"
                  style={{ '--animation-delay': `${index * 0.05}s` }}
                >
                  <div className="player-rank" style={{ color: getRankColor(player.rank) }}>
                    {getRankIcon(player.rank)}
                  </div>
                  
                  <div className="player-info">
                    <div className="player-header">
                      <a 
                        href={`https://chainscan-galileo.0g.ai/address/${player.address}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="player-address"
                        title="View on 0G Chain Explorer"
                      >
                        {formatAddress(player.address)}
                      </a>
                      <span className="main-stat" style={{ color: currentCategory.color }}>
                        {getMainStat(player, selectedCategory)}
                      </span>
                    </div>
                    
                    <div className="player-stats">
                      <div className="stat-item">
                        <span className="stat-label">Games:</span>
                        <span className="stat-value">{player.stats.totalGames}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Wins:</span>
                        <span className="stat-value">{player.stats.totalWins}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Win Rate:</span>
                        <span className="stat-value">{formatPercentage(player.stats.winRate)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Net Profit:</span>
                        <span className={`stat-value ${player.stats.netProfit >= 0 ? 'profit' : 'loss'}`}>
                          {formatCurrency(player.stats.netProfit)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="player-footer">
                      <span className="last-active">
                        Last active: {formatTimeAgo(player.stats.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button className="back-to-top" onClick={scrollToTop}>
            ↑ Back to Top
          </button>
        )}
      </div>

      <style jsx>{dynamicStyles}</style>
    </>
  );
};

export default LeaderboardTab; 