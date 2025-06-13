import React from 'react';
import { Swords, User } from 'lucide-react';

const BattleCharactersDisplay = ({ 
  phaseTransition,
  ogCharacter,
  roasterCharacter,
  winner,
  currentJudge,
  handleShowBio
}) => {
  return (
    <div className={`characters-display ${phaseTransition}`}>
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
  );
};

export default BattleCharactersDisplay; 