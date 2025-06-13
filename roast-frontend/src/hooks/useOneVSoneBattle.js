import { useState, useEffect, useCallback } from 'react';
import { battleApi } from '../services/api';
import battleWebSocket from '../services/battleWebSocket';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

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
  // Add wagmi transaction hook
  const { sendTransactionAsync } = useSendTransaction();

  // Battle state
  const [currentBattle, setCurrentBattle] = useState(null);
  const [battleStatus, setBattleStatus] = useState('waiting_bets');
  const [ogCharacter, setOgCharacter] = useState(null);
  const [roasterCharacter, setRoasterCharacter] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dialog, setDialog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [winnerReasoning, setWinnerReasoning] = useState('');
  
  // Extended judgment data
  const [ogScore, setOgScore] = useState(0);
  const [roasterScore, setRoasterScore] = useState(0);
  const [decisiveMoment, setDecisiveMoment] = useState('');
  const [crowdFavorite, setCrowdFavorite] = useState(null);

  // Betting state
  const [bets, setBets] = useState({ og: { count: 0, total: 0, players: [] }, roaster: { count: 0, total: 0, players: [] } });
  const [totalPot, setTotalPot] = useState(0);
  const [userBet, setUserBet] = useState(null);
  const [isLoadingBet, setIsLoadingBet] = useState(false);

  // Configuration state
  const [battleConfig, setBattleConfig] = useState(null);

  // History
  const [battleHistory, setBattleHistory] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);

  // Load battle configuration
  const loadBattleConfig = useCallback(async () => {
    try {
      // Use real config endpoint
      const response = await battleApi.getConfig();
      
      if (response.data.success) {
        setBattleConfig(response.data.data);
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🎯 Battle config loaded:', response.data.data);
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load battle config:', error);
      }
      
      // Fallback to default config
      setBattleConfig({
        betAmount: 0.05, // Match your .env BET_AMOUNT=0.05
        countdownDuration: 90,
        houseFeePercent: 5,
        minBetsToStart: { og: 1, roaster: 1 },
        network: {
          chainId: 16601,
          networkName: '0G-Galileo-Testnet',
          currencySymbol: '0G'
        }
      });
    }
  }, []);

  // Load current battle
  const loadCurrentBattle = useCallback(async () => {
    try {
      const response = await battleApi.getCurrentBattle();
      
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
        setDialog(Array.isArray(battle.dialog) ? battle.dialog : []);
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
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load current battle:', error.response?.data || error.message);
      }
    }
  }, [userAddress]);

  // Load battle history
  const loadBattleHistory = useCallback(async () => {
    try {
      const response = await battleApi.getBattleHistory(20);
      
      if (response.data.success) {
        setBattleHistory(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load battle history:', error);
      }
    }
  }, []);

  // Load player stats
  const loadPlayerStats = useCallback(async (address) => {
    if (!address) return;
    
    try {
      const response = await battleApi.getPlayerStats(address);
      
      if (response.data.success) {
        setPlayerStats(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load player stats:', error);
      }
    }
  }, []);

  // Place bet with real transaction
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
      // Get treasury address from environment - use TREASURY_ADDRESS2 for OneVSone battles
      const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS2;
      if (!treasuryAddress) {
        throw new Error('Battle treasury address not configured (VITE_TREASURY_ADDRESS2)');
      }

      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Placing OneVSone bet transaction:', {
          side,
          amount,
          to: treasuryAddress,
          from: userAddress,
          treasuryType: 'TREASURY_ADDRESS2'
        });
      }

      // Send real transaction to battle treasury
      const txHash = await sendTransactionAsync({
        to: treasuryAddress,
        value: parseEther(amount.toString()),
      });

      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('✅ Battle transaction sent:', txHash);
      }
      
      const response = await battleApi.placeBet({
        playerAddress: userAddress,
        betSide: side,
        betAmount: amount,
        txHash: txHash // Use real transaction hash
      });
      
      if (response.data.success) {
        setUserBet({ side, amount });
        
        addNotification({
          type: 'success',
          title: 'Bet Placed!',
          message: `Your ${amount} 0G bet on ${side === 'og' ? '0G Team' : 'Roaster'} has been placed!`,
          txHash: txHash,
          duration: 5000
        });
        
        playSound?.('success');
        
        // Update battle state
        await loadCurrentBattle();
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('❌ Failed to place bet:', error);
      }
      
      let errorMessage = 'Failed to place bet';
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message?.includes('Battle treasury address not configured')) {
        errorMessage = 'Battle system configuration error';
      }
      
      addNotification({
        type: 'error',
        title: 'Bet Failed',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoadingBet(false);
    }
  }, [userAddress, sendTransactionAsync, addNotification, playSound, loadCurrentBattle]);

  // Initial data loading
  useEffect(() => {
    loadBattleConfig();
    loadCurrentBattle();
    loadBattleHistory();
    if (userAddress) {
      loadPlayerStats(userAddress);
    }
  }, [loadBattleConfig, loadCurrentBattle, loadBattleHistory, loadPlayerStats, userAddress]);

  // Setup Battle WebSocket listeners - only connect once
  useEffect(() => {
    // Connect to battle WebSocket server
    battleWebSocket.connect();

    const handleBattleState = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎮 Battle state update:', data);
      }
      loadCurrentBattle();
    };

    const handleBattleCreated = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎮 New battle created:', data);
      }
      loadCurrentBattle();
      setUserBet(null);
      
      // Reset judgment data
      setWinner(null);
      setWinnerReasoning('');
      setOgScore(0);
      setRoasterScore(0);
      setDecisiveMoment('');
      setCrowdFavorite(null);
      setDialog([]);
    };

    const handleBetPlaced = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💰 Bet placed:', data);
      }
      loadCurrentBattle();
    };

    const handleCountdownStarted = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('⏰ Countdown started:', data);
      }
      if (data.remaining || data.timeLeft) {
        setTimeLeft(data.remaining || data.timeLeft);
      }
      setBattleStatus('countdown');
    };

    const handleCountdownTick = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('⏰ Countdown tick:', data);
      }
      // Handle different countdown data formats
      if (typeof data === 'number') {
        setTimeLeft(data);
      } else if (data.secondsRemaining !== undefined) {
        setTimeLeft(data.secondsRemaining);  // Backend sends this format
      } else if (data.remaining !== undefined) {
        setTimeLeft(data.remaining);
      } else if (data.timeLeft !== undefined) {
        setTimeLeft(data.timeLeft);
      } else if (data.seconds !== undefined) {
        setTimeLeft(data.seconds);
      }
    };

    const handleCountdownComplete = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏁 Countdown complete:', data);
      }
      setTimeLeft(0);
      setBattleStatus('generating');
    };

    const handleDialogReady = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💬 Dialog ready:', data);
      }
      setBattleStatus('dialog');
    };

    const handleDialogExchange = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('💬 Dialog exchange:', data);
      }
      
      if (data.exchange) {
        setDialog(prev => {
          // Ensure prev is always an array
          const currentDialog = Array.isArray(prev) ? prev : [];
          
          // Prevent duplicates by checking if exchange already exists
          const exists = currentDialog.some(ex => 
            ex.speaker === data.exchange.speaker && 
            ex.message === data.exchange.message &&
            currentDialog.length === data.index
          );
          if (!exists) {
            return [...currentDialog, data.exchange];
          }
          return currentDialog;
        });
      }
    };

    const handleBattleComplete = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🏆 Battle complete:', data);
      }
      setWinner(data.winner);
      setWinnerReasoning(data.reasoning || data.winnerReasoning);
      setBattleStatus('completed');
      
      // Set extended judgment data
      setOgScore(data.scores?.ogScore || data.ogScore || 0);
      setRoasterScore(data.scores?.roasterScore || data.roasterScore || 0);
      setDecisiveMoment(data.decisiveMoment || '');
      setCrowdFavorite(data.crowdFavorite || data.winner);
      
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
    };

    const handleConnectionStatus = (data) => {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🎯 Battle WebSocket connection status:', data);
      }
    };

    // Add event listeners
    battleWebSocket.on('battle_state', handleBattleState);
    battleWebSocket.on('battle_created', handleBattleCreated);
    battleWebSocket.on('bet_placed', handleBetPlaced);
    battleWebSocket.on('countdown_started', handleCountdownStarted);
    battleWebSocket.on('countdown_tick', handleCountdownTick);
    battleWebSocket.on('countdown_complete', handleCountdownComplete);
    battleWebSocket.on('dialog_ready', handleDialogReady);
    battleWebSocket.on('dialog_exchange', handleDialogExchange);
    battleWebSocket.on('battle_complete', handleBattleComplete);
    battleWebSocket.on('connection-status', handleConnectionStatus);

    // Cleanup - remove specific handlers and disconnect
    return () => {
      battleWebSocket.off('battle_state', handleBattleState);
      battleWebSocket.off('battle_created', handleBattleCreated);
      battleWebSocket.off('bet_placed', handleBetPlaced);
      battleWebSocket.off('countdown_started', handleCountdownStarted);
      battleWebSocket.off('countdown_tick', handleCountdownTick);
      battleWebSocket.off('countdown_complete', handleCountdownComplete);
      battleWebSocket.off('dialog_ready', handleDialogReady);
      battleWebSocket.off('dialog_exchange', handleDialogExchange);
      battleWebSocket.off('battle_complete', handleBattleComplete);
      battleWebSocket.off('connection-status', handleConnectionStatus);
      
      // Disconnect WebSocket when component unmounts
      battleWebSocket.disconnect();
    };
  }, []); // Empty dependency array - connect only once

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
    
    // Extended judgment data
    ogScore,
    roasterScore,
    decisiveMoment,
    crowdFavorite,
    
    // Betting state
    bets,
    totalPot,
    userBet,
    isLoadingBet,
    
    // Configuration
    battleConfig,
    
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