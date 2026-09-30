import { stat } from '../core/stats.js';
export const ITEMS = [
  {
    name: 'Vamp Sword',
    part: {
      mods: [{ stat: 'damage', op: 'mul', value: 1.1 }],
      triggers: [
        {
          on: 'DamageDealt',
          run: (o) => (o.hp = Math.min(stat(o, 'maxHp'), o.hp + 0.1)),
        },
      ],
    },
  },
  { name: 'Boots', part: { mods: [{ stat: 'speed', op: 'add', value: 15 }] } },
  { name: 'Amulet', part: { mods: [{ stat: 'maxHp', op: 'add', value: 30 }] } },
  {
    name: 'Ember Ring',
    part: { mods: [{ stat: 'damage', tag: 'Fire', op: 'mul', value: 2.3 }] },
  },
  {
    name: 'Piercer',
    part: { mods: [{ stat: 'armorPen', op: 'add', value: 0.15 }] },
  },
  {
    name: 'Magnet Orb',
    part: { mods: [{ stat: 'magnet', op: 'add', value: 60 }] },
  },
];
