// Karakterler: başlangıç statları + bir PASİF mekanik + Ruh Puanı ağacı. cost = Ruh (açma bedeli), seviye atlayınca 1 Ruh Puanı kazanılır.
const m = (stat, value, op = 'add') => ({ stat, op, value });
const N = (id, name, desc, cost, parent, mods) => ({
  id,
  name,
  desc,
  cost,
  parent,
  mods,
});
export const MAX_CHAR_LEVEL = 30;
export const xpFor = (lv) => Math.round(60 * lv * (1 + lv * 0.15)); // lv -> lv+1 için gereken karakter XP'si
export const CHARS = {
  warrior: {
    name: 'Savaşçı',
    icon: '🛡️',
    cost: 0,
    col: '#d0743a',
    desc: 'Dayanıklı ön saf. Vurdukça ve vuruldukça Öfke birikir.',
    passive: {
      name: 'Öfke Çubuğu',
      text: 'Vurdukça ve hasar aldıkça Öfke dolar. Dolunca 6 sn Öfke: saldırı hızı +%35, hasar +%25, %8 tam can çalma.',
    },
    mods: [m('maxHp', 30), m('armor', 8), m('ad', 2)],
    tree: [
      N('w1', 'Sert Deri', '+25 maksimum can', 1, null, [m('maxHp', 25)]),
      N('w2', 'Çelik Kas', '+3 AD', 1, 'w1', [m('ad', 3)]),
      N('w3', 'Kızgın Kan', 'Öfke %30 daha hızlı dolar', 2, 'w1', [
        m('rageGain', 0.3),
      ]),
      N('w4', 'Demir Duruş', '+10 zırh, +10 büyü direnci', 2, 'w2', [
        m('armor', 10),
        m('mr', 10),
      ]),
      N('w5', 'Uzayan Öfke', 'Öfke +2 sn sürer', 2, 'w3', [m('rageDur', 2)]),
      N('w6', 'Kan Susuzluğu', '%3 tam can çalma', 3, 'w4', [
        m('omnivamp', 0.03),
      ]),
      N('w7', 'Savaş Tanrısı', 'Hasar +%10, +40 can', 4, 'w5', [
        m('damage', 1.1, 'mul'),
        m('maxHp', 40),
      ]),
    ],
  },
  archer: {
    name: 'Okçu',
    icon: '🏹',
    cost: 1000,
    col: '#7fc96a',
    desc: 'Keskin nişancı. Yerinde dururken (0.5 sn) çok daha tehlikeli.',
    passive: {
      name: 'Av Sabrı',
      text: 'Yarım saniye hareketsiz kalınca saldırı hızı +%35 ve kritik şansı +%15 (hareket edince biter).',
    },
    mods: [
      m('critChance', 0.05),
      m('projSpeed', 1.15, 'mul'),
      m('area', 1.08, 'mul'),
    ],
    tree: [
      N('a1', 'Keskin Göz', 'Kritik şansı +%3', 1, null, [
        m('critChance', 0.03),
      ]),
      N('a2', 'Hafif Ok', 'Mermi hızı +%10', 1, 'a1', [
        m('projSpeed', 1.1, 'mul'),
      ]),
      N('a3', 'Av Sabrı+', 'Nişan bonusu +%30', 2, 'a1', [
        m('stillBonus', 0.3),
      ]),
      N('a4', 'Nişancı', 'Kritik hasarı +0.2', 2, 'a2', [m('critDmg', 0.2)]),
      N('a5', 'Uzun Menzil', 'Alan/menzil +%10', 2, 'a3', [
        m('area', 1.1, 'mul'),
      ]),
      N('a6', 'Delici Bakış', '%12 zırh delme, +4 ölümcüllük', 3, 'a4', [
        m('armorPen', 0.12),
        m('lethality', 4),
      ]),
      N('a7', 'Gölge Avcı', 'Hasar +%10, saldırı hızı +%8', 4, 'a5', [
        m('damage', 1.1, 'mul'),
        m('attackSpeed', 1.08, 'mul'),
      ]),
    ],
  },
  assassin: {
    name: 'Suikastçı',
    icon: '🗡️',
    cost: 3000,
    col: '#a06aff',
    desc: 'Hızlı ve ölümcül. Her dash sonrası ilk vuruş ağır gelir.',
    passive: {
      name: 'Gölge Öldürüşü',
      text: 'Dash attıktan sonraki 2.5 sn içindeki ilk silah vuruşu +%80 hasar verir. +1 dash hakkı ile başlar.',
    },
    mods: [m('speed', 1.1, 'mul'), m('dashCharges', 1), m('critChance', 0.04)],
    tree: [
      N('s1', 'Hafif Adım', 'Hız +%5', 1, null, [m('speed', 1.05, 'mul')]),
      N('s2', 'Keskin Hançer', '+3 AD', 1, 's1', [m('ad', 3)]),
      N('s3', 'Gölge Darbe', 'Gölge hasarı +%40', 2, 's1', [
        m('shadowDmg', 0.4),
      ]),
      N('s4', 'Hızlı Bilek', 'Saldırı hızı +%8', 2, 's2', [
        m('attackSpeed', 1.08, 'mul'),
      ]),
      N('s5', 'Pusu', 'Arkadan vuruş hasarı +0.25', 2, 's3', [
        m('backstab', 0.25),
      ]),
      N('s6', 'Kaçış Ustası', 'Dash dolumu %15 hızlı', 3, 's4', [
        m('dashCdMul', 0.85, 'mul'),
      ]),
      N('s7', 'Ölüm Dansı', 'Kritik +%6, kritik hasarı +0.3', 4, 's5', [
        m('critChance', 0.06),
        m('critDmg', 0.3),
      ]),
    ],
  },
  mage: {
    name: 'Büyücü',
    icon: '🧙',
    cost: 6000,
    col: '#6aa8ff',
    desc: 'Cam top. Her 8. skill kullanımı bedava bir Arkana patlaması çıkarır.',
    passive: {
      name: 'Arkana Akışı',
      text: 'Her 8. skill kullanımında etrafında bedava bir Arkana patlaması (AP ile güçlenir, alan hasarı).',
    },
    mods: [m('ap', 10), m('haste', 15), m('maxHp', -10)],
    tree: [
      N('m1', 'Keskin Zihin', '+4 AP', 1, null, [m('ap', 4)]),
      N('m2', 'Akıcı Güç', '+10 hızlandırma', 1, 'm1', [m('haste', 10)]),
      N('m3', 'Çifte Akış', 'Arkana 2 skill daha erken', 2, 'm1', [
        m('arcanaEvery', -2),
      ]),
      N('m4', 'Büyü Zırhı', '+12 büyü direnci, +15 can', 2, 'm2', [
        m('mr', 12),
        m('maxHp', 15),
      ]),
      N('m5', 'Delici Büyü', '%12 büyü delme', 2, 'm3', [m('magicPen', 0.12)]),
      N('m6', 'Yıldız Çekirdeği', '+8 AP', 3, 'm4', [m('ap', 8)]),
      N('m7', 'Arkmaj', 'Hasar +%10, +10 hızlandırma', 4, 'm5', [
        m('damage', 1.1, 'mul'),
        m('haste', 10),
      ]),
    ],
  },
  necro: {
    name: 'Nekromant',
    icon: '💀',
    cost: 10000,
    col: '#8a5aff',
    desc: 'Ölüleri diriltir. Her 6 öldürmede bir iskelet asker çağırır.',
    passive: {
      name: 'Ruh Hasadı',
      text: 'Her 6. öldürmede 18 sn yaşayan bir iskelet asker çağırır (aynı anda en çok 3). Askerler sana yakın düşmanlara saldırır.',
    },
    mods: [m('ap', 6), m('maxHp', 10), m('mr', 8)],
    tree: [
      N('n1', 'Kemik Zırh', '+20 can', 1, null, [m('maxHp', 20)]),
      N('n2', 'Ruh Hasadı+', 'Her 5. öldürmede asker', 2, 'n1', [
        m('soulEvery', -1),
      ]),
      N('n3', 'Güçlü Ordu', '+1 asker sınırı', 2, 'n1', [m('soldierMax', 1)]),
      N('n4', 'Kemik Büyüsü', '+5 AP', 1, 'n2', [m('ap', 5)]),
      N('n5', 'Uzun Ömür', 'Askerler +6 sn yaşar', 2, 'n3', [
        m('soldierLife', 6),
      ]),
      N('n6', 'Karanlık Emilim', '%3 tam can çalma', 3, 'n4', [
        m('omnivamp', 0.03),
      ]),
      N('n7', 'Ölüm Efendisi', '+2 asker sınırı, hasar +%8', 4, 'n5', [
        m('soldierMax', 2),
        m('damage', 1.08, 'mul'),
      ]),
    ],
  },
};
export const CHAR_LIST = Object.keys(CHARS);
