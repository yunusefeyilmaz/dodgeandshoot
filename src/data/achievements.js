// test(meta, state) -> true olunca başarım açılır ve sağ altta popup çıkar
export const ACHIEVEMENTS = [
  {
    id: 'k1',
    name: 'İlk Kan',
    desc: 'İlk düşmanını öldür',
    test: (m) => m.stats.kills >= 1,
  },
  {
    id: 'k100',
    name: 'Avcı',
    desc: 'Toplam 100 kill',
    test: (m) => m.stats.kills >= 100,
  },
  {
    id: 'k1000',
    name: 'Katil',
    desc: 'Toplam 1.000 kill',
    test: (m) => m.stats.kills >= 1000,
  },
  {
    id: 'k10000',
    name: 'Kıyamet',
    desc: 'Toplam 10.000 kill',
    test: (m) => m.stats.kills >= 10000,
  },
  {
    id: 'w5',
    name: 'Hayatta Kal',
    desc: '5. tura ulaş',
    test: (m) => m.stats.bestWave >= 5,
  },
  {
    id: 'w10',
    name: 'Dayanıklı',
    desc: '10. tura ulaş',
    test: (m) => m.stats.bestWave >= 10,
  },
  {
    id: 'w25',
    name: 'Ölümsüz Ruh',
    desc: '25. tura ulaş',
    test: (m) => m.stats.bestWave >= 25,
  },
  {
    id: 's25',
    name: 'Seri Katil',
    desc: '25 kill streak',
    test: (m) => m.stats.bestStreak >= 25,
  },
  {
    id: 's50',
    name: 'Kasırga',
    desc: '50 kill streak',
    test: (m) => m.stats.bestStreak >= 50,
  },
  {
    id: 's100',
    name: 'Durdurulamaz',
    desc: '100 kill streak',
    test: (m) => m.stats.bestStreak >= 100,
  },
  {
    id: 'b1',
    name: 'Boss Avcısı',
    desc: 'İlk bossu yen',
    test: (m) => m.bossesDefeated.length >= 1,
  },
  {
    id: 'b2',
    name: 'Yay Ustası',
    desc: '2. bossu yen (Yay açılır)',
    test: (m) => m.bestBoss >= 2,
  },
  {
    id: 'b5',
    name: 'Boss Koleksiyoncusu',
    desc: '5 farklı boss yen',
    test: (m) => m.bossesDefeated.length >= 5,
  },
  {
    id: 'cls',
    name: 'Sınıf Sahibi',
    desc: 'İlk classını seç',
    test: (m) => Object.keys(m.found.classes).length >= 1,
  },
  {
    id: 'cmb',
    name: 'Kombo!',
    desc: 'İlk combonu keşfet',
    test: (m) => Object.keys(m.found.combos).length >= 1,
  },
  {
    id: 'cards10',
    name: 'Koleksiyoncu',
    desc: '10 farklı kart keşfet',
    test: (m) => Object.keys(m.found.cards).length >= 10,
  },
  {
    id: 'tree5',
    name: 'Usta Silahçı',
    desc: 'Silah ağaçlarından 5 yetenek aç',
    test: (m) =>
      Object.values(m.weaponTree).reduce(
        (s, t) => s + Object.keys(t).length,
        0,
      ) >= 5,
  },
];
