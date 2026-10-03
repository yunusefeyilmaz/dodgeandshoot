// Coin ile alınan statlar (ağaç). parent: üst yetenek açılınca görünür. Maliyet = base * grow^seviye
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
  desc:
    op === 'add'
      ? '+' + (o.pct ? Math.round(value * 100) + '%' : value) + ' ' + name
      : '+%' + Math.round((value - 1) * 100) + ' ' + name,
});
export const UPGRADES = [
  U('ad', 'Saldırı gücü (AD)', 'ad', 'add', 4, 10, 1.3),
  U('as', 'Saldırı hızı', 'attackSpeed', 'mul', 1.08, 12, 1.35, 15, {
    parent: 'ad',
  }),
  U('ls', 'Lifesteal (silah)', 'lifesteal', 'add', 0.02, 25, 1.5, 10, {
    pct: 1,
    parent: 'as',
  }),
  U('crit', 'Kritik şansı', 'critChance', 'add', 0.03, 15, 1.4, 25, {
    pct: 1,
    parent: 'ad',
  }),
  U('critd', 'Kritik hasarı', 'critDmg', 'add', 0.15, 15, 1.4, 20, {
    parent: 'crit',
  }),
  U('apen', 'Zırh delme %', 'armorPen', 'add', 0.04, 20, 1.45, 15, {
    pct: 1,
    parent: 'ad',
  }),
  U('leth', 'Lethality', 'lethality', 'add', 3, 15, 1.4, 15, {
    parent: 'apen',
  }),
  U('ap', 'Büyü gücü (AP)', 'ap', 'add', 4, 10, 1.3),
  U('haste', 'Yetenek hızlandırma', 'haste', 'add', 8, 20, 1.4, 12, {
    parent: 'ap',
  }),
  U('ov', 'Omnivamp', 'omnivamp', 'add', 0.02, 25, 1.5, 10, {
    pct: 1,
    parent: 'haste',
  }),
  U('mpen', 'Büyü delme %', 'magicPen', 'add', 0.04, 20, 1.45, 15, {
    pct: 1,
    parent: 'ap',
  }),
  U('mflat', 'Sabit büyü delme', 'magicFlat', 'add', 3, 15, 1.4, 15, {
    parent: 'mpen',
  }),
  U('hp', 'Max can', 'maxHp', 'add', 20, 8, 1.3),
  U('armor', 'Zırh', 'armor', 'add', 4, 12, 1.35, undefined, { parent: 'hp' }),
  U('mr', 'Büyü direnci', 'mr', 'add', 4, 12, 1.35, undefined, {
    parent: 'hp',
  }),
  U('regen', 'Can yenileme /sn', 'regen', 'add', 0.5, 15, 1.4, 20, {
    parent: 'hp',
  }),
  U('ms', 'Hareket hızı', 'speed', 'add', 10, 10, 1.3, 12),
  U('mag', 'Mıknatıs alanı', 'magnet', 'add', 25, 10, 1.35, 15, {
    parent: 'ms',
  }),
  U('kb', 'Geri itme', 'knockback', 'add', 40, 10, 1.4, 10, { parent: 'ms' }),
];
