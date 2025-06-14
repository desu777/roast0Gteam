import React, { useState } from 'react';
import { X, Target, Crosshair, Users, TrendingUp, User, ExternalLink } from 'lucide-react';
import { TEAM_MEMBERS } from '../../data/teamMembers';
import { TEAM_ROASTERS } from '../../data/teamRoasters';

const HeaderExplanationModal = ({ isOpen, onClose, type, data, currentJudge }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterType, setCharacterType] = useState('og');

  if (!isOpen) return null;

  const getExplanationContent = () => {
    switch (type) {
      case 'bets':
        return {
          title: 'Battle Bets',
          icon: <Target size={24} />,
          content: (
            <div>
              <p>Shows the number of players who have placed bets on this side.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Current Bets:</strong> {data?.count || 0} players
                </div>
                <div className="detail-item">
                  <strong>How it works:</strong> Each player can place one bet per battle. More bets indicate higher confidence in that side.
                </div>
                <div className="detail-item">
                  <strong>Minimum Required:</strong> At least 1 bet on each side to start the battle.
                </div>
              </div>
            </div>
          )
        };

      case 'odds':
        return {
          title: 'Betting Odds',
          icon: <Crosshair size={24} />,
          content: (
            <div>
              <p>Shows the potential payout multiplier if this side wins.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Current Odds:</strong> {data?.odds || '1.0x'}
                </div>
                <div className="detail-item">
                  <strong>How it works:</strong> Odds are calculated based on the total amount bet on each side. Lower odds = higher chance of winning.
                </div>
                <div className="detail-item">
                  <strong>Example:</strong> If you bet 1 0G at 2.5x odds and win, you receive 2.5 0G total.
                </div>
                <div className="detail-item">
                  <strong>Dynamic:</strong> Odds change as more bets are placed on either side.
                </div>
              </div>
            </div>
          )
        };

      case 'og-team':
        return {
          title: '0G Team',
          icon: <div className="team-icon">0G</div>,
          content: (
            <div>
              <p>The 0G Network team characters defending their project.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Total Bet Amount:</strong> {(data?.total || 0).toFixed(3)} 0G
                </div>
                <div className="detail-item">
                  <strong>Fighting Style:</strong> Defensive, technical arguments about 0G's technology and vision.
                </div>
                <div className="detail-item">
                  <strong>Win Condition:</strong> Successfully defend 0G against roaster attacks with solid arguments.
                </div>
              </div>
              
              <div className="team-members-section">
                <h4>Team Members ({TEAM_MEMBERS.length})</h4>
                <div className="team-members-grid">
                  {TEAM_MEMBERS.map((member) => (
                    <div 
                      key={member.id} 
                      className="team-member-card"
                      onClick={() => {
                        setSelectedCharacter(member);
                        setCharacterType('og');
                      }}
                    >
                      <div className="member-avatar" style={{ borderColor: member.color }}>
                        <img 
                          src={`/${member.id}.jpg`} 
                          alt={member.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="fallback-avatar" 
                          style={{ 
                            display: 'none',
                            backgroundColor: member.color,
                            color: 'white'
                          }}
                        >
                          {member.name?.[0] || '?'}
                        </div>
                      </div>
                      <div className="member-info">
                        <h5>{member.name}</h5>
                        <p>{member.role}</p>
                        <span className="member-archetype">{member.archetype}</span>
                      </div>
                      <div className="view-bio-hint">
                        <User size={14} />
                        <span>View Bio</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        };

      case 'roaster':
        return {
          title: 'Crypto Roasters',
          icon: <Target size={24} />,
          content: (
            <div>
              <p>Independent crypto critics challenging 0G Network.</p>
              <div className="explanation-details">
                <div className="detail-item">
                  <strong>Total Bet Amount:</strong> {(data?.total || 0).toFixed(3)} 0G
                </div>
                <div className="detail-item">
                  <strong>Fighting Style:</strong> Aggressive, critical analysis of 0G's weaknesses and market position.
                </div>
                <div className="detail-item">
                  <strong>Win Condition:</strong> Successfully expose 0G's flaws with devastating roasts and solid criticism.
                </div>
              </div>
              
              <div className="team-members-section">
                <h4>Roaster Types ({TEAM_ROASTERS.length})</h4>
                <div className="team-members-grid">
                  {TEAM_ROASTERS.map((roaster) => (
                    <div 
                      key={roaster.id} 
                      className="team-member-card"
                      onClick={() => {
                        setSelectedCharacter(roaster);
                        setCharacterType('roaster');
                      }}
                    >
                      <div className="member-avatar" style={{ borderColor: roaster.color }}>
                        <img 
                          src={`/avatars/${roaster.id}.png`} 
                          alt={roaster.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="fallback-avatar" 
                          style={{ 
                            display: 'none',
                            backgroundColor: roaster.color,
                            color: 'white'
                          }}
                        >
                          {roaster.name?.[0] || '?'}
                        </div>
                      </div>
                      <div className="member-info">
                        <h5>{roaster.name}</h5>
                        <p>{roaster.role}</p>
                        <span className="member-archetype">{roaster.archetype}</span>
                      </div>
                      <div className="view-bio-hint">
                        <User size={14} />
                        <span>View Bio</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Information',
          icon: <Target size={24} />,
          content: <p>No information available.</p>
        };
    }
  };

  const explanation = getExplanationContent();

  const handleClose = () => {
    setSelectedCharacter(null);
    setCharacterType('og');
    onClose();
  };

  const handleBackToTeam = () => {
    setSelectedCharacter(null);
  };

  const renderCharacterBio = () => {
    if (!selectedCharacter) return null;

    const getImageSrc = () => {
      if (characterType === 'og') {
        return `/${selectedCharacter.id}.jpg`;
      } else {
        return `/avatars/${selectedCharacter.id}.png`;
      }
    };

    const renderBioSections = () => {
      if (characterType === 'og') {
        // 0G Team Member sections
        return (
          <>
            {selectedCharacter.twitterUrl && (
              <div className="detail-item">
                <strong>Connect</strong>
                <a 
                  href={selectedCharacter.twitterUrl}
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
              <p>{selectedCharacter.personality}</p>
            </div>
            <div className="detail-item">
              <strong>Decision Style</strong>
              <p>{selectedCharacter.decisionStyle}</p>
            </div>
            <div className="detail-item">
              <strong>Roasting Notes</strong>
              <p>{selectedCharacter.roastingNotes}</p>
            </div>
            <div className="detail-item">
              <strong>Signature Phrase</strong>
              <p className="catchphrase">"{selectedCharacter.catchphrase}"</p>
            </div>
          </>
        );
      } else {
        // Roaster sections
        return (
          <>
            <div className="detail-item">
              <strong>Personality & Background</strong>
              <p>{selectedCharacter.personality}</p>
            </div>
            <div className="detail-item">
              <strong>Decision Style</strong>
              <p>{selectedCharacter.decisionStyle}</p>
            </div>
            <div className="detail-item">
              <strong>Roasting Notes</strong>
              <p>{selectedCharacter.roastingNotes}</p>
            </div>
            <div className="detail-item">
              <strong>Signature Phrase</strong>
              <p className="catchphrase">"{selectedCharacter.catchphrase}"</p>
            </div>
            {selectedCharacter.strengths && selectedCharacter.strengths.length > 0 && (
              <div className="detail-item">
                <strong>Strengths</strong>
                <ul className="traits-list">
                  {selectedCharacter.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCharacter.weaknesses && selectedCharacter.weaknesses.length > 0 && (
              <div className="detail-item">
                <strong>Weaknesses</strong>
                <ul className="traits-list">
                  {selectedCharacter.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCharacter.cryptoPersonality && (
              <div className="detail-item">
                <strong>Crypto Personality</strong>
                <p className="crypto-personality">{selectedCharacter.cryptoPersonality}</p>
              </div>
            )}
          </>
        );
      }
    };

    return (
      <div className="character-bio-view">
        <div className="bio-header">
          <button className="back-btn" onClick={handleBackToTeam}>
            ← Back to Team
          </button>
          <div className="character-header">
            <div className="character-avatar" style={{ borderColor: selectedCharacter.color }}>
              <img 
                src={getImageSrc()} 
                alt={selectedCharacter.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="fallback-avatar" 
                style={{ 
                  display: 'none',
                  backgroundColor: selectedCharacter.color,
                  color: 'white'
                }}
              >
                {selectedCharacter.name?.[0] || '?'}
              </div>
            </div>
            <div className="character-info">
              <h3>{selectedCharacter.name}</h3>
              <p>{selectedCharacter.role}</p>
              <span className="character-archetype">{selectedCharacter.archetype}</span>
            </div>
          </div>
        </div>
        
        <div className="bio-content">
          {renderBioSections()}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay modal-fade-in" onClick={handleClose}>
      <div 
        className="explanation-modal modal-slide-in" 
        onClick={(e) => e.stopPropagation()}
        style={{
          '--judge-color': currentJudge?.color || '#FFD700',
          '--judge-color-rgb': currentJudge?.color ? 
            currentJudge.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : 
            '255, 215, 0'
        }}
      >
        <div className="modal-header">
          <div className="modal-title">
            {selectedCharacter ? <User size={24} /> : explanation.icon}
            <h3>{selectedCharacter ? selectedCharacter.name : explanation.title}</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          {selectedCharacter ? renderCharacterBio() : explanation.content}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            background: rgba(0, 0, 0, 0);
          }
          to {
            opacity: 1;
            background: rgba(0, 0, 0, 0.7);
          }
        }

        .explanation-modal {
          background: rgba(18, 18, 24, 0.95);
          border: 2px solid var(--judge-color, #FFD700);
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 30px rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
        }

        .modal-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--judge-color, #FFD700);
          background: linear-gradient(90deg, 
            rgba(var(--judge-color-rgb, 255, 215, 0), 0.1), 
            rgba(var(--judge-color-rgb, 255, 215, 0), 0.05)
          );
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #E6E6E6;
        }

        .modal-title h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .team-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #00D2E9, #0099CC);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          color: white;
        }

        .roaster-icon {
          font-size: 24px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #9999A5;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          color: var(--judge-color, #FFD700);
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.2);
          transform: scale(1.1);
        }

        .modal-content {
          padding: 20px;
          color: #E6E6E6;
          line-height: 1.6;
        }

        .modal-content p {
          margin: 0 0 16px 0;
          font-size: 16px;
        }

        .explanation-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          padding: 12px;
          background: rgba(30, 30, 40, 0.6);
          border-radius: 8px;
          border-left: 3px solid var(--judge-color, #FFD700);
        }

        .detail-item strong {
          color: var(--judge-color, #FFD700);
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }

        /* Scrollbar styling */
        .explanation-modal::-webkit-scrollbar {
          width: 6px;
        }

        .explanation-modal::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .explanation-modal::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .explanation-modal::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 140, 0.7);
        }

        /* Team Members Section */
        .team-members-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
        }

        .team-members-section h4 {
          color: var(--judge-color, #FFD700);
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
        }

        .team-members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .team-member-card {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .team-member-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.3s ease;
        }

        .team-member-card:hover::before {
          left: 100%;
        }

        .team-member-card:hover {
          transform: translateY(-2px);
          border-color: var(--judge-color, #FFD700);
          box-shadow: 0 4px 12px rgba(var(--judge-color-rgb, 255, 215, 0), 0.2);
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 12px;
          border: 2px solid;
          position: relative;
        }

        .member-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fallback-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
        }

        .member-info h5 {
          color: #E6E6E6;
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .member-info p {
          color: #9999A5;
          margin: 0 0 8px 0;
          font-size: 12px;
        }

        .member-archetype {
          color: var(--judge-color, #FFD700);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-bio-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          color: #9999A5;
          font-size: 11px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .team-member-card:hover .view-bio-hint {
          opacity: 1;
          transform: translateY(0);
          color: var(--judge-color, #FFD700);
        }

        /* Character Bio View */
        .character-bio-view {
          animation: slideInFromRight 0.3s ease-out;
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .bio-header {
          margin-bottom: 20px;
        }

        .back-btn {
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.1);
          border: 1px solid var(--judge-color, #FFD700);
          color: var(--judge-color, #FFD700);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.2);
          transform: translateX(-2px);
        }

        .character-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .character-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid;
          position: relative;
        }

        .character-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .character-info h3 {
          color: #E6E6E6;
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
        }

        .character-info p {
          color: #9999A5;
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .character-archetype {
          color: var(--judge-color, #FFD700);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bio-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .twitter-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--judge-color, #FFD700);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .twitter-link:hover {
          color: #E6E6E6;
          transform: translateX(4px);
        }

        .catchphrase {
          color: var(--judge-color, #FFD700);
          font-style: italic;
          font-weight: 600;
        }

        .crypto-personality {
          color: #B8B8C2;
          font-style: italic;
        }

        .traits-list {
          margin: 8px 0 0 0;
          padding-left: 20px;
          color: #9999A5;
          line-height: 1.5;
        }

        .traits-list li {
          margin-bottom: 4px;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }

          .explanation-modal {
            max-height: 90vh;
          }

          .modal-header {
            padding: 16px;
          }

          .modal-content {
            padding: 16px;
          }

          .modal-title h3 {
            font-size: 18px;
          }

          .team-members-grid {
            grid-template-columns: 1fr;
          }

          .character-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default HeaderExplanationModal; 