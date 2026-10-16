import { Decimal } from 'decimal.js';
import { healthFor, stageGoal } from '../game/config/balance';
import type { SaveData, GameState } from '../game/engine/types';
import { freshSave } from '../store/gameStore';

export const SAVE_KEY = 'wildbound.save';
export const RECOVERY_KEY = 'wildbound.save.recovery';
type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;

export function validateSave(value: unknown): value is SaveData {
  if (!value || typeof value !== 'object') return false;
  const data = value as SaveData;
  if (data.version !== 1 || !data.progress || !data.preferences) return false;
  const { stage, defeated, gold, level, hp } = data.progress;
  const prefs = data.preferences;
  if (!Number.isSafeInteger(stage) || stage < 1 || stage >= Number.MAX_SAFE_INTEGER || !Number.isSafeInteger(level) || level < 0 || level >= Number.MAX_SAFE_INTEGER) return false;
  if (!Number.isInteger(defeated) || defeated < 0 || defeated >= stageGoal(stage)) return false;
  if (typeof gold !== 'string' || typeof hp !== 'string' || gold.length > 128 || hp.length > 128) return false;
  if (typeof prefs.muted !== 'boolean' || typeof prefs.reducedMotion !== 'boolean' || typeof prefs.volume !== 'number' || !Number.isFinite(prefs.volume) || prefs.volume < 0 || prefs.volume > 1) return false;
  try {
    const g = new Decimal(gold), h = new Decimal(hp);
    return g.isFinite() && g.gte(0) && h.isFinite() && h.gt(0) && h.lte(healthFor(stage));
  } catch {
    return false;
  }
}

export class SaveManager {
  private writable = true;
  constructor(private storage: StorageAdapter) {}

  load(): { data: SaveData; status: GameState['saveStatus'] } {
    const initial = freshSave();
    if (typeof matchMedia !== 'undefined') initial.preferences.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      const raw = this.storage.getItem(SAVE_KEY);
      if (raw === null) return { data: initial, status: 'saved' };
      let parsed: unknown;
      try { parsed = JSON.parse(raw); } catch { parsed = null; }
      if (validateSave(parsed)) return { data: parsed, status: 'saved' };
      // Não sobrescrever saves de versões futuras: podem conter progresso válido.
      if (parsed && typeof parsed === 'object' && 'version' in parsed && typeof parsed.version === 'number' && parsed.version > 1) {
        this.writable = false;
        return { data: initial, status: 'protected' };
      }
      this.storage.setItem(RECOVERY_KEY, raw);
      return { data: initial, status: 'recovered' };
    } catch {
      this.writable = false;
      return { data: initial, status: 'unavailable' };
    }
  }

  save(data: SaveData): boolean {
    if (!this.writable) return false;
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
}
