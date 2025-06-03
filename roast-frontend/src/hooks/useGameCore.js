import { useState, useCallback, useRef, useEffect } from 'react';
import { GAME_PHASES } from '../constants/gameConstants';
import { TEAM_MEMBERS } from '../data/teamMembers';
import { gameApi } from '../services/api';
import { useAccount } from 'wagmi';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useWalletAuth } from './useWalletAuth';

export const useGameCore = () => {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { isAuthenticated, isAuthenticating, authError } = useWalletAuth();

  // Refs for debouncing
  const loadRoundTimeoutRef = useRef(null);
  const loadStatsTimeoutRef = useRef(null);
  const lastLoadRoundTime = useRef(0);
  const lastLoadStatsTime = useRef(0);
  
  // Local timer refs
  const localTimerRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showJudgeDetails, setShowJudgeDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showFireEffect, setShowFireEffect] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Results lock state
  const [resultsLocked, setResultsLocked] = useState(false);
  const [resultsLockTimer, setResultsLockTimer] = useState(null);

  // ================================
  // SOUND EFFECTS
  // ================================
  
  // Sound effects
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    // Sprawdź zmienną środowiskową dla logowania
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`Playing sound: ${type}`);
    }

    try {
      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Different sounds for different game events
      const frequencies = {
        // Game phase sounds
        start: [523, 659, 784], // C5, E5, G5 - ascending major chord (optimistic)
        judging: [440, 554, 659, 784], // A4, C#5, E5, G5 - suspenseful progression
        winner: [784, 988, 1175, 1397], // G5, B5, D6, F6 - victorious fanfare
        
        // User action sounds
        join: [659, 784, 988], // E5, G5, B5 - joining chord
        submit: [880, 1108, 1318], // A5, C#6, E6 - submission confirmation
        vote: [523, 698, 880], // C5, F5, A5 - voting chord
        
        // Notification sounds
        success: [659, 830, 988, 1175], // E5, G#5, B5, D6 - success progression
        error: [349, 293, 261], // F4, D4, C4 - descending error tone
        notification: [880, 1108], // A5, C#6 - attention sound
        
        // Special effects
        countdown: [440, 440, 440, 523], // A4 x3, C5 - countdown beeps
        timeout: [220, 185, 165], // A3, F#3, E3 - time's up descending
      };
      
      const freq = frequencies[type] || frequencies.notification;
      
      freq.forEach((f, i) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = f;
          
          // Different wave types for different event categories
          if (type === 'winner' || type === 'success') {
            osc.type = 'triangle'; // Warmer sound for positive events
          } else if (type === 'error' || type === 'timeout') {
            osc.type = 'sawtooth'; // Harsher sound for negative events
          } else if (type === 'judging' || type === 'countdown') {
            osc.type = 'square'; // Sharp sound for suspense
          } else {
            osc.type = 'sine'; // Default smooth sound
          }
          
          // Volume based on event importance
          const volume = type === 'winner' ? 0.15 : 
                        type === 'error' ? 0.12 :
                        type === 'start' || type === 'judging' ? 0.1 : 0.08;
          
          gain.gain.setValueAtTime(volume, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          osc.start();
          osc.stop(audioContext.currentTime + 0.6);
        }, i * 120); // Slightly longer delay between notes for clarity
      });
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.warn('Audio context error:', error);
      }
    }
  }, [soundEnabled]);

  // ================================
  // LOCAL TIMER MANAGEMENT
  // ================================
  
  // Start local timer that counts down every second
  const startLocalTimer = useCallback((initialTime) => {
    // Clear existing timer
    if (localTimerRef.current) {
      clearInterval(localTimerRef.current);
    }
    
    let currentTime = initialTime;
    lastSyncTimeRef.current = Date.now();
    
    localTimerRef.current = setInterval(() => {
      currentTime--;
      setTimeLeft(Math.max(0, currentTime));
      
      // Play countdown sound when 10 seconds left
      if (currentTime === 10) {
        playSound('countdown');
      }
      
      // Play timeout sound when timer reaches 0
      if (currentTime === 0) {
        playSound('timeout');
      }
      
      // Stop timer when it reaches 0
      if (currentTime <= 0) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }
    }, 1000);
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`⏱️ Local timer started: ${initialTime}s`);
    }
  }, [playSound]);

  // Stop local timer
  const stopLocalTimer = useCallback(() => {
    if (localTimerRef.current) {
      clearInterval(localTimerRef.current);
      localTimerRef.current = null;
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('⏱️ Local timer stopped');
      }
    }
  }, []);

  // Enhanced setTimeLeft that also manages local timer
  const setTimeLeftWithTimer = useCallback((newTimeLeft, source = 'api') => {
    // ✨ KLUCZOWE: Prevent API overriding fresh WebSocket data
    if (source === 'api' && (Date.now() - lastSyncTimeRef.current) < 2000) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log(`⏱️ Ignoring API timer update (${newTimeLeft}s) - recent WebSocket data available`);
      }
      return; // Skip API update if we have recent WebSocket data
    }
    
    setTimeLeft(newTimeLeft);
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`⏱️ Timer set from ${source}: ${newTimeLeft}s`);
    }
    
    // Start local timer if we're in writing or judging phase and timer > 0
    if ((currentPhase === GAME_PHASES.WRITING || currentPhase === GAME_PHASES.JUDGING) && newTimeLeft > 0) {
      startLocalTimer(newTimeLeft);
    }
  }, [currentPhase, startLocalTimer]);

  // Sync with backend timer update - SIMPLIFIED VERSION
  const syncWithBackendTimer = useCallback((backendTimeLeft, serverTimestamp) => {
    // ✨ KLUCZOWE: Pasywny frontend - zawsze akceptuj backend values!
    // Usuń "smart" logic która może powodować desynchronizację
    
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`⏱️ Backend timer update: ${backendTimeLeft}s`);
    }
    
    // Zawsze ustaw czas z backendu - backend jest source of truth
    setTimeLeftWithTimer(Math.max(0, backendTimeLeft), 'websocket');
    
    // Update sync time for reference
    lastSyncTimeRef.current = Date.now();
  }, [setTimeLeftWithTimer]);

  // Effect to manage timer based on phase changes
  useEffect(() => {
    if ((currentPhase === GAME_PHASES.WRITING || currentPhase === GAME_PHASES.JUDGING) && timeLeft > 0) {
      // Start local timer for writing AND judging phases
      startLocalTimer(timeLeft);
    } else {
      // Stop timer for other phases (waiting, results)
      stopLocalTimer();
    }
    
    return () => {
      stopLocalTimer();
    };
  }, [currentPhase, startLocalTimer, stopLocalTimer]); // Note: timeLeft not in dependency to avoid restart on every tick

  // ================================
  // ORIGINAL CODE CONTINUES...
  // ================================

  // Debounced załaduj aktualną rundę z backendu
  const loadCurrentRound = useCallback(async (force = false) => {
    // Debouncing - max 1 request per 2 seconds unless forced
    const now = Date.now();
    if (!force && (now - lastLoadRoundTime.current) < 2000) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔄 Debouncing loadCurrentRound call');
      }
      return;
    }

    // Jeśli wyniki są zablokowane, nie aktualizuj
    if (resultsLocked && !force) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔒 Results are locked, skipping round update');
      }
      return;
    }

    // Clear any pending timeout
    if (loadRoundTimeoutRef.current) {
      clearTimeout(loadRoundTimeoutRef.current);
    }

    // Debounce non-forced calls
    if (!force) {
      loadRoundTimeoutRef.current = setTimeout(() => {
        loadCurrentRound(true);
      }, 500);
      return;
    }

    lastLoadRoundTime.current = now;
    
    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔍 Loading current round from API...');
      }
      const response = await gameApi.getCurrentRound();
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('✅ API Response:', response);
      }
      
      // Backend zwraca {success: true, data: roundData}
      const round = response.data.data; // Poprawka: dane są w response.data.data
      
      if (round) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('📊 Round data received:', round);
        }
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
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log(`🎮 Phase mapping: ${round.phase} -> ${mappedPhase}`);
        }
        setCurrentPhase(mappedPhase);
        setPrizePool(parseFloat(round.prizePool || round.prize_pool || 0));
        
        // Ustaw czas pozostały - priorytet dla timeLeft z API
        if ((round.phase === 'active' || round.phase === 'judging') && (round.timeLeft !== undefined || round.time_left !== undefined)) {
          const apiTimeLeft = round.timeLeft !== undefined ? round.timeLeft : round.time_left;
          setTimeLeftWithTimer(apiTimeLeft, 'api');
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.log(`⏱️ Timer set from API: ${apiTimeLeft}s (phase: ${round.phase})`);
          }
        } else {
          setTimeLeftWithTimer(120, 'api'); // Default timer duration
        }
        
        // Znajdź sędziego na podstawie character ID
        const judgeCharacter = round.judgeCharacter || round.judge_character;
        const judge = TEAM_MEMBERS.find(member => member.id === judgeCharacter);
        if (judge) {
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.log('👨‍⚖️ Judge found:', judge.name);
          }
          setCurrentJudge(judge);
        } else {
          if (import.meta.env.VITE_TEST_ENV === 'true') {
            console.warn('⚠️ Judge not found for character:', judgeCharacter);
          }
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
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('⏳ No active round - waiting for next round');
        }
        setCurrentRound(null);
        setCurrentPhase(GAME_PHASES.WAITING);
        setCurrentJudge(null);
        setParticipants([]);
        setUserSubmitted(false);
        // NIE ustawiamy błędu
      }
    } catch (err) {
      // Handle rate limiting gracefully
      if (err.response?.status === 429) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.warn('⏱️ Rate limited, will retry later');
        }
        // Don't set error for rate limiting
        return;
      }
      
      // Sprawdź czy to błąd 404 (brak rundy)
      if (err.response?.status === 404) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('⏳ No active round found - this is normal between rounds');
        }
        setCurrentRound(null);
        setCurrentPhase(GAME_PHASES.WAITING);
        setCurrentJudge(null);
        setParticipants([]);
        setUserSubmitted(false);
        // NIE ustawiamy błędu dla 404
      } else {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.error('💥 Failed to load current round:', err);
        }
        setError('Failed to load game data');
      }
    }
  }, [address, resultsLocked]);

  // Debounced załaduj statystyki gry
  const loadGameStats = useCallback(async (force = false) => {
    // Debouncing - max 1 request per 5 seconds unless forced
    const now = Date.now();
    if (!force && (now - lastLoadStatsTime.current) < 5000) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔄 Debouncing loadGameStats call');
      }
      return;
    }

    // Clear any pending timeout
    if (loadStatsTimeoutRef.current) {
      clearTimeout(loadStatsTimeoutRef.current);
    }

    // Debounce non-forced calls
    if (!force) {
      loadStatsTimeoutRef.current = setTimeout(() => {
        loadGameStats(true);
      }, 1000);
      return;
    }

    lastLoadStatsTime.current = now;

    try {
      const response = await gameApi.getStats();
      const stats = response.data.data; // Poprawka: dane są w response.data.data
      
      if (stats) {
        setTotalParticipants(stats.totalPlayers || 0);
      }
    } catch (err) {
      // Handle rate limiting gracefully
      if (err.response?.status === 429) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.warn('⏱️ Stats rate limited, will retry later');
        }
        return;
      }
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load game stats:', err);
      }
    }
  }, []);

  // Dołącz do rundy (wyślij płatność + roast)
  const joinRound = useCallback(async (addNotification) => {
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

      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Payment transaction sent:', txHash);
      }
      playSound('join');
      
      // Dodaj powiadomienie o transakcji
      if (addNotification) {
        addNotification({
          type: 'success',
          message: 'Entry fee payment sent! Submitting your roast...',
          txHash: txHash
        });
      }

      // Reset form
      setRoastText('');
      
      return { txHash, roundId: currentRound.id, roastText };
      
    } catch (err) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to join round:', err);
      }
      setError(err.message || 'Failed to join round');
      setIsSubmitting(false);
      throw err;
    }
  }, [isAuthenticated, currentRound, roastText, isSubmitting, userSubmitted, sendTransactionAsync]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    if (loadRoundTimeoutRef.current) {
      clearTimeout(loadRoundTimeoutRef.current);
    }
    if (loadStatsTimeoutRef.current) {
      clearTimeout(loadStatsTimeoutRef.current);
    }
    // Cleanup local timer
    stopLocalTimer();
  }, [stopLocalTimer]);

  return {
    // Game State
    currentPhase,
    setCurrentPhase,
    currentJudge,
    setCurrentJudge,
    roastText,
    setRoastText,
    timeLeft,
    setTimeLeft: setTimeLeftWithTimer, // Use enhanced version
    participants,
    setParticipants,
    winner,
    setWinner,
    aiReasoning,
    setAiReasoning,
    prizePool,
    setPrizePool,
    totalParticipants,
    setTotalParticipants,
    currentRound,
    setCurrentRound,
    hasInitialLoad,
    setHasInitialLoad,
    
    // UI State
    soundEnabled,
    setSoundEnabled,
    showJudgeDetails,
    setShowJudgeDetails,
    isSubmitting,
    setIsSubmitting,
    showParticles,
    setShowParticles,
    showFireEffect,
    setShowFireEffect,
    roundNumber,
    setRoundNumber,
    userSubmitted,
    setUserSubmitted,
    nextRoundCountdown,
    setNextRoundCountdown,
    wsConnected,
    setWsConnected,
    error,
    setError,

    // Results lock state
    resultsLocked,
    setResultsLocked,
    resultsLockTimer,
    setResultsLockTimer,

    // Methods
    loadCurrentRound,
    loadGameStats,
    joinRound,
    formatTime,
    playSound,
    clearError: () => setError(null),
    cleanup,
    
    // Timer methods
    syncWithBackendTimer,
    startLocalTimer,
    stopLocalTimer,

    // Wallet state
    isConnected: isConnected && wsConnected,
    userAddress: address,
    isAuthenticated,
    isAuthenticating,
    authError
  };
}; 