import { ABILITIES } from './abilities.js';
import { U } from './upgrades.js';
const m = (stat, value, op = 'add', tag) => ({ stat, op, value, tag });
const N = (id, name, desc, cost, parent, mods) => ({
  id,
  name,
  desc,
  cost,
  parent,
  mods,
});
// upgrades = oyun içi coin ağacı · tree = menüde Boss Point ile açılan kalıcı ağaç · unlock = silahın açılma şartı (değiştirilebilir)
export const WEAPONS = {
  sword: {
    name: 'Kılıç',
    icon: '⚔️',
    desc: 'Yakındaki düşmanlara küçük alanda vurur.',
    ability: ABILITIES.sword,
    unlock: null,
    upgrades: [
      U('sw_dmg', 'Kılıç hasarı', 'damage', 'mul', 1.12, 10, 1.35, undefined, {
        tag: 'Sword',
      }),
      U('sw_area', 'Kılıç alanı', 'area', 'mul', 1.12, 15, 1.4, 12, {
        tag: 'Sword',
        rarity: 'rare',
        parent: 'sw_dmg',
      }),
      U('sw_as', 'Kılıç hızı', 'attackSpeed', 'mul', 1.1, 15, 1.4, 10, {
        tag: 'Sword',
        parent: 'sw_dmg',
      }),
      U('sw_pen', 'Kılıç zırh delme', 'armorPen', 'add', 0.05, 20, 1.5, 10, {
        tag: 'Sword',
        pct: 1,
        rarity: 'rare',
        parent: 'sw_area',
      }),
      U('sw_kb', 'Ağır vuruş (geri itme)', 'knockback', 'add', 60, 15, 1.4, 8, {
        tag: 'Sword',
        parent: 'sw_area',
      }),
      U('sw_chain', 'Şok darbesi (zincir)', 'chain', 'add', 0.3, 25, 1.5, 5, {
        tag: 'Sword',
        pct: 1,
        rarity: 'rare',
        parent: 'sw_as',
      }),
    ],
    tree: [
      N('s_dmg', 'Keskin Kenar', 'Kılıç hasarı +%15', 1, null, [
        m('damage', 1.15, 'mul', 'Sword'),
      ]),
      N('s_spd', 'Hızlı El', 'Kılıç hızı +%15', 1, 's_dmg', [
        m('attackSpeed', 1.15, 'mul', 'Sword'),
      ]),
      N('s_area', 'Geniş Salvo', 'Kılıç alanı +%20', 1, 's_dmg', [
        m('area', 1.2, 'mul', 'Sword'),
      ]),
      N('s_kb', 'Ağır Darbe', 'Kılıç geri itme +100', 1, 's_spd', [
        m('knockback', 100, 'add', 'Sword'),
      ]),
      N(
        's_chain',
        'Şimşek Kılıç',
        'ÖZELLİK: Kılıç vuruşları %40 zincir şimşek atar',
        3,
        's_spd',
        [m('chain', 0.4, 'add', 'Sword')],
      ),
      N('s_pen', 'Zırh Yırtıcı', 'Kılıç %15 zırh deler', 2, 's_area', [
        m('armorPen', 0.15, 'add', 'Sword'),
      ]),
      N(
        's_poison',
        'Zehirli Bıçak',
        'ÖZELLİK: Kılıç vuruşları zehirler (%40)',
        3,
        's_pen',
        [m('poison', 0.4, 'add', 'Sword')],
      ),
      N(
        's_ult',
        'Kılıç Ustası',
        'Kılıç hasarı +%30, alanı +%20',
        4,
        's_chain',
        [m('damage', 1.3, 'mul', 'Sword'), m('area', 1.2, 'mul', 'Sword')],
      ),
    ],
  },
  bow: {
    name: 'Yay',
    icon: '🏹',
    desc: 'Uzaktan otomatik ok atar. Delme ve çoklu ok ile güçlenir.',
    ability: ABILITIES.bow,
    unlock: { boss: 2, text: '2. bossu (tur 10) yen' },
    upgrades: [
      U('bow_dmg', 'Ok hasarı', 'damage', 'mul', 1.12, 10, 1.35, undefined, {
        tag: 'Bow',
      }),
      U('bow_as', 'Ok atış hızı', 'attackSpeed', 'mul', 1.1, 15, 1.4, 10, {
        tag: 'Bow',
        parent: 'bow_dmg',
      }),
      U('bow_pierce', 'Ok delmesi', 'pierce', 'add', 1, 20, 1.6, 5, {
        tag: 'Bow',
        rarity: 'rare',
        parent: 'bow_dmg',
      }),
      U('bow_multi', 'Ek ok', 'multishot', 'add', 1, 40, 1.9, 4, {
        tag: 'Bow',
        rarity: 'epic',
        parent: 'bow_pierce',
      }),
      U('bow_pen', 'Ok zırh delme', 'armorPen', 'add', 0.05, 20, 1.5, 10, {
        tag: 'Bow',
        pct: 1,
        rarity: 'rare',
        parent: 'bow_pierce',
      }),
      U('bow_poison', 'Zehirli ok', 'poison', 'add', 0.3, 25, 1.5, 5, {
        tag: 'Bow',
        pct: 1,
        rarity: 'rare',
        parent: 'bow_as',
      }),
    ],
    tree: [
      N('b_dmg', 'Keskin Uç', 'Ok hasarı +%15', 1, null, [
        m('damage', 1.15, 'mul', 'Bow'),
      ]),
      N('b_spd', 'Hızlı Çekiş', 'Atış hızı +%15', 1, 'b_dmg', [
        m('attackSpeed', 1.15, 'mul', 'Bow'),
      ]),
      N('b_pierce', 'Delici Ok', 'Oklar +1 düşman deler', 1, 'b_dmg', [
        m('pierce', 1, 'add', 'Bow'),
      ]),
      N('b_crit', 'Keskin Göz', 'Ok kritik şansı +%8', 2, 'b_spd', [
        m('critChance', 0.08, 'add', 'Bow'),
      ]),
      N('b_poison', 'Zehirli Ok', 'ÖZELLİK: Oklar zehirler (%35)', 2, 'b_spd', [
        m('poison', 0.35, 'add', 'Bow'),
      ]),
      N('b_multi', 'Çift Ok', 'ÖZELLİK: +1 ok', 3, 'b_pierce', [
        m('multishot', 1, 'add', 'Bow'),
      ]),
      N(
        'b_chain',
        'Yıldırım Oku',
        'ÖZELLİK: Oklar %40 zincir şimşek atar',
        3,
        'b_poison',
        [m('chain', 0.4, 'add', 'Bow')],
      ),
      N('b_ult', 'Okçu Ustası', '+1 delme, hasar +%25', 4, 'b_multi', [
        m('pierce', 1, 'add', 'Bow'),
        m('damage', 1.25, 'mul', 'Bow'),
      ]),
    ],
  },
};
