import React from 'react';
import ParticleEffect from '../ParticleEffect/ParticleEffect';
import FireEffect from '../FireEffect/FireEffect';
import SparksEffect from '../SparksEffect/SparksEffect';
import { useMousePosition } from '../../hooks/useMousePosition';

const GameEffects = ({ 
  showParticles, 
  showFireEffect, 
  currentJudge,
  currentPhase = 'waiting',
  enableSparks = true,
  sparksIntensity = 1
}) => {
  const mousePosition = useMousePosition();
  
  return (
    <>
      {/* Background Sparks Effect */}
      {enableSparks && (
        <SparksEffect 
          active={true}
          intensity={sparksIntensity}
          currentPhase={currentPhase}
          mousePosition={mousePosition}
        />
      )}

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