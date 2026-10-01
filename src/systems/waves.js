import { state, W, H, rnd, toast } from '../core/state.js';
import { make } from '../core/entity.js';
import { stat } from '../core/stats.js';
import { ENEMIES, BOSSES } from '../data/enemies.js';
import { ABILITIES } from '../data/abilities.js';

export const BOSS_EVERY = 5,
  SWARM_EVERY = 3;
export const isBossWave = (n) => n % BOSS_EVERY === 0;
export const isSwarmWave = (n) => n % SWARM_EVERY === 0;
// Tur 5,10,... -> boss 1..10, sonra aynı bosslar her döngüde %75 daha güçlü
export function bossFor(n) {
  const i = n / BOSS_EVERY - 1;
  return { def: BOSSES[i % 10], power: 1 + Math.floor(i / 10) * 0.75 };
}

// Oyuncunun hemen ekran dışı. ang verilirse (swarm) o yönde, yoksa rastgele; boss daha uzakta.
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

function spawn(def, hpScale, power = 1, ang) {
  const n = state.wave.n,
    sp = spawnPos(def.boss, ang);
  const e = make({
    team: 'e',
    x: sp.x,
    y: sp.y,
    r: def.r,
    col: def.col,
    xp: def.xp,
    coin: Math.ceil(def.coin * (1 + n * 0.1) * power),
    base: {
      speed: def.speed,
      armor: def.armor * (1 + n * 0.02) * power,
      damage: (1 + n * 0.05) * power,
      kbResist: def.kbResist || 0,
    },
  });
  e.hpMax = e.hp = def.hp * hpScale * power;
  e.keep = def.keep;
  e.boss = def.boss;
  e.name = def.name;
  e.face = Math.atan2(state.player.y - sp.y, state.player.x - sp.x);
  e.turn = def.boss ? 1.6 : 3;
  def.abilities.forEach((id) => e.abilities.push(ABILITIES[id]));
  state.ents.push(e);
}

export function startWave() {
  const w = state.wave;
  if (w.phase !== 'idle' || state.over) return;
  w.n++;
  w.phase = 'active';
  w.timer = 0;
  w.bossPending = isBossWave(w.n);
  w.swarmPending = isSwarmWave(w.n);
  w.toSpawn = w.bossPending ? 5 : 6 + w.n * 2;
  toast(
    (w.bossPending ? 'BOSS: ' + bossFor(w.n).def.name : 'Tur ' + w.n) +
      (w.swarmPending ? ' · SWARM! Her yönden geliyorlar' : ''),
  );
}

export function updateWaves(dt) {
  const w = state.wave;
  if (w.phase === 'active') {
    w.timer -= dt;
    if (w.bossPending) {
      const b = bossFor(w.n);
      spawn(b.def, 1 + w.n * 0.02, b.power);
      w.bossPending = false;
    }
    if (w.swarmPending) {
      // 10-17 düşman AYNI ANDA, oyuncunun etrafında çember şeklinde
      const c = 10 + Math.min(5, Math.floor(w.n / 6)) + Math.floor(rnd(0, 3));
      for (let i = 0; i < c; i++)
        spawn(
          ENEMIES.swarmer,
          1 + w.n * 0.1,
          1,
          (i * 6.283) / c + rnd(-0.1, 0.1),
        );
      w.swarmPending = false;
    }
    if (w.toSpawn > 0 && w.timer <= 0) {
      const r = Math.random(),
        t =
          w.n >= 5 && r < 0.15
            ? 'tank'
            : w.n >= 2 && r < 0.4
              ? 'spitter'
              : 'grunt';
      spawn(ENEMIES[t], 1 + w.n * 0.12);
      w.toSpawn--;
      w.timer = Math.max(0.25, 0.9 - w.n * 0.01);
    }
    if (
      !w.bossPending &&
      !w.swarmPending &&
      w.toSpawn <= 0 &&
      state.ents.length === 1
    ) {
      w.phase = 'idle';
      w.cd = 3;
      state.coins += 5 + w.n * 2;
      const p = state.player;
      p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'maxHp') * 0.25);
      toast('Tur ' + w.n + ' bitti! Bonus coin');
    }
  } else if (w.auto && !state.over && (w.cd -= dt) <= 0) startWave();
}
