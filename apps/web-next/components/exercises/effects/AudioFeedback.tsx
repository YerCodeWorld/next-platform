// components/exercises/effects/AudioFeedback.tsx
'use client';

import { useEffect, useRef } from 'react';

interface AudioFeedbackProps {
  type: 'success' | 'error';
}

export function AudioFeedback({ type }: AudioFeedbackProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first interaction
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext not supported:', error);
        return;
      }
    }

    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create sound based on type
    if (type === 'success') {
      playSuccessSound(audioContext);
    } else {
      playErrorSound(audioContext);
    }
  }, [type]);

  const playSuccessSound = (audioContext: AudioContext) => {
    // Create a pleasant success sound (C major chord arpeggio)
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, now);
      oscillator.type = 'sine';

      // Create a pleasant envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3 + index * 0.1);

      oscillator.start(now + index * 0.1);
      oscillator.stop(now + 0.5 + index * 0.1);
    });
  };

  const playErrorSound = (audioContext: AudioContext) => {
    // Create a gentle error sound (descending tones)
    const frequencies = [400, 300]; // Lower, more subdued tones
    const now = audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
      oscillator.type = 'triangle'; // Softer than sine

      gainNode.gain.setValueAtTime(0, now + index * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01 + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2 + index * 0.1);

      oscillator.start(now + index * 0.1);
      oscillator.stop(now + 0.3 + index * 0.1);
    });
  };

  // This component doesn't render anything visual
  return null;
}