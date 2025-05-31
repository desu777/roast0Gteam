import React from 'react';
import { Calendar } from 'lucide-react';

const HistoryView = ({
  history,
  formatCurrency,
  setSelectedDate,
  setViewMode
}) => {
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

export default HistoryView; 