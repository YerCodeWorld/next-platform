// Sound effects utility for exercises
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize audio context only on user interaction
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  // Generate simple sound effects programmatically
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
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

      // Apply envelope (fade in/out)
      const envelope = Math.min(1, t * 10) * Math.min(1, (duration - t) * 10);
      data[i] = value * envelope * 0.1; // Keep volume low
    }

    return buffer;
  }

  private createClickSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Short click with multiple frequencies
      const freq1 = 800 * Math.exp(-t * 10);
      const freq2 = 400 * Math.exp(-t * 8);
      const value = Math.sin(2 * Math.PI * freq1 * t) * 0.5 + Math.sin(2 * Math.PI * freq2 * t) * 0.3;
      const envelope = Math.exp(-t * 15);
      data[i] = value * envelope * 0.15;
    }

    return buffer;
  }

  private createSuccessSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Rising chord: C-E-G
      const freq1 = 523.25; // C5
      const freq2 = 659.25; // E5
      const freq3 = 783.99; // G5
      
      let value = 0;
      if (t < 0.1) value += Math.sin(2 * Math.PI * freq1 * t) * 0.3;
      if (t >= 0.1 && t < 0.2) value += Math.sin(2 * Math.PI * freq2 * t) * 0.3;
      if (t >= 0.2) value += Math.sin(2 * Math.PI * freq3 * t) * 0.3;
      
      const envelope = Math.min(1, t * 20) * Math.min(1, (duration - t) * 3);
      data[i] = value * envelope * 0.2;
    }

    return buffer;
  }

  private createErrorSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Descending dissonant notes
      const freq1 = 400;
      const freq2 = 300;
      
      let value = 0;
      if (t < 0.15) value = Math.sin(2 * Math.PI * freq1 * t) * 0.4;
      else value = Math.sin(2 * Math.PI * freq2 * t) * 0.4;
      
      const envelope = Math.min(1, t * 15) * Math.min(1, (duration - t) * 5);
      data[i] = value * envelope * 0.15;
    }

    return buffer;
  }

  private createNavigationSound(): AudioBuffer | null {
    return this.createTone(600, 0.08, 'sine');
  }

  // Initialize all sounds
  public async initializeSounds() {
    if (!this.audioContext) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create and store all sounds
      const clickBuffer = this.createClickSound();
      const successBuffer = this.createSuccessSound();
      const errorBuffer = this.createErrorSound();
      const navigationBuffer = this.createNavigationSound();

      if (clickBuffer) this.sounds.set('click', clickBuffer);
      if (successBuffer) this.sounds.set('success', successBuffer);
      if (errorBuffer) this.sounds.set('error', errorBuffer);
      if (navigationBuffer) this.sounds.set('navigation', navigationBuffer);

    } catch (error) {
      console.warn('Failed to initialize sounds:', error);
    }
  }

  public playSound(soundName: string, volume: number = 1) {
    if (!this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    try {
      const buffer = this.sounds.get(soundName);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = Math.min(1, Math.max(0, volume));
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error);
    }
  }

  // Specific sound methods
  public playClick() {
    this.playSound('click', 0.3);
  }

  public playSuccess() {
    this.playSound('success', 0.4);
  }

  public playError() {
    this.playSound('error', 0.3);
  }

  public playNavigation() {
    this.playSound('navigation', 0.2);
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Hook for React components
export function useSounds() {
  return {
    initializeSounds: () => soundManager.initializeSounds(),
    playClick: () => soundManager.playClick(),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    playNavigation: () => soundManager.playNavigation(),
  };
}