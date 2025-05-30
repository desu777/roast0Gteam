import React from 'react';
import { TEAM_MEMBERS } from '../../data/teamMembers';

const BurningRoastEffect = ({ currentJudge, participants = [] }) => {
  // Dostępne NFT z folderu public
  const availableNFTs = ['ada', 'elisha', 'jc', 'michael', 'ren', 'yon'];
  
  // Użyj rzeczywistych uczestników, ale maksymalnie 6
  const displayParticipants = participants.slice(0, 6);
  
  // Zawsze wyświetl wszystkie 6 NFT
  const displayNFTs = [];
  
  for (let i = 0; i < 6; i++) {
    const nftId = availableNFTs[i];
    const participant = displayParticipants[i];
    
    displayNFTs.push({
      id: nftId,
      address: participant?.address || `NFT ${i + 1}`,
      isUser: participant?.isUser || false
    });
  }

  return (
    <>
      <div className="burning-roast-container">
        <div className="fireplace">
          <div className="blur">
            <div className="fireplace__flame_big"></div>
          </div>
          
          {/* NFT "Logs" - tylko dostępne NFT */}
          {displayNFTs.map((nft, index) => (
            <section key={index} className={`fireplace__nft fireplace__nft--${index + 1}`}>
              <img 
                src={`/${nft.id}.jpg`} 
                alt={nft.address}
                className="nft-image"
              />
            </section>
          ))}
          
          {/* Sparks */}
          <main className="fireplace__spark"></main>
          <main className="fireplace__spark"></main>
          <main className="fireplace__spark"></main>
          <main className="fireplace__spark"></main>
          
          <div className="blur fix">
            <div className="fireplace__flame"></div>
          </div>
          <div className="fireplace__light"></div>
        </div>
        
        <div className="roast-submitted-text">
          <h2>Roast Submitted!</h2>
          <p>Your roast is burning in the arena. {currentJudge?.name || 'The judge'} will decide when time runs out.</p>
        </div>
      </div>

      <style jsx>{`
        .burning-roast-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0px 10px 20px 10px;
          text-align: center;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .fireplace {
          width: 320px;
          height: 320px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .fireplace__flame, .fireplace__flame_big {
          height: 250px;
          width: 180px;
          background: linear-gradient(0deg, rgba(236,221,66,1) 10%, rgba(237,174,52,1) 15%, rgba(237,100,52,1) 50%, rgba(250,71,8,1) 59%);
          position: relative;
          margin-bottom: -15px;
          z-index: 3;
          opacity: 0.7;
        }

        .fireplace__flame {
          width: 350px;
          margin-left: 10px;
          animation: burn 1.5s linear forwards infinite;
        }

        .fireplace__flame_big {
          margin-bottom: -5px;
          z-index: -1;
          opacity: 1;
          animation: burn_alt 2.5s linear forwards infinite;
        }

        .fireplace__nft {
          background: linear-gradient(#e66465, #5d5e55);
          height: 80px;
          width: 80px;
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          transform-origin: bottom center;
          box-shadow: 0px 0px 8px rgba(0,0,0,0.8);
          overflow: hidden;
          border: 3px solid #ff915b;
        }

        .nft-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .fireplace__nft--1 {
          left: 70px;
          transform: rotateZ(45deg);
        }
        .fireplace__nft--2 {
          left: 100px;
          transform: rotateZ(25deg);
        }
        .fireplace__nft--3 {
          left: 140px;
          transform: rotateZ(5deg);
        }
        .fireplace__nft--4 {
          left: 140px;
          transform: rotateZ(-5deg);
        }
        .fireplace__nft--5 {
          left: 170px;
          transform: rotateZ(-15deg);
        }
        .fireplace__nft--6 {
          left: 200px;
          transform: rotateZ(-35deg);
        }
        .fireplace__nft--7 {
          left: 230px;
          transform: rotateZ(-45deg);
        }

        .fireplace__spark {
          position: absolute;
          height: 4px;
          width: 4px;
          border-radius: 1px;
          top: 0; 
          left: 0;
          filter: blur(1px);
          background: yellow;
          z-index: 10;
          opacity: 0;
        }

        .fireplace__spark:nth-of-type(8) {
          animation: spark_1 1s forwards infinite;
        }
        .fireplace__spark:nth-of-type(9) {
          animation: spark_2 1s 0.75s forwards infinite;
        }
        .fireplace__spark:nth-of-type(10) {
          animation: spark_3 1s 0.25s forwards infinite;
        }
        .fireplace__spark:nth-of-type(11) {
          animation: spark_4 1s 0.5s forwards infinite;
        }

        .fireplace__light {
          height: 100%;
          width: 100%;
          border-radius: 50% 50% 30% 30%;
          transform: scale(1.1,1.2);
          filter: blur(50px);
          background: orange;
          position: absolute;
          top: 40px; 
          left: 0;
          z-index: -1;
          opacity: 0.4;
        }

        .blur {
          filter: blur(1px);
        }

        .blur.fix {
          position: absolute;
        }

        .roast-submitted-text {
          color: #E6E6E6;
          width: 100%;
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .roast-submitted-text h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #FFD700, #FF6B6B, #FF5CAA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fireGlow 2s ease-in-out infinite alternate;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.2;
        }

        .roast-submitted-text p {
          font-size: 16px;
          color: #9999A5;
          line-height: 1.5;
          max-width: 400px;
          margin: 0 auto;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        @keyframes fireGlow {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 107, 107, 0.5)); }
        }

        /* Fire animations */
        @keyframes burn {
          0% {
            clip-path: polygon(48% 97%, 42% 97%, 37% 93%, 31% 92%, 28% 88%, 26% 81%, 29% 84%, 34% 84%, 33% 79%, 30% 74%, 31% 67%, 34% 57%, 34% 65%, 39% 71%, 43% 65%, 43% 55%, 40% 45%, 48% 59%, 49% 69%, 51% 76%, 55% 71%, 54% 65%, 54% 58%, 58% 64%, 61% 72%, 57% 92%, 61% 97%, 64% 98%, 66% 95%, 64% 93%, 57% 96%, 54% 93%, 48% 97%);
          }
          25% {
            clip-path: polygon(49% 97%, 41% 97%, 35% 92%, 33% 86%, 34% 80%, 30% 74%, 34% 77%, 38% 81%, 38% 78%, 36% 72%, 35% 67%, 37% 61%, 37% 54%, 39% 61%, 39% 67%, 43% 63%, 43% 58%, 45% 44%, 44% 58%, 48% 66%, 51% 67%, 51% 59%, 54% 67%, 56% 72%, 57% 79%, 59% 77%, 60% 71%, 61% 77%, 61% 83%, 60% 89%, 61% 94%, 57% 97%, 52% 98%);
          }
          50% {
            clip-path: polygon(46% 97%, 39% 96%, 35% 89%, 36% 84%, 34% 77%, 30% 73%, 30% 65%, 30% 70%, 35% 75%, 38% 68%, 37% 61%, 40% 53%, 41% 42%, 42% 56%, 44% 65%, 50% 67%, 51% 57%, 53% 68%, 52% 74%, 51% 81%, 55% 78%, 57% 72%, 58% 79%, 57% 85%, 55% 88%, 60% 87%, 63% 82%, 63% 89%, 59% 94%, 55% 98%, 51% 92%, 50% 99%, 45% 96%);
          }
          75% {
            clip-path: polygon(45% 97%, 38% 97%, 33% 93%, 31% 87%, 31% 81%, 29% 76%, 25% 69%, 29% 61%, 30% 69%, 35% 71%, 35% 62%, 34% 54%, 38% 45%, 38% 54%, 43% 62%, 47% 57%, 48% 49%, 44% 38%, 50% 46%, 53% 60%, 54% 71%, 53% 79%, 59% 76%, 60% 66%, 64% 73%, 63% 79%, 59% 85%, 64% 90%, 68% 84%, 68% 92%, 60% 97%, 53% 98%, 48% 99%);
          }
          100% {
            clip-path: polygon(48% 97%, 42% 97%, 37% 93%, 31% 92%, 28% 88%, 26% 81%, 29% 84%, 34% 84%, 33% 79%, 30% 74%, 31% 67%, 34% 57%, 34% 65%, 39% 71%, 43% 65%, 43% 55%, 40% 45%, 48% 59%, 49% 69%, 51% 76%, 55% 71%, 54% 65%, 54% 58%, 58% 64%, 61% 72%, 57% 92%, 61% 97%, 64% 98%, 66% 95%, 64% 93%, 57% 96%, 54% 93%, 48% 97%);
          }
        }

        @keyframes burn_alt {
          0%, 100% {
            clip-path: polygon(48% 97%, 43% 97%, 38% 97%, 34% 94%, 33% 91%, 32% 87%, 29% 83%, 26% 80%, 21% 75%, 20% 71%, 20% 66%, 20% 59%, 20% 65%, 24% 68%, 28% 67%, 28% 62%, 25% 60%, 21% 52%, 21% 43%, 24% 32%, 23% 39%, 24% 46%, 28% 48%, 33% 44%, 33% 39%, 31% 32%, 28% 23%, 30% 14%, 31% 22%, 35% 28%, 39% 28%, 41% 25%, 40% 21%, 39% 13%, 41% 6%, 42% 15%, 45% 23%, 49% 25%, 52% 22%, 51% 13%, 54% 21%, 56% 29%, 53% 35%, 50% 41%, 53% 46%, 58% 46%, 60% 39%, 60% 34%, 64% 39%, 65% 45%, 63% 51%, 61% 56%, 64% 61%, 68% 59%, 71% 55%, 73% 48%, 73% 40%, 76% 48%, 77% 56%, 76% 62%, 74% 66%, 69% 71%, 71% 74%, 75% 74%, 79% 71%, 81% 65%, 82% 72%, 81% 77%, 77% 82%, 73% 86%, 73% 89%, 78% 89%, 82% 85%, 81% 91%, 78% 95%, 72% 97%, 65% 98%, 59% 98%, 53% 99%, 47% 97%);
          }
          50% {
            clip-path: polygon(44% 99%, 41% 99%, 35% 98%, 29% 97%, 24% 93%, 21% 86%, 20% 80%, 16% 74%, 16% 64%, 16% 71%, 21% 75%, 25% 72%, 25% 65%, 22% 59%, 19% 53%, 19% 44%, 21% 52%, 25% 59%, 29% 57%, 29% 51%, 26% 44%, 26% 38%, 30% 32%, 31% 26%, 30% 18%, 34% 25%, 33% 35%, 33% 44%, 34% 50%, 39% 53%, 44% 52%, 45% 49%, 44% 44%, 42% 38%, 44% 33%, 48% 26%, 45% 35%, 47% 41%, 50% 44%, 51% 52%, 49% 60%, 48% 65%, 53% 69%, 58% 65%, 57% 59%, 58% 51%, 62% 41%, 66% 40%, 64% 47%, 61% 58%, 63% 66%, 66% 68%, 70% 67%, 72% 62%, 73% 57%, 71% 48%, 75% 53%, 79% 57%, 79% 64%, 76% 70%, 72% 75%, 70% 78%, 74% 80%, 78% 79%, 82% 76%, 84% 71%, 85% 66%, 84% 62%, 88% 67%, 89% 72%, 89% 79%, 87% 83%, 84% 89%, 81% 93%, 76% 97%, 69% 98%, 60% 99%, 54% 99%, 48% 100%, 45% 97%);
          }
        }

        @keyframes spark_1 {
          0% {
            opacity: 1;
            left: 100px;
            top: 210px;
          }
          100% {
            top: 60px;
            left: 110px;
            opacity: 0;
          }
        }

        @keyframes spark_2 {
          0% {
            opacity: 1;   
            left: 180px;
            top: 210px;
          }
          100% {
            top: 20px;
            left: 150px;
            opacity: 0;
          }
        }

        @keyframes spark_3 {
          0% {
            opacity: 1;   
            left: 220px;
            top: 210px;
          }
          100% {
            top: 30px;
            left: 170px;
            opacity: 0;
          }
        }

        @keyframes spark_4 {
          0% {
            opacity: 1;  
            left: 120px;
            top: 210px;
          }
          100% {
            top: 30px;
            left: 40px;
            opacity: 0;
          }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .burning-roast-container {
            padding: 15px 10px 30px 10px;
          }
          
          .fireplace {
            width: 300px;
            height: 300px;
          }

          .roast-submitted-text h2 {
            font-size: 24px;
          }

          .roast-submitted-text p {
            font-size: 15px;
            max-width: 350px;
          }
        }

        @media (max-width: 768px) {
          .burning-roast-container {
            padding: 10px 8px 25px 8px;
          }
          
          .fireplace {
            width: 260px;
            height: 260px;
          }

          .fireplace__nft {
            height: 60px;
            width: 60px;
          }

          .roast-submitted-text h2 {
            font-size: 20px;
            margin-bottom: 12px;
          }

          .roast-submitted-text p {
            font-size: 14px;
            max-width: 280px;
            padding: 0 8px;
          }
        }

        @media (max-width: 480px) {
          .burning-roast-container {
            padding: 8px 5px 20px 5px;
          }
          
          .fireplace {
            width: 220px;
            height: 220px;
          }

          .fireplace__nft {
            height: 45px;
            width: 45px;
          }

          .fireplace__nft--1 {
            left: 35px;
          }
          .fireplace__nft--2 {
            left: 60px;
          }
          .fireplace__nft--3 {
            left: 85px;
          }
          .fireplace__nft--4 {
            left: 90px;
          }
          .fireplace__nft--5 {
            left: 115px;
          }
          .fireplace__nft--6 {
            left: 140px;
          }
          .fireplace__nft--7 {
            left: 165px;
          }

          .fireplace__flame, .fireplace__flame_big {
            height: 180px;
            width: 120px;
          }

          .fireplace__flame {
            width: 200px;
            margin-left: 10px;
          }

          .roast-submitted-text h2 {
            font-size: 18px;
            margin-bottom: 10px;
            padding: 0 4px;
          }

          .roast-submitted-text p {
            font-size: 13px;
            max-width: 240px;
            padding: 0 8px;
            line-height: 1.4;
          }
        }

        @media (max-width: 360px) {
          .burning-roast-container {
            padding: 5px 3px 15px 3px;
          }
          
          .fireplace {
            width: 180px;
            height: 180px;
          }

          .fireplace__nft {
            height: 35px;
            width: 35px;
            border: 2px solid #ff915b;
          }

          .fireplace__nft--1 {
            left: 25px;
          }
          .fireplace__nft--2 {
            left: 45px;
          }
          .fireplace__nft--3 {
            left: 65px;
          }
          .fireplace__nft--4 {
            left: 70px;
          }
          .fireplace__nft--5 {
            left: 90px;
          }
          .fireplace__nft--6 {
            left: 110px;
          }
          .fireplace__nft--7 {
            left: 130px;
          }

          .fireplace__flame, .fireplace__flame_big {
            height: 140px;
            width: 90px;
          }

          .fireplace__flame {
            width: 160px;
            margin-left: 10px;
          }

          .roast-submitted-text h2 {
            font-size: 16px;
            margin-bottom: 8px;
            padding: 0 4px;
            line-height: 1.1;
          }

          .roast-submitted-text p {
            font-size: 12px;
            max-width: 200px;
            padding: 0 6px;
            line-height: 1.3;
          }
        }

        @media (max-width: 320px) {
          .burning-roast-container {
            padding: 5px 2px 15px 2px;
          }

          .roast-submitted-text h2 {
            font-size: 14px;
            padding: 0 2px;
          }

          .roast-submitted-text p {
            font-size: 11px;
            max-width: 180px;
            padding: 0 4px;
          }
        }
      `}</style>
    </>
  );
};

export default BurningRoastEffect; 