// Skill = sadece veri. Kim kullanırsa kullansın (oyuncu, düşman, boss) aynı şekilde çalışır.
export const ABILITIES = {
  bolt: {
    id: 'bolt',
    name: 'Arcane Bolt',
    tags: ['Arcane', 'Projectile'],
    cooldown: 0.8,
    effects: [{ type: 'Projectile', damage: 12, speed: 380, color: '#8ab4ff' }],
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    tags: ['Fire', 'Projectile'],
    cooldown: 1.6,
    effects: [{ type: 'Projectile', damage: 30, speed: 300, color: '#ff8a3d' }],
  },
  nova: {
    id: 'nova',
    name: 'Frost Nova',
    tags: ['Ice', 'Area'],
    cooldown: 3,
    effects: [{ type: 'Nova', damage: 18, radius: 95 }],
  },
  spit: {
    id: 'spit',
    name: 'Dark Spit',
    tags: ['Dark', 'Projectile'],
    cooldown: 2.6,
    effects: [{ type: 'Projectile', damage: 8, speed: 200, color: '#c46bff' }],
  },
  fan: {
    id: 'fan',
    name: 'Shadow Fan',
    tags: ['Dark', 'Projectile'],
    cooldown: 2.2,
    effects: [
      {
        type: 'Projectile',
        damage: 8,
        speed: 210,
        count: 5,
        spread: 0.8,
        color: '#b04fff',
      },
    ],
  },
  ring: {
    id: 'ring',
    name: 'Blood Ring',
    tags: ['Blood', 'Projectile'],
    cooldown: 3,
    effects: [
      {
        type: 'Projectile',
        damage: 7,
        speed: 170,
        count: 14,
        radial: true,
        color: '#ff4f6a',
      },
    ],
  },
  quake: {
    id: 'quake',
    name: 'Quake',
    tags: ['Earth', 'Area'],
    cooldown: 3.5,
    range: 120,
    effects: [{ type: 'Nova', damage: 20, radius: 110 }],
  },
};
