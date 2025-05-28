import React, { useState, useEffect } from 'react';
import { Trophy, ExternalLink } from 'lucide-react';
import { treasuryApi } from '../../services/api';

const RecentWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadRecentWinners();
    const interval = setInterval(loadRecentWinners, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      const response = await treasuryApi.getRecentWinners(10);
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

  // Inline styles dla mobile jako backup
  const mobileStyles = isMobile ? {
    background: 'rgba(18, 18, 24, 0.95)',
    border: '1px solid rgba(60, 75, 95, 0.3)',
    backdropFilter: 'blur(10px)',
    color: '#E6E6E6'
  } : {};

  if (loading) {
    return (
      <div className="recent-winners" style={mobileStyles}>
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
      <div className="recent-winners" style={mobileStyles}>
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
      <div className="recent-winners" style={mobileStyles}>
        <div className="winners-header">
          <Trophy size={20} />
          <h3>Recent Winners</h3>
        </div>
        
        <div className="winners-list">
          {winners.map((winner, index) => (
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
      </div>

      <style jsx>{styles}</style>
    </>
  );
};

const styles = `
  .recent-winners {
    position: absolute;
    left: -470px;
    top: 2rem;
    width: 450px;
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
    gap: 16px;
  }

  .winner-card {
    background: rgba(10, 10, 10, 0.8);
    border: 1px solid rgba(60, 75, 95, 0.3);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .winner-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(15, 15, 15, 0.9);
  }

  .winner-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .winner-address {
    font-family: 'Courier New', monospace;
    color: #00D2E9;
    font-size: 14px;
    font-weight: 500;
  }

  .winner-amount {
    color: #FFD700;
    font-weight: 600;
    font-size: 14px;
  }

  .winner-roast {
    color: #9999A5;
    font-size: 14px;
    font-style: italic;
    margin-bottom: 12px;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .winner-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }

  .winner-judge-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .winner-judge {
    color: #666;
    font-weight: 500;
  }

  .winner-time {
    color: #888;
    font-size: 11px;
    font-style: italic;
  }

  .winner-tx {
    color: #00D2E9;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
  }

  .winner-tx:hover {
    color: #FFD700;
    background: rgba(0, 210, 233, 0.1);
  }

  /* Desktop - wyśrodkowany po lewej stronie */
  @media (min-width: 1401px) {
    .recent-winners {
      left: 50%;
      transform: translateX(-50%);
      margin-left: -650px; /* Bliżej środka */
    }
  }

  /* Średnie ekrany - bliżej środka */
  @media (min-width: 1200px) and (max-width: 1400px) {
    .recent-winners {
      left: -380px;
      width: 400px;
    }
  }

  /* Tablet - ukryj panel */
  @media (max-width: 1199px) and (min-width: 769px) {
    .recent-winners {
      display: none;
    }
  }

  /* Mobile - pokaż na dole */
  @media (max-width: 768px) {
    .recent-winners {
      position: static;
      left: auto;
      top: auto;
      transform: none;
      margin: 20px auto 0;
      width: 100%;
      max-width: 400px;
      max-height: 300px;
      background: rgba(18, 18, 24, 0.95) !important;
      border: 1px solid rgba(60, 75, 95, 0.3) !important;
      backdrop-filter: blur(10px);
    }
    
    .winners-header {
      color: #FFD700 !important;
    }
    
    .winners-header h3 {
      font-size: 16px;
      color: #FFD700 !important;
    }
    
    .winner-card {
      padding: 10px;
      background: rgba(10, 10, 10, 0.8) !important;
      border: 1px solid rgba(60, 75, 95, 0.3) !important;
    }
    
    .winner-address {
      color: #00D2E9 !important;
    }
    
    .winner-amount {
      color: #FFD700 !important;
    }
    
    .winner-roast {
      font-size: 12px;
      color: #9999A5 !important;
    }
    
    .winner-judge {
      color: #666 !important;
    }
    
    .winner-time {
      color: #888 !important;
    }
    
    .winner-tx {
      color: #00D2E9 !important;
    }
    
    .loading-message, .no-winners {
      color: #9999A5 !important;
    }
  }

  @media (max-height: 700px) {
    .recent-winners {
      max-height: 400px;
    }
  }

  /* Custom scrollbar */
  .recent-winners::-webkit-scrollbar {
    width: 8px;
  }

  .recent-winners::-webkit-scrollbar-track {
    background: rgba(30, 30, 40, 0.8);
    border-radius: 4px;
  }

  .recent-winners::-webkit-scrollbar-thumb {
    background: rgba(60, 75, 95, 0.6);
    border-radius: 4px;
    border: 1px solid rgba(40, 50, 65, 0.8);
  }

  .recent-winners::-webkit-scrollbar-thumb:hover {
    background: rgba(80, 95, 115, 0.8);
  }

  .recent-winners::-webkit-scrollbar-corner {
    background: rgba(30, 30, 40, 0.8);
  }
`;

export default RecentWinners; 