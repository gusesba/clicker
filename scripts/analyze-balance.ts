import { Decimal } from 'decimal.js';
import { costFor, damageFor, healthFor, rewardFor, stageGoal } from '../src/game/config/balance.ts';

let gold = new Decimal(0), totalClicks = new Decimal(0), level = 0, kills = 0;
const results: Record<string, string | number>[] = [];
for (let stage = 1; stage <= 100; stage++) {
  let stageClicks = new Decimal(0);
  for (let enemy = 0; enemy < stageGoal(stage); enemy++) {
    const clicks = healthFor(stage).div(damageFor(level)).ceil();
    stageClicks = stageClicks.add(clicks); totalClicks = totalClicks.add(clicks); kills++;
    gold = gold.add(rewardFor(stage));
    while (gold.gte(costFor(level))) {
      gold = gold.sub(costFor(level)); level++;
    }
    if (level === 1 && kills === 3) console.log(`Primeira compra: ${totalClicks} cliques, ${kills} derrotas, ${gold} gold restante.`);
  }
  if ([1, 5, 9, 10, 11, 20, 50, 100].includes(stage)) results.push({
    fase: stage, vida: healthFor(stage).toString(), goldPorAlvo: rewardFor(stage).toString(),
    cliquesNaFase: stageClicks.toString(), cliquesAcumulados: totalClicks.toString(), nivelAposFase: level, danoAposFase: damageFor(level).toString(),
  });
}
console.log('Simulação: compra imediata após cada derrota, sem compras durante um encontro; nenhum tempo humano presumido.');
console.table(results);
