import React, { useState, useEffect, useRef } from 'react';
import { Timer, Users, Coins, Crown, Zap, Shield, Code, Heart, Brain, Sparkles, Trophy, Send, DollarSign, Copy, ExternalLink, Volume2, VolumeX, Flame } from 'lucide-react';
import charactersData from './characters.json';

// Icon mapping for imported data
const iconMap = {
  Crown,
  Code, 
  Brain,
  Heart,
  Shield,
  Sparkles
};

// Process team members data from JSON
const TEAM_MEMBERS = charactersData.map(member => ({
  ...member,
  icon: iconMap[member.icon]
}));

const GAME_PHASES = {
  WAITING: 'waiting',
  ACTIVE: 'active', 
  DECIDING: 'deciding',
  RESULTS: 'results'
};

const ZGRoastLottery = () => {
  // Core game state
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.WAITING);
  const [selectedMember, setSelectedMember] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userSubmission, setUserSubmission] = useState('');
  const [winner, setWinner] = useState(null);
  const [aiReasoning, setAiReasoning] = useState('');
  const [prizePool, setPrizePool] = useState(0);
  
  // UI state
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMemberDetails, setShowMemberDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  // Stats
  const [totalRounds, setTotalRounds] = useState(47);
  const [totalPrizesPaid, setTotalPrizesPaid] = useState(156.75);
  const [averagePool, setAveragePool] = useState(3.34);

  // Play sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      join: [440, 554, 659],
      timer: [800, 800, 800],
      winner: [523, 659, 784, 988],
      character: [659, 784, 988]
    };
    
    const freq = frequencies[type] || frequencies.join;
    freq.forEach((f, i) => {
      setTimeout(() => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = f;
        osc.type = type === 'winner' ? 'triangle' : 'sine';
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
      }, i * 100);
    });
  };

  // Connect wallet simulation
  const connectWallet = () => {
    const address = '0x' + Math.random().toString(16).substr(2, 40);
    setUserAddress(address);
    setIsConnected(true);
    setCurrentUser({
      address,
      balance: (Math.random() * 10 + 5).toFixed(3)
    });
  };

  // Start new round
  const startNewRound = () => {
    const randomMember = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
    setSelectedMember(randomMember);
    setCurrentPhase(GAME_PHASES.WAITING);
    setPlayers([]);
    setUserSubmission('');
    setWinner(null);
    setAiReasoning('');
    setPrizePool(0);
    setShowWinnerModal(false);
    playSound('character');
  };

  // Join round
  const joinRound = async () => {
    if (!isConnected || !userSubmission.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    playSound('join');
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newPlayer = {
      address: userAddress,
      submission: userSubmission,
      timestamp: Date.now(),
      avatar: `https://avatar.vercel.sh/${userAddress}`
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    setPrizePool(prev => prev + 0.025);
    setUserSubmission('');
    setIsSubmitting(false);
    
    // Start timer if this is the second player
    if (players.length === 1) {
      setCurrentPhase(GAME_PHASES.ACTIVE);
      setTimeLeft(120);
    }
  };

  // Timer effect
  useEffect(() => {
    if (currentPhase === GAME_PHASES.ACTIVE && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCurrentPhase(GAME_PHASES.DECIDING);
            decideWinner();
            return 0;
          }
          if (prev <= 10) playSound('timer');
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, timeLeft]);

  // AI decision simulation
  const decideWinner = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const randomWinner = players[Math.floor(Math.random() * players.length)];
    const reasoning = generateAIReasoning(selectedMember, randomWinner);
    
    setWinner(randomWinner);
    setAiReasoning(reasoning);
    setCurrentPhase(GAME_PHASES.RESULTS);
    setShowWinnerModal(true);
    playSound('winner');
    
    // Update stats
    setTotalRounds(prev => prev + 1);
    setTotalPrizesPaid(prev => prev + prizePool * 0.95);
    setAveragePool(prev => ((prev * (totalRounds - 1)) + prizePool) / totalRounds);
  };

  // Generate AI reasoning based on character
  const generateAIReasoning = (character, winner) => {
    const reasonings = {
      michael: [
        `This roast shows visionary thinking! The strategic humor here demonstrates true understanding of leadership challenges.`,
        `I see big-picture comedy potential here. This roaster thinks like an innovator - bold, transformative, and memorable.`,
        `The business acumen in this roast is impressive. They've identified key pain points with surgical precision.`
      ],
      ada: [
        `The logical structure of this roast is flawless. Clean setup, elegant execution, perfect syntax.`,
        `This roast demonstrates algorithmic thinking - efficient, bug-free, and beautifully optimized for maximum impact.`,
        `The systematic approach to humor here is exemplary. Well-architected roast with solid error handling.`
      ],
      jc: [
        `This roast brings the community together through shared laughter! Pure positive energy and team spirit.`,
        `The inclusive humor here is what our community needs. Everyone can relate and enjoy this together.`,
        `I can feel the genuine affection behind this roast. It builds bridges while delivering laughs.`
      ],
      elisha: [
        `This roast has been thoroughly security-tested for maximum impact with minimal collateral damage.`,
        `The risk-benefit analysis on this humor is excellent. Safe, reliable, and penetration-tested comedy.`,
        `Bulletproof roast architecture with proper authentication and authorization of comedic elements.`
      ],
      ren: [
        `This experimental approach to roasting is revolutionary! They've disrupted traditional humor patterns.`,
        `The creative chaos in this roast is beautiful. It breaks all the rules in exactly the right way.`,
        `Innovation at its finest - this roast prototype could change the entire comedy paradigm.`
      ]
    };
    
    const characterReasons = reasonings[character.id] || reasonings.michael;
    return characterReasons[Math.floor(Math.random() * characterReasons.length)];
  };

  // Auto-start on mount
  useEffect(() => {
    startNewRound();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <div className="background-animation">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`floating-particle particle-${i % 5}`} />
        ))}
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div className="logo-section">
            <img src="/zer0smoke.gif" alt="0G" onError={(e) => e.target.src = '/pfpzer0.png'} />
            <div className="title-group">
              <h1>0G Team Roast Lottery</h1>
              <p>Where AI meets comedy destiny</p>
            </div>
          </div>
          
          <div className="header-controls">
            <button 
              className="sound-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            {!isConnected ? (
              <button className="connect-button" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-address">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
                <div className="wallet-balance">
                  {currentUser?.balance} 0G
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Rounds</span>
            <span className="stat-value">{totalRounds}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Prizes</span>
            <span className="stat-value">{totalPrizesPaid.toFixed(2)} 0G</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Pool</span>
            <span className="stat-value">{averagePool.toFixed(2)} 0G</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current Pool</span>
            <span className="stat-value prize-pool">{prizePool.toFixed(3)} 0G</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="game-container">
        {/* Character Selection Display */}
        <div className="character-showcase">
          <h2>Today's Judge</h2>
          {selectedMember && (
            <div className={`character-card active character-${selectedMember.id}`}>
              <div className="character-avatar">
                <selectedMember.icon size={80} style={{ color: selectedMember.color }} />
                <div className="character-aura"></div>
              </div>
              <div className="character-info">
                <h3>{selectedMember.name}</h3>
                <p className="character-role">{selectedMember.role}</p>
                <p className="character-description">{selectedMember.description}</p>
                <div className="character-catchphrase">
                  "{selectedMember.catchphrase}"
                </div>
              </div>
              <div className="character-actions">
                <button 
                  className="character-details-btn"
                  onClick={() => setShowMemberDetails(selectedMember)}
                >
                  View Roast Style
                </button>
                <a 
                  href={selectedMember.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="twitter-link"
                >
                  <ExternalLink size={16} />
                  Follow on X
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Game Status */}
        <div className="game-status">
          {currentPhase === GAME_PHASES.WAITING && (
            <div className="status-waiting">
              <Flame className="status-icon" />
              <h3>Waiting for Roasters</h3>
              <p>Minimum 2 roasters needed to start the round</p>
              <div className="players-needed">
                {players.length}/2 roasters joined
              </div>
            </div>
          )}

          {currentPhase === GAME_PHASES.ACTIVE && (
            <div className="status-active">
              <Timer className="status-icon timer-pulse" />
              <h3>Roast Round Active</h3>
              <div className="timer-display">
                {formatTime(timeLeft)}
              </div>
              <p>Submit your best roast before time runs out!</p>
            </div>
          )}

          {currentPhase === GAME_PHASES.DECIDING && (
            <div className="status-deciding">
              <Brain className="status-icon thinking-animation" />
              <h3>{selectedMember?.name} is Judging...</h3>
              <p>AI is analyzing all roasts based on {selectedMember?.name}'s personality</p>
              <div className="thinking-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        {/* Entry Form */}
        {isConnected && currentPhase !== GAME_PHASES.RESULTS && !players.find(p => p.address === userAddress) && (
          <div className="entry-form">
            <h3>Roast the 0G Team for {selectedMember?.name}!</h3>
            <p className="entry-prompt">
              Remember: {selectedMember?.name} {selectedMember?.decisionStyle}
            </p>
            
            <div className="submission-area">
              <textarea
                value={userSubmission}
                onChange={(e) => setUserSubmission(e.target.value)}
                placeholder={`Craft your best roast for ${selectedMember?.name} to judge...`}
                maxLength={280}
                disabled={currentPhase === GAME_PHASES.DECIDING}
              />
              <div className="char-count">
                {userSubmission.length}/280
              </div>
            </div>

            <div className="entry-fee">
              <Coins size={20} />
              <span>Entry Fee: 0.025 0G</span>
            </div>

            <button 
              className="join-button"
              onClick={joinRound}
              disabled={!userSubmission.trim() || isSubmitting || currentPhase === GAME_PHASES.DECIDING}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Joining Round...
                </>
              ) : (
                <>
                  <Flame size={20} />
                  Submit Roast
                </>
              )}
            </button>
          </div>
        )}

        {/* Players List */}
        {players.length > 0 && (
          <div className="players-section">
            <h3>
              <Users size={20} />
              Roasters in this Round ({players.length})
            </h3>
            <div className="players-grid">
              {players.map((player, index) => (
                <div key={player.address} className="player-card">
                  <img src={player.avatar} alt="Player" className="player-avatar" />
                  <div className="player-info">
                    <div className="player-address">
                      {player.address.slice(0, 6)}...{player.address.slice(-4)}
                    </div>
                    <div className="player-submission">
                      "{player.submission.slice(0, 60)}..."
                    </div>
                  </div>
                  {player.address === userAddress && (
                    <div className="you-badge">YOU</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Winner Modal */}
      {showWinnerModal && winner && (
        <div className="modal-overlay" onClick={() => setShowWinnerModal(false)}>
          <div className="winner-modal" onClick={e => e.stopPropagation()}>
            <div className="winner-celebration">
              <Trophy size={60} className="trophy-icon" />
              <div className="confetti">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`confetti-piece piece-${i}`} />
                ))}
              </div>
            </div>
            
            <h2>🔥 Best Roast Winner! 🔥</h2>
            
            <div className="winner-info">
              <img src={winner.avatar} alt="Winner" className="winner-avatar" />
              <div className="winner-details">
                <div className="winner-address">
                  {winner.address.slice(0, 8)}...{winner.address.slice(-6)}
                </div>
                <div className="prize-amount">
                  Wins {(prizePool * 0.95).toFixed(3)} 0G
                </div>
              </div>
            </div>

            <div className="ai-reasoning">
              <div className="reasoning-header">
                <selectedMember.icon size={24} style={{ color: selectedMember.color }} />
                <span>{selectedMember.name}'s Verdict:</span>
              </div>
              <p>"{aiReasoning}"</p>
            </div>

            <div className="winner-submission">
              <h4>Winning Roast:</h4>
              <p>"{winner.submission}"</p>
            </div>

            <div className="modal-actions">
              <button className="view-tx-button">
                <ExternalLink size={16} />
                View Transaction
              </button>
              <button className="close-modal-button" onClick={() => setShowWinnerModal(false)}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Details Modal */}
      {showMemberDetails && (
        <div className="modal-overlay" onClick={() => setShowMemberDetails(null)}>
          <div className="character-modal" onClick={e => e.stopPropagation()}>
            <div className="character-header">
              <showMemberDetails.icon size={60} style={{ color: showMemberDetails.color }} />
              <div>
                <h2>{showMemberDetails.name}</h2>
                <p>{showMemberDetails.role}</p>
              </div>
            </div>
            
            <div className="character-details">
              <div className="detail-section">
                <h4>Personality & Background</h4>
                <p>{showMemberDetails.personality}</p>
              </div>
              <div className="detail-section">
                <h4>Roast Judging Style</h4>
                <p>{showMemberDetails.decisionStyle}</p>
              </div>
              <div className="detail-section">
                <h4>Roasting Tips</h4>
                <p>{showMemberDetails.roastingNotes}</p>
              </div>
              <div className="detail-section">
                <h4>Archetype</h4>
                <p><strong>{showMemberDetails.archetype}</strong> - {showMemberDetails.description}</p>
              </div>
              <div className="character-social">
                <a 
                  href={showMemberDetails.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="twitter-profile-link"
                >
                  <ExternalLink size={20} />
                  Follow {showMemberDetails.name} on X
                </a>
              </div>
            </div>

            <button 
              className="close-character-modal"
              onClick={() => setShowMemberDetails(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Next Round Button */}
      {currentPhase === GAME_PHASES.RESULTS && (
        <div className="next-round-section">
          <button className="next-round-button" onClick={startNewRound}>
            <Zap size={20} />
            Start Next Round
          </button>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0A0A 0%, #1A0A1A 50%, #0A1A0A 100%);
          color: #E6E6E6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 20px;
        }

        .background-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00D2E9;
          border-radius: 50%;
          animation: floatParticle 20s infinite linear;
        }

        .particle-0 { background: #FFD700; animation-delay: 0s; }
        .particle-1 { background: #FF5CAA; animation-delay: 4s; }
        .particle-2 { background: #00D2E9; animation-delay: 8s; }
        .particle-3 { background: #9B59B6; animation-delay: 12s; }
        .particle-4 { background: #E74C3C; animation-delay: 16s; }

        .header {
          position: relative;
          z-index: 10;
          margin-bottom: 40px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-section img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #00D2E9;
          animation: logoPulse 3s infinite;
        }

        .title-group h1 {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: rainbowText 3s linear infinite;
          margin-bottom: 5px;
        }

        .title-group p {
          color: #9999A5;
          font-size: 16px;
          font-style: italic;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .sound-toggle {
          background: rgba(18, 18, 24, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 12px;
          color: #9999A5;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sound-toggle:hover {
          color: #00D2E9;
          border-color: #00D2E9;
          background: rgba(0, 210, 233, 0.1);
        }

        .connect-button {
          background: linear-gradient(135deg, #00D2E9, #FF5CAA);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 15px 25px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .connect-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 210, 233, 0.4);
        }

        .wallet-info {
          background: rgba(18, 18, 24, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 15px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .wallet-address {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #00D2E9;
        }

        .wallet-balance {
          font-size: 12px;
          color: #9999A5;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 15px 20px;
          background: rgba(18, 18, 24, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(60, 75, 95, 0.3);
          backdrop-filter: blur(10px);
        }

        .stat-label {
          font-size: 12px;
          color: #9999A5;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .prize-pool {
          color: #FFD700;
          animation: prizeGlow 2s infinite alternate;
        }

        .game-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .character-showcase {
          text-align: center;
          margin-bottom: 40px;
        }

        .character-showcase h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 30px;
          color: #E6E6E6;
        }

        .character-card {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 24px;
          padding: 40px;
          border: 3px solid transparent;
          transition: all 0.5s ease;
          position: relative;
          overflow: hidden;
          max-width: 600px;
          margin: 0 auto;
        }

        .character-card.active {
          border-color: #00D2E9;
          box-shadow: 0 0 40px rgba(0, 210, 233, 0.3);
          animation: characterPulse 3s infinite;
        }

        .character-michael.active { border-color: #FFD700; box-shadow: 0 0 40px rgba(255, 215, 0, 0.3); }
        .character-ada.active { border-color: #00D2E9; box-shadow: 0 0 40px rgba(0, 210, 233, 0.3); }
        .character-jc.active { border-color: #FF5CAA; box-shadow: 0 0 40px rgba(255, 92, 170, 0.3); }
        .character-elisha.active { border-color: #9B59B6; box-shadow: 0 0 40px rgba(155, 89, 182, 0.3); }
        .character-ren.active { border-color: #E74C3C; box-shadow: 0 0 40px rgba(231, 76, 60, 0.3); }

        .character-avatar {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
        }

        .character-aura {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 210, 233, 0.2) 0%, transparent 70%);
          animation: auraRotate 4s linear infinite;
        }

        .character-info {
          text-align: center;
          margin-bottom: 25px;
        }

        .character-info h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #E6E6E6;
        }

        .character-role {
          font-size: 16px;
          color: #00D2E9;
          font-weight: 600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .character-description {
          font-size: 14px;
          color: #9999A5;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .character-catchphrase {
          font-size: 16px;
          color: #FFD700;
          font-style: italic;
          font-weight: 600;
        }

        .character-details-btn {
          background: rgba(0, 210, 233, 0.1);
          border: 1px solid #00D2E9;
          color: #00D2E9;
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .character-details-btn:hover {
          background: rgba(0, 210, 233, 0.2);
          transform: translateY(-2px);
        }

        .game-status {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .status-icon {
          margin-bottom: 15px;
          color: #00D2E9;
        }

        .timer-pulse {
          animation: timerPulse 1s infinite;
        }

        .thinking-animation {
          animation: thinkingRotate 2s linear infinite;
        }

        .game-status h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #E6E6E6;
        }

        .timer-display {
          font-size: 48px;
          font-weight: 800;
          color: #FFD700;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .players-needed {
          font-size: 18px;
          color: #FF5CAA;
          font-weight: 600;
          margin-top: 10px;
        }

        .thinking-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
        }

        .thinking-dots span {
          width: 8px;
          height: 8px;
          background: #00D2E9;
          border-radius: 50%;
          animation: thinkingDots 1.4s infinite;
        }

        .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

        .entry-form {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .entry-form h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #E6E6E6;
        }

        .entry-prompt {
          color: #9999A5;
          margin-bottom: 20px;
          font-style: italic;
        }

        .submission-area {
          position: relative;
          margin-bottom: 20px;
        }

        .submission-area textarea {
          width: 100%;
          min-height: 120px;
          background: rgba(10, 10, 10, 0.8);
          border: 2px solid rgba(60, 75, 95, 0.3);
          border-radius: 16px;
          padding: 20px;
          font-size: 16px;
          color: #E6E6E6;
          resize: vertical;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
          line-height: 1.5;
        }

        .submission-area textarea:focus {
          border-color: #00D2E9;
          box-shadow: 0 0 0 3px rgba(0, 210, 233, 0.2);
        }

        .char-count {
          position: absolute;
          bottom: 10px;
          right: 15px;
          font-size: 12px;
          color: #9999A5;
          background: rgba(18, 18, 24, 0.9);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .entry-fee {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #FFD700;
          font-weight: 600;
          margin-bottom: 20px;
          justify-content: center;
        }

        .join-button {
          width: 100%;
          background: linear-gradient(135deg, #FF5CAA, #E74C3C);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 18px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .join-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 92, 170, 0.4);
        }

        .join-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        .players-section {
          background: rgba(18, 18, 24, 0.9);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .players-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #E6E6E6;
        }

        .players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .player-card {
          background: rgba(10, 10, 10, 0.8);
          border: 1px solid rgba(60, 75, 95, 0.3);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          transition: all 0.3s ease;
        }

        .player-card:hover {
          border-color: #00D2E9;
          background: rgba(0, 210, 233, 0.05);
        }

        .player-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #00D2E9;
        }

        .player-info {
          flex: 1;
        }

        .player-address {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #00D2E9;
          font-weight: 600;
        }

        .player-submission {
          font-size: 12px;
          color: #9999A5;
          margin-top: 4px;
          line-height: 1.4;
        }

        .you-badge {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .winner-modal {
          background: rgba(18, 18, 24, 0.95);
          border-radius: 24px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          border: 2px solid #FFD700;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .winner-celebration {
          position: relative;
          margin-bottom: 30px;
        }

        .trophy-icon {
          color: #FFD700;
          animation: trophyBounce 2s infinite;
        }

        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #FFD700;
          animation: confettiDrop 3s ease-out forwards;
        }

        .confetti-piece:nth-child(odd) { background: #FF5CAA; }
        .confetti-piece:nth-child(3n) { background: #00D2E9; }

        .winner-modal h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 30px;
          background: linear-gradient(90deg, #FFD700, #FF5CAA, #00D2E9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .winner-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .winner-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #FFD700;
        }

        .winner-address {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          color: #FFD700;
          font-weight: 700;
        }

        .prize-amount {
          font-size: 24px;
          font-weight: 800;
          color: #00D2E9;
          margin-top: 5px;
        }

        .ai-reasoning {
          background: rgba(10, 10, 10, 0.8);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .reasoning-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .ai-reasoning p {
          color: #9999A5;
          font-style: italic;
          line-height: 1.6;
        }

        .winner-submission {
          background: rgba(0, 210, 233, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(0, 210, 233, 0.3);
        }

        .winner-submission h4 {
          color: #00D2E9;
          margin-bottom: 10px;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
        }

        .view-tx-button {
          flex: 1;
          background: rgba(0, 210, 233, 0.1);
          border: 2px solid #00D2E9;
          color: #00D2E9;
          border-radius: 12px;
          padding: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .view-tx-button:hover {
          background: rgba(0, 210, 233, 0.2);
        }

        .close-modal-button {
          flex: 1;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          border: none;
          border-radius: 12px;
          padding: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
        }

        .character-modal {
          background: rgba(18, 18, 24, 0.95);
          border-radius: 24px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          border: 2px solid #00D2E9;
        }

        .character-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .character-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #E6E6E6;
        }

        .character-details {
          margin-bottom: 30px;
        }

        .detail-section {
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(10, 10, 10, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(60, 75, 95, 0.3);
        }

        .detail-section h4 {
          color: #00D2E9;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .detail-section p {
          color: #9999A5;
          line-height: 1.5;
        }

        .close-character-modal {
          width: 100%;
          background: rgba(0, 210, 233, 0.1);
          border: 2px solid #00D2E9;
          color: #00D2E9;
          border-radius: 12px;
          padding: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-character-modal:hover {
          background: rgba(0, 210, 233, 0.2);
        }

        .character-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .twitter-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(29, 161, 242, 0.1);
          border: 2px solid #1DA1F2;
          color: #1DA1F2;
          text-decoration: none;
          border-radius: 12px;
          padding: 12px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .twitter-link:hover {
          background: rgba(29, 161, 242, 0.2);
          transform: translateY(-2px);
        }

        .character-social {
          margin-top: 25px;
          text-align: center;
        }

        .twitter-profile-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #1DA1F2, #0d8bd9);
          color: white;
          text-decoration: none;
          border-radius: 15px;
          padding: 15px 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(29, 161, 242, 0.3);
        }

        .twitter-profile-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(29, 161, 242, 0.5);
        }

        .next-round-section {
          text-align: center;
          margin-top: 40px;
        }

        .next-round-button {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          border: none;
          border-radius: 20px;
          padding: 20px 40px;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .next-round-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 215, 0, 0.5);
        }

        /* Animations */
        @keyframes floatParticle {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20px) translateX(100px) rotate(360deg); opacity: 0; }
        }

        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 210, 233, 0.6); }
          50% { box-shadow: 0 0 40px rgba(0, 210, 233, 0.9); }
        }

        @keyframes rainbowText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes prizeGlow {
          0% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
          100% { text-shadow: 0 0 25px rgba(255, 215, 0, 1); }
        }

        @keyframes characterPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(0, 210, 233, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 0 60px rgba(0, 210, 233, 0.5); }
        }

        @keyframes auraRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes timerPulse {
          0%, 100% { transform: scale(1); color: #00D2E9; }
          50% { transform: scale(1.1); color: #FF5CAA; }
        }

        @keyframes thinkingRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes thinkingDots {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes trophyBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        @keyframes confettiDrop {
          0% { 
            transform: translateY(-100px) translateX(0) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(500px) translateX(200px) rotate(720deg); 
            opacity: 0; 
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }

          .header-top {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .title-group h1 {
            font-size: 36px;
          }

          .stats-bar {
            gap: 15px;
          }

          .character-card {
            padding: 25px;
          }

          .players-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column;
          }

          .character-header {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .title-group h1 {
            font-size: 28px;
          }

          .timer-display {
            font-size: 36px;
          }

          .winner-modal,
          .character-modal {
            padding: 25px;
            margin: 10px;
          }

          .winner-info {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ZGRoastLottery;