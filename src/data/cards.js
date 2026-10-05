import { state } from '../core/state.js';
import { ABILITIES } from './abilities.js';
import { PETS } from './pets.js';
import { addPet } from '../systems/pets.js';
const m = (stat, value, op = 'add', tag) => ({ stat, op, value, tag });
// requires: o kart bu oyunda alınmadan çıkmaz · repeat: tekrar çıkabilir (sıradanlar) · cond: ek koşul · codex: başarılar sekmesinde listelenir
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
const scythe = (n, r, speed, dmg, size) => ({
  orbit: {
    n,
    r,
    speed,
    dmg,
    size,
    tags: ['Orbit'],
    pos: [],
    hit: new Map(),
    a: 0,
  },
});
export const CARDS = [
  // Yaygın
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
  S(
    'Frost Nova',
    'common',
    'Yeni skill: Frost Nova, yavaşlatır (AP)',
    ABILITIES.nova,
  ),
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
  // Yaygın Olmayan
  C('Fire Mastery', 'uncommon', 'Fire skilleri +%25', [
    m('damage', 1.25, 'mul', 'Fire'),
  ]),
  C('Overcharge', 'uncommon', 'Tüm hasar +%10', [m('damage', 1.1, 'mul')]),
  C('Lucky Charm', 'uncommon', '+3 luck', [m('luck', 3)], {
    repeat: true,
    max: 6,
  }),
  C('Delici Mermiler', 'uncommon', 'Tüm mermiler +1 düşman deler', [
    m('pierce', 1, 'add', 'Projectile'),
  ]),
  C('Seri El', 'uncommon', 'Silah saldırı hızı +%10', [
    m('attackSpeed', 1.1, 'mul', 'Weapon'),
  ]),
  C('Geniş Alan', 'uncommon', 'Alan skilleri ve kılıç +%10 geniş', [
    m('area', 1.1, 'mul', 'Area'),
  ]),
  C('Efekt Gücü', 'uncommon', 'Zehir/zincir/yavaşlatma/void +%10 güçlü', [
    m('effPower', 1.1, 'mul'),
  ]),
  // Nadir
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
  C('Direnç Kırıcı', 'rare', 'Düşmanların efekt dirençlerini %15 deler', [
    m('resPen', 0.15),
  ]),
  C('Kritik Ustası', 'rare', 'Kritik hasarı +%20', [m('critDmg', 0.2)]),
  // Çok Nadir
  C('Ölümcül Zehir', 'veryrare', 'Zehir gücü +%35', [m('poison', 0.35)], {
    requires: 'Zehirli Uçlar',
  }),
  C('Fırtına', 'veryrare', 'Zincir hasarı +%40', [m('chain', 0.4)], {
    requires: 'Şimşek Zinciri',
  }),
  S(
    'Zehir Dikeni',
    'veryrare',
    'Yeni skill: zehirleyen diken (AP)',
    ABILITIES.venom,
  ),
  C('Kan Susuzluğu', 'veryrare', '%4 omnivamp', [m('omnivamp', 0.04)]),
  // Aşırı Nadir
  C(
    'Void Dokunuşu',
    'ultrarare',
    "Hedefin zırh/MR'sini %30 aşındırır + void hasarı",
    [m('voidShred', 0.3)],
  ),
  C('Çift Atış', 'ultrarare', 'Tüm mermi skillerine +1 mermi', [
    m('multishot', 1, 'add', 'Projectile'),
  ]),
  {
    name: 'Dönen Tırpanlar',
    rarity: 'ultrarare',
    codex: 1,
    kind: 'Skill',
    desc: 'Etrafında dönen 3 tırpan, değdiği düşmanlara hasar verir',
    part: scythe(3, 85, 2.6, 14, 11),
  },
  S(
    'Gök Gürültüsü',
    'ultrarare',
    'Yeni skill: rastgele alanlara zincirli yıldırım (AP)',
    ABILITIES.thunder,
  ),
  // Destansı
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
  {
    name: 'Tırpan Ustalığı',
    rarity: 'epic',
    codex: 1,
    kind: 'Skill',
    desc: 'İkinci bir dış halka: 4 büyük tırpan ters yönde döner',
    requires: 'Dönen Tırpanlar',
    part: scythe(4, 135, -2.2, 22, 13),
  },
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
  // Mitik / Efsanevi
  S(
    'Meteor Yağmuru',
    'mythic',
    'Yeni skill: rastgele alanlara meteor yağdırır (AP)',
    ABILITIES.rainp,
  ),
  C('Kaos Fırtınası', 'mythic', 'Zincir +%40, +1 mermi, hasar +%10', [
    m('chain', 0.4),
    m('multishot', 1, 'add', 'Projectile'),
    m('damage', 1.1, 'mul'),
  ]),
  C('Ölümsüz', 'legendary', '+80 can, +1 can/sn, %5 omnivamp', [
    m('maxHp', 80),
    m('regen', 1),
    m('omnivamp', 0.05),
  ]),
  C('Altın Çağ', 'legendary', '+8 luck, +%12 hasar', [
    m('luck', 8),
    m('damage', 1.12, 'mul'),
  ]),
  // Petler (sadece kartlardan; en düşük nadirlik Efsanevi) ve pet slotu/yeteneği
  ...Object.entries(PETS).map(([id, d]) => ({
    name: d.name,
    rarity: d.rarity,
    kind: 'Pet',
    desc: d.desc,
    repeat: true,
    cond: () =>
      state.pets.length < state.petSlots &&
      !state.pets.some((x) => x.petId === id),
    apply: () => addPet(id),
  })),
  {
    name: 'Pet Slotu',
    rarity: 'ancient',
    codex: 1,
    desc: '+1 pet slotu',
    max: 2,
    apply: () => state.petSlots++,
  },
  {
    name: 'Pet Yeteneği',
    rarity: 'legendary',
    codex: 1,
    desc: 'Petlerin +1 skill slotu olur (rastgele bir skilline sahip olurlar)',
    max: 2,
    cond: () => state.pets.length > 0,
    apply: () => state.petSkillSlots++,
  },
];
// Kadim ve üstü kademeler: her kademe için güçlü bir kart
[
  ['ancient', 'Kadim Güç'],
  ['divine', 'İlahi Kalkan'],
  ['cosmic', 'Kozmik Güç'],
].forEach(([r, n], i) => {
  const k = i + 1;
  CARDS.push(
    C(n, r, `Hasar +%${4 + k * 4}, +${40 * k} can, +${2 * k} luck`, [
      m('damage', 1 + 0.04 + k * 0.04, 'mul'),
      m('maxHp', 40 * k),
      m('luck', 2 * k),
    ]),
  );
});

