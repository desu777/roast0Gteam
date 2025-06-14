import React, { useState, useEffect } from 'react';
import BattleArena from './BattleArena';
import BattleHistory from './BattleHistory';
import BettingPanel from './BettingPanel';
import { useOneVSoneBattle } from '../../hooks/useOneVSoneBattle';

const OneVSoneLayout = ({ 
  isConnected, 
  userAddress, 
  formatTime, 
  addNotification,
  playSound,
  currentJudge,
  onBattleBetsUpdate
}) => {
  const {
    // Battle state
    currentBattle,
    battleStatus,
    ogCharacter,
    roasterCharacter,
    timeLeft,
    dialog,
    winner,
    winnerReasoning,
    
    // Extended judgment data
    ogScore,
    roasterScore,
    decisiveMoment,
    crowdFavorite,
    
    // Betting state
    bets,
    totalPot,
    userBet,
    isLoadingBet,
    
    // Configuration
    battleConfig,
    
    // History
    battleHistory,
    playerStats,
    
    // Actions
    placeBet,
    loadCurrentBattle,
    loadBattleHistory,
    loadPlayerStats
  } = useOneVSoneBattle(userAddress, addNotification, playSound);

  // Load initial data
  useEffect(() => {
    if (isConnected) {
      loadCurrentBattle();
      loadBattleHistory();
      if (userAddress) {
        loadPlayerStats(userAddress);
      }
    }
  }, [isConnected, userAddress]);

  // Update parent with betting data
  useEffect(() => {
    if (onBattleBetsUpdate && bets) {
      onBattleBetsUpdate(bets);
    }
  }, [bets, onBattleBetsUpdate]);

  return (
    <>
      <main className="arena-main">
        <div className="arena-layout">
          
          {/* Left Column - Battle History */}
          <div className="left-column">
            <BattleHistory 
              battleHistory={battleHistory}
              playerStats={playerStats}
              userAddress={userAddress}
              currentJudge={currentJudge}
            />
          </div>

          {/* Center Column - Battle Arena */}
          <div className="center-column">
            <BattleArena 
              currentBattle={currentBattle}
              battleStatus={battleStatus}
              ogCharacter={ogCharacter}
              roasterCharacter={roasterCharacter}
              timeLeft={timeLeft}
              formatTime={formatTime}
              dialog={dialog}
              winner={winner}
              winnerReasoning={winnerReasoning}
              ogScore={ogScore}
              roasterScore={roasterScore}
              decisiveMoment={decisiveMoment}
              crowdFavorite={crowdFavorite}
              currentJudge={currentJudge}
              battleHistory={battleHistory}
            />
          </div>

          {/* Right Column - Betting Panel */}
          <div className="right-column">
            <BettingPanel 
              isConnected={isConnected}
              userAddress={userAddress}
              bets={bets}
              totalPot={totalPot}
              userBet={userBet}
              isLoadingBet={isLoadingBet}
              battleStatus={battleStatus}
              placeBet={placeBet}
              currentBattle={currentBattle}
              currentJudge={currentJudge}
              battleConfig={battleConfig}
            />
          </div>

        </div>
      </main>

      <style jsx>{`
        /* Reuse existing arena-main styles */
        .arena-main .left-column,
        .arena-main .center-column,
        .arena-main .right-column {
          height: 600px;
          overflow: hidden;
        }

        .arena-main .left-column > :global(.battle-history),
        .arena-main .right-column > :global(.betting-panel) {
          height: 100%;
          max-height: 100%;
          overflow-y: auto;
        }

        /* Desktop optimizations - better use of wider center column */
        @media (min-width: 1025px) {
          .arena-main .center-column {
            min-width: 600px; /* Ensure minimum width for center */
          }
        }

        /* Tablet adjustments */
        @media (max-width: 1400px) and (min-width: 1025px) {
          .arena-main .left-column,
          .arena-main .center-column,
          .arena-main .right-column {
            height: 580px;
          }
        }

        /* Mobile landscape and smaller - stack layout */
        @media (max-width: 1024px) {
          .arena-main .left-column,
          .arena-main .center-column,
          .arena-main .right-column {
            height: auto;
            overflow: visible;
          }

          .arena-main .left-column > :global(.battle-history),
          .arena-main .right-column > :global(.betting-panel) {
            height: auto;
            max-height: 400px;
            overflow-y: auto;
          }
          
          /* Mobile order: center → betting panel → battle history */
          .arena-main .center-column {
            order: 1;
            margin-bottom: 20px;
          }
          
          .arena-main .right-column {
            order: 2;
            margin-bottom: 20px;
          }
          
          .arena-main .left-column {
            order: 3;
          }
        }

        /* Mobile portrait */
        @media (max-width: 768px) {
          .arena-main .left-column > :global(.battle-history),
          .arena-main .right-column > :global(.betting-panel) {
            max-height: 350px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .arena-main .left-column > :global(.battle-history),
          .arena-main .right-column > :global(.betting-panel) {
            max-height: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default OneVSoneLayout; 