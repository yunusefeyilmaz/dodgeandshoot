// Oyunun tek paylaşılan durum nesnesi. Sistemler buradan okur/yazar.
export const W = 3200,
  H = 2400; // dünya boyutu (kamera bunun içinde gezer)
export const state = {
  ents: [],
  projs: [],
  pickups: [],
  fx: [],
  texts: [],
  deaths: [],
  lines: [],
  flash: 0,
  parts: [],
  rings: [],
  shake: 0,
  picked: [],
  mode: 'menu',
  streak: 0,
  streakT: 0,
  pendingClass: false,
  player: null,
  coins: 0,
  xp: 0,
  level: 1,
  kills: 0,
  paused: false,
  over: false,
  msg: '',
  msgT: 0,
  wave: {
    n: 0,
    phase: 'idle',
    toSpawn: 0,
    timer: 0,
    cd: 0,
    auto: false,
    bossPending: false,
  },
  upgradeLevels: {},
  inventory: Array(10).fill(null),
  view: { w: 800, h: 500, x: 0, y: 0 },
  classSlots: 2,
  weapon: null,
  showMagnet: false,
  combos: [],
};
export const toast = (s) => {
  state.msg = s;
  state.msgT = 2.5;
};
export const rnd = (a, b) => a + Math.random() * (b - a);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
