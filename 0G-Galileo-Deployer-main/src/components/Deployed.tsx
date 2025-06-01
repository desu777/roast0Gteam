import React from 'react';
import { Trophy, Rocket, ExternalLink } from 'lucide-react';
import { ContractType, DeploymentStatus } from '../types';

interface DeployedProps {
  selectedContract: ContractType;
  deploymentStatus: DeploymentStatus;
  onReset: () => void;
}

const Deployed: React.FC<DeployedProps> = ({
  selectedContract,
  deploymentStatus,
  onReset
}) => {
  // Get explorer URL from environment variables
  const explorerUrl = import.meta.env.VITE_0G_EXPLORER_URL || 'https://chainscan-galileo.0g.ai';
  const transactionUrl = `${explorerUrl}/tx/${deploymentStatus.txHash}`;
  const contractUrl = `${explorerUrl}/address/${deploymentStatus.contractAddress}`;

  const openExplorer = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="deployed-container">
      <div className="success-explosion">
        <Trophy size={64} />
        <div className="success-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`success-particle particle-${i}`}></div>
          ))}
        </div>
      </div>
      <h2>Contract Deployed Successfully!</h2>
      
      <div className="deployment-info">
        <div className="info-item">
          <label>Contract Type:</label>
          <div className="contract-type-display">
            <selectedContract.icon size={20} style={{ color: selectedContract.color }} />
            <span>{selectedContract.name}</span>
            <span className={`rarity-badge rarity-${selectedContract.rarity}`}>
              {selectedContract.rarity}
            </span>
          </div>
        </div>
        <div className="info-item">
          <label>Transaction Hash:</label>
          <div className="hash-container">
            <code className="hash-display">{deploymentStatus.txHash}</code>
            <button 
              className="explorer-link" 
              onClick={() => openExplorer(transactionUrl)}
              title="View transaction on explorer"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
        <div className="info-item">
          <label>Contract Address:</label>
          <div className="hash-container">
            <code className="hash-display">{deploymentStatus.contractAddress}</code>
            <button 
              className="explorer-link" 
              onClick={() => openExplorer(contractUrl)}
              title="View contract on explorer"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
        <div className="info-item">
          <label>Gas Used:</label>
          <span>{(Math.random() * 500000 + 100000).toFixed(0)} gas</span>
        </div>
      </div>
      
      <div className="deployed-actions">
        <button 
          className="view-button"
          onClick={() => openExplorer(transactionUrl)}
        >
          <ExternalLink size={16} />
          View Transaction on Explorer
        </button>
        <button className="spin-again-button" onClick={onReset}>
          <Rocket size={16} />
          Spin Again!
        </button>
      </div>
    </div>
  );
};

export default Deployed; 