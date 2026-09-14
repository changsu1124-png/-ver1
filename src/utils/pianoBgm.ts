// Real Acoustic Grand Piano BGM Engine & Procedural Fallback
// 100% Free of Copyright / Public Domain (CC0 / Musopen) Studio Recordings

export type TrackId = 'satie' | 'debussy' | 'synth';

export interface PianoTrack {
  id: TrackId;
  title: string;
  composer: string;
  badge: string;
  description: string;
  audioSources?: string[];
}

export const PIANO_TRACKS: PianoTrack[] = [
  {
    id: 'satie',
    title: '짐노페디 1번 (Gymnopédie No.1)',
    composer: '에릭 사티 (연주: Robin Alciatore)',
    badge: '실제 피아노 녹음',
    description: '따뜻하고 몽환적인 그랜드 피아노 어쿠스틱 연주 (저작권 무료 · CC0)',
    audioSources: ['/audio/piano_bgm.mp3', '/audio/piano_bgm.ogg'],
  },
  {
    id: 'debussy',
    title: '달빛 (Clair de Lune)',
    composer: '클로드 드뷔시',
    badge: '실제 피아노 녹음',
    description: '서정적이고 맑은 어쿠스틱 피아노 명곡 (저작권 무료 · 퍼블릭 도메인)',
    audioSources: ['/audio/clair_de_lune.mp3', '/audio/clair_de_lune.ogg'],
  },
  {
    id: 'synth',
    title: '온정초 피아노 오르골',
    composer: '자체 사운드 엔진',
    badge: '신스 피아노',
    description: 'Web Audio API로 실시간 연주되는 부드러운 화음 멜로디',
  },
];

type BgmListener = (playing: boolean, trackId: TrackId) => void;

class RealPianoAudioEngine {
  private isPlaying: boolean = false;
  private volume: number = 0.55;
  private currentTrackId: TrackId = 'satie';
  private audioElement: HTMLAudioElement | null = null;
  private listeners: Set<BgmListener> = new Set();

  // Procedural Synth Fallback Engine
  private synthCtx: AudioContext | null = null;
  private synthTimerId: number | null = null;
  private synthMasterGain: GainNode | null = null;

  constructor() {
    // Lazy audio element setup on browser
  }

  private getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume;

      this.audioElement.addEventListener('ended', () => {
        if (this.isPlaying && this.audioElement) {
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch(() => {});
        }
      });
    }
    return this.audioElement;
  }

  // Plays a real acoustic recording
  private playRecordedTrack(track: PianoTrack) {
    this.stopSynth();
    const audio = this.getAudioElement();
    audio.volume = this.volume;

    const sources = track.audioSources || [];
    if (sources.length > 0) {
      // Pick first compatible or default source
      const currentSrc = audio.src;
      const targetSrc = sources[0];
      if (!currentSrc || !currentSrc.endsWith(targetSrc)) {
        audio.src = targetSrc;
      }
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn('Real piano audio play error, trying fallback:', err);
        // If primary file fails, try second source or synth
        if (sources.length > 1) {
          audio.src = sources[1];
          audio.play().catch(() => this.startSynth());
        } else {
          this.startSynth();
        }
      });
    }
  }

  // Web Audio Synth implementation as seamless backup & alternate option
  private initSynthContext() {
    if (!this.synthCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.synthCtx = new AudioCtx();
      this.synthMasterGain = this.synthCtx.createGain();
      this.synthMasterGain.gain.setValueAtTime(this.volume, this.synthCtx.currentTime);
      this.synthMasterGain.connect(this.synthCtx.destination);
    }
    if (this.synthCtx.state === 'suspended') {
      this.synthCtx.resume();
    }
  }

  private playSynthNote(freq: number, startTime: number, duration: number, velocity: number) {
    if (!this.synthCtx || !this.synthMasterGain) return;
    const osc = this.synthCtx.createOscillator();
    const gain = this.synthCtx.createGain();
    const filter = this.synthCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(2400, freq * 3.5), startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

    const peak = velocity * 0.25;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(peak * 0.4, startTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthMasterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private startSynth() {
    this.initSynthContext();
    if (!this.synthCtx) return;

    const notes = [60, 64, 67, 71, 72, 69, 67, 64, 62, 65, 69, 72];
    const tempo = 72;
    const beatSec = 60 / tempo;
    const now = this.synthCtx.currentTime + 0.1;

    notes.forEach((m, idx) => {
      const freq = 440 * Math.pow(2, (m - 69) / 12);
      this.playSynthNote(freq, now + idx * beatSec, 2.5, 0.4);
    });

    const loopMs = notes.length * beatSec * 1000;
    this.synthTimerId = window.setTimeout(() => {
      if (this.isPlaying && this.currentTrackId === 'synth') {
        this.startSynth();
      }
    }, loopMs - 150);
  }

  private stopSynth() {
    if (this.synthTimerId) {
      clearTimeout(this.synthTimerId);
      this.synthTimerId = null;
    }
  }

  public start() {
    this.isPlaying = true;
    const track = PIANO_TRACKS.find((t) => t.id === this.currentTrackId) || PIANO_TRACKS[0];

    if (track.id === 'synth') {
      if (this.audioElement) this.audioElement.pause();
      this.startSynth();
    } else {
      this.playRecordedTrack(track);
    }

    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynth();
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public setTrack(trackId: TrackId) {
    if (this.currentTrackId === trackId) return;
    this.currentTrackId = trackId;

    if (this.isPlaying) {
      this.start();
    } else {
      this.notify();
    }
  }

  public getCurrentTrack(): PianoTrack {
    return PIANO_TRACKS.find((t) => t.id === this.currentTrackId) || PIANO_TRACKS[0];
  }

  public getTracks(): PianoTrack[] {
    return PIANO_TRACKS;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.synthMasterGain && this.synthCtx) {
      this.synthMasterGain.gain.setValueAtTime(this.volume, this.synthCtx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): TrackId {
    return this.currentTrackId;
  }

  public subscribe(cb: BgmListener): () => void {
    this.listeners.add(cb);
    // Initial notification
    cb(this.isPlaying, this.currentTrackId);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying, this.currentTrackId));
  }
}

export const pianoBgm = new RealPianoAudioEngine();
