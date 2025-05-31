import React from 'react';
import { GAME_PHASES } from '../../constants/gameConstants';
import WritingPhase from '../WritingPhase/WritingPhase';
import JudgingPhase from '../JudgingPhase/JudgingPhase';
import ResultsPhase from '../ResultsPhase/ResultsPhase';
import BurningRoastEffect from '../BurningRoastEffect/BurningRoastEffect';

// Lucide React Icons
import { Target, Clock, Users, Flame, Loader, DollarSign, Trophy } from 'lucide-react';

const PhaseContent = ({
  currentPhase,
  currentJudge,
  timeLeft,
  formatTime,
  participants,
  roastText,
  setRoastText,
  userSubmitted,
  isSubmitting,
  isConnected,
  joinRound,
  prizePool,
  winner,
  aiReasoning,
  roundNumber,
  nextRoundCountdown
}) => {
  // WAITING Phase
  if (currentPhase === GAME_PHASES.WAITING) {
    return (
      <>
        <div className="waiting-phase">
          <div className="waiting-content">
            <h2><Target size={24} className="inline-icon" /> Waiting for Players</h2>
            <p>A new round is starting soon! Get ready to roast the 0G team!</p>
            <div className="waiting-stats">
              <div className="stat">
                <span className="stat-label">Prize Pool:</span>
                <span className="stat-value gradient-text">{prizePool.toFixed(3)} 0G</span>
              </div>
              <div className="stat">
                <span className="stat-label">Entry Fee:</span>
                <span className="stat-value gradient-text">0.025 0G</span>
              </div>
            </div>
            
            {/* Formularz do roasta - tak jak w fazie WRITING */}
            {isConnected && currentJudge && (
              <div className="roast-form">
                <div className="timer-section">
                  <div className="timer"><Clock size={18} className="inline-icon gradient-icon" /> <span className="gradient-text">Waiting for 2nd player</span></div>
                  <div className="participants-count"><Users size={16} className="inline-icon gradient-icon" /> <span className="gradient-text">{participants.length} roasters joined</span></div>
                </div>
                
                {!userSubmitted ? (
                  <div className="roast-section">
                    <h3><Flame size={20} className="inline-icon" /> Roast the 0G Team for {currentJudge.name}!</h3>
                    
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
                      {isSubmitting ? (
                        <>
                          <Loader size={16} className="inline-icon spinning" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Flame size={16} className="inline-icon" /> Submit your roast!
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <BurningRoastEffect 
                    currentJudge={currentJudge}
                    participants={participants}
                  />
                )}
              </div>
            )}
            
            {!isConnected && (
              <div className="connect-prompt">
                <p>Connect your wallet to join the round!</p>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .waiting-phase {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }

          .waiting-content {
            text-align: center;
          }

          .waiting-content h2 {
            color: #E6E6E6;
            font-size: 28px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }

          .waiting-content p {
            color: #B0B0B0;
            font-size: 18px;
            margin-bottom: 30px;
          }

          .waiting-stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 40px;
          }

          .stat {
            text-align: center;
          }

          .stat-label {
            display: block;
            color: #9999A5;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: 600;
          }

          .stat-value:not(.gradient-text) {
            color: var(--theme-primary, #FFD700);
          }

          .gradient-text {
            background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientFlow 3s linear infinite;
            font-weight: 600;
          }

          .gradient-icon {
            color: #00D2E9;
            animation: iconColorFlow 3s linear infinite;
          }

          @keyframes iconColorFlow {
            0% { color: #00D2E9; }
            33% { color: #FF5CAA; }
            66% { color: #FFD700; }
            100% { color: #00D2E9; }
          }

          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }

          .roast-form {
            max-width: 600px;
            margin: 0 auto;
          }

          .timer-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(18, 18, 24, 0.9);
            border-radius: 12px;
            border: 1px solid rgba(60, 75, 95, 0.3);
          }

          .timer {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #E6E6E6;
            font-size: 16px;
          }

          .participants-count {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #E6E6E6;
            font-size: 16px;
          }

          .roast-section h3 {
            color: #E6E6E6;
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .roast-input {
            position: relative;
            margin-bottom: 20px;
          }

          .roast-input textarea {
            width: 100%;
            min-height: 120px;
            padding: 16px;
            border: 2px solid rgba(60, 75, 95, 0.3);
            border-radius: 12px;
            background: rgba(18, 18, 24, 0.9);
            color: #E6E6E6;
            font-size: 16px;
            resize: vertical;
            font-family: inherit;
          }

          .roast-input textarea:focus {
            outline: none;
            border-color: var(--theme-primary, #FFD700);
          }

          .char-count {
            position: absolute;
            bottom: 8px;
            right: 12px;
            color: #9999A5;
            font-size: 12px;
          }

          .submit-button {
            width: 100%;
            padding: 16px;
            background: var(--theme-primary, #FFD700);
            border: none;
            border-radius: 12px;
            color: #1A1A1A;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
            transition: all 0.3s ease;
          }

          .submit-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .submit-button:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
          }

          .connect-prompt {
            text-align: center;
            padding: 40px;
            color: #9999A5;
            font-size: 18px;
          }

          .inline-icon {
            display: inline;
            vertical-align: middle;
          }

          .spinning {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // WRITING Phase
  if (currentPhase === GAME_PHASES.WRITING) {
    return (
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
    );
  }

  // JUDGING Phase
  if (currentPhase === GAME_PHASES.JUDGING) {
    return (
      <JudgingPhase 
        currentJudge={currentJudge}
        participants={participants}
      />
    );
  }

  // RESULTS Phase
  if (currentPhase === GAME_PHASES.RESULTS) {
    return (
      <ResultsPhase 
        currentJudge={currentJudge}
        winner={winner}
        prizePool={prizePool}
        aiReasoning={aiReasoning}
        roundNumber={roundNumber}
        nextRoundCountdown={nextRoundCountdown}
      />
    );
  }

  return null;
};

export default PhaseContent; 