import { state } from '../core/state.js';
import { UPGRADES } from '../data/upgrades.js';
import { WEAPONS } from '../data/weapons.js';
// Tüm upgrade'ler (genel + seçili silah) oyuncuda TEK part: seviyelere göre modifier'lar yeniden kurulur
export const upgradePart = { mods: [] };
export const weaponUpgrades = () =>
  state.weapon ? WEAPONS[state.weapon].upgrades : [];
export const levelOf = (id) => state.upgradeLevels[id] || 0;
export const costOf = (u) =>
  Math.ceil(u.base * Math.pow(u.grow, levelOf(u.id)));
export const isMax = (u) => u.max && levelOf(u.id) >= u.max;
function rebuild() {
  upgradePart.mods = UPGRADES.concat(weaponUpgrades())
    .filter((u) => levelOf(u.id))
    .map((u) => ({
      stat: u.stat,
      tag: u.tag,
      op: u.op,
      value:
        u.op === 'add'
          ? u.value * levelOf(u.id)
          : Math.pow(u.value, levelOf(u.id)),
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
