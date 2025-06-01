import { deployContract, waitForTransactionReceipt, getAccount } from '@wagmi/core';
import { config } from '../lib/wagmi';
import { log } from '../utils';

export interface DeploymentParams {
  bytecode: string;
  abi: any[];
  args?: any[];
}

export interface DeploymentResult {
  success: boolean;
  txHash?: string;
  contractAddress?: string;
  error?: string;
}

export class BlockchainService {
  /**
   * Deploy a smart contract to the blockchain
   */
  async deployContract(params: DeploymentParams): Promise<DeploymentResult> {
    log.info('Starting contract deployment...');

    try {
      // Check if wallet is connected
      const account = getAccount(config);
      if (!account.isConnected || !account.address) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      log.info('Deploying contract from address:', account.address);

      // Deploy contract using wagmi deployContract
      const txHash = await deployContract(config, {
        abi: params.abi,
        bytecode: params.bytecode as `0x${string}`,
        args: params.args || [],
      });

      log.info('Deployment transaction sent:', txHash);

      // Wait for transaction to be mined
      log.info('Waiting for transaction confirmation...');
      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
      });

      if (receipt.status === 'success') {
        log.info('Contract deployed successfully:', {
          txHash: receipt.transactionHash,
          contractAddress: receipt.contractAddress,
          gasUsed: receipt.gasUsed.toString()
        });

        return {
          success: true,
          txHash: receipt.transactionHash,
          contractAddress: receipt.contractAddress || undefined
        };
      } else {
        log.error('Transaction failed:', receipt);
        return {
          success: false,
          error: 'Transaction failed',
          txHash: receipt.transactionHash
        };
      }

    } catch (error) {
      log.error('Deployment error:', error);
      
      let errorMessage = 'Unknown deployment error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get current account address
   */
  getCurrentAccount(): string | null {
    const account = getAccount(config);
    return account.isConnected ? account.address || null : null;
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    const account = getAccount(config);
    return account.isConnected;
  }
}

export const blockchainService = new BlockchainService(); 