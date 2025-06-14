import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import ExplanationContent from './ExplanationContent';
import CharacterBio from './CharacterBio';
import { modalStyles } from './ModalStyles';

const HeaderExplanationModal = ({ isOpen, onClose, type, data, currentJudge }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterType, setCharacterType] = useState('og');

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedCharacter(null);
    setCharacterType('og');
    onClose();
  };

  const handleBackToTeam = () => {
    setSelectedCharacter(null);
  };

  const handleCharacterSelect = (character, type) => {
    setSelectedCharacter(character);
    setCharacterType(type);
  };

  const explanation = ExplanationContent({ 
    type, 
    data, 
    onCharacterSelect: handleCharacterSelect 
  });

  return (
    <div className="modal-overlay modal-fade-in" onClick={handleClose}>
      <div 
        className="explanation-modal modal-slide-in" 
        onClick={(e) => e.stopPropagation()}
        style={{
          '--judge-color': currentJudge?.color || '#FFD700',
          '--judge-color-rgb': currentJudge?.color ? 
            currentJudge.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : 
            '255, 215, 0'
        }}
      >
        <div className="modal-header">
          <div className="modal-title">
            {selectedCharacter ? <User size={24} /> : explanation.icon}
            <h3>{selectedCharacter ? selectedCharacter.name : explanation.title}</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          {selectedCharacter ? (
            <CharacterBio 
              character={selectedCharacter}
              characterType={characterType}
              onBack={handleBackToTeam}
            />
          ) : (
            explanation.content
          )}
        </div>
      </div>

      <style jsx>{modalStyles}</style>
    </div>
  );
};

export default HeaderExplanationModal; 