import { state, toast } from '../core/state.js';
import { stat } from '../core/stats.js';
import { make, addPart } from '../core/entity.js';
import { on } from '../core/events.js';
import { meta, save } from '../core/save.js';
import { CHARS, xpFor, MAX_CHAR_LEVEL } from '../data/characters.js';
import { ABILITIES } from '../data/abilities.js';
import { burst } from './fx.js';
import { dealDamage } from './combat.js';
import { inputDir } from './player.js';
// ——— kalıcı ilerleme: Ruh (açma parası), karakter XP/seviyesi, Ruh Puanı ağacı ———
export const charMeta = (id) =>
  ((meta.chars ??= {})[id] ??= { xp: 0, lvl: 1, tree: {} });
export const isCharUnlocked = (id) =>
  !!CHARS[id] &&
  (CHARS[id].cost === 0 || (meta.unlockedChars ??= ['warrior']).includes(id));
export function unlockChar(id) {
  const c = CHARS[id];
  if (isCharUnlocked(id) || (meta.souls || 0) < c.cost) return false;
  meta.souls -= c.cost;
  meta.unlockedChars.push(id);
  save(true);
  return true;
}
export const charSpent = (id) =>
  CHARS[id].tree.reduce(
    (s, n) => s + (charMeta(id).tree[n.id] ? n.cost : 0),
    0,
  );
export const charPoints = (id) => charMeta(id).lvl - 1 - charSpent(id);
export const charOwned = (id, nid) => !!charMeta(id).tree[nid];
export function buyCharNode(id, n) {
  if (
    charOwned(id, n.id) ||
    charPoints(id) < n.cost ||
    (n.parent && !charOwned(id, n.parent))
  )
    return false;
  charMeta(id).tree[n.id] = 1;
  save(true);
  return true;
}
export function resetCharTree(id) {
  charMeta(id).tree = {};
  save(true);
}
export const charTreeMods = (id) =>
  CHARS[id].tree
    .filter((n) => charOwned(id, n.id))
    .flatMap((n) => n.mods.map((x) => ({ ...x })));
