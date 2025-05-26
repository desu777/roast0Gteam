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
  
  // UI State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showJudgeDetails, setShowJudgeDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${type}`);
  };

  // Załaduj aktualną rundę z backendu
  const loadCurrentRound = useCallback(async () => {
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
        setTimeLeft(round.timeLeft || round.time_left || 120);
        
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
          setParticipants(round.participants || []);
          
          // Sprawdź czy użytkownik już wysłał roast
          if (address && round.participants) {
            const userParticipant = round.participants.find(p => 
              p.player_address?.toLowerCase() === address.toLowerCase()
            );
            setUserSubmitted(!!userParticipant);
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
  }, [address]);

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

      // 2. Wyślij roast przez WebSocket
      wsService.submitRoast(currentRound.id, roastText, txHash);

      // Reset form
      setRoastText('');
      
    } catch (err) {
      console.error('Failed to join round:', err);
      setError(err.message || 'Failed to join round');
      setIsSubmitting(false);
    }
  }, [isAuthenticated, currentRound, roastText, isSubmitting, userSubmitted, sendTransactionAsync]);

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
      setCurrentPhase(GAME_PHASES.RESULTS);
      setWinner(data.winner);
      setAiReasoning(data.ai_reasoning);
      setShowParticles(true);
      playSound('winner');
      
      setTimeout(() => setShowParticles(false), 5000);
      
      // Ustaw countdown do następnej rundy
      setNextRoundCountdown(30);
    });

    wsService.on('roast-submitted', (data) => {
      console.log('Roast submitted successfully:', data);
      setIsSubmitting(false);
      setUserSubmitted(true);
      playSound('submit');
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
      wsService.off('error');
    };
  }, [currentRound?.id, loadCurrentRound]);

  // Połącz WebSocket gdy użytkownik jest uwierzytelniony
  useEffect(() => {
    if (isAuthenticated && address) {
      console.log('🔌 Connecting WebSocket with address:', address);
      wsService.connect(address);
      
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

  // Załaduj dane przy starcie
  useEffect(() => {
    loadCurrentRound();
    loadGameStats();
  }, [loadCurrentRound, loadGameStats]);

  // Odśwież dane co 30 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      loadCurrentRound();
      loadGameStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadCurrentRound, loadGameStats]);

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
    
    // UI State
    soundEnabled,
    setSoundEnabled,
    showJudgeDetails,
    setShowJudgeDetails,
    isSubmitting,
    showParticles,
    
    // Actions
    connectWallet: () => {}, // Będzie obsługiwane przez useWallet
    joinRound,
    formatTime,
    playSound,
    
    // Utils
    loadCurrentRound,
    loadGameStats,
    clearError: () => setError(null)
  };
}; 