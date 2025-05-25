import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

// Definicja custom chain 0G-Galileo-Testnet
export const zgGalileoTestnet = defineChain({
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
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
});

// Konfiguracja Wagmi - zaktualizowana wersja
export const wagmiConfig = createConfig({
  chains: [zgGalileoTestnet],
  connectors: [
    injected({ chains: [zgGalileoTestnet] }),
    walletConnect({
      projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
      chains: [zgGalileoTestnet],
    }),
  ],
  transports: {
    [zgGalileoTestnet.id]: http(),
  },
});

// Alternatywnie, jeśli powyższe nie działa, użyj getDefaultConfig ale z dodatkową konfiguracją
/*
export const wagmiConfig = getDefaultConfig({
  appName: '0G Roast Arena',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [zgGalileoTestnet],
  ssr: false,
  transports: {
    [zgGalileoTestnet.id]: http(),
  },
});
*/ 