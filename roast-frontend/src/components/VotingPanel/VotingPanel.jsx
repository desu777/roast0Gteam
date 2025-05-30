import React, { useEffect } from 'react';
import { Heart, Lock, Trophy, Vote, Crown, Sparkles, Loader } from 'lucide-react';
import { TEAM_MEMBERS } from '../../data/teamMembers';

const VotingPanel = ({ 
  // Live voting data from useGameState
  votingStats,
  userVote,
  votingLocked,
  isVoting,
  votingError,
  
  // Game state
  isConnected, 
  timeLeft, 
  currentPhase, 
  userAddress,
  
  // Actions
  onVote, // castVote from useGameState
  
  // Backward compatibility (legacy props)
  onVotingComplete // Will be handled by WebSocket
}) => {

  // Get voting data from backend stats
  const totalVotes = votingStats?.totalVotes || 0;
  const votesByCharacter = votingStats?.votesByCharacter || {};
  const votingWinner = votingStats?.winner?.characterId || null;

  // Check if voting should be disabled (less than 10 seconds left)
  const isVotingDisabled = timeLeft !== null && timeLeft < 10;

  // Calculate vote percentage
  const getVotePercentage = (characterVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((characterVotes / totalVotes) * 100);
  };

  // Handle vote casting
  const handleVote = (characterId) => {
    if (!isConnected || userVote || votingLocked || isVoting || isVotingDisabled) {
      console.log('🗳️ Vote blocked:', {
        connected: isConnected,
        userVote: !!userVote,
        votingLocked,
        isVoting,
        isVotingDisabled,
        timeLeft
      });
      return;
    }
    
    console.log('🗳️ Casting vote for:', characterId);
    onVote(characterId);
  };

  // Reset voting error after some time
  useEffect(() => {
    if (votingError) {
      const timer = setTimeout(() => {
        // votingError will be cleared by parent component
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [votingError]);

  return (
    <>
      <div className="voting-panel">
        <div className="voting-header">
          <h3><Vote size={18} /> Vote for Next Judge</h3>
          <div className="voting-status">
            {isVotingDisabled && !votingLocked && (
              <div className="voting-closing">
                <Lock size={14} />
                <span>Voting closing...</span>
              </div>
            )}
            {votingLocked && votingWinner && (
              <div className="voting-winner">
                <Trophy size={14} />
                <span>{TEAM_MEMBERS.find(m => m.id === votingWinner)?.name} wins!</span>
              </div>
            )}
            {votingLocked && !votingWinner && (
              <div className="voting-locked">
                <Lock size={14} />
                <span>Voting ended</span>
              </div>
            )}
            {!votingLocked && !isVotingDisabled && (
              <div className="vote-count">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Voting Error Display */}
        {votingError && (
          <div className="voting-error">
            <span>⚠️ {votingError}</span>
          </div>
        )}

        <div className="voting-list">
          {TEAM_MEMBERS.map(member => {
            const memberVotes = votesByCharacter[member.id] || 0;
            const percentage = getVotePercentage(memberVotes);
            const isWinner = votingWinner === member.id;
            const isUserVote = userVote === member.id;
            
            return (
              <div key={member.id} className={`voting-item ${isWinner ? 'winner' : ''} ${isUserVote ? 'user-voted' : ''}`}>
                <div className="voting-info">
                  <div 
                    className="voting-avatar" 
                    style={{ background: member.color }}
                  >
                    <img 
                      src={`/${member.id}.jpg`} 
                      alt={member.name}
                      className="voting-nft-image"
                    />
                    {isWinner && (
                      <div className="winner-crown">
                        <Crown size={16} />
                      </div>
                    )}
                  </div>
                  <div className="voting-details">
                    <span className="voting-name">
                      {member.name}
                      {isWinner && <span className="winner-text"> - Next Judge!</span>}
                    </span>
                    <div className="voting-bar">
                      <div 
                        className="voting-fill"
                        style={{ 
                          width: `${percentage}%`,
                          background: member.color 
                        }}
                      />
                    </div>
                  </div>
                  <div className="voting-stats">
                    <span className="voting-count">{memberVotes}</span>
                    <span className="voting-percentage">{percentage}%</span>
                  </div>
                </div>
                
                {/* Vote Button - Live System */}
                {isConnected && !userVote && !votingLocked && !isVotingDisabled && (
                  <button
                    className={`vote-button ${isVoting ? 'loading' : ''}`}
                    onClick={() => handleVote(member.id)}
                    disabled={isVoting || isVotingDisabled}
                  >
                    {isVoting ? (
                      <>
                        <Loader size={16} className="spinning" />
                        Voting...
                      </>
                    ) : (
                      <>
                        <Heart size={16} />
                        Vote
                      </>
                    )}
                  </button>
                )}
                
                {/* User Vote Badge */}
                {isUserVote && (
                  <div className="voted-badge">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Connection and Authentication Prompts */}
        {!isConnected && (
          <div className="voting-prompt">
            Connect wallet to vote for next judge
          </div>
        )}

        {isConnected && userVote && !votingLocked && (
          <div className="voting-thanks">
            Thanks for voting! <Sparkles size={16} className="inline-icon party-icon" />
          </div>
        )}

        {votingLocked && totalVotes === 0 && (
          <div className="no-votes">
            No votes cast - random judge will be selected
          </div>
        )}

        {/* Live Voting Status */}
        {isConnected && !userVote && !votingLocked && totalVotes > 0 && (
          <div className="live-voting-status">
            🔴 Live voting in progress • {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
          </div>
        )}
      </div>

      <style jsx>{`
        .voting-panel {
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .voting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .voting-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #FFD700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .voting-header h3 svg {
          width: 22px;
          height: 22px;
        }

        .voting-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .voting-winner {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          color: #FFD700;
          font-size: 12px;
          font-weight: 600;
        }

        .voting-locked {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 92, 92, 0.1);
          border: 1px solid rgba(255, 92, 92, 0.3);
          border-radius: 8px;
          color: #FF5C5C;
          font-size: 12px;
          font-weight: 600;
        }

        .voting-closing {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 170, 0, 0.1);
          border: 1px solid rgba(255, 170, 0, 0.3);
          border-radius: 8px;
          color: #FFAA00;
          font-size: 12px;
          font-weight: 600;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .vote-count {
          padding: 6px 12px;
          background: rgba(0, 184, 151, 0.1);
          border: 1px solid rgba(0, 184, 151, 0.3);
          border-radius: 8px;
          color: #00B897;
          font-size: 12px;
          font-weight: 600;
        }

        .voting-error {
          padding: 12px;
          background: rgba(255, 92, 92, 0.1);
          border: 1px solid rgba(255, 92, 92, 0.3);
          border-radius: 8px;
          color: #FF5C5C;
          font-size: 14px;
          margin-bottom: 16px;
          text-align: center;
        }

        .voting-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .voting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(10, 10, 10, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.2);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .voting-item:hover {
          border-color: rgba(255, 215, 0, 0.3);
          background: rgba(15, 15, 15, 0.8);
        }

        .voting-item.winner {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.05);
        }

        .voting-item.user-voted {
          border-color: rgba(0, 184, 151, 0.5);
          background: rgba(0, 184, 151, 0.05);
        }

        .voting-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .voting-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          flex-shrink: 0;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .voting-nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .winner-crown {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 16px;
          color: #FFD700;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border: 1px solid #FFD700;
        }

        .voting-details {
          flex: 1;
          min-width: 0;
        }

        .voting-name {
          display: block;
          font-weight: 600;
          color: #E6E6E6;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .winner-text {
          color: #FFD700;
          font-weight: 700;
        }

        .voting-bar {
          width: 100%;
          height: 6px;
          background: rgba(60, 75, 95, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .voting-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .voting-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-left: 20px;
          gap: 2px;
        }

        .voting-count {
          font-weight: 700;
          color: #E6E6E6;
          font-size: 14px;
        }

        .voting-percentage {
          font-weight: 600;
          color: #9999A5;
          font-size: 12px;
        }

        .vote-button {
          background: rgba(255, 92, 170, 0.1);
          border: 1px solid rgba(255, 92, 170, 0.3);
          color: #FF5CAA;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
          min-width: 65px;
          justify-content: center;
          margin-left: 12px;
        }

        .vote-button:hover:not(:disabled) {
          background: rgba(255, 92, 170, 0.2);
          transform: translateY(-1px);
        }

        .vote-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .vote-button.loading {
          background: rgba(255, 92, 170, 0.15);
        }

        .voted-badge {
          color: #00B897;
          font-size: 14px;
          font-weight: 600;
          margin-left: 12px;
        }

        .voting-prompt {
          text-align: center;
          padding: 16px;
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          color: #FFD700;
          font-size: 14px;
          margin-top: 16px;
        }

        .voting-thanks {
          text-align: center;
          padding: 12px;
          color: #00B897;
          font-weight: 600;
          margin-top: 16px;
        }

        .no-votes {
          text-align: center;
          padding: 12px;
          color: #9999A5;
          font-style: italic;
          margin-top: 16px;
        }

        .live-voting-status {
          text-align: center;
          padding: 8px 12px;
          background: rgba(0, 184, 151, 0.1);
          border: 1px solid rgba(0, 184, 151, 0.3);
          border-radius: 8px;
          color: #00B897;
          font-size: 12px;
          font-weight: 600;
          margin-top: 12px;
        }

        .inline-icon {
          display: inline-block;
          vertical-align: text-top;
          margin-left: 4px;
        }

        .party-icon {
          color: #FF5CAA;
          animation: partyBounce 0.6s ease-in-out infinite alternate;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes partyBounce {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(10deg); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .voting-panel {
            padding: 16px;
          }

          .voting-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .voting-item {
            flex-direction: column;
            gap: 12px;
          }

          .voting-info {
            width: 100%;
          }

          .vote-button {
            width: 100%;
            justify-content: center;
            padding: 6px 16px;
            font-size: 14px;
            min-width: unset;
            margin-left: 0;
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
};

export default VotingPanel; 