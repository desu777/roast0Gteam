import React from 'react';
import { Flame } from 'lucide-react';

const FireEffect = ({ show }) => {
  if (!show) return null;

  return (
    <>
      <div className="fire-effect">
        <div className="fire-base"></div>
        <div className="fire-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="fire-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }} />
          ))}
        </div>
        <div className="fire-text">
          <Flame size={24} /> ROASTED! <Flame size={24} />
        </div>
      </div>

      <style jsx>{`
        .fire-effect {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          pointer-events: none;
          z-index: 2000;
        }

        .fire-base {
          position: absolute;
          bottom: 40%;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(
            ellipse at center bottom,
            #FFD700 0%,
            #FF6B6B 30%,
            #FF5CAA 60%,
            transparent 100%
          );
          filter: blur(20px);
          animation: fireBaseGlow 0.5s ease-out;
        }

        @keyframes fireBaseGlow {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.5);
          }
          100% {
            opacity: 0.5;
            transform: translateX(-50%) scale(1);
          }
        }

        .fire-particle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at 30% 30%,
            #FFD700,
            #FF6B6B,
            #FF5CAA
          );
          border-radius: 50%;
          bottom: 40%;
          left: 50%;
          transform: translateX(-50%);
          filter: blur(2px);
          animation: 
            fireRise var(--duration) var(--delay) ease-out forwards,
            fireGlow 0.3s var(--delay) ease-in-out;
        }

        .fire-particle::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.4),
            transparent
          );
          animation: fireGlowPulse var(--duration) var(--delay) ease-out;
        }

        @keyframes fireRise {
          0% {
            transform: translateX(-50%) translateY(0) scale(0) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: 
              translateX(calc(-50% + var(--x))) 
              translateY(var(--y)) 
              scale(0.3)
              rotate(var(--rotation));
            opacity: 0;
          }
        }

        @keyframes fireGlow {
          0% {
            box-shadow: 
              0 0 10px #FFD700,
              0 0 20px #FF6B6B,
              0 0 30px #FF5CAA;
          }
          100% {
            box-shadow: 
              0 0 20px #FFD700,
              0 0 40px #FF6B6B,
              0 0 60px #FF5CAA;
          }
        }

        @keyframes fireGlowPulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .fire-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #FFD700;
          font-size: 32px;
          font-weight: 900;
          text-shadow: 
            0 0 10px rgba(255, 215, 0, 0.8),
            0 0 20px rgba(255, 107, 107, 0.6),
            0 0 30px rgba(255, 92, 170, 0.4);
          animation: fireTextPulse 1s ease-in-out infinite;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fire-text svg {
          color: #FF6B6B;
          animation: fireWiggle 0.8s ease-in-out infinite;
        }

        @keyframes fireWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.2); }
          75% { transform: rotate(10deg) scale(1.2); }
        }

        @keyframes fireTextPulse {
          0%, 100% {
            text-shadow: 
              0 0 10px rgba(255, 215, 0, 0.8),
              0 0 20px rgba(255, 107, 107, 0.6),
              0 0 30px rgba(255, 92, 170, 0.4);
          }
          50% {
            text-shadow: 
              0 0 15px rgba(255, 215, 0, 1),
              0 0 30px rgba(255, 107, 107, 0.8),
              0 0 45px rgba(255, 92, 170, 0.6);
          }
        }
      `}</style>
    </>
  );
};

export default FireEffect; 