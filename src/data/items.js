import { stat } from '../core/stats.js';
const mod = (s, v) => ({ stat: s, op: 'add', value: v });
const dyn = (s, f) => ({
  stat: s,
  op: 'add',
  get value() {
    return f();
  },
}); // dinamik: instance'ın kill sayısına bağlı
const track = (i) => ({ on: 'Kill', run: () => i.kills++ });
const I = (id, name, rarity, desc, build, tracks) => ({
  id,
  name,
  rarity,
  desc,
  build,
  tracks,
});
export const ITEMS = [
  I('boots', 'Çizmeler', 'common', '', () => ({ mods: [mod('speed', 30)] })),
  I('amulet', 'Muska', 'common', '', () => ({ mods: [mod('maxHp', 30)] })),
  I('sword', 'Uzun Kılıç', 'common', '', () => ({ mods: [mod('ad', 6)] })),
  I('rod', 'Büyü Asası', 'common', '', () => ({ mods: [mod('ap', 6)] })),
  I('vamp', 'Vampir Kılıcı', 'rare', '', () => ({
    mods: [mod('ad', 10), mod('lifesteal', 0.04)],
  })),
  I('piercer', 'Delici', 'rare', '', () => ({
    mods: [mod('armorPen', 0.12), mod('lethality', 5)],
  })),
  I('orb', 'Mıknatıs Küresi', 'rare', '', () => ({
    mods: [mod('magnet', 60), mod('haste', 8)],
  })),
  I('guard', 'Muhafız Zırhı', 'rare', '', () => ({
    mods: [mod('armor', 15), mod('mr', 15)],
  })),
  I(
    'reaper',
    'Biçici Kılıç',
    'epic',
    'Aldıktan sonra her öldürme kritik şansını artırır.',
    (i) => ({
      mods: [mod('ad', 12), dyn('critChance', () => i.kills * 0.0005)],
      triggers: [track(i)],
    }),
    true,
  ),
  I('drinker', 'Ruh İçen', 'epic', 'Her öldürmede 4 can.', () => ({
    mods: [mod('omnivamp', 0.06), mod('maxHp', 40)],
    triggers: [
      { on: 'Kill', run: (o) => (o.hp = Math.min(stat(o, 'maxHp'), o.hp + 4)) },
    ],
  })),
  I(
    'crown',
    'Kumarbaz Tacı',
    'legendary',
    'Aldıktan sonra her öldürme luck artırır.',
    (i) => ({
      mods: [mod('luck', 10), dyn('luck', () => i.kills * 0.05)],
      triggers: [track(i)],
    }),
    true,
  ),
  I(
    'heart',
    'Titan Kalbi',
    'legendary',
    'Aldıktan sonra her öldürme zırh artırır.',
    (i) => ({
      mods: [mod('maxHp', 150), dyn('armor', () => i.kills * 0.1)],
      triggers: [track(i)],
    }),
    true,
  ),
  I('fang', 'Zehir Hançeri', 'rare', '', () => ({
    mods: [mod('ad', 6), mod('poison', 0.25)],
  })),
  I('storm', 'Fırtına Asası', 'rare', '', () => ({
    mods: [mod('ap', 8), mod('chain', 0.4)],
  })),
  I('gauntlet', 'Titan Eldiveni', 'rare', '', () => ({
    mods: [mod('ad', 6), mod('knockback', 120)],
  })),
  I(
    'voidpen',
    'Void Kolye',
    'epic',
    'Hedeflerin zırh ve büyü direncini aşındırır.',
    () => ({ mods: [mod('ap', 10), mod('voidShred', 0.25)] }),
  ),
];
