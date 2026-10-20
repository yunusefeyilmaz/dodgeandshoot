import { state, toast } from '../core/state.js';
import { meta, save, hooks } from '../core/save.js';
import { MAPS, MAP_LIST } from '../data/maps.js';
import { settleRun } from './characters.js';
// Kampanya: harita ilerlemesi, yıldızlar (1=normal, 2=Zorluk 2+, 3=Zorluk 4+) ve yıldız yetenekleri
const m = (stat, value, op = 'add') => ({ stat, op, value });
export const STAR_PERKS = [
  {
    id: 'sp_dmg',
    name: 'Yıldız Gücü',
    icon: '💥',
    cost: 1,
    desc: 'Tüm hasar +%5',
    mods: [m('damage', 1.05, 'mul')],
  },
  {
    id: 'sp_hp',
    name: 'Yıldız Kalkanı',
    icon: '❤️',
    cost: 1,
    desc: '+25 maksimum can',
    mods: [m('maxHp', 25)],
  },
  {
    id: 'sp_spd',
    name: 'Hafif Ayak',
    icon: '👟',
    cost: 1,
    desc: 'Hareket hızı +%5',
    mods: [m('speed', 1.05, 'mul')],
  },
  {
    id: 'sp_gold',
    name: 'Altın Bereketi',
    icon: '🪙',
    cost: 1,
    desc: 'Her koşuya +40 altınla başla',
    mods: [],
    coins: 40,
  },
  {
    id: 'sp_luck',
    name: 'Şans Yıldızı',
    icon: '🍀',
    cost: 2,
    desc: '+3 şans (daha nadir kart/item)',
    mods: [m('luck', 3)],
  },
  {
    id: 'sp_rev',
    name: 'İkinci Nefes',
    icon: '✨',
    cost: 3,
    desc: 'Ölünce bir kez %40 canla geri dön (2 sn dokunulmaz)',
    mods: [],
    revive: 1,
  },
];
export const mapState = (id) =>
  ((meta.maps ??= {})[id] ??= { stars: 0, best: 0, clears: 0 });
export const isMapUnlocked = (id) => {
  const u = MAPS[id].unlock;
  return !u || mapState(u.map).stars >= u.stars;
};
export const starsEarned = () =>
  MAP_LIST.reduce((s, mp) => s + mapState(mp.id).stars, 0);
export const hasPerk = (id) => !!(meta.starPerks ??= {})[id];
export const starsSpent = () =>
  STAR_PERKS.reduce((s, p) => s + (hasPerk(p.id) ? p.cost : 0), 0);
export const starPoints = () => starsEarned() - starsSpent();
export function buyPerk(id) {
  const p = STAR_PERKS.find((x) => x.id === id);
  if (!p || hasPerk(id) || starPoints() < p.cost) return false;
  meta.starPerks[id] = 1;
  save(true);
  return true;
}
export function resetPerks() {
  meta.starPerks = {};
  save(true);
}
export const starPerkMods = () =>
  STAR_PERKS.filter((p) => hasPerk(p.id)).flatMap((p) =>
    p.mods.map((x) => ({ ...x })),
  );
export const starsForHeat = (h) => (h >= 4 ? 3 : h >= 2 ? 2 : 1);
export const starReq = (n) =>
  n === 1
    ? 'Haritayı bitir'
    : n === 2
      ? 'Zorluk 2 veya üstünde bitir'
      : 'Zorluk 4 veya üstünde bitir';
// Son turu (ör. 50) bitirince çağrılır
export function onVictory() {
  const mp = state.map,
    ms = mapState(mp.id),
    earned = starsForHeat(state.heat || 0),
    gained = Math.max(0, earned - ms.stars);
  state.won = true;
  ms.clears++;
  ms.best = Math.max(ms.best, state.wave.n);
  ms.stars = Math.max(ms.stars, earned);
  state.victory = { map: mp.id, stars: earned, gained };
  state.lastGain = settleRun();
  save(true);
  state.bannerQ.push({
    text: 'ZAFER!',
    sub:
      mp.name +
      ' · ' +
      '★'.repeat(earned) +
      (gained ? ' (+' + gained + ' yeni yıldız)' : ''),
    kind: 'boss',
  });
  hooks.popup &&
    gained &&
    hooks.popup(
      'Yeni yıldız: ' + mp.name,
      '★'.repeat(earned) + ' — Yıldız Yeteneklerinde harca',
      '#ffd84f',
    );
}
export function reviveIfPossible(p, maxHp) {
  if (!state.revive || state.revive < 1) return false;
  state.revive--;
  meta.stats.revives = (meta.stats.revives || 0) + 1;
  p.hp = maxHp * 0.4;
  p.invuln = 2;
  state.slowT = 0.8;
  state.flash = 1;
  toast('İkinci Nefes! Yeniden doğdun');
  return true;
}
