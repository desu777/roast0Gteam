/**
 * Styles for Rewards Distribution Tab components
 */

export const getRewardsStyles = (themeColors) => `
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
    background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
    border-color: ${themeColors?.primary || '#FFD700'};
    color: ${themeColors?.primary || '#FFD700'};
  }

  .rewards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.05)'};
    border-radius: 12px;
    border: 1px solid ${themeColors?.primary20 || 'rgba(255, 215, 0, 0.2)'};
  }

  .rewards-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon {
    color: ${themeColors?.primary || '#FFD700'};
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
    border: 1px solid ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
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
    border-color: ${themeColors?.primary || 'rgba(255, 215, 0, 0.4)'};
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
    border-color: ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
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
    color: ${themeColors?.primary || '#FFD700'};
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
    background: ${themeColors?.primary10 || 'rgba(255, 215, 0, 0.1)'};
    border: 1px solid ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
    color: ${themeColors?.primary || '#FFD700'};
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

export const getLoadingStyles = (themeColors) => `
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
    border: 3px solid ${themeColors?.primary30 || 'rgba(255, 215, 0, 0.3)'};
    border-top: 3px solid ${themeColors?.primary || '#FFD700'};
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
    background: ${themeColors?.primary || '#FFD700'};
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