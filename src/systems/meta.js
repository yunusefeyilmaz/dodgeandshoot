import { meta, save } from '../core/save.js';
import { WEAPONS } from '../data/weapons.js';
// Boss Point = yenilen FARKLI boss sayısı - harcanan. Aynı bossu tekrar kesmek puan vermez.
export const owned = (w, id) =>
  !!(meta.weaponTree[w] && meta.weaponTree[w][id]);
export const spent = () =>
  Object.entries(meta.weaponTree).reduce(
    (s, [w, t]) =>
      s +
      Object.keys(t).reduce(
        (a, id) =>
          a +
          (
            (WEAPONS[w] && WEAPONS[w].tree.find((n) => n.id === id)) || {
              cost: 0,
            }
          ).cost,
        0,
      ),
    0,
  );
export const points = () => meta.bossesDefeated.length - spent();
export const isUnlocked = (id) => meta.unlockedWeapons.includes(id);
export function buyNode(w, n) {
  if (owned(w, n.id) || points() < n.cost || (n.parent && !owned(w, n.parent)))
    return false;
  (meta.weaponTree[w] ??= {})[n.id] = 1;
  save(true);
  return true;
}
export function resetTree() {
  meta.weaponTree = {};
  save(true);
}
export const treeMods = (w) =>
  WEAPONS[w].tree.filter((n) => owned(w, n.id)).flatMap((n) => n.mods);
