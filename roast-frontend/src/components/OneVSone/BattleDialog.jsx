import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';

const BattleDialog = ({ 
  dialog, 
  battleStatus, 
  ogCharacter, 
  roasterCharacter, 
  currentJudge 
}) => {
  const [displayedDialog, setDisplayedDialog] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll within chat container only - doesn't affect page scroll
  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
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

  return (
    <>
      <div className="dialog-chat">
        <div className="chat-header">
          <h3>
            <MessageSquare 
              className="dialog-icon" 
              style={{ color: currentJudge?.color || '#FFD700' }}
            />
            <span className="dialog-gradient-text">Battle Dialog</span>
          </h3>
        </div>
        
        <div className="chat-messages">
          {displayedDialog.map((msg, index) => (
            <div key={index} className={`message ${msg.speaker}`}>
              <div className="message-avatar" style={{
                  border: `2px solid ${currentJudge?.color || '#FFD700'}`,
                  boxShadow: `0 0 8px ${currentJudge?.color || '#FFD700'}30`
                }}>
                {msg.speaker === 'og' && ogCharacter?.id ? (
                  <img 
                    src={`/${ogCharacter.id}.jpg`}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : msg.speaker === 'roaster' && roasterCharacter?.id ? (
                  <img 
                    src={`/avatars/${roasterCharacter.id}.png`}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="fallback-avatar" style={{ 
                  display: (msg.speaker === 'og' && ogCharacter?.id) || 
                           (msg.speaker === 'roaster' && roasterCharacter?.id) ? 'none' : 'flex' 
                }}>
                  {msg.speaker === 'og' ? ogCharacter?.name?.[0] || '0' : roasterCharacter?.name?.[0] || 'R'}
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
              <div className="message-avatar" style={{
                  border: `2px solid ${currentJudge?.color || '#FFD700'}`,
                  boxShadow: `0 0 8px ${currentJudge?.color || '#FFD700'}30`
                }}>
                {dialog[currentMessageIndex]?.speaker === 'og' && ogCharacter?.id ? (
                  <img 
                    src={`/${ogCharacter.id}.jpg`}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : dialog[currentMessageIndex]?.speaker === 'roaster' && roasterCharacter?.id ? (
                  <img 
                    src={`/avatars/${roasterCharacter.id}.png`}
                    alt=""
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="fallback-avatar" style={{ 
                  display: (dialog[currentMessageIndex]?.speaker === 'og' && ogCharacter?.id) || 
                           (dialog[currentMessageIndex]?.speaker === 'roaster' && roasterCharacter?.id) ? 'none' : 'flex' 
                }}>
                  {dialog[currentMessageIndex]?.speaker === 'og' ? ogCharacter?.name?.[0] || '0' : roasterCharacter?.name?.[0] || 'R'}
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

      <style jsx>{`
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
          text-align: center;
        }

        .chat-header h3 {
          color: #E6E6E6;
          font-size: 18px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          line-height: 1;
        }

        .dialog-icon {
          width: 20px;
          height: 20px;
          filter: drop-shadow(0 0 6px currentColor);
          animation: dialogIconGlow 2.5s ease-in-out infinite alternate;
          transition: color 0.3s ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        @keyframes dialogIconGlow {
          0% { 
            filter: drop-shadow(0 0 6px currentColor); 
            transform: scale(1);
          }
          100% { 
            filter: drop-shadow(0 0 12px currentColor); 
            transform: scale(1.03);
          }
        }

        .dialog-gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          font-weight: 700;
          display: inline-block;
          line-height: 1;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
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

        .fallback-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          background: currentColor;
          opacity: 0.2;
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .dialog-icon {
            width: 18px;
            height: 18px;
          }
        }

        @media (max-width: 768px) {
          .dialog-icon {
            width: 16px;
            height: 16px;
          }

          .message-content {
            max-width: 85%;
          }
        }

        @media (max-width: 480px) {
          .dialog-icon {
            width: 14px;
            height: 14px;
          }

          .message-content {
            max-width: 90%;
            padding: 10px 12px;
          }

          .message-text {
            font-size: 13px;
          }

          .message-speaker {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default BattleDialog; 