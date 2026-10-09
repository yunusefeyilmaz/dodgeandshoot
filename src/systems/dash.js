import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { meta } from '../core/save.js';
import { sfx } from '../core/audio.js';
import { foes } from '../core/entity.js';
import { burst, ring, shake } from './fx.js';
import { addBuff } from './buffs.js';
import { dealDamage } from './combat.js';
import { inputDir } from './player.js';
// DASH (Shift): kısa mesafe atılır, kısa süre dokunulmaz. Dokunulmazken bir saldırı değerse MÜKEMMEL KAÇIŞ: zaman yavaşlar + buff.
const maxCharges = (p) => Math.round(stat(p, 'dashCharges'));
export const dashRecharge = (p) =>
  Math.max(0.5, (1.6 * stat(p, 'dashCdMul') * 100) / (100 + stat(p, 'haste')));
export const dashState = (p) => (p.dash ??= { charges: maxCharges(p), t: 0 });
export function tryDash() {
  const p = state.player,
    d = dashState(p);
  if (
    state.mode !== 'run' ||
    state.paused ||
    state.over ||
    p.dashV ||
    p.stun > 0 ||
    d.charges < 1
  )
    return false;
  let [dx, dy] = inputDir();
  if (!dx && !dy) [dx, dy] = p.lastDir || [1, 0];
  const n = Math.hypot(dx, dy) || 1;
  dx /= n;
  dy /= n;
  p.lastDir = [dx, dy];
  if (d.charges === maxCharges(p)) d.t = dashRecharge(p);
  d.charges--;
  p.dashV = { dx, dy, t: 0.16 };
  p.invuln = stat(p, 'dashIframe');
  sfx('dash');
  burst(p.x, p.y, '#5cc8ff', 10, 260, 0.3);
  return true;
}
export function updateDash(dt) {
  const p = state.player,
    d = dashState(p),
    mx = maxCharges(p);
  p.invuln = Math.max(0, (p.invuln || 0) - dt);
  p.pdCd = Math.max(0, (p.pdCd || 0) - dt);
  if (d.charges > mx) d.charges = mx;
  if (d.charges < mx) {
    d.t -= dt;
    if (d.t <= 0) {
      d.charges++;
      d.t = d.charges < mx ? dashRecharge(p) : 0;
    }
  }
  const v = p.dashV;
  if (!v) return;
  if (!Number.isFinite(v.dx)) {
    p.dashV = null;
    return;
  } // bozuk dash verisi (NaN) koruması
  p.x = Math.min(3200, Math.max(0, p.x + v.dx * 900 * dt));
  p.y = Math.min(2400, Math.max(0, p.y + v.dy * 900 * dt));
  v.t -= dt;
  if (Math.random() < 0.8) burst(p.x, p.y, '#5cc8ff', 1, 20, 0.25);
  const tr = stat(p, 'dashTrail'); // Ateş İzi: dash yolunda yanan bölgeler
  if (tr > 0 && (v.z = (v.z || 0) - dt) <= 0) {
    v.z = 0.04;
    state.zones.push({
      x: p.x,
      y: p.y,
      r: 30,
      t: 2.5,
      team: 'p',
      src: p,
      dps: tr * (20 + stat(p, 'ad') + stat(p, 'ap')),
      col: '#ff8a3d',
      tick: 0,
    });
  }
  if (v.t <= 0) {
    p.dashV = null;
    const b = stat(p, 'dashBlast'); // Patlayan Dash: bittiği yerde patlama
    if (b > 0) {
      const r = 90,
        dmg = b * (20 + stat(p, 'ad') + stat(p, 'ap')) * stat(p, 'damage');
      for (const e of foes(p))
        if (Math.hypot(e.x - p.x, e.y - p.y) < r + e.r)
          dealDamage(p, e, dmg, ['Status', 'Area', 'Dash'], { type: 'magic' });
      state.fx.push({ x: p.x, y: p.y, r, t: 0.25 });
      burst(p.x, p.y, '#ffb050', 18, 300, 0.5);
      shake(0.2);
    }
  }
}
export function perfectDodge() {
  const p = state.player;
  if ((p.pdCd || 0) > 0) return;
  p.pdCd = 1.2;
  state.slowT = 0.45;
  meta.stats.dodges = (meta.stats.dodges || 0) + 1;
  addBuff(p, {
    id: 'perfect',
    name: 'Mükemmel Kaçış',
    desc: '+%25 saldırı hızı, +%15 hareket hızı',
    col: '#5cc8ff',
    glyph: '💨',
    dur: 4,
    mods: [
      { stat: 'attackSpeed', op: 'mul', value: 1.25 },
      { stat: 'speed', op: 'mul', value: 1.15 },
    ],
  });
  state.texts.push({
    x: p.x,
    y: p.y - 30,
    vy: -40,
    t: 1,
    big: true,
    col: '#5cc8ff',
    text: 'KAÇTIN!',
  });
  ring(p.x, p.y, 90, '#5cc8ff');
  sfx('crit');
}
addEventListener('keydown', (e) => {
  if (e.key === 'Shift' && !e.repeat) tryDash();
});
