// 9 nadirlik kademesi. Üst kademeler düşük luck'ta HİÇ gelmez (minLuck); luck arttıkça ağırlıkları yavaşça artar.
//          id          ad                 renk       ağırlık  minLuck
const T = [
  ['common', 'Yaygın', '#9aa3b5', 100, 0],
  ['uncommon', 'Yaygın Olmayan', '#7ed07e', 45, 0],
  ['rare', 'Nadir', '#4aa3ff', 18, 0],
  ['epic', 'Destansı', '#b86bff', 6, 0],
  ['mythic', 'Mitik', '#ff5fd2', 2, 3],
  ['legendary', 'Efsanevi', '#ffb020', 0.6, 6],
  ['ancient', 'Kadim', '#c08a4a', 0.15, 14],
  ['divine', 'İlahi', '#fff0a0', 0.03, 28],
  ['cosmic', 'Kozmik', '#6f5bff', 0.005, 45],
];
export const RARITIES = {};
T.forEach(
  ([id, name, col, w, minLuck], i) =>
    (RARITIES[id] = {
      id,
      name,
      col,
      tier: i,
      w,
      minLuck,
      sell: Math.round(5 * Math.pow(1.7, i)),
    }),
);
export const TIERS = T.map((t) => t[0]);
// Eski kademe adları yeni kademelere eşlenir (veri dosyaları bozulmadan çalışır)
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
export const weightOf = (id, luck) => {
  const r = RARITIES[id || 'common'];
  return luck < r.minLuck ? 0 : r.w * (1 + luck * 0.05 * r.tier);
};
export function rollRarity(luck, ids = TIERS) {
  let x = Math.random() * ids.reduce((s, i) => s + weightOf(i, luck), 0);
  for (const i of ids) if ((x -= weightOf(i, luck)) <= 0) return i;
  return ids[0];
}
