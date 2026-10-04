// Coin ile alınan statlar (ağaç). parent: üst yetenek açılınca görünür. Maliyet = base * BAL.shopCostMul * grow^seviye. max: seviye sınırı
export const U = (id, name, stat, op, value, base, grow, max, o = {}) => ({
  id,
  name,
  stat,
  op,
  value,
  base,
  grow,
  max,
  tag: o.tag,
  rarity: o.rarity,
  parent: o.parent,
  pet: o.pet,
  desc:
    op === 'add'
      ? '+' + (o.pct ? +(value * 100).toFixed(1) + '%' : value) + ' ' + name
      : '+%' + Math.round((value - 1) * 100) + ' ' + name,
});
export const UPGRADES = [
  U('ad', 'Saldırı gücü (AD)', 'ad', 'add', 3, 10, 1.35, 25),
  U('as', 'Saldırı hızı', 'attackSpeed', 'mul', 1.05, 12, 1.4, 12, {
    parent: 'ad',
  }),
  U('ls', 'Lifesteal (silah)', 'lifesteal', 'add', 0.015, 25, 1.5, 8, {
    pct: 1,
    parent: 'as',
  }),
  U('crit', 'Kritik şansı', 'critChance', 'add', 0.02, 15, 1.4, 20, {
    pct: 1,
    parent: 'ad',
  }),
  U('critd', 'Kritik hasarı', 'critDmg', 'add', 0.1, 15, 1.4, 15, {
    parent: 'crit',
  }),
  U('apen', 'Zırh delme %', 'armorPen', 'add', 0.03, 20, 1.45, 12, {
    pct: 1,
    parent: 'ad',
  }),
  U('leth', 'Lethality', 'lethality', 'add', 2, 15, 1.4, 12, {
    parent: 'apen',
  }),
  U('ap', 'Büyü gücü (AP)', 'ap', 'add', 3, 10, 1.35, 25),
  U('haste', 'Yetenek hızlandırma', 'haste', 'add', 6, 20, 1.4, 12, {
    parent: 'ap',
  }),
  U('ov', 'Omnivamp', 'omnivamp', 'add', 0.015, 25, 1.5, 8, {
    pct: 1,
    parent: 'haste',
  }),
  U('mpen', 'Büyü delme %', 'magicPen', 'add', 0.03, 20, 1.45, 12, {
    pct: 1,
    parent: 'ap',
  }),
  U('mflat', 'Sabit büyü delme', 'magicFlat', 'add', 2, 15, 1.4, 12, {
    parent: 'mpen',
  }),
  U('hp', 'Max can', 'maxHp', 'add', 15, 8, 1.3, 30),
  U('armor', 'Zırh', 'armor', 'add', 3, 12, 1.35, 20, { parent: 'hp' }),
  U('mr', 'Büyü direnci', 'mr', 'add', 3, 12, 1.35, 20, { parent: 'hp' }),
  U('regen', 'Can yenileme /sn', 'regen', 'add', 0.3, 15, 1.4, 15, {
    parent: 'hp',
  }),
  U('ms', 'Hareket hızı', 'speed', 'add', 8, 10, 1.3, 10),
  U('mag', 'Mıknatıs alanı', 'magnet', 'add', 20, 10, 1.35, 12, {
    parent: 'ms',
  }),
  U('kb', 'Geri itme', 'knockback', 'add', 30, 10, 1.4, 8, { parent: 'ms' }),
];
