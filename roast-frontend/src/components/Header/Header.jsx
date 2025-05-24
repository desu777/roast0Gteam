import React from 'react';
import { 
  Flame, Volume2, VolumeX, Zap, Target, Users, Coins, RefreshCw 
} from 'lucide-react';

const Header = ({ 
  soundEnabled, 
  setSoundEnabled, 
  isConnected, 
  connectWallet, 
  roundNumber, 
  totalParticipants, 
  prizePool 
}) => {
  return (
    <>
      <header className="arena-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-glow"></div>
              <Flame size={40} className="logo-icon" />
            </div>
            <div className="title-group">
              <h1>0G Roast Arena</h1>
              <p>Global Battle Room - AI Judges Every Round</p>
            </div>
          </div>
          
          <div className="header-controls">
            <button 
              className="sound-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            {!isConnected ? (
              <button className="connect-wallet-btn" onClick={connectWallet}>
                <Zap size={20} />
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-status">
                  <div className="status-dot"></div>
                  Connected
                </div>
                <div className="wallet-balance">5.42 0G</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <Target size={16} />
            <span>Round #{roundNumber}</span>
          </div>
          <div className="stat-card">
            <Users size={16} />
            <span>{totalParticipants} Total Players</span>
          </div>
          <div className="stat-card">
            <Coins size={16} />
            <span>{prizePool.toFixed(3)} 0G Pool</span>
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

        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-container {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFD700, #FF5CAA);
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
          color: #000;
          z-index: 2;
        }

        @keyframes logoGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        .title-group h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: rainbowText 3s linear infinite;
        }

        .title-group p {
          margin: 5px 0 0 0;
          color: #9999A5;
          font-style: italic;
        }

        @keyframes rainbowText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .sound-toggle {
          background: rgba(18, 18, 24, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 12px;
          color: #9999A5;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sound-toggle:hover {
          color: #00D2E9;
          border-color: #00D2E9;
        }

        .connect-wallet-btn {
          background: linear-gradient(135deg, #00D2E9, #FF5CAA);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .connect-wallet-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 210, 233, 0.4);
        }

        .wallet-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .wallet-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #00D2E9;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00B897;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .wallet-balance {
          font-size: 12px;
          color: #9999A5;
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
          padding: 12px 16px;
          background: rgba(18, 18, 24, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(60, 75, 95, 0.3);
          font-size: 14px;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .arena-header {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .stats-bar {
            gap: 10px;
          }

          .stat-card {
            padding: 8px 12px;
            font-size: 12px;
          }

          .title-group h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Header; 