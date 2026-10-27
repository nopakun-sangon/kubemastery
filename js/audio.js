/**
 * EngMastery: Audio Sound Synthesis Engine
 * Uses the Web Audio API to generate pleasant, instant sound effects
 * Zero external asset dependencies - works offline and instantly!
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.userInteracted = false;
    this.loadSetting();
    this.setupGestureUnlock();
  }

  setupGestureUnlock() {
    if (typeof window === "undefined") return;
    const unlock = () => {
      this.userInteracted = true;
      if (!this.ctx) {
        this.initContext();
      } else if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  loadSetting() {
    const saved = localStorage.getItem("engmastery_sfx_enabled");
    if (saved !== null) {
      this.enabled = saved === "true";
    }
  }

  toggle(enabled) {
    this.enabled = enabled !== undefined ? enabled : !this.enabled;
    localStorage.setItem("engmastery_sfx_enabled", this.enabled);
    return this.enabled;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended" && this.userInteracted) {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || this.ctx.state === "suspended") return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Pleasant ascending chime for correct answers
  playCorrect() {
    if (!this.enabled) return;
    this.initContext();
    this.playTone(523.25, "sine", 0.15, 0, 0.18);      // C5
    this.playTone(659.25, "sine", 0.15, 0.08, 0.2);     // E5
    this.playTone(783.99, "sine", 0.28, 0.16, 0.22);    // G5
  }

  playSuccess() {
    this.playCorrect();
  }

  // Gentle low tone for incorrect answers
  playIncorrect() {
    if (!this.enabled) return;
    this.initContext();
    this.playTone(260, "sawtooth", 0.18, 0, 0.12);
    this.playTone(220, "sawtooth", 0.28, 0.1, 0.14);
  }

  playError() {
    this.playIncorrect();
  }

  // Subtle tap sound for buttons / card flips
  playClick() {
    if (!this.enabled) return;
    this.initContext();
    this.playTone(600, "sine", 0.04, 0, 0.08);
  }

  // Card flip swoosh
  playFlip() {
    if (!this.enabled) return;
    this.initContext();
    this.playTone(400, "triangle", 0.08, 0, 0.06);
    this.playTone(800, "sine", 0.08, 0.04, 0.06);
  }

  // Victory fanfare on lesson / level / capstone completion
  playVictory() {
    if (!this.enabled) return;
    this.initContext();
    const notes = [
      { f: 523.25, t: 0, d: 0.12 },     // C5
      { f: 659.25, t: 0.12, d: 0.12 },  // E5
      { f: 783.99, t: 0.24, d: 0.14 },  // G5
      { f: 1046.50, t: 0.38, d: 0.45 }  // C6
    ];
    notes.forEach(n => this.playTone(n.f, "triangle", n.d, n.t, 0.22));
  }
}

window.soundFx = new SoundEffects();

