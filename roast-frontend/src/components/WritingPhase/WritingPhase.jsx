import React from 'react';
import { Timer, Users, Coins, Send, Zap, Trophy } from 'lucide-react';

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
  return (
    <>
      <div className="writing-phase">
        <div className="round-status">
          <div className="timer-section">
            <div className="timer-display">
              <Timer size={24} />
              <span className="timer-text">{formatTime(timeLeft)}</span>
            </div>
            <p className="timer-label">Time to submit roasts</p>
          </div>
          
          <div className="participants-count">
            <Users size={20} />
            <span>{participants.length} roasters joined</span>
          </div>
        </div>

        <div className="writing-section">
          <div className="writing-prompt">
            <h3>🔥 Roast the 0G Team for {currentJudge.name}!</h3>
          </div>

          {!userSubmitted ? (
            <div className="roast-input-container">
              <textarea
                value={roastText}
                onChange={(e) => setRoastText(e.target.value)}
                placeholder={`Write your best roast for ${currentJudge.name} to judge...

Example: "${currentJudge.name}'s code is so optimized, even their coffee breaks are asynchronous..."`}
                maxLength={280}
                className="roast-textarea"
              />
              <div className="input-footer">
                <span className="char-count">{roastText.length}/280</span>
                <div className="entry-fee">
                  <Coins size={16} />
                  <span>0.025 0G entry</span>
                </div>
              </div>
              
              <button
                className="submit-roast-btn"
                onClick={joinRound}
                disabled={!roastText.trim() || isSubmitting || !isConnected}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Submitting...
                  </>
                ) : !isConnected ? (
                  <>
                    <Zap size={20} />
                    Connect to Submit
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Roast
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="submitted-status">
              <div className="submitted-badge">
                <Trophy size={24} />
                <h3>Roast Submitted!</h3>
                <p>Your roast is in the battle. {currentJudge.name} will judge when time runs out.</p>
              </div>
            </div>
          )}
        </div>

        {participants.length > 0 && (
          <div className="live-participants">
            <h4>🥊 Roasters in Battle ({participants.length})</h4>
            <div className="participants-grid">
              {participants.slice(0, 6).map((participant, index) => (
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
              {participants.length > 6 && (
                <div className="more-participants">
                  +{participants.length - 6} more
                </div>
              )}
            </div>
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
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #E6E6E6;
        }

        .roast-input-container {
          margin-bottom: 24px;
        }

        .roast-textarea {
          width: 100%;
          min-height: 150px;
          background: rgba(10, 10, 10, 0.9);
          border: 2px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          font-size: 16px;
          color: #E6E6E6;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.3s ease;
          line-height: 1.6;
        }

        .roast-textarea:focus {
          border-color: #00D2E9;
          box-shadow: 0 0 0 3px rgba(0, 210, 233, 0.2);
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .char-count {
          color: #9999A5;
          font-size: 14px;
        }

        .entry-fee {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #FFD700;
          font-weight: 600;
        }

        .submit-roast-btn {
          width: 100%;
          background: linear-gradient(135deg, #FF5CAA, #E74C3C);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 18px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .submit-roast-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 92, 170, 0.4);
        }

        .submit-roast-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .submitted-status {
          text-align: center;
          padding: 40px 20px;
        }

        .submitted-badge {
          background: rgba(0, 184, 151, 0.1);
          border: 2px solid #00B897;
          border-radius: 20px;
          padding: 30px;
          max-width: 400px;
          margin: 0 auto;
        }

        .submitted-badge h3 {
          color: #00B897;
          font-size: 24px;
          margin-bottom: 12px;
        }

        .submitted-badge p {
          color: #9999A5;
          line-height: 1.5;
        }

        .live-participants {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .live-participants h4 {
          color: #E6E6E6;
          margin-bottom: 16px;
          font-size: 18px;
        }

        .participants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .participant-card {
          background: rgba(10, 10, 10, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 12px;
          position: relative;
        }

        .participant-card.user-participant {
          border-color: #00D2E9;
          background: rgba(0, 210, 233, 0.05);
        }

        .participant-address {
          font-family: 'Courier New', monospace;
          color: #9999A5;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .you-badge {
          background: linear-gradient(135deg, #00D2E9, #FF5CAA);
          color: white;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .more-participants {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 12px;
          color: #9999A5;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .round-status {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .participants-grid {
            grid-template-columns: 1fr;
          }

          .timer-text {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default WritingPhase; 