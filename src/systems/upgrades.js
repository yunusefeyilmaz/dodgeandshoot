import { state } from '../core/state.js';
import { UPGRADES } from '../data/upgrades.js';
// Tüm upgrade'ler oyuncuda TEK bir part: seviyelere göre modifier'ları yeniden hesaplanır
export const upgradePart = { mods: [] };
export const levelOf = (id) => state.upgradeLevels[id] || 0;
export const costOf = (u) =>
  Math.ceil(u.base * Math.pow(u.grow, levelOf(u.id)));
export const isMax = (u) => u.max && levelOf(u.id) >= u.max;
function rebuild() {
  upgradePart.mods = UPGRADES.filter((u) => levelOf(u.id)).map((u) => ({
    stat: u.stat,
    op: u.op,
    value:
      u.op === 'add'
        ? u.value * levelOf(u.id)
        : Math.pow(u.value, levelOf(u.id)),
  }));
}
export function buy(u) {
  const c = costOf(u);
  if (state.coins < c || isMax(u)) return false;
  state.coins -= c;
  state.upgradeLevels[u.id] = levelOf(u.id) + 1;
  rebuild();
  return true;
}
