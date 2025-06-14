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
  getCharacterAvatar,
  currentJudge
}) => {
  const judgeColor = currentJudge?.color || '#FFD700';
  const judgeColorLight = currentJudge?.color ? `${currentJudge.color}66` : '#FFD70066';
  const judgeColorDark = currentJudge?.color ? `${currentJudge.color}CC` : '#FFD700CC';
  
  if (import.meta.env.VITE_TEST_ENV === 'true') {
    console.log('🏆 BattleResultsFullscreen props:', { 
      ogScore, 
      roasterScore, 
      winner, 
      winnerReasoning,
      ogCharacter: ogCharacter?.name,
      roasterCharacter: roasterCharacter?.name
    });
  }
  
  return (
    <div className={`battle-results-fullscreen ${phaseTransition}`}>

      
      <div className="winner-reveal">
        <div className="winner-character">
          <div 
            className="winner-avatar"
            style={{
              borderColor: judgeColor,
              boxShadow: `0 0 20px ${judgeColorLight}`
            }}
          >
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
          <h2 style={{ color: judgeColor }}>
            {winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} Wins!
          </h2>
        </div>
        
                          <div 
          className="battle-scores"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            margin: '24px auto',
            maxWidth: '400px',
            width: '100%'
          }}
        >
            <div 
              className="score-item og-score"
              style={{ 
                minWidth: '120px', 
                maxWidth: '120px',
                flex: '0 0 120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px 8px'
              }}
            >
              <span className="score-label">{(ogCharacter?.name || 'OG').toUpperCase()}</span>
              <span className="score-value">{ogScore || 0}</span>
            </div>
            <div className="score-divider" style={{ 
              color: judgeColor, 
              minWidth: '40px',
              maxWidth: '40px',
              flex: '0 0 40px',
              fontWeight: '900',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>VS</div>
            <div 
              className="score-item roaster-score"
              style={{ 
                minWidth: '120px', 
                maxWidth: '120px',
                flex: '0 0 120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px 8px'
              }}
            >
              <span className="score-label">{(roasterCharacter?.name || 'ROASTER').toUpperCase()}</span>
              <span className="score-value">{roasterScore || 0}</span>
            </div>
          </div>
        
        <div className="ai-reasoning">
          <h3 style={{ color: judgeColor }}>Judge's Reasoning</h3>
          <p>{winnerReasoning || 'No reasoning provided.'}</p>
          {decisiveMoment && (
            <div 
              className="decisive-moment"
              style={{ borderLeftColor: judgeColor }}
            >
              <strong style={{ color: judgeColor }}>Decisive Moment:</strong> 
              <span>"{decisiveMoment}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleResultsFullscreen; 