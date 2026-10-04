import { state, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
const keys = {};
addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = 1));
addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = 0));
export function updatePlayer(dt) {
  const p = state.player;
  if (p.stun > 0) return; // sersemlemişken hareket edemez
  const s = stat(p, 'speed') * (p.slow ? 1 - p.slow.v : 1) * dt;
  const dx =
    (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  const dy =
    (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  const n = Math.hypot(dx, dy) || 1;
  p.x = Math.min(W, Math.max(0, p.x + (dx / n) * s));
  p.y = Math.min(H, Math.max(0, p.y + (dy / n) * s));
}
