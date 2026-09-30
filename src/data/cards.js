import { state } from '../core/state.js';
import { ABILITIES } from './abilities.js';
// Kart = {name, desc, part | apply, rare?, max?}. Class ve silah upgrade kartları ui/cards.js'te dinamik eklenir.
export const CARDS = [
  {
    name: 'Fireball',
    desc: 'Yeni skill: Fireball (AP ile güçlenir)',
    part: { ability: ABILITIES.fireball },
  },
  {
    name: 'Frost Nova',
    desc: 'Yeni skill: Frost Nova (AP)',
    part: { ability: ABILITIES.nova },
  },
  {
    name: 'Fire Mastery',
    desc: 'Fire skilleri +%40',
    part: { mods: [{ stat: 'damage', tag: 'Fire', op: 'mul', value: 1.4 }] },
  },
  {
    name: 'Overcharge',
    desc: 'Tüm hasar +%15',
    part: { mods: [{ stat: 'damage', op: 'mul', value: 1.15 }] },
  },
  {
    name: 'Haste',
    desc: '+20 yetenek hızlandırma',
    part: { mods: [{ stat: 'haste', op: 'add', value: 20 }] },
  },
  {
    name: 'Thick Skin',
    desc: '+40 max can',
    part: { mods: [{ stat: 'maxHp', op: 'add', value: 40 }] },
  },
  {
    name: 'Lucky Charm',
    desc: '+4 luck',
    part: { mods: [{ stat: 'luck', op: 'add', value: 4 }] },
  },
  {
    name: 'Class Slot',
    desc: '+1 class slotu',
    rare: true,
    max: 2,
    apply: () => state.classSlots++,
  },
];
