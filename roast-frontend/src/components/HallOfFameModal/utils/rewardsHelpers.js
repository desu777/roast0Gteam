/**
 * Helper functions for Rewards Distribution Tab
 */

export const getPositionEmoji = (position) => {
  switch (position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `#${position}`;
  }
};

export const getPaymentStatus = (reward, themeColors) => {
  if (reward.isPaid) {
    return {
      icon: 'CheckCircle',
      color: '#00FF88',
      text: 'Paid',
      className: 'paid'
    };
  } else {
    return {
      icon: 'Clock',
      color: themeColors?.primary || '#FFD700',
      text: 'Pending',
      className: 'pending'
    };
  }
};

export const rewardsCategories = [
  { 
    id: 'topEarners', 
    title: 'Top Earners', 
    icon: 'TrendingUp', 
    color: '#FFD700',
    description: 'Highest earnings in a single day'
  },
  { 
    id: 'mostWins', 
    title: 'Most Wins', 
    icon: 'Crown', 
    color: '#FF6B6B',
    description: 'Most victories in a single day'
  },
  { 
    id: 'bestWinRate', 
    title: 'Best Win Rate', 
    icon: 'Target', 
    color: '#00D2E9',
    description: 'Highest win percentage (min. 2 wins)'
  },
  { 
    id: 'mostActive', 
    title: 'Most Active', 
    icon: 'Activity', 
    color: '#FF5CAA',
    description: 'Most games played in a single day'
  }
]; 