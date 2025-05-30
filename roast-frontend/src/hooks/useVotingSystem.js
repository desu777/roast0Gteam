import { useState, useCallback, useRef } from 'react';
import { votingApi } from '../services/api';
import { TEAM_MEMBERS } from '../data/teamMembers';

export const useVotingSystem = () => {
  // Refs for debouncing
  const loadVotingStatsTimeoutRef = useRef(null);
  const lastLoadVotingStatsTime = useRef(0);
  const castVoteTimeoutRef = useRef(null);

  // ================================
  // VOTING STATE - LIVE SYSTEM
  // ================================
  const [votingStats, setVotingStats] = useState({});
  const [userVote, setUserVote] = useState(null);
  const [votingLocked, setVotingLocked] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [votingError, setVotingError] = useState(null);

  // Debounced load voting statistics for current round
  const loadVotingStats = useCallback(async (currentRound, isAuthenticated, address, force = false) => {
    if (!currentRound?.id) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ No current round for voting stats');
      }
      return;
    }

    // Debouncing - max 1 request per 5 seconds unless forced
    const now = Date.now();
    if (!force && (now - lastLoadVotingStatsTime.current) < 5000) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔄 Debouncing loadVotingStats call');
      }
      return;
    }

    // Clear any pending timeout
    if (loadVotingStatsTimeoutRef.current) {
      clearTimeout(loadVotingStatsTimeoutRef.current);
    }

    // Debounce non-forced calls
    if (!force) {
      loadVotingStatsTimeoutRef.current = setTimeout(() => {
        loadVotingStats(currentRound, isAuthenticated, address, true);
      }, 1500);
      return;
    }

    lastLoadVotingStatsTime.current = now;

    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Loading voting stats for round:', currentRound.id);
      }
      const response = await votingApi.getVotingStats(currentRound.id);
      const stats = response.data.data || response.data;
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('✅ Voting stats loaded:', stats);
      }
      setVotingStats(stats);
      
      // Check if voting is locked
      if (stats.isLocked) {
        setVotingLocked(true);
      }
      
      // Load user's vote if authenticated
      if (isAuthenticated && address) {
        try {
          const userVoteResponse = await votingApi.getUserVote(currentRound.id, address);
          const userData = userVoteResponse.data.data || userVoteResponse.data;
          
          if (userData?.characterId) {
            setUserVote(userData.characterId);
            if (import.meta.env.VITE_TEST_ENV === 'true') {
              console.log('🗳️ User vote loaded:', userData.characterId);
            }
          }
        } catch (userVoteError) {
          // User hasn't voted yet - this is normal
          if (userVoteError.response?.status !== 404 && userVoteError.response?.status !== 429) {
            if (import.meta.env.VITE_TEST_ENV === 'true') {
              console.error('Failed to load user vote:', userVoteError);
            }
          }
        }
      }
      
    } catch (error) {
      // Handle rate limiting gracefully
      if (error.response?.status === 429) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.warn('🗳️⏱️ Voting stats rate limited, will retry later');
        }
        setVotingError('Rate limited - please wait a moment');
        return;
      }
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('💥 Failed to load voting stats:', error);
      }
      // Don't set error for voting stats failure - it's not critical
    }
  }, []);

  // Cast vote for next judge with rate limit protection
  const castVote = useCallback(async (characterId, currentRound, isAuthenticated, address, addNotification, playSound, wsService) => {
    if (!isAuthenticated || !currentRound?.id || !address || isVoting || userVote || votingLocked) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Cannot cast vote:', {
          authenticated: isAuthenticated,
          roundId: currentRound?.id,
          address: !!address,
          isVoting,
          userVote,
          votingLocked
        });
      }
      return;
    }

    // Prevent spam clicking
    if (castVoteTimeoutRef.current) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.warn('🗳️ Vote request already in progress');
      }
      return;
    }

    setIsVoting(true);
    setVotingError(null);
    
    // Set timeout to prevent rapid successive votes
    castVoteTimeoutRef.current = setTimeout(() => {
      castVoteTimeoutRef.current = null;
    }, 3000);
    
    try {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🗳️ Casting vote for character:', characterId);
      }
      
      // NIE robimy optimistic update - czekamy na potwierdzenie
      
      // Primary: Use WebSocket for real-time updates
      if (wsService && wsService.castVote) {
        wsService.castVote(currentRound.id, characterId);
        
        // Pokaż informację o wysłaniu głosu
        if (addNotification) {
          addNotification({
            type: 'info',
            message: `Sending vote for ${TEAM_MEMBERS.find(m => m.id === characterId)?.name}...`,
            duration: 2000
          });
        }
      } else {
        // Fallback: Use API directly
        const response = await votingApi.castVote(currentRound.id, characterId, address);
        
        if (response.data.success) {
          // Ustaw głos po potwierdzeniu
          const voteData = response.data.data || response.data;
          setUserVote(voteData.characterId || characterId);
          
          if (playSound) {
            playSound('vote');
          }
          
          if (addNotification) {
            const characterName = TEAM_MEMBERS.find(m => m.id === (voteData.characterId || characterId))?.name;
            addNotification({
              type: 'success',
              message: voteData.alreadyVoted 
                ? `You already voted for ${characterName}! 🗳️`
                : `Vote cast for ${characterName}! 🗳️`,
              duration: 3000
            });
          }
        }
      }
      
      setIsVoting(false);
      
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('💥 Failed to cast vote:', error);
      }
      
      // Handle different error types
      if (error.response?.status === 429) {
        setVotingError('Too many vote requests - please wait a moment');
        if (addNotification) {
          addNotification({
            type: 'warning',
            message: '⚠️ Rate limited - please wait a moment',
            duration: 4000
          });
        }
      } else if (error.response?.data?.error === 'ALREADY_VOTED') {
        // This shouldn't happen anymore, but handle it gracefully
        const voteChar = await votingApi.getUserVote(currentRound.id, address);
        if (voteChar?.data?.data?.characterId) {
          setUserVote(voteChar.data.data.characterId);
        }
        if (addNotification) {
          addNotification({
            type: 'info',
            message: 'You have already voted in this round! 🗳️',
            duration: 3000
          });
        }
      } else {
        setVotingError(error.message || 'Failed to cast vote');
        if (addNotification) {
          addNotification({
            type: 'error',
            message: 'Failed to cast vote. Please try again.',
            duration: 4000
          });
        }
      }
      
      setIsVoting(false);
    }
  }, [isVoting, userVote, votingLocked]);

  // Reset voting state for new round
  const resetVotingState = useCallback(() => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Resetting voting state for new round');
    }
    setVotingStats({});
    setUserVote(null);
    setVotingLocked(false);
    setIsVoting(false);
    setVotingError(null);
    
    // Clear any pending vote timeout
    if (castVoteTimeoutRef.current) {
      clearTimeout(castVoteTimeoutRef.current);
      castVoteTimeoutRef.current = null;
    }
    
    // Reset debouncing timers
    lastLoadVotingStatsTime.current = 0;
  }, []);

  // Handle voting WebSocket events
  const handleVotingUpdate = useCallback((data, address) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Voting update received:', data);
    }
    
    // Update voting stats with real-time data
    if (data.votingStats) {
      setVotingStats(data.votingStats);
    }
    
    // Show voting animation for other users' votes (optional)
    if (data.lastVote && data.lastVote.voterAddress !== address) {
      // Możemy dodać dodatkowe efekty dla głosów innych użytkowników
    }
  }, []);

  const handleVoteCastSuccess = useCallback((data, addNotification, loadVotingStatsCallback) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Vote cast confirmed:', data);
    }
    
    // Pobierz characterId z różnych możliwych pól
    const characterId = data.characterId || data.character_id || data.voteCharacterId;
    
    // Confirm user's vote
    if (characterId) {
      setUserVote(characterId);
    }
    setIsVoting(false);
    setVotingError(null);
    
    const characterName = characterId 
      ? TEAM_MEMBERS.find(m => m.id === characterId)?.name || 'Unknown'
      : 'Unknown';
      
    if (addNotification) {
      addNotification({
        type: 'success',
        message: data.alreadyVoted 
          ? `You already voted for ${characterName}! 🗳️`
          : `Vote confirmed for ${characterName}! 🗳️`,
        duration: 3000
      });
    }
    
    // Refresh voting stats with debouncing
    if (loadVotingStatsCallback) {
      setTimeout(() => {
        loadVotingStatsCallback();
      }, 1500);
    }
  }, []);

  const handleVotingLocked = useCallback((data, addNotification) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Voting locked:', data);
    }
    setVotingLocked(true);
    
    if (addNotification) {
      addNotification({
        type: 'warning',
        message: 'Voting has been locked! ⏰',
        duration: 3000
      });
    }
  }, []);

  const handleVotingReset = useCallback((data) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Voting reset for new round:', data);
    }
    resetVotingState();
    
    // Load voting stats for new round
    if (data.newRoundId && data.votingStats) {
      setVotingStats(data.votingStats);
    }
  }, [resetVotingState]);

  const handleVotingError = useCallback((error) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error('WebSocket voting error:', error);
    }
    
    // Handle voting-specific errors
    if (isVoting) {
      if (error.message && error.message.includes('429')) {
        setVotingError('Too many requests - please wait');
      } else {
        setVotingError(error.message);
      }
      setIsVoting(false);
      // Don't reset optimistic update for rate limit errors
      if (!error.message || !error.message.includes('429')) {
        setUserVote(null);
      }
    }
  }, [isVoting]);

  const handleVotingResultAccepted = useCallback((data, addNotification) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log('🗳️ Voting result accepted:', data);
    }
    
    const characterName = TEAM_MEMBERS.find(m => m.id === data.nextJudge)?.name || 'Unknown';
    
    let message = '';
    let messageType = 'success';
    
    if (data.source === 'community-vote') {
      // Check if it was from WebSocket event with method info
      if (data.method === 'tie_breaker') {
        message = `🎲 TIE! ${characterName} was randomly selected as next judge among tied candidates`;
        messageType = 'info';
      } else if (data.method === 'random_no_votes') {
        message = `🎯 No votes cast - ${characterName} was randomly selected as judge`;
        messageType = 'warning';
      } else {
        message = `🗳️ ${characterName} will judge the next round! (Community Vote)`;
      }
    } else {
      message = `🎯 ${characterName} will judge the next round!`;
    }
    
    if (addNotification) {
      addNotification({
        type: messageType,
        message: message,
        duration: 5000
      });
    }
  }, []);

  // Cleanup timeouts
  const cleanup = useCallback(() => {
    if (loadVotingStatsTimeoutRef.current) {
      clearTimeout(loadVotingStatsTimeoutRef.current);
    }
    if (castVoteTimeoutRef.current) {
      clearTimeout(castVoteTimeoutRef.current);
    }
  }, []);

  return {
    // Voting State
    votingStats,
    setVotingStats,
    userVote,
    setUserVote,
    votingLocked,
    setVotingLocked,
    isVoting,
    setIsVoting,
    votingError,
    setVotingError,

    // Voting Actions
    loadVotingStats,
    castVote,
    resetVotingState,
    cleanup,

    // WebSocket Event Handlers
    handleVotingUpdate,
    handleVoteCastSuccess,
    handleVotingLocked,
    handleVotingReset,
    handleVotingResultAccepted,
    handleVotingError
  };
}; 