import { ABILITIES } from './abilities.js';
import { U } from './upgrades.js';
// Her silahın kendi upgrade listesi. tag: sadece o silahın skilline uygulanır. Bu upgrade'ler kart olarak da gelebilir.
export const WEAPONS = {
  bow: {
    name: 'Ok',
    desc: 'Uzaktan otomatik ateş. Delme ve çoklu ok ile güçlenir.',
    ability: ABILITIES.bow,
    upgrades: [
      U('bow_dmg', 'Ok hasarı', 'damage', 'mul', 1.12, 10, 1.35, undefined, {
        tag: 'Bow',
      }),
      U(
        'bow_pierce',
        'Ok delmesi (kaç düşmanı deler)',
        'pierce',
        'add',
        1,
        20,
        1.6,
        5,
        { tag: 'Bow', rarity: 'rare' },
      ),
      U('bow_multi', 'Ek ok', 'multishot', 'add', 1, 40, 1.9, 4, {
        tag: 'Bow',
        rarity: 'epic',
      }),
      U('bow_pen', 'Ok zırh delme', 'armorPen', 'add', 0.05, 20, 1.5, 10, {
        tag: 'Bow',
        pct: 1,
        rarity: 'rare',
      }),
      U('bow_as', 'Ok atış hızı', 'attackSpeed', 'mul', 1.1, 15, 1.4, 10, {
        tag: 'Bow',
      }),
      U('bow_poison', 'Zehirli ok', 'poison', 'add', 0.3, 25, 1.5, 5, {
        tag: 'Bow',
        pct: 1,
        rarity: 'rare',
      }),
    ],
  },
  sword: {
    name: 'Kılıç',
    desc: 'Yakındaki düşmanlara küçük alanda vurur. Hasar ve alan büyür.',
    ability: ABILITIES.sword,
    upgrades: [
      U('sw_dmg', 'Kılıç hasarı', 'damage', 'mul', 1.12, 10, 1.35, undefined, {
        tag: 'Sword',
      }),
      U('sw_area', 'Kılıç alanı', 'area', 'mul', 1.12, 15, 1.4, 12, {
        tag: 'Sword',
        rarity: 'rare',
      }),
      U('sw_pen', 'Kılıç zırh delme', 'armorPen', 'add', 0.05, 20, 1.5, 10, {
        tag: 'Sword',
        pct: 1,
        rarity: 'rare',
      }),
      U('sw_as', 'Kılıç hızı', 'attackSpeed', 'mul', 1.1, 15, 1.4, 10, {
        tag: 'Sword',
      }),
      U('sw_chain', 'Şok darbesi (zincir)', 'chain', 'add', 0.3, 25, 1.5, 5, {
        tag: 'Sword',
        pct: 1,
        rarity: 'rare',
      }),
      U('sw_kb', 'Ağır vuruş (geri itme)', 'knockback', 'add', 60, 15, 1.4, 8, {
        tag: 'Sword',
      }),
    ],
  },
};
