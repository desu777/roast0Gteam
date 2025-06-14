import React, { useState, useEffect } from 'react';
import { X, History, Users, Eye, Calendar, Trophy, Coins } from 'lucide-react';
import { battleApi } from '../../services/api';
import DialogsModal from './DialogsModal';
import PayoutsModal from './PayoutsModal';

const BattleHistoryModal = ({ 
  isOpen, 
  onClose, 
  currentJudge 
}) => {
  const [battleHistory, setBattleHistory] = useState([]);
  const [uniquePlayersCount, setUniquePlayersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [dialogsModalOpen, setDialogsModalOpen] = useState(false);
  const [payoutsModalOpen, setPayoutsModalOpen] = useState(false);

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

  const loadBattleHistory = async () => {
    try {
      setLoading(true);
      
      // Load last 100 battles and unique players count
      const [historyResponse, playersResponse] = await Promise.all([
        battleApi.getBattleHistory(100, 0),
        battleApi.getUniquePlayersCount()
      ]);
      
      if (historyResponse.data.success) {
        setBattleHistory(historyResponse.data.data);
      }
      
      if (playersResponse.data.success) {
        setUniquePlayersCount(playersResponse.data.data.count);
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load battle history:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDialogs = (battle) => {
    setSelectedBattle(battle);
    setDialogsModalOpen(true);
  };

  const handleViewPayouts = (battle) => {
    setSelectedBattle(battle);
    setPayoutsModalOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      loadBattleHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-slide-in" onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              <History size={24} className="title-icon" style={{ color: currentJudge?.color || '#FFD700' }} />
              <span className="gradient-text">Battle History</span>
            </h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="loading-section">
                <div className="spinner" />
                <p>Loading battle history...</p>
              </div>
            ) : (
              <>
                {/* Viral Info Section */}
                <div className="viral-info-section viral-slide-in">
                  <div className="viral-info-card">
                    <div className="viral-content">
                      <span className="viral-number">{uniquePlayersCount}</span>
                      <span className="viral-text">unique players fought in battles</span>
                    </div>
                  </div>
                </div>

                {/* Battle History List */}
                <div className="history-section">
                  <h3>Recent Battles ({battleHistory.length})</h3>
                  
                  <div className="history-container">
                    <div className="history-list">
                      {battleHistory.map((battle, index) => (
                        <div 
                          key={battle.battle_id} 
                          className="battle-card"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="battle-header">
                            <div className="battle-matchup">
                              <span className="character-name og">{battle.og_character_id}</span>
                              <span className="vs-text">vs</span>
                              <span className="character-name roaster">{battle.roaster_character_id}</span>
                            </div>
                            <div 
                              className={`winner-badge ${battle.winner_side}`}
                              style={{
                                background: `rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.2)`,
                                border: `1px solid rgba(${parseInt((currentJudge?.color || '#FFD700').slice(1, 3), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(3, 5), 16)}, ${parseInt((currentJudge?.color || '#FFD700').slice(5, 7), 16)}, 0.4)`,
                                color: currentJudge?.color || '#FFD700'
                              }}
                            >
                              <Trophy size={14} />
                              <span>{battle.winner_side === 'og' ? '0G Team' : 'Roaster'} Won</span>
                            </div>
                          </div>
                          
                          <div className="battle-info">
                            <div className="battle-stats">
                              <div className="stat-item">
                                <Calendar size={14} />
                                <span>{formatDate(battle.completed_at)}</span>
                              </div>
                              <div className="stat-item">
                                <Coins size={14} />
                                <span>{(battle.total_pot || 0).toFixed(3)} 0G</span>
                              </div>
                              <div className="stat-item">
                                <Users size={14} />
                                <span>{battle.winners_count || 0} winners</span>
                              </div>
                            </div>
                            
                            <div className="battle-actions">
                              <button 
                                className="action-button primary"
                                onClick={() => handleViewDialogs(battle)}
                              >
                                <Eye size={16} />
                                View Dialogs & Judge
                              </button>
                              <button 
                                className="action-button secondary"
                                onClick={() => handleViewPayouts(battle)}
                              >
                                Payouts
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <DialogsModal
        isOpen={dialogsModalOpen}
        onClose={() => setDialogsModalOpen(false)}
        battle={selectedBattle}
        currentJudge={currentJudge}
      />
      
      <PayoutsModal
        isOpen={payoutsModalOpen}
        onClose={() => setPayoutsModalOpen(false)}
        battle={selectedBattle}
        currentJudge={currentJudge}
      />

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
          z-index: 1000;
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
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .modal-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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

        .viral-info-section {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
        }

        .viral-slide-in {
          animation: slideInUp 0.5s ease-out;
        }

        .viral-info-card {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
        }



        .viral-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .viral-number {
          font-size: 32px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .viral-text {
          color: #9999A5;
          font-size: 14px;
          text-align: center;
        }

        .history-section h3 {
          margin: 0 0 16px 0;
          color: #E6E6E6;
          font-size: 18px;
        }

        .history-container {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          overflow: hidden;
        }

        .history-list {
          max-height: 500px;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .battle-card {
          background: rgba(40, 40, 50, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
          animation: slideInUp 0.4s ease-out both;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .battle-card:hover {
          background: rgba(50, 50, 60, 0.6);
          border-color: rgba(80, 95, 115, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(60, 75, 95, 0.3);
        }

        .battle-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .battle-matchup {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .character-name {
          font-weight: 600;
          font-size: 16px;
        }

        .character-name.og {
          color: #E6E6E6;
        }

        .character-name.roaster {
          color: #E6E6E6;
        }

        .vs-text {
          color: #9999A5;
          font-size: 14px;
        }

        .winner-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .battle-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .battle-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9999A5;
          font-size: 14px;
        }

        .battle-actions {
          display: flex;
          gap: 12px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          position: relative;
          overflow: hidden;
        }

        .action-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.4s ease;
        }

        .action-button.primary {
          background: rgba(60, 75, 95, 0.6);
          color: #E6E6E6;
          border: 1px solid rgba(80, 95, 115, 0.4);
        }

        .action-button.primary:hover {
          background: rgba(80, 95, 115, 0.6);
          border-color: rgba(100, 115, 135, 0.5);
          transform: translateY(-2px);
        }

        .action-button.primary:hover::before {
          left: 100%;
        }

        .action-button.secondary {
          background: rgba(40, 40, 50, 0.6);
          color: #9999A5;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .action-button.secondary:hover {
          background: rgba(50, 50, 60, 0.6);
          color: #E6E6E6;
          border-color: rgba(80, 95, 115, 0.4);
          transform: translateY(-2px);
        }

        .action-button.secondary:hover::before {
          left: 100%;
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar,
        .history-list::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track,
        .history-list::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .modal-body::-webkit-scrollbar-thumb,
        .history-list::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover,
        .history-list::-webkit-scrollbar-thumb:hover {
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

          .battle-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .battle-actions {
            flex-direction: column;
          }

          .action-button {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default BattleHistoryModal; 