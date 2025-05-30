import { useEffect, useCallback, useRef } from 'react';
import wsService from '../services/websocket';
import { GAME_PHASES } from '../constants/gameConstants';
import { TEAM_MEMBERS } from '../data/teamMembers';

export const useWebSocketEvents = ({
  // Game Core props
  currentRound,
  currentPhase,
  setCurrentPhase,
  setUserSubmitted,
  setRoastText,
  setWinner,
  setAiReasoning,
  setNextRoundCountdown,
  setShowParticles,
  setShowFireEffect,
  setIsSubmitting,
  setWsConnected,
  setCurrentJudge,
  setResultsLocked,
  setResultsLockTimer,
  resultsLocked,
  loadCurrentRound,
  playSound,
  setTimeLeft,
  
  // Timer sync methods
  syncWithBackendTimer,
  
  // Voting props
  resetVotingState,
  handleVotingUpdate,
  handleVoteCastSuccess,
  handleVotingLocked,
  handleVotingReset,
  handleVotingError,
  loadVotingStats,
  handleVotingResultAccepted,
  
  // Notifications
  addNotification,
  
  // Wallet
  address,
  isAuthenticated
}) => {
  
  // Use refs to avoid recreating event listeners
  const functionsRef = useRef({});
  
  // Update refs with current functions
  functionsRef.current = {
    setCurrentPhase,
    setUserSubmitted,
    setRoastText,
    setWinner,
    setAiReasoning,
    setNextRoundCountdown,
    setShowParticles,
    setShowFireEffect,
    setIsSubmitting,
    setWsConnected,
    setCurrentJudge,
    setResultsLocked,
    setResultsLockTimer,
    loadCurrentRound,
    playSound,
    setTimeLeft,
    syncWithBackendTimer,
    resetVotingState,
    handleVotingUpdate,
    handleVoteCastSuccess,
    handleVotingLocked,
    handleVotingReset,
    handleVotingError,
    loadVotingStats,
    handleVotingResultAccepted,
    addNotification
  };
  
  // Konfiguracja WebSocket event handlerów - TYLKO RAZ!
  useEffect(() => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🔧 Setting up WebSocket event listeners (should happen only once)');
    }
    
    // Connection status
    const handleConnectionStatus = (data) => {
      functionsRef.current.setWsConnected(data.connected);
    };

    // Authentication
    const handleAuthenticated = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔐 WebSocket authenticated successfully:', data);
      }
      
      // Dołącz do aktualnej rundy po uwierzytelnieniu
      if (currentRound?.id) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🎮 Joining round after authentication:', currentRound.id);
        }
        wsService.joinRound(currentRound.id);
      }
    };

    // Round events
    const handleRoundCreated = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('New round created:', data);
      }
      
      // NATYCHMIAST ustaw nowego sędziego - nie czekaj na loadCurrentRound
      if (data.judgeCharacter) {
        const newJudge = TEAM_MEMBERS.find(member => member.id === data.judgeCharacter);
        if (newJudge) {
          functionsRef.current.setCurrentJudge(newJudge);
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.log('🎯 New judge set immediately:', newJudge.name);
          }
        }
      }
      
      // Resetuj stan dla nowej rundy
      functionsRef.current.setUserSubmitted(false);
      functionsRef.current.setRoastText('');
      functionsRef.current.setWinner(null);
      functionsRef.current.setAiReasoning('');
      functionsRef.current.setCurrentPhase(GAME_PHASES.WAITING);
      functionsRef.current.setNextRoundCountdown(0);
      
      // PEŁNY reset voting state dla nowej rundy
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Resetting voting for new round');
      }
      functionsRef.current.resetVotingState();
      
      // Załaduj nową rundę (powinno potwierdzić dane)
      functionsRef.current.loadCurrentRound();
      
      // NATYCHMIAST załaduj voting stats używając roundId z WebSocket event
      if (data.roundId && address && isAuthenticated) {
        // Stwórz temporary round object dla loadVotingStats
        const tempRound = { id: data.roundId };
        setTimeout(() => {
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.log('🗳️ Loading voting stats immediately for new round:', data.roundId);
          }
          functionsRef.current.loadVotingStats(tempRound, isAuthenticated, address, true);
        }, 500); // Krótki delay żeby backend zdążył przygotować dane
      }
      
      functionsRef.current.playSound('start');
    };

    const handleRoundUpdated = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Round updated:', data);
      }
      functionsRef.current.loadCurrentRound();
    };

    const handleTimerUpdate = (data) => {
      if (data.roundId === currentRound?.id) {
        // Use sync function for live timer management
        if (data.timeLeft !== undefined && data.timeLeft >= 0) {
          if (functionsRef.current.syncWithBackendTimer) {
            functionsRef.current.syncWithBackendTimer(data.timeLeft);
          } else {
            // Fallback to direct update
            functionsRef.current.setTimeLeft(Math.max(0, data.timeLeft));
          }
        }
      }
    };

    const handlePlayerJoined = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Player joined:', data);
      }
      // Odśwież uczestników
      functionsRef.current.loadCurrentRound();
    };

    const handleJudgingStarted = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Judging started:', data);
      }
      functionsRef.current.setCurrentPhase(GAME_PHASES.JUDGING);
      functionsRef.current.playSound('judging');
    };

    const handleRoundCompleted = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Round completed:', data);
      }
      
      // Zapobiegaj wielokrotnym wywołaniom
      if (currentPhase === GAME_PHASES.RESULTS || resultsLocked) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('Already in results phase or results locked, skipping duplicate event');
        }
        return;
      }
      
      // Ustaw blokadę na 20 sekund
      functionsRef.current.setResultsLocked(true);
      const lockTimer = setTimeout(() => {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🔓 Results lock expired, allowing updates');
        }
        functionsRef.current.setResultsLocked(false);
      }, 20000);
      functionsRef.current.setResultsLockTimer(lockTimer);
      
      functionsRef.current.setCurrentPhase(GAME_PHASES.RESULTS);
      
      // Zachowaj obecnego sędziego lub znajdź go na podstawie danych
      if (data.character) {
        const judge = TEAM_MEMBERS.find(member => member.id === data.character);
        if (judge) {
          functionsRef.current.setCurrentJudge(judge);
        }
      }
      
      // Utwórz obiekt winner z danych otrzymanych z backendu
      const winnerData = {
        address: data.winnerAddress,
        roastText: data.winningRoast,
        isUser: address && data.winnerAddress?.toLowerCase() === address.toLowerCase()
      };
      
      functionsRef.current.setWinner(winnerData);
      functionsRef.current.setAiReasoning(data.aiReasoning);
      functionsRef.current.setShowParticles(true);
      functionsRef.current.playSound('winner');
      
      // Wydłużamy czas wyświetlania cząsteczek
      setTimeout(() => functionsRef.current.setShowParticles(false), 8000);
      
      // Ustaw countdown do następnej rundy - zwiększamy czas
      functionsRef.current.setNextRoundCountdown(30);
    };

    const handleRoastSubmitted = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Roast submitted successfully:', data);
      }
      functionsRef.current.setIsSubmitting(false);
      functionsRef.current.setUserSubmitted(true);
      functionsRef.current.playSound('submit');
      
      // Pokaż efekt ognia
      functionsRef.current.setShowFireEffect(true);
      setTimeout(() => functionsRef.current.setShowFireEffect(false), 2000);
      
      // Dodaj powiadomienie o wysłaniu roastu
      functionsRef.current.addNotification({
        type: 'success',
        message: 'Your roast has been successfully submitted! Good luck! 🔥',
      });
    };

    const handlePrizeDistributed = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Prize distributed:', data);
      }
      
      // Jeśli to nasz adres, pokaż powiadomienie
      if (address && data.winnerAddress?.toLowerCase() === address.toLowerCase()) {
        functionsRef.current.addNotification({
          type: 'success',
          message: `Congratulations! You won ${data.prizeAmount.toFixed(3)} 0G! 🎉`,
          txHash: data.transactionHash
        });
      }
    };

    // Voting events
    const handleVotingUpdateWrapper = (data) => {
      functionsRef.current.handleVotingUpdate(data, address);
    };

    const handleVoteCastSuccessWrapper = (data) => {
      functionsRef.current.handleVoteCastSuccess(data, functionsRef.current.addNotification, functionsRef.current.loadVotingStats);
    };

    const handleVotingLockedWrapper = (data) => {
      functionsRef.current.handleVotingLocked(data, functionsRef.current.addNotification);
    };

    const handleVotingResetWrapper = (data) => {
      functionsRef.current.handleVotingReset(data);
    };

    const handleVotingResultAcceptedWrapper = (data) => {
      if (functionsRef.current.handleVotingResultAccepted) {
        functionsRef.current.handleVotingResultAccepted(data, functionsRef.current.addNotification);
      }
    };

    const handleSubmissionLocked = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔒 Submissions locked for round:', data.roundId);
      }
      
      functionsRef.current.addNotification({
        type: 'warning',
        message: 'Submissions are now locked! ⏰',
        duration: 2000
      });
    };

    const handleError = (error) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('WebSocket error:', error);
      }
      functionsRef.current.setIsSubmitting(false);
      
      // Handle voting-specific errors
      functionsRef.current.handleVotingError(error);
    };

    // Add event listeners
    wsService.on('connection-status', handleConnectionStatus);
    wsService.on('authenticated', handleAuthenticated);
    wsService.on('round-created', handleRoundCreated);
    wsService.on('round-updated', handleRoundUpdated);
    wsService.on('timer-update', handleTimerUpdate);
    wsService.on('player-joined', handlePlayerJoined);
    wsService.on('judging-started', handleJudgingStarted);
    wsService.on('round-completed', handleRoundCompleted);
    wsService.on('roast-submitted', handleRoastSubmitted);
    wsService.on('prize-distributed', handlePrizeDistributed);
    wsService.on('voting-update', handleVotingUpdateWrapper);
    wsService.on('vote-cast-success', handleVoteCastSuccessWrapper);
    wsService.on('voting-locked', handleVotingLockedWrapper);
    wsService.on('voting-reset', handleVotingResetWrapper);
    wsService.on('voting-result-accepted', handleVotingResultAcceptedWrapper);
    wsService.on('submission-locked', handleSubmissionLocked);
    wsService.on('error', handleError);

    // Cleanup - WAŻNE!
    return () => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🧹 Cleaning up WebSocket event listeners');
      }
      wsService.off('connection-status', handleConnectionStatus);
      wsService.off('authenticated', handleAuthenticated);
      wsService.off('round-created', handleRoundCreated);
      wsService.off('round-updated', handleRoundUpdated);
      wsService.off('timer-update', handleTimerUpdate);
      wsService.off('player-joined', handlePlayerJoined);
      wsService.off('judging-started', handleJudgingStarted);
      wsService.off('round-completed', handleRoundCompleted);
      wsService.off('roast-submitted', handleRoastSubmitted);
      wsService.off('prize-distributed', handlePrizeDistributed);
      wsService.off('voting-update', handleVotingUpdateWrapper);
      wsService.off('vote-cast-success', handleVoteCastSuccessWrapper);
      wsService.off('voting-locked', handleVotingLockedWrapper);
      wsService.off('voting-reset', handleVotingResetWrapper);
      wsService.off('voting-result-accepted', handleVotingResultAcceptedWrapper);
      wsService.off('submission-locked', handleSubmissionLocked);
      wsService.off('error', handleError);
    };
  }, []); // EMPTY DEPENDENCY ARRAY - ustawiane tylko raz!

  // Separate effect for connection management 
  useEffect(() => {
    if (isAuthenticated && address) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔌 Connecting WebSocket with address:', address);
      }
      // Najpierw rozłącz jeśli już połączony
      wsService.disconnect();
      // Poczekaj chwilę przed ponownym połączeniem
      setTimeout(() => {
        wsService.connect(address);
      }, 100);
      
      // Dołączanie do rundy będzie obsługiwane w event handlerze 'authenticated'
    } else {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔌 Disconnecting WebSocket');
      }
      wsService.disconnect();
    }
  }, [isAuthenticated, address]);

  // Handle roast submission via WebSocket
  const submitRoastViaWebSocket = useCallback((roundId, roastText, txHash) => {
    wsService.submitRoast(roundId, roastText, txHash);
  }, []);

  return {
    submitRoastViaWebSocket
  };
}; 