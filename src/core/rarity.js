// Item / kart / silah upgrade nadirlikleri. Luck yüksek tier'ların ağırlığını artırır.
export const RARITIES = {
  common: { name: 'Sıradan', col: '#9aa3b5', w: 60, sell: 5, tier: 0 },
  rare: { name: 'Nadir', col: '#4aa3ff', w: 28, sell: 15, tier: 1 },
  epic: { name: 'Epik', col: '#b86bff', w: 10, sell: 40, tier: 2 },
  legendary: { name: 'Efsanevi', col: '#ffb020', w: 2, sell: 120, tier: 3 },
};
export const weightOf = (id, luck) => {
  const r = RARITIES[id || 'common'];
  return r.w * (1 + luck * 0.04 * r.tier);
};
export function rollRarity(luck) {
  const ids = Object.keys(RARITIES);
  let x = Math.random() * ids.reduce((s, i) => s + weightOf(i, luck), 0);
  for (const i of ids) if ((x -= weightOf(i, luck)) <= 0) return i;
  return 'common';
}
