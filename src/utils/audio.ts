// Web Audio API Synthesizer for subtle clinical telemetry and confirmation

class SoundEffectsManager {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Heartbeat / ECG monitor blip
  public playHeartbeat() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Audio playback might be prevented before user interaction
    }
  }

  // Bed Reserved Confirmation Chime
  public playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
      });
    } catch {
      // ignore
    }
  }

  private sirenTimer: number | null = null;
  private sirenNodes: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null;

  /**
   * 15-second authentic dual-tone modulating emergency hospital trauma siren.
   * Plays immediately when an incoming patient reserves a bed/bay at the hospital.
   * Automatically stops after durationSeconds (default 15s) or via stopEmergencySiren().
   */
  public playEmergencySiren(durationSeconds = 15): () => void {
    try {
      this.stopEmergencySiren();
      this.initContext();
      if (!this.ctx) return () => {};

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const masterGain = this.ctx.createGain();

      // Authentic emergency trauma wail: modulated dual-tone between 650Hz and 950Hz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(780, now);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.7, now); // ~1.4s complete wail cycle
      lfoGain.gain.setValueAtTime(170, now); // swing +/- 170Hz

      lfo.connect(osc.frequency);

      // Volume envelope: smooth fade-in, steady presence, smooth fade-out
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.25, now + 0.35);
      masterGain.gain.setValueAtTime(0.25, now + Math.max(0.4, durationSeconds - 0.5));
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + durationSeconds);
      lfo.stop(now + durationSeconds);

      this.sirenNodes = { osc, lfo, gain: masterGain };

      this.sirenTimer = window.setTimeout(() => {
        this.sirenNodes = null;
        this.sirenTimer = null;
      }, durationSeconds * 1000);

      return () => this.stopEmergencySiren();
    } catch {
      return () => {};
    }
  }

  public stopEmergencySiren() {
    if (this.sirenTimer) {
      window.clearTimeout(this.sirenTimer);
      this.sirenTimer = null;
    }
    if (this.sirenNodes && this.ctx) {
      try {
        this.sirenNodes.gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.sirenNodes.osc.stop();
        this.sirenNodes.lfo.stop();
      } catch {
        // ignore
      }
      this.sirenNodes = null;
    }
  }

  // Legacy compatibility
  public toggleAmbulanceSiren(enable: boolean) {
    if (enable) {
      this.playEmergencySiren(15);
    } else {
      this.stopEmergencySiren();
    }
  }
}

export const soundEffects = new SoundEffectsManager();

export { 
  speakText, 
  stopSpeaking, 
  isSpeaking, 
  startVoiceSos, 
  stopVoiceSos, 
  isSpeechRecognitionSupported, 
  isSpeechSynthesisSupported 
} from './speechService';

