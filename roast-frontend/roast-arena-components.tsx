import React, { useState, useEffect } from 'react';
import { Clock, Users, Trophy, Zap, Brain, Target } from 'lucide-react';

const RoastArena = () => {
  const [currentRound, setCurrentRound] = useState({
    id: 42,
    targetMember: 'JC',
    timeLeft: 122,
    participants: 7,
    prizePool: 0.175,
    status: 'active'
  });
  
  const [roastText, setRoastText] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const teamMembers = {
    'JC': { 
      name: 'JC', 
      role: 'Co-founder & Tech Visionary',
      avatar: '👨‍💻',
      bio: 'Revolutionary DA solutions, probably debugging at 3AM',
      weakness: 'Coffee-driven development cycles'
    },
    'Ada': { 
      name: 'Ada', 
      role: 'Product & Ecosystem Lead',
      avatar: '👩‍💼', 
      bio: 'Building bridges between tech and users',
      weakness: 'Too many Notion pages'
    },
    'Michael': { 
      name: 'Michael', 
      role: 'Engineering Lead',
      avatar: '⚡',
      bio: 'Code optimization obsessed',
      weakness: 'Refuses to ship until perfect'
    },
    'Elisha': { 
      name: 'Elisha', 
      role: 'Community & Partnerships',
      avatar: '🌟',
      bio: 'Bringing blockchain to the masses',
      weakness: 'Discord notifications at 2AM'
    },
    'Ren': { 
      name: 'Ren', 
      role: 'Research & Protocol Design',
      avatar: '🧬',
      bio: 'Formal verification enthusiast', 
      weakness: 'Explains everything in mathematical proofs'
    }
  };

  const currentTarget = teamMembers[currentRound.targetMember];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRound(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show results when timer ends
  useEffect(() => {
    if (currentRound.timeLeft === 0) {
      setTimeout(() => setShowResults(true), 1000);
    }
  }, [currentRound.timeLeft]);

  const handleJoinRound = async () => {
    setIsJoined(true);
    // Simulate wallet connection and payment
    // In real app: connect wallet, send 0.025 0G transaction
  };

  const submitRoast = async () => {
    if (!roastText.trim()) return;
    // Submit roast to backend
    alert('Roast submitted! 🔥');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0A0A, #1A0A1A)',
      color: '#E6E6E6',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      {/* Particle Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 20%, rgba(0, 210, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 92, 170, 0.1) 0%, transparent 50%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00D2E9, #FF5CAA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            boxShadow: '0 0 40px rgba(0, 210, 233, 0.6)',
            animation: 'pulse 3s infinite'
          }}>
            🤖
          </div>
          <h1 style={{
            fontSize: '52px',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #FF0080)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '10px'
          }}>
            0G Roast Arena
          </h1>
          <p style={{ fontSize: '18px', color: '#9999A5' }}>
            AI-Powered Team Roast Battle • Burn with Style, Win with Wit
          </p>
        </div>

        {/* Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <StatusCard icon={<Target />} label="Round" value={`#${currentRound.id}`} />
          <StatusCard icon={<Users />} label="Players" value={currentRound.participants} />
          <StatusCard icon={<Trophy />} label="Prize Pool" value={`${currentRound.prizePool} 0G`} />
          <StatusCard 
            icon={<Clock />} 
            label="Time Left" 
            value={formatTime(currentRound.timeLeft)}
            highlight={true}
          />
        </div>

        {/* Main Arena */}
        <div style={{
          background: 'rgba(18, 18, 24, 0.9)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(60, 75, 95, 0.3)',
          marginBottom: '30px',
          position: 'relative'
        }}>
          {/* Laser Border Effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '24px',
            padding: '2px',
            background: 'linear-gradient(90deg, #00D2E9, #FF5CAA, #FFD700, #FF0080)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            zIndex: -1
          }} />

          {/* Target Member */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#FFD700',
              marginBottom: '15px'
            }}>
              🎯 Target Acquired
            </h2>
            
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 15px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF5CAA, #FFD700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              boxShadow: '0 0 30px rgba(255, 92, 170, 0.6)'
            }}>
              {currentTarget.avatar}
            </div>
            
            <h3 style={{ color: '#FF5CAA', marginBottom: '10px' }}>
              {currentTarget.name} - {currentTarget.role}
            </h3>
            <p style={{ color: '#9999A5', fontStyle: 'italic', marginBottom: '10px' }}>
              {currentTarget.bio}
            </p>
            <p style={{ color: '#FFD700', fontSize: '14px' }}>
              Weakness: {currentTarget.weakness}
            </p>
          </div>

          {/* Join Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={{ fontSize: '18px', color: '#9999A5', marginBottom: '20px' }}>
              Entry Fee: <span style={{ color: '#00D2E9', fontWeight: '700', fontSize: '24px' }}>0.025 0G</span>
            </p>
            
            {!isJoined ? (
              <button
                onClick={handleJoinRound}
                style={{
                  background: 'linear-gradient(135deg, #00D2E9, #FF5CAA)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '20px 40px',
                  fontSize: '20px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(0, 210, 233, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Zap size={24} />
                Join the Roast Battle
              </button>
            ) : (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
                  color: 'white',
                  borderRadius: '20px',
                  padding: '15px 30px',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  display: 'inline-block'
                }}>
                  ✅ Joined! Write your roast
                </div>
                
                <textarea
                  value={roastText}
                  onChange={(e) => setRoastText(e.target.value)}
                  placeholder={`Write your most creative roast about ${currentTarget.name} here...

Remember: The AI judge appreciates technical humor, creativity, and wit!

Example: "${currentTarget.name}'s code is so modular, even their coffee machine needs a consensus layer..."`}
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    background: 'rgba(15, 20, 32, 0.8)',
                    border: '2px solid rgba(60, 75, 95, 0.3)',
                    borderRadius: '16px',
                    padding: '20px',
                    fontSize: '16px',
                    color: '#E6E6E6',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '120px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00D2E9';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 210, 233, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(60, 75, 95, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={submitRoast}
                    disabled={!roastText.trim()}
                    style={{
                      background: roastText.trim() ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(60, 75, 95, 0.5)',
                      color: roastText.trim() ? '#000' : '#9999A5',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: roastText.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🔥 Submit Roast
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants List */}
        <ParticipantsList />
      </div>

      {/* AI Judge */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8E44AD, #E74C3C)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        boxShadow: '0 10px 30px rgba(142, 68, 173, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}>
        <Brain />
      </div>

      {/* Results Modal */}
      {showResults && <ResultsModal onClose={() => setShowResults(false)} />}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 210, 233, 0.6); }
          50% { box-shadow: 0 0 60px rgba(0, 210, 233, 0.9); }
        }
      `}</style>
    </div>
  );
};

const StatusCard = ({ icon, label, value, highlight = false }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '15px 20px',
    background: 'rgba(18, 18, 24, 0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(60, 75, 95, 0.25)',
    backdropFilter: 'blur(10px)',
    minWidth: '120px'
  }}>
    <div style={{ color: highlight ? '#FFD700' : '#9999A5' }}>
      {icon}
    </div>
    <span style={{
      fontSize: '12px',
      color: '#9999A5',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {label}
    </span>
    <span style={{
      fontSize: '20px',
      fontWeight: '700',
      color: highlight ? '#FFD700' : '#00D2E9'
    }}>
      {value}
    </span>
  </div>
);

const ParticipantsList = () => (
  <div style={{
    background: 'rgba(10, 15, 25, 0.8)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(60, 75, 95, 0.25)'
  }}>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '600',
      color: '#E6E6E6',
      marginBottom: '15px',
      textAlign: 'center'
    }}>
      🥊 Current Participants
    </h3>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[
        { address: '0x742d35Cc...C8C7', status: 'submitted' },
        { address: '0x8ba1f109...d56a', status: 'submitted' },
        { address: '0x1a2b3c4d...9f8e', status: 'writing' },
        { address: '0x9f8e7d6c...4a3b', status: 'writing' }
      ].map((participant, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'rgba(18, 18, 24, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(60, 75, 95, 0.3)'
        }}>
          <span style={{
            fontFamily: 'Courier New, monospace',
            color: '#00D2E9',
            fontSize: '14px'
          }}>
            {participant.address}
          </span>
          <span style={{
            fontSize: '12px',
            color: participant.status === 'submitted' ? '#27AE60' : '#9999A5',
            textTransform: 'uppercase'
          }}>
            {participant.status === 'submitted' ? '✅ Roast Submitted' : '⏳ Writing...'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ResultsModal = ({ onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(10px)'
  }}>
    <div style={{
      background: 'rgba(18, 18, 24, 0.95)',
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '600px',
      width: '90%',
      textAlign: 'center',
      border: '2px solid #FFD700',
      boxShadow: '0 0 50px rgba(255, 215, 0, 0.3)'
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '800',
        color: '#FFD700',
        marginBottom: '20px',
        textTransform: 'uppercase'
      }}>
        🏆 Roast Champion
      </h2>
      
      <p style={{
        fontFamily: 'Courier New, monospace',
        color: '#00D2E9',
        fontSize: '18px',
        marginBottom: '20px'
      }}>
        0x742d35Cc6129C6532C89396D0EC99E8A0C98C8C7
      </p>
      
      <div style={{
        background: 'rgba(10, 15, 25, 0.8)',
        borderRadius: '12px',
        padding: '20px',
        fontStyle: 'italic',
        color: '#B8C2CC',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        "After analyzing all submissions with my advanced humor detection algorithms, this roast demonstrated the perfect balance of technical wit and creative wordplay. The modularity joke combined with the consensus layer coffee machine metaphor showed deep understanding of both blockchain architecture and JC's late-night coding habits. A masterpiece of digital roasting."
        <br /><br />
        <strong>- JC AI Judge</strong>
      </div>
      
      <p style={{
        fontSize: '24px',
        color: '#27AE60',
        fontWeight: '700',
        marginBottom: '30px'
      }}>
        💰 Prize: 0.175 0G
      </p>
      
      <button
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg, #00D2E9, #FF5CAA)',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '15px 30px',
          fontSize: '18px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        Next Round
      </button>
    </div>
  </div>
);

export default RoastArena;