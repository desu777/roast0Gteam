import React from 'react';
import { ExternalLink } from 'lucide-react';

const JudgeModal = ({ judge, onClose }) => {
  if (!judge) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="judge-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <judge.icon size={48} style={{ color: judge.color }} />
            <div>
              <h2>{judge.name}</h2>
              <p>{judge.role}</p>
            </div>
            <button 
              className="modal-close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="detail-section">
              <h4>Personality & Background</h4>
              <p>{judge.personality}</p>
            </div>
            <div className="detail-section">
              <h4>Judging Style</h4>
              <p>{judge.decisionStyle}</p>
            </div>
            <div className="detail-section">
              <h4>Roasting Notes</h4>
              <p>{judge.roastingNotes}</p>
            </div>
            <div className="detail-section">
              <h4>Signature Phrase</h4>
              <p className="catchphrase">"{judge.catchphrase}"</p>
            </div>
          </div>

          <div className="modal-footer">
            <a 
              href={judge.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="twitter-link"
            >
              <ExternalLink size={16} />
              Follow on X
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(10px);
        }

        .judge-modal {
          background: rgba(18, 18, 24, 0.95);
          border-radius: 24px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          border: 2px solid #00D2E9;
          position: relative;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          position: relative;
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #E6E6E6;
          margin: 0;
        }

        .modal-header p {
          color: #9999A5;
          margin: 0;
        }

        .modal-close {
          position: absolute;
          top: -8px;
          right: -8px;
          background: rgba(255, 87, 87, 0.1);
          border: 1px solid #FF5757;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF5757;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: rgba(255, 87, 87, 0.2);
          transform: scale(1.1);
        }

        .modal-content {
          margin-bottom: 24px;
        }

        .detail-section {
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(10, 10, 10, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .detail-section h4 {
          color: #00D2E9;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
        }

        .detail-section p {
          color: #9999A5;
          line-height: 1.5;
          margin: 0;
        }

        .catchphrase {
          color: #FFD700 !important;
          font-style: italic;
          font-weight: 600;
        }

        .modal-footer {
          text-align: center;
        }

        .twitter-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #1DA1F2, #0d8bd9);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .twitter-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(29, 161, 242, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modal-header {
            flex-direction: column;
            text-align: center;
          }

          .judge-modal {
            padding: 20px;
            margin: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default JudgeModal; 