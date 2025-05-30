import React, { useState } from 'react';
import { Clock, Users, Coins, Send, Zap, Trophy, Flame, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import BurningRoastEffect from '../BurningRoastEffect/BurningRoastEffect';

const WritingPhase = ({ 
  currentJudge,
  timeLeft,
  formatTime,
  participants,
  roastText,
  setRoastText,
  userSubmitted,
  isSubmitting,
  isConnected,
  joinRound
}) => {
  
  // Check if submissions should be disabled (less than 10 seconds left)
  const isSubmissionDisabled = timeLeft !== null && timeLeft < 10;
  
  // State for showing all participants
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  // Calculate how many participants to show
  const maxVisible = 4;
  const visibleParticipants = showAllParticipants 
    ? participants 
    : participants.slice(0, maxVisible);

  return (
    <>
      <div className="writing-phase">
        <div className="round-status">
          <div className="timer-section">
            <div className="timer-display">
              <Clock size={24} />
              <span className={`timer-text ${isSubmissionDisabled ? 'timer-warning' : ''}`}>{formatTime(timeLeft)}</span>
            </div>
            <p className="timer-label">
              {isSubmissionDisabled ? 'Submissions closing!' : 'Time to submit roasts'}
            </p>
          </div>
          
          <div className="participants-count">
            <Users size={20} />
            <span>{participants.length} roasters joined</span>
          </div>
        </div>

        <div className="writing-section">
          <div className="writing-prompt">
            <h3>
              <Flame size={20} className="fire-icon" />
              Roast the 0G Team for {currentJudge.name}!
              <Flame size={20} className="fire-icon" />
            </h3>
          </div>

          {!userSubmitted ? (
            <div className="roast-input-container">
              <div className="roast-input-wrapper">
                <div className="flame-border">
                  <div className="flame flame-1"></div>
                  <div className="flame flame-2"></div>
                  <div className="flame flame-3"></div>
                  <div className="flame flame-4"></div>
                </div>
                
                <textarea
                  value={roastText}
                  onChange={(e) => setRoastText(e.target.value)}
                  placeholder={`Unleash your hottest roast for ${currentJudge.name}...

"${currentJudge.name}'s code is so optimized, even their coffee breaks are asynchronous..."`}
                  maxLength={280}
                  className="roast-textarea"
                />
                
                <div className="textarea-footer">
                  <span className="char-count">
                    <span className={roastText.length > 200 ? 'warning' : ''}>
                      {roastText.length}
                    </span>/280
                  </span>
                  <div className="flame-indicator">
                    {roastText.length > 0 && roastText.length <= 50 && <Flame size={14} />}
                    {roastText.length > 50 && roastText.length <= 150 && (
                      <>
                        <Flame size={14} />
                        <Flame size={14} />
                      </>
                    )}
                    {roastText.length > 150 && (
                      <>
                        <Flame size={14} />
                        <Flame size={14} />
                        <Flame size={14} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                className={`submit-roast-btn ${roastText.trim() ? 'ready' : ''} ${isSubmissionDisabled ? 'disabled' : ''}`}
                onClick={joinRound}
                disabled={!roastText.trim() || isSubmitting || !isConnected || isSubmissionDisabled}
              >
                <div className="btn-flame-bg"></div>
                <div className="btn-content">
                  {isSubmitting ? (
                    <>
                      <div className="spinner" />
                      <span>Igniting...</span>
                    </>
                  ) : !isConnected ? (
                    <>
                      <Zap size={20} />
                      <span>Connect to Roast</span>
                    </>
                  ) : isSubmissionDisabled ? (
                    <>
                      <Clock size={20} />
                      <span>Time's Up!</span>
                    </>
                  ) : (
                    <>
                      <Flame size={20} className="fire-icon" />
                      <span>Drop the Roast!</span>
                      <Flame size={20} className="fire-icon" />
                    </>
                  )}
                </div>
              </button>
              
              <div className="entry-fee-badge">
                <Coins size={14} />
                <span>0.025 0G entry</span>
              </div>
            </div>
          ) : (
            <BurningRoastEffect 
              currentJudge={currentJudge}
              participants={participants}
            />
          )}
        </div>

        {participants.length > 0 && (
          <div className="live-participants">
            <h4><Swords size={18} className="inline-icon" /> Roasters in Battle ({participants.length})</h4>
            <div className="participants-grid">
              {visibleParticipants.map((participant, index) => (
                <div key={index} className={`participant-card ${participant.isUser ? 'user-participant' : ''}`}>
                  <div className="participant-address">
                    {/* Skrócona wersja adresu */}
                    {participant.address ? 
                      `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}` : 
                      'Anonymous'
                    }
                    {participant.isUser && <span className="you-badge">YOU</span>}
                  </div>
                </div>
              ))}
            </div>
            
            {participants.length > maxVisible && (
              <button 
                className="show-more-btn"
                onClick={() => setShowAllParticipants(!showAllParticipants)}
              >
                {showAllParticipants ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show More ({participants.length - maxVisible} more)
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .writing-phase {
          max-width: 800px;
          margin: 0 auto;
        }

        .round-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 24px;
          background: rgba(18, 18, 24, 0.9);
          border-radius: 16px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .timer-section {
          text-align: center;
        }

        .timer-display {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .timer-text {
          font-size: 32px;
          font-weight: 700;
          color: #FFD700;
          font-family: 'Courier New', monospace;
        }

        .timer-text.timer-warning {
          color: #FF5C5C;
          animation: warningBlink 1s ease-in-out infinite;
        }

        @keyframes warningBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .timer-label {
          color: #9999A5;
          font-size: 14px;
        }

        .participants-count {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #00D2E9;
          font-weight: 600;
        }

        .writing-section {
          margin-bottom: 30px;
        }

        .writing-prompt {
          text-align: center;
          margin-bottom: 30px;
        }

        .writing-prompt h3 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #FFD700, #FF6B6B, #FF5CAA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fireGlow 2s ease-in-out infinite alternate;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.2;
        }

        @keyframes fireGlow {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 107, 107, 0.5)); }
        }

        .fire-icon {
          color: #FF6B6B;
          animation: fireWiggle 1s ease-in-out infinite;
        }

        .inline-icon {
          display: inline-block;
          vertical-align: text-top;
          margin-right: 8px;
        }

        .flame-indicator {
          display: flex;
          gap: 4px;
          color: #FF6B6B;
        }

        @keyframes fireWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(1.1); }
          75% { transform: rotate(5deg) scale(1.1); }
        }

        /* Nowe style z efektami ognia */
        
        .fire-emoji {
          display: inline-block;
          animation: fireWiggle 1s ease-in-out infinite;
          margin: 0 8px;
        }

        @keyframes fireWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(1.1); }
          75% { transform: rotate(5deg) scale(1.1); }
        }

        .roast-input-container {
          margin-bottom: 24px;
        }

        .roast-input-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .flame-border {
          position: absolute;
          inset: -3px;
          border-radius: 20px;
          background: linear-gradient(
            45deg,
            #FFD700,
            #FF6B6B,
            #FF5CAA,
            #FFD700
          );
          background-size: 300% 300%;
          animation: flameGradient 3s ease infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .roast-textarea:focus ~ .flame-border {
          opacity: 1;
        }

        @keyframes flameGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .flame {
          position: absolute;
          width: 20px;
          height: 30px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .roast-textarea:focus ~ .flame-border .flame {
          opacity: 0.8;
        }

        .flame-1 {
          top: -15px;
          left: 20%;
          animation-delay: 0s;
        }

        .flame-2 {
          top: -15px;
          right: 20%;
          animation-delay: 0.3s;
        }

        .flame-3 {
          bottom: -15px;
          left: 30%;
          animation-delay: 0.6s;
        }

        .flame-4 {
          bottom: -15px;
          right: 30%;
          animation-delay: 0.9s;
        }

        @keyframes flameDance {
          0%, 100% { 
            transform: translateY(0) scale(1);
          }
          50% { 
            transform: translateY(-5px) scale(1.2);
          }
        }

        .roast-textarea {
          width: 100%;
          min-height: 180px;
          background: rgba(10, 10, 10, 0.95);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 24px;
          font-size: 16px;
          color: #E6E6E6;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.3s ease;
          line-height: 1.6;
          position: relative;
          z-index: 1;
          background-image: 
            linear-gradient(rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.95)),
            linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 92, 170, 0.1));
        }

        .roast-textarea:focus {
          border-color: rgba(255, 215, 0, 0.5);
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.2),
            inset 0 0 20px rgba(255, 215, 0, 0.05);
          transform: translateY(-2px);
        }

        .roast-textarea::placeholder {
          color: rgba(153, 153, 165, 0.7);
          font-style: italic;
        }

        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding: 0 8px;
        }

        .char-count {
          color: #9999A5;
          font-size: 14px;
          font-weight: 500;
        }

        .char-count span.warning {
          color: #FFD700;
          font-weight: 600;
        }

        .submit-roast-btn {
          width: 100%;
          background: linear-gradient(135deg, #1A0A0A, #2A0A0A);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 16px;
          padding: 0;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }

        .submit-roast-btn.ready {
          border-color: rgba(255, 215, 0, 0.6);
          animation: readyPulse 2s ease-in-out infinite;
        }

        @keyframes readyPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
          }
        }

        .btn-flame-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            transparent,
            rgba(255, 215, 0, 0.2),
            rgba(255, 92, 170, 0.2),
            transparent
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .submit-roast-btn:hover:not(:disabled) .btn-flame-bg {
          opacity: 1;
          animation: flameFlow 2s linear infinite;
        }

        @keyframes flameFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .btn-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          color: #FFD700;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 215, 0, 0.1));
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .submit-roast-btn:hover:not(:disabled) .btn-content {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 215, 0, 0.2));
          transform: scale(1.02);
        }

        .submit-roast-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 10px 30px rgba(255, 215, 0, 0.3),
            0 0 60px rgba(255, 92, 170, 0.2);
        }

        .submit-roast-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-roast-btn.disabled {
          border-color: rgba(255, 92, 92, 0.3);
          animation: none;
        }

        .submit-roast-btn.disabled .btn-content {
          background: linear-gradient(135deg, rgba(255, 92, 92, 0.1), rgba(100, 100, 100, 0.1));
          color: #FF5C5C;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-radius: 50%;
          border-top-color: #FFD700;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .entry-fee-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 20px;
          color: #FFD700;
          font-weight: 600;
          font-size: 14px;
          margin: 0 auto;
          width: fit-content;
        }

        .submitted-status {
          text-align: center;
          padding: 40px 20px;
        }

        .submitted-badge {
          background: rgba(0, 210, 233, 0.1);
          border: 2px solid rgba(0, 210, 233, 0.3);
          border-radius: 16px;
          padding: 30px;
          color: #00D2E9;
        }

        .submitted-badge h3 {
          margin: 16px 0 12px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .submitted-badge p {
          color: #E6E6E6;
          margin: 0;
          line-height: 1.5;
        }

        .live-participants {
          margin-top: 30px;
        }

        .live-participants h4 {
          margin-bottom: 16px;
          color: #E6E6E6;
          font-weight: 600;
        }

        .participants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        .participant-card {
          background: rgba(18, 18, 24, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .participant-card:hover {
          border-color: rgba(255, 215, 0, 0.3);
          transform: translateY(-2px);
        }

        .user-participant {
          border-color: rgba(0, 210, 233, 0.5);
          background: rgba(0, 210, 233, 0.1);
        }

        .participant-address {
          font-size: 14px;
          color: #E6E6E6;
          font-weight: 500;
        }

        .you-badge {
          background: #00D2E9;
          color: #0A0A0A;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          margin-left: 8px;
        }

        .show-more-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(18, 18, 24, 0.9), rgba(28, 28, 35, 0.9));
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: #FFD700;
          transition: all 0.3s ease;
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .show-more-btn:hover {
          background: linear-gradient(135deg, rgba(28, 28, 35, 0.9), rgba(38, 38, 45, 0.9));
          border-color: rgba(255, 215, 0, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
        }

        .show-more-btn:active {
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .round-status {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .roast-textarea {
            min-height: 150px;
            padding: 20px;
            font-size: 15px;
          }

          .submit-roast-btn {
            font-size: 16px;
          }

          .btn-content {
            padding: 16px;
          }

          .participants-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
        }
      `}</style>
    </>
  );
};

export default WritingPhase; 