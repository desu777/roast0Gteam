import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

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

// Konfiguracja Wagmi z RainbowKit - lepsza kompatybilność z różnymi przeglądarkami
export const wagmiConfig = getDefaultConfig({
  appName: '0G Roast Arena',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'fc8b80dcdc0b7f7f08f8c89e3f95e866',
  chains: [zgGalileoTestnet],
  ssr: false,
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