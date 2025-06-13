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
  playSound 
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
    
    // Betting state
    bets,
    totalPot,
    userBet,
    isLoadingBet,
    
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
            />
          </div>

        </div>
      </main>

      <style jsx>{`
        /* Reuse existing arena-main styles */
        .arena-main .left-column,
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

        /* Responsive - maintain same heights on desktop only */
        @media (max-width: 1200px) {
          .arena-main .left-column,
          .arena-main .right-column {
            height: auto;
            overflow: visible;
          }

          .arena-main .left-column > :global(.battle-history),
          .arena-main .right-column > :global(.betting-panel) {
            height: auto;
            max-height: 600px;
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
};

export default OneVSoneLayout; 