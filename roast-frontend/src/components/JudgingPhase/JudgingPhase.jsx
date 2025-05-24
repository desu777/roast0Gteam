import React from 'react';

const JudgingPhase = ({ currentJudge, participants }) => {
  return (
    <>
      <div className="judging-phase">
        <div className="judging-display">
          <div className="judge-thinking">
            <div className="judge-avatar-thinking" style={{ background: currentJudge.color }}>
              <currentJudge.icon size={48} />
            </div>
            <div className="thinking-animation">
              <div className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          <h2>{currentJudge.name} is analyzing {participants.length} roasts...</h2>
          <p>AI is processing all submissions based on {currentJudge.name}'s personality and preferences</p>
        </div>
      </div>

      <style jsx>{`
        .judging-phase {
          text-align: center;
          padding: 60px 20px;
        }

        .judging-display {
          max-width: 500px;
          margin: 0 auto;
        }

        .judge-thinking {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
        }

        .judge-avatar-thinking {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          margin-bottom: 20px;
          animation: judgeThinking 2s infinite;
        }

        @keyframes judgeThinking {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .thinking-animation {
          margin-bottom: 30px;
        }

        .thinking-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .thinking-dots span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00D2E9;
          animation: thinkingDots 1.4s infinite;
        }

        .thinking-dots span:nth-child(1) { animation-delay: 0s; }
        .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes thinkingDots {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        .judging-display h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #E6E6E6;
        }

        .judging-display p {
          color: #9999A5;
          font-size: 16px;
          line-height: 1.5;
        }
      `}</style>
    </>
  );
};

export default JudgingPhase; 