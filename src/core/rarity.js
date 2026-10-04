// 20 nadirlik kademesi. Luck yüksek kademelerin ağırlığını artırır.
const T = [
  ['common', 'Yaygın', '#9aa3b5'],
  ['uncommon', 'Yaygın Olmayan', '#7ed07e'],
  ['rare', 'Nadir', '#4aa3ff'],
  ['veryrare', 'Çok Nadir', '#37c6c6'],
  ['ultrarare', 'Aşırı Nadir', '#5b6cff'],
  ['epic', 'Destansı', '#b86bff'],
  ['mythic', 'Mitik', '#ff5fd2'],
  ['legendary', 'Efsanevi', '#ffb020'],
  ['ancient', 'Kadim', '#c08a4a'],
  ['divine', 'İlahi', '#fff0a0'],
  ['celestial', 'Göksel', '#8fe8ff'],
  ['exalted', 'Yüceltilmiş', '#ffd0f0'],
  ['immortal', 'Ölümsüz', '#ff6a5a'],
  ['eternal', 'Ebedi', '#7affb0'],
  ['transcendent', 'Aşkın', '#d0a8ff'],
  ['cosmic', 'Kozmik', '#6f5bff'],
  ['void', 'Boşluk', '#9a3be2'],
  ['infinite', 'Sonsuz', '#ffffff'],
  ['omnipotent', 'Her Şeye Gücü Yeten', '#ff2a6d'],
  ['secret', 'Gizli', '#ff00ff'],
];
export const RARITIES = {};
T.forEach(
  ([id, name, col], i) =>
    (RARITIES[id] = {
      name,
      col,
      tier: i,
      w: 100 * Math.pow(0.62, i),
      sell: Math.round(5 * Math.pow(1.55, i)),
    }),
);
export const TIERS = T.map((t) => t[0]);
export const weightOf = (id, luck) => {
  const r = RARITIES[id || 'common'];
  return r.w * (1 + luck * 0.04 * r.tier);
};
export function rollRarity(luck, ids = TIERS) {
  let x = Math.random() * ids.reduce((s, i) => s + weightOf(i, luck), 0);
  for (const i of ids) if ((x -= weightOf(i, luck)) <= 0) return i;
  return ids[0];
}
