import React, { useState } from 'react';
import { Coins, TrendingUp, Users, AlertCircle } from 'lucide-react';

const BettingPanel = ({ 
  isConnected,
  userAddress,
  bets,
  totalPot,
  userBet,
  isLoadingBet,
  battleStatus,
  placeBet,
  currentBattle
}) => {
  const [betAmount, setBetAmount] = useState('0.1');
  const [selectedSide, setSelectedSide] = useState(null);

  const MIN_BET = 0.1;
  const MAX_BET = 10;

  const handlePlaceBet = async () => {
    if (!selectedSide || !betAmount || parseFloat(betAmount) < MIN_BET) {
      return;
    }

    try {
      await placeBet(selectedSide, parseFloat(betAmount));
      setBetAmount('0.1');
      setSelectedSide(null);
    } catch (error) {
      console.error('Failed to place bet:', error);
    }
  };

  const canPlaceBet = () => {
    return isConnected && 
           battleStatus === 'waiting_bets' && 
           !userBet && 
           selectedSide && 
           parseFloat(betAmount) >= MIN_BET &&
           parseFloat(betAmount) <= MAX_BET;
  };

  const getOdds = (side) => {
    if (!bets?.og?.total || !bets?.roaster?.total) return '1.00';
    const total = bets.og.total + bets.roaster.total;
    if (total === 0) return '1.00';
    
    const sideTotal = side === 'og' ? bets.og.total : bets.roaster.total;
    const otherSideTotal = side === 'og' ? bets.roaster.total : bets.og.total;
    
    if (sideTotal === 0) return '∞';
    const odds = (total / sideTotal).toFixed(2);
    return odds;
  };

  return (
    <>
      <div className="betting-panel">
        <div className="panel-header">
          <h3>
            <Coins size={20} className="inline-icon" />
            Betting System
          </h3>
          <div className="total-pot">
            <span className="pot-label">Total Pot:</span>
            <span className="pot-value">{totalPot.toFixed(3)} 0G</span>
          </div>
        </div>

        {/* Betting Stats */}
        <div className="betting-stats">
          <div className="stat-card og-stats">
            <h4>0G Team</h4>
            <div className="stat-row">
              <Users size={14} />
              <span>{bets?.og?.count || 0} bets</span>
            </div>
            <div className="stat-row">
              <Coins size={14} />
              <span>{(bets?.og?.total || 0).toFixed(3)} 0G</span>
            </div>
            <div className="stat-row">
              <TrendingUp size={14} />
              <span>Odds: {getOdds('og')}x</span>
            </div>
          </div>

          <div className="stat-card roaster-stats">
            <h4>Roaster</h4>
            <div className="stat-row">
              <Users size={14} />
              <span>{bets?.roaster?.count || 0} bets</span>
            </div>
            <div className="stat-row">
              <Coins size={14} />
              <span>{(bets?.roaster?.total || 0).toFixed(3)} 0G</span>
            </div>
            <div className="stat-row">
              <TrendingUp size={14} />
              <span>Odds: {getOdds('roaster')}x</span>
            </div>
          </div>
        </div>

        {/* Betting Form */}
        {isConnected ? (
          <>
            {battleStatus === 'waiting_bets' && !userBet ? (
              <div className="betting-form">
                <h4>Place Your Bet</h4>
                
                {/* Side Selection */}
                <div className="side-selection">
                  <button 
                    className={`side-btn og-btn ${selectedSide === 'og' ? 'selected' : ''}`}
                    onClick={() => setSelectedSide('og')}
                  >
                    0G Team
                  </button>
                  <button 
                    className={`side-btn roaster-btn ${selectedSide === 'roaster' ? 'selected' : ''}`}
                    onClick={() => setSelectedSide('roaster')}
                  >
                    Roaster
                  </button>
                </div>

                {/* Amount Input */}
                <div className="amount-input">
                  <label>Bet Amount (0G)</label>
                  <input 
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min={MIN_BET}
                    max={MAX_BET}
                    step="0.1"
                    placeholder="Enter amount"
                  />
                  <div className="amount-hints">
                    <span>Min: {MIN_BET} 0G</span>
                    <span>Max: {MAX_BET} 0G</span>
                  </div>
                </div>

                {/* Potential Win */}
                {selectedSide && parseFloat(betAmount) >= MIN_BET && (
                  <div className="potential-win">
                    <span>Potential Win:</span>
                    <span className="win-amount">
                      {(parseFloat(betAmount) * parseFloat(getOdds(selectedSide))).toFixed(3)} 0G
                    </span>
                  </div>
                )}

                {/* Place Bet Button */}
                <button 
                  className="place-bet-btn"
                  onClick={handlePlaceBet}
                  disabled={!canPlaceBet() || isLoadingBet}
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
                <div className="bet-status">
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

        {/* Minimum Bets Info */}
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
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .panel-header h3 {
          color: #E6E6E6;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .total-pot {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .pot-label {
          color: #9999A5;
          font-size: 12px;
        }

        .pot-value {
          color: #FFD700;
          font-size: 18px;
          font-weight: 600;
        }

        .betting-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-card {
          padding: 16px;
          background: rgba(30, 30, 40, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .stat-card.og-stats {
          border-color: rgba(0, 210, 233, 0.3);
        }

        .stat-card.roaster-stats {
          border-color: rgba(255, 92, 170, 0.3);
        }

        .stat-card h4 {
          color: #E6E6E6;
          font-size: 16px;
          margin: 0 0 12px 0;
        }

        .stat-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9999A5;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .stat-row:last-child {
          margin-bottom: 0;
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
          color: #FFD700;
          border-color: #FFD700;
          background: rgba(255, 215, 0, 0.1);
        }

        .side-btn.og-btn.selected {
          border-color: #00D2E9;
          background: rgba(0, 210, 233, 0.1);
          color: #00D2E9;
        }

        .side-btn.roaster-btn.selected {
          border-color: #FF5CAA;
          background: rgba(255, 92, 170, 0.1);
          color: #FF5CAA;
        }

        .amount-input {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .amount-input label {
          color: #9999A5;
          font-size: 14px;
        }

        .amount-input input {
          padding: 12px;
          background: rgba(30, 30, 40, 0.5);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 8px;
          color: #E6E6E6;
          font-size: 16px;
          outline: none;
        }

        .amount-input input:focus {
          border-color: #FFD700;
        }

        .amount-hints {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #9999A5;
        }

        .potential-win {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
        }

        .potential-win span {
          color: #9999A5;
          font-size: 14px;
        }

        .win-amount {
          color: #FFD700;
          font-weight: 600;
        }

        .place-bet-btn {
          padding: 16px;
          background: linear-gradient(135deg, #FFD700, #FF6B6B);
          border: none;
          border-radius: 12px;
          color: #000;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .place-bet-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .place-bet-btn:disabled {
          background: #666;
          cursor: not-allowed;
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
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          color: #FFD700;
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