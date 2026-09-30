import { state, dist } from '../core/state.js';
import { stat } from '../core/stats.js';
import { emit } from '../core/events.js';
import { foes, nearest } from '../core/entity.js';

// Tüm hasar buradan geçer: arkadan vuruş -> kritik -> zırh/MR (yüzde delme, sonra sabit delme) -> omnivamp/lifesteal
// o: {dir: vuruş yönü (backstab için), type: 'phys'|'magic', trueDmg: savunmayı yok say}
export function dealDamage(src, t, amt, tags = [], o = {}) {
  if (t.hp <= 0) return 0;
  if (
    o.dir !== undefined &&
    t.face !== undefined &&
    Math.cos(o.dir - t.face) > 0.3
  )
    amt *= stat(src, 'backstab', tags);
  const crit = Math.random() < Math.min(1, stat(src, 'critChance', tags));
  if (crit) amt *= stat(src, 'critDmg', tags);
  if (!o.trueDmg) {
    const m = o.type === 'magic';
    const pct = Math.min(0.9, stat(src, m ? 'magicPen' : 'armorPen', tags)),
      flat = stat(src, m ? 'magicFlat' : 'lethality', tags);
    amt *=
      100 / (100 + Math.max(0, stat(t, m ? 'mr' : 'armor') * (1 - pct) - flat));
  }
  t.hp -= amt;
  const vamp =
    stat(src, 'omnivamp') +
    (tags.includes('Weapon') ? stat(src, 'lifesteal') : 0);
  if (vamp > 0) src.hp = Math.min(stat(src, 'maxHp'), src.hp + amt * vamp);
  emit('DamageDealt', { source: src, target: t, amount: amt, tags, crit });
  if (t === state.player) {
    state.dmgVignette = 0.5;
    state.flashT = 0.3;
  }
  state.fx.push({
    x: t.x,
    y: t.y - t.r - 8,
    text: Math.round(amt),
    color: crit ? '#ff0000' : '#ffff00',
    t: 1.5,
    team: src.team,
  });
  t.flashT = 0.4;
  if (t.hp <= 0 && !t.dead) {
    t.dead = true;
    emit('Kill', { source: src, target: t });
  }
  return amt;
}

// skill hasarı = (taban + AD/AP) * hasar çarpanı
const power = (c, fx, ab) =>
  (fx.damage +
    stat(c, ab.dmgType === 'magic' ? 'ap' : 'ad') * (fx.ratio ?? 1)) *
  stat(c, 'damage', ab.tags);

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
        team: c.team,
        src: c,
        tags: ab.tags,
        life: 2.5,
        col: fx.color,
        pierce: (fx.pierce || 0) + Math.round(stat(c, 'pierce', ab.tags)),
        hit: new Set(),
      });
    }
  },
  Nova(c, fx, ab) {
    const r = fx.radius * stat(c, 'area', ab.tags);
    for (const e of foes(c))
      if (dist(c, e) < r + e.r)
        dealDamage(c, e, power(c, fx, ab), ab.tags, {
          dir: Math.atan2(e.y - c.y, e.x - c.x),
          type: ab.dmgType,
        });
    state.fx.push({ x: c.x, y: c.y, r, t: 0.25 });
  },
  Heal(c, fx) {
    c.hp = Math.min(stat(c, 'maxHp'), c.hp + fx.amount);
  },
};

export function updateCombat(dt) {
  const p = state.player;
  for (const e of state.ents) {
    if (e.team === 'e') {
      // düşman: yavaş dönerek yüzüne baktığı yöne yürür -> arkasına geçilebilir (backstab)
      const d = dist(e, p) || 1,
        want = Math.atan2(p.y - e.y, p.x - e.x);
      const da = ((want - e.face + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
        tr = e.turn * dt;
      e.face += Math.max(-tr, Math.min(tr, da));
      if (!e.keep || d > e.keep) {
        const s = stat(e, 'speed') * dt;
        e.x += Math.cos(e.face) * s;
        e.y += Math.sin(e.face) * s;
      }
      if (d < e.r + 10) {
        p.hp -= (12 * stat(e, 'damage') * dt * 100) / (100 + stat(p, 'armor'));
        if (p === state.player) {
          state.dmgVignette = 0.5;
          state.flashT = 0.3;
        }
      }
    }
    for (const ab of e.abilities) {
      e.cd[ab.id] = (e.cd[ab.id] || 0) - dt;
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
        e.cd[ab.id] = (ab.cooldown * 100) / (100 + stat(e, 'haste')) / as;
      }
    }
  }
  for (const pr of state.projs) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    for (const e of foes({ team: pr.team }))
      if (!pr.hit.has(e) && dist(pr, e) < e.r + 4) {
        dealDamage(pr.src, e, pr.dmg, pr.tags, {
          dir: Math.atan2(pr.vy, pr.vx),
          type: pr.type,
        });
        pr.hit.add(e);
        if (pr.pierce-- <= 0) {
          pr.life = 0;
          break;
        }
      }
  }
  state.projs = state.projs.filter((x) => x.life > 0);
  for (const e of state.ents) {
    if (e.flashT > 0) e.flashT -= dt;
  }
  state.ents = state.ents.filter((e) => e === p || e.hp > 0);
  state.fx = state.fx.filter((f) => (f.t -= dt) > 0);
  p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'regen') * dt);
  if (p.hp <= 0) state.over = true;
}
