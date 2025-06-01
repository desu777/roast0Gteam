import { CONTRACT_TYPES } from '../constants';
import { ContractType, Particle } from '../types';

// Logging utility that respects environment settings
export const log = {
  info: (...args: any[]) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.info('[0G Slot Machine]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.warn('[0G Slot Machine]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error('[0G Slot Machine]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.debug('[0G Slot Machine]', ...args);
    }
  }
};

// Create celebration particles
export const createParticles = (type: 'celebration' | 'mythic' | 'legendary' = 'celebration'): Particle[] => {
  const newParticles: Particle[] = [];
  const count = type === 'mythic' ? 50 : type === 'legendary' ? 30 : 20;
  
  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 20,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 15 - 5,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      color: type === 'mythic' ? '#FF0080' : type === 'legendary' ? '#FFD700' : '#00D2E9'
    });
  }
  
  return newParticles;
};

// Play sound effect
export const playSound = (type: string, soundEnabled: boolean) => {
  if (!soundEnabled) return;
  
  try {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different rarities
    const frequencies: Record<string, number[]> = {
      spin: [200, 300, 400],
      common: [440, 554, 659],
      rare: [523, 659, 784],
      epic: [659, 784, 988],
      legendary: [784, 988, 1175],
      mythic: [1175, 1480, 1760]
    };
    
    const freq = frequencies[type] || frequencies.common;
    
    freq.forEach((f, i) => {
      setTimeout(() => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = f;
        osc.type = type === 'mythic' ? 'sawtooth' : type === 'legendary' ? 'triangle' : 'sine';
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc.start();
        osc.stop(audioContext.currentTime + 0.5);
      }, i * 100);
    });
  } catch (error) {
    log.warn('Audio context error:', error);
  }
};

// Enhanced weighted random with combo multiplier
export const getWeightedRandomContract = (comboMultiplier: number): ContractType => {
  const contracts = CONTRACT_TYPES.map(contract => ({
    ...contract,
    adjustedChance: contract.rarity === 'common' ? 
      contract.chance / comboMultiplier : 
      contract.chance * comboMultiplier
  }));
  
  const totalChance = contracts.reduce((sum, type) => sum + type.adjustedChance, 0);
  let random = Math.random() * totalChance;
  
  for (const contract of contracts) {
    random -= contract.adjustedChance;
    if (random <= 0) return contract;
  }
  
  return contracts[0];
};

// Generate random hash for mock transactions
export const generateRandomHash = (length: number = 64): string => {
  return '0x' + Math.random().toString(16).substr(2, length);
};

// Initialize particles.js
export const initializeParticles = () => {
  const script = document.createElement('script');
  script.innerHTML = `
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: ["#00D2E9", "#FF5CAA", "#FFD700", "#FF0080"] },
          shape: { type: "circle" },
          opacity: { value: 0.6, random: true },
          size: { value: 4, random: true },
          line_linked: { enable: true, distance: 150, color: "#00D2E9", opacity: 0.3, width: 1 },
          move: { enable: true, speed: 3, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
        }
      });
    }
  `;
  document.body.appendChild(script);
  return () => {
    if (document.body.contains(script)) {
      document.body.removeChild(script);
    }
  };
}; 