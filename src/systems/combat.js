import { state, W, H, dist, rnd } from '../core/state.js';
import { stat } from '../core/stats.js';
import { emit } from '../core/events.js';
import { foes, nearest } from '../core/entity.js';
import { burst, shake, updateFx } from './fx.js';
import { addTele, updateTele } from './telegraph.js';
import { sfx } from '../core/audio.js';
import { BAL } from '../data/balance.js';
import { SCRIPTS, checkPhase } from './bossScripts.js';
import { perfectDodge } from './dash.js';
import { addBuff, updateBuffs } from './buffs.js';

export const DMG_COL = {
  phys: '#ffffff',
  magic: '#6fb4ff',
  poison: '#6be04a',
  void: '#c05bff',
  true: '#ffd84f',
};
const cw = (v) => Math.min(W, Math.max(0, v)),
  ch = (v) => Math.min(H, Math.max(0, v));
const reach = (x, y, e, ex) =>
  (x - e.x) ** 2 + (y - e.y) ** 2 < (ex + e.r) ** 2; // gövde parçalı bosslar (Hulud)
const resOf = (x, key, rp) =>
  1 - Math.max(0, Math.min(0.95, ((x.res || {})[key] || 0) - rp)); // efekt direnci (resPen ile düşer)

// Tüm hasar buradan geçer: backstab -> kritik -> savunma (+void aşındırma) -> hasar azaltma (dr) -> knockback -> on-hit efektleri.
// tags'te 'Status' varsa kritik ve yeni efekt tetiklenmez. o: {dir, type, trueDmg, proc}
export function dealDamage(src, t, amt, tags = [], o = {}) {
  if (t.hp <= 0 || !Number.isFinite(amt)) return 0;
  if (t.invuln > 0) {
    if (!tags.includes('Status') && src !== t) perfectDodge();
    return 0;
  } // dash dokunulmazlığı; saldırı değerse mükemmel kaçış
  const status = tags.includes('Status');
  if (
    o.dir !== undefined &&
    t.face !== undefined &&
    Math.cos(o.dir - t.face) > 0.3
  )
    amt *= stat(src, 'backstab', tags);
  const crit =
    !status && Math.random() < Math.min(1, stat(src, 'critChance', tags));
  if (crit) amt *= stat(src, 'critDmg', tags);
  if (!o.trueDmg) {
    const m = o.type === 'magic',
      shred = 1 - (t.shred ? t.shred.v : 0);
    const pct = Math.min(0.9, stat(src, m ? 'magicPen' : 'armorPen', tags)),
      flat = stat(src, m ? 'magicFlat' : 'lethality', tags);
    amt *=
      100 /
      (100 +
        Math.max(0, stat(t, m ? 'mr' : 'armor') * shred * (1 - pct) - flat));
  }
  if (t.exposed > 0) amt *= 1.6; // bitkin boss daha çok hasar alır
  if (t.dr) amt *= 1 - Math.min(0.8, t.dr);
  t.hp -= amt;
  t.hurt = 0.12;
  t.barT = 2.5;
  if (o.ab && src.team === 'p')
    (state.abStats[o.ab] ??= { dmg: 0, kills: 0 }).dmg += amt; // skill başına toplam hasar
  const kind = o.type || (o.trueDmg ? 'true' : 'phys');
  if (t.team === 'e') {
    if (state.texts.length > 60) state.texts.shift();
    state.texts.push({
      x: t.x + rnd(-8, 8),
      y: t.y - t.r - 4,
      vy: -45,
      t: 0.7,
      big: crit,
      col: crit ? '#ff3b3b' : DMG_COL[kind] || '#fff',
      text: amt >= 10 ? String(Math.round(amt)) : amt.toFixed(1),
    });
    burst(
      t.x,
      t.y,
      DMG_COL[kind] || '#fff',
      crit ? 8 : 3,
      crit ? 230 : 120,
      0.35,
    );
    sfx(crit ? 'crit' : 'hit');
    if (crit) shake(0.18);
  } else {
    state.hitsTaken++;
    state.flash = Math.min(1, state.flash + 0.5);
    shake(0.3);
    sfx('hurt');
    burst(t.x, t.y, '#ff3b3b', 6, 130, 0.4);
  }
  const vamp =
    stat(src, 'omnivamp') +
    (tags.includes('Weapon') ? stat(src, 'lifesteal', tags) : 0);
  if (vamp > 0) src.hp = Math.min(stat(src, 'maxHp'), src.hp + amt * vamp);
  if (o.dir !== undefined && !status) {
    const kb =
      stat(src, 'knockback', tags) * (1 - Math.min(0.95, stat(t, 'kbResist')));
    if (kb > 0) {
      t.kx = (t.kx || 0) + Math.cos(o.dir) * kb;
      t.ky = (t.ky || 0) + Math.sin(o.dir) * kb;
    }
  }
  if (t.script && t.hp > 0) checkPhase(t); // boss fazları
  emit('DamageDealt', {
    source: src,
    target: t,
    amount: amt,
    tags,
    crit,
    type: kind,
  });
  if (!status && !tags.includes('Combo') && t.hp > 0)
    applyStatus(src, t, amt, tags, o);
  if (t.hp <= 0 && !t.dead) {
    const S = t.script && SCRIPTS[t.script];
    if (S && S.onDeath && S.onDeath(t)) return amt;
    t.dead = true;
    if (o.ab && src.team === 'p')
      (state.abStats[o.ab] ??= { dmg: 0, kills: 0 }).kills++;
    emit('Kill', { source: src, target: t, tags });
  }
  return amt;
}

