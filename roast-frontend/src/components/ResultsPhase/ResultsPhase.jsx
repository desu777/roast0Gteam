import React, { useEffect, useState } from 'react';
import { Crown, DollarSign, Flame, Award, ExternalLink } from 'lucide-react';

const ResultsPhase = ({ 
  currentJudge,
  winner,
  prizePool,
  aiReasoning,
  roundNumber,
  nextRoundCountdown
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simple fade-in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return 'Anonymous';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <div className="results-overlay">
        <div className="results-backdrop"></div>
        
        <div className="results-container">
          <div className={`winner-card ${isVisible ? 'visible' : ''}`}>
            
            {/* Header */}
            <div className="winner-header">
              <div className="crown-icon">
                <Crown size={48} />
              </div>
              
              <div className="header-text">
                <h1 className="gradient-title">Round #{roundNumber} Winner</h1>
                <div className="victory-subtitle">Victory Achieved</div>
              </div>
            </div>

            {/* Winner Info */}
            {winner && (
              <div className="winner-info">
                <div className="winner-identity">
                  <div className="address-section">
                    <div className="label">Champion Address</div>
                    <div className="address-value character-color">
                      {formatAddress(winner.address)}
                      {winner.isUser && (
                        <span className="user-badge">YOU!</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="prize-section">
                    <div className="label">Prize Amount</div>
                    <div className="prize-amount">
                      {winner.prizeAmount ? winner.prizeAmount.toFixed(3) : (prizePool * 0.95).toFixed(3)} 0G
                    </div>
                    {winner.payoutTxHash && (
                      <a 
                        href={`https://chainscan-galileo.0g.ai/tx/${winner.payoutTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                      >
                        <ExternalLink size={14} />
                        View Transaction
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Winning Roast */}
            {winner && winner.roastText && (
              <div className="winning-roast">
                <div className="roast-header">
                  <Award size={18} />
                  <span>Winning Roast</span>
                </div>
                <div className="roast-content">
                  <p className="roast-text">"{winner.roastText}"</p>
                </div>
              </div>
            )}

            {/* Judge Verdict */}
            {currentJudge && aiReasoning && (
              <div className="judge-verdict">
                <div className="verdict-header">
                  <div className="judge-avatar">
                    <img 
                      src={`/${currentJudge.id}.jpg`} 
                      alt={currentJudge.name}
                      className="judge-image"
                    />
                  </div>
                  <div className="judge-info">
                    <div className="judge-name">{currentJudge.name}'s Verdict</div>
                    <div className="judge-role">{currentJudge.role}</div>
                  </div>
                </div>
                
                <div className="verdict-details">
                  <p className="reasoning-text">{aiReasoning}</p>
                </div>
              </div>
            )}

            {/* Next Round Countdown */}
            <div className="next-round">
              <div className="countdown-container">
                <div className="countdown-text">
                  <span className="countdown-label">Next Round In</span>
                  <span className="countdown-timer character-color">{nextRoundCountdown}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Overlay */
        .results-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .results-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.6);
        }

        .results-container {
          position: relative;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          z-index: 1001;
        }

        /* Main Card */
        .winner-card {
          background: linear-gradient(135deg, 
            rgba(18, 18, 24, 0.95) 0%,
            rgba(26, 26, 32, 0.95) 100%
          );
          border: 2px solid var(--theme-primary, #FFD700);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px var(--theme-primary-20, rgba(255, 215, 0, 0.2)),
            0 0 40px var(--theme-primary-10, rgba(255, 215, 0, 0.1));
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .winner-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Header */
        .winner-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--theme-primary-20, rgba(255, 215, 0, 0.2));
        }

        .crown-icon {
          margin-bottom: 16px;
          color: var(--theme-primary, #FFD700);
          display: inline-block;
          filter: drop-shadow(0 0 15px var(--theme-primary-30, rgba(255, 215, 0, 0.3)));
        }

        .gradient-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          margin: 0 0 8px 0;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .victory-subtitle {
          color: #9999A5;
          font-size: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Winner Info */
        .winner-info {
          margin-bottom: 32px;
        }

        .winner-identity {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
          padding: 24px;
          background: var(--theme-primary-5, rgba(255, 215, 0, 0.05));
          border: 1px solid var(--theme-primary-15, rgba(255, 215, 0, 0.15));
          border-radius: 12px;
        }

        .address-section, .prize-section {
          flex: 1;
          text-align: center;
        }

        .label {
          font-size: 0.9rem;
          color: #9999A5;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .address-value {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .character-color {
          color: var(--theme-primary, #FFD700);
          text-shadow: 0 0 10px var(--theme-primary-30, rgba(255, 215, 0, 0.3));
        }

        .user-badge {
          background: linear-gradient(90deg, var(--theme-primary, #FFD700), #FF6B6B);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .prize-amount {
          font-size: 1.4rem;
          font-weight: 700;
          color: #00D2E9;
          margin-bottom: 8px;
        }

        .tx-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #00D2E9;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .tx-link:hover {
          background: rgba(0, 210, 233, 0.1);
          transform: translateY(-1px);
        }

        /* Winning Roast */
        .winning-roast {
          margin-bottom: 32px;
        }

        .roast-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #FF5CAA;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .roast-content {
          background: rgba(255, 92, 170, 0.05);
          border: 1px solid rgba(255, 92, 170, 0.2);
          border-radius: 12px;
          padding: 24px;
        }

        .roast-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #E6E6E6;
          font-style: italic;
          margin: 0;
          text-align: center;
        }

        /* Judge Verdict */
        .judge-verdict {
          margin-bottom: 32px;
        }

        .verdict-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .judge-avatar {
          width: 48px;
          height: 48px;
        }

        .judge-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(255, 215, 0, 0.3);
        }

        .judge-info {
          flex: 1;
        }

        .judge-name {
          font-size: 1rem;
          font-weight: 600;
          color: #E6E6E6;
          margin-bottom: 4px;
        }

        .judge-role {
          font-size: 0.85rem;
          color: #9999A5;
        }

        .verdict-details {
          margin-top: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .reasoning-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #B8B8C2;
          font-style: italic;
          margin: 0;
          text-align: center;
        }

        /* Next Round */
        .next-round {
          text-align: center;
          padding: 20px;
          background: var(--theme-primary-5, rgba(255, 215, 0, 0.05));
          border: 1px solid var(--theme-primary-20, rgba(255, 215, 0, 0.2));
          border-radius: 12px;
        }

        .countdown-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .countdown-text {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .countdown-label {
          font-size: 0.85rem;
          color: #9999A5;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .countdown-timer {
          font-size: 1.6rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .results-overlay {
            padding: 15px;
          }

          .winner-card {
            padding: 24px;
          }

          .header-text h1 {
            font-size: 1.6rem;
          }

          .winner-identity {
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .verdict-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .results-overlay {
            padding: 10px;
          }

          .winner-card {
            padding: 20px;
          }

          .header-text h1 {
            font-size: 1.4rem;
          }

          .prize-amount {
            font-size: 1.2rem;
          }

          .roast-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default ResultsPhase; 