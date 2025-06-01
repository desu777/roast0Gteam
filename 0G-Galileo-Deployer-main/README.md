# 0G Contract Slot Machine

A gamified smart contract deployment platform built with React, TypeScript, and Vite. Spin the slot machine to randomly deploy different types of smart contracts with a rarity system inspired by gaming mechanics. **Now with real blockchain deployment on 0G-Galileo-Testnet!**

## 🚀 Latest Updates

### Version 2.0 - Major Expansion
- **🎯 16 Contract Types**: Expanded from 7 to 16 unique smart contracts
- **⛓️ Real Blockchain Integration**: Deploy to 0G-Galileo-Testnet (Chain ID: 16601)
- **🛠️ Production Backend**: Express.js compiler with real Solidity compilation
- **🎨 Enhanced UI**: Improved positioning, better mobile experience
- **🔧 Bug Fixes**: Resolved naming conflicts and compilation errors
- **📊 Improved Rarity Distribution**: Balanced for better gameplay

## Features

- 🎰 **Slot Machine Mechanics**: Spin to randomly select from **16 different contract types**
- 🌟 **Rarity System**: Contracts have different rarity levels (Common, Rare, Epic, Legendary, Mythic)
- ⛓️ **Real Blockchain Deployment**: Deploy to 0G-Galileo-Testnet with RainbowKit/Wagmi integration
- 🔥 **Combo System**: Build streaks for better chances at rare contracts
- 🎮 **Gamification**: Achievements, statistics tracking, and visual effects
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎵 **Sound Effects**: Audio feedback for different rarity levels
- ✨ **Visual Effects**: Particles, animations, and dynamic styling
- 🌐 **Web3 Integration**: Connect wallet, switch networks, view on explorer

## Contract Types & Rarity Distribution

### Mythic - 2% (Ultra Rare)
- **Cross-Chain Bridge** - Multi-chain asset transfers with validation
- **DAO Governance** - Token-weighted proposal voting system
- **DEX Router** - Decentralized exchange routing with slippage

### Legendary - 8% (Very Rare)  
- **ERC-20 Token** - Standard fungible token with all features
- **Price Oracle** - External data feeds with tamper resistance
- **Minimal DAO Voting** - Simple governance for decentralized decisions
- **ERC-4626 Vault** - Yield-bearing vault following DeFi standard

### Epic - 25% (Rare)
- **MultiSig Wallet** - Multi-signature security for teams
- **Staking Pool** - Token staking with reward distribution
- **NFT Marketplace** - Trade NFTs with royalty support
- **Merkle Airdrop** - Gas-efficient token distribution (hardcoded root)
- **Simple Crowdsale** - ICO/presale token mechanics

### Rare - 35% (Uncommon)
- **ERC-721 NFT** - Non-fungible tokens for unique assets
- **Lottery** - Decentralized lottery with random selection
- **Escrow** - Conditional payment system with dispute resolution
- **Vesting Wallet** - Linear token release over time
- **Timelock Vault** - Time-locked Ether storage

### Common - 30%
- **Greeter** - Simple message storage and retrieval
- **Counter** - Basic increment/decrement functionality

## 🔧 Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript 5.6.2** - Type safety and developer experience
- **Vite 6.0.7** - Lightning-fast build tool and dev server
- **RainbowKit** - Beautiful wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Lucide React 0.511.0** - Beautiful icon library

### Backend
- **Express.js** - RESTful API server
- **Solidity Compiler** - Real smart contract compilation
- **CORS** - Cross-origin resource sharing

### Blockchain
- **0G-Galileo-Testnet** - Target deployment network (Chain ID: 16601)
- **Solidity ^0.8.20** - Smart contract language
- **MetaMask/WalletConnect** - Wallet integration

## 📁 Project Structure

