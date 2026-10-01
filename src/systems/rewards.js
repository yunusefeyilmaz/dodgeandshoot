import { state, rnd, dist, toast } from '../core/state.js';
import { on } from '../core/events.js';
import { stat } from '../core/stats.js';
import { rollRarity } from '../core/rarity.js';
import { ITEMS } from '../data/items.js';
import { addItem } from './inventory.js';

export const xpNeed = () => 4 + state.level * 3;

// Kill: coin, xp, item. Luck: coin değeri, item şansı ve item nadirliğini artırır (boss'ta ekstra).
on('Kill', ({ target: t }) => {
  if (t.team !== 'e') return;
  const luck = stat(state.player, 'luck');
  state.kills++;
  state.xp += t.xp;
  const k = t.boss ? 8 : 1;
  for (let i = 0; i < k; i++)
    state.pickups.push({
      type: 'coin',
      v: Math.max(1, Math.round((t.coin / k) * (1 + luck * 0.01))),
      x: t.x + rnd(-18, 18),
      y: t.y + rnd(-18, 18),
    });
  if (t.boss || Math.random() < Math.min(0.6, 0.15 + luck * 0.004)) {
    const r = rollRarity(luck + (t.boss ? 15 : 0)),
      list = ITEMS.filter((i) => i.rarity === r);
    state.pickups.push({
      type: 'item',
      def: list[Math.floor(Math.random() * list.length)],
      x: t.x,
      y: t.y,
    });
  }
});

export function updatePickups(dt) {
  const p = state.player,
    m = stat(p, 'magnet');
  state.pickups = state.pickups.filter((k) => {
    const d = dist(k, p);
    if (k.type === 'item' && state.inventory.indexOf(null) < 0) {
      if (d < 14 && state.msgT <= 0) toast('Envanter dolu!');
      return true;
    } // dolu: alınamaz
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
    return !addItem(k.def);
  });
}
