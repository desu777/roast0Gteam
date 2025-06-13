import React from 'react';

const BattleResultsFullscreen = ({ 
  phaseTransition,
  winner,
  ogCharacter,
  roasterCharacter,
  ogScore,
  roasterScore,
  winnerReasoning,
  decisiveMoment,
  getCharacterAvatar
}) => {
  return (
    <div className={`battle-results-fullscreen ${phaseTransition}`}>
      <div className="ai-question">
        <span className="status-gradient-text">"Who won this battle?"</span>
      </div>
      
      <div className="winner-reveal">
        <div className="winner-character">
          <div className="winner-avatar">
            {getCharacterAvatar(
              winner === 'og' ? ogCharacter : roasterCharacter, 
              winner
            ) ? (
              <img 
                src={getCharacterAvatar(
                  winner === 'og' ? ogCharacter : roasterCharacter, 
                  winner
                )} 
                alt={winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} 
              />
            ) : (
              <span>
                {(winner === 'og' ? ogCharacter?.name : roasterCharacter?.name)?.[0] || '?'}
              </span>
            )}
          </div>
          <h2>{winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} Wins!</h2>
        </div>
        
        <div className="battle-scores">
          <div className="score-item og-score">
            <span className="score-label">{ogCharacter?.name}</span>
            <span className="score-value">{ogScore}</span>
          </div>
          <div className="score-divider">VS</div>
          <div className="score-item roaster-score">
            <span className="score-label">{roasterCharacter?.name}</span>
            <span className="score-value">{roasterScore}</span>
          </div>
        </div>
        
        <div className="ai-reasoning">
          <h3>Judge's Reasoning</h3>
          <p>{winnerReasoning}</p>
          {decisiveMoment && (
            <div className="decisive-moment">
              <strong>Decisive Moment:</strong> 
              <span>"{decisiveMoment}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleResultsFullscreen; 