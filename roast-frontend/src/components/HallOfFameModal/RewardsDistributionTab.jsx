import React, { useState, useEffect } from 'react';
import { Gift, Calendar } from 'lucide-react';
import CurrentRewards from './components/CurrentRewards';
import HistoryView from './components/HistoryView';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { getRewardsStyles } from './styles/RewardsStyles';

const RewardsDistributionTab = ({ 
  dailyRewards,
  loadDailyRewards,
  loadDailyRewardsHistory,
  formatAddress,
  formatCurrency,
  formatTimeAgo,
  isLoading,
  themeColors
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

  // Loading state
  if (isLoading) {
    return <LoadingState themeColors={themeColors} />;
  }

  // Error state
  if (dailyRewards.error) {
    const handleRetry = () => {
      if (viewMode === 'current') {
        loadDailyRewards();
      } else {
        loadDailyRewardsHistory();
      }
    };

    return <ErrorState error={dailyRewards.error} onRetry={handleRetry} />;
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
        {viewMode === 'current' ? (
          <CurrentRewards
            data={dailyRewards.data}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            formatAddress={formatAddress}
            formatCurrency={formatCurrency}
            themeColors={themeColors}
          />
        ) : (
          <HistoryView
            history={dailyRewards.history || []}
            formatCurrency={formatCurrency}
            setSelectedDate={setSelectedDate}
            setViewMode={setViewMode}
          />
        )}
      </div>

      <style jsx>{getRewardsStyles(themeColors)}</style>
    </>
  );
};

export default RewardsDistributionTab; 