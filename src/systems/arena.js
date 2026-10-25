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
  mines: [],
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
          if (!A.dark.lights.some((l) => dist(l, P()) < l.r)) drain(e, 2);
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
        shake(0.3);
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
      if (Math.random() < 0.5 * (state.dt || 1 / 60) * 60)
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
    if (
      A.waves.length ||
      A.pillars.length ||
      A.dark ||
      A.ring ||
      A.wind ||
      A.mines.length
    )
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
  for (const m of A.mines) {
    m.t -= dt;
    if (dist(m, p) < m.r + 10 && !p.dashV) {
      m.t = 0;
      dealDamage(m.src, p, 45 * stat(m.src, 'damage'), ['Area'], {
        type: 'phys',
      });
      state.fx.push({ x: m.x, y: m.y, r: 90, t: 0.3, s: 'fire' });
      burst(m.x, m.y, '#ff7a3a', 20, 300, 0.5);
      shake(0.3);
    } else
      for (const pr of state.projs)
        if (pr.team === 'p' && Math.hypot(pr.x - m.x, pr.y - m.y) < m.r + 6) {
          m.t = 0;
          state.fx.push({ x: m.x, y: m.y, r: 90, t: 0.3, s: 'fire' });
          burst(m.x, m.y, '#ff7a3a', 16, 260, 0.5);
          for (const f of state.ents)
            if (f.team === 'e' && f.hp > 0 && !f.boss && dist(f, m) < 90)
              f.hp -= 40;
          break;
        }
  }
  A.mines = A.mines.filter((m) => m.t > 0);
}
MECH.sand = {
  hint: 'Kum çukurları çekiyor! Çukurlardan uzak dur!',
  tick(e, ar, dt) {
    ar.t = (ar.t ?? 3) - dt;
    if (ar.t > 0 || idle(e)) return;
    ar.t = 5;
    const p = P();
    for (let i = 0; i < 2; i++) {
      const a = rnd(0, 6.28),
        d = rnd(60, 220);
      state.zones.push({
        x: p.x + Math.cos(a) * d,
        y: p.y + Math.sin(a) * d,
        r: 110,
        t: 8,
        team: 'e',
        src: e,
        dps: 8 * stat(e, 'damage'),
        col: '#c9a560',
        slow: 0.5,
        pull: 110,
        tick: 0,
      });
    }
  },
};
MECH.magma = {
  hint: 'Lav çatlakları ve sarsıntı dalgaları birlikte!',
  tick(e, ar, dt, A) {
    MECH.lava.tick(e, (ar.l ??= {}), dt, A);
    MECH.golem.tick(e, (ar.g ??= {}), dt, A);
  },
};
// ——— F3: yeni boss arena mekanikleri ———
const segDist = (p, x1, y1, x2, y2) => {
  const dx = x2 - x1,
    dy = y2 - y1,
    t = clamp(
      ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy || 1),
      0,
      1,
    );
  return Math.hypot(p.x - (x1 + dx * t), p.y - (y1 + dy * t));
};
const slash = (e, x1, y1, x2, y2, w, t, dmg) =>
  addTele({
    kind: 'line',
    x1,
    y1,
    x2,
    y2,
    w,
    t,
    team: 'e',
    follow: e,
    onEnd: () => {
      // çizgi uyarısı: bitince çizgide duran vurulur
      if (segDist(P(), x1, y1, x2, y2) < w / 2 + 10)
        dealDamage(e, P(), dmg * stat(e, 'damage'), ['Area'], { type: 'phys' });
      shake(0.12);
      state.fx.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        r: 60,
        t: 0.25,
        s: 'slash',
      });
    },
  });
const ray = (e, a, w, t, dmg) =>
  slash(
    e,
    e.x,
    e.y,
    e.x + Math.cos(a) * 1500,
    e.y + Math.sin(a) * 1500,
    w,
    t,
    dmg,
  );
const through = (e, cx, cy, a, w, t, dmg) =>
  slash(
    e,
    cx - Math.cos(a) * 700,
    cy - Math.sin(a) * 700,
    cx + Math.cos(a) * 700,
    cy + Math.sin(a) * 700,
    w,
    t,
    dmg,
  );
