// Oyunun tek paylaşılan durum nesnesi. Sistemler buradan okur/yazar.
export const W = 800,
  H = 500;
export const state = {
  ents: [],
  projs: [],
  pickups: [],
  fx: [],
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
  inventory: Array(6).fill(null),
};
export const toast = (s) => {
  state.msg = s;
  state.msgT = 2.5;
};
export const rnd = (a, b) => a + Math.random() * (b - a);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
