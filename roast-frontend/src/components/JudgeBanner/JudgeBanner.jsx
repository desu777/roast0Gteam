import React from 'react';
import { Shuffle, ExternalLink } from 'lucide-react';

const JudgeBanner = ({ currentJudge, setShowJudgeDetails }) => {
  if (!currentJudge) return null;

  return (
    <>
      <div className="current-judge-banner">
        <div className="judge-intro">
          <div className="judge-label">
            <Shuffle size={16} />
            <span>This Round's AI Judge</span>
          </div>
          <div className="judge-display-main">
            <div className="judge-avatar-main" style={{ background: currentJudge.color }}>
              <img 
                src={`/${currentJudge.id}.jpg`} 
                alt={currentJudge.name}
                className="judge-nft-image"
              />
            </div>
            <div className="judge-info-main">
              <h2>{currentJudge.name}</h2>
              <p className="judge-role-main">{currentJudge.role}</p>
              <p className="judge-archetype-main">{currentJudge.archetype}</p>
              <a 
                href={currentJudge.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="judge-twitter-handle"
              >
                @{currentJudge.twitterUrl?.split('/').pop()}
              </a>
            </div>
            <button
              className="judge-details-btn-main"
              onClick={() => setShowJudgeDetails(currentJudge)}
            >
              <ExternalLink size={16} />
              View Style
            </button>
          </div>
          <div className="judge-catchphrase-main">
            "{currentJudge.catchphrase}"
          </div>
        </div>
      </div>

      <style jsx>{`
        .current-judge-banner {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          border: 1px solid rgba(60, 75, 95, 0.3);
          position: relative;
          overflow: hidden;
        }

        .current-judge-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.02), transparent);
          z-index: 1;
        }

        .judge-intro {
          position: relative;
          z-index: 2;
        }

        .judge-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--theme-primary, #FFD700);
          font-weight: 600;
          margin-bottom: 20px;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .judge-display-main {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 20px;
        }

        .judge-avatar-main {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          border: 3px solid rgba(255, 255, 255, 0.1);
        }

        .judge-nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .judge-info-main h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #E6E6E6;
        }

        .judge-role-main {
          color: ${currentJudge?.color || '#00D2E9'};
          font-weight: 600;
          margin-bottom: 4px;
        }

        .judge-archetype-main {
          color: #9999A5;
          font-size: 14px;
        }

        .judge-details-btn-main {
          background: rgba(${currentJudge?.color ? 
            `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}` : 
            '0, 210, 233'}, 0.1);
          border: 1px solid ${currentJudge?.color || '#00D2E9'};
          border-radius: 12px;
          padding: 12px 16px;
          color: ${currentJudge?.color || '#00D2E9'};
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-left: auto;
        }

        .judge-details-btn-main:hover {
          background: rgba(${currentJudge?.color ? 
            `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}` : 
            '0, 210, 233'}, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(${currentJudge?.color ? 
            `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}` : 
            '0, 210, 233'}, 0.3);
        }

        .judge-catchphrase-main {
          color: ${currentJudge?.color || '#FFD700'};
          font-style: italic;
          font-weight: 600;
          font-size: 18px;
          text-align: center;
          padding: 16px;
          background: rgba(${currentJudge?.color ? 
            `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}` : 
            '255, 215, 0'}, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(${currentJudge?.color ? 
            `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}` : 
            '255, 215, 0'}, 0.2);
        }

        .judge-twitter-handle {
          color: ${currentJudge?.color || '#00D2E9'};
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          margin-top: 4px;
          display: inline-block;
          transition: all 0.3s ease;
          opacity: 0.8;
        }

        .judge-twitter-handle:hover {
          opacity: 1;
          transform: translateX(2px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .current-judge-banner {
            padding: 20px;
          }

          .judge-display-main {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .judge-details-btn-main {
            margin: 0 auto;
          }

          .judge-catchphrase-main {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default JudgeBanner;