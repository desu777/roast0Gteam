import React from 'react';
import { 
  Volume2, VolumeX, Target, Users, Coins, RefreshCw, Crown, Sparkles, Swords
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import ConnectWallet from '../ConnectWallet/ConnectWallet';
import { zgGalileoTestnet } from '../../config/wagmi';
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
  currentJudge,
  gameMode,
  onGameModeToggle
}) => {
  // Use wagmi hooks directly for basic wallet info
  const { address, isConnected, chainId } = useAccount();
  const { data: balance } = useBalance({ 
    address, 
    chainId: zgGalileoTestnet.id 
  });

  // Check if on correct chain
  const isCorrectChain = chainId === zgGalileoTestnet.id;

  // Format balance for display
  const formatBalance = (balance) => {
    if (!balance) return '0.000';
    return parseFloat(balance.formatted).toFixed(3);
  };

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
            
            {/* Custom ConnectWallet Component */}
            <ConnectWallet currentJudge={currentJudge} />
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
          
          {/* 1v1 Battle / Arena Toggle Button */}
          {onGameModeToggle && (
            <button 
              className="stat-card game-mode-toggle-btn"
              onClick={onGameModeToggle}
              title={gameMode === 'arena' ? 'Switch to 1v1 Battle' : 'Switch to Arena'}
            >
              <Swords size={16} />
              <span>{gameMode === 'arena' ? '1v1 Battle' : 'Arena'}</span>
            </button>
          )}
          
          <div className="stat-card">
            <Coins size={16} />
            <span>{prizePool.toFixed(3)} {zgGalileoTestnet.nativeCurrency.symbol} Pool</span>
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