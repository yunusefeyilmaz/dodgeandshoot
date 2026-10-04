// Petler SADECE kartlardan gelir (en düşük nadirlik: Efsanevi). Her petin kendine özel skilli var (data/abilities.js: p_*).
export const PETS = {
  fox: {
    name: 'Alev Tilkisi',
    icon: '🦊',
    rarity: 'legendary',
    col: '#ff8a3d',
    skill: 'p_flame',
    desc: 'Çevresine ateş dalgaları saçar.',
  },
  wolf: {
    name: 'Kış Kurdu',
    icon: '🐺',
    rarity: 'legendary',
    col: '#8fd8ff',
    skill: 'p_howl',
    desc: "Düşmanları yavaşlatan buz kükremesi, sahibine saldırı hızı buff'ı verir.",
  },
  cat: {
    name: 'Gölge Kedisi',
    icon: '🐈‍⬛',
    rarity: 'ancient',
    col: '#9a7aff',
    skill: 'p_claws',
    desc: 'Düşmanların üstüne pençe yağmuru yağdırır.',
  },
  eagle: {
    name: 'Fırtına Kartalı',
    icon: '🦅',
    rarity: 'divine',
    col: '#ffe066',
    skill: 'p_storm',
    desc: 'Zincirleme yıldırımlar düşürür.',
  },
  dragon: {
    name: 'Kadim Ejderha',
    icon: '🐉',
    rarity: 'celestial',
    col: '#ff5a2a',
    skill: 'p_breath',
    desc: "Delici ejder nefesi atar, sahibine hasar buff'ı verir.",
  },
};
