/**
 * Web Audio Engine for Karen The Computer
 * Handles procedural sound effects, audio visualizer analysis, and robotic speech
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.75;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentAudioElement) {
      this.currentAudioElement.pause();
    }
    if (muted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  // Play procedural terminal computer blip
  public playBlip(freq = 880, duration = 0.05, type: OscillatorType = 'sine') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.analyser) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext policy suppression safe
    }
  }

  // Chum Bucket Relay Switch Clack
  public playRelayClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.analyser) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // CRT Screen Glass Poke / Electrostatic Tap Sound
  public playPoke() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.analyser) return;

      // 1. High-frequency glass surface tap
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2400, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.08);
      gain1.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.analyser);

      // 2. Electrostatic phosphor discharge zap
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(190, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc2.connect(gain2);
      gain2.connect(this.analyser);

      this.analyser.connect(this.ctx.destination);

      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.08);
      osc2.start();
      osc2.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  // Heartbeat pulse for Karen's affectionate mode
  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.analyser) return;

      const playThump = (delay: number, pitch: number) => {
        if (!this.ctx || !this.analyser) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = this.ctx.currentTime + delay;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain);
        gain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
      };

      playThump(0, 95);
      playThump(0.14, 75);
    } catch {}
  }

  // Evil scheme dramatic musical sting
  public playEvilSting() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.analyser) return;

      const notes = [220, 261.63, 311.13, 440]; // Diminished spooky chords
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.analyser) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.08;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.45);
      });
    } catch {}
  }

  // Boot up CRT hum & chime
  public playBoot() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.analyser) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch {}
  }

  // Play audio from base64 WAV returned by Gemini TTS
  public async playBase64Wav(base64Data: string, onEnd?: () => void): Promise<void> {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.initContext();
      const audioUrl = `data:audio/wav;base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      if (this.ctx && this.analyser) {
        try {
          const source = this.ctx.createMediaElementSource(audio);
          source.connect(this.analyser);
          this.analyser.connect(this.ctx.destination);
        } catch {
          // Source already connected or restricted
        }
      }

      audio.onended = () => {
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      await audio.play();
    } catch (err) {
      console.warn('WAV playback failed, ending turn:', err);
      if (onEnd) onEnd();
    }
  }

  // Fallback to Web Speech Synthesis with cute youthful female voice
  public speakBrowserSpeech(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.isMuted || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose strictly sweet, cute, youthful female voice
    const voices = window.speechSynthesis.getVoices();
    const femalePriorityNames = [
      'Samantha',
      'Ava',
      'Allison',
      'Victoria',
      'Jenny',
      'Aria',
      'Karen',
      'Zira',
      'Google US English',
      'Moira',
      'Tessa',
      'Siri',
    ];

    const isExplicitMale = (name: string) => {
      const lower = name.toLowerCase();
      return lower.includes('male') || lower.includes('david') || lower.includes('george') || lower.includes('guy') || lower.includes('mark') || lower.includes('daniel');
    };

    let chosenVoice = voices.find((v) => 
      femalePriorityNames.some((n) => v.name.includes(n)) && v.lang.startsWith('en') && !isExplicitMale(v.name)
    );

    if (!chosenVoice) {
      chosenVoice = voices.find((v) => 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman')) && 
        v.lang.startsWith('en') && 
        !isExplicitMale(v.name)
      );
    }

    if (!chosenVoice) {
      chosenVoice = voices.find((v) => v.lang.startsWith('en') && !isExplicitMale(v.name)) || voices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Youthful, cute, bright pitch and lively natural tempo
    utterance.pitch = 1.34;
    utterance.rate = 1.02;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
