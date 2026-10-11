import { state, toast, rnd, dist, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addTele } from './telegraph.js';
import { burst, ring, shake } from './fx.js';
import { dealDamage } from './combat.js';
// BOSS ARENA MEKANİKLERİ: her mekanik MECH tablosunda; boss tanımındaki `arena` alanıyla eşlenir. Boss ölünce arena temizlenir.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)),
  P = () => state.player;
const drain = (e, k) =>
  dealDamage(e, P(), k * stat(e, 'damage'), ['Status', 'Area'], {
    trueDmg: true,
    type: 'magic',
  }); // süreli hasar: dokunulmazlıkta işlemez
export const newArena = () => ({
  waves: [],
  pillars: [],
  dark: null,
  ring: null,
  wind: null,
});
const idle = (e) => e.exposed > 0 || e.under;
const waveMech = (hint, every, speed, dmg, proc, col) => ({
  hint,
  tick(e, ar, dt, A) {
    // genişleyen halka: dash ile içinden geç
    ar.t = (ar.t ?? 3) - dt;
    if (ar.t > 0 || idle(e)) return;
    ar.t = every;
    A.waves.push({
      x: e.x,
      y: e.y,
      r: 20,
      speed,
      w: 28,
      dmg,
      proc,
      col,
      hit: false,
      src: e,
    });
    shake(0.2);
  },
});
const MECH = {
  dark: {
    hint: 'Karanlık çökünce ışık çemberine gir!',
    tick(e, ar, dt, A) {
      ar.t = (ar.t ?? 8) - dt;
      if (A.dark) {
        A.dark.t -= dt;
        ar.tk = (ar.tk || 0) - dt;
        if (ar.tk <= 0) {
          ar.tk = 0.5;
          if (!A.dark.lights.some((l) => dist(l, P()) < l.r)) drain(e, 1);
        }
        if (A.dark.t <= 0) {
          A.dark = null;
          ar.t = 10;
        }
      } else if (ar.t <= 0 && !idle(e)) {
        const p = P();
        A.dark = {
          t: 6,
          lights: Array.from({ length: 3 }, () => {
            const a = rnd(0, 6.28),
              d = rnd(130, 320);
            return {
              x: clamp(p.x + Math.cos(a) * d, 100, W - 100),
              y: clamp(p.y + Math.sin(a) * d, 100, H - 100),
              r: 110,
            };
          }),
        };
        toast('Karanlık çöküyor! Işık çemberine gir!');
        shake(1);
      }
    },
  },
  golem: waveMech(
    'Sarsıntı dalgaları! Dalganın içinden dash ile geç!',
    4.5,
    300,
    36,
    undefined,
    '#ff6a4a',
  ),
  frost: waveMech(
    'Buz dalgaları yavaşlatır! Dash ile geç!',
    5,
    260,
    22,
    { slow: 0.6 },
    '#8fd8ff',
  ),
  lava: {
    hint: 'Lav çatlakları! Kırmızı çizgilerden uzak dur!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 4) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 6;
      const p = P(),
        base = Math.atan2(p.y - e.y, p.x - e.x);
      [-0.55, 0, 0.55].forEach((o) => {
        const a = base + o;
        addTele({
          kind: 'line',
          x1: e.x,
          y1: e.y,
          x2: e.x + Math.cos(a) * 1400,
          y2: e.y + Math.sin(a) * 1400,
          w: 70,
          t: 1.2,
          team: 'e',
          follow: e,
          onEnd: () => {
            for (let d = 60; d < 1400; d += 45)
              state.zones.push({
                x: e.x + Math.cos(a) * d,
                y: e.y + Math.sin(a) * d,
                r: 36,
                t: 4,
                team: 'e',
                src: e,
                dps: 26 * stat(e, 'damage'),
                col: '#ff5a1a',
                tick: 0,
              });
            shake(0.3);
          },
        });
      });
    },
  },
  ring: {
    hint: 'Zaman çöküyor! Daralan çemberin içinde kal!',
    tick(e, ar, dt, A) {
      if (!A.ring) {
        const p = P();
        A.ring = {
          x: p.x,
          y: p.y,
          r: 760,
          maxR: 760,
          minR: 250,
          ph: 'shrink',
          t: 0,
        };
      }
      const R = A.ring;
      R.t += dt;
      if (R.ph === 'shrink') {
        R.r = Math.max(R.minR, R.r - 24 * dt);
        if (R.r <= R.minR) {
          R.ph = 'hold';
          R.t = 0;
        }
      } else if (R.ph === 'hold' && R.t > 6) R.ph = 'grow';
      if (R.ph === 'grow') {
        R.r = Math.min(R.maxR, R.r + 220 * dt);
        if (R.r >= R.maxR) {
          R.ph = 'shrink';
          R.t = 0;
        }
      }
      ar.tk = (ar.tk || 0) - dt;
      if (ar.tk <= 0) {
        ar.tk = 0.5;
        if (dist(R, P()) > R.r) drain(e, 12);
      }
    },
  },
  wind: {
    hint: 'Rüzgar sürekli itiyor! Dash ile karşı koy!',
    tick(e, ar, dt, A) {
      const w = (A.wind ??= { a: rnd(0, 6.28), f: 120 }),
        p = P();
      ar.t = (ar.t ?? 5) - dt;
      if (ar.t <= 0) {
        w.a = rnd(0, 6.28);
        ar.t = 6;
        toast('Rüzgar yön değiştirdi!');
      }
      if (!p.dashV && !(p.stun > 0)) {
        p.x = clamp(p.x + Math.cos(w.a) * w.f * dt, 0, W);
        p.y = clamp(p.y + Math.sin(w.a) * w.f * dt, 0, H);
      }
      if (Math.random() < 0.5)
        state.parts.push({
          x: p.x + rnd(-500, 500),
          y: p.y + rnd(-350, 350),
          vx: Math.cos(w.a) * 400,
          vy: Math.sin(w.a) * 400,
          t: 0.6,
          max: 0.6,
          col: '#cfeaff',
          r: 2,
        });
    },
  },
  clouds: {
    hint: 'Zehir bulutları büyüyor! Hareket halinde kal!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 2.5) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 3.5;
      const p = P(),
        a = rnd(0, 6.28),
        d = rnd(0, 160);
      state.zones.push({
        x: p.x + Math.cos(a) * d,
        y: p.y + Math.sin(a) * d,
        r: 40,
        maxR: 150,
        grow: 30,
        t: 7,
        team: 'e',
        src: e,
        dps: 18 * stat(e, 'damage'),
        col: '#7bd94a',
        tick: 0,
      });
    },
  },
  pillars: {
    hint: 'Sütunların arkasına saklan: yıldırımları durdururlar!',
    tick(e, ar, dt, A) {
      ar.t = (ar.t ?? 0) - dt;
      const p = P();
      if (ar.t <= 0) {
        ar.t = 14;
        for (let i = 0; i < 4; i++)
          if (!A.pillars.some((q) => q.i === i)) {
            const a = i * 1.5708 + 0.5;
            A.pillars.push({
              i,
              x: clamp(p.x + Math.cos(a) * 300, 120, W - 120),
              y: clamp(p.y + Math.sin(a) * 300, 120, H - 120),
              r: 28,
              hp: 3,
              max: 3,
            });
          }
      }
      for (const q of A.pillars) {
        const d = dist(q, p);
        if (d < q.r + 11) {
          const ux = d > 0.01 ? (p.x - q.x) / d : 1,
            uy = d > 0.01 ? (p.y - q.y) / d : 0;
          p.x = q.x + ux * (q.r + 11);
          p.y = q.y + uy * (q.r + 11);
        }
      }
    },
  },
};
MECH.rot = {
  hint: 'Kadim Ruh her fazda yeni bir tehlike getirir!',
  tick(e, ar, dt, A) {
    const k = ['golem', 'clouds', 'ring'][Math.min(2, e.phaseIdx || 0)];
    MECH[k].tick(e, (ar[k] ??= {}), dt, A);
  },
};
export function pillarBlocks(pr) {
  // düşman mermisi/ışını sütuna çarpar: durur, sütun hasar alır
  for (const q of state.arena.pillars)
    if (dist(pr, q) < q.r + (pr.size || 4)) {
      q.hp -= pr.pierce > 50 ? 1 : 0.25;
      burst(pr.x, pr.y, '#9aa3b5', 6, 160, 0.3);
      pr.life = 0;
      if (q.hp <= 0) {
        state.arena.pillars = state.arena.pillars.filter((x) => x !== q);
        ring(q.x, q.y, 60, '#9aa3b5');
      }
      return true;
    }
  return false;
}
export function updateArena(dt) {
  let A = state.arena;
  const bosses = state.ents.filter(
    (e) => e.boss && e.arena && e.hp > 0 && MECH[e.arena],
  );
  if (!bosses.length) {
    if (A.waves.length || A.pillars.length || A.dark || A.ring || A.wind)
      state.arena = newArena();
    return;
  }
  for (const e of bosses) {
    const m = MECH[e.arena];
    if (!e.ar) {
      e.ar = {};
      toast(m.hint);
    }
    m.tick(e, e.ar, dt, A);
  }
  const p = P();
  for (const w of A.waves) {
    w.r += w.speed * dt;
    if (
      !w.hit &&
      Math.abs(Math.hypot(p.x - w.x, p.y - w.y) - w.r) < w.w / 2 + 10
    ) {
      w.hit = true;
      dealDamage(w.src, p, w.dmg * stat(w.src, 'damage'), ['Area'], {
        type: 'phys',
        proc: w.proc,
      });
    }
  }
  A.waves = A.waves.filter((w) => w.r < 1300);
}
