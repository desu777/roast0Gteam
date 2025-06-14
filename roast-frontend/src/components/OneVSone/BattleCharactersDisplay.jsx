import React, { useState } from 'react';
import { Swords, User, X } from 'lucide-react';

const BattleCharactersDisplay = ({ 
  phaseTransition,
  ogCharacter,
  roasterCharacter,
  winner,
  currentJudge,
  handleShowBio,
  battleStatus,
  timeLeft,
  formatTime,
  getCharacterStats
}) => {
  
  // State for image modal
  const [imageModal, setImageModal] = useState(null);
  
  // Debug logging for character data
  if (import.meta.env.VITE_TEST_ENV === 'true') {
    console.log('🎭 BattleCharactersDisplay render:', {
      ogCharacter: { id: ogCharacter?.id, name: ogCharacter?.name },
      roasterCharacter: { id: roasterCharacter?.id, name: roasterCharacter?.name }
    });
  }
  
  // Handle image click
  const handleImageClick = (character, type) => {
    if (character?.id) {
      setImageModal({
        src: `/${character.id}.jpg`,
        alt: character.name,
        character: character,
        type: type
      });
    }
  };
  
  // Handle modal close
  const handleModalClose = () => {
    setImageModal(null);
  };
  
  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && imageModal) {
        handleModalClose();
      }
    };
    
    if (imageModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [imageModal]);
  
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
    <>
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
              onClick={() => handleImageClick(ogCharacter, 'og')}
              style={{ cursor: 'pointer' }}
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
        {ogCharacter?.id && getCharacterStats && (
          <div className="character-stats">
            {(() => {
              const stats = getCharacterStats(ogCharacter.id, 'og');
              return (
                <span className="stats-text">
                  {stats.battles} battles • {stats.winRate}% win rate
                </span>
              );
            })()}
          </div>
        )}
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
          {roasterCharacter?.id ? (
            <img src={`/${roasterCharacter.id}.jpg`} 
                 alt={roasterCharacter?.name}
                 onClick={() => handleImageClick(roasterCharacter, 'roaster')}
                 style={{ cursor: 'pointer' }}
                 onError={(e) => {
                   if (import.meta.env.VITE_TEST_ENV === 'true') {
                     console.log('🖼️ Roaster image failed to load:', `/${roasterCharacter.id}.jpg`);
                   }
                   e.target.style.display = 'none';
                   e.target.nextSibling.style.display = 'block';
                 }}
                 onLoad={() => {
                   if (import.meta.env.VITE_TEST_ENV === 'true') {
                     console.log('🖼️ Roaster image loaded successfully:', `/${roasterCharacter.id}.jpg`);
                   }
                 }}
            />
          ) : (
            <>
              {import.meta.env.VITE_TEST_ENV === 'true' && console.log('🖼️ No roasterCharacter.id:', roasterCharacter)}
            </>
          )}
          <div className="fallback-icon" style={{ display: roasterCharacter?.id ? 'none' : 'flex' }}>
            {roasterCharacter?.name?.[0] || '?'}
          </div>
        </div>
        <h3>{roasterCharacter?.name || 'Selecting...'}</h3>
        <p>{roasterCharacter?.role || 'Crypto Roaster'}</p>
        {roasterCharacter?.id && getCharacterStats && (
          <div className="character-stats">
            {(() => {
              const stats = getCharacterStats(roasterCharacter.id, 'roaster');
              return (
                <span className="stats-text">
                  {stats.battles} battles • {stats.winRate}% win rate
                </span>
              );
            })()}
          </div>
        )}
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
    
    {/* Image Modal */}
    {imageModal && (
      <div 
        className="image-modal-overlay"
        onClick={handleModalClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'modalFadeIn 0.3s ease-out'
        }}
      >
        <div 
          className="image-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '500px',
            height: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            background: 'rgba(30, 30, 40, 0.9)',
            borderRadius: '12px',
            border: `2px solid ${currentJudge?.color || '#FFD700'}`,
            boxShadow: `0 0 30px ${currentJudge?.color || '#FFD700'}40`,
            padding: '20px',
            animation: 'modalSlideIn 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleModalClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${currentJudge?.color || '#FFD700'}`,
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              transition: 'all 0.3s ease',
              zIndex: 10001
            }}
            onMouseEnter={(e) => {
              e.target.style.background = currentJudge?.color || '#FFD700';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#FFFFFF';
            }}
          >
            <X size={16} />
          </button>
          
          {/* Character Info Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <h3 style={{
              margin: '0 0 4px 0',
              color: currentJudge?.color || '#FFD700',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              {imageModal.character.name}
            </h3>
            <p style={{
              margin: '0',
              color: '#CCCCCC',
              fontSize: '16px'
            }}>
              {imageModal.character.role}
            </p>
          </div>
          
          {/* Image */}
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0
          }}>
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '400px',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: `2px solid ${currentJudge?.color || '#FFD700'}40`,
                boxShadow: `0 0 20px ${currentJudge?.color || '#FFD700'}20`
              }}
            />
          </div>
          
          {/* Team Badge */}
          <div style={{
            textAlign: 'center',
            flexShrink: 0
          }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: imageModal.type === 'og' 
                ? 'linear-gradient(45deg, #00D2E9, #FF5CAA)' 
                : 'linear-gradient(45deg, #E74C3C, #FF6B6B)',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {imageModal.type === 'og' ? '0G Team' : 'Crypto Roaster'}
            </span>
          </div>
        </div>
      </div>
    )}
    
    <style jsx>{`
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes modalSlideIn {
        from { 
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to { 
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `}</style>
    </>
  );
};

export default BattleCharactersDisplay; 