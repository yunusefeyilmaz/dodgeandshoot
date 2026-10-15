import { state, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
import { held } from '../core/keymap.js';
export const inputDir = () => {
  let dx = (held('right') ? 1 : 0) - (held('left') ? 1 : 0),
    dy = (held('down') ? 1 : 0) - (held('up') ? 1 : 0);
  if (state.reverse > 0) {
    dx = -dx;
    dy = -dy;
  } // genjutsu: kontroller ters
  return [dx, dy];
};
export function updatePlayer(dt) {
  const p = state.player;
  if (!Number.isFinite(p.x + p.y)) {
    p.x = W / 2;
    p.y = H / 2;
  }
  if (!Number.isFinite(p.hp)) p.hp = stat(p, 'maxHp'); // NaN güvenlik ağı (siyah ekran olmasın)
  if (state.reverse > 0) state.reverse -= dt;
  if (p.stun > 0 || p.dashV) return; // sersemlemişken / dash atarken normal hareket yok
  const s = stat(p, 'speed') * (p.slow ? 1 - p.slow.v : 1) * dt,
    [dx, dy] = inputDir(),
    n = Math.hypot(dx, dy) || 1;
  if (dx || dy) p.lastDir = [dx / n, dy / n];
  p.x = Math.min(W, Math.max(0, p.x + (dx / n) * s));
  p.y = Math.min(H, Math.max(0, p.y + (dy / n) * s));
}
