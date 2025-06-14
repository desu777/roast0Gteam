import React, { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, Target, Users, Coins, RefreshCw, Crown, Sparkles, Swords, Crosshair
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import ConnectWallet from '../ConnectWallet/ConnectWallet';
import { zgGalileoTestnet } from '../../config/wagmi';
import HeaderStyles from '../../styles/HeaderStyles';
import HeaderExplanationModal from './HeaderExplanationModal';

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
  onGameModeToggle,
  // OneVSone betting data
  battleBets
}) => {
  // Use wagmi hooks directly for basic wallet info
  const { address, isConnected, chainId } = useAccount();
  const { data: balance } = useBalance({ 
    address, 
    chainId: zgGalileoTestnet.id 
  });

  // Check if on correct chain
  const isCorrectChain = chainId === zgGalileoTestnet.id;

  // Modal state for explanations
  const [explanationModal, setExplanationModal] = useState({
    isOpen: false,
    type: null,
    data: null
  });

  // State for game mode transition
  const [displayMode, setDisplayMode] = useState(gameMode);
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    if (gameMode !== displayMode) {
      setTransitionClass('fade-out');
      setTimeout(() => {
        setDisplayMode(gameMode);
        setTransitionClass('fade-in');
        setTimeout(() => setTransitionClass(''), 300); // Reset class after animation
      }, 300); // Match CSS transition duration
    }
  }, [gameMode, displayMode]);

  // Format balance for display
  const formatBalance = (balance) => {
    if (!balance) return '0.000';
    return parseFloat(balance.formatted).toFixed(3);
  };

  // Handle explanation modal
  const showExplanation = (type, data) => {
    setExplanationModal({
      isOpen: true,
      type,
      data
    });
  };

  const closeExplanation = () => {
    setExplanationModal({
      isOpen: false,
      type: null,
      data: null
    });
  };

  return (
    <>
      <header 
        className="arena-header"
        style={{
          '--judge-color': currentJudge?.color || '#FFD700',
          '--judge-color-rgb': currentJudge?.color ? 
            currentJudge.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : 
            '255, 215, 0'
        }}
      >
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
        <div className={`stats-bar ${transitionClass}`}>
          {displayMode === 'onevsone' ? (
            // OneVSone Mode - Betting Stats Layout
            <>
              {/* 0G Team Bets Count */}
              <button 
                className="stat-card bet-count og-bets interactive-stat"
                onClick={() => showExplanation('bets', battleBets?.og)}
                title="Click to learn about betting"
              >
                <Target size={16} />
                <span>{battleBets?.og?.count || 0} bets</span>
              </button>

              {/* 0G Team Odds */}
              <button 
                className="stat-card odds-display interactive-stat"
                onClick={() => showExplanation('odds', battleBets?.og)}
                title="Click to learn about odds"
              >
                <Crosshair size={16} />
                <span>{battleBets?.og?.odds || '1.0x'} Odds</span>
              </button>

              {/* 0G Team Betting Stats - Compact */}
              <button 
                className="stat-card betting-stats-compact og-team interactive-stat"
                onClick={() => showExplanation('og-team', battleBets?.og)}
                title="Click to learn about 0G Team"
              >
                <div className="betting-icon">0G</div>
                <div className="betting-info-compact">
                  <span className="betting-amount">{(battleBets?.og?.total || 0).toFixed(3)} 0G</span>
                </div>
              </button>

              {/* 1v1 Battle / Arena Toggle Button */}
              {onGameModeToggle && (
                <button 
                  className="stat-card game-mode-toggle-btn"
                  onClick={onGameModeToggle}
                  title={displayMode === 'arena' ? 'Switch to 1v1 Battle' : 'Switch to Arena'}
                >
                  <Swords size={16} />
                  <span>{displayMode === 'arena' ? '1v1 Battle' : 'Arena'}</span>
                </button>
              )}

              {/* Roaster Betting Stats - Compact */}
              <button 
                className="stat-card betting-stats-compact roaster interactive-stat"
                onClick={() => showExplanation('roaster', battleBets?.roaster)}
                title="Click to learn about Crypto Roasters"
              >
                <div className="roaster-logo-container">
                  <div className="roaster-logo-glow"></div>
                  <img src="/gg.png" alt="Roaster Logo" className="roaster-logo-icon" />
                </div>
                <div className="betting-info-compact">
                  <span className="betting-amount">{(battleBets?.roaster?.total || 0).toFixed(3)} 0G</span>
                </div>
              </button>

              {/* Roaster Odds */}
              <button 
                className="stat-card odds-display interactive-stat"
                onClick={() => showExplanation('odds', battleBets?.roaster)}
                title="Click to learn about odds"
              >
                <Crosshair size={16} />
                <span>{battleBets?.roaster?.odds || '1.0x'} Odds</span>
              </button>

              {/* Roaster Bets Count */}
              <button 
                className="stat-card bet-count roaster-bets interactive-stat"
                onClick={() => showExplanation('bets', battleBets?.roaster)}
                title="Click to learn about betting"
              >
                <Target size={16} />
                <span>{battleBets?.roaster?.count || 0} bets</span>
              </button>
            </>
          ) : (
            // Arena Mode - Original Stats Layout
            <>
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
                  title={displayMode === 'arena' ? 'Switch to 1v1 Battle' : 'Switch to Arena'}
                >
                  <Swords size={16} />
                  <span>{displayMode === 'arena' ? '1v1 Battle' : 'Arena'}</span>
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
            </>
          )}
        </div>
      </header>

      {/* Explanation Modal */}
      <HeaderExplanationModal
        isOpen={explanationModal.isOpen}
        onClose={closeExplanation}
        type={explanationModal.type}
        data={explanationModal.data}
        currentJudge={currentJudge}
      />

      <style jsx>{HeaderStyles}</style>
    </>
  );
};

export default Header; 