import { Decimal } from 'decimal.js';

Decimal.set({ precision: 32 });

export const balance = {
  enemiesPerStage: 5,
  bossInterval: 10,
  baseDamage: 5,
  damageGrowth: 1.2,
  baseHealth: 30,
  healthGrowth: 1.18,
  baseReward: 8,
  rewardGrowth: 1.15,
  baseCost: 20,
  costGrowth: 1.22,
  bossHealth: 6,
  bossReward: 5,
  transitionMs: 260,
} as const;

export const isBoss = (stage: number) => stage % balance.bossInterval === 0;
export const stageGoal = (stage: number) => isBoss(stage) ? 1 : balance.enemiesPerStage;
export const healthFor = (stage: number) => new Decimal(balance.healthGrowth).pow(stage - 1).mul(balance.baseHealth).mul(isBoss(stage) ? balance.bossHealth : 1).ceil();
export const rewardFor = (stage: number) => new Decimal(balance.rewardGrowth).pow(stage - 1).mul(balance.baseReward).mul(isBoss(stage) ? balance.bossReward : 1).ceil();
export const damageFor = (level: number) => new Decimal(balance.damageGrowth).pow(level).mul(balance.baseDamage).toDecimalPlaces(2);
export const costFor = (level: number) => new Decimal(balance.costGrowth).pow(level).mul(balance.baseCost).ceil();

const names = ['Broto travesso', 'Cogumelo errante', 'Pedrinha ancestral'];
export const enemyVariant = (stage: number, defeated: number) => (stage - 1 + defeated) % names.length;
export const enemyName = (stage: number, defeated: number) => isBoss(stage) ? 'Ancião das raízes' : names[enemyVariant(stage, defeated)];

export function formatNumber(value: Decimal.Value): string {
  const n = new Decimal(value);
  const suffixes = ['', 'mil', 'mi', 'bi', 'tri'];
  if (n.abs().lt(1000)) return n.toDecimalPlaces(2).toNumber().toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const group = Math.floor(n.e / 3);
  if (group < suffixes.length) return `${n.div(new Decimal(1000).pow(group)).toDecimalPlaces(1).toNumber().toLocaleString('pt-BR')} ${suffixes[group]}`;
  return n.toExponential(2).replace('.', ',');
}
