import React from 'react';
import { Flame, Zap, Clock, Coins } from 'lucide-react';

const RoastInput = ({
  currentJudge,
  roastText,
  setRoastText,
  joinRound,
  isSubmitting,
  isConnected,
  isSubmissionDisabled
}) => {
  return (
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
  );
};

export default RoastInput; 