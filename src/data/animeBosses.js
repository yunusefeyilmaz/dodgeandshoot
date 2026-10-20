import { ABILITIES } from './abilities.js';
// 11 yeni boss (anime esinli). Her birinin kendine özgü skilleri, fazları (SCRIPTS) ve arena mekaniği (arena.js MECH) var.
const A = (id, name, tags, dmgType, cooldown, range, effects) =>
  (ABILITIES[id] = { id, name, tags, dmgType, cooldown, range, effects });
A('flurry', 'Yumruk Fırtınası', ['Weapon', 'Area'], 'phys', 0.45, 60, [
  { type: 'Nova', damage: 14, radius: 52 },
]);
A('garupunch', 'Akış Yumruğu', ['Dash'], 'phys', 4, 480, [
  { type: 'Dash', windup: 0.35, speed: 900, dur: 0.24, damage: 42 },
]);
A('crows', 'Karga Sürüsü', ['Dark', 'Projectile'], 'magic', 3, 700, [
  {
    type: 'Projectile',
    shape: 'dagger',
    size: 4,
    damage: 9,
    speed: 330,
    count: 7,
    spread: 1.5,
    color: '#3a3a55',
  },
]);
A('amaterasu', 'Amaterasu', ['Fire', 'Area'], 'magic', 7, 800, [
  { type: 'Rain', count: 4, radius: 80, delay: 1.3, damage: 26, spread: 200 },
]);
A('chidori', 'Şimşek Bıçağı', ['Lightning', 'Dash'], 'phys', 5, 600, [
  { type: 'Dash', windup: 0.5, speed: 1000, dur: 0.26, damage: 52, chain: 1 },
]);
A('shuriken', 'Şuriken', ['Projectile'], 'phys', 2.4, 650, [
  {
    type: 'Projectile',
    shape: 'blade',
    size: 5,
    damage: 12,
    speed: 380,
    count: 3,
    spread: 0.5,
    pierce: 1,
    color: '#c0c8d8',
  },
]);
A('summonclone', 'Gölge Klon', [], 'phys', 13, 800, [
  { type: 'Summon', id: 'shadowclone', count: 2, radius: 80 },
]);
A('shinra', 'Shinra Tensei', ['Wind', 'Area'], 'magic', 8, 500, [
  { type: 'Gust', radius: 340, delay: 1.1, force: 1300, damage: 38 },
]);
A('chibaku', 'Chibaku Tensei', ['Wind', 'Area'], 'magic', 12, 800, [
  {
    type: 'Tornado',
    count: 1,
    radius: 75,
    life: 6,
    dps: 30,
    speed: 90,
    pull: 260,
  },
]);
A('reiatsu', 'Ruhani Darbe', ['Weapon', 'Area'], 'phys', 2.6, 110, [
  { type: 'Nova', damage: 40, radius: 130 },
]);
A('zan', 'Zan Zinciri', ['Dash'], 'phys', 5, 520, [
  { type: 'Dash', windup: 0.35, speed: 1000, dur: 0.26, damage: 68, chain: 2 },
]);
A('senbon', 'Senbonzakura', ['Projectile'], 'phys', 2, 700, [
  {
    type: 'Projectile',
    shape: 'petal',
    size: 5,
    damage: 10,
    speed: 250,
    count: 9,
    spread: 2.8,
    color: '#ffb0d0',
  },
]);
A('senkei', 'Senkei', ['Area'], 'phys', 7, 800, [
  { type: 'Rain', count: 9, radius: 45, delay: 1, damage: 18, spread: 330 },
]);
A('cerooscuras', 'Cero Oscuras', ['Cero', 'Projectile'], 'magic', 7, 900, [
  { type: 'Cero', windup: 1.3, damage: 82, speed: 1300, color: '#37f08a' },
]);
A('lanza', 'Lanza del Relámpago', ['Projectile'], 'magic', 4, 900, [
  {
    type: 'Projectile',
    shape: 'bolt',
    size: 9,
    damage: 58,
    speed: 760,
    count: 1,
    pierce: 6,
    color: '#8affc0',
  },
]);
A('garrapanther', 'Pençe Zinciri', ['Dash'], 'phys', 7, 650, [
  { type: 'Dash', windup: 0.3, speed: 1100, dur: 0.22, damage: 38, chain: 4 },
]);
A('grandrey', 'Gran Rey Cero', ['Cero', 'Projectile'], 'magic', 8, 900, [
  {
    type: 'Cero',
    windup: 1.1,
    damage: 62,
    speed: 1200,
    color: '#4ac8ff',
    n: 5,
    fan: 0.9,
  },
]);
A('hado', 'Hadō #90', ['Area'], 'magic', 8, 800, [
  { type: 'Rain', count: 4, radius: 115, delay: 1.5, damage: 52, spread: 200 },
]);
A('reishi', 'Reishi Küreleri', ['Projectile'], 'magic', 4, 700, [
  {
    type: 'Projectile',
    shape: 'orb',
    size: 5,
    damage: 12,
    speed: 190,
    count: 10,
    radial: true,
    color: '#c08aff',
  },
]);
A('deathbeam', 'Ölüm Işını', ['Cero', 'Projectile'], 'magic', 3, 950, [
  {
    type: 'Cero',
    windup: 0.5,
    damage: 44,
    speed: 1700,
    color: '#d070ff',
    n: 2,
    fan: 0.18,
  },
]);
A('deathball', 'Ölüm Topu', ['Area'], 'magic', 11, 900, [
  { type: 'Rain', count: 1, radius: 190, delay: 2.4, damage: 150, spread: 0 },
]);
A('cleave', 'Parçala', ['Dash'], 'phys', 5, 600, [
  { type: 'Dash', windup: 0.25, speed: 1100, dur: 0.22, damage: 66, chain: 3 },
]);
A('fuga', 'Fuga', ['Fire', 'Area'], 'magic', 9, 800, [
  { type: 'Rain', count: 6, radius: 100, delay: 1.6, damage: 62, spread: 260 },
]);
A('cleavefan', 'Kesik Yelpazesi', ['Projectile'], 'phys', 4, 800, [
  {
    type: 'Projectile',
    shape: 'crescent',
    size: 12,
    damage: 40,
    speed: 520,
    count: 5,
    spread: 1.3,
    pierce: 5,
    color: '#ff3a5a',
  },
]);
const B = (name, col, hp, speed, armor, abilities, o = {}) => ({
  name,
  col,
  hp,
  speed,
  armor,
  abilities,
  r: 26,
  xp: 30,
  coin: 40,
  boss: true,
  keep: 120,
  kbResist: 0.92,
  contact: 2,
  stats: {
    ad: 8,
    ap: 8,
    mr: 30,
    critChance: 0.08,
    critDmg: 1.7,
    armorPen: 0.1,
    magicPen: 0.1,
    haste: 10,
  },
  res: { slow: 0.8, poison: 0.5, void: 0.5, chain: 0.4 },
  dr: 0.25,
  shape: 'circle',
  ...o,
});
export const ANIME = [
  B('Garu', '#d9a35a', 1800, 120, 25, ['flurry', 'garupunch'], {
    script: 'garu',
    arena: 'shock',
    keep: 0,
    r: 22,
    dodge: true,
  }),
  B('Itaçi', '#c01030', 2800, 85, 30, ['crows', 'amaterasu', 'fan'], {
    arena: 'genjutsu',
    keep: 260,
    shape: 'diamond',
    dodge: true,
  }),
  B(
    'Kakaşi',
    '#9bb0c8',
    3000,
    100,
    35,
    ['chidori', 'summonclone', 'shuriken'],
    { arena: 'storm', keep: 200, dodge: true },
  ),
  B('Peyn', '#ff9a3a', 4000, 60, 40, ['shinra', 'chibaku', 'fan'], {
    arena: 'gravity',
    keep: 300,
    dr: 0.3,
  }),
  B('Kenpaçi', '#e04a3a', 4500, 95, 45, ['reiatsu', 'zan'], {
    script: 'kenpachi',
    arena: 'aura',
    keep: 0,
    contact: 3,
    dr: 0.3,
    r: 27,
  }),
  B('Byakuro', '#ffb0d0', 3200, 75, 25, ['senbon', 'senkei', 'katana'], {
    arena: 'petals',
    keep: 240,
    dodge: true,
    orbit: [{ n: 6, r: 90, speed: 3.4, dmg: 14, size: 7 }],
  }),
  B('Ulkiora', '#37f08a', 4800, 80, 50, ['cerooscuras', 'blink'], {
    script: 'ulkiora',
    arena: 'abyss',
    keep: 330,
    dodge: true,
  }),
  B('Grimjo', '#4ac8ff', 4200, 115, 40, ['garrapanther', 'grandrey'], {
    arena: 'claws',
    keep: 0,
    dodge: true,
  }),
  B('Ayzen', '#c08aff', 5200, 70, 60, ['hado', 'reishi', 'blink'], {
    script: 'ayzen',
    arena: 'butterfly',
    keep: 280,
    dodge: true,
  }),
  B('Frizo', '#d070ff', 6000, 70, 70, ['deathbeam', 'fan'], {
    script: 'frizo',
    arena: 'planet',
    keep: 300,
    r: 24,
  }),
  B('Sukuno', '#ff3a5a', 7000, 90, 80, ['cleave', 'fuga'], {
    script: 'sukuno',
    arena: 'domain',
    keep: 250,
    dodge: true,
    dr: 0.35,
    orbit: [{ n: 4, r: 100, speed: 2.6, dmg: 30, size: 11 }],
  }),
];
export const ANIME_ENEMIES = {
  shadowclone: {
    name: 'Gölge Klon',
    hp: 40,
    speed: 140,
    r: 9,
    col: '#9bb0c8',
    shape: 'tri',
    xp: 0,
    coin: 0,
    abilities: ['dashfast'],
    armor: 0,
    kbResist: 0,
    deathBlast: { radius: 70, damage: 20 },
  },
};
