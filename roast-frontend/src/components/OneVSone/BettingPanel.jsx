import React, { useState } from 'react';
import { Coins, AlertCircle } from 'lucide-react';

const BettingPanel = ({ 
  isConnected,
  userAddress,
  bets,
  totalPot,
  userBet,
  isLoadingBet,
  battleStatus,
  placeBet,
  currentBattle,
  currentJudge,
  battleConfig
}) => {
  const [selectedSide, setSelectedSide] = useState(null);

  // Get bet amount from config or use default
  const BET_AMOUNT = battleConfig?.betAmount || 0.5;

  const handlePlaceBet = async () => {
    if (!selectedSide) {
      return;
    }

    try {
      await placeBet(selectedSide, BET_AMOUNT);
      setSelectedSide(null);
    } catch (error) {
      console.error('Failed to place bet:', error);
    }
  };

  const canPlaceBet = () => {
    return isConnected && 
           battleStatus === 'waiting_bets' && 
           !userBet && 
           selectedSide;
  };

  const getOdds = (side) => {
    if (!bets?.og?.total || !bets?.roaster?.total) return '1.00';
    const total = bets.og.total + bets.roaster.total;
    if (total === 0) return '1.00';
    
    const sideTotal = side === 'og' ? bets.og.total : bets.roaster.total;
    
    if (sideTotal === 0) return '∞';
    const odds = (total / sideTotal).toFixed(2);
    return odds;
  };

  return (
    <>
      <div className="betting-panel">
        <div className="panel-header">
          <h3 className="betting-title">
            <Coins size={20} className="betting-icon" style={{ color: currentJudge?.color || '#FFD700' }} />
            <span className="gradient-text">Betting System</span>
          </h3>
        </div>

        <div className="total-pot-section">
          <div className="total-pot-card">
            <span className="pot-label">Total Pot</span>
            <span className="pot-value gradient-text">{totalPot.toFixed(3)} 0G</span>
          </div>
        </div>

        {isConnected ? (
          <>
            {battleStatus === 'waiting_bets' && !userBet ? (
              <div className="betting-form">
                <h4>Place Your Bet</h4>
                
                <div className="side-selection">
                  <button 
                    className={`side-btn og-btn ${selectedSide === 'og' ? 'selected' : ''}`}
                    onClick={() => setSelectedSide('og')}
                    style={selectedSide === 'og' ? {
                      borderColor: currentJudge?.color || '#FFD700',
                      background: `rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.1)`,
                      color: currentJudge?.color || '#FFD700'
                    } : {}}
                  >
                    0G Team
                  </button>
                  <button 
                    className={`side-btn roaster-btn ${selectedSide === 'roaster' ? 'selected' : ''}`}
                    onClick={() => setSelectedSide('roaster')}
                    style={selectedSide === 'roaster' ? {
                      borderColor: currentJudge?.color || '#FFD700',
                      background: `rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.1)`,
                      color: currentJudge?.color || '#FFD700'
                    } : {}}
                  >
                    Roaster
                  </button>
                </div>

                <div className="bet-amount-display">
                  <label>Bet Amount (0G)</label>
                  <div className="fixed-amount">
                    <span className="entry-label">ENTRY:</span>
                    <span className="amount-value gradient-text">
                      {BET_AMOUNT.toFixed(3)} 0G
                    </span>
                  </div>
                </div>

                {selectedSide && (
                  <div className="potential-win" style={{
                    background: `rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.1)`,
                    borderColor: currentJudge?.color || '#FFD700'
                  }}>
                    <span>Potential Win:</span>
                    <span className="win-amount">
                      {(BET_AMOUNT * parseFloat(getOdds(selectedSide))).toFixed(3)} 0G
                    </span>
                  </div>
                )}

                <div className="voltage-button">
                  <button 
                    className="place-bet-btn"
                    onClick={handlePlaceBet}
                    disabled={!canPlaceBet() || isLoadingBet}
                    style={{
                      borderColor: currentJudge?.color || '#FFD700',
                      '--judge-color': currentJudge?.color || '#FFD700'
                    }}
                  >
                    {isLoadingBet ? (
                      <>
                        <div className="spinner" />
                        <span>Placing Bet...</span>
                      </>
                    ) : (
                      <>
                        <Coins size={16} />
                        <span>Place Bet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : userBet ? (
              <div className="user-bet-info">
                <h4>Your Bet</h4>
                <div className="bet-details">
                  <div className="bet-row">
                    <span>Side:</span>
                    <span className={`bet-side ${userBet.side}`}>
                      {userBet.side === 'og' ? '0G Team' : 'Roaster'}
                    </span>
                  </div>
                  <div className="bet-row">
                    <span>Amount:</span>
                    <span>{userBet.amount.toFixed(3)} 0G</span>
                  </div>
                  <div className="bet-row">
                    <span>Potential Win:</span>
                    <span className="win-amount">
                      {(userBet.amount * parseFloat(getOdds(userBet.side))).toFixed(3)} 0G
                    </span>
                  </div>
                </div>
                <div 
                  className="bet-status"
                  style={{
                    '--judge-color': currentJudge?.color || '#FFD700',
                    '--judge-color-rgb': currentJudge?.color ? 
                      `${parseInt(currentJudge.color.slice(1, 3), 16)}, ${parseInt(currentJudge.color.slice(3, 5), 16)}, ${parseInt(currentJudge.color.slice(5, 7), 16)}` : 
                      '255, 215, 0'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>Waiting for battle to start...</span>
                </div>
              </div>
            ) : (
              <div className="battle-status-info">
                <AlertCircle size={20} />
                <p>Battle {battleStatus}!</p>
                <p>Betting is closed for this round.</p>
              </div>
            )}
          </>
        ) : (
          <div className="connect-prompt">
            <AlertCircle size={20} />
            <p>Connect your wallet to place bets!</p>
          </div>
        )}

        <div className="min-bets-info">
          <p>Battle starts when minimum 2 bets are placed on each side</p>
        </div>
      </div>

      <style jsx>{`
        .betting-panel {
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .betting-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .betting-icon {
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          font-weight: 700;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .total-pot-section {
          margin-bottom: 4px;
        }

        .total-pot-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          text-align: center;
        }

        .pot-label {
          color: #9999A5;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pot-value {
          font-size: 24px;
          font-weight: 700;
        }

        .betting-form {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .betting-form h4 {
          color: #E6E6E6;
          font-size: 16px;
          margin: 0;
        }

        .side-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .side-btn {
          padding: 12px;
          background: rgba(40, 40, 50, 0.6);
          border: 2px solid rgba(60, 75, 95, 0.3);
          border-radius: 8px;
          color: #9999A5;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .side-btn:hover {
          background: rgba(50, 50, 60, 0.8);
        }

        .side-btn.selected {
          /* Dynamic colors applied via inline styles */
          transition: all 0.3s ease;
          text-shadow: 0 0 8px currentColor;
        }

        .bet-amount-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bet-amount-display label {
          color: #9999A5;
          font-size: 14px;
        }

        .fixed-amount {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 8px;
        }

        .entry-label {
          color: #9999A5;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .amount-value {
          font-size: 18px;
          font-weight: 700;
        }

        .potential-win {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid;
          transition: all 0.3s ease;
        }

        .potential-win span {
          color: #9999A5;
          font-size: 14px;
        }

        .win-amount {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
          font-weight: 600;
        }

        .voltage-button {
          position: relative;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .place-bet-btn {
          color: white;
          background: #0D1127;
          padding: 16px 40px 18px 40px;
          border-radius: 50px;
          border: 5px solid;
          font-size: 16px;
          font-weight: 600;
          line-height: 1em;
          letter-spacing: 0.075em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .place-bet-btn:hover:not(:disabled) {
          background: color-mix(in srgb, var(--judge-color, #FFD700) 30%, #0D1127);
        }

        .place-bet-btn:disabled {
          background: #333;
          cursor: not-allowed;
          color: #666;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          border-top-color: #000;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .user-bet-info,
        .battle-status-info,
        .connect-prompt {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
          color: #9999A5;
        }

        .user-bet-info h4 {
          color: #E6E6E6;
          font-size: 18px;
          margin: 0;
        }

        .bet-details {
          width: 100%;
          padding: 16px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 12px;
        }

        .bet-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #9999A5;
          font-size: 14px;
        }

        .bet-row:last-child {
          margin-bottom: 0;
        }

        .bet-side {
          font-weight: 600;
        }

        .bet-side.og {
          color: #00D2E9;
        }

        .bet-side.roaster {
          color: #FF5CAA;
        }

        .bet-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(var(--judge-color-rgb, 255, 215, 0), 0.1);
          border: 1px solid rgba(var(--judge-color-rgb, 255, 215, 0), 0.3);
          border-radius: 8px;
          color: var(--judge-color, #FFD700);
          font-size: 14px;
        }

        .min-bets-info {
          padding: 12px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 8px;
          text-align: center;
        }

        .min-bets-info p {
          color: #9999A5;
          font-size: 12px;
          margin: 0;
        }

        .inline-icon {
          display: inline;
          vertical-align: middle;
        }
      `}</style>
    </>
  );
};

export default BettingPanel; 