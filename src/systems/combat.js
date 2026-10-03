import { state, W, H, dist, rnd } from '../core/state.js';
import { stat } from '../core/stats.js';
import { emit } from '../core/events.js';
import { foes, nearest } from '../core/entity.js';
import { burst, shake, updateFx } from './fx.js';
import { sfx } from '../core/audio.js';

export const DMG_COL = {
  phys: '#ffffff',
  magic: '#6fb4ff',
  poison: '#6be04a',
  void: '#c05bff',
  true: '#ffd84f',
};

// Tüm hasar buradan geçer: backstab -> kritik -> savunma (void aşındırması dahil) -> knockback -> on-hit efektleri.
// tags'te 'Status' varsa (zehir tiki, zincir, void) kritik ve yeni efekt tetiklenmez (sonsuz döngü olmaz).
// o: {dir, type: 'phys'|'magic'|'poison'|'void', trueDmg}
export function dealDamage(src, t, amt, tags = [], o = {}) {
  if (t.hp <= 0) return 0;
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
  t.hp -= amt;
  t.hurt = 0.12;
  t.barT = 2.5;
  const kind = o.type || (o.trueDmg ? 'true' : 'phys');
  if (t.team === 'e') {
    if (state.texts.length > 90) state.texts.shift();
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
    state.flash = Math.min(1, state.flash + 0.5);
    shake(0.3);
    sfx('hurt');
    burst(t.x, t.y, '#ff3b3b', 6, 130, 0.4);
  }
  const vamp =
    stat(src, 'omnivamp') +
    (tags.includes('Weapon') ? stat(src, 'lifesteal') : 0);
  if (vamp > 0) src.hp = Math.min(stat(src, 'maxHp'), src.hp + amt * vamp);
  if (o.dir !== undefined && !status) {
    // knockback: güçlü düşmanlar (kbResist) zor itilir
    const kb =
      stat(src, 'knockback', tags) * (1 - Math.min(0.95, stat(t, 'kbResist')));
    if (kb > 0) {
      t.kx = (t.kx || 0) + Math.cos(o.dir) * kb;
      t.ky = (t.ky || 0) + Math.sin(o.dir) * kb;
    }
  }
  emit('DamageDealt', {
    source: src,
    target: t,
    amount: amt,
    tags,
    crit,
    type: kind,
  });
  if (!status && !tags.includes('Combo') && t.hp > 0)
    applyStatus(src, t, amt, tags);
  if (t.hp <= 0 && !t.dead) {
    t.dead = true;
    emit('Kill', { source: src, target: t, tags });
  }
  return amt;
}

// On-hit efektleri: hepsi stat ile gelir (kart/item/silah upgrade'i, tag ile sadece belirli silaha da verilebilir)
function applyStatus(src, t, amt, tags) {
  const ps = stat(src, 'poison', tags); // ZEHİR: 3 sn boyunca hasarın %ps'si kadar DoT
  if (ps > 0) {
    const o = t.poison;
    t.poison = {
      dps: Math.max((amt * ps) / 3, o ? o.dps : 0),
      t: 3,
      src,
      tick: o ? o.tick : 0.5,
      acc: o ? o.acc : 0,
    };
  }
  const ch = stat(src, 'chain', tags); // BÜYÜ: yakındaki 2 düşmana zincir şimşek
  if (ch > 0)
    for (const e of state.ents
      .filter(
        (e) => e.team === t.team && e !== t && e.hp > 0 && dist(e, t) < 170,
      )
      .sort((a, b) => dist(a, t) - dist(b, t))
      .slice(0, 2)) {
      state.lines.push({ x1: t.x, y1: t.y, x2: e.x, y2: e.y, t: 0.18 });
      dealDamage(src, e, amt * ch, ['Status'], { type: 'magic' });
    }
  const sl = stat(src, 'slow', tags); // NORMAL (ağır darbe): yavaşlatma
  if (sl > 0) t.slow = { v: Math.min(0.7, sl), t: 1.5 };
  const vs = stat(src, 'voidShred', tags); // VOID: zırh/MR aşındırır + saf void hasarı
  if (vs > 0) {
    t.shred = { v: Math.min(0.6, vs), t: 4 };
    dealDamage(src, t, amt * vs * 0.5, ['Status'], {
      trueDmg: true,
      type: 'void',
    });
  }
}

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
    e.hurt = Math.max(0, (e.hurt || 0) - dt);
    e.barT = Math.max(0, (e.barT || 0) - dt);
    if (e.slow && (e.slow.t -= dt) <= 0) e.slow = null;
    if (e.shred && (e.shred.t -= dt) <= 0) e.shred = null;
    if (e.poison) {
      // zehir 0.5 sn'de bir tik atar (yeşil sayı)
      const z = e.poison;
      z.acc += z.dps * dt;
      z.tick -= dt;
      z.t -= dt;
      if (z.tick <= 0 || z.t <= 0) {
        if (z.acc > 0)
          dealDamage(z.src, e, z.acc, ['Status', 'Poison'], {
            trueDmg: true,
            type: 'poison',
          });
        z.acc = 0;
        z.tick = 0.5;
      }
      if (z.t <= 0) e.poison = null;
    }
    if (e.kx || e.ky) {
      // knockback hızı üstel olarak sönümlenir
      e.x = Math.min(W, Math.max(0, e.x + e.kx * dt));
      e.y = Math.min(H, Math.max(0, e.y + e.ky * dt));
      const f = Math.exp(-9 * dt);
      e.kx *= f;
      e.ky *= f;
      if (Math.hypot(e.kx, e.ky) < 5) e.kx = e.ky = 0;
    }
    if (e.team === 'e') {
      const d = dist(e, p) || 1,
        want = Math.atan2(p.y - e.y, p.x - e.x);
      const da = ((want - e.face + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
        tr = e.turn * dt;
      e.face += Math.max(-tr, Math.min(tr, da));
      if (!e.keep || d > e.keep) {
        const s = stat(e, 'speed') * (e.slow ? 1 - e.slow.v : 1) * dt;
        e.x += Math.cos(e.face) * s;
        e.y += Math.sin(e.face) * s;
      }
      if (d < e.r + 10) {
        p.hp -= (12 * stat(e, 'damage') * dt * 100) / (100 + stat(p, 'armor'));
        p.hurt = 0.12;
        state.flash = Math.max(state.flash, 0.3);
        shake(0.12);
        sfx('hurt');
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
    if (Math.random() < 0.35) burst(pr.x, pr.y, pr.col || '#fff', 1, 10, 0.25);
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
  for (const e of state.ents)
    if (e.hp <= 0 && e !== p) {
      state.deaths.push({ x: e.x, y: e.y, r: e.r, col: e.col, t: 0.4 });
      burst(e.x, e.y, e.col, e.boss ? 40 : 8, e.boss ? 320 : 160, 0.6);
      sfx('kill');
      if (e.boss) shake(0.8);
    } // ezilme efekti
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
  updateFx(dt);
  if (p.hp <= 0) state.over = true;
}
