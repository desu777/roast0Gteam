import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp, Users, RefreshCw, X, User } from 'lucide-react';
import { useHallOfFame } from '../../hooks/useHallOfFame';
import LeaderboardTab from './LeaderboardTab';
import StatsTab from './StatsTab';
import MyStatsTab from './MyStatsTab';

const HallOfFameModal = ({ isOpen, onClose, userAddress }) => {
  const [activeTab, setActiveTab] = useState('leaderboards');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const hallOfFame = useHallOfFame();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && !hallOfFame.hasData) {
      hallOfFame.loadAllData(50); // Load top 50 entries for Hall of Fame
    }
  }, [isOpen, hallOfFame.hasData]);

  // Handle modal visibility animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  // Handle tab changes with smooth transition
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    
    // Add fade-out class
    const content = document.querySelector('.tab-content');
    if (content) {
      content.classList.add('tab-changing');
      
      setTimeout(() => {
        setActiveTab(newTab);
        content.classList.remove('tab-changing');
      }, 150); // Half of transition duration
    } else {
      setActiveTab(newTab);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleRefresh = () => {
    hallOfFame.refreshData(50);
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <>
      <div 
        className={`modal-overlay ${isClosing ? 'closing' : ''}`} 
        onClick={handleClose}
      >
        <div 
          className={`hall-of-fame-modal ${isClosing ? 'closing' : ''}`} 
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="modal-header">
            <div className="header-content">
              <div className="header-icon">
                <Crown size={32} className="crown-icon" />
              </div>
              <div className="header-text">
                <h2>Hall of Fame</h2>
                <p>Champions of the 0G Roast Arena</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={hallOfFame.isLoading}
                title="Refresh data"
              >
                <RefreshCw size={18} className={hallOfFame.isLoading ? 'spinning' : ''} />
              </button>
              <button 
                className="modal-close"
                onClick={handleClose}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'leaderboards' ? 'active' : ''}`}
              onClick={() => handleTabChange('leaderboards')}
            >
              <TrendingUp size={16} />
              Leaderboards
            </button>
            <button 
              className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => handleTabChange('stats')}
            >
              <Users size={16} />
              All Time Stats
            </button>
            <button 
              className={`tab-button ${activeTab === 'my-stats' ? 'active' : ''}`}
              onClick={() => handleTabChange('my-stats')}
            >
              <User size={16} />
              My Stats
            </button>
          </div>

          {/* Error Display */}
          {hallOfFame.error && (
            <div className="error-banner">
              <span>{hallOfFame.error}</span>
              <button onClick={hallOfFame.clearError}>×</button>
            </div>
          )}

          {/* Tab Content */}
          <div className="modal-content">
            <div className="tab-content">
              {activeTab === 'leaderboards' && (
                <LeaderboardTab 
                  data={hallOfFame.hallOfFameData}
                  isLoading={hallOfFame.isLoading}
                  formatAddress={hallOfFame.formatAddress}
                  formatCurrency={hallOfFame.formatCurrency}
                  formatPercentage={hallOfFame.formatPercentage}
                  formatTimeAgo={hallOfFame.formatTimeAgo}
                />
              )}
              
              {activeTab === 'stats' && (
                <StatsTab 
                  data={hallOfFame.allTimeStats}
                  isLoading={hallOfFame.isLoading}
                  formatCurrency={hallOfFame.formatCurrency}
                  formatTimeAgo={hallOfFame.formatTimeAgo}
                />
              )}
              
              {activeTab === 'my-stats' && (
                <MyStatsTab 
                  userAddress={userAddress}
                />
              )}
            </div>
          </div>

          {/* Last Updated */}
          {hallOfFame.lastLoaded && (
            <div className="modal-footer">
              <span className="last-updated">
                Last updated: {hallOfFame.formatTimeAgo(hallOfFame.lastLoaded)}
                {hallOfFame.isStale && <span className="stale-indicator"> (Stale)</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(10px);
          opacity: 0;
          animation: modalFadeIn 0.3s ease-out forwards;
        }

        .modal-overlay.closing {
          animation: modalFadeOut 0.3s ease-in forwards;
        }

        .hall-of-fame-modal {
          background: rgba(18, 18, 24, 0.95);
          border-radius: 24px;
          max-width: 1200px;
          width: 95%;
          max-height: 90vh;
          border: 2px solid #FFD700;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          animation: modalSlideIn 0.3s ease-out forwards;
        }

        .hall-of-fame-modal.closing {
          animation: modalSlideOut 0.3s ease-in forwards;
        }

        /* Modal Animations */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes modalSlideOut {
          from {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          to {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 50%;
          border: 2px solid #FFD700;
        }

        .crown-icon {
          color: #FFD700;
          background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9, #FFD700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: crownIcon 3s linear infinite;
          filter: drop-shadow(0 0 8px #FFD700);
        }

        @keyframes crownIcon {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .header-text h2 {
          font-size: 24px;
          font-weight: 700;
          color: #E6E6E6;
          margin: 0;
          background: linear-gradient(90deg, #FFD700, #FF6B6B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-text p {
          color: #9999A5;
          margin: 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #E6E6E6;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modal-close {
          background: rgba(255, 87, 87, 0.1);
          border: 1px solid #FF5757;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF5757;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 87, 87, 0.2);
          transform: scale(1.05);
        }

        .tab-navigation {
          display: flex;
          padding: 0 32px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #9999A5;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .tab-button:hover::before {
          left: 100%;
        }

        .tab-button:hover {
          color: #E6E6E6;
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .tab-button.active {
          color: #FFD700;
          border-bottom-color: #FFD700;
          background: rgba(255, 215, 0, 0.05);
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
        }

        .tab-button.active::before {
          display: none;
        }

        .error-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 32px;
          background: rgba(255, 92, 92, 0.1);
          border-bottom: 1px solid rgba(255, 92, 92, 0.3);
          color: #FF5C5C;
          font-size: 14px;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .error-banner button {
          background: none;
          border: none;
          color: #FF5C5C;
          cursor: pointer;
          font-size: 18px;
          padding: 0 4px;
          transition: transform 0.2s ease;
        }

        .error-banner button:hover {
          transform: scale(1.2);
        }

        .modal-content {
          flex: 1;
          overflow: hidden;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .tab-content {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease;
          height: 500px; /* Fixed height for all tabs */
          overflow-y: auto;
          padding: 24px 32px;
        }

        .tab-content.tab-changing {
          opacity: 0;
          transform: translateY(10px);
        }

        /* Custom Scrollbar for better UX */
        .tab-content::-webkit-scrollbar {
          width: 8px;
        }

        .tab-content::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.8);
          border-radius: 4px;
        }

        .tab-content::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.4);
          border-radius: 4px;
          border: 1px solid rgba(255, 215, 0, 0.2);
          transition: background 0.3s ease;
        }

        .tab-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.6);
        }

        /* Firefox scrollbar */
        .tab-content {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 215, 0, 0.4) rgba(30, 30, 40, 0.8);
        }

        .modal-footer {
          padding: 16px 32px;
          border-top: 1px solid rgba(60, 75, 95, 0.3);
          text-align: center;
          background: rgba(30, 30, 40, 0.5);
          transition: all 0.3s ease;
        }

        .last-updated {
          color: #9999A5;
          font-size: 12px;
          transition: color 0.3s ease;
        }

        .modal-footer:hover .last-updated {
          color: #E6E6E6;
        }

        .stale-indicator {
          color: #FF6B6B;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hall-of-fame-modal {
            width: 98%;
            max-height: 95vh;
          }

          .modal-header {
            padding: 16px 20px;
          }

          .header-content {
            gap: 12px;
          }

          .header-icon {
            width: 40px;
            height: 40px;
          }

          .header-text h2 {
            font-size: 20px;
          }

          .tab-navigation {
            padding: 0 20px;
          }

          .tab-button {
            padding: 12px 16px;
            font-size: 13px;
          }

          .tab-content {
            height: 400px; /* Shorter height for mobile */
            padding: 16px 20px;
          }

          .modal-footer {
            padding: 12px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default HallOfFameModal; 