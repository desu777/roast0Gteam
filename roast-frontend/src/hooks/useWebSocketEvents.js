import { useEffect, useCallback } from 'react';
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
  
  // Voting props
  resetVotingState,
  handleVotingUpdate,
  handleVoteCastSuccess,
  handleVotingLocked,
  handleVotingReset,
  handleVotingError,
  loadVotingStats,
  
  // Notifications
  addNotification,
  
  // Wallet
  address,
  isAuthenticated
}) => {
  
  // Konfiguracja WebSocket event handlerów
  useEffect(() => {
    // Connection status
    wsService.on('connection-status', (data) => {
      setWsConnected(data.connected);
    });

    // Authentication
    wsService.on('authenticated', (data) => {
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
    });

    // Round events
    wsService.on('round-created', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('New round created:', data);
      }
      // Resetuj stan dla nowej rundy
      setUserSubmitted(false);
      setRoastText('');
      setWinner(null);
      setAiReasoning('');
      setCurrentPhase(GAME_PHASES.WAITING);
      setNextRoundCountdown(0);
      // Reset voting state for new round
      resetVotingState();
      // Załaduj nową rundę
      loadCurrentRound();
      playSound('start');
    });

    wsService.on('round-updated', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Round updated:', data);
      }
      loadCurrentRound();
    });

    wsService.on('timer-update', (data) => {
      if (data.roundId === currentRound?.id) {
        // Aktualizuj timer na żywo tylko dla aktywnej rundy
        if (data.timeLeft !== undefined && data.timeLeft >= 0) {
          setTimeLeft(Math.max(0, data.timeLeft));
          
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.log(`⏱️ Timer update: ${data.timeLeft}s`);
          }
        }
      }
    });

    wsService.on('player-joined', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Player joined:', data);
      }
      // Odśwież uczestników
      loadCurrentRound();
    });

    wsService.on('judging-started', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Judging started:', data);
      }
      setCurrentPhase(GAME_PHASES.JUDGING);
      playSound('judging');
    });

    wsService.on('round-completed', (data) => {
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
      setResultsLocked(true);
      const lockTimer = setTimeout(() => {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🔓 Results lock expired, allowing updates');
        }
        setResultsLocked(false);
      }, 20000);
      setResultsLockTimer(lockTimer);
      
      setCurrentPhase(GAME_PHASES.RESULTS);
      
      // Zachowaj obecnego sędziego lub znajdź go na podstawie danych
      if (data.character) {
        const judge = TEAM_MEMBERS.find(member => member.id === data.character);
        if (judge) {
          setCurrentJudge(judge);
        }
      }
      
      // Utwórz obiekt winner z danych otrzymanych z backendu
      const winnerData = {
        address: data.winnerAddress,
        roastText: data.winningRoast,
        isUser: address && data.winnerAddress?.toLowerCase() === address.toLowerCase()
      };
      
      setWinner(winnerData);
      setAiReasoning(data.aiReasoning);
      setShowParticles(true);
      playSound('winner');
      
      // Wydłużamy czas wyświetlania cząsteczek
      setTimeout(() => setShowParticles(false), 8000); // Zwiększone z 5000 na 8000
      
      // Ustaw countdown do następnej rundy - zwiększamy czas
      setNextRoundCountdown(30); // Zwiększone z 20 na 30 sekund
    });

    wsService.on('roast-submitted', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Roast submitted successfully:', data);
      }
      setIsSubmitting(false);
      setUserSubmitted(true);
      playSound('submit');
      
      // Pokaż efekt ognia
      setShowFireEffect(true);
      setTimeout(() => setShowFireEffect(false), 2000);
      
      // Dodaj powiadomienie o wysłaniu roastu
      addNotification({
        type: 'success',
        message: 'Your roast has been successfully submitted! Good luck! 🔥',
      });
    });

    wsService.on('prize-distributed', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Prize distributed:', data);
      }
      
      // Jeśli to nasz adres, pokaż powiadomienie
      if (address && data.winnerAddress?.toLowerCase() === address.toLowerCase()) {
        addNotification({
          type: 'success',
          message: `Congratulations! You won ${data.prizeAmount.toFixed(3)} 0G! 🎉`,
          txHash: data.transactionHash
        });
      }
    });

    // ================================
    // VOTING WEBSOCKET EVENTS
    // ================================

    wsService.on('voting-update', handleVotingUpdate);

    wsService.on('vote-cast-success', (data) => {
      handleVoteCastSuccess(data, addNotification, loadVotingStats);
    });

    wsService.on('voting-locked', (data) => {
      handleVotingLocked(data, addNotification);
    });

    wsService.on('voting-reset', handleVotingReset);

    wsService.on('submission-locked', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔒 Submissions locked for round:', data.roundId);
      }
      
      addNotification({
        type: 'warning',
        message: 'Submissions are now locked! ⏰',
        duration: 2000
      });
    });

    wsService.on('error', (error) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('WebSocket error:', error);
      }
      setIsSubmitting(false);
      
      // Handle voting-specific errors
      handleVotingError(error);
    });

    // Cleanup
    return () => {
      wsService.off('connection-status');
      wsService.off('authenticated');
      wsService.off('round-created');
      wsService.off('round-updated');
      wsService.off('timer-update');
      wsService.off('player-joined');
      wsService.off('judging-started');
      wsService.off('round-completed');
      wsService.off('roast-submitted');
      wsService.off('prize-distributed');
      wsService.off('voting-update');
      wsService.off('vote-cast-success');
      wsService.off('voting-locked');
      wsService.off('voting-reset');
      wsService.off('submission-locked');
      wsService.off('error');
    };
  }, [
    currentRound?.id, 
    currentPhase,
    resultsLocked,
    address,
    loadCurrentRound,
    resetVotingState,
    handleVotingUpdate,
    handleVoteCastSuccess,
    handleVotingLocked,
    handleVotingReset,
    handleVotingError,
    loadVotingStats,
    addNotification,
    playSound,
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
    setTimeLeft
  ]);

  // Połącz WebSocket gdy użytkownik jest uwierzytelniony
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