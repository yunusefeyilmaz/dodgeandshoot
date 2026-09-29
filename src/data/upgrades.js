// Coin ile alınan basic statlar. Maliyet = base * grow^seviye
export const UPGRADES = [
  { id: 'damage',     name: 'Hasar',           desc: '+%10 hasar',            stat: 'damage',     op: 'mul', value: 1.10, base: 10, grow: 1.35 },
  { id: 'critChance', name: 'Kritik şansı',    desc: '+%3 kritik şansı',      stat: 'critChance', op: 'add', value: .03,  base: 15, grow: 1.4, max: 25 },
  { id: 'critDmg',    name: 'Kritik hasarı',   desc: '+%15 kritik çarpanı',   stat: 'critDmg',    op: 'add', value: .15,  base: 15, grow: 1.4 },
  { id: 'armorPen',   name: 'Zırh delme',      desc: '+%4 düşman zırhı yok sayılır', stat: 'armorPen', op: 'add', value: .04, base: 20, grow: 1.45, max: 20 },
  { id: 'maxHp',      name: 'Max can',         desc: '+20 can',               stat: 'maxHp',      op: 'add', value: 20,   base: 8,  grow: 1.3 },
  { id: 'armor',      name: 'Zırh',            desc: '+4 zırh',               stat: 'armor',      op: 'add', value: 4,    base: 12, grow: 1.35 },
  { id: 'speed',      name: 'Hareket hızı',    desc: '+10 hız',               stat: 'speed',      op: 'add', value: 10,   base: 10, grow: 1.3, max: 12 },
  { id: 'cdr',        name: 'Bekleme süresi',  desc: '-%5 cooldown',          stat: 'cdr',        op: 'mul', value: .95,  base: 25, grow: 1.5, max: 10 },
  { id: 'magnet',     name: 'Mıknatıs alanı',  desc: '+25 toplama menzili',   stat: 'magnet',     op: 'add', value: 25,   base: 10, grow: 1.35, max: 15 },
];
