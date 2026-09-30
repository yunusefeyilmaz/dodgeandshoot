import { state, W, H, rnd, toast } from '../core/state.js';
import { make } from '../core/entity.js';
import { stat } from '../core/stats.js';
import { ENEMIES, BOSSES } from '../data/enemies.js';
import { ABILITIES } from '../data/abilities.js';

export const isBossWave = (n) => n % 5 === 0;
// Tur 5..50 -> boss 1..5, sonra aynı bosslar her döngüde %75 daha güçlü
export function bossFor(n) {
  const i = n / 5 - 1;
  return { def: BOSSES[i % 5], power: 1 + Math.floor(i / 5) * 0.75 };
}
export const isSwarmWave = (n) => n > 5 && n % 3 === 0;

function spawn(def, hpScale, power = 1) {
  const n = state.wave.n,
    a = rnd(0, 6.28);
  const e = make({
    team: 'e',
    x: W / 2 + Math.cos(a) * 520,
    y: H / 2 + Math.sin(a) * 520,
    r: def.r,
    col: def.col,
    xp: def.xp,
    coin: Math.ceil(def.coin * (1 + n * 0.1) * power),
    base: {
      speed: def.speed,
      armor: def.armor * (1 + n * 0.02) * power,
      damage: (1 + n * 0.05) * power,
    },
  });
  e.hpMax = e.hp = def.hp * hpScale * power;
  e.keep = def.keep;
  e.boss = def.boss;
  e.name = def.name;
  e.face = a + Math.PI;
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
  w.toSpawn = w.bossPending
    ? 5
    : isSwarmWave(w.n)
      ? 20 + (w.n * 10 + Math.floor(Math.random() * w.n * 10))
      : 30 + (w.n * 2 + Math.floor(Math.random() * w.n * 2));
  const waveType = w.bossPending
    ? 'BOSS: ' + bossFor(w.n).def.name
    : isSwarmWave(w.n)
      ? 'SWARM: ' + w.n
      : 'Tur ' + w.n;
  toast(waveType);
}

export function updateWaves(dt) {
  const w = state.wave;
  if (w.phase === 'active') {
    w.timer -= dt;
    if (w.bossPending) {
      const b = bossFor(w.n);
      spawn(b.def, 1 + w.n * 0.02, b.power);
      w.bossPending = false;
    } else if (w.toSpawn > 0 && w.timer <= 0) {
      if (isSwarmWave(w.n)) {
        // Swarm: spawn 10 enemies at once
        for (let i = 0; i < 10; i++) {
          const r = Math.random(),
            t =
              w.n >= 5 && r < 0.15
                ? 'tank'
                : w.n >= 2 && r < 0.4
                  ? 'spitter'
                  : 'grunt';
          spawn(ENEMIES[t], 1 + w.n * 0.12);
          w.toSpawn--;
        }
        w.timer = Math.max(0.5, 1.5 - w.n * 0.05);
      } else {
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
    }
    if (!w.bossPending && w.toSpawn <= 0 && state.ents.length === 1) {
      // tur bitti
      w.phase = 'idle';
      w.cd = 3;
      state.coins += 5 + w.n * 2;
      const p = state.player;
      p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'maxHp') * 0.25);
      toast('Tur ' + w.n + ' bitti! Bonus coin');
    }
  } else if (w.auto && !state.over && (w.cd -= dt) <= 0) startWave();
}
