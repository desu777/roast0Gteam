import React, { useEffect } from 'react';
import { ExternalLink, CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const TransactionNotification = ({ 
  type, 
  message, 
  txHash, 
  onClose, 
  duration = 5000,
  index = 0,
  currentJudge = null
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  const getExplorerUrl = (hash) => {
    return `https://chainscan-galileo.0g.ai/tx/${hash}`;
  };

  const getNotificationColors = () => {
    const judgeColor = currentJudge?.color || '#FFD700';
    
    switch (type) {
      case 'success':
        return {
          borderColor: judgeColor,
          iconColor: judgeColor
        };
      case 'error':
        return {
          borderColor: '#FF5C5C',
          iconColor: '#FF5C5C'
        };
      case 'warning':
        return {
          borderColor: '#FFA500',
          iconColor: '#FFA500'
        };
      case 'info':
        return {
          borderColor: judgeColor,
          iconColor: judgeColor
        };
      default:
        return {
          borderColor: judgeColor,
          iconColor: judgeColor
        };
    }
  };

  const colors = getNotificationColors();

  return (
    <>
      <div 
        className={`notification ${type}`}
        style={{
          transform: `translateY(-${index * 80}px)`,
          borderColor: `rgba(${hexToRgb(colors.borderColor)}, 0.3)`,
          '--icon-color': colors.iconColor
        }}
      >
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-content">
          <p className="notification-message">{message}</p>
          {txHash && (
            <a 
              href={getExplorerUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="notification-link"
            >
              View on Explorer <ExternalLink size={14} />
            </a>
          )}
        </div>
        <button className="notification-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        .notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: rgba(18, 18, 24, 0.95);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: start;
          gap: 12px;
          min-width: 320px;
          max-width: 420px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
          z-index: 1000;
          border: 1px solid;
          transition: transform 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(-${index * 80}px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(-${index * 80}px);
            opacity: 1;
          }
        }

        .notification-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--icon-color);
        }

        .notification-content {
          flex: 1;
        }

        .notification-message {
          color: #E6E6E6;
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 600;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbowText 3s linear infinite;
        }

        @keyframes rainbowText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .notification-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--icon-color);
          text-decoration: none;
          font-size: 13px;
          transition: opacity 0.2s;
        }

        .notification-link:hover {
          opacity: 0.8;
        }

        .notification-close {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 4px;
          margin: -4px -4px -4px 0;
          transition: color 0.2s;
        }

        .notification-close:hover {
          color: #E6E6E6;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .notification {
            bottom: 16px;
            right: 16px;
            left: 16px;
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 215, 0';
};

export default TransactionNotification; 