export function addCharXp(id, xp) {
  const cm = charMeta(id);
  let up = 0;
  cm.xp += xp;
  while (cm.lvl < MAX_CHAR_LEVEL && cm.xp >= xpFor(cm.lvl)) {
    cm.xp -= xpFor(cm.lvl);
    cm.lvl++;
    up++;
  }
  if (cm.lvl >= MAX_CHAR_LEVEL) cm.xp = 0;
  return up;
}
// Koşu sonu ödülü: Ruh = öldürme/4 + tur*6 + boss*30 (+ zafer bonusu). Aynı koşuda iki kez çağrılırsa sadece farkı verir.
export function runSouls() {
  const mp = state.map || { diff: 1 };
  return Math.floor(
    (state.kills / 4 +
      state.wave.n * 6 +
      (state.bossKillsRun || 0) * 30 +
      (state.won ? 400 * mp.diff : 0)) *
      (1 + 0.1 * (state.heat || 0)) *
      mp.diff,
  );
}
export function settleRun() {
  const total = runSouls(),
    gain = Math.max(0, total - (state.paid || 0));
  state.paid = total;
  if (!gain) return { souls: 0, xp: 0, up: 0 };
  meta.souls = (meta.souls || 0) + gain;
  meta.stats.souls = (meta.stats.souls || 0) + gain;
  const up = addCharXp(state.charId || 'warrior', gain);
  save(true);
  return { souls: gain, xp: gain, up };
}
// ——— koşu içi pasifler ———
const g = (s, op, fn) => ({
  stat: s,
  op,
  get value() {
    return fn();
  },
});
export function applyChar(p, id) {
  const c = CHARS[id];
  state.charId = id;
  const cp = (state.cp = {
    rage: 0,
    rageT: 0,
    still: 0,
    shadowT: 0,
    casts: 0,
    souls: 0,
    soldiers: [],
    lastHp: p.hp,
  });
  addPart(p, { mods: c.mods.map((x) => ({ ...x })) });
  addPart(p, { mods: charTreeMods(id) });
  if (id === 'warrior')
    addPart(p, {
      mods: [
        g('attackSpeed', 'mul', () => (cp.rageT > 0 ? 1.35 : 1)),
        g('damage', 'mul', () => (cp.rageT > 0 ? 1.25 : 1)),
        g('omnivamp', 'add', () => (cp.rageT > 0 ? 0.08 : 0)),
      ],
    });
  if (id === 'archer')
    addPart(p, {
      mods: [
        g('attackSpeed', 'mul', () =>
          cp.still >= 0.5 ? 1 + 0.35 * stat(p, 'stillBonus') : 1,
        ),
        g('critChance', 'add', () =>
          cp.still >= 0.5 ? 0.15 * stat(p, 'stillBonus') : 0,
        ),
      ],
    });
}
export function passiveInfo() {
  // HUD çubuğu için
  const id = state.charId,
    cp = state.cp,
    p = state.player;
  if (!cp || !CHARS[id]) return null;
  const c = CHARS[id];
  if (id === 'warrior')
    return {
      name: c.passive.name,
      frac: cp.rageT > 0 ? cp.rageT / stat(p, 'rageDur') : cp.rage / 100,
      text: cp.rageT > 0 ? 'ÖFKE!' : Math.floor(cp.rage) + '%',
      col: cp.rageT > 0 ? '#ff5a3a' : '#c0602a',
      on: cp.rageT > 0,
    };
  if (id === 'archer')
    return {
      name: c.passive.name,
      frac: Math.min(1, cp.still / 0.5),
      text: cp.still >= 0.5 ? 'NİŞAN ALINDI' : 'hareketsiz kal',
      col: '#7fc96a',
      on: cp.still >= 0.5,
    };
  if (id === 'assassin')
    return {
      name: c.passive.name,
      frac: cp.shadowT / 2.5,
      text: cp.shadowT > 0 ? 'GÖLGE HAZIR' : 'dash at',
      col: '#a06aff',
      on: cp.shadowT > 0,
    };
  if (id === 'mage') {
    const n = Math.max(3, Math.round(stat(p, 'arcanaEvery')));
    return {
      name: c.passive.name,
      frac: (cp.casts % n) / n,
      text: (cp.casts % n) + '/' + n,
      col: '#6aa8ff',
      on: false,
    };
  }
  const n = Math.max(2, Math.round(stat(p, 'soulEvery')));
  return {
    name: c.passive.name,
    frac: (cp.souls % n) / n,
    text: (cp.souls % n) + '/' + n + ' · 💀' + cp.soldiers.length,
    col: '#8a5aff',
    on: false,
  };
}
function summon() {
  const p = state.player,
    cp = state.cp,
    max = Math.round(stat(p, 'soldierMax'));
  while (cp.soldiers.length >= max) {
    const old = cp.soldiers.shift();
    state.ents = state.ents.filter((x) => x !== old);
  }
  const q = (s, f) => ({
    stat: s,
    op: 'add',
    get value() {
      return stat(p, s) * f;
    },
  });
  const s = make({
    team: 'p',
    isPet: true,
    soldier: true,
    owner: p,
    x: p.x + (Math.random() - 0.5) * 60,
    y: p.y + (Math.random() - 0.5) * 60,
    r: 9,
    hp: 1e9,
    col: '#cfd8e8',
    icon: '💀',
    base: { damage: 1, speed: 150 },
  });
  addPart(s, {
    mods: [
      q('ad', 0.55),
      q('ap', 0.55),
      q('critChance', 0.5),
      {
        stat: 'damage',
        op: 'mul',
        get value() {
          return 1 + (stat(p, 'damage') - 1) * 0.6;
        },
      },
    ],
  });
  s.abilities.push(ABILITIES.sword);
  s.cd.sword = 0.3;
  s.life = stat(p, 'soldierLife');
  cp.soldiers.push(s);
  state.ents.push(s);
  burst(s.x, s.y, '#8a5aff', 14, 200, 0.5);
}
on('DamageDealt', (d) => {
  const cp = state.cp,
    p = state.player;
  if (!cp || state.charId !== 'warrior') return;
  if (d.source === p && d.target !== p && cp.rageT <= 0)
    cp.rage = Math.min(100, cp.rage + 1.6 * stat(p, 'rageGain'));
});
on('Kill', (d) => {
  const cp = state.cp,
    p = state.player;
  if (!cp || state.charId !== 'necro' || d.source !== p) return;
  if (++cp.souls % Math.max(2, Math.round(stat(p, 'soulEvery'))) === 0)
    summon();
});
export function charCast(e) {
  // combat.js'ten: oyuncu her skill kullandığında
  const cp = state.cp;
  if (!cp || state.charId !== 'mage' || e !== state.player) return;
  if (++cp.casts % Math.max(3, Math.round(stat(e, 'arcanaEvery'))) === 0) {
    const d = 18 + stat(e, 'ap') * 1.3,
      r = 120 * stat(e, 'area');
    for (const t of state.fc ? state.fc.enemies : [])
      if (Math.hypot(t.x - e.x, t.y - e.y) < r)
        dealDamage(e, t, d, ['Status', 'Area'], { type: 'magic' });
    state.fx.push({ x: e.x, y: e.y, r, t: 0.25, s: 'dark' });
    burst(e.x, e.y, '#6aa8ff', 16, 280, 0.5);
  }
}
export function charDash() {
  const cp = state.cp;
  if (cp && state.charId === 'assassin') cp.shadowT = 2.5;
}
export function updateCharacter(dt) {
  const cp = state.cp,
    p = state.player;
  if (!cp) return;
  const L = cp.soldiers.length
    ? state.ents.filter(
        (e) => e.team === 'e' && e.hp > 0 && !e.under && !e.dormant,
      )
    : [];
  if (state.charId === 'warrior') {
    if (p.hp < cp.lastHp)
      cp.rage = Math.min(
        100,
        cp.rage +
          ((cp.lastHp - p.hp) / stat(p, 'maxHp')) *
            100 *
            1.2 *
            stat(p, 'rageGain'),
      );
    if (cp.rageT > 0) {
      cp.rageT -= dt;
      if (cp.rageT <= 0) cp.rage = 0;
    } else if (cp.rage >= 100) {
      cp.rageT = stat(p, 'rageDur');
      toast('ÖFKE!');
      state.bannerQ.push({ text: 'ÖFKE!', sub: '', kind: 'wave' });
    } else cp.rage = Math.max(0, cp.rage - 2 * dt);
  }
  cp.lastHp = p.hp;
  if (state.charId === 'archer')
    cp.still = p.dashV || inputDir().some((v) => v) ? 0 : cp.still + dt;
  if (cp.shadowT > 0) cp.shadowT -= dt;
  if (cp.soldiers.length) {
    for (const s of cp.soldiers.slice()) {
      if ((s.life -= dt) <= 0) {
        burst(s.x, s.y, '#8a5aff', 10, 160, 0.4);
        state.ents = state.ents.filter((x) => x !== s);
        cp.soldiers = cp.soldiers.filter((x) => x !== s);
        continue;
      }
      let t = null,
        bd = 520 * 520;
      for (const e of L) {
        const d = (e.x - s.x) ** 2 + (e.y - s.y) ** 2;
        if (d < bd) {
          bd = d;
          t = e;
        }
      }
      const tx = t ? t.x : p.x,
        ty = t ? t.y : p.y,
        d = Math.hypot(tx - s.x, ty - s.y) || 1;
      if (d > (t ? 26 : 70)) {
        s.x += ((tx - s.x) / d) * 150 * dt;
        s.y += ((ty - s.y) / d) * 150 * dt;
      }
    }
  }
}
