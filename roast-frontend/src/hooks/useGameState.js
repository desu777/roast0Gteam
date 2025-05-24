import { useState, useEffect } from 'react';
import { GAME_PHASES, AI_REASONINGS } from '../constants/gameConstants';
import { TEAM_MEMBERS } from '../data/teamMembers';

export const useGameState = () => {
  // Game State
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.WAITING);
  const [currentJudge, setCurrentJudge] = useState(null);
  const [roastText, setRoastText] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [winner, setWinner] = useState(null);
  const [aiReasoning, setAiReasoning] = useState('');
  const [prizePool, setPrizePool] = useState(2.375); // Starting pool
  const [totalParticipants, setTotalParticipants] = useState(95); // Simulated global participants
  
  // UI State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showJudgeDetails, setShowJudgeDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [roundNumber, setRoundNumber] = useState(247);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(0);

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${type}`);
  };

  // Connect wallet simulation
  const connectWallet = () => {
    setIsConnected(true);
    playSound('connect');
  };

  // Random judge selection
  const selectRandomJudge = () => {
    const randomJudge = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
    setCurrentJudge(randomJudge);
    playSound('select');
    return randomJudge;
  };

  // Start new round
  const startNewRound = () => {
    const newJudge = selectRandomJudge();
    setCurrentPhase(GAME_PHASES.WRITING);
    setTimeLeft(120);
    setParticipants([]);
    setWinner(null);
    setAiReasoning('');
    setUserSubmitted(false);
    setPrizePool(prev => prev + Math.random() * 0.5 + 0.1); // Pool grows
    setTotalParticipants(prev => prev + Math.floor(Math.random() * 10) + 3);
    playSound('start');
  };

  // Join round
  const joinRound = async () => {
    if (!isConnected || !roastText.trim() || isSubmitting || userSubmitted) return;
    
    setIsSubmitting(true);
    playSound('join');
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newParticipant = {
      address: `0x${Math.random().toString(16).substr(2, 8)}`,
      roast: roastText,
      timestamp: Date.now(),
      isUser: true
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    setPrizePool(prev => prev + 0.025);
    setRoastText('');
    setIsSubmitting(false);
    setUserSubmitted(true);
  };

  // Add simulated participants
  const addSimulatedParticipants = () => {
    const numberOfParticipants = Math.floor(Math.random() * 8) + 3; // 3-10 participants
    const newParticipants = [];
    
    for (let i = 0; i < numberOfParticipants; i++) {
      newParticipants.push({
        address: `0x${Math.random().toString(16).substr(2, 8)}`,
        roast: `Simulated roast #${i + 1}`,
        timestamp: Date.now() + i * 1000,
        isUser: false
      });
    }
    
    setParticipants(prev => [...prev, ...newParticipants]);
    setPrizePool(prev => prev + (numberOfParticipants * 0.025));
  };

  // Generate AI reasoning based on judge personality
  const generateAIReasoning = (judge, winner) => {
    const judgeReasons = AI_REASONINGS[judge.id] || AI_REASONINGS.michael;
    return judgeReasons[Math.floor(Math.random() * judgeReasons.length)];
  };

  // AI judging simulation
  const judgeRoasts = () => {
    const allParticipants = [...participants];
    const randomWinner = allParticipants[Math.floor(Math.random() * allParticipants.length)];
    const reasoning = generateAIReasoning(currentJudge, randomWinner);
    
    setWinner(randomWinner);
    setAiReasoning(reasoning);
    setCurrentPhase(GAME_PHASES.RESULTS);
    setShowParticles(true);
    playSound('winner');
    
    // Start countdown for next round
    setNextRoundCountdown(15);
    
    setTimeout(() => setShowParticles(false), 5000);
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize first round
  useEffect(() => {
    startNewRound();
  }, []);

  // Timer effect for writing phase
  useEffect(() => {
    if (currentPhase === GAME_PHASES.WRITING && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Add simulated participants before judging
            addSimulatedParticipants();
            setCurrentPhase(GAME_PHASES.JUDGING);
            setTimeout(judgeRoasts, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, timeLeft]);

  // Next round countdown
  useEffect(() => {
    if (nextRoundCountdown > 0) {
      const timer = setTimeout(() => {
        setNextRoundCountdown(prev => {
          if (prev <= 1) {
            setRoundNumber(prev => prev + 1);
            startNewRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [nextRoundCountdown]);

  return {
    // Game State
    currentPhase,
    currentJudge,
    roastText,
    setRoastText,
    timeLeft,
    participants,
    isConnected,
    winner,
    aiReasoning,
    prizePool,
    totalParticipants,
    roundNumber,
    userSubmitted,
    nextRoundCountdown,
    
    // UI State
    soundEnabled,
    setSoundEnabled,
    showJudgeDetails,
    setShowJudgeDetails,
    isSubmitting,
    showParticles,
    
    // Actions
    connectWallet,
    joinRound,
    formatTime,
    playSound
  };
}; 