import { state, dist } from '../core/state.js';
import { stat } from '../core/stats.js';
import { emit } from '../core/events.js';
import { foes, nearest } from '../core/entity.js';

// Tüm hasar buradan geçer: kritik -> zırh delme -> zırh azaltması
export function dealDamage(src, t, amt, tags = []) {
  if (t.hp <= 0) return;
  const crit = Math.random() < Math.min(1, stat(src, 'critChance', tags));
  if (crit) amt *= stat(src, 'critDmg', tags);
  const armor = Math.max(
    0,
    stat(t, 'armor') * (1 - Math.min(0.9, stat(src, 'armorPen', tags))),
  );
  amt *= 100 / (100 + armor);
  t.hp -= amt;
  emit('DamageDealt', { source: src, target: t, amount: amt, tags, crit });
  if (t.hp <= 0 && !t.dead) {
    t.dead = true;
    emit('Kill', { source: src, target: t });
  }
}

// Effect blokları (skill = bu blokların dizisi)
const EFFECTS = {
  Projectile(c, fx, ab) {
    const t = nearest(c);
    if (!t) return;
    const n = fx.count || 1,
      base = Math.atan2(t.y - c.y, t.x - c.x);
    for (let i = 0; i < n; i++) {
      const a = fx.radial
        ? base + (i * 6.283) / n
        : base + (n > 1 ? (i / (n - 1) - 0.5) * (fx.spread || 0.6) : 0);
      state.projs.push({
        x: c.x,
        y: c.y,
        vx: Math.cos(a) * fx.speed,
        vy: Math.sin(a) * fx.speed,
        dmg: fx.damage * stat(c, 'damage', ab.tags),
        team: c.team,
        src: c,
        tags: ab.tags,
        life: 2.5,
        col: fx.color,
      });
    }
  },
  Nova(c, fx, ab) {
    for (const e of foes(c))
      if (dist(c, e) < fx.radius)
        dealDamage(c, e, fx.damage * stat(c, 'damage', ab.tags), ab.tags);
    state.fx.push({ x: c.x, y: c.y, r: fx.radius, t: 0.25 });
  },
  Heal(c, fx) {
    c.hp = Math.min(stat(c, 'maxHp'), c.hp + fx.amount);
  },
};

export function updateCombat(dt) {
  const p = state.player;
  for (const e of state.ents) {
    if (e.team === 'e') {
      // düşman AI
      const d = dist(e, p) || 1;
      if (!e.keep || d > e.keep) {
        const s = stat(e, 'speed') * dt;
        e.x += ((p.x - e.x) / d) * s;
        e.y += ((p.y - e.y) / d) * s;
      }
      if (d < e.r + 10)
        p.hp -= (12 * stat(e, 'damage') * dt * 100) / (100 + stat(p, 'armor'));
    }
    for (const ab of e.abilities) {
      // skill döngüsü herkes için aynı
      e.cd[ab.id] = (e.cd[ab.id] || 0) - dt;
      const t = nearest(e);
      if (e.cd[ab.id] <= 0 && t && dist(e, t) < (ab.range || 340)) {
        for (const fx of ab.effects) EFFECTS[fx.type](e, fx, ab);
        e.cd[ab.id] = ab.cooldown * Math.max(0.3, stat(e, 'cdr'));
      }
    }
  }
  for (const pr of state.projs) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    for (const e of foes({ team: pr.team }))
      if (dist(pr, e) < e.r + 4) {
        dealDamage(pr.src, e, pr.dmg, pr.tags);
        pr.life = 0;
        break;
      }
  }
  state.projs = state.projs.filter((x) => x.life > 0);
  state.ents = state.ents.filter((e) => e === p || e.hp > 0);
  state.fx = state.fx.filter((f) => (f.t -= dt) > 0);
  p.hp = Math.min(p.hp, stat(p, 'maxHp'));
  if (p.hp <= 0) state.over = true;
}
