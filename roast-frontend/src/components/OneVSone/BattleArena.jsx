import React, { useState, useEffect } from 'react';
import { Landmark } from 'lucide-react';
import { TEAM_MEMBERS } from '../../data/teamMembers';
import { TEAM_ROASTERS } from '../../data/teamRoasters';
import CharacterBioModal from '../CharacterBioModal/CharacterBioModal';
import BattleChatFullscreen from './BattleChatFullscreen';
import BattleResultsFullscreen from './BattleResultsFullscreen';
import BattleCharactersDisplay from './BattleCharactersDisplay';
import { battleArenaStyles } from './BattleArenaStyles';

const BattleArena = ({ 
  currentBattle,
  battleStatus,
  ogCharacter,
  roasterCharacter,
  timeLeft,
  formatTime,
  dialog,
  winner,
  winnerReasoning,
  ogScore,
  roasterScore,
  decisiveMoment,
  crowdFavorite,
  currentJudge
}) => {
  const [showCharacterBio, setShowCharacterBio] = useState(null);
  const [bioCharacterType, setBioCharacterType] = useState('og');
  const [phaseTransition, setPhaseTransition] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [currentTypingSpeaker, setCurrentTypingSpeaker] = useState(null);

  // Handle phase transitions with animations
  useEffect(() => {
    const handlePhaseChange = () => {
      setPhaseTransition('fade-out');
      setTimeout(() => {
        setPhaseTransition('fade-in');
        setTimeout(() => setPhaseTransition(''), 300);
      }, 200);
    };

    if (battleStatus === 'dialog' || battleStatus === 'completed') {
      handlePhaseChange();
    }
  }, [battleStatus]);

  // Handle typing indicator for chat
  useEffect(() => {
    if (battleStatus === 'dialog') {
      if (dialog.length === 0) {
        // First message should be from roaster (right side)
        setShowTypingIndicator(true);
        setCurrentTypingSpeaker('roaster');
        
        const timer = setTimeout(() => {
          setShowTypingIndicator(false);
          setCurrentTypingSpeaker(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      } else if (dialog.length > 0) {
        const lastMessage = dialog[dialog.length - 1];
        if (lastMessage) {
          setShowTypingIndicator(true);
          setCurrentTypingSpeaker(lastMessage.speaker === 'og' ? 'roaster' : 'og');
          
          const timer = setTimeout(() => {
            setShowTypingIndicator(false);
            setCurrentTypingSpeaker(null);
          }, 2000);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [dialog, battleStatus]);

  const getStatusMessage = () => {
    switch (battleStatus) {
      case 'waiting_bets':
        return 'Place your bets! Battle starts when minimum bets are reached.';
      case 'countdown':
        return 'Battle countdown in progress...';
      case 'generating':
        return 'AI is preparing an epic roast battle...';
      case 'dialog':
        return 'Battle in progress! Watch the roasts fly!';
      case 'completed':
        return `Battle complete! ${winner === 'og' ? ogCharacter?.name : roasterCharacter?.name} wins!`;
      default:
        return 'Waiting for next battle...';
    }
  };

  // Helper functions to get character bio data
  const getOGCharacterBio = (characterId) => {
    return TEAM_MEMBERS.find(member => member.id === characterId);
  };

  const getRoasterCharacterBio = (characterId) => {
    return TEAM_ROASTERS.find(roaster => roaster.id === characterId);
  };

  const handleShowBio = (character, type) => {
    let bioData = null;
    if (type === 'og') {
      bioData = getOGCharacterBio(character.id);
    } else {
      bioData = getRoasterCharacterBio(character.id);
    }
    
    if (bioData) {
      setShowCharacterBio(bioData);
      setBioCharacterType(type);
    }
  };

  // Get character avatar URL
  const getCharacterAvatar = (character, type) => {
    if (type === 'og') {
      return character?.id ? `/${character.id}.jpg` : null;
    } else {
      return character?.id ? `/avatars/${character.id}.png` : null;
    }
  };

  // Render main content based on battle status
  const renderMainContent = () => {
    // Full-screen chat layout
    if (battleStatus === 'dialog') {
      return (
        <BattleChatFullscreen
          phaseTransition={phaseTransition}
          ogCharacter={ogCharacter}
          roasterCharacter={roasterCharacter}
          dialog={dialog}
          showTypingIndicator={showTypingIndicator}
          currentTypingSpeaker={currentTypingSpeaker}
          getCharacterAvatar={getCharacterAvatar}
        />
      );
    }
    
    // Full-screen results layout
    if (battleStatus === 'completed') {
      return (
        <BattleResultsFullscreen
          phaseTransition={phaseTransition}
          winner={winner}
          ogCharacter={ogCharacter}
          roasterCharacter={roasterCharacter}
          ogScore={ogScore}
          roasterScore={roasterScore}
          winnerReasoning={winnerReasoning}
          decisiveMoment={decisiveMoment}
          getCharacterAvatar={getCharacterAvatar}
        />
      );
    }
    
    // Transition message with loader
    if (battleStatus === 'generating') {
      return (
        <div className={`battle-transition ${phaseTransition}`}>
          <div className="transition-message">
            <div className="battle-loader" style={{
              '--judge-color': currentJudge?.color || '#FFD700',
              '--judge-color-light': currentJudge?.color ? `${currentJudge.color}80` : '#FFD70080',
              '--judge-color-dark': currentJudge?.color ? `${currentJudge.color}CC` : '#FFD700CC'
            }}></div>
            <span className="status-gradient-text loader-text">Preparing epic battle...</span>
          </div>
        </div>
      );
    }
    
    // Default: Characters VS Display
    return (
      <BattleCharactersDisplay
        phaseTransition={phaseTransition}
        ogCharacter={ogCharacter}
        roasterCharacter={roasterCharacter}
        winner={winner}
        currentJudge={currentJudge}
        handleShowBio={handleShowBio}
      />
    );
  };

  return (
    <>
      <div className="battle-arena">
        {/* Title - only show when not in chat or results */}
        {(battleStatus !== 'dialog' && battleStatus !== 'completed') && (
        <div className="arena-title">
          <h2>
            <Landmark 
              className="arena-icon" 
              style={{ color: currentJudge?.color || '#FFD700' }}
            />
            <span className="gradient-text">Battle Arena</span>
          </h2>
          </div>
        )}

        {/* Main Content - switches based on battle status */}
        <div className="arena-content">
          {renderMainContent()}
          </div>

        {/* Status and Timer - only show when not in full-screen modes */}
        {(battleStatus !== 'dialog' && battleStatus !== 'completed') && (
          <div className="battle-status" style={{
            background: `rgba(${currentJudge?.color ? 
              currentJudge.color.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : 
              '255, 215, 0'}, 0.1)`,
            borderColor: `rgba(${currentJudge?.color ? 
              currentJudge.color.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : 
              '255, 215, 0'}, 0.3)`
          }}>
            {timeLeft > 0 && battleStatus === 'countdown' ? (
              <span className="status-gradient-text">Battle starting in {formatTime(timeLeft)}!</span>
            ) : (
              <span className="status-gradient-text">{getStatusMessage()}</span>
            )}
          </div>
        )}
      </div>

      <style jsx>{battleArenaStyles}</style>

      {/* Character Bio Modal */}
      <CharacterBioModal 
        character={showCharacterBio}
        onClose={() => setShowCharacterBio(null)}
        characterType={bioCharacterType}
        currentJudge={currentJudge}
      />
    </>
  );
};

export default BattleArena; 