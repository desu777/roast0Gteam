import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const CharacterBio = ({ character, characterType, onBack }) => {
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
            <div className="detail-item">
              <strong>Connect</strong>
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
          <div className="detail-item">
            <strong>Personality & Background</strong>
            <p>{character.personality}</p>
          </div>
          <div className="detail-item">
            <strong>Decision Style</strong>
            <p>{character.decisionStyle}</p>
          </div>
          <div className="detail-item">
            <strong>Roasting Notes</strong>
            <p>{character.roastingNotes}</p>
          </div>
          <div className="detail-item">
            <strong>Signature Phrase</strong>
            <p className="catchphrase">"{character.catchphrase}"</p>
          </div>
        </>
      );
    } else {
      // Roaster sections
      return (
        <>
          <div className="detail-item">
            <strong>Personality & Background</strong>
            <p>{character.personality}</p>
          </div>
          <div className="detail-item">
            <strong>Decision Style</strong>
            <p>{character.decisionStyle}</p>
          </div>
          <div className="detail-item">
            <strong>Roasting Notes</strong>
            <p>{character.roastingNotes}</p>
          </div>
          <div className="detail-item">
            <strong>Signature Phrase</strong>
            <p className="catchphrase">"{character.catchphrase}"</p>
          </div>
          {character.strengths && character.strengths.length > 0 && (
            <div className="detail-item">
              <strong>Strengths</strong>
              <ul className="traits-list">
                {character.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          {character.weaknesses && character.weaknesses.length > 0 && (
            <div className="detail-item">
              <strong>Weaknesses</strong>
              <ul className="traits-list">
                {character.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}
          {character.cryptoPersonality && (
            <div className="detail-item">
              <strong>Crypto Personality</strong>
              <p className="crypto-personality">{character.cryptoPersonality}</p>
            </div>
          )}
          {character.freshTopics2025 && character.freshTopics2025.length > 0 && (
            <div className="detail-item">
              <strong>Fresh Topics 2025</strong>
              <ul className="traits-list">
                {character.freshTopics2025.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="character-bio-view">
      <div className="bio-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Team
        </button>
        <div className="character-header">
          <div className="character-avatar" style={{ borderColor: character.color }}>
            <img 
              src={getImageSrc()} 
              alt={character.name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="fallback-avatar" 
              style={{ 
                display: 'none',
                backgroundColor: character.color,
                color: 'white'
              }}
            >
              {character.name?.[0] || '?'}
            </div>
          </div>
          <div className="character-info">
            <h3>{character.name}</h3>
            <p>{character.role}</p>
            <span className="character-archetype">{character.archetype}</span>
          </div>
        </div>
      </div>
      
      <div className="bio-content">
        {renderBioSections()}
      </div>
    </div>
  );
};

export default CharacterBio; 