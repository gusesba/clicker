export interface Preferences {
  muted: boolean;
  volume: number;
  reducedMotion: boolean;
}

export interface Progress {
  stage: number;
  defeated: number;
  gold: string;
  level: number;
  hp: string;
}

export interface GameState extends Progress {
  status: 'ready' | 'transition';
  preferences: Preferences;
  saveStatus: 'saved' | 'unavailable' | 'recovered' | 'protected';
}

export interface SaveData {
  version: 1;
  progress: Progress;
  preferences: Preferences;
}

export type GameEvent =
  | { type: 'enemy:damaged'; damage: string; final: boolean; boss: boolean }
  | { type: 'enemy:defeated'; boss: boolean }
  | { type: 'gold:earned'; amount: string; boss: boolean }
  | { type: 'upgrade:purchased'; level: number; damage: string }
  | { type: 'stage:completed'; stage: number }
  | { type: 'stage:started'; stage: number }
  | { type: 'boss:spawned'; stage: number }
  | { type: 'boss:defeated'; stage: number };
