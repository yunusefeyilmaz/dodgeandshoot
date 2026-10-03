import { state } from '../core/state.js';
import { ABILITIES } from './abilities.js';
const m = (stat, value, op = 'add', tag) => ({ stat, op, value, tag });
// requires: o kart bu oyunda alınmadan çıkmaz (zehir zinciri vb.) · repeat: tekrar çıkabilir (sıradanlar)
const C = (name, rarity, desc, mods, o = {}) => ({
  name,
  rarity,
  desc,
  codex: 1,
  repeat: rarity === 'common',
  part: { mods },
  ...o,
});
const S = (name, rarity, desc, ability) => ({
  name,
  rarity,
  desc,
  codex: 1,
  kind: 'Skill',
  part: { ability },
});
export const CARDS = [
  // Sıradan: küçük statlar
  C('Keskin', 'common', '+2 AD', [m('ad', 2)]),
  C('Büyücü', 'common', '+2 AP', [m('ap', 2)]),
  C('Sağlam', 'common', '+15 max can', [m('maxHp', 15)]),
  C('Çevik', 'common', '+8 hareket hızı', [m('speed', 8)]),
  C('Hassas', 'common', '+%2 kritik şansı', [m('critChance', 0.02)]),
  C('Zırhlı', 'common', '+3 zırh', [m('armor', 3)]),
  C('Zihin', 'common', '+3 yetenek hızlandırma', [m('haste', 3)]),
  S(
    'Fireball',
    'common',
    'Yeni skill: Fireball (AP ile güçlenir)',
    ABILITIES.fireball,
  ),
  S('Frost Nova', 'common', 'Yeni skill: Frost Nova (AP)', ABILITIES.nova),
  {
    name: 'Backpack',
    rarity: 'common',
    codex: 1,
    desc: '+2 envanter slotu',
    max: 4,
    apply: () => {
      state.inventory.push(null, null);
    },
  },
  // Nadir
  C('Fire Mastery', 'rare', 'Fire skilleri +%40', [
    m('damage', 1.4, 'mul', 'Fire'),
  ]),
  C('Overcharge', 'rare', 'Tüm hasar +%15', [m('damage', 1.15, 'mul')]),
  C('Lucky Charm', 'rare', '+4 luck', [m('luck', 4)], { repeat: true }),
  C('Zehirli Uçlar', 'rare', "Vuruşlar zehirler: hasarın %35'i 3 sn DoT", [
    m('poison', 0.35),
  ]),
  C(
    'Şimşek Zinciri',
    'rare',
    'Vuruşlar yakındaki 2 düşmana %50 büyü hasarı zincirler',
    [m('chain', 0.5)],
  ),
  C('Ağır Darbe', 'rare', 'Vuruşlar %30 yavaşlatır, +120 geri itme', [
    m('slow', 0.3),
    m('knockback', 120),
  ]),
  C('Delici Mermiler', 'rare', 'Tüm mermiler +1 düşman deler', [
    m('pierce', 1, 'add', 'Projectile'),
  ]),
  C('Geniş Alan', 'rare', 'Alan skilleri ve kılıç +%20 geniş', [
    m('area', 1.2, 'mul', 'Area'),
  ]),
  C('Seri El', 'rare', 'Silah saldırı hızı +%15', [
    m('attackSpeed', 1.15, 'mul', 'Weapon'),
  ]),
  C('Ölümcül Zehir', 'rare', 'Zehir gücü +%35', [m('poison', 0.35)], {
    requires: 'Zehirli Uçlar',
  }),
  C('Fırtına', 'rare', 'Zincir hasarı +%40', [m('chain', 0.4)], {
    requires: 'Şimşek Zinciri',
  }),
  // Mistik
  C(
    'Void Dokunuşu',
    'epic',
    "Hedefin zırh/MR'sini %30 aşındırır + void hasarı",
    [m('voidShred', 0.3)],
  ),
  C(
    'Toksik Salgın',
    'epic',
    'Zehir +%50, zehirli düşmanlar yavaşlar',
    [m('poison', 0.5), m('slow', 0.2)],
    { requires: 'Ölümcül Zehir' },
  ),
  C(
    'Yıldırım Çarpması',
    'epic',
    'Zincir +%60, +8 AP',
    [m('chain', 0.6), m('ap', 8)],
    { requires: 'Fırtına' },
  ),
  C(
    'Boşluk Çağrısı',
    'epic',
    'Void aşındırma +%30, +10 lethality',
    [m('voidShred', 0.3), m('lethality', 10)],
    { requires: 'Void Dokunuşu' },
  ),
  C('Çift Atış', 'epic', 'Tüm mermi skillerine +1 mermi', [
    m('multishot', 1, 'add', 'Projectile'),
  ]),
  S('Meteor', 'epic', 'Yeni skill: Meteor (büyük alan, AP)', ABILITIES.meteor),
  S(
    'Bıçak Halkası',
    'epic',
    'Yeni skill: etrafa 12 bıçak (AD)',
    ABILITIES.blades,
  ),
  {
    name: 'Class Slot',
    rarity: 'epic',
    codex: 1,
    desc: '+1 class slotu',
    max: 2,
    apply: () => state.classSlots++,
  },
  // Destansı
  C('Kaos Fırtınası', 'legendary', 'Zincir +%50, +1 mermi, hasar +%20', [
    m('chain', 0.5),
    m('multishot', 1, 'add', 'Projectile'),
    m('damage', 1.2, 'mul'),
  ]),
  C('Ölümsüz', 'legendary', '+100 can, +2 can/sn, %8 omnivamp', [
    m('maxHp', 100),
    m('regen', 2),
    m('omnivamp', 0.08),
  ]),
  C('Altın Çağ', 'legendary', '+12 luck, +%25 hasar', [
    m('luck', 12),
    m('damage', 1.25, 'mul'),
  ]),
];
