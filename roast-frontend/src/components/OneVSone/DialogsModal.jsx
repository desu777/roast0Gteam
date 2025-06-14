import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Gavel, Code, Clock, Zap } from 'lucide-react';
import { battleApi } from '../../services/api';

const DialogsModal = ({ 
  isOpen, 
  onClose, 
  battle,
  currentJudge 
}) => {
  const [aiLogs, setAiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dialogs');

  const loadAILogs = async () => {
    if (!battle?.battle_id) return;
    
    try {
      setLoading(true);
      const response = await battleApi.getAILogs(battle.battle_id);
      
      if (response.data.success) {
        setAiLogs(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load AI logs:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && battle) {
      loadAILogs();
    }
  }, [isOpen, battle]);

  if (!isOpen || !battle) return null;

  const dialogLogs = aiLogs.filter(log => log.prompt_type === 'dialog_generation');
  const judgmentLogs = aiLogs.filter(log => log.prompt_type === 'battle_judgment');

  const formatJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-slide-in-right" onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              <MessageSquare size={24} className="title-icon" style={{ color: currentJudge?.color || '#FFD700' }} />
              <span className="gradient-text">AI Dialogs & Judgment</span>
            </h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="loading-section">
                <div className="spinner" />
                <p>Loading AI logs...</p>
              </div>
            ) : (
              <>
                {/* Battle Info */}
                <div className="battle-info-section">
                  <h3>{battle.og_character_id} vs {battle.roaster_character_id}</h3>
                  <p className="battle-id">Battle ID: {battle.battle_id}</p>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                  <button 
                    className={`tab-button ${selectedTab === 'dialogs' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('dialogs')}
                  >
                    <MessageSquare size={16} />
                    Dialog Generation ({dialogLogs.length})
                  </button>
                  <button 
                    className={`tab-button ${selectedTab === 'judgment' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('judgment')}
                  >
                    <Gavel size={16} />
                    Battle Judgment ({judgmentLogs.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {selectedTab === 'dialogs' && (
                    <div className="logs-section tab-slide-in">
                      {dialogLogs.length === 0 ? (
                        <div className="no-logs">
                          <MessageSquare size={32} />
                          <p>No dialog generation logs found</p>
                        </div>
                      ) : (
                        dialogLogs.map((log, index) => (
                          <div 
                            key={log.id} 
                            className="log-card log-card-animate"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="log-header">
                              <div className="log-info">
                                <span className="log-type">Dialog Generation #{index + 1}</span>
                                <div className="log-meta">
                                  <span className="log-tokens">
                                    <Zap size={12} />
                                    {log.tokens_used} tokens
                                  </span>
                                  <span className="log-time">
                                    <Clock size={12} />
                                    {formatDuration(log.processing_time_ms)}
                                  </span>
                                </div>
                              </div>
                              <div className={`log-status ${log.success ? 'success' : 'error'}`}>
                                {log.success ? '✓' : '✗'}
                              </div>
                            </div>
                            
                            <div className="log-content">
                              <div className="response-section">
                                <h4>
                                  <Code size={16} />
                                  Generated Dialog
                                </h4>
                                <pre className="json-content">
                                  {formatJSON(log.response_text)}
                                </pre>
                              </div>
                              
                              {log.error_message && (
                                <div className="error-section">
                                  <h4>Error</h4>
                                  <p className="error-text">{log.error_message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {selectedTab === 'judgment' && (
                    <div className="logs-section tab-slide-in">
                      {judgmentLogs.length === 0 ? (
                        <div className="no-logs">
                          <Gavel size={32} />
                          <p>No judgment logs found</p>
                        </div>
                      ) : (
                        judgmentLogs.map((log, index) => (
                          <div 
                            key={log.id} 
                            className="log-card log-card-animate"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="log-header">
                              <div className="log-info">
                                <span className="log-type">Battle Judgment #{index + 1}</span>
                                <div className="log-meta">
                                  <span className="log-tokens">
                                    <Zap size={12} />
                                    {log.tokens_used} tokens
                                  </span>
                                  <span className="log-time">
                                    <Clock size={12} />
                                    {formatDuration(log.processing_time_ms)}
                                  </span>
                                </div>
                              </div>
                              <div className={`log-status ${log.success ? 'success' : 'error'}`}>
                                {log.success ? '✓' : '✗'}
                              </div>
                            </div>
                            
                            <div className="log-content">
                              <div className="response-section">
                                <h4>
                                  <Code size={16} />
                                  Judgment Result
                                </h4>
                                <pre className="json-content">
                                  {formatJSON(log.response_text)}
                                </pre>
                              </div>
                              
                              {log.error_message && (
                                <div className="error-section">
                                  <h4>Error</h4>
                                  <p className="error-text">{log.error_message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
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

        .modal-slide-in-right {
          animation: slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.9);
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

        .tab-navigation {
          display: flex;
          gap: 4px;
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 4px;
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background: none;
          color: #9999A5;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.4s ease;
        }

        .tab-button:hover {
          background: rgba(40, 40, 50, 0.6);
          color: #E6E6E6;
          transform: translateY(-2px);
        }

        .tab-button:hover::before {
          left: 100%;
        }

        .tab-button.active {
          background: rgba(60, 75, 95, 0.6);
          color: #E6E6E6;
          border: 1px solid rgba(80, 95, 115, 0.4);
          animation: activeTabPulse 2s ease-in-out infinite;
        }

        @keyframes activeTabPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(80, 95, 115, 0.4);
          }
          50% { 
            box-shadow: 0 0 0 4px rgba(80, 95, 115, 0.1);
          }
        }

        .tab-content {
          flex: 1;
        }

        .logs-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tab-slide-in {
          animation: tabSlideIn 0.4s ease-out;
        }

        @keyframes tabSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .no-logs {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
          color: #9999A5;
        }

        .log-card {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          overflow: hidden;
        }

        .log-card-animate {
          animation: logCardSlideIn 0.5s ease-out both;
        }

        @keyframes logCardSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .log-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(40, 40, 50, 0.6);
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
        }

        .log-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .log-type {
          color: #E6E6E6;
          font-weight: 600;
          font-size: 16px;
        }

        .log-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: #9999A5;
        }



        .log-tokens,
        .log-time {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .log-status {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        .log-status.success {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #22C55E;
        }

        .log-status.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #EF4444;
        }

        .log-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .response-section h4,
        .error-section h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px 0;
          color: #E6E6E6;
          font-size: 14px;
          font-weight: 600;
        }

        .json-content {
          background: rgba(20, 20, 30, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 8px;
          padding: 16px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;
          color: #E6E6E6;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .error-section {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 16px;
        }

        .error-text {
          color: #EF4444;
          margin: 0;
          font-size: 14px;
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar,
        .json-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track,
        .json-content::-webkit-scrollbar-track {
          background: rgba(30, 30, 40, 0.5);
        }

        .modal-body::-webkit-scrollbar-thumb,
        .json-content::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 120, 0.5);
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover,
        .json-content::-webkit-scrollbar-thumb:hover {
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

          .tab-button {
            font-size: 12px;
            padding: 10px 12px;
          }

          .log-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .json-content {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default DialogsModal; 