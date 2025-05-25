# 0G Roast Arena Frontend

Interactive roast battle platform where users submit humorous roasts about the 0G Labs team, judged by AI personalities based on team members.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to frontend:**
   ```bash
   cd roast-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header/         # Header with wallet & stats
│   ├── JudgeBanner/    # Current AI judge display
│   ├── WritingPhase/   # Roast input phase
│   ├── JudgingPhase/   # AI judging animation
│   ├── ResultsPhase/   # Winner announcement
│   ├── JudgeModal/     # Judge details popup
│   └── ParticleEffect/ # Winner celebration
├── hooks/              # Custom React hooks
│   └── useGameState.js # Game state management
├── data/               # Static data
│   └── teamMembers.js  # 0G team member data
├── constants/          # App constants
│   └── gameConstants.js # Game phases & AI responses
├── App.jsx            # Main app component
└── main.jsx           # React entry point
```

## 🎮 Game Flow

1. **Writing Phase (120s)** - Users submit roasts
2. **Judging Phase (3s)** - AI analyzes submissions
3. **Results Phase (15s)** - Winner announcement
4. **Auto-restart** - New judge, new round

## 🤖 AI Judges

Each round features a random AI judge based on 0G team members:

- **Michael** (CEO) - Strategic & visionary
- **Ada** (CMO) - Optimistic & community-focused  
- **JC** (Growth) - Revolutionary & meme-savvy
- **Elisha** (Community) - Educational & accessible
- **Ren** (CTO) - Technical & logical
- **Yon** (Community) - Hype & energy-driven

## 🎨 Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **Lucide React** - Icons
- **CSS-in-JS** - Styled components
- **JavaScript** - No TypeScript

## 🎯 Features

- ✅ **Real-time game phases** with countdown timers
- ✅ **Wallet simulation** (connect/disconnect)
- ✅ **AI personality-based judging** 
- ✅ **Particle effects** for celebrations
- ✅ **Responsive design** for mobile/desktop
- ✅ **Smooth animations** and transitions
- ✅ **Character limit** (280 chars like Twitter)
- ✅ **Live participant tracking**

## 🔮 Future Integrations

This modular structure is ready for:
- Blockchain wallet integration
- Real smart contract interactions  
- WebSocket real-time updates
- Backend API connections
- Token rewards system

## 📝 Component Architecture

Each component is self-contained with:
- Props-based data flow
- Embedded CSS-in-JS styling
- Responsive design
- Consistent naming conventions

The `useGameState` hook centralizes all game logic, making it easy to later connect to real backend services.

## 🎨 Design System

- **Dark theme** with cyber-punk aesthetics
- **Neon colors**: #00D2E9, #FF5CAA, #FFD700
- **Inter font** for modern typography
- **Gradient effects** and glowing elements
- **Smooth micro-interactions** 