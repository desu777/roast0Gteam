import React from 'react';
import { Clock, Users, Flame } from 'lucide-react';
import BurningRoastEffect from '../BurningRoastEffect/BurningRoastEffect';
import RoastInput from './components/RoastInput';
import ParticipantsList from './components/ParticipantsList';
import { getWritingPhaseStyles } from './styles/WritingPhaseStyles';

const WritingPhase = ({ 
  currentJudge,
  timeLeft,
  formatTime,
  participants,
  roastText,
  setRoastText,
  userSubmitted,
  isSubmitting,
  isConnected,
  joinRound
}) => {
  
  // Check if submissions should be disabled (less than 10 seconds left)
  const isSubmissionDisabled = timeLeft !== null && timeLeft < 10;

  return (
    <>
      <div className="writing-phase">
        <div className="round-status">
          <div className="timer-section">
            <div className="timer-display">
              <Clock size={24} />
              <span className={`timer-text ${isSubmissionDisabled ? 'timer-warning' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <p className="timer-label">
              {isSubmissionDisabled ? 'Submissions closing!' : 'Time to submit roasts'}
            </p>
          </div>
          
          <div className="participants-count">
            <Users size={20} />
            <span className="gradient-text">{participants.length} roasters joined</span>
          </div>
        </div>

        <div className="writing-section">
          <div className="writing-prompt">
            <h3>
              <Flame size={20} className="fire-icon" />
              Roast the 0G Team for {currentJudge.name}!
              <Flame size={20} className="fire-icon" />
            </h3>
          </div>

          {!userSubmitted ? (
            <RoastInput
              currentJudge={currentJudge}
              roastText={roastText}
              setRoastText={setRoastText}
              joinRound={joinRound}
              isSubmitting={isSubmitting}
              isConnected={isConnected}
              isSubmissionDisabled={isSubmissionDisabled}
            />
          ) : (
            <BurningRoastEffect 
              currentJudge={currentJudge}
              participants={participants}
            />
          )}
        </div>

        <ParticipantsList participants={participants} />
      </div>

      <style jsx>{getWritingPhaseStyles()}</style>
    </>
  );
};

export default WritingPhase; 