import { state, rnd, dist, toast } from '../core/state.js';
import { on } from '../core/events.js';
import { stat } from '../core/stats.js';
import { addPart } from '../core/entity.js';
import { ITEMS } from '../data/items.js';

export const xpNeed = () => 4 + state.level * 3;

// Kill olayına abone: coin, item ve xp düşürür (combat.js bunu bilmez)
on('Kill', ({ target: t }) => {
  if (t.team !== 'e') return;
  state.kills++;
  state.xp += t.xp;
  const k = t.boss ? 8 : 1;
  for (let i = 0; i < k; i++)
    state.pickups.push({
      type: 'coin',
      v: Math.max(1, Math.round(t.coin / k)),
      x: t.x + rnd(-18, 18),
      y: t.y + rnd(-18, 18),
    });
  if (t.boss || Math.random() < 0.15)
    state.pickups.push({
      type: 'item',
      item: ITEMS[Math.floor(Math.random() * ITEMS.length)],
      x: t.x,
      y: t.y,
    });
});

// Yerdeki coin/itemlar: magnet alanına girince oyuncuya çekilir ve toplanır
export function updatePickups(dt) {
  const p = state.player,
    m = stat(p, 'magnet');
  state.pickups = state.pickups.filter((k) => {
    const d = dist(k, p);
    if (d < m) {
      const s = (260 + (m - d)) * dt;
      k.x += ((p.x - k.x) / (d || 1)) * s;
      k.y += ((p.y - k.y) / (d || 1)) * s;
    }
    if (d > 14) return true;
    if (k.type === 'coin') {
      state.coins += k.v;
      return false;
    }
    const slot = state.inventory.indexOf(null);
    if (slot < 0) return true; // envanter dolu: yerde kalır
    state.inventory[slot] = k.item;
    addPart(p, k.item.part);
    toast('Item: ' + k.item.name);
    return false;
  });
}
