import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const JudgeModal = ({ judge, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle modal visibility animations
  useEffect(() => {
    if (judge) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [judge, isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Don't render if not visible
  if (!judge || !isVisible) return null;

  return (
    <>
      <div 
        className={`modal-overlay ${isClosing ? 'closing' : ''}`} 
        onClick={handleClose}
      >
        <div 
          className={`judge-modal ${isClosing ? 'closing' : ''}`} 
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <img 
              src={`/${judge.id}.jpg`} 
              alt={judge.name}
              className="modal-nft-image"
              style={{ borderColor: judge.color }}
            />
            <div>
              <h2>{judge.name}</h2>
              <p>{judge.role}</p>
            </div>
            <button 
              className="modal-close"
              onClick={handleClose}
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
          opacity: 0;
          animation: modalFadeIn 0.3s ease-out forwards;
        }

        .modal-overlay.closing {
          animation: modalFadeOut 0.3s ease-in forwards;
        }

        .judge-modal {
          background: rgba(18, 18, 24, 0.95);
          border-radius: 24px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          border: 2px solid ${judge?.color || '#00D2E9'};
          position: relative;
          max-height: 80vh;
          overflow-y: auto;
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          animation: modalSlideIn 0.3s ease-out forwards;
        }

        .judge-modal.closing {
          animation: modalSlideOut 0.3s ease-in forwards;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          position: relative;
        }

        .modal-nft-image {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid;
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
          color: ${judge?.color || '#00D2E9'};
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
          color: ${judge?.color || '#FFD700'} !important;
          font-style: italic;
          font-weight: 600;
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

        /* Modal Animations */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes modalSlideOut {
          from {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          to {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default JudgeModal; 