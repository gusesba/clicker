import { createGameStore } from '../store/gameStore';
import { GameEngine } from '../game/engine/GameEngine';
import { SaveManager } from '../persistence/SaveManager';
import { AudioManager } from '../audio/AudioManager';

export function createRuntime() {
  const saves = new SaveManager({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) });
  const loaded = saves.load();
  const store = createGameStore(loaded.data);
  store.setState({ saveStatus: loaded.status });
  const engine = new GameEngine(store);
  let audio: AudioManager | undefined;
  const unlock = () => { audio ??= new AudioManager(engine); audio.unlock(); };
  let writing = false;
  const persist = () => {
    if (writing) return;
    writing = true;
    const success = saves.save(engine.snapshot());
    if (!success && store.getState().saveStatus !== 'protected') store.setState({ saveStatus: 'unavailable' });
    writing = false;
  };
  const stop = store.subscribe((state, previous) => {
    if (state.hp !== previous.hp || state.gold !== previous.gold || state.stage !== previous.stage || state.defeated !== previous.defeated || state.level !== previous.level || state.preferences !== previous.preferences) persist();
  });
  const visibility = () => { if (document.visibilityState === 'hidden') persist(); };
  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', visibility);
  return {
    store, engine,
    attack: () => { unlock(); return engine.attack(); },
    purchase: () => { unlock(); return engine.purchase(); },
    destroy: () => {
      persist(); stop(); engine.destroy(); audio?.destroy();
      window.removeEventListener('pagehide', persist);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}

export type Runtime = ReturnType<typeof createRuntime>;
