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
  lethality: 'Ölümcüllük',
  magicPen: 'Büyü delme',
  magicFlat: 'Sabit büyü delme',
  maxHp: 'Max can',
  regen: 'Can yenileme/sn',
  lifesteal: 'Can çalma',
  omnivamp: 'Tam can çalma',
  speed: 'Hareket hızı',
  magnet: 'Mıknatıs alanı',
  luck: 'Şans',
  backstab: 'Arka vuruş hasarı',
  area: 'Alan',
  pierce: 'Delme',
  multishot: 'Ek ok',
  damage: 'Hasar',
  poison: 'Zehir (süreli hasar)',
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
  dashCharges: 'Dash hakkı',
  dashCdMul: 'Dash bekleme çarpanı',
  dashBlast: 'Dash patlaması',
  dashTrail: 'Dash izi',
  dashIframe: 'Dash dokunulmazlığı (sn)',
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
  'dashCdMul',
]);
export const DESCS = {
  ad: 'Fiziksel skillerin taban hasarına eklenir.',
  ap: 'Büyü skillerinin taban hasarına eklenir.',
  attackSpeed: 'Silah saldırı hızı çarpanı.',
  haste: 'Skill bekleme süresini kısaltır (100 hızlandırma = yarı süre).',
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
  magnet: 'Altın ve itemları çekme menzili.',
  luck: 'Nadir kart/sınıf/item çıkma şansını ve drop oranını artırır.',
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
    ? (m.value >= 1 ? '+%' : '-%') + Math.abs(Math.round((m.value - 1) * 100))
    : (m.value < 0 ? '' : '+') +
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
DESCS.dashCharges = 'Art arda atabileceğin dash sayısı.';
DESCS.dashCdMul = 'Dash dolum süresi çarpanı (düşük = hızlı).';
DESCS.dashBlast = 'Dash bittiğinde patlama hasarı çarpanı.';
DESCS.dashTrail = 'Dash yolunda bırakılan yanan iz gücü.';
DESCS.dashIframe = 'Dash sırasındaki dokunulmazlık süresi (saniye).';
