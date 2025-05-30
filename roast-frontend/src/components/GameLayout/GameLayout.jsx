import React from 'react';
import JudgeBanner from '../JudgeBanner/JudgeBanner';
import PhaseContent from '../PhaseContent/PhaseContent';
import RecentWinners from '../RecentWinners/RecentWinners';
import VotingPanel from '../VotingPanel/VotingPanel';
import { GAME_PHASES } from '../../constants/gameConstants';

const GameLayout = ({
  // Game State
  currentPhase,
  currentJudge,
  timeLeft,
  formatTime,
  participants,
  roastText,
  setRoastText,
  userSubmitted,
  isSubmitting,
  isConnected,
  joinRound,
  prizePool,
  winner,
  aiReasoning,
  roundNumber,
  nextRoundCountdown,
  userAddress,
  
  // Voting State
  votingStats,
  userVote,
  votingLocked,
  isVoting,
  votingError,
  
  // Actions
  setShowJudgeDetails,
  castVote,
  handleVotingComplete
}) => {
  return (
    <>
      <main className="arena-main">
        {/* Desktop: 3-column layout, Mobile: stacked layout */}
        <div className="arena-layout">
          
          {/* Left Column - Recent Winners (Desktop) / Bottom (Mobile) */}
          <div className="left-column">
            <RecentWinners />
          </div>

          {/* Center Column - Main Game Content */}
          <div className="center-column">
            {/* Current Judge Display - Always visible */}
            <JudgeBanner 
              currentJudge={currentJudge}
              setShowJudgeDetails={setShowJudgeDetails}
            />

            {/* Phase-specific content */}
            <PhaseContent 
              currentPhase={currentPhase}
              currentJudge={currentJudge}
              timeLeft={timeLeft}
              formatTime={formatTime}
              participants={participants}
              roastText={roastText}
              setRoastText={setRoastText}
              userSubmitted={userSubmitted}
              isSubmitting={isSubmitting}
              isConnected={isConnected}
              joinRound={joinRound}
              prizePool={prizePool}
              winner={winner}
              aiReasoning={aiReasoning}
              roundNumber={roundNumber}
              nextRoundCountdown={nextRoundCountdown}
            />
          </div>

          {/* Right Column - Voting Panel */}
          <div className="right-column">
            {/* Voting Panel for Next Judge - Always visible now */}
            <VotingPanel 
              // Live voting data from useGameState
              votingStats={votingStats}
              userVote={userVote}
              votingLocked={votingLocked}
              isVoting={isVoting}
              votingError={votingError}
              
              // Game state
              isConnected={isConnected}
              timeLeft={timeLeft}
              currentPhase={currentPhase}
              userAddress={userAddress}
              
              // Actions - Live System
              onVote={castVote} // Direct castVote from useGameState
              
              // Legacy props (for backward compatibility during transition)
              onVotingComplete={handleVotingComplete}
            />
          </div>

        </div>
      </main>

      <style jsx>{`
        /* Override default arena-main styles to ensure columns alignment */
        .arena-main .left-column,
        .arena-main .right-column {
          height: 600px;
          overflow: hidden;
        }

        .arena-main .left-column > :global(.recent-winners),
        .arena-main .right-column > :global(.voting-panel) {
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

          .arena-main .left-column > :global(.recent-winners),
          .arena-main .right-column > :global(.voting-panel) {
            height: auto;
            max-height: 600px;
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
};

export default GameLayout; 