import { useEffect, useCallback } from 'react';
import { gameApi } from '../services/api';
import wsService from '../services/websocket';

// Import modularnych hooków
import { useGameCore } from './useGameCore';
import { useVotingSystem } from './useVotingSystem';
import { useNotifications } from './useNotifications';
import { useWebSocketEvents } from './useWebSocketEvents';

export const useGameState = () => {
  // ================================
  // CORE GAME LOGIC
  // ================================
  const gameCore = useGameCore();

  // ================================
  // VOTING SYSTEM
  // ================================
  const votingSystem = useVotingSystem();

  // ================================
  // NOTIFICATIONS SYSTEM
  // ================================
  const notificationSystem = useNotifications();

  // ================================
  // WEBSOCKET EVENTS
  // ================================
  const { submitRoastViaWebSocket } = useWebSocketEvents({
    // Game Core props
    currentRound: gameCore.currentRound,
    currentPhase: gameCore.currentPhase,
    setCurrentPhase: gameCore.setCurrentPhase,
    setUserSubmitted: gameCore.setUserSubmitted,
    setRoastText: gameCore.setRoastText,
    setWinner: gameCore.setWinner,
    setAiReasoning: gameCore.setAiReasoning,
    setNextRoundCountdown: gameCore.setNextRoundCountdown,
    setShowParticles: gameCore.setShowParticles,
    setShowFireEffect: gameCore.setShowFireEffect,
    setIsSubmitting: gameCore.setIsSubmitting,
    setWsConnected: gameCore.setWsConnected,
    setCurrentJudge: gameCore.setCurrentJudge,
    setResultsLocked: gameCore.setResultsLocked,
    setResultsLockTimer: gameCore.setResultsLockTimer,
    resultsLocked: gameCore.resultsLocked,
    loadCurrentRound: gameCore.loadCurrentRound,
    playSound: gameCore.playSound,
    setTimeLeft: gameCore.setTimeLeft,
    
    // Additional setters for data reset
    setPrizePool: gameCore.setPrizePool,
    setParticipants: gameCore.setParticipants,
    
    // Timer sync methods
    syncWithBackendTimer: gameCore.syncWithBackendTimer,
    
    // Voting props
    resetVotingState: votingSystem.resetVotingState,
    handleVotingUpdate: votingSystem.handleVotingUpdate,
    handleVoteCastSuccess: votingSystem.handleVoteCastSuccess,
    handleVotingLocked: votingSystem.handleVotingLocked,
    handleVotingReset: votingSystem.handleVotingReset,
    handleVotingError: votingSystem.handleVotingError,
    loadVotingStats: votingSystem.loadVotingStats,
    handleVotingResultAccepted: votingSystem.handleVotingResultAccepted,
    
    // Notifications
    addNotification: notificationSystem.addNotification,
    
    // Wallet
    address: gameCore.userAddress,
    isAuthenticated: gameCore.isAuthenticated
  });

  // ================================
  // ENHANCED JOIN ROUND METHOD
  // ================================
  const joinRound = useCallback(async () => {
    try {
      const result = await gameCore.joinRound(notificationSystem.addNotification);
      if (result) {
      // 2. Wyślij roast przez WebSocket
        submitRoastViaWebSocket(result.roundId, result.roastText, result.txHash);
      }
    } catch (error) {
      // Error handling is done in gameCore.joinRound
    }
  }, [gameCore.joinRound, submitRoastViaWebSocket, notificationSystem.addNotification]);

  // ================================
  // ENHANCED CAST VOTE METHOD
  // ================================
  const castVote = useCallback((characterId) => {
    return votingSystem.castVote(
      characterId,
      gameCore.currentRound,
      gameCore.isAuthenticated,
      gameCore.userAddress,
      notificationSystem.addNotification,
      gameCore.playSound,
      wsService
    );
  }, [
    votingSystem.castVote,
    gameCore.currentRound,
    gameCore.isAuthenticated,
    gameCore.userAddress,
    notificationSystem.addNotification,
    gameCore.playSound
  ]);
      
  // ================================
  // ENHANCED LOAD VOTING STATS (BEZ DEPENDENCY PROBLEMU)
  // ================================
  const loadVotingStats = useCallback((forceRound = null) => {
    // Użyj przekazanej rundy lub pobierz aktualną rundę na bieżąco
    const currentRound = forceRound || gameCore.currentRound;
    
    if (!currentRound?.id) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Cannot load voting stats - no current round:', currentRound);
      }
      return;
    }
    
    // ✨ KLUCZOWE: Guard przeciwko race condition podczas transition
    // Nie ładuj voting stats jeśli results są locked (round transition)
    if (gameCore.resultsLocked) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Skipping voting stats load - round transition in progress:', currentRound.id);
      }
      return;
    }
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Loading voting stats for round:', currentRound.id, 'auth:', gameCore.isAuthenticated);
    }
    
    return votingSystem.loadVotingStats(
      currentRound,
      gameCore.isAuthenticated,
      gameCore.userAddress
    );
  }, [
    votingSystem.loadVotingStats,
    gameCore.isAuthenticated,
    gameCore.userAddress,
    gameCore.resultsLocked
  ]);

    // ================================
  // COUNTDOWN LOGIC
    // ================================
  useEffect(() => {
    if (gameCore.nextRoundCountdown > 0) {
      const timer = setTimeout(() => {
        gameCore.setNextRoundCountdown(prev => {
          if (prev <= 1) {
            // Resetuj stan użytkownika dla nowej rundy
            gameCore.setUserSubmitted(false);
            gameCore.setRoastText('');
            // Załaduj nową rundę
            gameCore.loadCurrentRound(true); // Force refresh
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameCore.nextRoundCountdown, gameCore.loadCurrentRound, gameCore.setNextRoundCountdown, gameCore.setUserSubmitted, gameCore.setRoastText]);

  // ================================
  // CLEANUP TIMER
  // ================================
  useEffect(() => {
    return () => {
      if (gameCore.resultsLockTimer) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🧹 Cleaning up results lock timer');
        }
        clearTimeout(gameCore.resultsLockTimer);
      }
    };
  }, [gameCore.resultsLockTimer]);

  // ================================
  // INITIAL LOAD
  // ================================
  useEffect(() => {
    // Zapobiegaj podwójnemu ładowaniu w React.StrictMode
    if (!gameCore.hasInitialLoad) {
      gameCore.setHasInitialLoad(true);
      gameCore.loadCurrentRound(true); // Force initial load
      gameCore.loadGameStats(true); // Force initial load
      // Load voting stats after round is loaded with delay
      setTimeout(() => {
        if (gameCore.currentRound?.id) {
          votingSystem.loadVotingStats(gameCore.currentRound, gameCore.isAuthenticated, gameCore.userAddress, true);
        }
      }, 1000);
    }
  }, []); // Usuwamy zależności aby wykonać tylko raz

  // ================================
  // PERIODIC REFRESH (REDUCED FREQUENCY)
  // ================================
  useEffect(() => {
    // Rozpocznij interval dopiero po pierwszym załadowaniu
    if (!gameCore.hasInitialLoad) return;
    
    // Zwiększony interval do 60 sekund aby uniknąć rate limitingu
    const interval = setInterval(() => {
      gameCore.loadCurrentRound(); // Will be debounced
      gameCore.loadGameStats(); // Will be debounced
      // Przekaż aktualną rundę bezpośrednio
      if (gameCore.currentRound?.id) {
        loadVotingStats(gameCore.currentRound); // Pass current round directly
      }
    }, 60000); // Zwiększone z 30000 na 60000

    return () => clearInterval(interval);
  }, [gameCore.hasInitialLoad, gameCore.loadCurrentRound, gameCore.loadGameStats, loadVotingStats, gameCore.currentRound?.id]);

  // ================================
  // LOAD VOTING STATS ON ROUND CHANGE (DEBOUNCED)
  // ================================
  useEffect(() => {
    // WARUNEK: tylko jeśli mamy pełny currentRound object, nie tylko ID
    if (gameCore.currentRound?.id && gameCore.currentRound.phase && gameCore.isAuthenticated) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Loading voting stats for round change:', gameCore.currentRound.id, 'phase:', gameCore.currentRound.phase);
      }
      // Zwiększony delay żeby uniknąć race conditions z backend
      setTimeout(() => {
        // Double-check że currentRound wciąż istnieje i przekaż go bezpośrednio
        if (gameCore.currentRound?.id) {
          loadVotingStats(gameCore.currentRound); // Pass current round directly
        }
      }, 1000); // Zwiększone z 2000 na 1000 ale z lepszym warunkiem
    }
  }, [gameCore.currentRound?.id, gameCore.currentRound?.phase, gameCore.isAuthenticated, loadVotingStats]);

  // ================================
  // CLEANUP ON UNMOUNT
  // ================================
  useEffect(() => {
    return () => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🧹 Cleaning up useGameState');
      }
      gameCore.cleanup();
      votingSystem.cleanup();
    };
  }, [gameCore.cleanup, votingSystem.cleanup]);
      
  // ================================
  // LEGACY VOTING HANDLERS
  // ================================
  
  // Legacy voting complete handler (will be replaced by WebSocket events)
  const handleVotingComplete = useCallback(async (winnerCharacterId, totalVotes = 0) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Legacy voting complete handler:', { winnerCharacterId, totalVotes });
    }
    
    // Note: This will now be handled by backend WebSocket events
    // Keeping for backward compatibility during transition
    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Voting completed:', { winnerCharacterId, totalVotes });
      }
      
      const response = await gameApi.submitVotingResult(winnerCharacterId, totalVotes);
      
      if (response.data.success) {
        notificationSystem.addNotification({
        type: 'success',
          title: 'Voting Result Submitted',
          message: `${response.data.data.nextJudge} will judge the next round!`,
          duration: 5000
      });
      
        gameCore.playSound('success');
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to submit voting result:', error);
      }
      notificationSystem.addNotification({
        type: 'error',
        title: 'Voting Failed',
        message: 'Failed to submit voting result. Using random selection.',
        duration: 5000
      });
    }
  }, [notificationSystem.addNotification, gameCore.playSound]);

  // ================================
  // RETURN COMBINED API
  // ================================
  return {
    // Game State (from gameCore)
    currentPhase: gameCore.currentPhase,
    currentJudge: gameCore.currentJudge,
    roastText: gameCore.roastText,
    setRoastText: gameCore.setRoastText,
    timeLeft: gameCore.timeLeft,
    participants: gameCore.participants,
    isConnected: gameCore.isConnected,
    winner: gameCore.winner,
    aiReasoning: gameCore.aiReasoning,
    prizePool: gameCore.prizePool,
    totalParticipants: gameCore.totalParticipants,
    roundNumber: gameCore.roundNumber,
    userSubmitted: gameCore.userSubmitted,
    nextRoundCountdown: gameCore.nextRoundCountdown,
    currentRound: gameCore.currentRound,
    error: gameCore.error,
    userAddress: gameCore.userAddress,
    
    // UI State (from gameCore)
    soundEnabled: gameCore.soundEnabled,
    setSoundEnabled: gameCore.setSoundEnabled,
    showJudgeDetails: gameCore.showJudgeDetails,
    setShowJudgeDetails: gameCore.setShowJudgeDetails,
    isSubmitting: gameCore.isSubmitting,
    showParticles: gameCore.showParticles,
    showFireEffect: gameCore.showFireEffect,
    
    // Actions (from gameCore)
    connectWallet: () => {}, // Now handled by Custom ConnectButton component
    joinRound,
    formatTime: gameCore.formatTime,
    playSound: gameCore.playSound,
    
    // Utils (from gameCore)
    loadCurrentRound: gameCore.loadCurrentRound,
    loadGameStats: gameCore.loadGameStats,
    clearError: gameCore.clearError,
    
    // Notifications (from notificationSystem)
    notifications: notificationSystem.notifications,
    addNotification: notificationSystem.addNotification,
    removeNotification: notificationSystem.removeNotification,

    // Voting State (from votingSystem)
    votingStats: votingSystem.votingStats,
    setVotingStats: votingSystem.setVotingStats,
    userVote: votingSystem.userVote,
    setUserVote: votingSystem.setUserVote,
    votingLocked: votingSystem.votingLocked,
    setVotingLocked: votingSystem.setVotingLocked,
    isVoting: votingSystem.isVoting,
    setIsVoting: votingSystem.setIsVoting,
    votingError: votingSystem.votingError,
    setVotingError: votingSystem.setVotingError,
    loadVotingStats,
    castVote,
    resetVotingState: votingSystem.resetVotingState,

    // Legacy compatibility
    handleVotingComplete
  };
}; 