// Kalıcı ilerleme: localStorage (tek JSON, sürümlü). Kota ~5MB, bu oyun için fazlasıyla yeter; IndexedDB gereksiz karmaşıklık olurdu.
const KEY = 'modular-game-save-v1';
const def = () => ({
  v: 1,
  bossesDefeated: [],
  bestBoss: 0,
  unlockedWeapons: ['sword'],
  weaponTree: {},
  stats: {
    runs: 0,
    deaths: 0,
    kills: 0,
    bestWave: 0,
    bestStreak: 0,
    mostKills: 0,
    time: 0,
    coins: 0,
    damage: 0,
    bossReached: 0,
    bossKills: {},
  },
  weaponKills: {},
  weaponStreak: {},
  cardKills: {},
  found: {
    cards: {},
    classes: {},
    combos: {},
    items: {},
    weapons: {},
    pets: {},
  },
  ach: {},
  settings: { mute: false, vol: 0.5 },
});
const merge = (a, b) => {
  for (const k in b)
    a[k] =
      b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])
        ? merge(a[k] && typeof a[k] === 'object' ? a[k] : {}, b[k])
        : b[k];
  return a;
};
export const meta = (() => {
  try {
    const s = localStorage.getItem(KEY);
    return s ? merge(def(), JSON.parse(s)) : def();
  } catch (e) {
    return def();
  }
})();
let dirty = false,
  last = 0,
  wiped = false;
export function save(force) {
  if (wiped) return;
  dirty = true;
  const n = Date.now();
  if (!force && n - last < 4000) return;
  last = n;
  dirty = false;
  try {
    localStorage.setItem(KEY, JSON.stringify(meta));
  } catch (e) {
    /* kota/özel mod: sessizce geç */
  }
}
setInterval(() => dirty && save(true), 5000);
addEventListener('beforeunload', () => save(true));
export function wipe() {
  wiped = true;
  try {
    localStorage.removeItem(KEY);
  } catch (e) {}
  location.reload();
}
export const hooks = { popup: () => {} }; // ui/achievements.js doldurur
export function discover(type, key, label, sub) {
  if (meta.found[type][key]) return false;
  meta.found[type][key] = 1;
  hooks.popup('Yeni keşif: ' + label, sub);
  save(true);
  return true;
}
