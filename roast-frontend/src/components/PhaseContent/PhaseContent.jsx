import React from 'react';
import { GAME_PHASES } from '../../constants/gameConstants';
import WritingPhase from '../WritingPhase/WritingPhase';
import JudgingPhase from '../JudgingPhase/JudgingPhase';
import ResultsPhase from '../ResultsPhase/ResultsPhase';

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
      <div className="waiting-phase">
        <div className="waiting-content">
          <h2><Target size={24} className="inline-icon" /> Waiting for Players</h2>
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
                <div className="timer"><Clock size={18} className="inline-icon" /> Waiting for 2nd player</div>
                <div className="participants-count"><Users size={16} className="inline-icon" /> {participants.length} roasters joined</div>
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
                  
                  <div className="entry-fee"><DollarSign size={16} className="inline-icon" /> 0.025 0G entry</div>
                </div>
              ) : (
                <div className="submitted-status">
                  <div className="submitted-badge">
                    <div className="trophy-icon"><Trophy size={32} /></div>
                    <h3>Roast Submitted!</h3>
                    <p>Your roast is in the battle. {currentJudge.name} will judge when time runs out.</p>
                  </div>
                </div>
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