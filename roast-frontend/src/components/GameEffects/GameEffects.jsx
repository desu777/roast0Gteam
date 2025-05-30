import React from 'react';
import ParticleEffect from '../ParticleEffect/ParticleEffect';
import FireEffect from '../FireEffect/FireEffect';

const GameEffects = ({ showParticles, showFireEffect, currentJudge }) => {
  return (
    <>
      {/* Particle Effect */}
      <ParticleEffect 
        show={showParticles} 
        color={currentJudge?.color || '#FFD700'} 
      />

      {/* Fire Effect */}
      <FireEffect show={showFireEffect} />
    </>
  );
};

export default GameEffects; 