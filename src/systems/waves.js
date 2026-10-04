import { state, W, H, rnd, toast } from '../core/state.js';
import { make, addPart } from '../core/entity.js';
import { SCRIPTS } from './bossScripts.js';
import { stat } from '../core/stats.js';
import { ENEMIES, BOSSES, SPAWN_TABLE, MINIBOSSES } from '../data/enemies.js';
import { ABILITIES } from '../data/abilities.js';
import { BAL } from '../data/balance.js';
import { onWaveStart } from './tracking.js';

export const BOSS_EVERY = 5,
  SWARM_EVERY = 3;
export const isBossWave = (n) => n % BOSS_EVERY === 0;
export const isSwarmWave = (n) => n % SWARM_EVERY === 0;
export function bossFor(n) {
  const i = n / BOSS_EVERY - 1;
  return {
    def: BOSSES[i % BOSSES.length],
    power: 1 + Math.floor(i / BOSSES.length) * 0.75,
  };
}

function spawnPos(boss, ang) {
  const p = state.player,
    v = state.view,
    ok = (x, y) => x > 20 && x < W - 20 && y > 20 && y < H - 20;
  const d = boss
    ? Math.max(v.w, v.h) * 0.75 + 200
    : Math.max(v.w, v.h) * 0.5 + 40 + rnd(0, 120);
  let x, y;
  if (ang !== undefined) {
    x = p.x + Math.cos(ang) * d;
    y = p.y + Math.sin(ang) * d;
  } else
    for (let i = 0; i < 12; i++) {
      const a = rnd(0, 6.28);
      x = p.x + Math.cos(a) * d;
      y = p.y + Math.sin(a) * d;
      if (ok(x, y)) break;
    }
  return {
    x: Math.min(W - 20, Math.max(20, x)),
    y: Math.min(H - 20, Math.max(20, y)),
  };
}
const pickType = (n) => {
  const L = SPAWN_TABLE.filter((r) => n >= r[1]);
  let x = Math.random() * L.reduce((s, r) => s + r[2], 0);
  for (const r of L) if ((x -= r[2]) <= 0) return ENEMIES[r[0]];
  return ENEMIES.grunt;
};

function spawn(def, power = 1, ang, at, elite = false, extra) {
  const n = state.wave.n,
    sp = at || spawnPos(def.boss, ang),
    boss = !!def.boss;
  const sc = 1 + n * BAL.enemyDmgPerWave,
    stats = {};
  for (const k in def.stats || {})
    stats[k] = def.stats[k] * (k === 'ad' || k === 'ap' ? sc * power : 1); // düşmanlar da oyuncuyla aynı statlara sahip
  const hp =
    def.hp *
    (boss
      ? BAL.bossHp * (1 + n * BAL.bossHpPerWave)
      : BAL.enemyHp *
        (1 + n * BAL.enemyHpPerWave) *
        (def.mini ? BAL.miniHp : 1)) *
    power *
    (elite ? 3 : 1);
  const e = make({
    team: 'e',
    x: sp.x,
    y: sp.y,
    r: def.r * (elite ? 1.25 : 1),
    col: def.col,
    shape: def.shape,
    xp: def.xp * (elite ? 3 : 1),
    coin: Math.ceil(def.coin * (1 + n * 0.1) * power * (elite ? 3 : 1)),
    base: {
      speed: def.speed * (elite ? 1.1 : 1),
      armor: (def.armor || 0) * (1 + n * 0.03) * power * (elite ? 1.5 : 1),
      mr: (def.armor || 0) * 0.5 * (1 + n * 0.03) * power,
      kbResist: def.kbResist || 0,
      ...stats,
      damage:
        (1 + n * BAL.enemyDmgPerWave) *
        power *
        (boss ? BAL.bossDmg : 1) *
        (elite ? 1.5 : 1),
    },
  });
  e.hpMax = e.hp = hp;
  e.keep = def.keep;
  e.boss = boss;
  e.name = (elite ? 'Elit ' : '') + (def.name || '?');
  e.elite = elite;
  e.contact = def.contact;
  e.res = { ...(def.res || {}) };
  e.mini = !!def.mini;
  e.deathBlast = def.deathBlast;
  e.dr = Math.min(0.8, (def.dr || 0) + (elite ? 0.1 : 0));
  e.dodge = def.dodge;
  e.face = Math.atan2(state.player.y - sp.y, state.player.x - sp.x);
  e.turn = boss ? 1.6 : 3;
  def.abilities.forEach((id) => {
    e.abilities.push(ABILITIES[id]);
    e.cd[id] = rnd(0.5, ABILITIES[id].cooldown);
  });
  (def.orbit || []).forEach((o) =>
    e.orbits.push({
      ...o,
      tags: ['Orbit'],
      pos: [],
      hit: new Map(),
      a: rnd(0, 6),
    }),
  );
  (def.parts || []).forEach((pt) => addPart(e, pt));
  e.script = def.script;
  const S = def.script && SCRIPTS[def.script];
  e.custom = !!(S && S.custom);
  if (boss) e.bossName = def.name; // kayıt adı sabit kalır (Itsugo yeniden doğunca görünen ad değişir)
  if (extra) {
    e.group = extra.group;
    e.groupN = extra.groupN;
    e.bossName = extra.bossName;
  }
  if (S && S.init) S.init(e);
  state.ents.push(e);
}
state.spawnAt = (id, x, y) =>
  spawn(ENEMIES[id], 1, undefined, {
    x: Math.min(W - 20, Math.max(20, x)),
    y: Math.min(H - 20, Math.max(20, y)),
  });

