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
  crescent: 'Hilal dalgası',
  surge: 'Üçleme',
  volley: 'Ok yağmuru',
  pull: 'Çekim',
  refreshDash: 'Dash yenileme',
  ricochet: 'Sekme',
  focus: 'Odak',
  homing: 'Güdüm',
  projSpeed: 'Mermi hızı',
  killNova: 'Ölüm patlaması',
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
  'projSpeed',
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
Object.assign(DESCS, {
  // net açıklamalar: ne yapar, nasıl hesaplanır
  crescent:
    "Her 3. saldırıda ek olarak delici bir hilal dalgası fırlatır (hasarı: temel hasarın %60'ı × değer).",
  surge:
    'Her 3. saldırı +%50 hasar, +%35 alan (mermide +1 delme, daha büyük) ile vurur.',
  volley: 'Her 5. atışta hedefin çevresine 5 ok yağdırır.',
  pull: 'Vuruşlar, düşmanları sana doğru çeker (değer = çekim gücü).',
  refreshDash: 'Kılıçla bir düşman öldürünce 1 dash hakkın geri gelir.',
  ricochet:
    'Mermi vurduktan sonra yakındaki başka bir düşmana sekerek devam eder (değer kadar kez).',
  focus:
    'Aynı hedefe art arda vuruşlarda her seferinde hasar +%X artar (en fazla 5 kez). Hedef değişince sıfırlanır.',
  homing: 'Mermiler, yakındaki düşmanlara doğru döner (değer = dönüş hızı).',
  projSpeed: 'Mermilerin uçuş hızı çarpanı.',
  killNova:
    "Öldürdüğün düşman patlar: çevresine, öldüren vuruşun hasarının %X'i kadar büyü hasarı verir.",
  poison:
    "Zehir: her vuruşun hasarının %X'i kadar ek hasar, 3 saniyeye yayılarak işler (zırhı ve büyü direncini yok sayar). Örn. %35 zehir: 100 hasarlık vuruş → 35 zehir hasarı.",
  chain:
    "Zincir: her vuruş, yakındaki 2 düşmana vuruş hasarının %X'i kadar büyü hasarı (şimşek) atlatır. Örn. %50 zincir: 100 hasarlık vuruş → 2 düşmana 50 büyü hasarı.",
  slow: 'Yavaşlatma: vurulan düşman 1.5 saniye boyunca %X yavaşlar (en fazla %70).',
  voidShred:
    "Void: vurulan düşmanın zırh ve büyü direnci 4 saniye %X azalır, ayrıca vuruşun %X'inin yarısı kadar saf void hasarı verir.",
  blast:
    "Patlama: her vuruş bu ihtimalle patlar; patlama çevredeki düşmanlara vuruşun 'Patlama hasarı' oranında hasar verir.",
  blastPower:
    'Patlamanın, vuruş hasarının yüzde kaçını vurduğu (başlangıç %80).',
  critChance:
    'Her vuruşun kritik olma ihtimali. Kritik vuruş, Kritik hasarı çarpanı kadar vurur.',
  critDmg: 'Kritik vuruşun hasar çarpanı (başlangıç ×1.5).',
  luck: 'Şans: kart/item/class nadirliğini yükseltir; item düşme şansına çok az etki eder.',
});
Object.assign(LABELS, {
  rageGain: 'Öfke kazanımı',
  rageDur: 'Öfke süresi (sn)',
  stillBonus: 'Nişan gücü',
  shadowDmg: 'Gölge hasarı',
  arcanaEvery: 'Arkana aralığı (skill)',
  soulEvery: 'Ruh hasadı aralığı (öldürme)',
  soldierMax: 'Asker sınırı',
  soldierLife: 'Asker ömrü (sn)',
});
