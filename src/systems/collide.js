import { state, W, H } from '../core/state.js';
// ——— ÇARPIŞMA: düşmanlar birbirinin, oyuncunun ve oyuncu düşmanların İÇİNDEN GEÇEMEZ ———
// Konum düzeltmesi (soft constraint): üst üste binen çiftler kütle oranında ayrılır. Boss ağırdır (itilmez), oyuncu orta ağırlıktadır (düşmanları itebilir
// ama içlerinden geçemez). Dash (dashV) ve dokunulmazlık sırasında oyuncu içinden geçebilir; atılan düşman da atılışı sırasında engellenmez.
// Dost varlıklar (pet, iskelet asker), toprak altı (under), solucan gövdesi (segs) ve dormant olanlar çarpışmaz.
const CELL = 64,
  OVERLAP = 0.92,
  SOFT = 0.7;
const mass = (e) =>
  e === state.player
    ? 2.4 * e.r * e.r
    : e.r *
      e.r *
      (e.boss ? 7 : e.mini ? 2.5 : e.elite ? 1.6 : 1) *
      (1 + (e.base && e.base.kbResist ? e.base.kbResist : 0));
const grid = new Map();
export function updateCollisions() {
  const p = state.player;
  if (!p) return;
  const L = [];
  for (const e of state.ents) {
    if (
      e.hp <= 0 ||
      e.dead ||
      e.isPet ||
      e.segs ||
      e.under ||
      e.dormant ||
      e.noBody
    )
      continue;
    if (e.team === 'e' || e === p) L.push(e);
  }
  if (L.length < 2) return;
  grid.clear();
  for (let i = 0; i < L.length; i++) {
    const e = L[i],
      k = ((e.x / CELL) | 0) * 1024 + ((e.y / CELL) | 0);
    let c = grid.get(k);
    if (!c) grid.set(k, (c = []));
    c.push(i);
  }
  const ghostP = p.dashV || (p.invuln > 0 && p.dashT > 0);
  for (let i = 0; i < L.length; i++) {
    const a = L[i],
      cx = (a.x / CELL) | 0,
      cy = (a.y / CELL) | 0;
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++) {
        const c = grid.get((cx + ox) * 1024 + (cy + oy));
        if (!c) continue;
        for (const j of c) {
          if (j <= i) continue;
          const b = L[j];
          if ((a === p || b === p) && ghostP) continue; // oyuncu dash atarken içinden geçer
          if (a.dashV || b.dashV) continue; // atılış sırasındaki düşman engellenmez
          let dx = b.x - a.x,
            dy = b.y - a.y;
          const minD = (a.r + b.r) * OVERLAP,
            d2 = dx * dx + dy * dy;
          if (d2 >= minD * minD) continue;
          let d = Math.sqrt(d2);
          if (d < 0.001) {
            const an = Math.random() * 6.283;
            dx = Math.cos(an);
            dy = Math.sin(an);
            d = 1;
          }
          const nx = dx / d,
            ny = dy / d,
            ov = (minD - d) * SOFT,
            ma = mass(a),
            mb = mass(b),
            wa = mb / (ma + mb),
            wb = 1 - wa;
          a.x -= nx * ov * wa;
          a.y -= ny * ov * wa;
          b.x += nx * ov * wb;
          b.y += ny * ov * wb;
        }
      }
  }
  for (const e of L) {
    e.x = Math.min(W - e.r, Math.max(e.r, e.x));
    e.y = Math.min(H - e.r, Math.max(e.r, e.y));
  }
}
