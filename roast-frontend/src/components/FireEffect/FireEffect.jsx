import React from 'react';

const FireEffect = ({ show }) => {
  if (!show) return null;

  return (
    <>
      <div className="fire-effect">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="fire-particle"
            style={{
              '--delay': `${Math.random() * 0.5}s`,
              '--duration': `${1 + Math.random()}s`,
              '--x': `${Math.random() * 100 - 50}px`,
              '--y': `${Math.random() * -100 - 50}px`,
              '--rotation': `${Math.random() * 360}deg`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .fire-effect {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          pointer-events: none;
          z-index: 2000;
        }

        .fire-particle {
          position: absolute;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #FFD700, #FF5CAA, transparent);
          border-radius: 50%;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          animation: 
            fireRise var(--duration) var(--delay) ease-out forwards,
            fireGlow 0.3s var(--delay) ease-in-out;
        }

        @keyframes fireRise {
          0% {
            transform: translateX(-50%) translateY(0) scale(0);
            opacity: 1;
          }
          50% {
            transform: 
              translateX(calc(-50% + var(--x))) 
              translateY(var(--y)) 
              scale(1.5)
              rotate(var(--rotation));
            opacity: 0.8;
          }
          100% {
            transform: 
              translateX(calc(-50% + var(--x) * 2)) 
              translateY(calc(var(--y) * 2)) 
              scale(0.5)
              rotate(calc(var(--rotation) * 2));
            opacity: 0;
          }
        }

        @keyframes fireGlow {
          0% {
            box-shadow: 0 0 10px #FFD700;
          }
          100% {
            box-shadow: 0 0 30px #FF5CAA, 0 0 60px #FFD700;
          }
        }
      `}</style>
    </>
  );
};

export default FireEffect; 