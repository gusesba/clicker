import { Howl, Howler } from 'howler';
import type { GameEngine } from '../game/engine/GameEngine';
import { presentation } from '../game/config/presentation';

function tone(notes: number[], duration: number, noise = false): string {
  const rate = 22050, length = Math.floor(rate * duration);
  const bytes = new Uint8Array(44 + length * 2), view = new DataView(bytes.buffer);
  const text = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, length * 2, true);
  for (let i = 0; i < length; i++) {
    const t = i / rate, progress = i / length;
    const envelope = Math.min(1, t * 150) * Math.pow(1 - progress, 2.5);
    const pitch = notes[Math.min(notes.length - 1, Math.floor(progress * notes.length))];
    const wave = Math.sin(2 * Math.PI * pitch * t) * .6 + Math.sin(2 * Math.PI * pitch * 2 * t) * .16 + (noise ? (Math.random() - .5) * .5 : 0);
    view.setInt16(44 + i * 2, wave * envelope * 15000, true);
  }
  return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
}

export class AudioManager {
  private sounds: Record<string, Howl>;
  private stopEvents: () => void;
  private stopStore: () => void;
  private lastHit = 0;

  constructor(engine: GameEngine) {
    this.sounds = Object.fromEntries(Object.entries({
      hit: tone([210, 140], .1, true), death: tone([220, 160, 110], .22, true),
      gold: tone([880, 1320], .19), upgrade: tone([392, 494, 587, 784], .4),
      stage: tone([523, 659, 784], .36), boss: tone([110, 147, 165], .5),
      victory: tone([392, 523, 659, 784], .5),
    }).map(([key, src]) => [key, new Howl({ src: [src], format: ['wav'], volume: .65, preload: true })]));
    const sync = () => {
      const prefs = engine.store.getState().preferences;
      Howler.volume(prefs.volume);
      Howler.mute(prefs.muted);
    };
    sync();
    this.stopStore = engine.store.subscribe(sync);
    this.stopEvents = engine.subscribe(event => {
      if (engine.store.getState().preferences.muted) return;
      if (event.type === 'enemy:damaged') {
        if (performance.now() - this.lastHit < 45) return;
        this.lastHit = performance.now();
        this.play(event.final ? 'death' : 'hit', true);
      }
      if (event.type === 'gold:earned') this.play('gold');
      if (event.type === 'upgrade:purchased') this.play('upgrade');
      if (event.type === 'stage:started') this.play('stage');
      if (event.type === 'boss:spawned') this.play('boss');
      if (event.type === 'boss:defeated') this.play('victory');
    });
  }

  unlock() { void Howler.ctx?.resume(); }

  private play(name: string, varied = false) {
    if (Object.values(this.sounds).reduce((count, sound) => count + (sound.playing() ? 1 : 0), 0) >= presentation.limits.sounds) return;
    const sound = this.sounds[name];
    sound.rate(varied ? .94 + Math.random() * .12 : 1);
    if (!sound.playing()) sound.play();
  }

  destroy() {
    this.stopEvents(); this.stopStore();
    Object.values(this.sounds).forEach(sound => sound.unload());
  }
}
