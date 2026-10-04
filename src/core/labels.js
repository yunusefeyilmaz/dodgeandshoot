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
  effPower: 'Efekt gücü',
  resPen: 'Direnç delme',
  blast: 'Patlama ihtimali',
  blastPower: 'Patlama hasarı',
  blastRadius: 'Patlama alanı',
  blastCount: 'Ek patlama',
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
  'resPen',
  'blast',
  'blastPower',
]);
const MUL = new Set([
  'attackSpeed',
  'damage',
  'backstab',
  'area',
  'effPower',
  'blastRadius',
]);
export const DESCS = {
  ad: 'Fiziksel skillerin taban hasarına eklenir.',
  ap: 'Büyü skillerinin taban hasarına eklenir.',
  attackSpeed: 'Silah saldırı hızı çarpanı.',
  haste: 'Skill bekleme süresini kısaltır (100 haste = yarı süre).',
  critChance: 'Vuruşun kritik olma şansı.',
  critDmg: 'Kritik vuruşun hasar çarpanı.',
  armor: 'Fiziksel hasarı azaltır: 100/(100+zırh).',
  mr: 'Büyü hasarını azaltır.',
  armorPen: 'Hedef zırhının yüzdesini yok sayar.',
  lethality: 'Hedef zırhından sabit miktar düşer.',
  magicPen: 'Hedef büyü direncinin yüzdesini yok sayar.',
  magicFlat: 'Hedef büyü direncinden sabit miktar düşer.',
  maxHp: 'Maksimum can.',
  regen: 'Saniyede yenilenen can.',
  lifesteal: 'Silah hasarının yüzdesi kadar can.',
  omnivamp: 'Tüm hasarın yüzdesi kadar can.',
  speed: 'Hareket hızı.',
  magnet: 'Coin ve itemları çekme menzili.',
  luck: 'Nadir kart/class/item çıkma şansını ve drop oranını artırır.',
  backstab: 'Düşmanın arkasından vuruş hasar çarpanı.',
  damage: 'Tüm hasara uygulanan çarpan.',
  knockback: 'Vuruşta düşmanı iten güç (güçlü düşmanlar direnir).',
  poison: 'Vuruşun yüzdesi kadar 3 sn zehir hasarı.',
  chain: 'Vuruşun yüzdesi kadar yakındaki 2 düşmana şimşek.',
  slow: 'Vurulan düşmanın yavaşlama oranı.',
  voidShred: "Hedefin zırh/MR'sini aşındırır + void hasarı.",
};
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

DESCS.effPower = 'Zehir, zincir, yavaşlatma ve void efektlerinin gücü.';
DESCS.resPen =
  'Düşmanların efekt dirençlerinden düşer (zehir/yavaşlatma/void/zincir).';
DESCS.blast = 'Her vuruşun bu ihtimalle patlama yaratması.';
DESCS.blastPower = 'Patlamanın, vuruş hasarının yüzde kaçını vurduğu.';
DESCS.blastRadius = 'Patlama alanı çarpanı.';
DESCS.blastCount = 'Bir patlama tetiklenince oluşan ek patlama sayısı.';
