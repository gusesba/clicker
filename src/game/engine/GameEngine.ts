import { Decimal } from 'decimal.js';
import type { GameStore } from '../../store/gameStore';
import type { GameEvent, Preferences, Progress, SaveData } from './types';
import { balance, costFor, damageFor, healthFor, isBoss, rewardFor, stageGoal } from '../config/balance';

export class GameEngine {
  private listeners = new Set<(event: GameEvent) => void>();
  private transition: ReturnType<typeof setTimeout> | undefined;

  constructor(readonly store: GameStore) {}

  subscribe(listener: (event: GameEvent) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit(event: GameEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  attack() {
    const state = this.store.getState();
    if (state.status !== 'ready') return false;
    const damage = damageFor(state.level);
    const hp = Decimal.max(0, new Decimal(state.hp).sub(damage));
    const final = hp.isZero();
    const boss = isBoss(state.stage);
    const reward = rewardFor(state.stage);
    this.store.setState({
      hp: hp.toString(),
      status: final ? 'transition' : 'ready',
      gold: final ? new Decimal(state.gold).add(reward).toString() : state.gold,
    });
    this.emit({ type: 'enemy:damaged', damage: damage.toString(), final, boss });
    if (final) {
      this.emit({ type: 'enemy:defeated', boss });
      this.emit({ type: 'gold:earned', amount: reward.toString(), boss });
      if (boss) this.emit({ type: 'boss:defeated', stage: state.stage });
      this.transition = setTimeout(() => this.spawnNext(), balance.transitionMs);
    }
    return true;
  }

  private nextProgress(): Progress {
    const state = this.store.getState();
    const complete = state.defeated + 1 >= stageGoal(state.stage);
    const stage = complete ? Math.min(Number.MAX_SAFE_INTEGER - 1, state.stage + 1) : state.stage;
    return { stage, defeated: complete ? 0 : state.defeated + 1, gold: state.gold, level: state.level, hp: healthFor(stage).toString() };
  }

  private spawnNext() {
    this.transition = undefined;
    const previous = this.store.getState().stage;
    const next = this.nextProgress();
    this.store.setState({ ...next, status: 'ready' });
    if (next.stage !== previous) {
      this.emit({ type: 'stage:completed', stage: previous });
      this.emit({ type: 'stage:started', stage: next.stage });
      if (isBoss(next.stage)) this.emit({ type: 'boss:spawned', stage: next.stage });
    }
  }

  purchase() {
    const state = this.store.getState();
    const cost = costFor(state.level);
    if (new Decimal(state.gold).lt(cost) || state.level >= Number.MAX_SAFE_INTEGER - 1) return false;
    const level = state.level + 1;
    this.store.setState({ gold: new Decimal(state.gold).sub(cost).toString(), level });
    this.emit({ type: 'upgrade:purchased', level, damage: damageFor(level).toString() });
    return true;
  }

  setPreferences(update: Partial<Preferences>) {
    this.store.setState(state => ({ preferences: { ...state.preferences, ...update } }));
  }

  snapshot(): SaveData {
    const state = this.store.getState();
    const progress = state.status === 'transition' ? this.nextProgress() : {
      stage: state.stage, defeated: state.defeated, gold: state.gold, level: state.level, hp: state.hp,
    };
    return { version: 1, progress, preferences: { ...state.preferences } };
  }

  destroy() {
    clearTimeout(this.transition);
    this.listeners.clear();
  }
}
