import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import wsService from '../services/websocket';

const BATTLE_API_URL = import.meta.env.VITE_BATTLE_API_URL || 'http://localhost:3002/api';

// Calculate betting odds based on bet distribution
const calculateOdds = (bets) => {
  if (!bets || (!bets.og?.total && !bets.roaster?.total)) {
    return {
      og: { ...bets?.og, odds: '1.0x' },
      roaster: { ...bets?.roaster, odds: '1.0x' }
    };
  }

  const ogTotal = bets.og?.total || 0;
  const roasterTotal = bets.roaster?.total || 0;
  const totalPot = ogTotal + roasterTotal;

  if (totalPot === 0) {
    return {
      og: { ...bets.og, odds: '1.0x' },
      roaster: { ...bets.roaster, odds: '1.0x' }
    };
  }

  // Calculate odds: (total pot / side total) with house edge
  const houseEdge = 0.95; // 5% house edge
  const ogOdds = ogTotal > 0 ? (totalPot / ogTotal) * houseEdge : 1.0;
  const roasterOdds = roasterTotal > 0 ? (totalPot / roasterTotal) * houseEdge : 1.0;

  return {
    og: { 
      ...bets.og, 
      odds: `${Math.max(1.0, ogOdds).toFixed(1)}x` 
    },
    roaster: { 
      ...bets.roaster, 
      odds: `${Math.max(1.0, roasterOdds).toFixed(1)}x` 
    }
  };
};

