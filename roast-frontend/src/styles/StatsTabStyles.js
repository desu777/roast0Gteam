const StatsTabStyles = (themeColors) => `
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
    color: ${themeColors?.primary || '#FFD700'};
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
    border-color: ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
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
    border-color: ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
    background: rgba(30, 30, 40, 0.9);
    transform: translateY(-1px);
  }

  .judge-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .judge-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .judge-nft-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .judge-info h4 {
    margin: 0 0 4px 0;
    color: #E6E6E6;
    font-size: 18px;
    font-weight: 600;
  }

  .judge-info p {
    margin: 0;
    color: #9999A5;
    font-size: 12px;
  }

  .judge-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .judge-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .judge-stat:hover {
    background: rgba(255, 255, 255, 0.1);
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
    border-color: ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
    background: rgba(30, 30, 40, 0.9);
  }

  .streak-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
    border-radius: 50%;
    color: ${themeColors?.primary || '#FFD700'};
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
    color: ${themeColors?.primary || '#FFD700'};
    background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
    transform: translateX(2px);
  }

  .streak-address:hover::after {
    opacity: 1;
  }

  .streak-card:hover .streak-address {
    color: ${themeColors?.primary || '#FFD700'};
  }

  .streak-length {
    color: ${themeColors?.primary || '#FFD700'};
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
    border-color: ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
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
    color: ${themeColors?.primary || '#FFD700'};
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

export default StatsTabStyles; 