import { Coins, MessageSquare, Calculator, Palette, Zap, Trophy, Shield, Lock, Clock, Users, TreePine, Vote, PiggyBank, Award, BarChart3 } from 'lucide-react';
import { ContractType, RarityColors, ContractRarity } from '../types';

// Enhanced contract types with more variety and rarity - EXPANDED TO 17 BROWSER-COMPILABLE CONTRACTS
export const CONTRACT_TYPES: ContractType[] = [
  // COMMON (30% total)
  { 
    id: 'greeter', 
    name: 'Greeter', 
    icon: MessageSquare, 
    color: '#00D2E9', 
    rarity: 'common', 
    chance: 15, 
    description: 'A simple smart contract that stores and retrieves a greeting message. Perfect for learning blockchain basics - demonstrates state storage, function calls, and events on the blockchain.' 
  },
  { 
    id: 'counter', 
    name: 'Counter', 
    icon: Calculator, 
    color: '#FF5CAA', 
    rarity: 'common', 
    chance: 15, 
    description: 'An elementary contract that maintains a numerical counter. Shows fundamental concepts like state variables, increment/decrement functions, and how data persists on the blockchain.' 
  },

  // RARE (35% total)
  { 
    id: 'nft721', 
    name: 'ERC-721 NFT', 
    icon: Palette, 
    color: '#9B59B6', 
    rarity: 'rare', 
    chance: 8, 
    description: 'Non-Fungible Token contract for unique digital assets. Each token has a distinct identity and metadata. Perfect for digital art, collectibles, gaming items, and certificates of ownership.' 
  },
  { 
    id: 'lottery', 
    name: 'Lottery', 
    icon: Trophy, 
    color: '#F39C12', 
    rarity: 'rare', 
    chance: 7, 
    description: 'A decentralized lottery system where participants buy tickets and winners are selected randomly. Demonstrates randomness generation, time-based mechanics, and automated prize distribution on blockchain.' 
  },
  { 
    id: 'escrow', 
    name: 'Escrow', 
    icon: Shield, 
    color: '#3498DB', 
    rarity: 'rare', 
    chance: 7, 
    description: 'Holds funds safely until both buyer and seller confirm transaction completion or deadline expires. Classic conditional payment pattern with pull-over-push security and reentrancy protection.' 
  },
  { 
    id: 'vestingWallet', 
    name: 'Vesting Wallet', 
    icon: Clock, 
    color: '#16A085', 
    rarity: 'rare', 
    chance: 7, 
    description: 'Releases tokens linearly over time for employees and investors. Demonstrates time-based mechanics with block.timestamp and prevents rage-quit token dumping scenarios.' 
  },
  { 
    id: 'timelockVault', 
    name: 'Timelock Vault', 
    icon: Lock, 
    color: '#8E44AD', 
    rarity: 'rare', 
    chance: 6, 
    description: 'Freezes Ether until a specific date with just ~30 lines of code. Minimalistic but powerful for demonstrating trustless time-locks and audit-friendly smart contracts.' 
  },

  // EPIC (25% total)
  { 
    id: 'multisig', 
    name: 'MultiSig Wallet', 
    icon: Users, 
    color: '#E74C3C', 
    rarity: 'epic', 
    chance: 5, 
    description: 'Multi-signature wallet requiring multiple confirmations for transactions. Enhanced security for teams and organizations - prevents single points of failure and enables shared custody of digital assets.' 
  },
  { 
    id: 'staking', 
    name: 'Staking Pool', 
    icon: Zap, 
    color: '#2ECC71', 
    rarity: 'epic', 
    chance: 5, 
    description: 'Allows users to stake tokens and earn rewards over time. Implements lockup periods, reward calculations, and automated distribution. Core component of DeFi yield farming and network security mechanisms.' 
  },
  { 
    id: 'merkleAirdrop', 
    name: 'Merkle Airdrop', 
    icon: TreePine, 
    color: '#27AE60', 
    rarity: 'epic', 
    chance: 5, 
    description: 'Enables one-time token claims using Merkle proof verification. Ultra gas-efficient distribution without ZK complexity - demonstrates cryptographic hash tricks for scalable airdrops.' 
  },
  { 
    id: 'simpleCrowdsale', 
    name: 'Simple Crowdsale', 
    icon: Coins, 
    color: '#F39C12', 
    rarity: 'epic', 
    chance: 5, 
    description: 'Accepts ETH and mints tokens during presale with supply limits. Shows basic ICO economics, automated refunds for excess payments, and time-bounded token distribution mechanics.' 
  },

  // LEGENDARY (8% total)
  { 
    id: 'erc20', 
    name: 'ERC-20 Token', 
    icon: Coins, 
    color: '#FFD700', 
    rarity: 'legendary', 
    chance: 3, 
    description: 'The gold standard for fungible tokens on Ethereum-compatible networks. Creates your own cryptocurrency with transfer, approval, and minting capabilities. Used for DeFi, payments, and governance tokens.' 
  },
  { 
    id: 'minimalDao', 
    name: 'Minimal DAO Voting', 
    icon: Vote, 
    color: '#9B59B6', 
    rarity: 'legendary', 
    chance: 3, 
    description: 'Token-weighted voting system for decentralized governance. Simple yes/no proposals without hundreds of files - introduces blockchain democracy concepts and collective decision-making.' 
  },
  { 
    id: 'erc4626Vault', 
    name: 'ERC-4626 Vault', 
    icon: PiggyBank, 
    color: '#E74C3C', 
    rarity: 'legendary', 
    chance: 2, 
    description: 'Modern vault standard that accepts tokens, issues shares, and automatically tracks profits. Perfect bridge between staking pools and DeFi protocols with standardized interfaces.' 
  },

  // MYTHIC (2% total)
  { 
    id: 'soulboundToken', 
    name: 'Soulbound Token', 
    icon: Award, 
    color: '#FF0080', 
    rarity: 'mythic', 
    chance: 1, 
    description: 'Non-transferable NFT for reputation and credentials. Revolutionary concept for on-chain identity - cannot be sold or transferred, perfect for achievements, certificates, and social credit systems.' 
  },
  { 
    id: 'oracleConsumer', 
    name: 'Oracle Consumer', 
    icon: BarChart3, 
    color: '#8E44AD', 
    rarity: 'mythic', 
    chance: 1, 
    description: 'Fetches and stores real-world data like ETH/USD prices from external oracles. Bridges blockchain with reality - enables DeFi protocols to react to market conditions and external events.' 
  }
];

