import { log } from './index';

/**
 * Process form data into constructor arguments for contract deployment
 */
export function processFormDataToConstructorArgs(formData: Record<string, any>, contractId: string): any[] {
  log.info('Processing form data for contract:', contractId);

  switch (contractId) {
    case 'greeter':
      return [formData.initialGreeting || 'Hello, World!'];
    
    case 'counter':
      return [parseInt(formData.initialCount) || 0];
    
    case 'nft721':
      return [
        formData.name || 'My NFT Collection',
        formData.symbol || 'MNC',
        formData.mintPrice || '1000000000000000000',
        parseInt(formData.maxSupply) || 10000
      ];
    
    case 'lottery':
      return [
        formData.ticketPrice || '100000000000000000',
        parseInt(formData.duration) || 3600
      ];
    
    case 'multisig':
      // Process owners from textarea (one address per line)
      const ownersText = formData.owners || '';
      const owners = ownersText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      const required = parseInt(formData.required) || 2;
      
      if (owners.length === 0) {
        throw new Error('At least one owner address is required');
      }
      
      if (required > owners.length) {
        throw new Error('Required confirmations cannot exceed number of owners');
      }
      
      return [owners, required];
    
    case 'staking':
      return [
        formData.rewardRate || '1000000',
        formData.minimumStake || '1000000000000000000',
        parseInt(formData.lockupPeriod) || 86400
      ];
    
    case 'erc20':
      return [
        formData.name || 'My Token',
        formData.symbol || 'MTK',
        formData.initialSupply || '1000000000000000000000000',
        formData.maxSupply || '10000000000000000000000000',
        formData.mintPrice || '1000000000000000'
      ];

    // New contracts
    case 'escrow':
      return [
        formData.seller,
        parseInt(formData.deadlineInHours) || 72
      ];

    case 'vestingWallet':
      return [
        formData.beneficiary,
        parseInt(formData.durationInDays) || 365,
        formData.revocable === 'true'
      ];

    case 'timelockVault':
      return [
        parseInt(formData.unlockTimeInDays) || 30
      ];

    case 'merkleAirdrop':
      return [
        formData.merkleRoot,
        parseInt(formData.claimPeriodInDays) || 90
      ];

    case 'simpleCrowdsale':
      return [
        formData.tokenName || 'My Presale Token',
        formData.tokenSymbol || 'MPT',
        formData.tokenPrice || '1000000000000000',
        formData.maxSupply || '1000000000000000000000000',
        parseInt(formData.saleDurationInDays) || 30
      ];

    case 'minimalDao':
      return [
        parseInt(formData.votingPeriodInDays) || 7,
        parseInt(formData.quorum) || 100000
      ];

    case 'erc4626Vault':
      return [
        formData.name || 'My Yield Vault',
        formData.symbol || 'MYV',
        parseInt(formData.profitRatePerYear) || 5
      ];

    case 'soulboundToken':
      return [
        formData.name || 'Achievement Badges',
        formData.symbol || 'ACHIEVE'
      ];

    case 'oracleConsumer':
      return [
        formData.oracleAddress,
        parseInt(formData.updateIntervalInMinutes) || 5,
        parseInt(formData.maxPriceAgeInHours) || 24
      ];
    
    default:
      log.warn('Unknown contract ID, returning empty args:', contractId);
      return [];
  }
}

/**
 * Validate form data for a specific contract
 */
