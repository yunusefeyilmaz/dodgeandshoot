import { state, toast } from '../core/state.js';
import { stat } from '../core/stats.js';
// mods içindeki `get value()` dinamik: kill sayısına göre büyür (stat() her okuyuşta hesaplar).
export const CLASSES = {
  assassin: {
    name: 'Assassin',
    rarity: 'rare',
    desc: 'Arkadan vuruş +%40 hasar. Her öldürmede +%0.01 kritik şansı (100 kill = +%1).',
    part: {
      mods: [
        { stat: 'backstab', op: 'mul', value: 1.4 },
        {
          stat: 'critChance',
          op: 'add',
          get value() {
            return state.kills * 0.0001;
          },
        },
      ],
    },
  },
  vampire: {
    name: 'Vampire',
    rarity: 'rare',
    desc: '%10 omnivamp. Her öldürmede 3 can.',
    part: {
      mods: [{ stat: 'omnivamp', op: 'add', value: 0.1 }],
      triggers: [
        {
          on: 'Kill',
          run: (o) => (o.hp = Math.min(stat(o, 'maxHp'), o.hp + 3)),
        },
      ],
    },
  },
  tank: {
    name: 'Tank',
    rarity: 'common',
    desc: '+60 can, +12 zırh, +12 büyü direnci. Her 20 öldürmede +1 zırh.',
    part: {
      mods: [
        { stat: 'maxHp', op: 'add', value: 60 },
        { stat: 'armor', op: 'add', value: 12 },
        { stat: 'mr', op: 'add', value: 12 },
        {
          stat: 'armor',
          op: 'add',
          get value() {
            return state.kills * 0.05;
          },
        },
      ],
    },
  },
  sylas: {
    name: 'Sylas',
    rarity: 'epic',
    desc: 'Öldürdüğün düşmanın skilini çalarsın. +10 yetenek hızlandırma.',
    part: {
      mods: [{ stat: 'haste', op: 'add', value: 10 }],
      triggers: [
        {
          on: 'Kill',
          run: (o, d) => {
            for (const a of d.target.abilities)
              if (!o.abilities.includes(a)) {
                o.abilities.push(a);
                toast('Çalındı: ' + a.name);
              }
          },
        },
      ],
    },
  },
  gambler: {
    name: 'Gambler',
    rarity: 'legendary',
    desc: '+5 luck. Her öldürmede +0.05 luck (20 kill = +1). Luck: drop, coin ve nadir kart şansı.',
    part: {
      mods: [
        { stat: 'luck', op: 'add', value: 5 },
        {
          stat: 'luck',
          op: 'add',
          get value() {
            return state.kills * 0.05;
          },
        },
      ],
    },
  },
  berserker: {
    name: 'Berserker',
    rarity: 'common',
    desc: '+6 AD. Canın azaldıkça hasarın artar (en fazla +%60).',
    part: {
      mods: [
        { stat: 'ad', op: 'add', value: 6 },
        {
          stat: 'damage',
          op: 'mul',
          get value() {
            const p = state.player;
            return 1 + (1 - Math.max(0, p.hp) / stat(p, 'maxHp')) * 0.6;
          },
        },
      ],
    },
  },
  archmage: {
    name: 'Archmage',
    rarity: 'epic',
    desc: '+12 AP, +15 yetenek hızlandırma, vuruşlar %30 zincir şimşek atar.',
    part: {
      mods: [
        { stat: 'ap', op: 'add', value: 12 },
        { stat: 'haste', op: 'add', value: 15 },
        { stat: 'chain', op: 'add', value: 0.3 },
      ],
    },
  },
};
// İki class birlikteyse combo devreye girer: vuruşun bir yüzdesi kadar EKSTRA (zırh yok sayan) hasar, kritik vurabilir.
// bonus: vuruş hasarının yüzdesi · armorScale: zırhın katkısı · heal: combo hasarının can olarak dönüşü
export const COMBOS = {
  'assassin+vampire': { name: 'VamAs', bonus: 0.2, heal: 0.5 },
  'assassin+tank': { name: 'Iron Shadow', bonus: 0.1, armorScale: 0.5 },
  'tank+vampire': {
    name: 'Blood Bulwark',
    bonus: 0.1,
    heal: 0.6,
    armorScale: 0.3,
  },
  'assassin+gambler': { name: 'Lucky Blade', bonus: 0.18 },
  'gambler+sylas': { name: 'Wild Copy', bonus: 0.2 },
};
export const DEFAULT_COMBO = { name: 'Synergy', bonus: 0.12 };
