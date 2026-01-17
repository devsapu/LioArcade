'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'celebration' 
  | 'levelUp' 
  | 'correct' 
  | 'incorrect' 
  | 'characterRun' 
  | 'characterPoint' 
  | 'pageTransition'
  | 'victory'
  | 'gameComplete';

interface SoundConfig {
  volume: number;
  enabled: boolean;
  backgroundMusicEnabled: boolean;
  backgroundMusicVolume: number;
}

const defaultConfig: SoundConfig = {
  volume: 0.7,
  enabled: true,
  backgroundMusicEnabled: false, // Off by default
  backgroundMusicVolume: 0.3,
};

// Play victory fanfare (ascending notes)
const playVictoryFanfare = (audioContext: AudioContext, volume: number): void => {
  const notes = [523, 659, 784, 1047]; // C, E, G, C (higher) - Major chord progression
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, index * 150);
  });
};

// Generate simple sounds using Web Audio API
const generateSound = (type: SoundType, volume: number = 0.7): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let frequency = 440;
    let duration = 0.1;
    
    switch (type) {
      case 'click':
        frequency = 800;
        duration = 0.05;
        break;
      case 'success':
        frequency = 600;
        duration = 0.2;
        break;
      case 'error':
        frequency = 300;
        duration = 0.3;
        break;
      case 'celebration':
        frequency = 700;
        duration = 0.15;
        break;
      case 'levelUp':
        frequency = 523; // C note
        duration = 0.3;
        break;
      case 'correct':
        frequency = 659; // E note
        duration = 0.2;
        break;
      case 'incorrect':
        frequency = 392; // G note (lower)
        duration = 0.2;
        break;
      case 'characterRun':
        frequency = 500;
        duration = 0.1;
        break;
      case 'characterPoint':
        frequency = 600;
        duration = 0.15;
        break;
      case 'pageTransition':
        frequency = 400;
        duration = 0.1;
        break;
      case 'victory':
        // Victory fanfare - ascending notes
        playVictoryFanfare(audioContext, volume);
        return;
      case 'gameComplete':
        // Game complete - triumphant sound
        frequency = 523; // C note
        duration = 0.5;
        break;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type === 'celebration' || type === 'levelUp' ? 'sine' : 'square';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('Audio not supported:', error);
  }
};

export function useSound() {
  const [config, setConfig] = useState<SoundConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundConfig');
      if (saved) {
        return { ...defaultConfig, ...JSON.parse(saved) };
      }
    }
    return defaultConfig;
  });
  
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);

  // Save config to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundConfig', JSON.stringify(config));
    }
  }, [config]);

  // Play sound effect
  const playSound = useCallback((type: SoundType) => {
    if (!config.enabled) return;
    generateSound(type, config.volume);
  }, [config.enabled, config.volume]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  // Toggle background music
  const toggleBackgroundMusic = useCallback(() => {
    setConfig(prev => {
      const newValue = !prev.backgroundMusicEnabled;
      
      if (backgroundMusicRef.current) {
        if (newValue) {
          backgroundMusicRef.current.play().catch(console.warn);
        } else {
          backgroundMusicRef.current.pause();
        }
      }
      
      return { ...prev, backgroundMusicEnabled: newValue };
    });
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  // Set background music volume
  const setBackgroundMusicVolume = useCallback((volume: number) => {
    setConfig(prev => {
      const newVolume = Math.max(0, Math.min(1, volume));
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = newVolume;
      }
      return { ...prev, backgroundMusicVolume: newVolume };
    });
  }, []);

  // Initialize background music (optional - requires audio file)
  useEffect(() => {
    // You can add a background music file here
    // For now, we'll create a silent audio element that can be used later
    if (typeof window !== 'undefined' && !backgroundMusicRef.current) {
      // Uncomment and add your music file path:
      // backgroundMusicRef.current = new Audio('/sounds/background-music.mp3');
      // backgroundMusicRef.current.loop = true;
      // backgroundMusicRef.current.volume = config.backgroundMusicVolume;
      
      // For now, we'll skip actual music file
    }
  }, []);

  // Stop game music
  const stopGameMusic = useCallback(() => {
    if ((gameMusicRef as any).current) {
      clearInterval((gameMusicRef as any).current);
      (gameMusicRef as any).current = null;
    }
  }, []);

  // Start game music (melody during gameplay)
  const startGameMusic = useCallback(() => {
    if (!config.enabled) return;
    
    // Stop any existing game music first
    if ((gameMusicRef as any).current) {
      clearInterval((gameMusicRef as any).current);
      (gameMusicRef as any).current = null;
    }
    
    // Generate a pleasant game melody using Web Audio API
    if (typeof window !== 'undefined') {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Pleasant melody pattern - C major arpeggio (softer, more pleasant)
        const playMelody = () => {
          // C major chord notes in a pleasant pattern
          const melody = [523, 659, 784, 1047, 784, 659]; // C, E, G, C(high), G, E
          let noteIndex = 0;
          
          const playNote = () => {
            if (!(gameMusicRef as any).current) return; // Stop if music was stopped
            
            if (noteIndex >= melody.length) {
              noteIndex = 0; // Loop
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = melody[noteIndex];
            oscillator.type = 'sine'; // Softer sine wave
            
            // Softer, more pleasant volume envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(config.backgroundMusicVolume * 0.2, audioContext.currentTime + 0.15);
            gainNode.gain.linearRampToValueAtTime(config.backgroundMusicVolume * 0.15, audioContext.currentTime + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.6);
            
            noteIndex++;
          };
          
          // Play melody continuously (slower, more pleasant)
          const interval = setInterval(playNote, 800);
          
          // Store interval to clear later
          (gameMusicRef as any).current = interval;
        };
        
        playMelody();
      } catch (error) {
        console.warn('Game music not supported:', error);
      }
    }
  }, [config.enabled, config.backgroundMusicVolume]);

  // Handle background music state
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = config.backgroundMusicVolume;
      if (config.backgroundMusicEnabled) {
        backgroundMusicRef.current.play().catch(console.warn);
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [config.backgroundMusicEnabled, config.backgroundMusicVolume]);

  return {
    playSound,
    toggleSound,
    toggleBackgroundMusic,
    setVolume,
    setBackgroundMusicVolume,
    startGameMusic,
    stopGameMusic,
    soundEnabled: config.enabled,
    backgroundMusicEnabled: config.backgroundMusicEnabled,
    volume: config.volume,
    backgroundMusicVolume: config.backgroundMusicVolume,
  };
}
