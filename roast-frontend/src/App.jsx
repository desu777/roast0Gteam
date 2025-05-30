import React, { useRef, useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { GAME_PHASES } from './constants/gameConstants';
import { gameApi } from './services/api';

// Components
import GameEffects from './components/GameEffects/GameEffects';
import Header from './components/Header/Header';
import GameLayout from './components/GameLayout/GameLayout';
import JudgeModal from './components/JudgeModal/JudgeModal';
import TransactionNotification from './components/TransactionNotification/TransactionNotification';
import Footer from './components/Footer/Footer';

// Styles
import { globalStyles, appStyles } from './styles/appStyles';

const App = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Hook do sprawdzania szerokości ekranu
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
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
    error,
    notifications,
    userAddress,
    
    // Voting State - LIVE SYSTEM
    votingStats,
    userVote,
    votingLocked,
    isVoting,
    votingError,
    
    // UI State
    soundEnabled,
    setSoundEnabled,
    showJudgeDetails,
    setShowJudgeDetails,
    isSubmitting,
    showParticles,
    showFireEffect,
    
    // Actions
    joinRound,
    formatTime,
    playSound,
    clearError,
    addNotification,
    removeNotification,
    
    // Voting Actions - LIVE SYSTEM
    castVote,
    loadVotingStats,
    resetVotingState
  } = useGameState();

  // Legacy voting complete handler (will be replaced by WebSocket events)
  const handleVotingComplete = async (winnerCharacterId, totalVotes = 0) => {
    console.log('🗳️ Legacy voting complete handler:', { winnerCharacterId, totalVotes });
    
    // Note: This will now be handled by backend WebSocket events
    // Keeping for backward compatibility during transition
    try {
      console.log('Voting completed:', { winnerCharacterId, totalVotes });
      
      const response = await gameApi.submitVotingResult(winnerCharacterId, totalVotes);
      
      if (response.data.success) {
        addNotification({
          type: 'success',
          title: 'Voting Result Submitted',
          message: `${response.data.data.nextJudge} will judge the next round!`,
          duration: 5000
        });
        
        playSound?.('success');
      }
    } catch (error) {
      console.error('Failed to submit voting result:', error);
      addNotification({
        type: 'error',
        title: 'Voting Failed',
        message: 'Failed to submit voting result. Using random selection.',
        duration: 5000
      });
    }
  };

  return (
    <>
      <div className="arena-container" ref={containerRef}>
        {/* Game Effects */}
        <GameEffects 
          showParticles={showParticles}
          showFireEffect={showFireEffect}
          currentJudge={currentJudge}
        />

        {/* Header */}
        <Header 
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          roundNumber={roundNumber}
          currentPlayerCount={participants.length}
          prizePool={prizePool}
        />

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}

        {/* Main Game Layout */}
        <GameLayout 
          // Game State
          currentPhase={currentPhase}
                  currentJudge={currentJudge}
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  participants={participants}
                  roastText={roastText}
                  setRoastText={setRoastText}
                  userSubmitted={userSubmitted}
                  isSubmitting={isSubmitting}
                  isConnected={isConnected}
                  joinRound={joinRound}
          prizePool={prizePool}
                  winner={winner}
                  aiReasoning={aiReasoning}
                  roundNumber={roundNumber}
                  nextRoundCountdown={nextRoundCountdown}
          userAddress={userAddress}
          
          // Voting State
                  votingStats={votingStats}
                  userVote={userVote}
                  votingLocked={votingLocked}
                  isVoting={isVoting}
                  votingError={votingError}
                  
          // Actions
          setShowJudgeDetails={setShowJudgeDetails}
          castVote={castVote}
          handleVotingComplete={handleVotingComplete}
                />

        {/* Judge Details Modal */}
        <JudgeModal 
          judge={showJudgeDetails}
          onClose={() => setShowJudgeDetails(null)}
        />
        
        {/* Transaction Notifications */}
        {notifications.map(notification => (
          <TransactionNotification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}

        {/* Footer */}
        <Footer />
      </div>

      {/* Global Styles */}
      <style jsx global>{globalStyles}</style>

      {/* App Styles */}
      <style jsx>{appStyles}</style>
    </>
  );
};

export default App; 