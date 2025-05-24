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
          isConnected={isConnected}
          connectWallet={connectWallet}
          roundNumber={roundNumber}
          totalParticipants={totalParticipants}
          prizePool={prizePool}
        />

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

        /* Responsive Design */
        @media (max-width: 768px) {
          .arena-main {
            padding: 20px 15px;
          }
        }
      `}</style>
    </>
  );
};

export default App; 