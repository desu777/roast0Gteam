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
  currentJudge,
  battleHistory
}) => {
  const [showCharacterBio, setShowCharacterBio] = useState(null);
  const [bioCharacterType, setBioCharacterType] = useState('og');
  const [phaseTransition, setPhaseTransition] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [currentTypingSpeaker, setCurrentTypingSpeaker] = useState(null);

  // Calculate round number based on battle history
  const getRoundNumber = () => {
    if (!battleHistory || !Array.isArray(battleHistory)) return 1;
    // Current battle + completed battles = total rounds
    return battleHistory.length + 1;
  };

  // Calculate character statistics from battle history
  const getCharacterStats = (characterId, characterType) => {
    if (!battleHistory || !Array.isArray(battleHistory) || !characterId) {
      return { battles: 0, wins: 0, winRate: 0 };
    }

    let battles = 0;
    let wins = 0;

    battleHistory.forEach(battle => {
      // Check if this character participated in this battle
      if (characterType === 'og' && battle.og_character_id === characterId) {
        battles++;
        if (battle.winner_side === 'og') wins++;
      } else if (characterType === 'roaster' && battle.roaster_character_id === characterId) {
        battles++;
        if (battle.winner_side === 'roaster') wins++;
      }
    });

    const winRate = battles > 0 ? Math.round((wins / battles) * 100) : 0;

    return { battles, wins, winRate };
  };

  // Handle phase transitions with animations
  useEffect(() => {
    const handlePhaseChange = () => {
      setPhaseTransition('fade-out');
      setTimeout(() => {
        setPhaseTransition('fade-in');
        setTimeout(() => setPhaseTransition(''), 500);
      }, 400);
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
      return character?.id ? `/${character.id}.jpg` : null;
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
          currentJudge={currentJudge}
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
        battleStatus={battleStatus}
        timeLeft={timeLeft}
        formatTime={formatTime}
        getCharacterStats={getCharacterStats}
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
            <span className="gradient-text">Battle Arena Round #{getRoundNumber()}</span>
          </h2>
          </div>
        )}

        {/* Main Content - switches based on battle status */}
        <div className="arena-content">
          {renderMainContent()}
          </div>


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