import React, { useState } from 'react';
import { Zap, TreePine, AlertCircle } from 'lucide-react';
import { ContractType } from '../types';
import { getContractById } from '../contracts';
import { generateMerkleTree, parseRecipientsInput, generateExampleRecipients } from '../utils/merkleGenerator';

interface ConfigurationProps {
  selectedContract: ContractType;
  formData: Record<string, any>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBack: () => void;
  onDeploy: () => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  selectedContract,
  formData,
  onInputChange,
  onBack,
  onDeploy
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [merkleInfo, setMerkleInfo] = useState<{ totalAmount: string; recipientsCount: number } | null>(null);

  // Handle Merkle Root generation
  const handleGenerateMerkleRoot = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      let recipients;
      
      // Check if recipients list is provided
      if (formData.recipientsList && formData.recipientsList.trim()) {
        recipients = parseRecipientsInput(formData.recipientsList);
      } else {
        // Use example recipients if no list provided
        recipients = generateExampleRecipients();
        
        // Update the form with example data
        const exampleList = recipients.map(r => `${r.address},${r.amount}`).join('\n');
        const syntheticEvent = {
          target: { name: 'recipientsList', value: exampleList }
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
        onInputChange(syntheticEvent);
      }
      
      // Generate Merkle Tree
      const merkleTreeData = await generateMerkleTree(recipients);
      
      // Update merkle root in form
      const merkleRootEvent = {
        target: { name: 'merkleRoot', value: merkleTreeData.merkleRoot }
      } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
      onInputChange(merkleRootEvent);
      
      // Set info for display
      setMerkleInfo({
        totalAmount: merkleTreeData.totalAmount,
        recipientsCount: recipients.length
      });
      
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate Merkle Root');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle loading example recipients
  const handleLoadExample = () => {
    const recipients = generateExampleRecipients();
    const exampleList = recipients.map(r => `${r.address},${r.amount}`).join('\n');
    const syntheticEvent = {
      target: { name: 'recipientsList', value: exampleList }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    onInputChange(syntheticEvent);
  };

  const renderConfigForm = () => {
    // Get contract template from contracts/index.ts
    const contractTemplate = getContractById(selectedContract.id);
    
    if (!contractTemplate || !contractTemplate.formFields) {
      return (
        <div className="form-group">
          <label>⚙️ Contract Configuration</label>
          <input
            type="text"
            name="config"
            placeholder={`Configure your ${selectedContract.name}`}
            value={formData.config || ''}
            onChange={onInputChange}
            required
          />
        </div>
      );
    }

    // Render form fields dynamically based on contract definition
    return (
      <>
        {contractTemplate.formFields.map((field, index) => (
          <div key={index} className="form-group">
            <label>{getFieldIcon(field.name)} {field.label}</label>
            
            {/* Special handling for Merkle Airdrop recipients list */}
            {selectedContract.id === 'merkleAirdrop' && field.name === 'recipientsList' && (
              <div className="merkle-recipients-section">
                <div className="recipients-header">
                  <button 
                    type="button" 
                    className="load-example-btn"
                    onClick={handleLoadExample}
                  >
                    📋 Load Example
                  </button>
                  <span className="format-hint">Format: address,amount (one per line)</span>
                </div>
              </div>
            )}
            
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || (field as any).defaultValue || ''}
                onChange={onInputChange}
                required={field.required}
                rows={selectedContract.id === 'merkleAirdrop' && field.name === 'recipientsList' ? 6 : 4}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || (field as any).defaultValue || ''}
                onChange={onInputChange}
                required={field.required}
                step={field.type === 'number' && field.name.includes('Price') ? '0.000000000000000001' : undefined}
                readOnly={selectedContract.id === 'merkleAirdrop' && field.name === 'merkleRoot'}
              />
            )}
            
            {/* Special Generate button for Merkle Root */}
            {selectedContract.id === 'merkleAirdrop' && field.name === 'merkleRoot' && (
              <div className="merkle-generation-section">
                <button 
                  type="button" 
                  className={`generate-merkle-btn ${isGenerating ? 'generating' : ''}`}
                  onClick={handleGenerateMerkleRoot}
                  disabled={isGenerating}
                >
                  <TreePine size={16} />
                  {isGenerating ? 'Generating...' : 'Generate Merkle Root'}
                </button>
                
                {generationError && (
                  <div className="generation-error">
                    <AlertCircle size={16} />
                    {generationError}
                  </div>
                )}
                
                {merkleInfo && (
                  <div className="merkle-info">
                    <div className="info-item">
                      <span>Recipients:</span> <strong>{merkleInfo.recipientsCount}</strong>
                    </div>
                    <div className="info-item">
                      <span>Total Amount:</span> <strong>{(BigInt(merkleInfo.totalAmount) / BigInt('1000000000000000000')).toString()} 0G</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  // Helper function to get appropriate emoji for field names
  const getFieldIcon = (fieldName: string): string => {
    const iconMap: Record<string, string> = {
      // Generic
      'name': '📝',
      'symbol': '🏷️',
      'config': '⚙️',
      
      // Greeter
      'initialGreeting': '👋',
      'greeting': '👋',
      
      // Counter
      'initialCount': '🔢',
      
      // ERC-20 Token
      'initialSupply': '💰',
      'maxSupply': '📊',
      'mintPrice': '💸',
      
      // Lottery
      'ticketPrice': '🎫',
      'duration': '⏱️',
      
      // MultiSig
      'owners': '👥',
      'required': '✅',
      
      // Staking
      'rewardRate': '💎',
      'minimumStake': '💰',
      'lockupPeriod': '🔒',

      // Escrow
      'seller': '🏪',
      'deadlineInHours': '⏰',

      // Vesting Wallet
      'beneficiary': '👤',
      'durationInDays': '📅',
      'revocable': '🔄',

      // Timelock Vault
      'unlockTimeInDays': '🔐',

      // Merkle Airdrop
      'merkleRoot': '🌳',
      'claimPeriodInDays': '📅',

      // Simple Crowdsale
      'tokenName': '🪙',
      'tokenSymbol': '🏷️',
      'tokenPrice': '💰',
      'saleDurationInDays': '📅',

      // Dutch Auction
      'itemDescription': '📝',
      'startPrice': '💸',
      'minPrice': '💵',
      'durationInBlocks': '⛏️',

      // Minimal DAO
      'votingPeriodInDays': '🗳️',
      'quorum': '👥',

      // ERC-4626 Vault
      'profitRatePerYear': '📈',

      // Oracle Consumer
      'oracleAddress': '📡',
      'updateIntervalInMinutes': '⏱️',
      'maxPriceAgeInHours': '📊',
    };
    
    return iconMap[fieldName] || '⚙️';
  };

  return (
    <div className={`configuration-container rarity-${selectedContract.rarity}`}>
      <div className="config-header">
        <selectedContract.icon size={32} style={{ color: selectedContract.color }} />
        <div className="config-title">
          <h2>Configure {selectedContract.name}</h2>
          <p>{selectedContract.description}</p>
        </div>
        <span className={`rarity-badge rarity-${selectedContract.rarity}`}>
          {selectedContract.rarity}
        </span>
      </div>
      
      <div className="config-form">
        {renderConfigForm()}
        
        <div className="form-actions">
          <button type="button" className="back-button" onClick={onBack}>
            Back to Slot Machine
          </button>
          <button type="button" className={`deploy-button rarity-${selectedContract.rarity}`} onClick={onDeploy}>
            <Zap size={16} />
            Deploy {selectedContract.name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuration;