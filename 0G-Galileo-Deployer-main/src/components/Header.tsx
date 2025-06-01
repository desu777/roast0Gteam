import React from 'react';
import { Volume2, VolumeX, Github } from 'lucide-react';
import { GameStats } from '../types';
import ConnectWallet from './ConnectWallet';

interface HeaderProps {
  stats: GameStats;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  streak: number;
}

// Custom X (Twitter) icon component
const XIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({
  stats,
  soundEnabled,
  setSoundEnabled,
  streak
}) => {
  return (
    <div className="header">
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Spins</span>
          <span className="stat-value">{stats.totalSpins}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{streak}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Deployed</span>
          <span className="stat-value">{stats.deployed.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Combo</span>
          <span className="stat-value">{stats.comboMultiplier.toFixed(1)}x</span>
        </div>
        <button 
          className="sound-toggle"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
      
      <div className="logo-container">
        <img src="/gamble.png" alt="0G" />
        {stats.comboMultiplier > 1 && (
          <div className="combo-indicator">{stats.comboMultiplier.toFixed(1)}x</div>
        )}
      </div>
      <h1>0G Contract Slot Machine</h1>
      <p className="subtitle">Spin to deploy your legendary smart contracts!</p>
      
      <div className="powered-by">
        <span className="powered-text">powered by desu</span>
        <div className="social-links">
          <a 
            href="https://x.com/nov3lolo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            title="Follow on X (Twitter)"
          >
            <XIcon size={16} />
          </a>
          <a 
            href="https://github.com/desu777" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            title="View on GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
      
      <div className="wallet-section">
        <ConnectWallet />
      </div>
      
      {streak > 0 && (
        <div className="streak-indicator">
          🔥 {streak} Win Streak! 🔥
        </div>
      )}
    </div>
  );
};

export default Header; 