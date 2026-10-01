export const LABELS = {
  ad: 'Saldırı gücü (AD)',
  ap: 'Büyü gücü (AP)',
  attackSpeed: 'Saldırı hızı',
  haste: 'Yetenek hızlandırma',
  critChance: 'Kritik şansı',
  critDmg: 'Kritik hasarı',
  armor: 'Zırh',
  mr: 'Büyü direnci',
  armorPen: 'Zırh delme',
  lethality: 'Lethality',
  magicPen: 'Büyü delme',
  magicFlat: 'Sabit büyü delme',
  maxHp: 'Max can',
  regen: 'Can yenileme/sn',
  lifesteal: 'Lifesteal',
  omnivamp: 'Omnivamp',
  speed: 'Hareket hızı',
  magnet: 'Mıknatıs alanı',
  luck: 'Luck',
  backstab: 'Arka vuruş hasarı',
  area: 'Alan',
  pierce: 'Delme',
  multishot: 'Ek ok',
  damage: 'Hasar',
  poison: 'Zehir (DoT)',
  chain: 'Büyü zinciri',
  slow: 'Yavaşlatma',
  voidShred: 'Void aşındırma',
  knockback: 'Geri itme',
};
const PCT = new Set([
  'critChance',
  'critDmg',
  'armorPen',
  'magicPen',
  'lifesteal',
  'omnivamp',
  'poison',
  'chain',
  'slow',
  'voidShred',
]);
const MUL = new Set(['attackSpeed', 'damage', 'backstab', 'area']);
export const fmtMod = (m) =>
  m.op === 'mul'
    ? '+%' + Math.round((m.value - 1) * 100)
    : '+' +
      (PCT.has(m.stat)
        ? +(m.value * 100).toFixed(2) + '%'
        : +m.value.toFixed(2));
export const fmtStat = (s, v) =>
  PCT.has(s)
    ? (v * 100).toFixed(1) + '%'
    : MUL.has(s)
      ? '×' + v.toFixed(2)
      : String(+v.toFixed(1));