// --- PATLAMA (exploit): vuruşlar ihtimalle patlar. Yükseltmeleri de kartlardan gelir (ihtimal, hasar, alan, adet)
CARDS.push(
  C(
    'Patlayıcı Vuruş',
    'rare',
    "Vuruşların %15 ihtimalle patlar: hasarın %80'i alan hasarı",
    [m('blast', 0.15)],
  ),
  C(
    'Patlama: İhtimal',
    'veryrare',
    'Patlama ihtimali +%10',
    [m('blast', 0.1)],
    { requires: 'Patlayıcı Vuruş', repeat: true, max: 4 },
  ),
  C(
    'Patlama: Hasar',
    'veryrare',
    'Patlama hasarı +%30',
    [m('blastPower', 0.3)],
    { requires: 'Patlayıcı Vuruş', repeat: true, max: 4 },
  ),
  C(
    'Patlama: Alan',
    'veryrare',
    'Patlama alanı +%25',
    [m('blastRadius', 1.25, 'mul')],
    { requires: 'Patlayıcı Vuruş', repeat: true, max: 4 },
  ),
  C(
    'Patlama: Adet',
    'ultrarare',
    'Her patlamada +1 ek patlama',
    [m('blastCount', 1)],
    { requires: 'Patlayıcı Vuruş', repeat: true, max: 4 },
  ),
  C(
    'Zincirleme Patlama',
    'epic',
    'Patlama ihtimali +%15, +1 patlama, hasar +%30',
    [m('blast', 0.15), m('blastCount', 1), m('blastPower', 0.3)],
    { requires: 'Patlama: Adet' },
  ),
);
// --- Her skill kartının yükseltmeleri (o skill alınmadan çıkmaz): hasar, hız, adet/alan
const UP = (n, tag, rarity, kind) => {
  CARDS.push(
    C(
      n + ': Hasar',
      rarity,
      'Bu skillin hasarı +%15',
      [m('damage', 1.15, 'mul', tag)],
      { requires: n, repeat: true, max: 4 },
    ),
  );
  if (kind !== 'orbit')
    CARDS.push(
      C(
        n + ': Hız',
        rarity,
        'Bu skillin bekleme süresi kısalır (+15 haste)',
        [m('haste', 15, 'add', tag)],
        { requires: n, repeat: true, max: 4 },
      ),
    );
  if (kind === 'proj')
    CARDS.push(
      C(
        n + ': Adet',
        rarity,
        '+1 mermi ve +1 delme',
        [m('multishot', 1, 'add', tag), m('pierce', 1, 'add', tag)],
        { requires: n, repeat: true, max: 4 },
      ),
    );
  else if (kind === 'rain')
    CARDS.push(
      C(
        n + ': Adet',
        rarity,
        '+1 yağmur vuruşu',
        [m('multishot', 1, 'add', tag)],
        { requires: n, repeat: true, max: 4 },
      ),
    );
  else
    CARDS.push(
      C(n + ': Alan', rarity, 'Alan +%10', [m('area', 1.1, 'mul', tag)], {
        requires: n,
        repeat: true,
        max: 4,
      }),
    );
};
UP('Fireball', 'ab_fireball', 'uncommon', 'proj');
UP('Frost Nova', 'ab_nova', 'uncommon', 'area');
UP('Zehir Dikeni', 'ab_venom', 'veryrare', 'proj');
UP('Gök Gürültüsü', 'ab_thunder', 'ultrarare', 'rain');
UP('Meteor', 'ab_meteor', 'epic', 'area');
UP('Bıçak Halkası', 'ab_blades', 'epic', 'proj');
UP('Meteor Yağmuru', 'ab_rainp', 'mythic', 'rain');
UP('Dönen Tırpanlar', 'Orbit', 'ultrarare', 'orbit');

