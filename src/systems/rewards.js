import { state, rnd, dist, toast } from '../core/state.js';
import { on } from '../core/events.js';
import { stat } from '../core/stats.js';
import { weightOf } from '../core/rarity.js';
import { BAL } from '../data/balance.js';
import { ITEMS } from '../data/items.js';
import { addItem } from './inventory.js';
import { burst, ring } from './fx.js';
import { sfx } from '../core/audio.js';
import { meta } from '../core/save.js';
import { RARITIES } from '../core/rarity.js';

export const xpNeed = () =>
  Math.round(8 + 4 * state.level + 0.35 * state.level * state.level); // level atlama giderek yavaşlar

// Kill: coin, xp, item. Luck: coin değeri, item şansı ve item nadirliğini artırır (boss'ta ekstra).
on('Kill', ({ target: t }) => {
  if (t.team !== 'e') return;
  const luck = stat(state.player, 'luck');
  state.kills++;
  state.xp += t.xp;
  if (t.dropId)
    state.pickups.push({
      type: 'item',
      def: ITEMS.find((i) => i.id === t.dropId),
      x: t.x + 20,
      y: t.y,
    }); // bosa özel ödül
  const k = t.boss ? 8 : t.mini ? 4 : 1;
  for (let i = 0; i < k; i++)
    state.pickups.push({
      type: 'coin',
      v: Math.max(
        1,
        Math.round((t.coin / k) * BAL.coinMul * (1 + luck * 0.01)),
      ),
      x: t.x + rnd(-18, 18),
      y: t.y + rnd(-18, 18),
    });
  const chance = t.boss
    ? 1
    : t.mini
      ? 0.45
      : Math.min(BAL.itemDropMax, BAL.itemDropBase + luck * BAL.itemDropLuck) *
        (t.elite ? 4 : 1); // item şansı düşük; boss garantili
  if (Math.random() < chance) {
    const L = luck + (t.boss ? 5 : t.mini ? 3 : t.elite ? 2 : 0),
      ws = ITEMS.map((i) => (i.unique ? 0 : weightOf(i.rarity, L)));
    let x = Math.random() * ws.reduce((a, b) => a + b, 0);
    const idx = ws.findIndex((w) => (x -= w) <= 0);
    state.pickups.push({
      type: 'item',
      def: ITEMS[idx < 0 ? 0 : idx],
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
    k.age = (k.age || 0) + dt;
    if (k.type === 'item' && k.age > BAL.itemLife) return false; // yerdeki item zamanla kaybolur
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
      meta.stats.coins += k.v;
      burst(k.x, k.y, '#e0b040', 3, 80, 0.3);
      sfx('coin');
      return false;
    }
    const ok = addItem(k.def);
    if (ok) {
      const c = RARITIES[k.def.rarity].col;
      ring(k.x, k.y, 40, c);
      burst(k.x, k.y, c, 10, 160, 0.5);
      sfx('item');
    }
    return !ok;
  });
}

// Item seçimi (sandık/tüccar için): luck + bonus, en az minTier. unique/lanetli itemlar rastgele gelmez.
export function rollItem(bonus = 0, minTier = 0) {
  const luck = stat(state.player, 'luck') + bonus,
    pool = ITEMS.filter((i) => !i.unique && RARITIES[i.rarity].tier >= minTier),
    ws = pool.map((i) => weightOf(i.rarity, luck));
  let x = Math.random() * ws.reduce((a, b) => a + b, 0);
  const idx = ws.findIndex((w) => (x -= w) <= 0);
  return pool[idx < 0 ? 0 : idx];
}
