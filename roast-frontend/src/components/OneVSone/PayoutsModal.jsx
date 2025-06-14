import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Users, Coins, Hash } from 'lucide-react';
import { battleApi } from '../../services/api';

const PayoutsModal = ({ 
  isOpen, 
  onClose, 
  battle,
  currentJudge 
}) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    // Sprawdź czy timestamp już ma 'Z' na końcu (format ISO)
    let dateString2 = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
      // Jeśli nie ma 'Z' i nie ma timezone offset, dodaj 'Z' dla UTC
      dateString2 = dateString + 'Z';
    }
    
    const date = new Date(dateString2);
    
    // Sprawdź czy data jest prawidłowa
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadPayouts = async () => {
    if (!battle?.battle_id) return;
    
    try {
      setLoading(true);
      const response = await battleApi.getBattlePayouts(battle.battle_id);
      
      if (response.data.success) {
        setPayouts(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load payouts:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && battle) {
      loadPayouts();
    }
  }, [isOpen, battle]);

  if (!isOpen || !battle) return null;

  const totalPayouts = payouts.reduce((sum, payout) => sum + parseFloat(payout.payout_amount || 0), 0);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-slide-in-left" onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              <Coins size={24} className="title-icon" style={{ color: currentJudge?.color || '#FFD700' }} />
              <span className="gradient-text">Battle Payouts</span>
            </h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="loading-section">
                <div className="spinner" />
                <p>Loading payouts...</p>
              </div>
            ) : (
              <>
                {/* Battle Info */}
                <div className="battle-info-section">
                  <h3>{battle.og_character_id} vs {battle.roaster_character_id}</h3>
                  <p className="battle-id">Battle ID: {battle.battle_id}</p>
                </div>

                {/* Payout Summary */}
                <div className="summary-section">
                  <div className="summary-grid">
                    <div className="summary-card">
                      <Users size={20} className="summary-icon" />
                      <div className="summary-content">
                        <span className="summary-label">Total Winners</span>
                        <span className="summary-value">{payouts.length}</span>
                      </div>
                    </div>
                    
                    <div className="summary-card">
                      <Coins size={20} className="summary-icon" />
                      <div className="summary-content">
                        <span className="summary-label">Total Paid Out</span>
                        <span className="summary-value">{totalPayouts.toFixed(3)} 0G</span>
                      </div>
                    </div>
                    
                    <div className="summary-card">
                      <Coins size={20} className="summary-icon" />
                      <div className="summary-content">
                        <span className="summary-label">Per Winner</span>
                        <span className="summary-value">
                          {payouts.length > 0 ? (totalPayouts / payouts.length).toFixed(3) : '0.000'} 0G
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payouts List */}
                <div className="payouts-section">
                  <h3>Payouts ({payouts.length})</h3>
                  
                  {payouts.length === 0 ? (
                    <div className="no-payouts">
                      <Coins size={32} />
                      <p>No payouts found for this battle</p>
                      <span className="no-payouts-subtitle">
                        This could mean the battle had no winners or payouts are still being processed
                      </span>
                    </div>
                  ) : (
                    <div className="payouts-container">
                      <div className="payouts-header">
                        <div className="rank-col">#</div>
                        <div className="address-col">Winner Address</div>
                        <div className="amount-col">Amount</div>
                        <div className="tx-col">Transaction</div>
                        <div className="date-col">Date</div>
                      </div>
                      
                      <div className="payouts-list">
                        {payouts.map((payout, index) => (
                          <div key={payout.id} className="payout-row">
                            <div className="rank-col">
                              <span className="rank-number">#{index + 1}</span>
                            </div>
                            <div className="address-col">
                              <a 
                                href={`https://chainscan-galileo.0g.ai/address/${payout.winner_address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="address-link"
                              >
                                <span className="address-text">
                                  {formatAddress(payout.winner_address)}
                                </span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            <div className="amount-col">
                              <span className="amount-value">
                                {parseFloat(payout.payout_amount || 0).toFixed(3)} 0G
                              </span>
                            </div>
                            <div className="tx-col">
                              {payout.tx_hash ? (
                                <a 
                                  href={`https://chainscan-galileo.0g.ai/tx/${payout.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tx-link"
                                >
                                  <Hash size={12} />
                                  <span>{formatAddress(payout.tx_hash)}</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="pending-tx">Pending</span>
                              )}
                            </div>
                            <div className="date-col">
                              {formatDate(payout.processed_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: rgba(18, 18, 24, 0.95);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 20px;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .modal-slide-in-left {
          animation: slideInFromLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .title-icon {
          filter: drop-shadow(0 0 8px currentColor);
          animation: iconGlow 3s ease-in-out infinite alternate;
        }

        @keyframes iconGlow {
          0% { filter: drop-shadow(0 0 8px currentColor); }
          100% { filter: drop-shadow(0 0 16px currentColor); }
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 3s linear infinite;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .close-button {
          background: none;
          border: none;
          color: #9999A5;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          color: #E6E6E6;
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #FFD700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .battle-info-section {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }

        .battle-info-section h3 {
          margin: 0 0 8px 0;
          color: #E6E6E6;
          font-size: 20px;
        }

        .battle-id {
          color: #9999A5;
          font-size: 14px;
          font-family: monospace;
          margin: 0;
        }

        .summary-section {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .summary-card {
          background: rgba(40, 40, 50, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-icon {
          color: ${currentJudge?.color || '#FFD700'};
          flex-shrink: 0;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .summary-label {
          color: #9999A5;
          font-size: 12px;
        }

        .summary-value {
          color: #E6E6E6;
          font-size: 18px;
          font-weight: 600;
        }

        .payouts-section h3 {
          margin: 0 0 16px 0;
          color: #E6E6E6;
          font-size: 18px;
        }

        .no-payouts {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
          color: #9999A5;
          text-align: center;
        }

        .no-payouts-subtitle {
          font-size: 14px;
          max-width: 400px;
          line-height: 1.4;
        }

        .payouts-container {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          overflow: hidden;
        }

        .payouts-header {
          display: grid;
          grid-template-columns: 50px 1fr 120px 140px 100px;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(40, 40, 50, 0.8);
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
          font-size: 12px;
          font-weight: 600;
          color: #9999A5;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payouts-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .payout-row {
          display: grid;
          grid-template-columns: 50px 1fr 120px 140px 100px;
          gap: 16px;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.2);
          transition: all 0.3s ease;
          align-items: center;
        }

        .payout-row:hover {
          background: rgba(40, 40, 50, 0.4);
        }

        .rank-number {
          font-weight: 600;
          color: #E6E6E6;
        }

        .address-link {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }

        .address-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .address-link:hover .address-text {
          color: ${currentJudge?.color || '#FFD700'};
        }

        .address-text {
          font-family: monospace;
          color: #E6E6E6;
          font-size: 14px;
        }

        .amount-value {
          color: #E6E6E6;
          font-weight: 600;
          font-size: 14px;
        }

        .tx-link {
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          color: #9999A5;
          transition: all 0.3s ease;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
          font-size: 12px;
        }

        .tx-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: ${currentJudge?.color || '#FFD700'};
        }

        .pending-tx {
          color: #9999A5;
          font-style: italic;
          font-size: 12px;
        }

        .payout-row > div {
          color: #E6E6E6;
          font-size: 14px;
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar,
        .payouts-list::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track,
        .payouts-list::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .modal-body::-webkit-scrollbar-thumb,
        .payouts-list::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover,
        .payouts-list::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 140, 0.7);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
            max-height: 95vh;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-title {
            font-size: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .payouts-header,
          .payout-row {
            grid-template-columns: 40px 1fr 80px 100px 80px;
            gap: 8px;
            padding: 12px 16px;
            font-size: 11px;
          }

          .address-text {
            font-size: 12px;
          }

          .amount-value {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default PayoutsModal; 