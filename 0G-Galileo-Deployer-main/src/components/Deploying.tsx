import React from 'react';
import { Cpu } from 'lucide-react';
import { ContractType } from '../types';

export type DeploymentPhase = 'compiling' | 'broadcasting' | 'confirming';

interface DeployingProps {
  selectedContract: ContractType | null;
  currentPhase: DeploymentPhase;
  error?: string;
}

const Deploying: React.FC<DeployingProps> = ({ selectedContract, currentPhase, error }) => {
  const getStepClass = (step: DeploymentPhase) => {
    const steps: DeploymentPhase[] = ['compiling', 'broadcasting', 'confirming'];
    const currentIndex = steps.indexOf(currentPhase);
    const stepIndex = steps.indexOf(step);
    
    if (error && stepIndex === currentIndex) {
      return 'step error';
    }
    
    if (stepIndex < currentIndex) {
      return 'step completed';
    } else if (stepIndex === currentIndex) {
      return 'step active';
    } else {
      return 'step';
    }
  };

  const getStatusText = () => {
    if (error) {
      return `Deployment Failed: ${error}`;
    }

    switch (currentPhase) {
      case 'compiling':
        return 'Compiling contract source code...';
      case 'broadcasting':
        return 'Broadcasting to 0G Network...';
      case 'confirming':
        return 'Confirming on Chain...';
      default:
        return 'Deploying contract...';
    }
  };

  return (
    <div className="deploying-container">
      <div className="deploying-animation">
        <div className="deploy-visual">
          <Cpu size={64} className={`cpu-icon ${error ? 'error' : ''}`} />
          <div className="energy-rings">
            <div className={`ring ring-1 ${error ? 'error' : ''}`}></div>
            <div className={`ring ring-2 ${error ? 'error' : ''}`}></div>
            <div className={`ring ring-3 ${error ? 'error' : ''}`}></div>
          </div>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${error ? 'error' : ''}`}></div>
          <div className={`progress-glow ${error ? 'error' : ''}`}></div>
        </div>
        <h2>{error ? 'Deployment Failed' : `Deploying ${selectedContract?.name}...`}</h2>
        <p>{getStatusText()}</p>
        <div className="deployment-steps">
          <div className={getStepClass('compiling')}>Compiling Contract</div>
          <div className={getStepClass('broadcasting')}>Broadcasting Transaction</div>
          <div className={getStepClass('confirming')}>Confirming on Chain</div>
        </div>
      </div>
    </div>
  );
};

export default Deploying; 