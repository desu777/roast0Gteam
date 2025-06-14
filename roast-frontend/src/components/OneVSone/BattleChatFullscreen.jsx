import React, { useRef, useEffect } from 'react';

const BattleChatFullscreen = ({ 
  phaseTransition, 
  ogCharacter, 
  roasterCharacter, 
  dialog,
  showTypingIndicator,
  currentTypingSpeaker,
  getCharacterAvatar
}) => {
  const chatEndRef = useRef(null);

  // Auto-scroll within chat container only - doesn't affect page scroll
  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [dialog]);

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!showTypingIndicator || !currentTypingSpeaker) return null;
    
    const character = currentTypingSpeaker === 'og' ? ogCharacter : roasterCharacter;
    const avatarUrl = getCharacterAvatar(character, currentTypingSpeaker);
    
    return (
      <div className={`message ${currentTypingSpeaker} typing-message`}>
        <div className="message-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={character?.name} />
          ) : (
            <span>{character?.name?.[0] || '?'}</span>
          )}
        </div>
        <div className="message-content">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`battle-chat-fullscreen ${phaseTransition}`}>
      <div className="chat-header">
        <div className="chat-participants">
          <div className="participant og">
            <div className="participant-avatar">
              {getCharacterAvatar(ogCharacter, 'og') ? (
                <img src={getCharacterAvatar(ogCharacter, 'og')} alt={ogCharacter?.name} />
              ) : (
                <span>{ogCharacter?.name?.[0] || '?'}</span>
              )}
            </div>
            <span>{ogCharacter?.name}</span>
          </div>
          <div className="participant roaster">
            <div className="participant-avatar">
              {getCharacterAvatar(roasterCharacter, 'roaster') ? (
                <img src={getCharacterAvatar(roasterCharacter, 'roaster')} alt={roasterCharacter?.name} />
              ) : (
                <span>{roasterCharacter?.name?.[0] || '?'}</span>
              )}
            </div>
            <span>{roasterCharacter?.name}</span>
          </div>
        </div>
      </div>
      
      <div className="chat-messages">
        {dialog.map((msg, index) => {
          const character = msg.speaker === 'og' ? ogCharacter : roasterCharacter;
          const avatarUrl = getCharacterAvatar(character, msg.speaker);
          
          return (
            <div key={`${msg.speaker}-${index}-${msg.message.slice(0, 20)}`} className={`message ${msg.speaker}`}>
              <div className="message-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={character?.name} />
                ) : (
                  <span>{character?.name?.[0] || '?'}</span>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{character?.name}</span>
                </div>
                <div className="message-text">{msg.message}</div>
                <div className="message-impact">Impact: {msg.impact}/10</div>
              </div>
            </div>
          );
        })}
        {renderTypingIndicator()}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default BattleChatFullscreen; 