const cloud = (hint, every, col, dps) => ({
  hint,
  tick(e, ar, dt) {
    ar.t = (ar.t ?? 3) - dt;
    if (ar.t > 0 || idle(e)) return;
    ar.t = every;
    const p = P();
    for (let i = 0; i < 3; i++) {
      const a = rnd(0, 6.28),
        d = rnd(60, 240);
      state.zones.push({
        x: p.x + Math.cos(a) * d,
        y: p.y + Math.sin(a) * d,
        r: 80,
        t: 9,
        team: 'e',
        src: e,
        dps: dps * stat(e, 'damage'),
        col,
        tick: 0,
        grow: 8,
      });
    }
  },
});
Object.assign(MECH, {
  shock: waveMech(
    'Şok dalgaları! Dalganın içinden dash ile geç!',
    3.4,
    400,
    26,
    undefined,
    '#ffd08a',
  ),
  blood: {
    hint: 'Kan havuzları yayılıyor! Kırmızı alanlardan kaç!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 3) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 4.5;
      const p = P();
      for (let i = 0; i < 5; i++) {
        const a = i * 1.257 + rnd(0, 1),
          d = rnd(80, 230);
        state.zones.push({
          x: clamp(p.x + Math.cos(a) * d, 40, W - 40),
          y: clamp(p.y + Math.sin(a) * d, 40, H - 40),
          r: 55,
          t: 6,
          team: 'e',
          src: e,
          dps: 20 * stat(e, 'damage'),
          col: '#b01030',
          tick: 0,
        });
      }
    },
  },
  mines: {
    hint: 'Mayınlar saçılıyor! Kırmızı noktalara basma, ateşle patlat!',
    tick(e, ar, dt, A) {
      ar.t = (ar.t ?? 2) - dt;
      if (ar.t > 0 || idle(e) || A.mines.length > 14) return;
      ar.t = 4;
      const p = P();
      for (let i = 0; i < 4; i++) {
        const a = rnd(0, 6.28),
          d = rnd(90, 300);
        A.mines.push({
          x: clamp(p.x + Math.cos(a) * d, 60, W - 60),
          y: clamp(p.y + Math.sin(a) * d, 60, H - 60),
          r: 18,
          t: 22,
          src: e,
        });
      }
    },
  },
  moon: {
    hint: 'Ay ışığı çizgileri! Işığın geçeceği yerden çekil!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 3) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 3.2;
      ar.k = (ar.k || 0) + 1;
      const p = P(),
        base = Math.atan2(p.y - e.y, p.x - e.x) + (ar.k % 2 ? 0.35 : -0.35);
      for (let i = -1; i <= 1; i++) ray(e, base + i * 0.5, 60, 1.1, 38);
    },
  },
  genjutsu: {
    hint: 'Tsukuyomi! Kırmızı ekranda kontroller TERS döner (dash bozar)!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 6) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 11 - (e.phaseIdx || 0) * 2;
      state.reverse = 3;
      state.flash = 1;
      toast('TSUKUYOMI! Kontroller ters!');
      ring(P().x, P().y, 200, '#ff2040');
    },
  },
  storm: {
    hint: 'Şimşek fırtınası! Mavi alanlardan çekil!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 2) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 1.6 - (e.phaseIdx || 0) * 0.3;
      const p = P(),
        a = rnd(0, 6.28),
        d = rnd(0, 200),
        x = p.x + Math.cos(a) * d,
        y = p.y + Math.sin(a) * d;
      addTele({
        kind: 'circle',
        x,
        y,
        r: 70,
        t: 0.9,
        team: 'e',
        follow: e,
        onEnd: () => {
          if (dist({ x, y }, P()) < 80)
            dealDamage(e, P(), 30 * stat(e, 'damage'), ['Area'], {
              type: 'magic',
            });
          state.fx.push({ x, y, r: 70, t: 0.3, s: 'bolt' });
          burst(x, y, '#9bd8ff', 14, 260, 0.5);
          shake(0.15);
        },
      });
    },
  },
  gravity: {
    hint: 'Shinra Tensei! Çekilirsin, sonra patlama: patlamadan uzaklaş!',
    tick(e, ar, dt) {
      const p = P();
      if (ar.m === 'pull') {
        ar.pt -= dt;
        const d = dist(e, p) || 1;
        if (!p.dashV) {
          p.x += ((e.x - p.x) / d) * 190 * dt;
          p.y += ((e.y - p.y) / d) * 190 * dt;
        }
        if (ar.pt <= 0) {
          ar.m = null;
          ring(e.x, e.y, 300, '#ff9a3a');
          const ex = e.x,
            ey = e.y;
          addTele({
            kind: 'circle',
            x: ex,
            y: ey,
            r: 260,
            t: 0.8,
            team: 'e',
            follow: e,
            onEnd: () => {
              const q = P(),
                d2 = dist({ x: ex, y: ey }, q) || 1;
              if (d2 < 270) {
                dealDamage(e, q, 55 * stat(e, 'damage'), ['Area'], {
                  type: 'magic',
                });
                q.x = clamp(q.x + ((q.x - ex) / d2) * 380, 0, W);
                q.y = clamp(q.y + ((q.y - ey) / d2) * 380, 0, H);
              }
              burst(ex, ey, '#ff9a3a', 30, 400, 0.6);
              shake(0.6);
            },
          });
        }
        return;
      }
      ar.t = (ar.t ?? 5) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 9;
      ar.m = 'pull';
      ar.pt = 2.6;
      toast('Çekim başladı! Dash ile kurtul');
    },
  },
  aura: {
    hint: "Ruhani baskı! Kenpaçi'ye fazla yaklaşma, yakınında can erir!",
    tick(e, ar, dt) {
      const R = 200 + (e.phaseIdx || 0) * 60;
      ar.R = R;
      ar.tk = (ar.tk || 0) - dt;
      if (ar.tk <= 0) {
        ar.tk = 0.4;
        if (dist(e, P()) < R && !e.under) drain(e, 9);
      }
      if (Math.random() < 0.5 * (state.dt || 1 / 60) * 60)
        state.parts.push({
          x: e.x + rnd(-R, R) * 0.8,
          y: e.y + rnd(-R, R) * 0.8,
          vx: 0,
          vy: -60,
          t: 0.5,
          max: 0.5,
          col: '#ffd84f',
          r: 2,
        });
    },
  },
  petals: {
    hint: 'Senbonzakura! Yaprak spirallerinin arasından geç!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 1.5) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 1.1 - (e.phaseIdx || 0) * 0.15;
      ar.k = (ar.k || 0) + 0.37;
      for (let i = 0; i < 10; i++) {
        const a = ar.k + i * 0.6283;
        state.projs.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(a) * 150,
          vy: Math.sin(a) * 150,
          dmg: 9 * stat(e, 'damage'),
          type: 'phys',
          team: 'e',
          src: e,
          tags: ['Projectile'],
          life: 4,
          col: '#ffb0d0',
          size: 5,
          shape: 'petal',
          pierce: 0,
          hit: new Set(),
          accel: 0.15,
        });
      }
    },
  },
  abyss: {
    hint: 'Boşluk çukurları her şeyi içine çekiyor!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 3) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 4.5;
      const p = P();
      for (let i = 0; i < 2; i++) {
        const a = rnd(0, 6.28),
          d = rnd(80, 240);
        state.zones.push({
          x: p.x + Math.cos(a) * d,
          y: p.y + Math.sin(a) * d,
          r: 95,
          t: 8,
          team: 'e',
          src: e,
          dps: 12 * stat(e, 'damage'),
          col: '#2a1a5a',
          slow: 0.4,
          pull: 170,
          tick: 0,
        });
      }
    },
  },
  claws: {
    hint: 'Pençe izleri! Çizgilerin dışına çık!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 2.5) - dt;
      if (ar.t > 0 || idle(e)) return;
      ar.t = 3.4 - (e.phaseIdx || 0) * 0.4;
      const p = P(),
        base = Math.atan2(p.y - e.y, p.x - e.x);
      for (let i = 0; i < 5; i++) ray(e, base + (i - 2) * 0.3, 46, 0.9, 40);
    },
  },
  butterfly: cloud(
    'Reishi kelebekleri! Mor bulutlardan uzak dur!',
    5.5,
    '#a070ff',
    11,
  ),
  planet: {
    hint: 'Gezegen çöküyor! Çemberin içinde kal, dalgalardan geç!',
    tick(e, ar, dt, A) {
      MECH.ring.tick(e, (ar.r ??= {}), dt, A);
      MECH.golem.tick(e, (ar.g ??= {}), dt, A);
    },
  },
  domain: {
    hint: 'Kutsal Mabet! Kesik çizgilerinin arasında kal!',
    tick(e, ar, dt) {
      ar.t = (ar.t ?? 3) - dt;
      if (ar.t > 0 || idle(e)) return;
      const ph = e.phaseIdx || 0;
      ar.t = ph >= 1 ? 0.9 : 2.2;
      const p = P();
      for (let i = 0; i < (ph >= 1 ? 2 : 1); i++)
        through(
          e,
          p.x + rnd(-90, 90),
          p.y + rnd(-90, 90),
          rnd(0, 3.14),
          44,
          0.75,
          34,
        );
    },
  },
});
