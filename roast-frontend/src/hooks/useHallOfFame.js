import { useState, useEffect, useCallback } from 'react';
import { playersApi } from '../services/api';

export const useHallOfFame = () => {
  // ================================
  // STATE MANAGEMENT
  // ================================
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoaded, setLastLoaded] = useState(null);

  // Hall of Fame data
  const [hallOfFameData, setHallOfFameData] = useState({
    topEarners: [],
    mostWins: [],
    bestWinRate: [],
    mostActive: []
  });

  // All Time Roasted statistics
  const [allTimeStats, setAllTimeStats] = useState({
    global: {
      totalRounds: 0,
      totalPlayers: 0,
      totalRoastsSubmitted: 0,
      totalPrizesPaid: 0,
      total0GCollected: 0,
      averagePrize: 0,
      completedRounds: 0,
      currency: '0G'
    },
    judges: [],
    dailyActivity: [],
    winStreaks: []
  });

  // Player Profile data
  const [playerProfile, setPlayerProfile] = useState({
    profile: null,
    rankings: {
      topEarners: null,
      mostWins: null,
      bestWinRate: null,
      mostActive: null
    },
    isLoading: false,
    error: null
  });

  // Daily Rewards data
  const [dailyRewards, setDailyRewards] = useState({
    currentDate: null,
    data: null,
    history: [],
    isLoading: false,
    error: null
  });

  // ================================
  // ERROR HANDLING
  // ================================
  const handleError = useCallback((error, context) => {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    setError(`${context}: ${errorMessage}`);
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error(`🏆 Hall of Fame Error [${context}]:`, error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ================================
  // COMPUTED VALUES
  // ================================
  const hasData = hallOfFameData.topEarners.length > 0 || allTimeStats.global.totalPlayers > 0;
  const isStale = lastLoaded && (new Date() - new Date(lastLoaded)) > 5 * 60 * 1000; // 5 minutes

  // ================================
  // DATA LOADING FUNCTIONS
  // ================================
  const loadHallOfFame = useCallback(async (limit = 10) => {
    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 Loading Hall of Fame data...', { limit });
      }

      const response = await playersApi.getHallOfFame(limit);
      
      if (response.data.success) {
        setHallOfFameData(response.data.hallOfFame);
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🏆 Hall of Fame loaded successfully:', response.data.hallOfFame);
        }
      } else {
        throw new Error(response.data.message || 'Failed to load Hall of Fame');
      }
    } catch (error) {
      handleError(error, 'Loading Hall of Fame');
      throw error;
    }
  }, [handleError]);

  const loadAllTimeStats = useCallback(async () => {
    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('📊 Loading All Time Roasted statistics...');
      }

      const response = await playersApi.getAllTimeRoasted();
      
      if (response.data.success) {
        setAllTimeStats(response.data.allTimeRoasted);
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('📊 All Time stats loaded successfully:', response.data.allTimeRoasted);
        }
      } else {
        throw new Error(response.data.message || 'Failed to load All Time statistics');
      }
    } catch (error) {
      handleError(error, 'Loading All Time Statistics');
      throw error;
    }
  }, [handleError]);

  // ================================
  // PLAYER PROFILE FUNCTIONS
  // ================================
  const loadPlayerProfile = useCallback(async (playerAddress) => {
    if (!playerAddress) {
      setPlayerProfile(prev => ({ ...prev, profile: null, error: 'No wallet connected' }));
      return;
    }

    // Normalize address to lowercase to match database format
    const normalizedAddress = playerAddress.toLowerCase();

    try {
      setPlayerProfile(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('👤 Loading player profile...', { 
          originalAddress: playerAddress,
          normalizedAddress 
        });
      }

      // Check if Hall of Fame data is already loaded
      const currentHasData = hallOfFameData.topEarners.length > 0 || allTimeStats.global.totalPlayers > 0;
      
      // Ensure Hall of Fame data is loaded for ranking calculations
      if (!currentHasData) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🏆 Loading Hall of Fame data first for rankings...');
        }
        await loadHallOfFame(50);
      }

      const response = await playersApi.getProfile(normalizedAddress);
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('👤 Raw API Response:', {
          status: response.status,
          success: response.data?.success,
          fullResponse: response.data
        });
        
        if (response.data?.player) {
          const player = response.data.player;
          console.log('👤 Player Data Structure:', {
            address: player.address,
            hasStats: !!player.stats,
            statsKeys: player.stats ? Object.keys(player.stats) : null,
            hasRecentGames: !!player.recentGames,
            recentGamesCount: player.recentGames ? player.recentGames.length : 0,
            hasRecentWins: !!player.recentWins,
            recentWinsCount: player.recentWins ? player.recentWins.length : 0,
            topLevelKeys: Object.keys(player)
          });
          
          if (player.stats) {
            console.log('👤 Stats Details:', player.stats);
          }
        }
      }
      
      if (response.data.success) {
        const profile = response.data.player;
        
        // Find player rankings in each category (now Hall of Fame data should be loaded)
        const rankings = findPlayerRankings(normalizedAddress);
        
        setPlayerProfile(prev => ({
          ...prev,
          profile,
          rankings,
          isLoading: false
        }));
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('👤 Player profile loaded successfully:', profile);
          console.log('🏆 Player rankings calculated:', rankings);
        }
      } else {
        throw new Error(response.data.message || 'Failed to load player profile');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load profile';
      setPlayerProfile(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('👤 Player profile error:', error);
      }
    }
  }, [hallOfFameData, allTimeStats, loadHallOfFame]);

  const findPlayerRankings = useCallback((playerAddress) => {
    const rankings = {
      topEarners: null,
      mostWins: null,
      bestWinRate: null,
      mostActive: null
    };

    // Normalize the search address to lowercase
    const normalizedSearchAddress = playerAddress.toLowerCase();

    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🔍 Finding player rankings...', {
        searchAddress: normalizedSearchAddress,
        hallOfFameDataKeys: Object.keys(hallOfFameData),
        hallOfFameDataCounts: {
          topEarners: hallOfFameData.topEarners?.length || 0,
          mostWins: hallOfFameData.mostWins?.length || 0,
          bestWinRate: hallOfFameData.bestWinRate?.length || 0,
          mostActive: hallOfFameData.mostActive?.length || 0
        }
      });
    }

    // Find player position in each category
    Object.keys(hallOfFameData).forEach(category => {
      const categoryData = hallOfFameData[category];
      if (!categoryData || !Array.isArray(categoryData)) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log(`⚠️ Category ${category} has no data or is not an array`);
        }
        return;
      }

      const playerIndex = categoryData.findIndex(player => 
        player.address.toLowerCase() === normalizedSearchAddress
      );
      
      if (playerIndex !== -1) {
        rankings[category] = {
          rank: playerIndex + 1,
          totalPlayers: categoryData.length,
          percentile: Math.round(((categoryData.length - playerIndex) / categoryData.length) * 100)
        };
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log(`✅ Found player in ${category}:`, rankings[category]);
        }
      } else {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log(`❌ Player not found in ${category} (${categoryData.length} players)`);
          if (categoryData.length > 0) {
            console.log(`First few addresses in ${category}:`, 
              categoryData.slice(0, 3).map(p => p.address.toLowerCase())
            );
          }
        }
      }
    });

    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🏆 Final player rankings:', rankings);
    }

    return rankings;
  }, [hallOfFameData]);

  // Recalculate rankings when Hall of Fame data changes
  const recalculatePlayerRankings = useCallback((playerAddress) => {
    if (!playerAddress) return;
    
    const normalizedAddress = playerAddress.toLowerCase();
    const updatedRankings = findPlayerRankings(normalizedAddress);
    
    setPlayerProfile(prev => ({
      ...prev,
      rankings: updatedRankings
    }));
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🔄 Recalculated player rankings:', updatedRankings);
    }
  }, [findPlayerRankings]);

  // ================================
  // COMBINED DATA LOADING
  // ================================
  const loadAllData = useCallback(async (hallOfFameLimit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 Loading all Hall of Fame data...', { hallOfFameLimit });
      }

      // Load both datasets in parallel
      await Promise.all([
        loadHallOfFame(hallOfFameLimit),
        loadAllTimeStats()
      ]);

      setLastLoaded(new Date().toISOString());
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 All Hall of Fame data loaded successfully');
      }

    } catch (error) {
      // Individual errors are already handled in loadHallOfFame and loadAllTimeStats
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('🏆 Failed to load Hall of Fame data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadHallOfFame, loadAllTimeStats]);

  // ================================
  // REFRESH FUNCTION
  // ================================
  const refreshData = useCallback((hallOfFameLimit = 10) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🔄 Refreshing Hall of Fame data...');
    }
    return loadAllData(hallOfFameLimit);
  }, [loadAllData]);

  // ================================
  // UTILITY FUNCTIONS
  // ================================
  const normalizeAddress = useCallback((address) => {
    if (!address) return null;
    return address.toLowerCase();
  }, []);

  const formatAddress = useCallback((address) => {
    if (!address) return '---';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const formatCurrency = useCallback((amount, currency = '0G') => {
    if (typeof amount !== 'number') return `0 ${currency}`;
    return `${amount.toFixed(3)} ${currency}`;
  }, []);

  const formatPercentage = useCallback((value) => {
    if (typeof value !== 'number') return '0%';
    return `${value.toFixed(1)}%`;
  }, []);

  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Never';
    
    const time = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  // ================================
  // DAILY REWARDS FUNCTIONS
  // ================================
  const loadDailyRewards = useCallback(async (date = null) => {
    try {
      setDailyRewards(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 Loading daily rewards...', { date });
      }

      const response = await playersApi.getDailyRewards(date);
      
      if (response.data.success) {
        setDailyRewards(prev => ({
          ...prev,
          currentDate: response.data.meta.requestedDate || date || 'yesterday',
          data: response.data.dailyRewards,
          isLoading: false
        }));
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🏆 Daily rewards loaded successfully:', response.data.dailyRewards);
        }
      } else {
        throw new Error(response.data.message || 'Failed to load daily rewards');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load daily rewards';
      setDailyRewards(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('🏆 Daily rewards error:', error);
      }
    }
  }, []);

  const loadDailyRewardsHistory = useCallback(async (limit = 14) => {
    try {
      setDailyRewards(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('📊 Loading daily rewards history...', { limit });
      }

      const response = await playersApi.getDailyRewardsHistory(limit);
      
      if (response.data.success) {
        setDailyRewards(prev => ({
          ...prev,
          history: response.data.rewardsHistory,
          isLoading: false
        }));
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('📊 Daily rewards history loaded successfully:', response.data.rewardsHistory);
        }
      } else {
        throw new Error(response.data.message || 'Failed to load daily rewards history');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load daily rewards history';
      setDailyRewards(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('📊 Daily rewards history error:', error);
      }
    }
  }, []);

  // ================================
  // RETURN INTERFACE
  // ================================
  return {
    // State
    isLoading,
    error,
    lastLoaded,
    hasData,
    isStale,

    // Data
    hallOfFameData,
    allTimeStats,

    // Actions
    loadAllData,
    refreshData,
    clearError,

    // Individual loaders
    loadHallOfFame,
    loadAllTimeStats,

    // Utilities
    normalizeAddress,
    formatAddress,
    formatCurrency,
    formatPercentage,
    formatTimeAgo,

    // Player Profile
    playerProfile,
    loadPlayerProfile,
    recalculatePlayerRankings,

    // Daily Rewards
    dailyRewards,
    loadDailyRewards,
    loadDailyRewardsHistory
  };
}; 