import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

const ResultsPhase = ({ 
  currentJudge,
  winner,
  prizePool,
  aiReasoning,
  roundNumber,
  nextRoundCountdown
}) => {
  return (
    <>
      <div className="results-phase">
        <div className="winner-announcement">
          <div className="winner-trophy">
            <Trophy size={64} />
          </div>
          <h2>🔥 Round #{roundNumber} Winner! 🔥</h2>
          
          {winner && (
            <div className="winner-info">
              <div className="winner-address">
                {winner.address}
                {winner.isUser && <span className="winner-you">That's YOU! 🎉</span>}
              </div>
              <div className="prize-amount">
                Wins {(prizePool * 0.95).toFixed(3)} 0G
              </div>
              {winner.roastText && (
                <div className="winning-roast">
                  <div className="roast-label">Winning Roast:</div>
                  <p className="roast-text">"{winner.roastText}"</p>
                </div>
              )}
            </div>
          )}

          <div className="ai-verdict">
            <div className="verdict-header">
              <currentJudge.icon size={24} style={{ color: currentJudge.color }} />
              <span>{currentJudge.name}'s Verdict:</span>
            </div>
            <p className="verdict-text">"{aiReasoning}"</p>
          </div>

          <div className="next-round-info">
            <div className="countdown-display">
              <RefreshCw size={20} />
              <span>New round starting in {nextRoundCountdown}s</span>
            </div>
            <p>Get ready for the next roast battle!</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .results-phase {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .winner-announcement {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 24px;
          padding: 40px;
          border: 2px solid #FFD700;
          position: relative;
          overflow: hidden;
          animation: fadeInScale 0.5s ease-out;
        }

        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .winner-announcement::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent);
          z-index: 1;
        }

        .winner-trophy {
          color: #FFD700;
          margin-bottom: 20px;
          animation: trophyBounce 1s infinite alternate;
          position: relative;
          z-index: 2;
        }

        @keyframes trophyBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }

        .winner-announcement h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 30px;
          background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          z-index: 2;
        }

        .winner-info {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          position: relative;
          z-index: 2;
        }

        .winner-address {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          color: #FFD700;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .winner-you {
          background: linear-gradient(135deg, #00D2E9, #FF5CAA);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          animation: celebration 1s infinite alternate;
        }

        @keyframes celebration {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        .prize-amount {
          font-size: 20px;
          font-weight: 800;
          color: #00D2E9;
        }

        .winning-roast {
          margin-top: 20px;
          padding: 16px;
          background: rgba(255, 92, 170, 0.05);
          border: 1px solid rgba(255, 92, 170, 0.2);
          border-radius: 12px;
        }

        .roast-label {
          font-size: 12px;
          color: #FF5CAA;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .roast-text {
          color: #E6E6E6;
          font-size: 16px;
          line-height: 1.5;
          font-style: italic;
          margin: 0;
        }

        .ai-verdict {
          background: rgba(10, 10, 10, 0.8);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
          border: 1px solid rgba(60, 75, 95, 0.3);
          position: relative;
          z-index: 2;
        }

        .verdict-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .verdict-text {
          color: #9999A5;
          font-style: italic;
          line-height: 1.6;
          font-size: 16px;
        }

        .next-round-info {
          position: relative;
          z-index: 2;
          background: rgba(0, 210, 233, 0.05);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(0, 210, 233, 0.2);
        }

        .countdown-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #00D2E9;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 8px;
        }

        .next-round-info p {
          color: #9999A5;
          font-size: 14px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .winner-announcement h2 {
            font-size: 20px;
          }

          .winner-announcement {
            padding: 24px;
          }

          .winner-address {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default ResultsPhase; 