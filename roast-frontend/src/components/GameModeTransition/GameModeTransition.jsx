import React, { useState, useEffect } from 'react';

const GameModeTransition = ({ gameMode, children }) => {
  const [activeChildren, setActiveChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    if (children.props.gameMode !== activeChildren.props.gameMode) {
      setIsTransitioning(true);
      setTransitionClass('fade-out');

      const fadeOutTimer = setTimeout(() => {
        setActiveChildren(children);
        setTransitionClass('fade-in');
      }, 300); // Czas trwania animacji fade-out

      const fadeInTimer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionClass('');
      }, 600); // Całkowity czas trwania przejścia

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(fadeInTimer);
      };
    }
  }, [children, activeChildren.props.gameMode]);

  return (
    <div className={`game-mode-transition-container ${transitionClass}`}>
      {activeChildren}
    </div>
  );
};

export default GameModeTransition; 