// --- DASH kartları (Shift ile dash; dokunulmaz kaçış)
CARDS.push(
  C('Çift Dash', 'rare', '+1 dash hakkı', [m('dashCharges', 1)], { max: 2 }),
  C(
    'Tazelik',
    'uncommon',
    'Dash dolumu %15 hızlanır',
    [m('dashCdMul', 0.85, 'mul')],
    { max: 3 },
  ),
  C(
    'Gölge Adımı',
    'rare',
    'Dash dokunulmazlığı +0.1 sn',
    [m('dashIframe', 0.1)],
    { max: 2 },
  ),
  C('Patlayan Dash', 'epic', 'Dash bittiği yerde patlama çıkar', [
    m('dashBlast', 1),
  ]),
  C(
    'Patlayan Dash: Hasar',
    'epic',
    'Dash patlaması +%50',
    [m('dashBlast', 0.5)],
    { requires: 'Patlayan Dash', repeat: true, max: 3 },
  ),
  C('Ateş İzi', 'epic', 'Dash yolunda yanan iz bırakır', [m('dashTrail', 1)]),
  C('Ateş İzi: Hasar', 'epic', 'İz hasarı +%60', [m('dashTrail', 0.6)], {
    requires: 'Ateş İzi',
    repeat: true,
    max: 3,
  }),
);

CARDS.push(
  {
    name: 'Kader Çarkı',
    rarity: 'rare',
    codex: 1,
    desc: '+2 kart yenileme hakkı',
    max: 3,
    apply: () => {
      state.rerolls += 2;
    },
  },
  {
    name: 'Kara Liste',
    rarity: 'rare',
    codex: 1,
    desc: '+1 kart yasaklama hakkı',
    max: 3,
    apply: () => {
      state.banishes += 1;
    },
  },
);
// --- EVRİMLER: iki kart birlikte alınınca gizli üçüncü kart açılır (sonraki seçimde hazır olarak teklif edilir)
const EVO = (name, rarity, desc, needs, mods) =>
  CARDS.push({
    ...C(name, rarity, desc, mods),
    needs,
    evo: true,
    kind: 'Evrim',
    repeat: false,
  });
EVO(
  'Salgın Fırtınası',
  'mythic',
  'Zehir +%30, zincir +%30, efekt gücü +%15',
  ['Zehirli Uçlar', 'Şimşek Zinciri'],
  [m('poison', 0.3), m('chain', 0.3), m('effPower', 1.15, 'mul')],
);
EVO(
  'Patlayan Oklar',
  'mythic',
  'Mermiler: patlama +%15, +1 ek patlama',
  ['Patlayıcı Vuruş', 'Delici Mermiler'],
  [
    m('blast', 0.15, 'add', 'Projectile'),
    m('blastCount', 1, 'add', 'Projectile'),
  ],
);
EVO(
  'Buzul Çağı',
  'epic',
  'Frost Nova: yavaşlatma +%30, alan +%25, haste +20',
  ['Frost Nova', 'Ağır Darbe'],
  [
    m('slow', 0.3, 'add', 'ab_nova'),
    m('area', 1.25, 'mul', 'ab_nova'),
    m('haste', 20, 'add', 'ab_nova'),
  ],
);
EVO(
  'Gölge Dansı',
  'mythic',
  '+1 dash hakkı, +0.1 sn dokunulmazlık, ateş izi',
  ['Çift Dash', 'Gölge Adımı'],
  [m('dashCharges', 1), m('dashIframe', 0.1), m('dashTrail', 1)],
);
EVO(
  'Void Fırtınası',
  'mythic',
  'Zincir +%40, void aşındırma +%20',
  ['Void Dokunuşu', 'Fırtına'],
  [m('chain', 0.4), m('voidShred', 0.2)],
);
EVO(
  'Altın Zehir',
  'epic',
  'Zehir +%30, +4 luck',
  ['Zehirli Uçlar', 'Lucky Charm'],
  [m('poison', 0.3), m('luck', 4)],
);
