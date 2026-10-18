import { ABILITIES } from './abilities.js';
import { U } from './upgrades.js';
const m = (stat, value, op = 'add', tag) => ({ stat, op, value, tag });
const N = (id, name, desc, cost, parent, mods, part) => ({
  id,
  name,
  desc,
  cost,
  parent,
  mods,
  part,
});
// upgrades = oyun içi altın ağacı · tree = menüde Boss Puanı ile açılan kalıcı ağaç · unlock = silahın açılma şartı (değiştirilebilir)
export const WEAPONS = {
  sword: {
    name: 'Kılıç',
    icon: '⚔️',
    desc: 'Yakındaki düşmanlara küçük alanda vurur.',
    ability: ABILITIES.sword,
    unlock: null,
    upgrades: [
      U('sw_dmg', 'Kılıç hasarı', 'damage', 'mul', 1.08, 10, 1.35, undefined, {
        tag: 'Sword',
      }),
      U('sw_area', 'Kılıç alanı', 'area', 'mul', 1.05, 15, 1.4, 12, {
        tag: 'Sword',
        rarity: 'rare',
        parent: 'sw_dmg',
      }),
      U('sw_as', 'Kılıç hızı', 'attackSpeed', 'mul', 1.06, 15, 1.4, 10, {
        tag: 'Sword',
        parent: 'sw_dmg',
      }),
      U('sw_pen', 'Kılıç zırh delme', 'armorPen', 'add', 0.04, 20, 1.5, 10, {
        tag: 'Sword',
        pct: 1,
        rarity: 'rare',
        parent: 'sw_area',
      }),
      U(
        'sw_crit',
        'Kılıç kritik şansı',
        'critChance',
        'add',
        0.02,
        15,
        1.4,
        10,
        { tag: 'Sword', pct: 1, parent: 'sw_as' },
      ),
      U('sw_kb', 'Ağır vuruş (geri itme)', 'knockback', 'add', 60, 15, 1.4, 8, {
        tag: 'Sword',
        parent: 'sw_area',
      }),
    ],
    tree: [
      N('s_dmg', 'Keskin Kenar', 'Kılıç hasarı +%10', 1, null, [
        m('damage', 1.1, 'mul', 'Sword'),
      ]),
      N('s_spd', 'Hızlı El', 'Kılıç hızı +%10', 1, 's_dmg', [
        m('attackSpeed', 1.1, 'mul', 'Sword'),
      ]),
      N('s_area', 'Geniş Salvo', 'Kılıç alanı +%6', 1, 's_dmg', [
        m('area', 1.06, 'mul', 'Sword'),
      ]),
      N(
        's_cresc',
        'Hilal Dalgası',
        'ÖZELLİK: Her 3. vuruşta delici bir hilal dalgası fırlatır',
        3,
        's_spd',
        [m('crescent', 1, 'add', 'Sword')],
      ),
      N(
        's_triple',
        'Üçleme',
        'ÖZELLİK: Her 3. vuruş +%50 hasar ve +%35 alanla vurur',
        3,
        's_area',
        [m('surge', 1, 'add', 'Sword')],
      ),
      N(
        's_vamp',
        'Kan Çizgisi',
        "Kılıç vuruşları hasarın %6'sı kadar can verir",
        2,
        's_cresc',
        [m('lifesteal', 0.06, 'add', 'Sword')],
      ),
      N(
        's_pull',
        'Girdap',
        'ÖZELLİK: Vuruşlar düşmanları sana doğru çeker',
        2,
        's_triple',
        [m('pull', 40, 'add', 'Sword')],
      ),
      N(
        's_parry',
        'Karşı Duruş',
        'ÖZELLİK: Kılıçla öldürünce 1 dash hakkı geri gelir',
        3,
        's_pull',
        [m('refreshDash', 1, 'add', 'Sword')],
      ),
      N(
        's_ult',
        'Kılıç Ustası',
        'Hasar +%25; hilal dalgası %50 güçlenir',
        4,
        's_vamp',
        [m('damage', 1.25, 'mul', 'Sword'), m('crescent', 0.5, 'add', 'Sword')],
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
      U('bow_dmg', 'Ok hasarı', 'damage', 'mul', 1.08, 10, 1.35, undefined, {
        tag: 'Bow',
      }),
      U('bow_as', 'Ok atış hızı', 'attackSpeed', 'mul', 1.06, 15, 1.4, 10, {
        tag: 'Bow',
        parent: 'bow_dmg',
      }),
      U('bow_spd', 'Ok hızı', 'projSpeed', 'mul', 1.06, 12, 1.35, 8, {
        tag: 'Bow',
        parent: 'bow_dmg',
      }),
      U('bow_crit', 'Ok kritik şansı', 'critChance', 'add', 0.02, 15, 1.4, 10, {
        tag: 'Bow',
        pct: 1,
        parent: 'bow_as',
      }),
      U('bow_pen', 'Ok zırh delme', 'armorPen', 'add', 0.04, 20, 1.5, 10, {
        tag: 'Bow',
        pct: 1,
        rarity: 'rare',
        parent: 'bow_spd',
      }),
    ],
    tree: [
      N('b_dmg', 'Keskin Uç', 'Ok hasarı +%10', 1, null, [
        m('damage', 1.1, 'mul', 'Bow'),
      ]),
      N('b_spd', 'Hızlı Çekiş', 'Atış hızı +%10', 1, 'b_dmg', [
        m('attackSpeed', 1.1, 'mul', 'Bow'),
      ]),
      N('b_proj', 'Hafif Ok', 'Ok hızı +%25', 1, 'b_dmg', [
        m('projSpeed', 1.25, 'mul', 'Bow'),
      ]),
      N(
        'b_ric',
        'Sekme',
        'ÖZELLİK: Oklar vurduktan sonra yakındaki başka bir düşmana 2 kez seker',
        3,
        'b_spd',
        [m('ricochet', 2, 'add', 'Bow')],
      ),
      N(
        'b_volley',
        'Ok Yağmuru',
        'ÖZELLİK: Her 5. atışta hedefin çevresine 5 ok yağar',
        3,
        'b_proj',
        [m('volley', 1, 'add', 'Bow')],
      ),
      N(
        'b_focus',
        'Odak',
        'ÖZELLİK: Aynı hedefe art arda vuruşlarda her seferinde +%6 hasar (en fazla 5 kez)',
        2,
        'b_ric',
        [m('focus', 0.06, 'add', 'Bow')],
      ),
      N(
        'b_pen',
        'Zırh Delici Uç',
        'Oklar %15 zırh deler, +3 ölümcüllük',
        2,
        'b_volley',
        [m('armorPen', 0.15, 'add', 'Bow'), m('lethality', 3, 'add', 'Bow')],
      ),
      N(
        'b_home',
        'Hayalet Ok',
        'ÖZELLİK: Oklar yakındaki düşmanlara doğru döner',
        3,
        'b_focus',
        [m('homing', 4, 'add', 'Bow')],
      ),
      N('b_ult', 'Okçu Ustası', '+1 ok, hasar +%20', 4, 'b_pen', [
        m('multishot', 1, 'add', 'Bow'),
        m('damage', 1.2, 'mul', 'Bow'),
      ]),
    ],
  },
  staff: {
    name: 'Asa',
    icon: '🪄',
    desc: 'Büyü mermileri atar (AP ile güçlenir). Zincir, delme ve patlama ile büyür.',
    ability: ABILITIES.staff,
    unlock: { boss: 4, text: '4. bossu (tur 20) yen' },
    upgrades: [
      U('st_dmg', 'Asa hasarı', 'damage', 'mul', 1.08, 10, 1.35, undefined, {
        tag: 'Staff',
      }),
      U('st_rng', 'Asa menzili', 'area', 'mul', 1.05, 15, 1.4, 8, {
        tag: 'Staff',
        parent: 'st_dmg',
      }),
      U('st_as', 'Asa hızı', 'attackSpeed', 'mul', 1.06, 15, 1.4, 10, {
        tag: 'Staff',
        parent: 'st_dmg',
      }),
      U('st_crit', 'Asa kritik şansı', 'critChance', 'add', 0.02, 15, 1.4, 10, {
        tag: 'Staff',
        pct: 1,
        parent: 'st_as',
      }),
      U('st_spd', 'Büyü hızı', 'projSpeed', 'mul', 1.06, 12, 1.35, 8, {
        tag: 'Staff',
        parent: 'st_dmg',
      }),
    ],
    tree: [
      N('t_dmg', 'Büyülü Uç', 'Asa hasarı +%10', 1, null, [
        m('damage', 1.1, 'mul', 'Staff'),
      ]),
      N('t_spd', 'Akıcı Büyü', 'Asa hızı +%10', 1, 't_dmg', [
        m('attackSpeed', 1.1, 'mul', 'Staff'),
      ]),
      N(
        't_orb',
        'Küre Dönüşü',
        'ÖZELLİK: Etrafında dönen 2 büyü küresi (temas hasarı verir)',
        3,
        't_dmg',
        [],
        {
          orbit: {
            n: 2,
            r: 70,
            speed: 3.4,
            dmg: 12,
            size: 8,
            type: 'magic',
            col: '#c9a8ff',
            tags: ['Orbit'],
          },
        },
      ),
      N(
        't_over',
        'Aşırı Yükleme',
        'ÖZELLİK: Her 3. büyü +%50 hasar, +1 delme, daha büyük',
        3,
        't_spd',
        [m('surge', 1, 'add', 'Staff')],
      ),
      N(
        't_spark',
        'Kıvılcım',
        'ÖZELLİK: Büyü vurduktan sonra yakındaki bir düşmana 1 kez seker',
        2,
        't_over',
        [m('ricochet', 1, 'add', 'Staff')],
      ),
      N(
        't_home',
        'Ruh Peşinde',
        'ÖZELLİK: Büyüler yakındaki düşmanlara doğru döner',
        3,
        't_orb',
        [m('homing', 3.5, 'add', 'Staff')],
      ),
      N(
        't_nova',
        'Yıldız Patlaması',
        "ÖZELLİK: Asayla öldürdüğün düşman patlar (çevreye hasarının %40'ı)",
        3,
        't_spark',
        [m('killNova', 0.4, 'add', 'Staff')],
      ),
      N('t_ult', 'Arkmaj', 'Asa hasarı +%25, +1 ek büyü', 4, 't_nova', [
        m('damage', 1.25, 'mul', 'Staff'),
        m('multishot', 1, 'add', 'Staff'),
      ]),
    ],
  },
};
