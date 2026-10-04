import { state, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
const keys = {};
addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = 1));
addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = 0));
export const inputDir = () => [
  (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0),
  (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0),
];
export function updatePlayer(dt) {
  const p = state.player;
  if (p.stun > 0 || p.dashV) return; // sersemlemişken / dash atarken normal hareket yok
  const s = stat(p, 'speed') * (p.slow ? 1 - p.slow.v : 1) * dt,
    [dx, dy] = inputDir(),
    n = Math.hypot(dx, dy) || 1;
  if (dx || dy) p.lastDir = [dx / n, dy / n];
  p.x = Math.min(W, Math.max(0, p.x + (dx / n) * s));
  p.y = Math.min(H, Math.max(0, p.y + (dy / n) * s));
}
