// Shop'taki genel (LoL tarzı) statlar. U() açıklamayı otomatik üretir. Maliyet = base * grow^seviye
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
  desc:
    op === 'add'
      ? '+' + (o.pct ? Math.round(value * 100) + '%' : value) + ' ' + name
      : '+%' + Math.round((value - 1) * 100) + ' ' + name,
});
export const UPGRADES = [
  U('ad', 'Saldırı gücü (AD)', 'ad', 'add', 4, 10, 1.3),
  U('ap', 'Büyü gücü (AP)', 'ap', 'add', 4, 10, 1.3),
  U('as', 'Saldırı hızı', 'attackSpeed', 'mul', 1.08, 12, 1.35, 15),
  U('haste', 'Yetenek hızlandırma', 'haste', 'add', 8, 20, 1.4, 12),
  U('crit', 'Kritik şansı', 'critChance', 'add', 0.03, 15, 1.4, 25, { pct: 1 }),
  U('critd', 'Kritik hasarı', 'critDmg', 'add', 0.15, 15, 1.4),
  U('armor', 'Zırh', 'armor', 'add', 4, 12, 1.35),
  U('mr', 'Büyü direnci', 'mr', 'add', 4, 12, 1.35),
  U('apen', 'Zırh delme %', 'armorPen', 'add', 0.04, 20, 1.45, 15, { pct: 1 }),
  U('leth', 'Lethality (sabit zırh delme)', 'lethality', 'add', 3, 15, 1.4, 15),
  U('mpen', 'Büyü delme %', 'magicPen', 'add', 0.04, 20, 1.45, 15, { pct: 1 }),
  U('mflat', 'Sabit büyü delme', 'magicFlat', 'add', 3, 15, 1.4, 15),
  U('hp', 'Max can', 'maxHp', 'add', 20, 8, 1.3),
  U('regen', 'Can yenileme /sn', 'regen', 'add', 0.5, 15, 1.4, 20),
  U('ls', 'Lifesteal (silah)', 'lifesteal', 'add', 0.02, 25, 1.5, 10, {
    pct: 1,
  }),
  U('ov', 'Omnivamp (tüm hasar)', 'omnivamp', 'add', 0.02, 25, 1.5, 10, {
    pct: 1,
  }),
  U('ms', 'Hareket hızı', 'speed', 'add', 10, 10, 1.3, 12),
  U('mag', 'Mıknatıs alanı', 'magnet', 'add', 25, 10, 1.35, 15),
];