// On-hit efektleri (stat + skilin kendi proc'u). effPower güçlendirir, hedefin direnci (res) azaltır, resPen direnci deler.
function applyStatus(src, t, amt, tags, o) {
  const pow = stat(src, 'effPower'),
    rp = stat(src, 'resPen'),
    px = o.proc || {},
    k = (n) => (stat(src, n, tags) + (px[n] || 0)) * pow;
  const ps = k('poison') * resOf(t, 'poison', rp); // ZEHİR: 3 sn DoT
  if (ps > 0) {
    const z = t.poison;
    t.poison = {
      ab: o.ab,
      dps: Math.max((amt * ps) / 3, z ? z.dps : 0),
      t: 3,
      src,
      tick: z ? z.tick : 0.5,
      acc: z ? z.acc : 0,
    };
  }
  const cn = k('chain'); // BÜYÜ: yakındaki 2 düşmana zincir şimşek
  if (cn > 0)
    for (const e of state.ents
      .filter(
        (e) =>
          e.team === t.team &&
          e !== t &&
          e.hp > 0 &&
          !e.isPet &&
          !e.under &&
          dist(e, t) < 170,
      )
      .sort((a, b) => dist(a, t) - dist(b, t))
      .slice(0, 2)) {
      state.lines.push({ x1: t.x, y1: t.y, x2: e.x, y2: e.y, t: 0.18 });
      dealDamage(src, e, amt * cn * resOf(e, 'chain', rp), ['Status'], {
        type: 'magic',
        ab: o.ab,
      });
    }
  const sl = k('slow') * resOf(t, 'slow', rp); // YAVAŞLATMA
  if (sl > 0.02 && (!t.slow || sl >= t.slow.v))
    t.slow = { v: Math.min(0.7, sl), t: 1.5 };
  const vs = k('voidShred') * resOf(t, 'void', rp); // VOID: zırh/MR aşındırma + void hasarı
  if (vs > 0.02) {
    t.shred = { v: Math.min(0.6, vs), t: 4 };
    dealDamage(src, t, amt * vs * 0.5, ['Status'], {
      trueDmg: true,
      type: 'void',
      ab: o.ab,
    });
  }
  const bc = stat(src, 'blast', tags) + (px.blast || 0); // PATLAMA: vuruş ihtimalle patlar (hasarın bir kısmı, alan)
  if (bc > 0 && Math.random() < bc) {
    const n = 1 + Math.round(stat(src, 'blastCount', tags)),
      r = 70 * stat(src, 'blastRadius', tags),
      bd = amt * stat(src, 'blastPower', tags);
    const boom = (x, y) => {
      for (const e of foes(src))
        if (reach(x, y, e, r))
          dealDamage(src, e, bd, ['Status', 'Blast'], {
            type: o.type,
            ab: o.ab,
          });
      state.fx.push({ x, y, r, t: 0.25 });
      burst(x, y, '#ffb050', 14, 260, 0.5);
      shake(0.1);
    };
    boom(t.x, t.y);
    for (let i = 1; i < n; i++) {
      const a = rnd(0, 6.28),
        d = rnd(30, 70),
        x = t.x + Math.cos(a) * d,
        y = t.y + Math.sin(a) * d;
      addTele({
        kind: 'circle',
        x,
        y,
        r,
        t: 0.1 + i * 0.1,
        team: src.team,
        quiet: true,
        onEnd: () => boom(x, y),
      });
    }
  }
}