export function validateFormData(formData: Record<string, any>, contractId: string): { isValid: boolean; error?: string } {
  try {
    switch (contractId) {
      case 'greeter':
        if (!formData.initialGreeting || formData.initialGreeting.trim().length === 0) {
          return { isValid: false, error: 'Initial greeting is required' };
        }
        break;
      
      case 'counter':
        const initialCount = parseInt(formData.initialCount);
        if (isNaN(initialCount) || initialCount < 0) {
          return { isValid: false, error: 'Initial count must be a non-negative number' };
        }
        break;
      
      case 'nft721':
        if (!formData.name || !formData.symbol) {
          return { isValid: false, error: 'NFT name and symbol are required' };
        }
        if (isNaN(parseInt(formData.maxSupply)) || parseInt(formData.maxSupply) <= 0) {
          return { isValid: false, error: 'Max supply must be a positive number' };
        }
        break;
      
      case 'lottery':
        if (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0) {
          return { isValid: false, error: 'Duration must be a positive number' };
        }
        break;
      
      case 'multisig':
        const owners = formData.owners?.split('\n').filter((line: string) => line.trim().length > 0) || [];
        const required = parseInt(formData.required);
        
        if (owners.length === 0) {
          return { isValid: false, error: 'At least one owner address is required' };
        }
        
        if (isNaN(required) || required <= 0 || required > owners.length) {
          return { isValid: false, error: 'Required confirmations must be between 1 and number of owners' };
        }
        
        // Basic address validation
        for (const owner of owners) {
          if (!owner.startsWith('0x') || owner.length !== 42) {
            return { isValid: false, error: `Invalid address format: ${owner}` };
          }
        }
        break;
      
      case 'staking':
        if (isNaN(parseInt(formData.lockupPeriod)) || parseInt(formData.lockupPeriod) < 0) {
          return { isValid: false, error: 'Lockup period must be a non-negative number' };
        }
        break;
      
      case 'erc20':
        if (!formData.name || !formData.symbol) {
          return { isValid: false, error: 'Token name and symbol are required' };
        }
        break;

      // New contract validations
      case 'escrow':
        if (!formData.seller || !formData.seller.startsWith('0x') || formData.seller.length !== 42) {
          return { isValid: false, error: 'Valid seller address is required' };
        }
        if (isNaN(parseInt(formData.deadlineInHours)) || parseInt(formData.deadlineInHours) <= 0) {
          return { isValid: false, error: 'Deadline must be a positive number' };
        }
        break;

      case 'vestingWallet':
        if (!formData.beneficiary || !formData.beneficiary.startsWith('0x') || formData.beneficiary.length !== 42) {
          return { isValid: false, error: 'Valid beneficiary address is required' };
        }
        if (isNaN(parseInt(formData.durationInDays)) || parseInt(formData.durationInDays) <= 0) {
          return { isValid: false, error: 'Duration must be a positive number' };
        }
        break;

      case 'timelockVault':
        if (isNaN(parseInt(formData.unlockTimeInDays)) || parseInt(formData.unlockTimeInDays) <= 0) {
          return { isValid: false, error: 'Unlock time must be a positive number' };
        }
        break;

      case 'merkleAirdrop':
        if (!formData.merkleRoot || !formData.merkleRoot.startsWith('0x') || formData.merkleRoot.length !== 66) {
          return { isValid: false, error: 'Valid merkle root (32 bytes) is required' };
        }
        if (isNaN(parseInt(formData.claimPeriodInDays)) || parseInt(formData.claimPeriodInDays) <= 0) {
          return { isValid: false, error: 'Claim period must be a positive number' };
        }
        break;

      case 'simpleCrowdsale':
        if (!formData.tokenName || !formData.tokenSymbol) {
          return { isValid: false, error: 'Token name and symbol are required' };
        }
        if (isNaN(parseInt(formData.saleDurationInDays)) || parseInt(formData.saleDurationInDays) <= 0) {
          return { isValid: false, error: 'Sale duration must be a positive number' };
        }
        break;

      case 'minimalDao':
        if (isNaN(parseInt(formData.votingPeriodInDays)) || parseInt(formData.votingPeriodInDays) <= 0) {
          return { isValid: false, error: 'Voting period must be a positive number' };
        }
        if (isNaN(parseInt(formData.quorum)) || parseInt(formData.quorum) <= 0) {
          return { isValid: false, error: 'Quorum must be a positive number' };
        }
        break;

      case 'erc4626Vault':
        if (!formData.name || !formData.symbol) {
          return { isValid: false, error: 'Vault name and symbol are required' };
        }
        if (isNaN(parseInt(formData.profitRatePerYear)) || parseInt(formData.profitRatePerYear) < 0) {
          return { isValid: false, error: 'Profit rate must be a non-negative number' };
        }
        break;

      case 'soulboundToken':
        if (!formData.name || !formData.symbol) {
          return { isValid: false, error: 'SBT name and symbol are required' };
        }
        break;

      case 'oracleConsumer':
        if (!formData.oracleAddress || !formData.oracleAddress.startsWith('0x') || formData.oracleAddress.length !== 42) {
          return { isValid: false, error: 'Valid oracle address is required' };
        }
        if (isNaN(parseInt(formData.updateIntervalInMinutes)) || parseInt(formData.updateIntervalInMinutes) <= 0) {
          return { isValid: false, error: 'Update interval must be a positive number' };
        }
        if (isNaN(parseInt(formData.maxPriceAgeInHours)) || parseInt(formData.maxPriceAgeInHours) <= 0) {
          return { isValid: false, error: 'Max price age must be a positive number' };
        }
        break;
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Validation error' 
    };
  }
} 