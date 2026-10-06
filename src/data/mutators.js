const mul = (stat, value) => ({ stat, op: 'mul', value }),
  add = (stat, value) => ({ stat, op: 'add', value });
// Koşu mutatörleri: koşu başında rastgele seçilir (Heat 3+ iken 2 tane). mods = oyuncuya, flags = dünya kuralları
export const MUTATORS = [
  {
    id: 'crowd',
    name: 'Kalabalık',
    desc: '%40 daha çok düşman, %30 daha çok coin',
    mods: [],
    flags: { crowd: 1.4, coinMul: 1.3 },
  },
  {
    id: 'glass',
    name: 'Cam Top',
    desc: 'Hasar +%35 ama max can -%40',
    mods: [mul('damage', 1.35), mul('maxHp', 0.6)],
    flags: {},
  },
  {
    id: 'poison',
    name: 'Zehir Ruhu',
    desc: 'Vuruşların %40 zehirler ama hasar -%15',
    mods: [add('poison', 0.4), mul('damage', 0.85)],
    flags: {},
  },
  {
    id: 'fast',
    name: 'Hızlı Dünya',
    desc: 'Düşmanlar %20 hızlı; sen +20 hız, dash %20 hızlı dolar',
    mods: [add('speed', 20), mul('dashCdMul', 0.8)],
    flags: { enemySpeed: 1.2 },
  },
  {
    id: 'explode',
    name: 'Patlayıcı Dünya',
    desc: 'Tüm düşmanlar ölünce patlar (uyarı halkasıyla)',
    mods: [],
    flags: { explode: true },
  },
  {
    id: 'vamp',
    name: 'Vampir Gecesi',
    desc: '%10 omnivamp ama max can -%20',
    mods: [add('omnivamp', 0.1), mul('maxHp', 0.8)],
    flags: {},
  },
  {
    id: 'gold',
    name: 'Altın Çağ',
    desc: 'Coin ×1.5, item şansı ×1.5 ama düşman canı +%20',
    mods: [],
    flags: { coinMul: 1.5, itemMul: 1.5, enemyHp: 1.2 },
  },
];
export const pickMutators = (heat) =>
  [...MUTATORS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 1 + (heat >= 3 ? 1 : 0));
