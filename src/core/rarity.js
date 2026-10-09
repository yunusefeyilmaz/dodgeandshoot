import { state } from './state.js';
import { stat } from './stats.js';
// 9 nadirlik kademesi. Temel ağırlıklar çok düşük başlar; her kademe, "şans bonusu" arttıkça kademesiyle üstel büyür:
//   ağırlık = temel * (1 + bonus*0.18)^kademe        bonus = luck + 0.3*tur + 1.5*(bu koşuda yenilen boss) [+ olaya özel bonus]
const T = [
  ['common', 'Yaygın', '#9aa3b5', 100],
  ['uncommon', 'Yaygın Olmayan', '#7ed07e', 45],
  ['rare', 'Nadir', '#4aa3ff', 15],
  ['epic', 'Destansı', '#b86bff', 3],
  ['mythic', 'Mitik', '#ff5fd2', 0.4],
  ['legendary', 'Efsanevi', '#ffb020', 0.05],
  ['ancient', 'Kadim', '#c08a4a', 0.008],
  ['divine', 'İlahi', '#fff0a0', 0.002],
  ['cosmic', 'Kozmik', '#6f5bff', 0.001],
];
export const RARITIES = {};
T.forEach(
  ([id, name, col, w], i) =>
    (RARITIES[id] = {
      id,
      name,
      col,
      tier: i,
      w,
      sell: Math.round(5 * Math.pow(1.7, i)),
    }),
);
export const TIERS = T.map((t) => t[0]);
const ALIAS = {
  veryrare: 'rare',
  ultrarare: 'epic',
  celestial: 'divine',
  exalted: 'divine',
  immortal: 'divine',
  eternal: 'cosmic',
  transcendent: 'cosmic',
  void: 'cosmic',
  infinite: 'cosmic',
  omnipotent: 'cosmic',
  secret: 'cosmic',
};
for (const k in ALIAS) RARITIES[k] = RARITIES[ALIAS[k]];
export const rarityBoost = (bonus = 0) =>
  (state.player ? stat(state.player, 'luck') : 0) +
  0.3 * state.wave.n +
  1.5 * (state.bossKillsRun || 0) +
  bonus;
export const weightOf = (id, boost) => {
  const r = RARITIES[id || 'common'];
  return r.w * Math.pow(1 + boost * 0.18, r.tier);
};
// Havuz için kademe başına çıkma yüzdesi (kart ekranında gösterilir)
export function tierOdds(pool, boost) {
  const sum = {};
  let tot = 0;
  for (const c of pool) {
    const w = weightOf(c.rarity, boost),
      id = RARITIES[c.rarity || 'common'].id;
    sum[id] = (sum[id] || 0) + w;
    tot += w;
  }
  return TIERS.filter((id) => sum[id]).map((id) => ({
    id,
    name: RARITIES[id].name,
    col: RARITIES[id].col,
    p: (100 * sum[id]) / tot,
  }));
}
export function rollRarity(boost, ids = TIERS) {
  let x = Math.random() * ids.reduce((s, i) => s + weightOf(i, boost), 0);
  for (const i of ids) if ((x -= weightOf(i, boost)) <= 0) return i;
  return ids[0];
}
