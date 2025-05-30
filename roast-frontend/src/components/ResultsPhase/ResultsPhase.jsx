import React, { useEffect, useState } from 'react';
import { Trophy, Clock, DollarSign, Flame, Sparkles, RefreshCw, Crown, Zap, Star, Award, ExternalLink } from 'lucide-react';

const ResultsPhase = ({ 
  currentJudge,
  winner,
  prizePool,
  aiReasoning,
  roundNumber,
  nextRoundCountdown
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Łagodniejsza animacja fazowa - elementy pojawiają się jeden po drugim
    const phases = [0, 1, 2, 3, 4];
    phases.forEach((phase, index) => {
      setTimeout(() => setAnimationPhase(phase), index * 600);
    });

    // Auto-expand details po 4 sekundach
    setTimeout(() => setShowDetails(true), 4000);
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return 'Anonymous';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {/* Fixed overlay covering entire screen */}
      <div className="results-overlay">
        {/* Backdrop blur */}
        <div className="results-backdrop"></div>
        
        {/* Centered content container */}
        <div className="results-container">
          {/* Subtelne tło zamiast agresywnych particles */}
          <div className="subtle-background">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="subtle-particle" 
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          {/* Main Winner Card */}
          <div className={`winner-card ${animationPhase >= 0 ? 'visible' : ''}`}>
            
            {/* Header with Trophy */}
            <div className={`winner-header ${animationPhase >= 1 ? 'visible' : ''}`}>
              <div className="trophy-container">
                <div className="trophy-glow"></div>
                <Trophy size={58} className="trophy-icon" />
                <div className="crown-effect">
                  <Crown size={28} />
                </div>
              </div>
              
              <div className="header-text">
                <h1>
                  <Flame size={24} className="flame-icon" />
                  ROUND #{roundNumber} CHAMPION
                  <Flame size={24} className="flame-icon" />
                </h1>
                <div className="victory-subtitle">
                  <Star size={16} />
                  Victory Achieved
                  <Star size={16} />
                </div>
              </div>
            </div>

            {/* Winner Info */}
            {winner && (
              <div className={`winner-info ${animationPhase >= 2 ? 'visible' : ''}`}>
                <div className="winner-identity">
                  <div className="address-display">
                    <div className="address-label">Champion Address</div>
                    <div className="address-value">
                      {formatAddress(winner.address)}
                      {winner.isUser && (
                        <div className="champion-badge">
                          <Star size={14} />
                          THAT'S YOU!
                          <Sparkles size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="prize-display">
                    <div className="prize-label">Victory Prize</div>
                    <div className="prize-amount">
                      <DollarSign size={22} />
                      {winner.prizeAmount ? winner.prizeAmount.toFixed(3) : (prizePool * 0.95).toFixed(3)} 0G
                    </div>
                    {winner.payoutTxHash && (
                      <a 
                        href={`https://chainscan-galileo.0g.ai/tx/${winner.payoutTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="payout-link"
                      >
                        <ExternalLink size={14} />
                        View Prize Transaction
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Winning Roast */}
            {winner && winner.roastText && (
              <div className={`winning-roast ${animationPhase >= 3 ? 'visible' : ''}`}>
                <div className="roast-header">
                  <Award size={18} />
                  <span>Championship Roast</span>
                  <Award size={18} />
                </div>
                <div className="roast-content">
                  <div className="roast-quote-mark">"</div>
                  <p className="roast-text">{winner.roastText}</p>
                  <div className="roast-quote-mark closing">"</div>
                </div>
              </div>
            )}

            {/* Judge Verdict */}
            {currentJudge && aiReasoning && (
              <div className={`judge-verdict ${animationPhase >= 4 ? 'visible' : ''}`}>
                <div className="verdict-header">
                  <div className="judge-avatar">
                    <img 
                      src={`/${currentJudge.id}.jpg`} 
                      alt={currentJudge.name}
                      className="judge-image"
                    />
                    <div className="judge-glow" style={{ background: currentJudge.color }}></div>
                  </div>
                  <div className="judge-info">
                    <div className="judge-name">{currentJudge.name}'s Verdict</div>
                    <div className="judge-role">{currentJudge.role}</div>
                  </div>
                </div>
                
                <button 
                  className="details-toggle"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Judge Reasoning'}
                  <Sparkles size={16} />
                </button>

                {showDetails && (
                  <div className="verdict-details">
                    <div className="reasoning-text">
                      <div className="quote-decoration"></div>
                      {aiReasoning}
                      <div className="quote-decoration closing"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Round Countdown */}
            <div className="next-round">
              <div className="countdown-container">
                <RefreshCw size={20} className="refresh-icon" />
                <div className="countdown-text">
                  <span className="countdown-label">Next Battle In</span>
                  <span className="countdown-timer">{nextRoundCountdown}s</span>
                </div>
              </div>
              <div className="next-round-subtitle">
                Prepare for the next challenge
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Fixed overlay covering entire screen */
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

        /* Backdrop blur effect */
        .results-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.4);
          animation: backdropFadeIn 0.6s ease-out;
        }

        @keyframes backdropFadeIn {
          from { 
            backdrop-filter: blur(0px);
            background: rgba(0, 0, 0, 0);
          }
          to { 
            backdrop-filter: blur(8px);
            background: rgba(0, 0, 0, 0.4);
          }
        }

        .results-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          z-index: 1001;
        }

        /* Custom scrollbar for container */
        .results-container::-webkit-scrollbar {
          width: 6px;
        }

        .results-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .results-container::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 3px;
        }

        .results-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }

        /* Subtelne tło zamiast agresywnych particles */
        .subtle-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          border-radius: 24px;
        }

        .subtle-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 215, 0, 0.3);
          border-radius: 50%;
          animation: subtleFloat ease-in-out infinite;
        }

        @keyframes subtleFloat {
          0%, 100% {
            transform: translateY(0px) scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) scale(1);
            opacity: 0.6;
          }
        }

        /* Main Winner Card */
        .winner-card {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, 
            rgba(26, 26, 38, 0.98) 0%,
            rgba(22, 33, 62, 0.98) 50%,
            rgba(13, 13, 20, 0.98) 100%
          );
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transform: translateY(30px) scale(0.95);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .winner-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, 
            transparent, 
            rgba(255, 215, 0, 0.05), 
            transparent, 
            rgba(255, 92, 170, 0.05), 
            transparent
          );
          background-size: 400% 400%;
          animation: gentleShimmer 8s ease-in-out infinite;
          border-radius: 24px;
        }

        .winner-card.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        @keyframes gentleShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Header */
        .winner-header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
          z-index: 2;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
        }

        .winner-header.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .trophy-container {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }

        .trophy-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.2), transparent);
          border-radius: 50%;
          animation: gentleTrophyGlow 4s ease-in-out infinite;
        }

        .trophy-icon {
          position: relative;
          z-index: 2;
          color: #FFD700;
          filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4));
          animation: gentleBounce 6s ease-in-out infinite;
        }

        .crown-effect {
          position: absolute;
          top: -12px;
          right: -12px;
          color: rgba(255, 92, 170, 0.8);
          animation: gentleRotate 8s linear infinite;
          filter: drop-shadow(0 0 8px rgba(255, 92, 170, 0.5));
        }

        @keyframes gentleTrophyGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
        }

        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes gentleRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .header-text h1 {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9, #FFD700);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: slowRainbow 6s linear infinite;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .flame-icon {
          color: #FF6B6B;
          animation: gentleFlame 3s ease-in-out infinite;
        }

        @keyframes gentleFlame {
          0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
          50% { transform: scale(1.05); filter: hue-rotate(5deg); }
        }

        @keyframes slowRainbow {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        .victory-subtitle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #00D2E9;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Winner Info */
        .winner-info {
          margin-bottom: 30px;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
        }

        .winner-info.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .winner-identity {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          padding: 25px;
          background: rgba(255, 215, 0, 0.03);
          border: 1px solid rgba(255, 215, 0, 0.15);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .winner-identity::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 215, 0, 0.05), 
            transparent
          );
          animation: gentleSweep 6s ease-in-out infinite;
        }

        @keyframes gentleSweep {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }

        .address-display, .prize-display {
          text-align: center;
          position: relative;
          z-index: 2;
          flex: 1;
          min-width: 0;
        }

        .address-label, .prize-label {
          font-size: 0.9rem;
          color: #9999A5;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .address-value {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          color: #FFD700;
          font-weight: 700;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .champion-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #00D2E9, #FF5CAA);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          animation: gentlePulse 4s ease-in-out infinite;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @keyframes gentlePulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 15px rgba(0, 210, 233, 0.3);
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 0 20px rgba(255, 92, 170, 0.4);
          }
        }

        .prize-amount {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1.7rem;
          font-weight: 800;
          color: #00D2E9;
          margin-bottom: 8px;
          animation: prizeGlow 3s ease-in-out infinite;
        }

        @keyframes prizeGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 210, 233, 0.4)); }
          50% { filter: drop-shadow(0 0 12px rgba(0, 210, 233, 0.6)); }
        }

        .payout-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(0, 210, 233, 0.8);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .payout-link:hover {
          background: rgba(0, 210, 233, 0.1);
          color: #00D2E9;
          transform: translateY(-1px);
        }

        /* Winning Roast */
        .winning-roast {
          margin-bottom: 30px;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s;
        }

        .winning-roast.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .roast-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #FF5CAA;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .roast-content {
          position: relative;
          background: linear-gradient(135deg, 
            rgba(255, 92, 170, 0.05) 0%,
            rgba(255, 215, 0, 0.03) 50%,
            rgba(0, 210, 233, 0.05) 100%
          );
          border: 1px solid rgba(255, 92, 170, 0.2);
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          overflow: hidden;
        }

        .roast-content::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(45deg, 
            rgba(255, 92, 170, 0.3), 
            rgba(255, 215, 0, 0.3), 
            rgba(0, 210, 233, 0.3), 
            rgba(255, 92, 170, 0.3)
          );
          background-size: 400% 400%;
          animation: gentleBorderGlow 6s ease-in-out infinite;
          border-radius: 20px;
          z-index: -1;
        }

        @keyframes gentleBorderGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .roast-quote-mark {
          font-size: 3rem;
          color: rgba(255, 215, 0, 0.25);
          font-family: serif;
          line-height: 1;
          position: absolute;
          font-weight: bold;
        }

        .roast-quote-mark:not(.closing) {
          top: 10px;
          left: 15px;
        }

        .roast-quote-mark.closing {
          bottom: -5px;
          right: 15px;
          transform: rotate(180deg);
        }

        .roast-text {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #E6E6E6;
          font-style: italic;
          margin: 20px 0;
          position: relative;
          z-index: 2;
          font-weight: 500;
        }

        /* Judge Verdict */
        .judge-verdict {
          margin-bottom: 30px;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.9s;
        }

        .judge-verdict.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .verdict-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          padding: 20px;
          background: rgba(10, 10, 10, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(60, 75, 95, 0.25);
        }

        .judge-avatar {
          position: relative;
          width: 56px;
          height: 56px;
        }

        .judge-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .judge-glow {
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 50%;
          opacity: 0.2;
          animation: gentleJudgeGlow 4s ease-in-out infinite;
        }

        @keyframes gentleJudgeGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }

        .judge-info {
          flex: 1;
        }

        .judge-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #E6E6E6;
          margin-bottom: 4px;
        }

        .judge-role {
          font-size: 0.9rem;
          color: #9999A5;
          opacity: 0.8;
        }

        .details-toggle {
          background: linear-gradient(135deg, rgba(255, 92, 170, 0.15), rgba(255, 215, 0, 0.15));
          border: 1px solid rgba(255, 92, 170, 0.3);
          color: #FF5CAA;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
        }

        .details-toggle:hover {
          background: linear-gradient(135deg, rgba(255, 92, 170, 0.25), rgba(255, 215, 0, 0.25));
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 92, 170, 0.2);
        }

        .verdict-details {
          margin-top: 20px;
          padding: 25px;
          background: linear-gradient(135deg, rgba(26, 26, 38, 0.7), rgba(22, 33, 62, 0.7));
          border-radius: 16px;
          border: 1px solid rgba(60, 75, 95, 0.25);
          animation: slideDown 0.4s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reasoning-text {
          position: relative;
          font-size: 1rem;
          line-height: 1.6;
          color: #B8B8C2;
          font-style: italic;
          text-align: center;
          padding: 0 20px;
        }

        .quote-decoration {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent);
          margin: 0 auto 15px;
        }

        .quote-decoration.closing {
          margin: 15px auto 0;
        }

        /* Next Round */
        .next-round {
          text-align: center;
          padding: 25px;
          background: linear-gradient(135deg, rgba(0, 210, 233, 0.05), rgba(255, 92, 170, 0.05));
          border: 1px solid rgba(0, 210, 233, 0.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .next-round::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(0, 210, 233, 0.1), 
            transparent
          );
          animation: nextRoundSweep 4s ease-in-out infinite;
        }

        @keyframes nextRoundSweep {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .countdown-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
        }

        .refresh-icon {
          color: #00D2E9;
          animation: gentleRefreshSpin 4s linear infinite;
        }

        @keyframes gentleRefreshSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .countdown-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .countdown-label {
          font-size: 0.9rem;
          color: #9999A5;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .countdown-timer {
          font-size: 1.8rem;
          font-weight: 900;
          color: #00D2E9;
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 15px rgba(0, 210, 233, 0.4);
        }

        .next-round-subtitle {
          color: #B8B8C2;
          font-size: 0.9rem;
          font-weight: 500;
          position: relative;
          z-index: 2;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .results-overlay {
            padding: 15px;
          }

          .winner-card {
            padding: 25px;
          }

          .header-text h1 {
            font-size: 1.8rem;
            gap: 10px;
          }

          .winner-identity {
            flex-direction: column;
            gap: 20px;
          }

          .roast-text {
            font-size: 1.1rem;
          }

          .countdown-timer {
            font-size: 1.5rem;
          }

          .verdict-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
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
            font-size: 1.5rem;
            flex-direction: column;
            gap: 8px;
          }

          .prize-amount {
            font-size: 1.4rem;
          }

          .roast-text {
            font-size: 1rem;
          }

          .results-container {
            max-height: 95vh;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .winner-card {
            padding: 15px;
          }

          .header-text h1 {
            font-size: 1.3rem;
          }

          .trophy-icon {
            width: 48px;
            height: 48px;
          }

          .crown-effect {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>
    </>
  );
};

export default ResultsPhase; 