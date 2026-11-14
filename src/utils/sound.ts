/**
 * Lightweight Web Audio Soundscape & Interactive FX
 * Disabled by default. Zero external network assets required.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientOscillators: OscillatorNode[] = [];

  constructor() {
    // Check localStorage preference if available
    const saved = typeof window !== 'undefined' ? localStorage.getItem('personal-universe-sound') : null;
    this.isMuted = saved === 'unmuted' ? false : true; // Default is MUTED
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('personal-universe-sound', this.isMuted ? 'muted' : 'unmuted');
    }

    if (this.isMuted) {
      this.stopAmbient();
    } else {
      this.initContext();
      this.startAmbient();
      this.playTap();
    }

    return this.isMuted;
  }

  public playTap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        const startTime = this.ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } catch {
      // Audio catch
    }
  }

  public playFlip() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Catch
    }
  }

  public startAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      // Low-pass filter for cozy warm analog vibe
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);

      this.ambientGain.connect(filter);
      filter.connect(this.ctx.destination);

      // Warm Maj7th soothing drone chords: F#3, A#3, C#4, F4
      const chord = [185.0, 233.08, 277.18, 349.23];
      this.ambientOscillators = chord.map((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        osc.connect(this.ambientGain!);
        osc.start();
        return osc;
      });

      this.isAmbientPlaying = true;
    } catch {
      // Catch
    }
  }

  public stopAmbient() {
    if (!this.isAmbientPlaying) return;
    try {
      this.ambientOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // already stopped
        }
      });
      this.ambientOscillators = [];
      this.ambientGain?.disconnect();
      this.isAmbientPlaying = false;
    } catch {
      // Catch
    }
  }
}

export const sound = new SoundController();
