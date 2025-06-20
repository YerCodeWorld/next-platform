// Enhanced sound effects utility using Howler.js for exercises
import { Howl, Howler } from 'howler';

interface SoundConfig {
  volume: number;
  rate?: number;
  loop?: boolean;
}

class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private isInitialized = false;
  private masterVolume = 0.7;

  constructor() {
    // Set global volume
    Howler.volume(this.masterVolume);
  }

  // Generate sound data URLs for programmatic sounds
  private generateToneDataUrl(frequency: number, duration: number, type: OscillatorType = 'sine'): string {
    const sampleRate = 44100;
    const samples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate audio data
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sign(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'triangle':
          value = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
      }
      
      // Apply envelope
      const envelope = Math.min(1, t * 10) * Math.min(1, (duration - t) * 10);
      const sample = Math.round(value * envelope * 0.3 * 32767);
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateClickSound(): string {
    const sampleRate = 44100;
    const duration = 0.1;
    const samples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header (same as above)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate click sound
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const freq1 = 800 * Math.exp(-t * 10);
      const freq2 = 400 * Math.exp(-t * 8);
      const value = Math.sin(2 * Math.PI * freq1 * t) * 0.5 + Math.sin(2 * Math.PI * freq2 * t) * 0.3;
      const envelope = Math.exp(-t * 15);
      const sample = Math.round(value * envelope * 0.4 * 32767);
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateSuccessSound(): string {
    const sampleRate = 44100;
    const duration = 0.6;
    const samples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate success chord progression
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Rising arpeggio: C-E-G-C
      const freq1 = 523.25; // C5
      const freq2 = 659.25; // E5
      const freq3 = 783.99; // G5
      const freq4 = 1046.5; // C6
      
      let value = 0;
      if (t < 0.15) value += Math.sin(2 * Math.PI * freq1 * t) * 0.25;
      if (t >= 0.1 && t < 0.25) value += Math.sin(2 * Math.PI * freq2 * t) * 0.25;
      if (t >= 0.2 && t < 0.35) value += Math.sin(2 * Math.PI * freq3 * t) * 0.25;
      if (t >= 0.3) value += Math.sin(2 * Math.PI * freq4 * t) * 0.25;
      
      const envelope = Math.min(1, t * 15) * Math.min(1, (duration - t) * 3);
      const sample = Math.round(value * envelope * 0.5 * 32767);
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateErrorSound(): string {
    const sampleRate = 44100;
    const duration = 0.4;
    const samples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate error buzz sound
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Dissonant descending tones
      const freq1 = 400 + Math.sin(t * 30) * 50; // Warbling
      const freq2 = 300;
      
      let value = 0;
      if (t < 0.2) value = Math.sin(2 * Math.PI * freq1 * t) * 0.4;
      else value = Math.sin(2 * Math.PI * freq2 * t) * 0.4;
      
      const envelope = Math.min(1, t * 20) * Math.min(1, (duration - t) * 8);
      const sample = Math.round(value * envelope * 0.4 * 32767);
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Initialize all sounds
  public async initializeSounds() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Create sound instances with Howler
      const clickDataUrl = this.generateClickSound();
      const successDataUrl = this.generateSuccessSound();
      const errorDataUrl = this.generateErrorSound();
      const navigationDataUrl = this.generateToneDataUrl(600, 0.12, 'sine');
      const hoverDataUrl = this.generateToneDataUrl(800, 0.08, 'sine');
      const whooshDataUrl = this.generateToneDataUrl(200, 0.3, 'triangle');

      // Click sound
      this.sounds.set('click', new Howl({
        src: [clickDataUrl],
        volume: 0.4,
        preload: true
      }));

      // Success sound  
      this.sounds.set('success', new Howl({
        src: [successDataUrl],
        volume: 0.6,
        preload: true
      }));

      // Error sound
      this.sounds.set('error', new Howl({
        src: [errorDataUrl],
        volume: 0.5,
        preload: true
      }));

      // Navigation sound
      this.sounds.set('navigation', new Howl({
        src: [navigationDataUrl],
        volume: 0.3,
        preload: true
      }));

      // Hover sound for UI elements
      this.sounds.set('hover', new Howl({
        src: [hoverDataUrl],
        volume: 0.2,
        preload: true
      }));

      // Page transition whoosh
      this.sounds.set('whoosh', new Howl({
        src: [whooshDataUrl],
        volume: 0.3,
        preload: true
      }));

      this.isInitialized = true;
      console.log('✨ Enhanced sound system initialized with Howler.js');

    } catch (error) {
      console.warn('Failed to initialize enhanced sounds:', error);
    }
  }

  public playSound(soundName: string, config: SoundConfig = { volume: 1 }) {
    if (!this.isInitialized || !this.sounds.has(soundName)) {
      return;
    }

    try {
      const sound = this.sounds.get(soundName);
      if (!sound) return;

      // Apply configuration
      sound.volume(config.volume * this.masterVolume);
      if (config.rate) sound.rate(config.rate);
      if (config.loop !== undefined) sound.loop(config.loop);

      sound.play();
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error);
    }
  }

  // Specific sound methods with enhanced features
  public playClick(pitch: number = 1) {
    this.playSound('click', { volume: 0.4, rate: pitch });
  }

  public playSuccess() {
    this.playSound('success', { volume: 0.6 });
  }

  public playError() {
    this.playSound('error', { volume: 0.5 });
  }

  public playNavigation() {
    this.playSound('navigation', { volume: 0.3 });
  }

  public playHover() {
    this.playSound('hover', { volume: 0.2, rate: 1.2 });
  }

  public playWhoosh(direction: 'in' | 'out' = 'in') {
    const rate = direction === 'in' ? 1.0 : 0.8;
    this.playSound('whoosh', { volume: 0.3, rate });
  }

  // Global volume control
  public setMasterVolume(volume: number) {
    this.masterVolume = Math.min(1, Math.max(0, volume));
    Howler.volume(this.masterVolume);
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  // Mute/unmute all sounds
  public mute() {
    Howler.mute(true);
  }

  public unmute() {
    Howler.mute(false);
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Enhanced hook for React components
export function useSounds() {
  return {
    initializeSounds: () => soundManager.initializeSounds(),
    playClick: (pitch?: number) => soundManager.playClick(pitch),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    playNavigation: () => soundManager.playNavigation(),
    playHover: () => soundManager.playHover(),
    playWhoosh: (direction?: 'in' | 'out') => soundManager.playWhoosh(direction),
    setMasterVolume: (volume: number) => soundManager.setMasterVolume(volume),
    getMasterVolume: () => soundManager.getMasterVolume(),
    mute: () => soundManager.mute(),
    unmute: () => soundManager.unmute(),
  };
}