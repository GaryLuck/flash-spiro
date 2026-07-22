/**
 * Web Audio API Audio Synthesizer
 * Generates realistic gear clicking & pen friction sound effects procedurally without audio asset files.
 */

export class AudioSynthesizer {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleAudio() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Play short crisp gear tooth click sound
   */
  playGearClick() {
    if (!this.enabled) return;
    this.init();

    const now = this.audioCtx.currentTime;
    if (now - this.lastTickTime < 0.04) return; // Throttle ticks
    this.lastTickTime = now;

    // Short high-frequency burst for plastic gear tooth click
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.015);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  }

  /**
   * Play subtle pen friction noise during continuous drawing
   */
  playPenScratch() {
    if (!this.enabled) return;
    this.init();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 100, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }
}
