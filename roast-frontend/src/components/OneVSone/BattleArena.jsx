import React, { useState, useEffect, useRef } from 'react';
import { Clock, Swords, Trophy } from 'lucide-react';

const BattleArena = ({ 
  currentBattle,
  battleStatus,
  ogCharacter,
  roasterCharacter,
  timeLeft,
  formatTime,
  dialog,
  winner,
  winnerReasoning
}) => {
  const [displayedDialog, setDisplayedDialog] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedDialog, typedText]);

  // Typing animation effect
  useEffect(() => {
    if (dialog && dialog.length > currentMessageIndex) {
      const currentMsg = dialog[currentMessageIndex];
      
      if (!isTyping) {
        setIsTyping(true);
        setTypedText('');
        
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex < currentMsg.message.length) {
            setTypedText(prev => prev + currentMsg.message[charIndex]);
            charIndex++;
          } else {
            clearInterval(typeInterval);
            setIsTyping(false);
            setDisplayedDialog(prev => [...prev, currentMsg]);
            setCurrentMessageIndex(prev => prev + 1);
            setTypedText('');
          }
        }, 30); // Typing speed
        
        return () => clearInterval(typeInterval);
      }
    }
  }, [dialog, currentMessageIndex, isTyping]);

  // Reset when new battle starts
  useEffect(() => {
    if (battleStatus === 'waiting_bets') {
      setDisplayedDialog([]);
      setCurrentMessageIndex(0);
      setTypedText('');
      setIsTyping(false);
    }
  }, [battleStatus]);

  const getStatusMessage = () => {
    switch (battleStatus) {
      case 'waiting_bets':
        return 'Place your bets! Battle starts when minimum bets are reached.';
      case 'countdown':
        return `Battle starting in ${formatTime(timeLeft)}!`;
      case 'generating':
        return 'AI is preparing an epic roast battle...';
      case 'dialog':
        return 'Battle in progress! Watch the roasts fly!';
      case 'completed':
        return `Battle complete! ${winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} wins!`;
      default:
        return 'Waiting for next battle...';
    }
  };

  return (
    <>
      <div className="battle-arena">
        {/* Title */}
        <div className="arena-title">
          <h2>Battle Arena</h2>
          <p className="status-message">{getStatusMessage()}</p>
        </div>

        {/* Characters VS Display */}
        <div className="characters-display">
          <div className={`character-card og-card ${winner === 'og' ? 'winner' : ''}`}>
            <div className="character-icon" style={{ color: ogCharacter?.color }}>
              <img src={`/avatars/${ogCharacter?.id || 'default'}.png`} 
                   alt={ogCharacter?.name} 
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'block';
                   }}
              />
              <div className="fallback-icon" style={{ display: 'none' }}>
                {ogCharacter?.name?.[0] || '?'}
              </div>
            </div>
            <h3>{ogCharacter?.name || 'Selecting...'}</h3>
            <p>{ogCharacter?.role || '0G Team'}</p>
          </div>

          <div className="vs-divider">
            <Swords size={40} className="vs-icon" />
            <span>VS</span>
          </div>

          <div className={`character-card roaster-card ${winner === 'roaster' ? 'winner' : ''}`}>
            <div className="character-icon" style={{ color: roasterCharacter?.color }}>
              <img src={`/avatars/${roasterCharacter?.id || 'default'}.png`} 
                   alt={roasterCharacter?.name}
                   onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'block';
                   }}
              />
              <div className="fallback-icon" style={{ display: 'none' }}>
                {roasterCharacter?.name?.[0] || '?'}
              </div>
            </div>
            <h3>{roasterCharacter?.name || 'Selecting...'}</h3>
            <p>{roasterCharacter?.role || 'Crypto Roaster'}</p>
          </div>
        </div>

        {/* Timer */}
        {timeLeft > 0 && battleStatus === 'countdown' && (
          <div className="countdown-timer">
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Chat Dialog */}
        <div className="dialog-chat">
          <div className="chat-header">
            <h3>Battle Dialog</h3>
          </div>
          
          <div className="chat-messages">
            {displayedDialog.map((msg, index) => (
              <div key={index} className={`message ${msg.speaker}`}>
                <div className="message-avatar">
                  <img 
                    src={`/avatars/${msg.speaker === 'og' ? ogCharacter?.id : roasterCharacter?.id}.png`}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="fallback-avatar" style={{ display: 'none' }}>
                    {msg.speaker === 'og' ? ogCharacter?.name?.[0] : roasterCharacter?.name?.[0]}
                  </div>
                </div>
                <div className="message-content">
                  <div className="message-speaker">
                    {msg.speaker === 'og' ? ogCharacter?.name : roasterCharacter?.name}
                  </div>
                  <div className="message-text">{msg.message}</div>
                  {msg.impact && (
                    <div className="message-impact">Impact: {msg.impact}/10</div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Currently typing message */}
            {isTyping && typedText && (
              <div className={`message ${dialog[currentMessageIndex]?.speaker} typing`}>
                <div className="message-avatar">
                  <img 
                    src={`/avatars/${dialog[currentMessageIndex]?.speaker === 'og' ? ogCharacter?.id : roasterCharacter?.id}.png`}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="fallback-avatar" style={{ display: 'none' }}>
                    {dialog[currentMessageIndex]?.speaker === 'og' ? ogCharacter?.name?.[0] : roasterCharacter?.name?.[0]}
                  </div>
                </div>
                <div className="message-content">
                  <div className="message-speaker">
                    {dialog[currentMessageIndex]?.speaker === 'og' ? ogCharacter?.name : roasterCharacter?.name}
                  </div>
                  <div className="message-text">
                    {typedText}
                    <span className="typing-cursor">|</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Winner Display */}
        {winner && (
          <div className="winner-display">
            <Trophy size={30} />
            <h3>{winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} Wins!</h3>
            <p>{winnerReasoning}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .battle-arena {
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .arena-title {
          text-align: center;
          margin-bottom: 10px;
        }

        .arena-title h2 {
          color: #E6E6E6;
          font-size: 32px;
          margin-bottom: 8px;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .status-message {
          color: #9999A5;
          font-size: 14px;
        }

        .characters-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          padding: 20px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 12px;
        }

        .character-card {
          text-align: center;
          padding: 20px;
          background: rgba(40, 40, 50, 0.6);
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .character-card.winner {
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        }

        .character-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 12px;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(60, 60, 70, 0.5);
        }

        .character-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fallback-icon,
        .fallback-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          background: currentColor;
          opacity: 0.2;
        }

        .character-card h3 {
          color: #E6E6E6;
          font-size: 18px;
          margin-bottom: 4px;
        }

        .character-card p {
          color: #9999A5;
          font-size: 14px;
        }

        .vs-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #FFD700;
        }

        .vs-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .countdown-timer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          color: #FFD700;
          font-size: 20px;
          font-weight: 600;
        }

        .dialog-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 12px;
          overflow: hidden;
        }

        .chat-header {
          padding: 16px;
          background: rgba(40, 40, 50, 0.6);
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .chat-header h3 {
          color: #E6E6E6;
          font-size: 18px;
          margin: 0;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
          animation: slideIn 0.3s ease-out;
        }

        .message.og {
          align-self: flex-start;
        }

        .message.roaster {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(60, 60, 70, 0.5);
          flex-shrink: 0;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message-content {
          max-width: 70%;
          background: rgba(50, 50, 60, 0.8);
          padding: 12px 16px;
          border-radius: 12px;
        }

        .message.og .message-content {
          border-bottom-left-radius: 4px;
        }

        .message.roaster .message-content {
          border-bottom-right-radius: 4px;
          background: rgba(70, 50, 60, 0.8);
        }

        .message-speaker {
          color: #FFD700;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .message-text {
          color: #E6E6E6;
          font-size: 14px;
          line-height: 1.4;
        }

        .message-impact {
          color: #9999A5;
          font-size: 12px;
          margin-top: 8px;
        }

        .typing-cursor {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .winner-display {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
          border: 2px solid #FFD700;
          border-radius: 12px;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
        }

        .winner-display h3 {
          color: #FFD700;
          font-size: 24px;
          margin: 12px 0;
        }

        .winner-display p {
          color: #E6E6E6;
          font-size: 16px;
        }

        /* Scrollbar styling */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 140, 0.7);
        }
      `}</style>
    </>
  );
};

export default BattleArena; 