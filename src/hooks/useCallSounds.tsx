'use client';

import { useRef, useCallback } from 'react';

export function useCallSounds() {
  const muteSound = useRef<HTMLAudioElement | null>(null);
  const speakerSound = useRef<HTMLAudioElement | null>(null);

  // Inicializar sons
  const initSounds = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Som de mute (beep baixo)
      if (!muteSound.current) {
        muteSound.current = new Audio();
        muteSound.current.volume = 0.5;
        // Criar som de mute programaticamente
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }

      // Som de viva-voz (beep alto)
      if (!speakerSound.current) {
        speakerSound.current = new Audio();
        speakerSound.current.volume = 0.5;
      }
    }
  }, []);

  const playMuteSound = useCallback(() => {
    // Som de mute - frequência baixa
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    }
  }, []);

  const playSpeakerSound = useCallback(() => {
    // Som de viva-voz - duas frequências
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Primeiro beep
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator1.type = 'sine';
      gainNode1.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.1);

      // Segundo beep
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator2.type = 'sine';
      gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator2.start(audioContext.currentTime + 0.1);
      oscillator2.stop(audioContext.currentTime + 0.2);
    }
  }, []);

  return {
    initSounds,
    playMuteSound,
    playSpeakerSound,
  };
}