// Enhanced rarity system with mythic tier
export const RARITY_COLORS: Record<ContractRarity, RarityColors> = {
  common: { bg: 'rgba(96, 125, 139, 0.2)', border: '#607D8B', glow: 'rgba(96, 125, 139, 0.5)', textShadow: '0 0 10px rgba(96, 125, 139, 0.8)' },
  rare: { bg: 'rgba(41, 128, 185, 0.2)', border: '#2980B9', glow: 'rgba(41, 128, 185, 0.5)', textShadow: '0 0 15px rgba(41, 128, 185, 0.8)' },
  epic: { bg: 'rgba(142, 68, 173, 0.2)', border: '#8E44AD', glow: 'rgba(142, 68, 173, 0.5)', textShadow: '0 0 20px rgba(142, 68, 173, 0.9)' },
  legendary: { bg: 'rgba(255, 215, 0, 0.2)', border: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)', textShadow: '0 0 25px rgba(255, 215, 0, 1)' },
  mythic: { bg: 'rgba(255, 0, 128, 0.2)', border: '#FF0080', glow: 'rgba(255, 0, 128, 0.8)', textShadow: '0 0 30px rgba(255, 0, 128, 1)' }
};

export const ACHIEVEMENT_MESSAGES = [
  "First Contract Deployed! 🎉",
  "Lucky Streak! 🍀",
  "Rare Hunter! 💎",
  "Epic Collector! ⚡",
  "Legendary Master! 👑",
  "Mythic Achiever! 🌟",
  "Token Creator! 🪙",
  "DeFi Pioneer! 🚀",
  "Oracle Master! 📊",
  "DAO Founder! 🗳️"
]; 