/**
 * PARALIFE Cinematic Audio Engine
 * Generates an atmospheric, dark, ambient soundscape using Web Audio API
 * when sound is toggled on (+sound).
 */

type AudioStateListener = (isPlaying: boolean) => void;

class ParalifeAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;
  private stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<AudioStateListener> = new Set();

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isPlaying));
  }

  public init() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return;

    // Clear any pending stop timeouts
    if (this.stopTimeoutId !== null) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }

    // Stop existing nodes immediately before creating new ones to prevent orphaned leaks
    this.stopNodesImmediately();

    this.isPlaying = true;
    this.notify();

    const now = this.ctx.currentTime;

    // Master Gain with smooth fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 2.5);
    this.masterGain.connect(this.ctx.destination);

    // Deep Sub Bass Drone (D1 = 36.71 Hz)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(36.71, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.5, now);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    this.oscillators.push(subOsc);

    // Warm Atmospheric Pad Frequencies (D Minor 9 chord: D2, A2, F3, C4, E4)
    const padFreqs = [73.42, 110.0, 174.61, 261.63, 329.63];

    // Filter for low-pass warm film resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);
    filter.Q.setValueAtTime(2.0, now);
    filter.connect(this.masterGain);

    // Subtle LFO modulating filter cutoff for breathing motion
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.08, now); // Slow 12-second breath loop
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, now);
    this.lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    this.lfo.start(now);

    padFreqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Slight detune for analog warmth
      osc.detune.setValueAtTime((i - 2) * 4.5, now);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.08 / padFreqs.length, now);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);
      this.oscillators.push(osc);
    });

    // Tape / Vinyl Warm Crackle (Noise buffer)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.015;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, now);
    noiseFilter.Q.setValueAtTime(1.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    this.noiseNode.start(now);
  }

  private stopNodesImmediately() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        /* ignore */
      }
    });
    this.oscillators = [];

    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {
        /* ignore */
      }
      this.noiseNode = null;
    }

    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch {
        /* ignore */
      }
      this.lfo = null;
    }
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;

    this.isPlaying = false;
    this.notify();

    if (this.masterGain) {
      const now = this.ctx.currentTime;
      // Use Math.max to prevent exponentialRampToValueAtTime error when starting from <= 0
      const currentGain = Math.max(0.0001, this.masterGain.gain.value);
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(currentGain, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    }

    this.stopTimeoutId = setTimeout(() => {
      this.stopNodesImmediately();
      if (this.masterGain) {
        try {
          this.masterGain.disconnect();
        } catch {
          /* ignore */
        }
        this.masterGain = null;
      }
      this.stopTimeoutId = null;
    }, 850);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new ParalifeAudioEngine();

