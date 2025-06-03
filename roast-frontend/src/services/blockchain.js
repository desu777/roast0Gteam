import { getAccount, switchChain, watchAccount } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmi.js';
import { zgGalileoTestnet } from '../config/wagmi.js';

export class BlockchainService {
  constructor() {
    this.config = wagmiConfig;
    this.targetChain = zgGalileoTestnet;
  }

  /**
   * Get current account information
   */
  getCurrentAccount() {
    const account = getAccount(this.config);
    return {
      address: account.address,
      isConnected: account.isConnected,
      chainId: account.chainId,
      status: account.status
    };
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected() {
    const account = getAccount(this.config);
    return account.isConnected && account.address;
  }

  /**
   * Check if user is on the correct chain
   */
  isCorrectChain() {
    const account = getAccount(this.config);
    return account.chainId === this.targetChain.id;
  }

  /**
   * Switch to the correct chain
   */
  async switchToCorrectChain() {
    try {
      await switchChain(this.config, {
        chainId: this.targetChain.id,
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to switch chain:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to switch network' 
      };
    }
  }

  /**
   * Get chain information
   */
  getChainInfo() {
    return {
      id: this.targetChain.id,
      name: this.targetChain.name,
      symbol: this.targetChain.nativeCurrency.symbol,
      explorer: this.targetChain.blockExplorers.default.url,
      rpc: this.targetChain.rpcUrls.default.http[0]
    };
  }

  /**
   * Watch for account changes
   */
  watchAccount(callback) {
    return watchAccount(this.config, {
      onChange: callback
    });
  }

  /**
   * Get wallet balance (this would typically use useBalance hook in component)
   */
  async getBalance(address) {
    // This is typically handled by useBalance hook in components
    // We'll implement this if needed for service-level balance checks
    return null;
  }

  /**
   * Format address for display
   */
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Create transaction URL for explorer
   */
  getTransactionUrl(txHash) {
    return `${this.targetChain.blockExplorers.default.url}/tx/${txHash}`;
  }

  /**
   * Create address URL for explorer
   */
  getAddressUrl(address) {
    return `${this.targetChain.blockExplorers.default.url}/address/${address}`;
  }

  /**
   * Validate address format
   */
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Sign message using wallet
   * This would typically be handled by useSignMessage hook in components
   */
  async signMessage(message) {
    // Implementation would depend on specific signing needs
    // Usually handled by useSignMessage hook in components
    throw new Error('signMessage should be implemented using useSignMessage hook in components');
  }

  /**
   * Send transaction
   * This would typically be handled by useSendTransaction hook in components
   */
  async sendTransaction(transactionRequest) {
    // Implementation would depend on specific transaction needs
    // Usually handled by useSendTransaction hook in components
    throw new Error('sendTransaction should be implemented using useSendTransaction hook in components');
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

// Export default
export default blockchainService; 