import React, { useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { GAME_PHASES } from './constants/gameConstants';

// Components
import ParticleEffect from './components/ParticleEffect/ParticleEffect';
import Header from './components/Header/Header';
import JudgeBanner from './components/JudgeBanner/JudgeBanner';
import WritingPhase from './components/WritingPhase/WritingPhase';
import JudgingPhase from './components/JudgingPhase/JudgingPhase';
import ResultsPhase from './components/ResultsPhase/ResultsPhase';
import JudgeModal from './components/JudgeModal/JudgeModal';

const App = () => {
  const containerRef = useRef(null);
  
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
    
    // UI State
    soundEnabled,
    setSoundEnabled,
    showJudgeDetails,
    setShowJudgeDetails,
    isSubmitting,
    showParticles,
    
    // Actions
    joinRound,
    formatTime,
    playSound,
    clearError
  } = useGameState();

  return (
    <>
      <div className="arena-container" ref={containerRef}>
        {/* Particle Effect */}
        <ParticleEffect 
          show={showParticles} 
          color={currentJudge?.color || '#FFD700'} 
        />

        {/* Header */}
        <Header 
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          roundNumber={roundNumber}
          totalParticipants={totalParticipants}
          prizePool={prizePool}
        />

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}

        {/* Main Content */}
        <main className="arena-main">
          {/* Current Judge Display - Always visible */}
          <JudgeBanner 
            currentJudge={currentJudge}
            setShowJudgeDetails={setShowJudgeDetails}
          />

          {/* Phase-specific content */}
          {currentPhase === GAME_PHASES.WRITING && (
            <WritingPhase 
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
            />
          )}

          {currentPhase === GAME_PHASES.JUDGING && (
            <JudgingPhase 
              currentJudge={currentJudge}
              participants={participants}
            />
          )}

          {currentPhase === GAME_PHASES.RESULTS && (
            <ResultsPhase 
              currentJudge={currentJudge}
              winner={winner}
              prizePool={prizePool}
              aiReasoning={aiReasoning}
              roundNumber={roundNumber}
              nextRoundCountdown={nextRoundCountdown}
            />
          )}
        </main>

        {/* Judge Details Modal */}
        <JudgeModal 
          judge={showJudgeDetails}
          onClose={() => setShowJudgeDetails(null)}
        />
      </div>

      <style jsx>{`
        .arena-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0A0A, #1A0A1A, #0A1A0A);
          color: #E6E6E6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .arena-main {
          padding: 30px 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .error-message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: rgba(255, 92, 92, 0.1);
          border: 1px solid rgba(255, 92, 92, 0.3);
          border-radius: 8px;
          color: #FF5C5C;
          margin: 20px;
          font-size: 14px;
        }

        .error-message button {
          background: none;
          border: none;
          color: #FF5C5C;
          cursor: pointer;
          font-size: 18px;
          padding: 0 4px;
        }

        .error-message button:hover {
          opacity: 0.7;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .arena-main {
            padding: 20px 15px;
          }

          .error-message {
            margin: 15px;
          }
        }
      `}</style>
    </>
  );
};

export default App; 