import { useState, useEffect, useCallback } from 'react';
import { GAME_PHASES, AI_REASONINGS } from '../constants/gameConstants';
import { TEAM_MEMBERS } from '../data/teamMembers';
import { gameApi } from '../services/api';
import wsService from '../services/websocket';
import { useWallet } from './useWallet';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

export const useGameState = () => {
  const { address, isAuthenticated, isConnected } = useWallet();
  const { sendTransactionAsync } = useSendTransaction();

  // Game State
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.WAITING);
  const [currentJudge, setCurrentJudge] = useState(null);
  const [roastText, setRoastText] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [participants, setParticipants] = useState([]);
  const [winner, setWinner] = useState(null);
  const [aiReasoning, setAiReasoning] = useState('');
  const [prizePool, setPrizePool] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [currentRound, setCurrentRound] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  
  // UI State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showJudgeDetails, setShowJudgeDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showFireEffect, setShowFireEffect] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Dodaj nowy stan do śledzenia blokady wyników
  const [resultsLocked, setResultsLocked] = useState(false);
  const [resultsLockTimer, setResultsLockTimer] = useState(null);

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${type}`);
  };

  // Funkcja do dodawania powiadomień
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random(); // Dodajemy losowość aby uniknąć duplikatów
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  // Funkcja do usuwania powiadomień
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Załaduj aktualną rundę z backendu
  const loadCurrentRound = useCallback(async () => {
    // Jeśli wyniki są zablokowane, nie aktualizuj
    if (resultsLocked) {
      console.log('🔒 Results are locked, skipping round update');
      return;
    }
    
    try {
      console.log('🔍 Loading current round from API...');
      const response = await gameApi.getCurrentRound();
      console.log('✅ API Response:', response);
      
      // Backend zwraca {success: true, data: roundData}
      const round = response.data.data; // Poprawka: dane są w response.data.data
      
      if (round) {
        console.log('📊 Round data received:', round);
        setCurrentRound(round);
        setRoundNumber(round.id);
        
        // Mapowanie faz z backendu na frontend
        let mappedPhase = round.phase;
        if (round.phase === 'active') {
          mappedPhase = GAME_PHASES.WRITING;
        } else if (round.phase === 'completed') {
          mappedPhase = GAME_PHASES.RESULTS;
        } else if (round.phase === 'waiting') {
          mappedPhase = GAME_PHASES.WAITING;
        } else if (round.phase === 'judging') {
          mappedPhase = GAME_PHASES.JUDGING;
        }
        
        console.log(`🎮 Phase mapping: ${round.phase} -> ${mappedPhase}`);
        setCurrentPhase(mappedPhase);
        setPrizePool(parseFloat(round.prizePool || round.prize_pool || 0));
        
        // Ustaw czas pozostały - priorytet dla timeLeft z API
        if (round.phase === 'active' && (round.timeLeft !== undefined || round.time_left !== undefined)) {
          const apiTimeLeft = round.timeLeft !== undefined ? round.timeLeft : round.time_left;
          setTimeLeft(apiTimeLeft);
          console.log(`⏱️ Timer set from API: ${apiTimeLeft}s`);
        } else {
          setTimeLeft(120); // Default timer duration
        }
        
        // Znajdź sędziego na podstawie character ID
        const judgeCharacter = round.judgeCharacter || round.judge_character;
        const judge = TEAM_MEMBERS.find(member => member.id === judgeCharacter);
        if (judge) {
          console.log('👨‍⚖️ Judge found:', judge.name);
          setCurrentJudge(judge);
        } else {
          console.warn('⚠️ Judge not found for character:', judgeCharacter);
        }

        // Załaduj uczestników jeśli runda jest aktywna
        if (round.phase === 'active' || round.phase === 'judging') {
          // Sprawdź czy mamy submissions w odpowiedzi
          const roundSubmissions = round.submissions || [];
          const mappedParticipants = roundSubmissions.map(sub => ({
            id: sub.id,
            address: sub.player_address || sub.playerAddress,
            roastText: sub.roast_text || sub.roastText,
            isUser: address && sub.player_address?.toLowerCase() === address.toLowerCase()
          }));
          setParticipants(mappedParticipants);
          
          // Sprawdź czy użytkownik już wysłał roast
          if (address) {
            const userSubmitted = mappedParticipants.some(p => 
              p.address?.toLowerCase() === address.toLowerCase()
            );
            setUserSubmitted(userSubmitted);
          }
        } else if (round.phase === 'waiting') {
          // Załaduj prawdziwych uczestników jeśli są
          const roundSubmissions = round.submissions || [];
          const mappedParticipants = roundSubmissions.map(sub => ({
            id: sub.id,
            address: sub.player_address || sub.playerAddress,
            roastText: sub.roast_text || sub.roastText,
            isUser: address && sub.player_address?.toLowerCase() === address.toLowerCase()
          }));
          setParticipants(mappedParticipants);
          
          // Sprawdź czy użytkownik już wysłał
          if (address) {
            const userSubmitted = mappedParticipants.some(p => 
              p.address?.toLowerCase() === address.toLowerCase()
            );
            setUserSubmitted(userSubmitted);
          }
        }

        // Jeśli runda zakończona, pokaż wyniki
        if (round.phase === 'completed' && round.result) {
          // Upewnij się, że mamy sędziego dla wyników
          if (!currentJudge && round.judgeCharacter) {
            const judgeCharacter = round.judgeCharacter || round.judge_character;
            const judge = TEAM_MEMBERS.find(member => member.id === judgeCharacter);
            if (judge) {
              setCurrentJudge(judge);
            }
          }
          
          setWinner(round.result.winner);
          setAiReasoning(round.result.ai_reasoning);
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 5000);
        }
      } else {
        // Nie ma aktywnej rundy - to normalne między rundami
        console.log('⏳ No active round - waiting for next round');
        setCurrentRound(null);
        setCurrentPhase(GAME_PHASES.WAITING);
        setCurrentJudge(null);
        setParticipants([]);
        setUserSubmitted(false);
        // NIE ustawiamy błędu
      }
    } catch (err) {
      // Sprawdź czy to błąd 404 (brak rundy)
      if (err.response?.status === 404) {
        console.log('⏳ No active round found - this is normal between rounds');
        setCurrentRound(null);
        setCurrentPhase(GAME_PHASES.WAITING);
        setCurrentJudge(null);
        setParticipants([]);
        setUserSubmitted(false);
        // NIE ustawiamy błędu dla 404
      } else {
        console.error('💥 Failed to load current round:', err);
        setError('Failed to load game data');
      }
    }
  }, [address, resultsLocked]);

  // Załaduj statystyki gry
  const loadGameStats = useCallback(async () => {
    try {
      const response = await gameApi.getStats();
      const stats = response.data.data; // Poprawka: dane są w response.data.data
      
      if (stats) {
        setTotalParticipants(stats.totalPlayers || 0);
      }
    } catch (err) {
      console.error('Failed to load game stats:', err);
    }
  }, []);

  // Dołącz do rundy (wyślij płatność + roast)
  const joinRound = useCallback(async () => {
    if (!isAuthenticated || !currentRound || !roastText.trim() || isSubmitting || userSubmitted) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 1. Wyślij płatność 0.025 0G do treasury
      const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS;
      if (!treasuryAddress) {
        throw new Error('Treasury address not configured');
      }

      const entryFee = parseEther('0.025'); // 0.025 0G
      
      const txHash = await sendTransactionAsync({
        to: treasuryAddress,
        value: entryFee,
      });

      console.log('Payment transaction sent:', txHash);
      playSound('join');
      
      // Dodaj powiadomienie o transakcji
      addNotification({
        type: 'success',
        message: 'Entry fee payment sent! Submitting your roast...',
        txHash: txHash
      });

      // 2. Wyślij roast przez WebSocket
      wsService.submitRoast(currentRound.id, roastText, txHash);

      // Reset form
      setRoastText('');
      
    } catch (err) {
      console.error('Failed to join round:', err);
      setError(err.message || 'Failed to join round');
      setIsSubmitting(false);
    }
  }, [isAuthenticated, currentRound, roastText, isSubmitting, userSubmitted, sendTransactionAsync, addNotification]);

  // Konfiguracja WebSocket event handlerów
  useEffect(() => {
    // Connection status
    wsService.on('connection-status', (data) => {
      setWsConnected(data.connected);
    });

    // Authentication
    wsService.on('authenticated', (data) => {
      console.log('🔐 WebSocket authenticated successfully:', data);
      
      // Dołącz do aktualnej rundy po uwierzytelnieniu
      if (currentRound?.id) {
        console.log('🎮 Joining round after authentication:', currentRound.id);
        wsService.joinRound(currentRound.id);
      }
    });

    // Round events
    wsService.on('round-created', (data) => {
      console.log('New round created:', data);
      // Resetuj stan dla nowej rundy
      setUserSubmitted(false);
      setRoastText('');
      setWinner(null);
      setAiReasoning('');
      setCurrentPhase(GAME_PHASES.WAITING);
      setNextRoundCountdown(0);
      // Załaduj nową rundę
      loadCurrentRound();
      playSound('start');
    });

    wsService.on('round-updated', (data) => {
      console.log('Round updated:', data);
      loadCurrentRound();
    });

    wsService.on('timer-update', (data) => {
      if (data.roundId === currentRound?.id) {
        setTimeLeft(Math.max(0, data.timeLeft));
      }
    });

    wsService.on('player-joined', (data) => {
      console.log('Player joined:', data);
      // Odśwież uczestników
      loadCurrentRound();
    });

    wsService.on('judging-started', (data) => {
      console.log('Judging started:', data);
      setCurrentPhase(GAME_PHASES.JUDGING);
      playSound('judging');
    });

    wsService.on('round-completed', (data) => {
      console.log('Round completed:', data);
      
      // Zapobiegaj wielokrotnym wywołaniom
      if (currentPhase === GAME_PHASES.RESULTS || resultsLocked) {
        console.log('Already in results phase or results locked, skipping duplicate event');
        return;
      }
      
      // Ustaw blokadę na 20 sekund
      setResultsLocked(true);
      const lockTimer = setTimeout(() => {
        console.log('🔓 Results lock expired, allowing updates');
        setResultsLocked(false);
      }, 20000);
      setResultsLockTimer(lockTimer);
      
      setCurrentPhase(GAME_PHASES.RESULTS);
      
      // Zachowaj obecnego sędziego lub znajdź go na podstawie danych
      if (!currentJudge && data.character) {
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
      console.log('Roast submitted successfully:', data);
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
      console.log('Prize distributed:', data);
      
      // Jeśli to nasz adres, pokaż powiadomienie
      if (address && data.winnerAddress?.toLowerCase() === address.toLowerCase()) {
        addNotification({
          type: 'success',
          message: `Congratulations! You won ${data.prizeAmount.toFixed(3)} 0G! 🎉`,
          txHash: data.transactionHash
        });
      }
    });

    wsService.on('error', (error) => {
      console.error('WebSocket error:', error);
      setError(error.message);
      setIsSubmitting(false);
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
      wsService.off('error');
    };
  }, [currentRound?.id, loadCurrentRound, address, addNotification]);

  // Połącz WebSocket gdy użytkownik jest uwierzytelniony
  useEffect(() => {
    if (isAuthenticated && address) {
      console.log('🔌 Connecting WebSocket with address:', address);
      // Najpierw rozłącz jeśli już połączony
      wsService.disconnect();
      // Poczekaj chwilę przed ponownym połączeniem
      setTimeout(() => {
        wsService.connect(address);
      }, 100);
      
      // Dołączanie do rundy będzie obsługiwane w event handlerze 'authenticated'
    } else {
      console.log('🔌 Disconnecting WebSocket');
      wsService.disconnect();
    }
  }, [isAuthenticated, address]);

  // Countdown do następnej rundy
  useEffect(() => {
    if (nextRoundCountdown > 0) {
      const timer = setTimeout(() => {
        setNextRoundCountdown(prev => {
          if (prev <= 1) {
            // Resetuj stan użytkownika dla nowej rundy
            setUserSubmitted(false);
            setRoastText('');
            // Załaduj nową rundę
            loadCurrentRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [nextRoundCountdown, loadCurrentRound]);

  // Cleanup timer przy unmount
  useEffect(() => {
    return () => {
      if (resultsLockTimer) {
        console.log('🧹 Cleaning up results lock timer');
        clearTimeout(resultsLockTimer);
      }
    };
  }, [resultsLockTimer]);

  // Załaduj dane przy starcie
  useEffect(() => {
    // Zapobiegaj podwójnemu ładowaniu w React.StrictMode
    if (!hasInitialLoad) {
      setHasInitialLoad(true);
      loadCurrentRound();
      loadGameStats();
    }
  }, []); // Usuwamy zależności aby wykonać tylko raz

  // Odśwież dane co 30 sekund
  useEffect(() => {
    // Rozpocznij interval dopiero po pierwszym załadowaniu
    if (!hasInitialLoad) return;
    
    const interval = setInterval(() => {
      loadCurrentRound();
      loadGameStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [hasInitialLoad, loadCurrentRound, loadGameStats]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // Game State
    currentPhase,
    currentJudge,
    roastText,
    setRoastText,
    timeLeft,
    participants,
    isConnected: isConnected && wsConnected,
    winner,
    aiReasoning,
    prizePool,
    totalParticipants,
    roundNumber,
    userSubmitted,
    nextRoundCountdown,
    currentRound,
    error,
    userAddress: address, // Wallet address for voting
    
    // UI State
    soundEnabled,
    setSoundEnabled,
    showJudgeDetails,
    setShowJudgeDetails,
    isSubmitting,
    showParticles,
    showFireEffect,
    
    // Actions
    connectWallet: () => {}, // Będzie obsługiwane przez useWallet
    joinRound,
    formatTime,
    playSound,
    
    // Utils
    loadCurrentRound,
    loadGameStats,
    clearError: () => setError(null),
    
    // Notifications
    notifications,
    addNotification,
    removeNotification
  };
}; 