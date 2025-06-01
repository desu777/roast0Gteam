import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain, http } from 'viem';
import { log } from '../utils';

// 0G-Galileo-Testnet custom chain definition
export const zeroGGalileoTestnet = defineChain({
  id: 16601,
  name: '0G-Galileo-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Chain Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
});

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = '') => {
  return import.meta.env[key] || fallback;
};

// WalletConnect Project ID from environment variables
const projectId = getEnvVar('VITE_WALLETCONNECT_PROJECT_ID', '');

if (!projectId) {
  log.warn('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable. Using demo mode.');
} else {
  log.info('WalletConnect Project ID configured:', projectId.substring(0, 8) + '...');
}

log.info('Configuring 0G-Galileo-Testnet chain:', {
  id: zeroGGalileoTestnet.id,
  name: zeroGGalileoTestnet.name,
  rpc: zeroGGalileoTestnet.rpcUrls.default.http[0],
  explorer: zeroGGalileoTestnet.blockExplorers.default.url
});

// Wagmi configuration
export const config = getDefaultConfig({
  appName: '0G Contract Slot Machine',
  projectId: projectId || 'demo', // Use demo as fallback for development
  chains: [zeroGGalileoTestnet],
  transports: {
    [zeroGGalileoTestnet.id]: http('https://evmrpc-testnet.0g.ai'),
  },
  ssr: false, // We're using Vite, not SSR
}); 