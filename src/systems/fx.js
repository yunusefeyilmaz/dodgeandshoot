import { state, rnd } from '../core/state.js';
// Parçacık, halka ve ekran sarsıntısı
export function burst(x, y, col, n = 6, sp = 140, life = 0.5) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.28),
      s = rnd(0.3, 1) * sp;
    state.parts.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      t: life * rnd(0.6, 1),
      max: life,
      col,
      r: rnd(1.5, 3.5),
    });
  }
  if (state.parts.length > 400) state.parts.splice(0, state.parts.length - 400);
}
export const ring = (x, y, r, col = '#fff') =>
  state.rings.push({ x, y, r: 0, max: r, col, t: 0.4 });
export const shake = (a) => {
  state.shake = Math.max(state.shake, a);
};
export function updateFx(dt) {
  for (const p of state.parts) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.t -= dt;
  }
  state.parts = state.parts.filter((p) => p.t > 0);
  for (const r of state.rings) {
    r.t -= dt;
    r.r = r.max * (1 - r.t / 0.4);
  }
  state.rings = state.rings.filter((r) => r.t > 0);
  state.shake = Math.max(0, state.shake - dt * 2.2);
}
