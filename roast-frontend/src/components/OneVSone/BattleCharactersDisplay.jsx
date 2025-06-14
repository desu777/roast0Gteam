import React from 'react';
import { Swords, User } from 'lucide-react';

const BattleCharactersDisplay = ({ 
  phaseTransition,
  ogCharacter,
  roasterCharacter,
  winner,
  currentJudge,
  handleShowBio,
  battleStatus,
  timeLeft,
  formatTime
}) => {
  
  const getStatusMessage = () => {
    const judgeColor = currentJudge?.color || '#FFD700';
    
    switch (battleStatus) {
      case 'waiting_bets':
        return 'Place your bets! Battle starts when minimum bets are reached.';
      case 'countdown':
        return timeLeft > 0 ? (
          <>
            Battle starting in{' '}
            <span 
              className="countdown-time"
              style={{
                color: judgeColor,
                fontWeight: '900',
                fontSize: '18px',
                textShadow: `0 0 10px ${judgeColor}, 0 0 20px ${judgeColor}40`,
                animation: timeLeft <= 10 ? 'countdown-pulse 1s ease-in-out infinite' : 'countdown-glow 2s ease-in-out infinite alternate'
              }}
            >
              {formatTime(timeLeft)}
            </span>
            
          </>
        ) : 'Battle countdown in progress...';
      case 'generating':
        return 'AI is preparing an epic roast battle...';
      case 'dialog':
        return 'Battle in progress! Watch the roasts fly!';
      case 'completed':
        const winnerName = winner === 'og' ? ogCharacter?.name : roasterCharacter?.name;
        return (
          <>
            Battle complete!{' '}
            <span 
              className="winner-name"
              style={{
                color: judgeColor,
                fontWeight: '900',
                textShadow: `0 0 10px ${judgeColor}`,
                animation: 'winner-glow 1.5s ease-in-out infinite alternate'
              }}
            >
              {winnerName}
            </span>
            {' '}wins!
          </>
        );
      default:
        return 'Waiting for next battle...';
    }
  };

  return (
    <div className={`characters-display ${phaseTransition}`}>
      {/* Status Message */}
      <div 
        className="characters-status-message"
        style={{
          '--border-angle': '0turn',
          '--judge-color': currentJudge?.color || '#FFD700',
          '--judge-color-light': currentJudge?.color ? `${currentJudge.color}99` : '#FFD70099',
          '--judge-color-dark': currentJudge?.color ? `${currentJudge.color}DD` : '#FFD700DD',
          '--main-bg': `conic-gradient(
            from var(--border-angle),
            rgba(18, 18, 24, 0.9),
            rgba(18, 18, 24, 0.6) 5%,
            rgba(18, 18, 24, 0.6) 60%,
            rgba(18, 18, 24, 0.9) 95%
          )`,
          '--gradient-border': `conic-gradient(
            from var(--border-angle), 
            transparent 20%, 
            var(--judge-color-light) 40%,
            var(--judge-color) 50%,
            var(--judge-color-dark) 60%, 
            transparent 80%
          )`,
          border: 'solid 3px transparent',
          borderRadius: '12px',
          background: `
            var(--main-bg) padding-box,
            var(--gradient-border) border-box,
            var(--main-bg) border-box
          `,
          backgroundPosition: 'center center',
          animation: 'laser-spin 4s ease-in-out infinite'
        }}
      >
        <span className="status-white-text">{getStatusMessage()}</span>
      </div>

      {/* Characters Row */}
      <div className="characters-row">
        <div className={`character-card og-card ${winner === 'og' ? 'winner' : ''}`}>
        <div className="character-icon" style={{ 
            color: ogCharacter?.color,
            border: `3px solid ${currentJudge?.color || '#FFD700'}`,
            boxShadow: `0 0 15px ${currentJudge?.color || '#FFD700'}40`
          }}>
          {ogCharacter?.id ? (
            <img 
              src={`/${ogCharacter.id}.jpg`} 
              alt={ogCharacter.name} 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="fallback-icon" 
            style={{ display: ogCharacter?.id ? 'none' : 'flex' }}
          >
            {ogCharacter?.name?.[0] || '?'}
          </div>
        </div>
        <h3>{ogCharacter?.name || 'Selecting...'}</h3>
        <p>{ogCharacter?.role || '0G Team'}</p>
        {ogCharacter?.id && (
          <button 
            className="bio-btn-17"
            onClick={() => handleShowBio(ogCharacter, 'og')}
            style={{
              borderColor: currentJudge?.color || '#FFD700',
              '--judge-color': currentJudge?.color || '#FFD700'
            }}
          >
            <span className="text-container">
              <span className="text">
                <User size={14} />
                View Bio
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="vs-divider">
        <Swords 
          size={40} 
          className="vs-icon" 
          style={{ color: currentJudge?.color || '#FFD700' }}
        />
        <span className="vs-gradient-text">VS</span>
      </div>

      <div className={`character-card roaster-card ${winner === 'roaster' ? 'winner' : ''}`}>
        <div className="character-icon" style={{ 
            color: roasterCharacter?.color,
            border: `3px solid ${currentJudge?.color || '#FFD700'}`,
            boxShadow: `0 0 15px ${currentJudge?.color || '#FFD700'}40`
          }}>
          <img src={`/avatars/${roasterCharacter?.id || 'default'}.png`} 
               alt={roasterCharacter?.name}
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'block';
               }}
          />
          <div className="fallback-icon" style={{ display: 'none' }}>
            {roasterCharacter?.name?.[0] || '?'}
          </div>
        </div>
        <h3>{roasterCharacter?.name || 'Selecting...'}</h3>
        <p>{roasterCharacter?.role || 'Crypto Roaster'}</p>
        {roasterCharacter?.id && (
          <button 
            className="bio-btn-17"
            onClick={() => handleShowBio(roasterCharacter, 'roaster')}
            style={{
              borderColor: currentJudge?.color || '#FFD700',
              '--judge-color': currentJudge?.color || '#FFD700'
            }}
          >
            <span className="text-container">
              <span className="text">
                <User size={14} />
                View Bio
              </span>
            </span>
          </button>
        )}
      </div>
      </div>
    </div>
  );
};

export default BattleCharactersDisplay; 