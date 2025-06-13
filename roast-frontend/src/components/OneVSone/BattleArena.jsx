import React, { useState, useEffect, useRef } from 'react';
import { Clock, Swords, Trophy, Landmark, User } from 'lucide-react';
import { TEAM_MEMBERS } from '../../data/teamMembers';
import { TEAM_ROASTERS } from '../../data/teamRoasters';
import CharacterBioModal from '../CharacterBioModal/CharacterBioModal';
import BattleDialog from './BattleDialog';

const BattleArena = ({ 
  currentBattle,
  battleStatus,
  ogCharacter,
  roasterCharacter,
  timeLeft,
  formatTime,
  dialog,
  winner,
  winnerReasoning,
  currentJudge
}) => {
  const [showCharacterBio, setShowCharacterBio] = useState(null);
  const [bioCharacterType, setBioCharacterType] = useState('og');

  const getStatusMessage = () => {
    switch (battleStatus) {
      case 'waiting_bets':
        return 'Place your bets! Battle starts when minimum bets are reached.';
      case 'countdown':
        return `Battle starting in ${formatTime(timeLeft)}!`;
      case 'generating':
        return 'AI is preparing an epic roast battle...';
      case 'dialog':
        return 'Battle in progress! Watch the roasts fly!';
      case 'completed':
        return `Battle complete! ${winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} wins!`;
      default:
        return 'Waiting for next battle...';
    }
  };

  // Helper functions to get character bio data
  const getOGCharacterBio = (characterId) => {
    return TEAM_MEMBERS.find(member => member.id === characterId);
  };

  const getRoasterCharacterBio = (characterId) => {
    return TEAM_ROASTERS.find(roaster => roaster.id === characterId);
  };

  const handleShowBio = (character, type) => {
    let bioData = null;
    if (type === 'og') {
      bioData = getOGCharacterBio(character.id);
    } else {
      bioData = getRoasterCharacterBio(character.id);
    }
    
    if (bioData) {
      setShowCharacterBio(bioData);
      setBioCharacterType(type);
    }
  };

  return (
    <>
      <div className="battle-arena">
        {/* Title */}
        <div className="arena-title">
          <h2>
            <Landmark 
              className="arena-icon" 
              style={{ color: currentJudge?.color || '#FFD700' }}
            />
            <span className="gradient-text">Battle Arena</span>
          </h2>
          <p className="status-message">{getStatusMessage()}</p>
        </div>

        {/* Characters VS Display */}
        <div className="characters-display">
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
                className="bio-btn og-bio-btn"
                onClick={() => handleShowBio(ogCharacter, 'og')}
                style={{
                  borderColor: currentJudge?.color || '#FFD700',
                  color: currentJudge?.color || '#FFD700'
                }}
              >
                <User size={14} />
                <span>View Bio</span>
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
                className="bio-btn roaster-bio-btn"
                onClick={() => handleShowBio(roasterCharacter, 'roaster')}
                style={{
                  borderColor: currentJudge?.color || '#FFD700',
                  color: currentJudge?.color || '#FFD700'
                }}
              >
                <User size={14} />
                <span>View Bio</span>
              </button>
            )}
          </div>
        </div>

        {/* Timer */}
        {timeLeft > 0 && battleStatus === 'countdown' && (
          <div className="countdown-timer">
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Battle Dialog Component */}
        <BattleDialog 
          dialog={dialog}
          battleStatus={battleStatus}
          ogCharacter={ogCharacter}
          roasterCharacter={roasterCharacter}
          currentJudge={currentJudge}
        />

        {/* Winner Display */}
        {winner && (
          <div className="winner-display">
            <Trophy size={30} />
            <h3>{winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} Wins!</h3>
            <p>{winnerReasoning}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .battle-arena {
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .arena-title {
          text-align: center;
          margin-bottom: 10px;
        }

        .arena-title h2 {
          color: #E6E6E6;
          font-size: 32px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          line-height: 1;
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          font-weight: 700;
          display: inline-block;
          line-height: 1;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .arena-icon {
          width: 36px;
          height: 36px;
          filter: drop-shadow(0 0 8px currentColor);
          animation: iconGlow 3s ease-in-out infinite alternate;
          transition: color 0.3s ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        @keyframes iconGlow {
          0% { 
            filter: drop-shadow(0 0 8px currentColor); 
            transform: scale(1);
          }
          100% { 
            filter: drop-shadow(0 0 16px currentColor); 
            transform: scale(1.05);
          }
        }

        .status-message {
          color: #9999A5;
          font-size: 14px;
        }

        .characters-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          padding: 24px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 12px;
          min-height: 180px;
        }

        .character-card {
          text-align: center;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          flex: 1;
          max-width: 220px;
          min-width: 200px;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .character-card.winner {
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        }

        .character-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 12px;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(60, 60, 70, 0.5);
          flex-shrink: 0;
        }

        .character-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fallback-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          font-weight: bold;
          background: currentColor;
          opacity: 0.2;
        }

        .character-card h3 {
          color: #E6E6E6;
          font-size: 18px;
          margin-bottom: 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-align: center;
          line-height: 1.2;
        }

        .character-card p {
          color: #9999A5;
          font-size: 14px;
          margin: 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-align: center;
          line-height: 1.3;
        }

        .vs-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          min-width: 80px;
        }

        .vs-icon {
          animation: swordsGlow 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px currentColor);
          transition: color 0.3s ease;
        }

        @keyframes swordsGlow {
          0%, 100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 8px currentColor);
          }
          50% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 12px currentColor);
          }
        }

        .vs-gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 1px;
          display: inline-block;
        }

        .countdown-timer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          color: #FFD700;
          font-size: 20px;
          font-weight: 600;
        }

        .winner-display {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
          border: 2px solid #FFD700;
          border-radius: 12px;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
        }

        .winner-display h3 {
          color: #FFD700;
          font-size: 24px;
          margin: 12px 0;
        }

        .winner-display p {
          color: #E6E6E6;
          font-size: 16px;
        }

        /* Bio Button Styles */
        .bio-btn {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-top: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bio-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .bio-btn:active {
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 1400px) and (min-width: 1025px) {
          .characters-display {
            gap: 40px;
            padding: 20px;
          }
          
          .character-card {
            min-width: 140px;
            max-width: 180px;
          }
          
          .character-icon {
            width: 70px;
            height: 70px;
          }
        }

        @media (max-width: 1024px) {
          .battle-arena {
            padding: 20px;
            gap: 16px;
          }

          .arena-title h2 {
            font-size: 28px;
          }

          .arena-icon {
            width: 32px;
            height: 32px;
          }

          .characters-display {
            gap: 20px;
            padding: 16px;
            min-height: 160px;
          }

          .character-card {
            padding: 16px;
            min-width: 120px;
            max-width: 160px;
            min-height: 120px;
          }

          .character-icon {
            width: 75px;
            height: 75px;
            margin-bottom: 8px;
          }

          .character-card h3 {
            font-size: 16px;
          }

          .character-card p {
            font-size: 13px;
          }

          .vs-divider {
            min-width: 60px;
          }

          .vs-icon {
            width: 32px;
            height: 32px;
          }

          .vs-gradient-text {
            font-size: 16px;
          }
        }

        @media (max-width: 768px) {
          .battle-arena {
            padding: 16px;
            gap: 12px;
          }

          .arena-title h2 {
            font-size: 24px;
          }

          .arena-icon {
            width: 28px;
            height: 28px;
          }

          .characters-display {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
            min-height: auto;
          }

          .character-card {
            max-width: 100%;
            min-width: 0;
            flex: none;
            width: 100%;
            padding: 20px;
            min-height: 100px;
          }

          .vs-divider {
            flex-direction: row;
            order: 0;
            gap: 12px;
          }

          .vs-icon {
            width: 28px;
            height: 28px;
          }

          .vs-gradient-text {
            font-size: 14px;
          }

          .countdown-timer {
            padding: 10px 20px;
            font-size: 18px;
          }

          .bio-btn {
            padding: 6px 10px;
            font-size: 11px;
            margin-top: 8px;
          }
        }

        @media (max-width: 480px) {
          .battle-arena {
            padding: 12px;
            gap: 10px;
          }

          .arena-title h2 {
            font-size: 22px;
          }

          .arena-icon {
            width: 24px;
            height: 24px;
          }

          .character-card {
            padding: 16px;
          }

          .character-icon {
            width: 60px;
            height: 60px;
          }

          .character-card h3 {
            font-size: 15px;
          }

          .character-card p {
            font-size: 12px;
          }

          .countdown-timer {
            padding: 8px 16px;
            font-size: 16px;
          }

          .vs-icon {
            width: 24px;
            height: 24px;
          }

          .vs-gradient-text {
            font-size: 12px;
          }

          .bio-btn {
            padding: 5px 8px;
            font-size: 10px;
            margin-top: 6px;
          }
        }
      `}</style>

      {/* Character Bio Modal */}
      <CharacterBioModal 
        character={showCharacterBio}
        onClose={() => setShowCharacterBio(null)}
        characterType={bioCharacterType}
        currentJudge={currentJudge}
      />
    </>
  );
};

export default BattleArena; 