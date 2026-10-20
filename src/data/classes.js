import { state, toast } from '../core/state.js';
import { stat } from '../core/stats.js';
// Sylas sadece GÜVENLİ skilleri çalar: Dash/Fuse(intihar)/Blink/Summon/HealAllies oyuncuda NaN, ölüm ve siyah ekran yapıyordu
const SAFE = new Set([
  'Projectile',
  'Nova',
  'Rain',
  'Cero',
  'Gust',
  'Tornado',
  'Slowfield',
]);
export const canSteal = (a) =>
  !a.suicide && a.effects.every((f) => SAFE.has(f.type));
// mods içindeki `get value()` dinamik: öldürme sayısına göre büyür (stat() her okuyuşta hesaplar).
export const CLASSES = {
  assassin: {
    name: 'Suikastçı',
    rarity: 'rare',
    desc: 'Arkadan vuruş +%40 hasar. Her öldürmede +%0.01 kritik şansı (100 öldürme = +%1).',
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
    name: 'Vampir',
    rarity: 'uncommon',
    desc: '%10 tam can çalma. Her öldürmede 3 can.',
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
    name: 'Savunmacı',
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
    rarity: 'ultrarare',
    desc: 'Öldürdüğün düşmanın (güvenli) skilini çalarsın. +10 yetenek hızlandırma.',
    part: {
      mods: [{ stat: 'haste', op: 'add', value: 10 }],
      triggers: [
        {
          on: 'Kill',
          run: (o, d) => {
            for (const a of d.target.abilities)
              if (
                canSteal(a) &&
                o.abilities.length < 999 &&
                !o.abilities.includes(a)
              ) {
                o.abilities.push(a);
                toast('Çalındı: ' + a.name);
              }
          },
        },
      ],
    },
  },
  gambler: {
    name: 'Kumarbaz',
    rarity: 'mythic',
    desc: '+5 luck. Her öldürmede +0.05 luck (20 öldürme = +1). Luck: drop, altın ve nadir kart şansı.',
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
    name: 'Çılgın Savaşçı',
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
    name: 'Baş Büyücü',
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
// İki sınıf birlikteyse kombo devreye girer: vuruşun bir yüzdesi kadar EKSTRA (zırh yok sayan) hasar, kritik vurabilir.
// bonus: vuruş hasarının yüzdesi · armorScale: zırhın katkısı · heal: kombo hasarının can olarak dönüşü
export const KOMBOS = {
  'assassin+vampire': { name: 'VamAs', bonus: 0.2, heal: 0.5 },
  'assassin+tank': { name: 'Demir Gölge', bonus: 0.1, armorScale: 0.5 },
  'tank+vampire': {
    name: 'Kan Siperi',
    bonus: 0.1,
    heal: 0.6,
    armorScale: 0.3,
  },
  'assassin+gambler': { name: 'Şanslı Bıçak', bonus: 0.18 },
  'gambler+sylas': { name: 'Vahşi Kopya', bonus: 0.2 },
};
export const DEFAULT_KOMBO = { name: 'Uyum', bonus: 0.12 };

// Silah + sınıf sinerjileri: o silahla o sınıfı birlikte kullanırsan ekstra bonus
export const SYNERGIES = {
  'sword:assassin': {
    name: 'Gölge Bıçak',
    desc: 'Kılıçla arkadan vuruş +%25 daha güçlü.',
    mods: [{ stat: 'backstab', op: 'mul', value: 1.25, tag: 'Sword' }],
  },
  'sword:tank': {
    name: 'Kalkan Darbesi',
    desc: 'Kılıç +150 geri itme, +8 zırh.',
    mods: [
      { stat: 'knockback', op: 'add', value: 150, tag: 'Sword' },
      { stat: 'armor', op: 'add', value: 8 },
    ],
  },
  'sword:berserker': {
    name: 'Kan Çılgınlığı',
    desc: 'Kılıç hızı +%20.',
    mods: [{ stat: 'attackSpeed', op: 'mul', value: 1.2, tag: 'Sword' }],
  },
  'sword:vampire': {
    name: 'Kan İçen Kılıç',
    desc: 'Kılıç lifesteal +%8.',
    mods: [{ stat: 'lifesteal', op: 'add', value: 0.08, tag: 'Sword' }],
  },
  'bow:assassin': {
    name: 'Keskin Nişancı',
    desc: 'Ok kritik hasarı +%40.',
    mods: [{ stat: 'critDmg', op: 'add', value: 0.4, tag: 'Bow' }],
  },
  'bow:archmage': {
    name: 'Arcane Ok',
    desc: 'Oklar %35 zincir şimşek atar.',
    mods: [{ stat: 'chain', op: 'add', value: 0.35, tag: 'Bow' }],
  },
  'bow:gambler': {
    name: 'Şanslı Atış',
    desc: 'Ok kritik şansı +%10, +3 luck.',
    mods: [
      { stat: 'critChance', op: 'add', value: 0.1, tag: 'Bow' },
      { stat: 'luck', op: 'add', value: 3 },
    ],
  },
  'bow:berserker': {
    name: 'Çılgın Okçu',
    desc: 'Yaya +1 ok.',
    mods: [{ stat: 'multishot', op: 'add', value: 1, tag: 'Bow' }],
  },
};
SYNERGIES['staff:archmage'] = {
  name: 'Büyü Fırtınası',
  desc: 'Asa %30 zincir, +10 AP.',
  mods: [
    { stat: 'chain', op: 'add', value: 0.3, tag: 'Staff' },
    { stat: 'ap', op: 'add', value: 10 },
  ],
};
SYNERGIES['staff:vampire'] = {
  name: 'Ruh Emici',
  desc: "Asa hasarının %10'u can olarak döner.",
  mods: [{ stat: 'lifesteal', op: 'add', value: 0.1, tag: 'Staff' }],
};
SYNERGIES['staff:assassin'] = {
  name: 'Sessiz Büyü',
  desc: 'Asa kritik hasarı +%40.',
  mods: [{ stat: 'critDmg', op: 'add', value: 0.4, tag: 'Staff' }],
};
SYNERGIES['staff:gambler'] = {
  name: 'Kader Büyüsü',
  desc: 'Asa kritik şansı +%10, +3 luck.',
  mods: [
    { stat: 'critChance', op: 'add', value: 0.1, tag: 'Staff' },
    { stat: 'luck', op: 'add', value: 3 },
  ],
};
SYNERGIES['staff:tank'] = {
  name: 'Kalkan Büyüsü',
  desc: '+10 zırh, +10 büyü direnci, asa hızı +%10.',
  mods: [
    { stat: 'armor', op: 'add', value: 10 },
    { stat: 'mr', op: 'add', value: 10 },
    { stat: 'attackSpeed', op: 'mul', value: 1.1, tag: 'Staff' },
  ],
};
// ——— F3: yeni sınıflar ———
Object.assign(CLASSES, {
  paladin: {
    name: 'Paladin',
    rarity: 'common',
    desc: "+50 can, +8 zırh. Canın %50'nin altındayken yenileme +3/sn.",
    part: {
      mods: [
        { stat: 'maxHp', op: 'add', value: 50 },
        { stat: 'armor', op: 'add', value: 8 },
        {
          stat: 'regen',
          op: 'add',
          get value() {
            const p = state.player;
            return p.hp < stat(p, 'maxHp') * 0.5 ? 3 : 0;
          },
        },
      ],
    },
  },
  ranger: {
    name: 'Avcı',
    rarity: 'uncommon',
    desc: 'Kritik şansı +%8, mermi hızı +%20, mermiler +1 düşmanı deler.',
    part: {
      mods: [
        { stat: 'critChance', op: 'add', value: 0.08 },
        { stat: 'projSpeed', op: 'mul', value: 1.2 },
        { stat: 'pierce', op: 'add', value: 1, tag: 'Projectile' },
      ],
    },
  },
  pyro: {
    name: 'Piroman',
    rarity: 'rare',
    desc: '+8 AP. Vuruşlar %25 ihtimalle patlar (alan hasarı).',
    part: {
      mods: [
        { stat: 'ap', op: 'add', value: 8 },
        { stat: 'blast', op: 'add', value: 0.25 },
      ],
    },
  },
  monk: {
    name: 'Keşiş',
    rarity: 'epic',
    desc: '+1 dash hakkı, dash dolumu %15 hızlı, hareket hızı +%10, +20 yetenek hızlandırma.',
    part: {
      mods: [
        { stat: 'dashCharges', op: 'add', value: 1 },
        { stat: 'dashCdMul', op: 'mul', value: 0.85 },
        { stat: 'speed', op: 'mul', value: 1.1 },
        { stat: 'haste', op: 'add', value: 20 },
      ],
    },
  },
  voidwalker: {
    name: 'Boşluk Yürüyücüsü',
    rarity: 'legendary',
    desc: 'Vuruşlar zırh ve büyü direncini %25 aşındırır, %4 tam can çalma, %15 büyü delme.',
    part: {
      mods: [
        { stat: 'voidShred', op: 'add', value: 0.25 },
        { stat: 'omnivamp', op: 'add', value: 0.04 },
        { stat: 'magicPen', op: 'add', value: 0.15 },
      ],
    },
  },
});
const SY = (w, c, name, desc, mods) =>
  (SYNERGIES[w + ':' + c] = { name, desc, mods });
const T = (stat, op, value, tag) => ({ stat, op, value, tag });
SY('sword', 'paladin', 'Kutsal Kılıç', 'Kılıç alanı +%10, +10 büyü direnci.', [
  T('area', 'mul', 1.1, 'Sword'),
  T('mr', 'add', 10),
]);
SY('bow', 'paladin', 'Muhafız Oku', 'Ok hasarı +%12, +8 zırh.', [
  T('damage', 'mul', 1.12, 'Bow'),
  T('armor', 'add', 8),
]);
SY('staff', 'paladin', 'Şifa Asası', 'Asa lifesteal +%6, +10 zırh.', [
  T('lifesteal', 'add', 0.06, 'Staff'),
  T('armor', 'add', 10),
]);
SY('sword', 'ranger', 'Fırlatma Kılıcı', 'Kılıç kritik şansı +%8.', [
  T('critChance', 'add', 0.08, 'Sword'),
]);
SY('bow', 'ranger', 'Usta Avcı', 'Yaya +1 ok, ok hızı +%15.', [
  T('multishot', 'add', 1, 'Bow'),
  T('projSpeed', 'mul', 1.15, 'Bow'),
]);
SY('staff', 'ranger', 'Güdümlü Büyü', 'Asa büyüleri hafif güdümlü (+3).', [
  T('homing', 'add', 3, 'Staff'),
]);
SY('sword', 'pyro', 'Alev Kılıcı', 'Kılıç %20 patlar.', [
  T('blast', 'add', 0.2, 'Sword'),
]);
SY('bow', 'pyro', 'Ateş Oku', 'Oklar %25 patlar, +6 AP.', [
  T('blast', 'add', 0.25, 'Bow'),
  T('ap', 'add', 6),
]);
SY('staff', 'pyro', 'Cehennem Asası', 'Asa hasarı +%15, %20 patlama.', [
  T('damage', 'mul', 1.15, 'Staff'),
  T('blast', 'add', 0.2, 'Staff'),
]);
SY('sword', 'monk', 'Akış Yumruğu', 'Kılıç hızı +%20.', [
  T('attackSpeed', 'mul', 1.2, 'Sword'),
]);
SY('bow', 'monk', 'Rüzgar Oku', 'Ok hızı +%20, atış hızı +%10.', [
  T('projSpeed', 'mul', 1.2, 'Bow'),
  T('attackSpeed', 'mul', 1.1, 'Bow'),
]);
SY('staff', 'monk', 'Zihin Akışı', 'Asa hızı +%15, +10 hızlandırma.', [
  T('attackSpeed', 'mul', 1.15, 'Staff'),
  T('haste', 'add', 10),
]);
SY('sword', 'voidwalker', 'Boşluk Kesiği', 'Kılıç %15 void aşındırma.', [
  T('voidShred', 'add', 0.15, 'Sword'),
]);
SY('bow', 'voidwalker', 'Boşluk Oku', 'Oklar %15 zırh deler.', [
  T('armorPen', 'add', 0.15, 'Bow'),
]);
SY('staff', 'voidwalker', 'Karanlık Büyü', 'Asa %15 büyü deler, +8 AP.', [
  T('magicPen', 'add', 0.15, 'Staff'),
  T('ap', 'add', 8),
]);
