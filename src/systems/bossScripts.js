import { state, dist, toast, rnd } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addTele } from './telegraph.js';
import { burst, shake, ring } from './fx.js';
import { dealDamage } from './combat.js';
import { ABILITIES } from '../data/abilities.js';
// Özel boss davranışları. custom:true => varsayılan AI yerine update() çalışır. tick() her karede ek davranış. onDeath() true dönerse ölüm iptal (yeniden doğuş).
function dive(e, p) {
  // Hulud: yer altına girer; çıkacağı alan(lar) önce gösterilir
  e.wstate = 'under';
  e.under = true;
  const r = 100,
    dmg = 40 * stat(e, 'damage'),
    ph = e.phaseIdx || 0,
    spots = [{ x: p.x, y: p.y }];
  if (ph >= 1) spots.push({ x: p.x + rnd(-280, 280), y: p.y + rnd(-280, 280) }); // faz 2: ikinci patlama alanı
  spots.forEach((sp, i) =>
    addTele({
      kind: 'circle',
      x: sp.x,
      y: sp.y,
      r,
      t: 1.5,
      team: 'e',
      follow: e,
      onEnd: () => {
        if (dist(sp, state.player) < r + 10)
          dealDamage(e, state.player, dmg, ['Area'], { type: 'phys' });
        state.fx.push({ x: sp.x, y: sp.y, r, t: 0.3 });
        burst(sp.x, sp.y, e.col, 30, 300, 0.7);
        shake(0.6);
        if (i) return; // asıl çıkış ilk alan
        e.x = sp.x;
        e.y = sp.y;
        e.segs.forEach((g) => {
          g.x = sp.x;
          g.y = sp.y;
        });
        e.under = false;
        e.wstate = 'surface';
        e.wt = ph >= 1 ? 5 : 7;
        e.exposed = ph >= 2 ? 2.5 : 3.5;
        toast('Hulud bitkin düştü! Başını vur! (hasar ×1.6)'); // BİTKİN penceresi: hareket yok, hasar x1.6
        if (ph >= 2)
          for (let k = 0; k < 4; k++)
            state.spawnAt &&
              state.spawnAt(
                'swarmer',
                sp.x + rnd(-60, 60),
                sp.y + rnd(-60, 60),
              );
      },
    }),
  );
}
// Faz sistemi (tüm bosslar için ortak): script.phases = [{at: can oranı, text, enter(e)}]
export function checkPhase(e) {
  const S = SCRIPTS[e.script],
    ph = S && S.phases && S.phases[e.phaseIdx || 0];
  if (!ph || e.hp / e.hpMax > ph.at) return;
  e.phaseIdx = (e.phaseIdx || 0) + 1;
  e.phase = e.phaseIdx + 1;
  toast(ph.text);
  ring(e.x, e.y, 220, e.col);
  burst(e.x, e.y, e.col, 40, 380, 0.8);
  shake(0.8);
  ph.enter(e);
}
export const SCRIPTS = {
  worm: {
    custom: true,
    // Gövde mermiyi emer (hasar vermez); sadece parlayan BAŞ hasar alır. Yer altından çıkınca BİTKİN kalır.
    phases: [
      {
        at: 0.66,
        text: 'Hulud öfkelendi! Daha hızlı ve iki yerden çıkıyor!',
        enter(e) {
          e.parts.push({ mods: [{ stat: 'speed', op: 'mul', value: 1.25 }] });
          e.wt = 0;
        },
      },
      {
        at: 0.33,
        text: 'Hulud çıldırdı! Yolu asitle doluyor, yavrular çıkıyor!',
        enter(e) {
          e.acid = true;
          e.wt = 0;
        },
      },
    ],
    init(e) {
      e.segs = Array.from({ length: 16 }, () => ({ x: e.x, y: e.y, r: 17 }));
      e.wstate = 'surface';
      e.wt = 7;
      e.exposed = 0;
    },
    update(e, p, dt) {
      if (e.exposed > 0) {
        e.exposed -= dt;
        return;
      } // bitkin: kıpırdamaz, zararsız, ağır hasar alır
      if (e.wstate !== 'surface') return;
      const want = Math.atan2(p.y - e.y, p.x - e.x),
        da = ((want - e.face + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
        tr = 1.7 * dt;
      e.face += Math.max(-tr, Math.min(tr, da));
      const s = stat(e, 'speed') * (e.slow ? 1 - e.slow.v : 1) * dt;
      e.x += Math.cos(e.face) * s;
      e.y += Math.sin(e.face) * s;
      let px = e.x,
        py = e.y,
        touch = dist(e, p) < e.r + 10;
      for (const g of e.segs) {
        const d = Math.hypot(g.x - px, g.y - py) || 1,
          k = d - 26;
        if (k > 0) {
          g.x -= ((g.x - px) / d) * k;
          g.y -= ((g.y - py) / d) * k;
        }
        px = g.x;
        py = g.y;
        if (dist(g, p) < g.r + 10) touch = true;
      }
      if (e.acid && (e.acidT = (e.acidT || 0) - dt) <= 0) {
        e.acidT = 0.25;
        for (const g of [e, ...e.segs.filter((_, i) => i % 4 === 0)])
          state.zones.push({
            x: g.x,
            y: g.y,
            r: 22,
            t: 3,
            team: 'e',
            src: e,
            dps: 14 * stat(e, 'damage'),
            col: '#7bd94a',
            tick: 0,
          });
      }
      if (touch && !(p.invuln > 0)) {
        p.hp -=
          (12 * (e.contact || 1) * stat(e, 'damage') * dt * 100) /
          (100 + stat(p, 'armor'));
        p.hurt = 0.12;
        state.flash = Math.max(state.flash, 0.3);
        shake(0.12);
      }
      if ((e.wt -= dt) <= 0) dive(e, p);
    },
  },
  nel: {
    tick(e) {
      // Nel: arkadaşı ölünce Cero ve yansıtma güçlenir
      const alive = state.ents.filter(
          (x) => x.group === e.group && x !== e && x.hp > 0,
        ).length,
        dead = e.groupN - 1 - alive;
      e.pw = 1 + dead * 0.7;
      if (dead < 1) return;
      e.reflectCd = (e.reflectCd || 0) - 1 / 60;
      if (e.reflectCd > 0) return;
      for (const pr of state.projs)
        if (pr.team === 'p' && dist(pr, e) < e.r + 14) {
          pr.team = 'e';
          pr.src = e;
          pr.vx *= -1.3;
          pr.vy *= -1.3;
          pr.dmg *= 1 + dead * 0.6;
          pr.hit = new Set();
          pr.life = 2.5;
          pr.col = '#ff9ad5';
          e.reflectCd = 6 - dead * 1.5;
          ring(e.x, e.y, 60, '#ff9ad5');
          burst(e.x, e.y, '#ff9ad5', 12, 200, 0.4);
          break;
        }
    },
  },
  itsugo: {
    tick(e, p, dt) {
      if (e.phase === 2 && e.dashV) {
        e.trail = (e.trail || 0) - dt;
        if (e.trail <= 0) {
          e.trail = 0.06;
          state.zones.push({
            x: e.x,
            y: e.y,
            r: 32,
            t: 4,
            team: 'e',
            src: e,
            dps: 22 * stat(e, 'damage'),
            col: '#ff7a2a',
            tick: 0,
          });
        }
      }
    },
    onDeath(e) {
      // ilk ölümde yeniden doğar: daha hızlı, güçlü, hilal dalgası + dash zinciri + yanan iz
      if (e.revived) return false;
      e.revived = true;
      e.phase = 2;
      e.hp = e.hpMax * 0.85;
      e.name = 'Itsugo · Kızıl Mod';
      e.col = '#ff5a3a';
      e.dashV = null;
      e.lock = 0;
      e.parts.push({
        mods: [
          { stat: 'damage', op: 'mul', value: 1.5 },
          { stat: 'speed', op: 'mul', value: 1.35 },
        ],
      });
      for (const id of ['crescent', 'iaido2']) {
        e.abilities.push(ABILITIES[id]);
        e.cd[id] = 1;
      }
      toast('Itsugo yeniden doğdu!');
      ring(e.x, e.y, 200, '#ff5a3a');
      burst(e.x, e.y, '#ff5a3a', 50, 400, 0.9);
      shake(0.9);
      return true;
    },
  },
};