```
src/
├── components/          # React components (each <400 lines)
│   ├── Header.tsx      # Stats bar, wallet connection, sound toggle
│   ├── SlotMachine.tsx # Main slot machine with rarity effects
│   ├── Configuration.tsx # Dynamic contract configuration forms
│   ├── Deploying.tsx   # Real deployment progress animation
│   └── Deployed.tsx    # Success screen with explorer links
├── contracts/          # Smart contract templates (17 total)
│   ├── greeter.ts      # Simple message storage
│   ├── erc20.ts        # Standard fungible token
│   ├── nft721.ts       # Non-fungible token
│   ├── multisig.ts     # Multi-signature wallet
│   ├── staking.ts      # Token staking pool
│   ├── lottery.ts      # Decentralized lottery
│   ├── crossChainBridge.ts # Cross-chain transfers
│   ├── daoGovernance.ts # DAO voting system
│   ├── dexRouter.ts    # DEX routing logic
│   ├── priceOracle.ts  # External data feeds
│   ├── nftMarketplace.ts # NFT trading platform
│   ├── escrow.ts       # Conditional payments
│   ├── vestingWallet.ts # Linear token vesting
│   ├── timelockVault.ts # Time-locked storage
│   ├── merkleAirdrop.ts # Gas-efficient airdrops
│   ├── simpleCrowdsale.ts # ICO mechanics
│   └── dutchAuction.ts # Decreasing price auctions
├── constants/
│   └── index.ts        # Contract types, rarity colors, achievements
├── types/
│   └── index.ts        # TypeScript type definitions
├── utils/
│   └── index.ts        # Helper functions (particles, sounds, random)
├── styles/
│   └── globals.css     # Enhanced CSS with responsive design
├── App.tsx             # Main application orchestrator
└── main.tsx            # React entry point with providers
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- 0G-Galileo-Testnet added to wallet

### 1. Clone and Install
```bash
git clone <repository-url>
cd deployer
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
VITE_0G_CHAIN_ID=16601
VITE_0G_RPC_URL=https://rpc-testnet.0g.ai
VITE_0G_EXPLORER_URL=https://chainscan-galileo.0g.ai
```

### 3. Start Backend Compiler
```bash
cd compiler
npm install
npm start
# Server runs on http://localhost:3001
```

### 4. Start Frontend
```bash
npm run dev
# App runs on http://localhost:5173
```

### 5. Production Build
```bash
npm run build
npm run preview
```

## 🎮 How to Play

### 1. Connect Wallet
- Click "Connect Wallet" in the header
- Choose your preferred wallet (MetaMask, WalletConnect, etc.)
- Ensure you're on 0G-Galileo-Testnet

### 2. Spin the Machine
- Click "SPIN TO DEPLOY" to start the slot machine
- Watch the reels spin with anticipation
- Celebrate when you get matching contracts!

### 3. Configure Contract
- Fill out the dynamic configuration form
- Each contract type has specific parameters
- Icons help identify field types

### 4. Deploy to Blockchain
- Click "DEPLOY CONTRACT" to start real deployment
- Watch the compilation and deployment phases
- Transaction is submitted to 0G-Galileo-Testnet

### 5. Success & Exploration
- View your deployed contract details
- Click explorer links to see on-chain data
- Spin again to build combo multipliers!

## 🎯 Game Mechanics

### Combo System
- Non-common contracts increase your streak
- Higher streaks improve chances for rare contracts
- Combo multiplier caps at 2.0x for mythic chances
- Common contracts reset your streak to 0

### Enhanced Achievements
- **First Contract Deployed** - Welcome to blockchain!
- **Lucky Streak** - 5+ consecutive non-common contracts
- **Rare Hunter** - Deploy multiple rare contracts
- **Epic Collector** - Master of epic contracts
- **Legendary Master** - Achieved legendary status
- **Mythic Achiever** - Ultra-rare accomplishment

### Real Statistics
- Total spins across all sessions
- Current win streak counter
- Recent deployments with explorer links
- Live combo multiplier display

## 🔧 Recent Bug Fixes

### v2.0.2 - Contract Optimization
- ✅ **Dutch Auction Removed**: Eliminated problematic contract causing deployment failures
- ✅ **SimpleCrowdsale**: Fixed naming conflict between `SaleFinalized` event and error
- ✅ **VestingWallet**: Resolved `VestingRevoked` naming collision
- ✅ **MerkleAirdrop**: Hardcoded demo Merkle root for easier deployment
- ✅ **UI Positioning**: Moved win banner higher to avoid covering contract names
- ✅ **Auto-hide Banner**: Win notifications now disappear automatically after 3 seconds

### Deployment Improvements
- Enhanced error handling for compilation failures
- Better form validation for constructor parameters
- Improved responsive design for mobile devices
- Optimized particle effects performance

## 🎨 UI/UX Enhancements

### Visual Improvements
- **Auto-hide Win Banner**: Rarity notifications disappear automatically after 3 seconds
- **Improved Win Banner**: Positioned at 30% height instead of 50%
- **Enhanced Rarity Effects**: More dramatic animations for rare contracts
- **Better Mobile Experience**: Responsive slot machine layout
- **Dynamic Theming**: Rarity-based color schemes throughout

### User Experience
- **Streamlined Forms**: Icon-guided configuration fields
- **Real-time Feedback**: Live deployment progress with phases
- **Explorer Integration**: Direct links to view contracts on-chain
- **Accessibility**: Better keyboard navigation and screen reader support

## 🌐 Network Configuration

### 0G-Galileo-Testnet Details
- **Chain ID**: 16601
- **RPC URL**: https://rpc-testnet.0g.ai
- **Explorer**: https://chainscan-galileo.0g.ai
- **Currency**: ETH (testnet)

### Adding to MetaMask
1. Open MetaMask settings
2. Add custom network with above details
3. Get testnet ETH from faucets
4. Start deploying contracts!

## 🏗️ Component Architecture

Each component follows strict design principles:

- **Under 400 lines**: Focused single responsibility
- **TypeScript strict mode**: Full type safety
- **Responsive design**: Mobile-first approach
- **Accessibility**: WCAG compliance
- **Performance**: Optimized renders and animations

### Component Breakdown
- **Header** (98 lines): Stats, wallet, and controls
- **SlotMachine** (156 lines): Core spinning mechanics
- **Configuration** (201 lines): Dynamic contract forms
- **Deploying** (134 lines): Real deployment progress
- **Deployed** (187 lines): Success with explorer links

## 🔮 Future Roadmap

### Phase 3 - Advanced Features
- [ ] **Mainnet Support**: Deploy to 0G mainnet
- [ ] **Contract Templates**: User-uploadable contract types
- [ ] **Advanced Statistics**: Detailed analytics dashboard
- [ ] **Social Features**: Share deployments and compete
- [ ] **Contract Interaction**: Post-deployment function calls

### Phase 4 - Platform Evolution
- [ ] **Multi-chain Support**: Ethereum, Polygon, BSC
- [ ] **NFT Integration**: Collectible contract cards
- [ ] **DAO Integration**: Community-driven contract curation
- [ ] **Premium Features**: Advanced deployment options

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the <400 lines per component rule
4. Add tests for new contracts
5. Submit pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **0G Network** - For the innovative blockchain infrastructure
- **React Team** - For the incredible UI library
- **RainbowKit** - For beautiful wallet integration
- **Lucide** - For the stunning icon set
- **Community** - For feedback and contributions

---

**Built with ❤️ for the 0G Network community**

*Ready to spin and deploy? Start your blockchain journey today!* 🚀