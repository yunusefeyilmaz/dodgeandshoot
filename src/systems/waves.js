import { state, W, H, rnd, toast } from '../core/state.js';
import { make } from '../core/entity.js';
import { stat } from '../core/stats.js';
import { ENEMIES, BOSSES } from '../data/enemies.js';
import { ABILITIES } from '../data/abilities.js';

export const isBossWave = n => n % 10 === 0;
// Tur 10..100 -> boss 1..10, sonra aynı bosslar her döngüde %75 daha güçlü
export function bossFor(n) { const i = n / 10 - 1; return { def: BOSSES[i % 10], power: 1 + Math.floor(i / 10) * .75 }; }

function spawn(def, hpScale, power = 1) {
  const n = state.wave.n, a = rnd(0, 6.28);
  const e = make({ team: 'e', x: W / 2 + Math.cos(a) * 520, y: H / 2 + Math.sin(a) * 520,
    r: def.r, col: def.col, xp: def.xp, coin: Math.ceil(def.coin * (1 + n * .1) * power),
    base: { speed: def.speed, armor: def.armor * (1 + n * .02) * power, damage: (1 + n * .05) * power } });
  e.hpMax = e.hp = def.hp * hpScale * power; e.keep = def.keep; e.boss = def.boss; e.name = def.name;
  def.abilities.forEach(id => e.abilities.push(ABILITIES[id]));
  state.ents.push(e);
}

export function startWave() {
  const w = state.wave; if (w.phase !== 'idle' || state.over) return;
  w.n++; w.phase = 'active'; w.timer = 0;
  w.bossPending = isBossWave(w.n);
  w.toSpawn = w.bossPending ? 5 : 6 + w.n * 2;
  toast(w.bossPending ? 'BOSS: ' + bossFor(w.n).def.name : 'Tur ' + w.n);
}

export function updateWaves(dt) {
  const w = state.wave;
  if (w.phase === 'active') {
    w.timer -= dt;
    if (w.bossPending) { const b = bossFor(w.n); spawn(b.def, 1 + w.n * .02, b.power); w.bossPending = false; }
    else if (w.toSpawn > 0 && w.timer <= 0) {
      const r = Math.random(), t = w.n >= 5 && r < .15 ? 'tank' : w.n >= 2 && r < .4 ? 'spitter' : 'grunt';
      spawn(ENEMIES[t], 1 + w.n * .12); w.toSpawn--; w.timer = Math.max(.25, .9 - w.n * .01);
    }
    if (!w.bossPending && w.toSpawn <= 0 && state.ents.length === 1) { // tur bitti
      w.phase = 'idle'; w.cd = 3; state.coins += 5 + w.n * 2;
      const p = state.player; p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'maxHp') * .25);
      toast('Tur ' + w.n + ' bitti! Bonus coin');
    }
  } else if (w.auto && !state.over && (w.cd -= dt) <= 0) startWave();
}