const power = (c, fx, ab) =>
  (fx.damage +
    stat(c, ab.dmgType === 'magic' ? 'ap' : 'ad') * (fx.ratio ?? 1)) *
  stat(c, 'damage', ab.tags) *
  (c.pw || 1);

const EFFECTS = {
  Projectile(c, fx, ab) {
    const t = nearest(c);
    if (!t) return;
    const n = (fx.count || 1) + Math.round(stat(c, 'multishot', ab.tags)),
      base = Math.atan2(t.y - c.y, t.x - c.x);
    const spread = fx.spread || Math.min(0.6, 0.2 * (n - 1));
    for (let i = 0; i < n; i++) {
      const a = fx.radial
        ? base + (i * 6.283) / n
        : base + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0);
      state.projs.push({
        x: c.x,
        y: c.y,
        vx: Math.cos(a) * fx.speed,
        vy: Math.sin(a) * fx.speed,
        dmg: power(c, fx, ab),
        type: ab.dmgType,
        proc: fx.proc,
        ab: ab.id,
        team: c.team,
        src: c,
        tags: ab.tags,
        life: 2.5,
        col: fx.color,
        size: fx.size,
        shape: fx.shape,
        pierce: (fx.pierce || 0) + Math.round(stat(c, 'pierce', ab.tags)),
        hit: new Set(),
      });
    }
  },
  Nova(c, fx, ab) {
    const r = fx.radius * stat(c, 'area', ab.tags);
    for (const e of foes(c))
      if (reach(c.x, c.y, e, r))
        dealDamage(c, e, power(c, fx, ab), ab.tags, {
          dir: Math.atan2(e.y - c.y, e.x - c.x),
          type: ab.dmgType,
          proc: fx.proc,
          ab: ab.id,
        });
    state.fx.push({ x: c.x, y: c.y, r, t: 0.25 });
  },
  Rain(c, fx, ab) {
    // rastgele alanlara uyarılı vuruş (düşmanda kırmızı, oyuncuda mavi alan)
    const t = nearest(c);
    if (!t) return;
    const r = fx.radius * stat(c, 'area', ab.tags),
      team = c.team,
      dmg = power(c, fx, ab);
    for (
      let i = 0, N = fx.count + Math.round(stat(c, 'multishot', ab.tags));
      i < N;
      i++
    ) {
      const a = rnd(0, 6.28),
        d = i === 0 ? 0 : rnd(0, fx.spread || 240),
        x = t.x + Math.cos(a) * d,
        y = t.y + Math.sin(a) * d;
      addTele({
        kind: 'circle',
        x,
        y,
        r,
        t: fx.delay + i * 0.08,
        team,
        onEnd: () => {
          for (const e of foes({ team }))
            if (reach(x, y, e, r))
              dealDamage(c, e, dmg, ab.tags, {
                type: ab.dmgType,
                proc: fx.proc,
                ab: ab.id,
              });
          state.fx.push({ x, y, r, t: 0.25 });
          burst(x, y, team === 'e' ? '#ff6a4a' : '#9be0ff', 10, 200, 0.5);
          for (let j = 0; j < (fx.cluster || 0); j++) {
            // bomba: patlayınca küçük bombalara bölünür
            const a2 = rnd(0, 6.28),
              x2 = x + Math.cos(a2) * r * 1.5,
              y2 = y + Math.sin(a2) * r * 1.5,
              r2 = r * 0.5;
            addTele({
              kind: 'circle',
              x: x2,
              y: y2,
              r: r2,
              t: 0.6 + j * 0.08,
              team,
              onEnd: () => {
                for (const e of foes({ team }))
                  if (reach(x2, y2, e, r2))
                    dealDamage(c, e, dmg * 0.5, ab.tags, {
                      type: ab.dmgType,
                      ab: ab.id,
                    });
                state.fx.push({ x: x2, y: y2, r: r2, t: 0.25 });
                burst(x2, y2, '#ff9a4a', 6, 160, 0.4);
              },
            });
          }
        },
      });
    }
  },
  Dash(c, fx, ab) {
    // atılacak yer önce çizgiyle gösterilir
    const t = nearest(c);
    if (!t) return;
    const a = Math.atan2(t.y - c.y, t.x - c.x),
      len = fx.speed * fx.dur,
      dmg = power(c, fx, ab);
    c.lock = fx.windup + fx.dur;
    addTele({
      kind: 'line',
      x1: c.x,
      y1: c.y,
      x2: c.x + Math.cos(a) * len,
      y2: c.y + Math.sin(a) * len,
      w: (c.r + 6) * 2,
      t: fx.windup,
      team: c.team,
      follow: c,
      onEnd: () => {
        c.dashV = {
          vx: Math.cos(a) * fx.speed,
          vy: Math.sin(a) * fx.speed,
          t: fx.dur,
          dmg,
          tags: ab.tags,
          hit: false,
          stun: fx.stun,
          chain: fx.chain || 0,
          fx,
          ab,
        };
      },
    });
  },
  HealAllies(c, fx) {
    for (const e of state.ents)
      if (
        e.team === c.team &&
        e !== c &&
        e.hp > 0 &&
        e.hpMax &&
        dist(e, c) < fx.radius
      )
        e.hp = Math.min(e.hpMax, e.hp + e.hpMax * fx.pct);
    state.fx.push({ x: c.x, y: c.y, r: fx.radius, t: 0.25 });
  },
  Buff(c, fx) {
    addBuff(c.owner || c, fx);
  },
  Cero(c, fx, ab) {
    // uyarı çizgisi -> delip geçen büyük ışın. Güçlenince (c.pw) çoğalır
    const t = nearest(c);
    if (!t) return;
    const a = Math.atan2(t.y - c.y, t.x - c.x),
      dmg = power(c, fx, ab),
      n = fx.n || 1 + Math.min(2, Math.floor(((c.pw || 1) - 1) / 0.7));
    c.lock = fx.windup;
    for (let i = 0; i < n; i++) {
      const aa = a + (i - (n - 1) / 2) * (fx.fan || 0.35);
      addTele({
        kind: 'line',
        x1: c.x,
        y1: c.y,
        x2: c.x + Math.cos(aa) * 1400,
        y2: c.y + Math.sin(aa) * 1400,
        w: 26,
        t: fx.windup,
        team: c.team,
        follow: c,
        onEnd: () => {
          state.projs.push({
            x: c.x,
            y: c.y,
            vx: Math.cos(aa) * fx.speed,
            vy: Math.sin(aa) * fx.speed,
            dmg,
            type: ab.dmgType,
            team: c.team,
            src: c,
            tags: ab.tags,
            life: 2.2,
            col: fx.color,
            size: 12,
            pierce: 99,
            hit: new Set(),
          });
          burst(c.x, c.y, fx.color, 14, 260, 0.4);
          shake(0.3);
        },
      });
    }
  },
  Gust(c, fx) {
    // rüzgar patlaması: önce uyarı halkası, sonra iter + hasar
    const team = c.team,
      r = fx.radius;
    addTele({
      kind: 'circle',
      x: c.x,
      y: c.y,
      r,
      t: fx.delay,
      team,
      follow: c,
      onEnd: () => {
        for (const e of foes({ team }))
          if (dist(c, e) < r + e.r) {
            const a = Math.atan2(e.y - c.y, e.x - c.x);
            e.kx = (e.kx || 0) + Math.cos(a) * fx.force;
            e.ky = (e.ky || 0) + Math.sin(a) * fx.force;
            dealDamage(c, e, fx.damage * stat(c, 'damage'), ['Area'], {
              type: 'magic',
            });
          }
        state.fx.push({ x: c.x, y: c.y, r, t: 0.3 });
        burst(c.x, c.y, '#bfe8ff', 24, 360, 0.6);
        shake(0.4);
      },
    });
  },
  Tornado(c, fx) {
    // oyuncuyu kovalayan hortumlar
    for (let i = 0; i < fx.count; i++) {
      const a = rnd(0, 6.28);
      state.zones.push({
        x: c.x + Math.cos(a) * 60,
        y: c.y + Math.sin(a) * 60,
        r: fx.radius,
        t: fx.life,
        team: c.team,
        src: c,
        dps: fx.dps * stat(c, 'damage'),
        col: '#bfe8ff',
        chase: fx.speed,
        pull: fx.pull,
        tick: 0,
        tornado: true,
      });
    }
  },
  Blink(c, fx, ab) {
    // uyarılı ışınlanma: hedefin yakınına gidip alan hasarı verir
    const t = nearest(c);
    if (!t) return;
    const a = rnd(0, 6.28),
      d = rnd(60, 140),
      x = t.x + Math.cos(a) * d,
      y = t.y + Math.sin(a) * d,
      r = fx.radius,
      team = c.team,
      dmg = power(c, fx, ab);
    c.lock = fx.delay;
    addTele({
      kind: 'circle',
      x,
      y,
      r,
      t: fx.delay,
      team,
      follow: c,
      onEnd: () => {
        burst(c.x, c.y, c.col, 14, 200, 0.4);
        c.x = cw(x);
        c.y = ch(y);
        for (const e of foes({ team }))
          if (reach(x, y, e, r))
            dealDamage(c, e, dmg, ab.tags, { type: ab.dmgType, ab: ab.id });
        state.fx.push({ x, y, r, t: 0.3 });
        burst(x, y, c.col, 24, 300, 0.6);
        shake(0.3);
      },
    });
  },
  Slowfield(c, fx) {
    // içindekileri yavaşlatan zaman alanları
    const t = nearest(c);
    if (!t) return;
    for (let i = 0; i < fx.count; i++) {
      const a = rnd(0, 6.28),
        d = i ? rnd(80, 200) : 0;
      state.zones.push({
        x: t.x + Math.cos(a) * d,
        y: t.y + Math.sin(a) * d,
        r: fx.radius,
        t: fx.life,
        team: c.team,
        src: c,
        dps: 0,
        col: '#6f7bff',
        slow: fx.slow,
        tick: 0,
      });
    }
  },
  Fuse(c, fx, ab) {
    // fitil: sabit uyarı alanı, süre dolunca kendini patlatır
    const x = c.x,
      y = c.y,
      r = fx.radius,
      team = c.team,
      dmg = power(c, fx, ab);
    c.lock = fx.delay;
    addTele({
      kind: 'circle',
      x,
      y,
      r,
      t: fx.delay,
      team,
      follow: c,
      onEnd: () => {
        for (const e of foes({ team }))
          if (reach(x, y, e, r))
            dealDamage(c, e, dmg, ab.tags, { type: ab.dmgType });
        state.fx.push({ x, y, r, t: 0.3 });
        burst(x, y, '#ff9a4a', 26, 320, 0.6);
        shake(0.35);
        c.hp = 0;
      },
    });
  },
  Summon(c, fx) {
    for (let i = 0; i < fx.count; i++) {
      const a = rnd(0, 6.28);
      state.spawnAt &&
        state.spawnAt(
          fx.id,
          c.x + Math.cos(a) * fx.radius,
          c.y + Math.sin(a) * fx.radius,
        );
    }
    burst(c.x, c.y, c.col, 16, 200, 0.6);
  },
};

