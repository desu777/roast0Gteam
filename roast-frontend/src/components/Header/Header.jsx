import React from 'react';
import { 
  Volume2, VolumeX, Zap, Target, Users, Coins, RefreshCw, AlertTriangle, CheckCircle, Loader, Sparkles, SparklesIcon, Crown 
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import HeaderStyles from '../../styles/HeaderStyles';

const Header = ({ 
  soundEnabled, 
  setSoundEnabled,
  sparksEnabled,
  setSparksEnabled,
  roundNumber, 
  currentPlayerCount,
  prizePool,
  onHallOfFameClick,
  currentJudge
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
                    <div className="wallet-address" style={{ color: currentJudge?.color || '#00D2E9' }}>{formatAddress(address)}</div>
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

      <style jsx>{HeaderStyles}</style>
    </>
  );
};

export default Header; 