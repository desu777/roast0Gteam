import React, { useState, useEffect } from 'react';
import { Heart, Lock, Trophy } from 'lucide-react';
import { TEAM_MEMBERS } from '../../data/teamMembers';

const VotingPanel = ({ isConnected, timeLeft, currentPhase, onVote, onVotingComplete, userAddress }) => {
  const [votes, setVotes] = useState({});
  const [userVotes, setUserVotes] = useState(new Set()); // Track who voted
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingLocked, setVotingLocked] = useState(false);
  const [votingWinner, setVotingWinner] = useState(null);

  // Reset głosów na początku nowej rundy
  useEffect(() => {
    if (currentPhase === 'waiting') {
      setVotes({});
      setUserVotes(new Set());
      setHasVoted(false);
      setTotalVotes(0);
      setVotingWinner(null);
      setVotingLocked(false);
    }
  }, [currentPhase]);

  // Blokuj głosowanie 10 sekund przed końcem rundy
  useEffect(() => {
    if (currentPhase === 'writing' && timeLeft <= 10) {
      setVotingLocked(true);
      
      // Wyznacz zwycięzcę głosowania
      if (totalVotes > 0 && !votingWinner) {
        const winner = getVotingWinner();
        setVotingWinner(winner);
        
        // Przekaż wynik do parent component
        if (onVotingComplete) {
          onVotingComplete(winner, totalVotes);
        }
      }
    }
  }, [timeLeft, currentPhase, totalVotes, votingWinner, onVotingComplete]);

  const handleVote = (characterId) => {
    if (!isConnected || hasVoted || votingLocked) return;
    
    // Użyj prawdziwego wallet address lub fallback
    const userId = userAddress || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (userVotes.has(userId)) return; // Double vote protection
    
    setHasVoted(characterId);
    setUserVotes(prev => new Set([...prev, userId]));
    
    // Zaktualizuj głosy
    setVotes(prev => ({
      ...prev,
      [characterId]: (prev[characterId] || 0) + 1
    }));
    setTotalVotes(prev => prev + 1);
    
    // Callback dla parent component
    if (onVote) {
      onVote(characterId);
    }
  };

  const getVotePercentage = (characterVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((characterVotes / totalVotes) * 100);
  };

  const getVotingWinner = () => {
    if (totalVotes === 0) return null;
    
    let maxVotes = 0;
    let winner = null;
    
    Object.entries(votes).forEach(([characterId, voteCount]) => {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        winner = characterId;
      }
    });
    
    return winner;
  };

  const getTopCandidates = () => {
    return Object.entries(votes)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <>
      <div className="voting-panel">
        <div className="voting-header">
          <h3>🗳️ Vote for Next Judge</h3>
          <div className="voting-status">
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
            {!votingLocked && (
              <div className="vote-count">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="voting-list">
          {TEAM_MEMBERS.map(member => {
            const memberVotes = votes[member.id] || 0;
            const percentage = getVotePercentage(memberVotes);
            const isWinner = votingWinner === member.id;
            
            return (
              <div key={member.id} className={`voting-item ${isWinner ? 'winner' : ''}`}>
                <div className="voting-info">
                  <div 
                    className="voting-avatar" 
                    style={{ background: member.color }}
                  >
                    <member.icon size={20} />
                    {isWinner && <div className="winner-crown">👑</div>}
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
                
                {isConnected && !hasVoted && !votingLocked && (
                  <button
                    className="vote-button"
                    onClick={() => handleVote(member.id)}
                  >
                    <Heart size={16} />
                    Vote
                  </button>
                )}
                
                {hasVoted === member.id && (
                  <div className="voted-badge">
                    ✓ Your vote
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isConnected && (
          <div className="voting-prompt">
            Connect wallet to vote for next judge
          </div>
        )}

        {hasVoted && !votingLocked && (
          <div className="voting-thanks">
            Thanks for voting! 🎉
          </div>
        )}

        {votingLocked && totalVotes === 0 && (
          <div className="no-votes">
            No votes cast - random judge will be selected
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

        .vote-count {
          padding: 6px 12px;
          background: rgba(0, 184, 151, 0.1);
          border: 1px solid rgba(0, 184, 151, 0.3);
          border-radius: 8px;
          color: #00B897;
          font-size: 12px;
          font-weight: 600;
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
          color: #000;
          flex-shrink: 0;
          position: relative;
        }

        .winner-crown {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 16px;
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
          margin-left: 12px;
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
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .vote-button:hover {
          background: rgba(255, 92, 170, 0.2);
          transform: translateY(-1px);
        }

        .voted-badge {
          color: #00B897;
          font-size: 14px;
          font-weight: 600;
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
          }
        }
      `}</style>
    </>
  );
};

export default VotingPanel; 