export const useOneVSoneBattle = (userAddress, addNotification, playSound) => {
  // Battle state
  const [currentBattle, setCurrentBattle] = useState(null);
  const [battleStatus, setBattleStatus] = useState('waiting_bets');
  const [ogCharacter, setOgCharacter] = useState(null);
  const [roasterCharacter, setRoasterCharacter] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dialog, setDialog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [winnerReasoning, setWinnerReasoning] = useState('');

  // Betting state
  const [bets, setBets] = useState({ og: { count: 0, total: 0, players: [] }, roaster: { count: 0, total: 0, players: [] } });
  const [totalPot, setTotalPot] = useState(0);
  const [userBet, setUserBet] = useState(null);
  const [isLoadingBet, setIsLoadingBet] = useState(false);

  // History
  const [battleHistory, setBattleHistory] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);

  // Create axios instance for battle API
  const battleApi = axios.create({
    baseURL: BATTLE_API_URL,
    timeout: 10000,
  });

  // Load current battle
  const loadCurrentBattle = useCallback(async () => {
    try {
      const response = await battleApi.get('/battle/current');
      
      if (response.data.success && response.data.data) {
        const battle = response.data.data;
        setCurrentBattle(battle);
        setBattleStatus(battle.status);
        setOgCharacter(battle.ogCharacter);
        setRoasterCharacter(battle.roasterCharacter);
        
        // Calculate odds and set bets with odds
        const betsWithOdds = calculateOdds(battle.bets);
        setBets(betsWithOdds);
        setTotalPot(battle.totalPot);
        setDialog(battle.dialog || []);
        setWinner(battle.winner);
        setWinnerReasoning(battle.winnerReasoning);
        
        // Check if user has bet
        if (userAddress && battle.bets) {
          const userBetOg = battle.bets.og.players.find(p => p.address.toLowerCase() === userAddress.toLowerCase());
          const userBetRoaster = battle.bets.roaster.players.find(p => p.address.toLowerCase() === userAddress.toLowerCase());
          
          if (userBetOg) {
            setUserBet({ side: 'og', amount: userBetOg.amount });
          } else if (userBetRoaster) {
            setUserBet({ side: 'roaster', amount: userBetRoaster.amount });
          } else {
            setUserBet(null);
          }
        }
        
        // Handle countdown
        if (battle.status === 'countdown' && battle.countdownRemaining) {
          setTimeLeft(battle.countdownRemaining);
        } else {
          setTimeLeft(0);
        }
      }
    } catch (error) {
      console.error('Failed to load current battle:', error);
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Battle API error:', error.response?.data || error.message);
      }
    }
  }, [userAddress]);

  // Load battle history
  const loadBattleHistory = useCallback(async () => {
    try {
      const response = await battleApi.get('/battle/history?limit=20');
      
      if (response.data.success) {
        setBattleHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load battle history:', error);
    }
  }, []);

  // Load player stats
  const loadPlayerStats = useCallback(async (address) => {
    if (!address) return;
    
    try {
      const response = await battleApi.get(`/battle/stats/${address}`);
      
      if (response.data.success) {
        setPlayerStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
    }
  }, []);

  // Place bet
  const placeBet = useCallback(async (side, amount) => {
    if (!userAddress) {
      addNotification({
        type: 'error',
        title: 'Connect Wallet',
        message: 'Please connect your wallet to place a bet',
        duration: 5000
      });
      return;
    }

    setIsLoadingBet(true);
    
    try {
      // For demo purposes, generate a fake tx hash
      const txHash = `0x${Math.random().toString(16).substr(2, 64).padEnd(64, '0')}`;
      
      const response = await battleApi.post('/battle/bet', {
        playerAddress: userAddress,
        betSide: side,
        betAmount: amount,
        txHash: txHash
      });
      
      if (response.data.success) {
        setUserBet({ side, amount });
        
        addNotification({
          type: 'success',
          title: 'Bet Placed!',
          message: `Your ${amount} 0G bet on ${side === 'og' ? '0G Team' : 'Roaster'} has been placed!`,
          duration: 5000
        });
        
        playSound?.('success');
        
        // Reload battle state
        loadCurrentBattle();
      }
    } catch (error) {
      console.error('Failed to place bet:', error);
      
      addNotification({
        type: 'error',
        title: 'Bet Failed',
        message: error.response?.data?.message || 'Failed to place bet. Please try again.',
        duration: 5000
      });
    } finally {
      setIsLoadingBet(false);
    }
  }, [userAddress, loadCurrentBattle, addNotification, playSound]);

  // Setup WebSocket listeners
  useEffect(() => {
    // Join battle room
    wsService.emit('join_battle_room', {});

    // Battle state updates
    wsService.on('battle_state', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎮 Battle state update:', data);
      }
      loadCurrentBattle();
    });

    // Battle created
    wsService.on('battle_created', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎮 New battle created:', data);
      }
      loadCurrentBattle();
      setUserBet(null);
    });

    // Bet placed
    wsService.on('bet_placed', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💰 Bet placed:', data);
      }
      loadCurrentBattle();
    });

    // Countdown updates
    wsService.on('countdown_tick', (data) => {
      setTimeLeft(data.remaining);
    });

    // Dialog updates
    wsService.on('dialog_exchange', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💬 Dialog exchange:', data);
      }
      setDialog(prev => [...prev, data.exchange]);
    });

    // Battle complete
    wsService.on('battle_complete', (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 Battle complete:', data);
      }
      setWinner(data.winner);
      setWinnerReasoning(data.winnerReasoning);
      setBattleStatus('completed');
      
      // Check if user won
      if (userBet && userBet.side === data.winner) {
        addNotification({
          type: 'success',
          title: 'You Won!',
          message: `Congratulations! Your bet on ${data.winner === 'og' ? '0G Team' : 'Roaster'} won!`,
          duration: 10000
        });
        playSound?.('win');
      } else if (userBet) {
        addNotification({
          type: 'info',
          title: 'Battle Complete',
          message: `${data.winner === 'og' ? '0G Team' : 'Roaster'} won this round!`,
          duration: 5000
        });
      }
      
      // Reload history and stats
      loadBattleHistory();
      if (userAddress) {
        loadPlayerStats(userAddress);
      }
    });

    // Cleanup
    return () => {
      wsService.emit('leave_battle_room', {});
      wsService.off('battle_state');
      wsService.off('battle_created');
      wsService.off('bet_placed');
      wsService.off('countdown_tick');
      wsService.off('dialog_exchange');
      wsService.off('battle_complete');
    };
  }, [userAddress, userBet, loadCurrentBattle, loadBattleHistory, loadPlayerStats, addNotification, playSound]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return {
    // Battle state
    currentBattle,
    battleStatus,
    ogCharacter,
    roasterCharacter,
    timeLeft,
    dialog,
    winner,
    winnerReasoning,
    
    // Betting state
    bets,
    totalPot,
    userBet,
    isLoadingBet,
    
    // History
    battleHistory,
    playerStats,
    
    // Actions
    placeBet,
    loadCurrentBattle,
    loadBattleHistory,
    loadPlayerStats
  };
}; 