export function startWave() {
  const w = state.wave;
  if (w.phase !== 'idle' || state.over) return;
  w.n++;
  w.phase = 'active';
  w.timer = 0;
  w.bossPending = isBossWave(w.n);
  w.swarmPending = isSwarmWave(w.n);
  w.miniPending =
    !w.bossPending &&
    w.n >= 4 &&
    Math.random() < Math.min(0.6, 0.2 + w.n * 0.015)
      ? w.n >= 25
        ? 2
        : 1
      : 0; // boss olmayan turlarda mini boss
  w.toSpawn = w.bossPending
    ? 10 + w.n * 2
    : BAL.waveBase + w.n * BAL.wavePerWave;
  toast(
    (w.bossPending ? 'BOSS: ' + bossFor(w.n).def.name : 'Tur ' + w.n) +
      (w.swarmPending ? ' · SWARM! Her yönden geliyorlar' : ''),
  );
  onWaveStart(w.n, w.bossPending);
}

export function updateWaves(dt) {
  const w = state.wave;
  if (w.phase === 'active') {
    w.timer -= dt;
    if (w.bossPending) {
      const b = bossFor(w.n),
        g = b.def.group;
      if (g) {
        const base = spawnPos(true);
        g.forEach((d, i) =>
          spawn(
            d,
            b.power,
            undefined,
            { x: base.x + (i - 1) * 60, y: base.y + (i % 2) * 40 },
            false,
            { group: b.def.name, groupN: g.length, bossName: b.def.name },
          ),
        );
      } else spawn(b.def, b.power);
      w.bossPending = false;
    }
    if (w.miniPending) {
      for (let i = 0; i < w.miniPending; i++) {
        const d = MINIBOSSES[Math.floor(Math.random() * MINIBOSSES.length)];
        spawn(d);
        toast('Mini boss: ' + d.name);
      }
      w.miniPending = 0;
    }
    if (w.swarmPending) {
      // aynı anda, oyuncunun çevresinde çember
      const c = Math.min(
        BAL.swarmMax,
        BAL.swarmBase +
          Math.floor(w.n * BAL.swarmPerWave) +
          Math.floor(rnd(0, 8)),
      );
      for (let i = 0; i < c; i++)
        spawn(ENEMIES.swarmer, 1, (i * 6.283) / c + rnd(-0.1, 0.1));
      w.swarmPending = false;
    }
    if (w.toSpawn > 0 && w.timer <= 0) {
      const eliteP = w.n >= 8 ? Math.min(0.25, (w.n - 7) * 0.02) : 0;
      for (
        let i = 0, g = 1 + Math.floor(w.n / BAL.groupEvery);
        i < g && w.toSpawn > 0;
        i++, w.toSpawn--
      )
        spawn(pickType(w.n), 1, undefined, undefined, Math.random() < eliteP);
      w.timer = Math.max(BAL.spawnMin, BAL.spawnBase - w.n * BAL.spawnDecay);
    }
    if (
      !w.bossPending &&
      !w.swarmPending &&
      !w.miniPending &&
      w.toSpawn <= 0 &&
      !state.ents.some((e) => e.team === 'e')
    ) {
      w.phase = 'idle';
      w.cd = 2;
      state.coins += 5 + w.n * 2;
      const p = state.player;
      p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'maxHp') * 0.25);
      toast('Tur ' + w.n + ' bitti! Bonus coin');
    }
  } else if (w.auto && !state.over && (w.cd -= dt) <= 0) startWave();
}
