import { stat } from '../core/stats.js';
const mod = (s, v, op = 'add', tag) => ({ stat: s, op, value: v, tag });
const dyn = (s, f) => ({
  stat: s,
  op: 'add',
  get value() {
    return f();
  },
}); // kill'e bağlı dinamik
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
  I('ring', 'Zırh Yüzüğü', 'common', '', () => ({ mods: [mod('armor', 6)] })),
  I('cloak', 'Pelerin', 'common', '', () => ({ mods: [mod('mr', 6)] })),
  I('vamp', 'Vampir Kılıcı', 'uncommon', '', () => ({
    mods: [mod('ad', 10), mod('lifesteal', 0.04)],
  })),
  I('guard', 'Muhafız Zırhı', 'uncommon', '', () => ({
    mods: [mod('armor', 15), mod('mr', 15)],
  })),
  I('orb', 'Mıknatıs Küresi', 'uncommon', '', () => ({
    mods: [mod('magnet', 60), mod('haste', 8)],
  })),
  I('lens', 'Keskin Lens', 'uncommon', '', () => ({
    mods: [mod('critChance', 0.06), mod('critDmg', 0.1)],
  })),
  I('piercer', 'Delici', 'rare', '', () => ({
    mods: [mod('armorPen', 0.12), mod('lethality', 5)],
  })),
  I('fang', 'Zehir Hançeri', 'rare', '', () => ({
    mods: [mod('ad', 6), mod('poison', 0.25)],
  })),
  I('storm', 'Fırtına Asası', 'rare', '', () => ({
    mods: [mod('ap', 8), mod('chain', 0.4)],
  })),
  I('gauntlet', 'Titan Eldiveni', 'rare', '', () => ({
    mods: [mod('ad', 6), mod('knockback', 120)],
  })),
  I('frostring', 'Buz Yüzüğü', 'rare', '', () => ({
    mods: [mod('ap', 8), mod('slow', 0.25)],
  })),
  I(
    'reaper',
    'Biçici Kılıç',
    'veryrare',
    'Aldıktan sonra her öldürme kritik şansını artırır.',
    (i) => ({
      mods: [mod('ad', 12), dyn('critChance', () => i.kills * 0.0005)],
      triggers: [track(i)],
    }),
    true,
  ),
  I('drinker', 'Ruh İçen', 'veryrare', 'Her öldürmede 4 can.', () => ({
    mods: [mod('omnivamp', 0.06), mod('maxHp', 40)],
    triggers: [
      { on: 'Kill', run: (o) => (o.hp = Math.min(stat(o, 'maxHp'), o.hp + 4)) },
    ],
  })),
  I('windcharm', 'Rüzgar Tılsımı', 'veryrare', '', () => ({
    mods: [mod('speed', 40), mod('haste', 12), mod('attackSpeed', 1.1, 'mul')],
  })),
  I(
    'voidpen',
    'Void Kolye',
    'ultrarare',
    'Hedeflerin zırh ve büyü direncini aşındırır.',
    () => ({ mods: [mod('ap', 10), mod('voidShred', 0.25)] }),
  ),
  I(
    'hunter',
    'Avcı Pençesi',
    'ultrarare',
    'Arkadan vuruş hasarını artırır.',
    () => ({ mods: [mod('ad', 14), mod('backstab', 1.2, 'mul')] }),
  ),
  I('stormcrown', 'Fırtına Tacı', 'epic', '', () => ({
    mods: [mod('chain', 0.5), mod('ap', 15), mod('haste', 15)],
  })),
  I('titanplate', 'Titan Zırhı', 'epic', '', () => ({
    mods: [mod('armor', 25), mod('mr', 25), mod('maxHp', 80)],
  })),
  I(
    'crown',
    'Kumarbaz Tacı',
    'mythic',
    'Aldıktan sonra her öldürme luck artırır.',
    (i) => ({
      mods: [mod('luck', 10), dyn('luck', () => i.kills * 0.05)],
      triggers: [track(i)],
    }),
    true,
  ),
  I('chalice', 'Kan Kadehi', 'mythic', '', () => ({
    mods: [mod('omnivamp', 0.1), mod('maxHp', 100)],
  })),
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
  I(
    'venomcrown',
    'Zehir Kraliçesi Tacı',
    'legendary',
    'Efekt gücünü artırır.',
    () => ({ mods: [mod('poison', 0.6), mod('effPower', 1.2, 'mul')] }),
  ),
];
// Kadim ve üstü kademeler (her kademe için bir saldırı, bir savunma itemi; güç kademeyle büyür)
[
  ['ancient', 'Kadim Pençe', 'Kadim Rune'],
  ['divine', 'İlahi Asa', 'İlahi Kalkan'],
  ['celestial', 'Göksel Yay', 'Göksel Pelerin'],
  ['exalted', 'Yüceltilmiş Taç', 'Yüceltilmiş Zırh'],
  ['immortal', 'Ölümsüz Kılıç', 'Ölümsüz Kalp'],
  ['eternal', 'Ebedi Alev', 'Ebedi Mühür'],
  ['transcendent', 'Aşkın Göz', 'Aşkın Cüppe'],
  ['cosmic', 'Kozmik Küre', 'Kozmik Zırh'],
  ['void', 'Boşluk Kesen', 'Boşluk Kalbi'],
  ['infinite', 'Sonsuz Halka', 'Sonsuz Çember'],
  ['omnipotent', 'Mutlak Güç', 'Mutlak Egemenlik'],
  ['secret', 'Gizli Kalıntı', 'Gizli Mühür'],
].forEach(([r, a, b], i) => {
  const k = i + 1;
  ITEMS.push(
    I('h' + k + 'a', a, r, '', () => ({
      mods: [
        mod('ad', 10 + 6 * k),
        mod('ap', 10 + 6 * k),
        mod('damage', 1 + 0.05 * k, 'mul'),
        mod('critChance', 0.02 * k),
      ],
    })),
  );
  ITEMS.push(
    I('h' + k + 'b', b, r, '', () => ({
      mods: [
        mod('maxHp', 60 + 40 * k),
        mod('armor', 10 + 5 * k),
        mod('mr', 10 + 5 * k),
        mod('regen', 0.5 * k),
        mod('luck', 2 * k),
      ],
    })),
  );
});
