import React, { useState, useEffect } from 'react';
import { Trophy, ExternalLink } from 'lucide-react';
import { treasuryApi } from '../../services/api';

const RecentWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadRecentWinners();
    const interval = setInterval(loadRecentWinners, 30000);
    return () => clearInterval(interval);
  }, []);

  // Aktualizuj czas co minutę dla "time ago"
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Co minutę
    
    return () => clearInterval(timeInterval);
  }, []);

  const loadRecentWinners = async () => {
    try {
      const response = await treasuryApi.getRecentWinners(20); // Załaduj więcej rekordów
      setWinners(response.data.winners);
    } catch (error) {
      console.error('Failed to load recent winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(3);
  };

  const formatTimeAgo = (timestamp) => {
    const winTime = new Date(timestamp);
    const diffInMinutes = Math.floor((currentTime - winTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getCharacterName = (character) => {
    const names = {
      'michael': 'Michael',
      'ada': 'Ada',
      'jc': 'JC',
      'elisha': 'Elisha',
      'ren': 'Ren',
      'yon': 'Yon'
    };
    return names[character] || character;
  };

  const displayedWinners = showAll ? winners : winners.slice(0, 10);
  const hasMore = winners.length > 10;

  if (loading) {
    return (
      <div className="recent-winners">
        <div className="winners-header">
          <Trophy size={20} />
          <h3>Recent Winners</h3>
        </div>
        <div className="loading-message">Loading winners...</div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="recent-winners">
        <div className="winners-header">
          <Trophy size={20} />
          <h3>Recent Winners</h3>
        </div>
        <div className="no-winners">No winners yet!</div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <>
      <div className="recent-winners">
        <div className="winners-header">
          <Trophy size={20} />
          <h3>Recent Winners</h3>
        </div>
        
        <div className="winners-list">
          {displayedWinners.map((winner, index) => (
            <div key={`${winner.roundId}-${index}`} className="winner-card">
              <div className="winner-info">
                <div className="winner-address">
                  {formatAddress(winner.address)}
                </div>
                <div className="winner-amount">{formatAmount(winner.amount)} 0G</div>
              </div>
              
              <div className="winner-roast">"{winner.roastText}"</div>
              
              <div className="winner-footer">
                <div className="winner-judge-info">
                  <span className="winner-judge">Judge: {getCharacterName(winner.judgeCharacter)}</span>
                  <span className="winner-time">{formatTimeAgo(winner.timestamp)}</span>
                </div>
                {winner.txHash && (
                  <a 
                    href={`https://chainscan-galileo.0g.ai/tx/${winner.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="winner-tx"
                    title="View transaction"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {hasMore && !showAll && (
          <button 
            className="show-more-btn"
            onClick={() => setShowAll(true)}
          >
            Show more ({winners.length - 10} more)
          </button>
        )}

        {showAll && hasMore && (
          <button 
            className="show-less-btn"
            onClick={() => setShowAll(false)}
          >
            Show less
          </button>
        )}
      </div>

      <style jsx>{styles}</style>
    </>
  );
};

const styles = `
  .recent-winners {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    max-height: 600px;
    background: rgba(18, 18, 24, 0.95);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 16px;
    padding: 20px;
    overflow-y: auto;
    backdrop-filter: blur(10px);
    z-index: 100;
  }

  .winners-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    color: #FFD700;
  }

  .winners-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .loading-message, .no-winners {
    text-align: center;
    color: #9999A5;
    font-style: italic;
    padding: 20px 0;
  }

  .winners-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .winner-card {
    background: rgba(30, 30, 40, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .winner-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-1px);
  }

  .winner-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .winner-address {
    font-family: 'Courier New', monospace;
    color: #E6E6E6;
    font-weight: 600;
    font-size: 14px;
  }

  .winner-amount {
    color: #FFD700;
    font-weight: 700;
    font-size: 16px;
  }

  .winner-roast {
    color: #E6E6E6;
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 12px;
    font-style: italic;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .winner-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
  }

  .winner-judge-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .winner-judge {
    color: #9999A5;
    font-weight: 500;
  }

  .winner-time {
    color: #666;
    font-size: 10px;
  }

  .winner-tx {
    color: #00D2E9;
    text-decoration: none;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
  }

  .winner-tx:hover {
    background: rgba(0, 210, 233, 0.1);
  }

  .show-more-btn, .show-less-btn {
    width: 100%;
    padding: 12px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    color: #FFD700;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 12px;
  }

  .show-more-btn:hover, .show-less-btn:hover {
    background: rgba(255, 215, 0, 0.2);
    transform: translateY(-1px);
  }

  /* Scrollbar styling */
  .recent-winners::-webkit-scrollbar {
    width: 6px;
  }

  .recent-winners::-webkit-scrollbar-track {
    background: rgba(30, 30, 40, 0.5);
    border-radius: 3px;
  }

  .recent-winners::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.3);
    border-radius: 3px;
  }

  .recent-winners::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 215, 0, 0.5);
  }
`;

export default RecentWinners; 