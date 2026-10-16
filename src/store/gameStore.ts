import { createStore } from 'zustand/vanilla';
import type { GameState, Preferences, SaveData } from '../game/engine/types';
import { healthFor } from '../game/config/balance';

export const defaultPreferences: Preferences = { muted: false, volume: 0.45, reducedMotion: false };
export const freshSave = (): SaveData => ({
  version: 1,
  progress: { stage: 1, defeated: 0, gold: '0', level: 0, hp: healthFor(1).toString() },
  preferences: { ...defaultPreferences },
});

export function createGameStore(save = freshSave()) {
  return createStore<GameState>()(() => ({
    ...save.progress,
    preferences: save.preferences,
    status: 'ready',
    saveStatus: 'saved',
  }));
}

export type GameStore = ReturnType<typeof createGameStore>;
