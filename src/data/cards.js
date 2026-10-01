import { state } from '../core/state.js';
import { ABILITIES } from './abilities.js';
// Kart = {name, desc, rarity, part | apply, max?}. Class ve silah upgrade kartları ui/cards.js'te dinamik eklenir.
export const CARDS = [
  {
    name: 'Fireball',
    rarity: 'common',
    desc: 'Yeni skill: Fireball (AP ile güçlenir)',
    part: { ability: ABILITIES.fireball },
  },
  {
    name: 'Frost Nova',
    rarity: 'common',
    desc: 'Yeni skill: Frost Nova (AP)',
    part: { ability: ABILITIES.nova },
  },
  {
    name: 'Fire Mastery',
    rarity: 'rare',
    desc: 'Fire skilleri +%40',
    part: { mods: [{ stat: 'damage', tag: 'Fire', op: 'mul', value: 1.4 }] },
  },
  {
    name: 'Overcharge',
    rarity: 'rare',
    desc: 'Tüm hasar +%15',
    part: { mods: [{ stat: 'damage', op: 'mul', value: 1.15 }] },
  },
  {
    name: 'Haste',
    rarity: 'common',
    desc: '+20 yetenek hızlandırma',
    part: { mods: [{ stat: 'haste', op: 'add', value: 20 }] },
  },
  {
    name: 'Thick Skin',
    rarity: 'common',
    desc: '+40 max can',
    part: { mods: [{ stat: 'maxHp', op: 'add', value: 40 }] },
  },
  {
    name: 'Lucky Charm',
    rarity: 'rare',
    desc: '+4 luck',
    part: { mods: [{ stat: 'luck', op: 'add', value: 4 }] },
  },
  {
    name: 'Backpack',
    rarity: 'common',
    desc: '+2 envanter slotu',
    max: 4,
    apply: () => {
      state.inventory.push(null, null);
    },
  },
  {
    name: 'Class Slot',
    rarity: 'epic',
    desc: '+1 class slotu',
    max: 2,
    apply: () => state.classSlots++,
  },
  {
    name: 'Zehirli Uçlar',
    rarity: 'rare',
    desc: "Vuruşlar zehirler: hasarın %35'i 3 sn boyunca DoT",
    part: { mods: [{ stat: 'poison', op: 'add', value: 0.35 }] },
  },
  {
    name: 'Şimşek Zinciri',
    rarity: 'rare',
    desc: 'Vuruşlar yakındaki 2 düşmana %50 büyü hasarı zincirler',
    part: { mods: [{ stat: 'chain', op: 'add', value: 0.5 }] },
  },
  {
    name: 'Ağır Darbe',
    rarity: 'common',
    desc: 'Vuruşlar %30 yavaşlatır, +120 geri itme',
    part: {
      mods: [
        { stat: 'slow', op: 'add', value: 0.3 },
        { stat: 'knockback', op: 'add', value: 120 },
      ],
    },
  },
  {
    name: 'Void Dokunuşu',
    rarity: 'epic',
    desc: "Hedefin zırh/MR'sini %30 aşındırır + void hasarı",
    part: { mods: [{ stat: 'voidShred', op: 'add', value: 0.3 }] },
  },
];
