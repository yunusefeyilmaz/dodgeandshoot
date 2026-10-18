import { state } from './state.js';
import { stat } from './stats.js';
// 9 nadirlik kademesi. Ağırlık = temel * (1 + k*b)^(kademe^s); b = yumuşatılmış "şans bonusu". Parametreler hedef yüzdelere sayısal olarak uyduruldu:
//   bonus 0: Yaygın %62 ... Kozmik %0.00002 · bonus 20: %24/30/27/14/4/1/0.25/0.06/0.016 · bonus 40: %10/20/29/24/11/4/1.6/0.6/0.24 (Yaygın hiçbir zaman 0 olmaz)
const T = [
  ['common', 'Yaygın', '#9aa3b5', 62],
  ['uncommon', 'Yaygın Olmayan', '#7ed07e', 27],
  ['rare', 'Nadir', '#4aa3ff', 9],
  ['epic', 'Destansı', '#b86bff', 1.8],
  ['mythic', 'Mitik', '#ff5fd2', 0.2],
  ['legendary', 'Efsanevi', '#ffb020', 0.02],
  ['ancient', 'Kadim', '#c08a4a', 0.002],
  ['divine', 'İlahi', '#fff0a0', 0.0002],
  ['cosmic', 'Kozmik', '#6f5bff', 0.00002],
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
// bonus = luck + 0.3*tur + 1.5*(yenilen boss) + olay bonusu. 25'ten sonrası yarı etkili (çok yüksek şans oyunu bozmasın)
export const rarityBoost = (bonus = 0) =>
  (state.player ? stat(state.player, 'luck') : 0) +
  0.3 * state.wave.n +
  1.5 * (state.bossKillsRun || 0) +
  bonus;
const soft = (b) => (b <= 25 ? b : 25 + (b - 25) * 0.5);
export const weightOf = (id, boost) => {
  const r = RARITIES[id || 'common'];
  return (
    r.w * Math.pow(1 + 0.094 * soft(Math.max(0, boost)), Math.pow(r.tier, 0.95))
  );
};
// Kart/item başına ağırlık = kademe ağırlığı / o kademedeki kart sayısı -> kademe yüzdeleri havuzdaki kart sayısından BAĞIMSIZ (hedef eğriyi korur)
export function weightsFor(list, boost) {
  const cnt = {};
  for (const c of list) {
    const id = RARITIES[c.rarity || 'common'].id;
    cnt[id] = (cnt[id] || 0) + 1;
  }
  return list.map((c) => {
    const id = RARITIES[c.rarity || 'common'].id;
    return weightOf(id, boost) / cnt[id];
  });
}
// Havuz için HER kademenin çıkma yüzdesi (n = o kademedeki kart sayısı; 0 ise o kademede kart kalmamıştır, payı diğerlerine dağılır)
export function tierOdds(pool, boost) {
  const ws = weightsFor(pool, boost),
    sum = {},
    cnt = {};
  let tot = 0;
  pool.forEach((c, i) => {
    const id = RARITIES[c.rarity || 'common'].id;
    sum[id] = (sum[id] || 0) + ws[i];
    cnt[id] = (cnt[id] || 0) + 1;
    tot += ws[i];
  });
  return TIERS.map((id) => ({
    id,
    name: RARITIES[id].name,
    col: RARITIES[id].col,
    p: tot ? (100 * (sum[id] || 0)) / tot : 0,
    n: cnt[id] || 0,
  }));
}
export function rollRarity(boost, ids = TIERS) {
  let x = Math.random() * ids.reduce((s, i) => s + weightOf(i, boost), 0);
  for (const i of ids) if ((x -= weightOf(i, boost)) <= 0) return i;
  return ids[0];
}
