import React, { useRef, useState, useEffect } from 'react';
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
import TransactionNotification from './components/TransactionNotification/TransactionNotification';
import Footer from './components/Footer/Footer';
import FireEffect from './components/FireEffect/FireEffect';
import RecentWinners from './components/RecentWinners/RecentWinners';

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
    removeNotification
  } = useGameState();

  return (
    <>
      <div className="arena-container" ref={containerRef}>
        {/* Particle Effect */}
        <ParticleEffect 
          show={showParticles} 
          color={currentJudge?.color || '#FFD700'} 
        />

        {/* Fire Effect */}
        <FireEffect show={showFireEffect} />

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

        {/* Main Content */}
        <main className="arena-main">
          {/* Current Judge Display - Always visible */}
          <JudgeBanner 
            currentJudge={currentJudge}
            setShowJudgeDetails={setShowJudgeDetails}
          />

          {/* Recent Winners Panel - tylko na desktop */}
          {!isMobile && <RecentWinners />}

          {/* Phase-specific content */}
          {currentPhase === GAME_PHASES.WAITING && (
            <div className="waiting-phase">
              <div className="waiting-content">
                <h2>🎯 Waiting for Players</h2>
                <p>A new round is starting soon! Get ready to roast the 0G team!</p>
                <div className="waiting-stats">
                  <div className="stat">
                    <span className="stat-label">Prize Pool:</span>
                    <span className="stat-value">{prizePool.toFixed(3)} 0G</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Entry Fee:</span>
                    <span className="stat-value">0.025 0G</span>
                  </div>
                </div>
                
                {/* Formularz do roasta - tak jak w fazie WRITING */}
                {isConnected && currentJudge && (
                  <div className="roast-form">
                    <div className="timer-section">
                      <div className="timer">⏱️ Waiting for 2nd player</div>
                      <div className="participants-count">👥 {participants.length} roasters joined</div>
                    </div>
                    
                    {!userSubmitted ? (
                      <div className="roast-section">
                        <h3>🔥 Roast the 0G Team for {currentJudge.name}!</h3>
                        
                        <div className="roast-input">
                          <textarea
                            value={roastText}
                            onChange={(e) => setRoastText(e.target.value)}
                            placeholder={`Write your best roast for ${currentJudge.name} to judge...`}
                            maxLength={280}
                            disabled={userSubmitted || isSubmitting}
                          />
                          <div className="char-count">{roastText.length}/280</div>
                        </div>
                        
                        <button
                          className="submit-button"
                          onClick={joinRound}
                          disabled={!roastText.trim() || userSubmitted || isSubmitting}
                        >
                          {isSubmitting ? '⏳ Submitting...' : '🔥 Submit your roast!'}
                        </button>
                        
                        <div className="entry-fee">💰 0.025 0G entry</div>

                        {/* Recent Winners na mobile - po submit button */}
                        {isMobile && <RecentWinners />}
                      </div>
                    ) : (
                      <div className="submitted-status">
                        <div className="submitted-badge">
                          <div className="trophy-icon">🏆</div>
                          <h3>Roast Submitted!</h3>
                          <p>Your roast is in the battle. {currentJudge.name} will judge when time runs out.</p>
                        </div>

                        {/* Recent Winners na mobile - po submitted status */}
                        {isMobile && <RecentWinners />}
                      </div>
                    )}
                  </div>
                )}
                
                {!isConnected && (
                  <div className="connect-prompt">
                    <p>Connect your wallet to join the round!</p>
                  </div>
                )}

                {/* Recent Winners na mobile - gdy nie połączony */}
                {!isConnected && isMobile && <RecentWinners />}
              </div>
            </div>
          )}

          {currentPhase === GAME_PHASES.WRITING && (
            <>
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
              {/* Recent Winners na mobile - po WritingPhase */}
              {isMobile && <RecentWinners />}
            </>
          )}

          {currentPhase === GAME_PHASES.JUDGING && (
            <>
              <JudgingPhase 
                currentJudge={currentJudge}
                participants={participants}
              />
              {/* Recent Winners na mobile - po JudgingPhase */}
              {isMobile && <RecentWinners />}
            </>
          )}

          {currentPhase === GAME_PHASES.RESULTS && (
            <>
              <ResultsPhase 
                currentJudge={currentJudge}
                winner={winner}
                prizePool={prizePool}
                aiReasoning={aiReasoning}
                roundNumber={roundNumber}
                nextRoundCountdown={nextRoundCountdown}
              />
              {/* Recent Winners na mobile - po ResultsPhase */}
              {isMobile && <RecentWinners />}
            </>
          )}
        </main>

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

      <style jsx global>{`
        /* Global scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.8);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(60, 75, 95, 0.6);
          border-radius: 4px;
          border: 1px solid rgba(40, 50, 65, 0.8);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(80, 95, 115, 0.8);
        }

        ::-webkit-scrollbar-corner {
          background: rgba(30, 30, 40, 0.8);
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(60, 75, 95, 0.6) rgba(30, 30, 40, 0.8);
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%);
          color: #E6E6E6;
          min-height: 100vh;
        }
      `}</style>

      <style jsx>{`
        .arena-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0A0A, #1A0A1A, #0A1A0A);
          color: #E6E6E6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .arena-main {
          padding: 30px 20px;
          max-width: 1000px;
          margin: 0 auto;
          flex: 1;
          position: relative;
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

        .waiting-phase {
          text-align: center;
          padding: 40px 20px;
        }

        .waiting-content h2 {
          color: #FFD700;
          margin-bottom: 16px;
          font-size: 28px;
        }

        .waiting-content p {
          color: #B0B0B0;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .waiting-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 32px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .stat-label {
          color: #888;
          font-size: 14px;
        }

        .stat-value {
          color: #FFD700;
          font-size: 18px;
          font-weight: 600;
        }

        .connect-prompt {
          padding: 20px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          color: #FFD700;
        }

        .roast-form {
          margin-top: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .timer-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .timer {
          color: #FFD700;
          font-size: 18px;
          font-weight: 600;
        }

        .participants-count {
          color: #00D2E9;
          font-size: 14px;
        }

        .roast-section h3 {
          color: #FF6B6B;
          text-align: center;
          margin-bottom: 16px;
          font-size: 24px;
        }

        .judge-style {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          color: #E6E6E6;
          font-size: 14px;
          line-height: 1.4;
        }

        .roast-input {
          position: relative;
          margin-bottom: 20px;
        }

        .roast-input textarea {
          width: 100%;
          min-height: 120px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #E6E6E6;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s ease;
        }

        .roast-input textarea:focus {
          outline: none;
          border-color: #FFD700;
        }

        .roast-input textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Custom scrollbar dla textarea */
        .roast-input textarea::-webkit-scrollbar {
          width: 8px;
        }

        .roast-input textarea::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.8);
          border-radius: 4px;
        }

        .roast-input textarea::-webkit-scrollbar-thumb {
          background: rgba(60, 75, 95, 0.6);
          border-radius: 4px;
          border: 1px solid rgba(40, 50, 65, 0.8);
        }

        .roast-input textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(80, 95, 115, 0.8);
        }

        .char-count {
          position: absolute;
          bottom: 8px;
          right: 12px;
          color: #888;
          font-size: 12px;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #FF5252, #FF7979);
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .submitted-status {
          text-align: center;
          padding: 40px 20px;
        }

        .submitted-badge {
          background: rgba(0, 184, 151, 0.1);
          border: 2px solid #00B897;
          border-radius: 20px;
          padding: 30px;
          max-width: 400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .trophy-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .submitted-badge h3 {
          color: #00B897;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .submitted-badge p {
          color: #9999A5;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .entry-fee {
          text-align: center;
          color: #FFD700;
          font-size: 14px;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .arena-main {
            padding: 20px 15px;
          }

          .error-message {
            margin: 15px;
          }

          .waiting-stats {
            flex-direction: column;
            gap: 20px;
          }

          .timer-section {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .roast-form {
            margin-top: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default App; 