import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const CharacterBioModal = ({ character, onClose, characterType = 'og', currentJudge }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (character) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [character]);

  if (!character) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const getImageSrc = () => {
    if (characterType === 'og') {
      return `/${character.id}.jpg`;
    } else {
      return `/avatars/${character.id}.png`;
    }
  };

  const renderBioSections = () => {
    if (characterType === 'og') {
      // 0G Team Member sections
      return (
        <>
          {character.twitterUrl && (
            <div className="detail-section">
              <h4>Connect</h4>
              <a 
                href={character.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="twitter-link"
              >
                <ExternalLink size={16} />
                Follow on Twitter
              </a>
            </div>
          )}
          <div className="detail-section">
            <h4>Personality & Background</h4>
            <p>{character.personality}</p>
          </div>
          <div className="detail-section">
            <h4>Decision Style</h4>
            <p>{character.decisionStyle}</p>
          </div>
          <div className="detail-section">
            <h4>Roasting Notes</h4>
            <p>{character.roastingNotes}</p>
          </div>
          <div className="detail-section">
            <h4>Signature Phrase</h4>
            <p className="catchphrase">"{character.catchphrase}"</p>
          </div>
        </>
      );
    } else {
      // Roaster sections
      return (
        <>
          <div className="detail-section">
            <h4>Personality & Background</h4>
            <p>{character.personality}</p>
          </div>
          <div className="detail-section">
            <h4>Decision Style</h4>
            <p>{character.decisionStyle}</p>
          </div>
          <div className="detail-section">
            <h4>Roasting Notes</h4>
            <p>{character.roastingNotes}</p>
          </div>
          <div className="detail-section">
            <h4>Signature Phrase</h4>
            <p className="catchphrase">"{character.catchphrase}"</p>
          </div>
          {character.strengths && character.strengths.length > 0 && (
            <div className="detail-section">
              <h4>Strengths</h4>
              <ul className="traits-list">
                {character.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          {character.weaknesses && character.weaknesses.length > 0 && (
            <div className="detail-section">
              <h4>Weaknesses</h4>
              <ul className="traits-list">
                {character.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}
          {character.cryptoPersonality && (
            <div className="detail-section">
              <h4>Crypto Personality</h4>
              <p className="crypto-personality">{character.cryptoPersonality}</p>
            </div>
          )}
        </>
      );
    }
  };

  return (
    <>
      <div 
        className={`modal-overlay ${isClosing ? 'closing' : ''}`} 
        onClick={handleClose}
      >
        <div 
          className={`character-modal ${isClosing ? 'closing' : ''}`} 
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <img 
              src={getImageSrc()} 
              alt={character.name}
              className="modal-character-image"
              style={{ borderColor: character.color }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="fallback-modal-image" 
              style={{ 
                display: 'none',
                backgroundColor: character.color,
                color: 'white'
              }}
            >
              {character.name?.[0] || '?'}
            </div>
            <div>
              <h2>{character.name}</h2>
              <p>{character.role}</p>
              <p className="archetype">{character.archetype}</p>
            </div>
            <button 
              className="modal-close"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            {renderBioSections()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(10px);
          opacity: 0;
          animation: modalFadeIn 0.3s ease-out forwards;
        }

        .modal-overlay.closing {
          animation: modalFadeOut 0.3s ease-in forwards;
        }

        .character-modal {
          background: rgba(18, 18, 24, 0.95);
          border-radius: 24px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          border: 2px solid ${currentJudge?.color || character?.color || '#00D2E9'};
          position: relative;
          max-height: 80vh;
          overflow-y: auto;
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          animation: modalSlideIn 0.3s ease-out forwards;
        }

        .character-modal.closing {
          animation: modalSlideOut 0.3s ease-in forwards;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          position: relative;
        }

        .modal-character-image {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid;
        }

        .fallback-modal-image {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          border: 3px solid;
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #E6E6E6;
          margin: 0;
        }

        .modal-header p {
          color: #9999A5;
          margin: 0;
          font-size: 14px;
        }

        .archetype {
          color: ${currentJudge?.color || character?.color || '#00D2E9'} !important;
          font-weight: 600;
          font-size: 12px !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-close {
          position: absolute;
          top: -8px;
          right: -8px;
          background: rgba(255, 87, 87, 0.1);
          border: 1px solid #FF5757;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF5757;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 87, 87, 0.2);
          transform: scale(1.1);
        }

        .modal-content {
          margin-bottom: 24px;
        }

        .detail-section {
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(10, 10, 10, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .detail-section h4 {
          color: ${currentJudge?.color || character?.color || '#00D2E9'};
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
        }

        .detail-section p {
          color: #9999A5;
          line-height: 1.5;
          margin: 0;
        }

        .catchphrase {
          color: ${currentJudge?.color || character?.color || '#FFD700'} !important;
          font-style: italic;
          font-weight: 600;
        }

        .crypto-personality {
          color: #B8B8C2 !important;
          font-style: italic;
        }

        .traits-list {
          margin: 0;
          padding-left: 20px;
          color: #9999A5;
          line-height: 1.5;
        }

        .traits-list li {
          margin-bottom: 4px;
        }

        .twitter-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${currentJudge?.color || character?.color || '#00D2E9'};
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .twitter-link:hover {
          color: #E6E6E6;
          transform: translateX(4px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modal-header {
            flex-direction: column;
            text-align: center;
          }

          .character-modal {
            padding: 20px;
            margin: 10px;
          }
        }

        /* Modal Animations */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes modalSlideOut {
          from {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          to {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CharacterBioModal; 