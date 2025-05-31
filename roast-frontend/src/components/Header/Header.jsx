import React from 'react';
import { 
  Volume2, VolumeX, Zap, Target, Users, Coins, RefreshCw, AlertTriangle, CheckCircle, Loader, Sparkles, SparklesIcon, Crown 
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';

const Header = ({ 
  soundEnabled, 
  setSoundEnabled,
  sparksEnabled,
  setSparksEnabled,
  roundNumber, 
  currentPlayerCount,
  prizePool,
  onHallOfFameClick
}) => {
  const { 
    address, 
    isConnected, 
    isCorrectChain, 
    isAuthenticated,
    balance, 
    connectWallet, 
    disconnectWallet,
    formatAddress,
    chainInfo,
    error: walletError,
    isLoading,
    isAuthenticating
  } = useWallet();

  return (
    <>
      <header className="arena-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-glow"></div>
              <img src="/gg.png" alt="0G Logo" className="logo-icon" />
            </div>
            <div className="title-group">
              <h1>0G Roast Arena</h1>
              <p>Global Battle Room - AI Judges Every Round</p>
            </div>
          </div>
          
          <div className="header-controls">
            <div className="controls-group">
              <button 
                className="control-toggle"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? (
                  <Volume2 size={20} className="active" />
                ) : (
                  <VolumeX size={20} className="inactive" />
                )}
              </button>
              
              <button 
                className="control-toggle"
                onClick={() => setSparksEnabled(!sparksEnabled)}
                title={sparksEnabled ? 'Disable sparks effect' : 'Enable sparks effect'}
              >
                <Sparkles size={20} className={sparksEnabled ? 'active' : 'inactive'} />
              </button>
            </div>
            
            {!isConnected ? (
              <button 
                className="connect-wallet-btn" 
                onClick={connectWallet}
                disabled={isLoading}
              >
                <Zap size={20} />
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="wallet-container">
                {!isCorrectChain && (
                  <div className="chain-warning">
                    <AlertTriangle size={16} />
                    <span>Wrong Network</span>
                  </div>
                )}
                
                <div className="wallet-card">
                  <div className="wallet-header">
                    <div className="wallet-status">
                      {isAuthenticating ? (
                        <Loader size={16} className="status-icon spinning" />
                      ) : isAuthenticated ? (
                        <CheckCircle size={16} className="status-icon authenticated" />
                      ) : (
                        <AlertTriangle size={16} className="status-icon warning" />
                      )}
                      <span className="status-text">
                        {isAuthenticating ? 'Authenticating...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    <button 
                      className="disconnect-btn"
                      onClick={disconnectWallet}
                      title="Disconnect wallet"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="wallet-body">
                    <div className="wallet-address">{formatAddress(address)}</div>
                    <div className="wallet-info">
                      <div className="balance-info">
                        <Coins size={14} />
                        <span>{balance} {chainInfo.symbol}</span>
                      </div>
                      <div className="network-info">
                        <div className={`network-dot ${isCorrectChain ? 'correct' : 'wrong'}`}></div>
                        <span>{isCorrectChain ? chainInfo.name : 'Wrong Network'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!isCorrectChain && (
                    <div className="wallet-footer">
                      <button className="switch-network-btn">
                        Switch to {chainInfo.name}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {walletError && (
          <div className="error-banner">
            <AlertTriangle size={16} />
            <span>{walletError}</span>
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <Target size={16} />
            <span>Round #{roundNumber}</span>
          </div>
          <div className="stat-card">
            <Users size={16} />
            <span>{currentPlayerCount} Players in Round</span>
          </div>
          
          {/* Hall of Fame Button */}
          {onHallOfFameClick && (
            <button 
              className="stat-card hall-of-fame-btn"
              onClick={onHallOfFameClick}
              title="View Hall of Fame"
            >
              <Crown size={16} />
              <span>Hall of Fame</span>
            </button>
          )}
          
          <div className="stat-card">
            <Coins size={16} />
            <span>{prizePool.toFixed(3)} {chainInfo.symbol} Pool</span>
          </div>
          <div className="stat-card">
            <RefreshCw size={16} />
            <span>Auto Judge</span>
          </div>
        </div>
      </header>

      <style jsx>{`
        .arena-header {
          padding: 20px;
          border-bottom: 1px solid rgba(60, 75, 95, 0.3);
          backdrop-filter: blur(10px);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .controls-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-toggle {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #E6E6E6;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .control-toggle .active {
          color: #FFD700;
          filter: drop-shadow(0 0 8px #FFD700);
          animation: goldenGlow 2s ease-in-out infinite alternate;
        }

        .control-toggle .inactive {
          color: #666;
          opacity: 0.7;
        }

        @keyframes goldenGlow {
          0% { filter: drop-shadow(0 0 8px #FFD700); }
          100% { filter: drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 20px rgba(255, 215, 0, 0.3)); }
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          animation: rainbowBackground 3s linear infinite;
        }

        .logo-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent);
          animation: logoGlow 2s infinite alternate;
        }

        .logo-icon {
          width: 75px;
          height: 75px;
          object-fit: contain;
          z-index: 2;
          border-radius: 50%;
        }

        @keyframes logoGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes rainbowBackground {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .title-group h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 800;
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

        .title-group p {
          margin: 0;
          color: #B0B0B0;
          font-size: 16px;
          font-weight: 500;
        }

        .connect-wallet-btn {
          position: relative;
          padding: 14px 28px;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #00D2E9);
          background-size: 200% 100%;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 210, 233, 0.3);
        }

        .connect-wallet-btn:not(:disabled) {
          animation: connectButtonFlow 3s linear infinite;
        }

        .connect-wallet-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .connect-wallet-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .connect-wallet-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 210, 233, 0.5);
        }

        .connect-wallet-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          animation: none;
          background: linear-gradient(135deg, #666, #444);
          box-shadow: none;
        }

        @keyframes connectButtonFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .wallet-container {
          position: relative;
        }

        .chain-warning {
          position: absolute;
          top: -10px;
          right: -10px;
          background: rgba(255, 92, 92, 0.2);
          border: 1px solid rgba(255, 92, 92, 0.5);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          color: #FF5C5C;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 10;
        }

        .wallet-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          min-width: 280px;
        }

        .wallet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .wallet-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .status-icon {
          width: 16px;
          height: 16px;
        }

        .status-icon.authenticated {
          color: #00B897;
        }

        .status-icon.warning {
          color: #FFD700;
        }

        .status-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .disconnect-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #FFD700;
          font-size: 22px;
          cursor: pointer;
          padding: 8px 10px;
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px #FFD700);
          animation: goldenGlow 2s ease-in-out infinite alternate;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .disconnect-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
          color: #FFD700;
          filter: drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 20px rgba(255, 215, 0, 0.3));
        }

        .wallet-body {
          space-y: 8px;
        }

        .wallet-address {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          color: #00D2E9;
          margin-bottom: 8px;
        }

        .wallet-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .balance-info,
        .network-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #B0B0B0;
        }

        .network-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .network-dot.correct {
          background: #00B897;
        }

        .network-dot.wrong {
          background: #FF5C5C;
        }

        .wallet-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .switch-network-btn {
          width: 100%;
          padding: 8px 16px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 6px;
          color: #FFD700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .switch-network-btn:hover {
          background: rgba(255, 215, 0, 0.2);
        }

        .error-banner {
          background: rgba(255, 92, 92, 0.1);
          border: 1px solid rgba(255, 92, 92, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #FF5C5C;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #E6E6E6;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: default;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .stat-card svg {
          color: #FFD700;
          filter: drop-shadow(0 0 8px #FFD700);
          animation: goldenGlow 2s ease-in-out infinite alternate;
        }

        /* Hall of Fame Button Styles */
        .hall-of-fame-btn {
          cursor: pointer;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hall-of-fame-btn span {
          font-weight: 800;
          background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9, #FFD700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hallOfFameText 3s linear infinite;
          position: relative;
          z-index: 2;
        }

        @keyframes hallOfFameText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .hall-of-fame-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
          transition: left 0.5s;
        }

        .hall-of-fame-btn:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: rgba(255, 215, 0, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }

        .hall-of-fame-btn:hover span {
          animation-duration: 1.5s;
        }

        .hall-of-fame-btn:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
          background: rgba(255, 215, 0, 0.25);
          border-color: rgba(255, 215, 0, 0.6);
          transition: all 0.1s ease;
        }

        .hall-of-fame-btn:active span {
          animation-duration: 1s;
        }

        .hall-of-fame-btn:hover::before {
          left: 100%;
        }

        .hall-of-fame-btn svg {
          color: #FFD700;
          filter: drop-shadow(0 0 10px #FFD700);
          transition: all 0.3s ease;
          background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9, #FFD700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hallOfFameIcon 3s linear infinite;
        }

        @keyframes hallOfFameIcon {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .hall-of-fame-btn:hover svg {
          transform: scale(1.1);
          filter: drop-shadow(0 0 15px #FFD700);
          animation-duration: 1.5s;
        }

        .hall-of-fame-btn:active svg {
          transform: scale(1.05);
          animation-duration: 1s;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .arena-header {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .header-controls {
            order: -1;
            width: 100%;
            justify-content: space-between;
          }

          .logo-container {
            width: 60px;
            height: 60px;
          }

          .logo-icon {
            width: 55px;
            height: 55px;
          }

          .title-group h1 {
            font-size: 24px;
          }

          .title-group p {
            font-size: 14px;
          }

          .wallet-card {
            min-width: 240px;
          }

          .stats-bar {
            gap: 10px;
          }

          .stat-card {
            font-size: 13px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .controls-group {
            gap: 6px;
          }

          .control-toggle {
            width: 40px;
            height: 40px;
          }

          .connect-wallet-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

export default Header; 