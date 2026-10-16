import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import { GameEngine } from '../src/game/engine/GameEngine';
import { createGameStore, freshSave } from '../src/store/gameStore';
import { costFor, damageFor, healthFor, rewardFor } from '../src/game/config/balance';
import { RECOVERY_KEY, SAVE_KEY, SaveManager, validateSave } from '../src/persistence/SaveManager';
import type { GameEvent } from '../src/game/engine/types';

describe('combate e economia', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('processa cliques rápidos e recompensa cada encontro uma única vez', () => {
    const store = createGameStore(), engine = new GameEngine(store);
    const events: GameEvent[] = [];
    engine.subscribe(e => events.push(e));
    for (let i = 0; i < 100; i++) engine.attack();
    expect(store.getState().hp).toBe('0');
    expect(store.getState().gold).toBe('8');
    expect(events.filter(e => e.type === 'enemy:damaged')).toHaveLength(6);
    expect(events.filter(e => e.type === 'enemy:defeated')).toHaveLength(1);
    vi.advanceTimersByTime(260);
    expect(store.getState().defeated).toBe(1);
    expect(store.getState().hp).toBe('30');
    engine.destroy();
  });

  it('permite comprar com saldo exato e rejeita compras consecutivas sem gold', () => {
    const save = freshSave(); save.progress.gold = '20';
    const store = createGameStore(save), engine = new GameEngine(store);
    expect(engine.purchase()).toBe(true);
    expect(store.getState().gold).toBe('0');
    expect(damageFor(store.getState().level).toString()).toBe('6');
    expect(costFor(store.getState().level).toString()).toBe('25');
    expect(engine.purchase()).toBe(false);
    expect(store.getState().level).toBe(1);
    engine.destroy();
  });

  it('avança da fase 9 para um único boss na 10, depois para a fase 11', () => {
    const save = freshSave();
    save.progress = { stage: 9, defeated: 4, level: 0, gold: '0', hp: '1' };
    const store = createGameStore(save), engine = new GameEngine(store);
    const events: GameEvent[] = []; engine.subscribe(e => events.push(e));
    engine.attack(); vi.advanceTimersByTime(260);
    expect(store.getState().stage).toBe(10);
    expect(store.getState().defeated).toBe(0);
    expect(store.getState().hp).toBe(healthFor(10).toString());
    expect(events.filter(e => e.type === 'boss:spawned')).toHaveLength(1);
    const before = store.getState().gold;
    store.setState({ hp: '1' }); engine.attack();
    expect(new Decimal(store.getState().gold).sub(before).eq(rewardFor(10))).toBe(true);
    vi.advanceTimersByTime(260);
    expect(store.getState().stage).toBe(11);
    expect(events.filter(e => e.type === 'boss:defeated')).toHaveLength(1);
    engine.destroy();
  });

  it('salva a morte já liquidada e não repete a recompensa após recarga', () => {
    const save = freshSave(); save.progress.hp = '1';
    const engine = new GameEngine(createGameStore(save));
    engine.attack();
    const snapshot = engine.snapshot();
    expect(snapshot.progress.gold).toBe('8');
    expect(snapshot.progress.defeated).toBe(1);
    expect(snapshot.progress.hp).toBe('30');
    expect(validateSave(snapshot)).toBe(true);
    const restored = new GameEngine(createGameStore(snapshot));
    expect(restored.store.getState().gold).toBe('8');
    restored.attack();
    expect(restored.store.getState().gold).toBe('8');
    expect(restored.store.getState().hp).toBe('25');
    engine.destroy(); restored.destroy();
  });

  it('mantém compras realizadas durante a transição e cancela timers ao encerrar', () => {
    const save = freshSave(); save.progress.gold = '20'; save.progress.hp = '1';
    const store = createGameStore(save), engine = new GameEngine(store);
    engine.attack(); engine.purchase(); vi.advanceTimersByTime(260);
    expect(store.getState().gold).toBe('8'); expect(store.getState().level).toBe(1);
    store.setState({ hp: '1' }); engine.attack(); engine.destroy();
    vi.advanceTimersByTime(1000);
    expect(store.getState().defeated).toBe(1);
  });

  it('mantém valores finitos em fases e upgrades além do alcance de Number', () => {
    expect(healthFor(10000).isFinite()).toBe(true);
    expect(rewardFor(10000).isFinite()).toBe(true);
    expect(damageFor(10000).isFinite()).toBe(true);
    expect(costFor(10000).isFinite()).toBe(true);
    expect(healthFor(10000).gt('1e308')).toBe(true);
  });
});

describe('persistência', () => {
  const memory = () => {
    const values = new Map<string, string>();
    return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  };

  it('restaura vida parcial e preferências', () => {
    const storage = memory(), saves = new SaveManager(storage), data = freshSave();
    data.progress.hp = '17.5'; data.preferences = { muted: true, volume: .2, reducedMotion: true };
    expect(saves.save(data)).toBe(true);
    expect(saves.load().data).toEqual(data);
  });

  it('preserva JSON inválido antes de iniciar um save válido', () => {
    const storage = memory(); storage.setItem(SAVE_KEY, '{invalid');
    const saves = new SaveManager(storage), result = saves.load();
    expect(result.status).toBe('recovered');
    expect(storage.getItem(RECOVERY_KEY)).toBe('{invalid');
    expect(validateSave(result.data)).toBe(true);
    saves.save(result.data);
    expect(JSON.parse(storage.getItem(SAVE_KEY)!)).toEqual(result.data);
  });

  it('rejeita valores negativos, não finitos, fases e progresso incoerentes', () => {
    for (const patch of [{ gold: '-1' }, { hp: 'NaN' }, { hp: '31' }, { stage: 0 }, { level: 1.5 }, { defeated: 5 }, { gold: 'Infinity' }]) {
      const data = freshSave(); Object.assign(data.progress, patch);
      expect(validateSave(data)).toBe(false);
    }
  });

  it('não sobrescreve uma versão futura', () => {
    const storage = memory(); storage.setItem(SAVE_KEY, '{"version":2,"future":"progress"}');
    const saves = new SaveManager(storage);
    expect(saves.load().status).toBe('protected');
    expect(saves.save(freshSave())).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toContain('"version":2');
  });

  it('continua utilizável quando o armazenamento lança erro', () => {
    const saves = new SaveManager({ getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
    const result = saves.load();
    expect(result.status).toBe('unavailable');
    expect(validateSave(result.data)).toBe(true);
    expect(saves.save(result.data)).toBe(false);
  });
});
