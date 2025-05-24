import React from 'react';

const ParticleEffect = ({ show, color = '#FFD700' }) => {
  if (!show) return null;

  return (
    <>
      <div className="particles-container">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              background: color
            }} 
          />
        ))}
      </div>

      <style jsx>{`
        .particles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: particleFloat 3s ease-out forwards;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default ParticleEffect; 