// Etrafında dönen tırpanlar (düşman, boss ve oyuncu kartı için ortak)
function updateOrbits(e, dt) {
  for (const o of e.orbits) {
    const tags = o.tags || ['Orbit'],
      sc = stat(e, 'area', tags),
      dmg =
        (o.dmg + stat(e, o.type === 'magic' ? 'ap' : 'ad')) *
        stat(e, 'damage', tags),
      fs = foes(e);
    o.a = (o.a || 0) + o.speed * dt;
    for (const [f, t] of o.hit)
      t - dt <= 0 ? o.hit.delete(f) : o.hit.set(f, t - dt);
    for (let i = 0; i < o.n; i++) {
      const a = o.a + (i * 6.283) / o.n,
        x = e.x + Math.cos(a) * o.r * sc,
        y = e.y + Math.sin(a) * o.r * sc;
      o.pos[i] = { x, y, a };
      for (const f of fs)
        if (!o.hit.has(f) && reach(x, y, f, o.size)) {
          o.hit.set(f, 0.45);
          dealDamage(e, f, dmg, tags, {
            type: o.type || 'phys',
            dir: a + 1.57,
            ab: o.ab || 'orbit',
          });
        }
    }
  }
}
function tryDodge(e, dt) {
  // dodge: yaklaşan mermiden yana sıçrar
  if ((e.dodgeCd = (e.dodgeCd || 0) - dt) > 0) return;
  for (const pr of state.projs)
    if (pr.team !== e.team && Math.hypot(pr.x - e.x, pr.y - e.y) < e.r + 80) {
      const a =
        Math.atan2(pr.vy, pr.vx) + (Math.random() < 0.5 ? 1 : -1) * 1.57;
      e.kx = (e.kx || 0) + Math.cos(a) * 700;
      e.ky = (e.ky || 0) + Math.sin(a) * 700;
      e.dodgeCd = 2.2;
      burst(e.x, e.y, e.col, 8, 120, 0.3);
      return;
    }
}
function enemyAI(e, p, dt) {
  if (e.exposed > 0) {
    e.exposed -= dt;
    return;
  } // bitkin boss: kıpırdamaz
  const d = dist(e, p) || 1;
  if (e.dashV) {
    const v = e.dashV;
    e.x = cw(e.x + v.vx * dt);
    e.y = ch(e.y + v.vy * dt);
    v.t -= dt;
    if (!v.hit && d < e.r + 12) {
      v.hit = true;
      dealDamage(e, p, v.dmg, v.tags, { type: 'phys' });
      if (v.stun) p.stun = Math.max(p.stun || 0, v.stun);
    }
    if (v.t <= 0) {
      e.dashV = null;
      if (v.chain > 0)
        EFFECTS.Dash(e, { ...v.fx, windup: 0.3, chain: v.chain - 1 }, v.ab);
    }
    return;
  }
  if (!(e.lock > 0)) {
    const want = Math.atan2(p.y - e.y, p.x - e.x),
      da = ((want - e.face + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
      tr = e.turn * dt;
    e.face += Math.max(-tr, Math.min(tr, da));
    if (!e.keep || d > e.keep) {
      const s = stat(e, 'speed') * (e.slow ? 1 - e.slow.v : 1) * dt;
      e.x += Math.cos(e.face) * s;
      e.y += Math.sin(e.face) * s;
    }
  }
  if (d < e.r + 10 && !(p.invuln > 0)) {
    p.hp -=
      (12 * (e.contact || 1) * stat(e, 'damage') * dt * 100) /
      (100 + stat(p, 'armor'));
    state.hitsTaken++;
    p.hurt = 0.12;
    state.flash = Math.max(state.flash, 0.3);
    shake(0.12);
    sfx('hurt');
  }
}

// Yer bölgeleri: Itsugo'nun yanan izi, hortumlar
function updateZones(dt) {
  for (const z of state.zones) {
    z.t -= dt;
    if (z.chase) {
      const tg = nearest({ team: z.team, x: z.x, y: z.y });
      if (tg) {
        const d = dist(z, tg) || 1;
        z.x += ((tg.x - z.x) / d) * z.chase * dt;
        z.y += ((tg.y - z.y) / d) * z.chase * dt;
      }
    }
    if (z.pull)
      for (const f of foes({ team: z.team })) {
        const d = dist(z, f);
        if (d < z.r * 3 && d > 5) {
          f.x += ((z.x - f.x) / d) * z.pull * dt;
          f.y += ((z.y - f.y) / d) * z.pull * dt;
        }
      }
    if (z.slow)
      for (const f of foes({ team: z.team }))
        if (dist(z, f) < z.r + f.r) f.slow = { v: z.slow, t: 0.4 };
    if ((z.tick -= dt) <= 0) {
      z.tick = 0.35;
      if (z.dps)
        for (const f of foes({ team: z.team }))
          if (dist(z, f) < z.r + f.r)
            dealDamage(z.src, f, z.dps * 0.35, ['Status', 'Zone'], {
              type: 'magic',
            });
    }
  }
  state.zones = state.zones.filter((z) => z.t > 0);
}
function deathBlast(e) {
  // ölünce patlar: önce uyarı halkası
  const b = e.deathBlast,
    x = e.x,
    y = e.y,
    dmg = b.damage * stat(e, 'damage');
  addTele({
    kind: 'circle',
    x,
    y,
    r: b.radius,
    t: 0.7,
    team: 'e',
    onEnd: () => {
      for (const f of foes({ team: 'e' }))
        if (reach(x, y, f, b.radius))
          dealDamage(e, f, dmg, ['Area'], { type: 'phys' });
      state.fx.push({ x, y, r: b.radius, t: 0.3 });
      burst(x, y, '#ff7a3a', 24, 300, 0.6);
      shake(0.3);
    },
  });
}
export function updateCombat(dt) {
  state.fc = {
    enemies: state.ents.filter((e) => e.team === 'e' && e.hp > 0 && !e.under),
    friends: state.ents.filter((e) => e.team === 'p' && e.hp > 0 && !e.isPet),
  };
  const p = state.player;
  for (const e of state.ents) {
    e.hurt = Math.max(0, (e.hurt || 0) - dt);
    e.barT = Math.max(0, (e.barT || 0) - dt);
    if (e.slow && (e.slow.t -= dt) <= 0) e.slow = null;
    if (e.shred && (e.shred.t -= dt) <= 0) e.shred = null;
    if (e.lock > 0) e.lock -= dt;
    if (e.poison) {
      const z = e.poison;
      z.acc += z.dps * dt;
      z.tick -= dt;
      z.t -= dt;
      if (z.tick <= 0 || z.t <= 0) {
        if (z.acc > 0)
          dealDamage(z.src, e, z.acc, ['Status', 'Poison'], {
            trueDmg: true,
            type: 'poison',
            ab: z.ab,
          });
        z.acc = 0;
        z.tick = 0.5;
      }
      if (z.t <= 0) e.poison = null;
    }
    if (e.kx || e.ky) {
      e.x = cw(e.x + e.kx * dt);
      e.y = ch(e.y + e.ky * dt);
      const f = Math.exp(-9 * dt);
      e.kx *= f;
      e.ky *= f;
      if (Math.hypot(e.kx, e.ky) < 5) e.kx = e.ky = 0;
    }
    if (e.buffs.length) updateBuffs(e, dt);
    if (e.stun > 0) {
      e.stun -= dt;
      if (e.team === 'e') continue;
    }
    if (e.dormant) {
      if (dist(e, p) < 420 || e.hp < e.hpMax) e.dormant = false;
      else continue;
    } // elit kampı: oyuncu yaklaşana kadar uyur
    const S = e.script && SCRIPTS[e.script];
    if (e.dodge) tryDodge(e, dt);
    if (e.team === 'e') {
      if (S && S.custom) S.update(e, p, dt);
      else enemyAI(e, p, dt);
      if (S && S.tick) S.tick(e, p, dt);
    }
    if (!(e.lock > 0) && !e.under && !(e.stun > 0) && !(e.exposed > 0))
      for (const ab of e.abilities) {
        e.cd[ab.id] = Math.max(-dt, (e.cd[ab.id] || 0) - dt);
        const t = nearest(e);
        if (
          e.cd[ab.id] <= 0 &&
          t &&
          dist(e, t) < (ab.range || 340) * stat(e, 'area', ab.tags)
        ) {
          for (const fx of ab.effects) EFFECTS[fx.type](e, fx, ab);
          const as = ab.tags.includes('Weapon')
            ? stat(e, 'attackSpeed', ab.tags)
            : 1;
          const cdv = Math.max(
            ab.tags.includes('Weapon') ? BAL.minCd.weapon : BAL.minCd.skill,
            (ab.cooldown * 100) /
              (100 + stat(e, 'haste', ab.tags)) /
              Math.min(3, as),
          );
          e.cd[ab.id] += cdv;
          e.cdMax[ab.id] = cdv;
          if (ab.suicide) e.hp = 0;
          if (e.lock > 0) break;
        }
      }
    if (e.orbits.length) updateOrbits(e, dt);
  }
  // Mermi çarpışması: düşmanlar 64px'lik ızgaraya konur, mermi sadece komşu hücrelere bakar (300 mermi x 250 düşman taraması yerine)
  let grid = null,
    bigs = null;
  const tryHit = (pr, e) => {
    if (e.hp <= 0 || pr.hit.has(e)) return false;
    if (!reach(pr.x, pr.y, e, pr.size || 4)) {
      if (
        e.segs &&
        e.segs.some(
          (g) =>
            (pr.x - g.x) ** 2 + (pr.y - g.y) ** 2 < (g.r + (pr.size || 4)) ** 2,
        )
      ) {
        // zırhlı gövde mermiyi emer, hasar yok
        burst(pr.x, pr.y, '#d8d0b8', 3, 120, 0.25);
        pr.hit.add(e);
        if (pr.pierce-- <= 0) {
          pr.life = 0;
          return true;
        }
      }
      return false;
    }
    dealDamage(pr.src, e, pr.dmg, pr.tags, {
      dir: Math.atan2(pr.vy, pr.vx),
      type: pr.type,
      proc: pr.proc,
      ab: pr.ab,
    });
    pr.hit.add(e);
    if (pr.pierce-- <= 0) {
      pr.life = 0;
      return true;
    }
    return false;
  };
  for (const pr of state.projs) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    if (Math.random() < 0.12) burst(pr.x, pr.y, pr.col || '#fff', 1, 10, 0.25);
    if (pr.team !== 'p') {
      for (const e of foes({ team: pr.team })) if (tryHit(pr, e)) break;
      continue;
    }
    if (!grid) {
      grid = new Map();
      bigs = [];
      for (const e of state.fc.enemies) {
        if (e.segs || e.r > 24) bigs.push(e);
        else {
          const k = ((e.x / 64) | 0) * 4096 + ((e.y / 64) | 0);
          let L = grid.get(k);
          if (!L) grid.set(k, (L = []));
          L.push(e);
        }
      }
    }
    const cx = (pr.x / 64) | 0,
      cy = (pr.y / 64) | 0;
    let done = false;
    for (let ix = cx - 1; ix <= cx + 1 && !done; ix++)
      for (let iy = cy - 1; iy <= cy + 1 && !done; iy++) {
        const L = grid.get(ix * 4096 + iy);
        if (L)
          for (const e of L)
            if (tryHit(pr, e)) {
              done = true;
              break;
            }
      }
    if (!done) for (const e of bigs) if (tryHit(pr, e)) break;
  }
  for (const e of state.ents)
    if (e.hp <= 0 && e !== p) {
      state.deaths.push({ x: e.x, y: e.y, r: e.r, col: e.col, t: 0.4 });
      burst(e.x, e.y, e.col, e.boss ? 40 : 8, e.boss ? 320 : 160, 0.6);
      sfx('kill');
      if (e.boss) shake(0.8);
      if (e.deathBlast) deathBlast(e);
      else if (state.mut.explode && e.team === 'e' && !e.boss) {
        e.deathBlast = { radius: 70, damage: 18 };
        deathBlast(e);
      }
    }
  state.projs = state.projs.filter((x) => x.life > 0);
  state.ents = state.ents.filter((e) => e === p || e.hp > 0);
  state.fx = state.fx.filter((f) => (f.t -= dt) > 0);
  state.deaths = state.deaths.filter((d) => (d.t -= dt) > 0);
  state.lines = state.lines.filter((l) => (l.t -= dt) > 0);
  for (const x of state.texts) {
    x.t -= dt;
    x.y += x.vy * dt;
  }
  state.texts = state.texts.filter((x) => x.t > 0);
  state.flash = Math.max(0, state.flash - dt * 2.5);
  p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'regen') * dt);
  updateZones(dt);
  updateTele(dt);
  updateFx(dt);
  state.fc = null;
  if (p.hp <= 0) state.over = true;
}
