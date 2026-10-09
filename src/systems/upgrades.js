import { state } from '../core/state.js';
import { BAL } from '../data/balance.js';
import { UPGRADES, totalAt } from '../data/upgrades.js';
import { WEAPONS } from '../data/weapons.js';
import { rebuildPets, petNodes } from './pets.js';
// Tüm upgrade'ler (genel + seçili silah) oyuncuda TEK part: seviyelere göre modifier'lar yeniden kurulur
export const upgradePart = { mods: [] };
export const weaponUpgrades = () =>
  state.weapon ? WEAPONS[state.weapon].upgrades : [];
export const levelOf = (id) => state.upgradeLevels[id] || 0;
export const costOf = (u) =>
  Math.ceil(u.base * BAL.shopCostMul * Math.pow(u.grow, levelOf(u.id)));
export const isMax = (u) => u.max && levelOf(u.id) >= u.max;
function rebuild() {
  rebuildPets();
  upgradePart.mods = UPGRADES.concat(weaponUpgrades())
    .filter((u) => levelOf(u.id))
    .map((u) => ({
      stat: u.stat,
      tag: u.tag,
      op: u.op,
      value: totalAt(u, levelOf(u.id)),
    }));
}
export function freeLevel(u) {
  state.upgradeLevels[u.id] = levelOf(u.id) + 1;
  rebuild();
} // kartla bedava seviye
export function buy(u) {
  const c = costOf(u);
  if (state.coins < c || isMax(u)) return false;
  state.coins -= c;
  freeLevel(u);
  return true;
}
// Alınabilir (görünür, dolu olmayan, parası yeten) bir yükseltme var mı? (hatırlatma için)
export const affordable = () =>
  UPGRADES.concat(weaponUpgrades(), petNodes()).some(
    (u) =>
      (!u.parent || levelOf(u.parent) > 0) &&
      !isMax(u) &&
      state.coins >= costOf(u),
  );
