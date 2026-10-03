import { state } from '../core/state.js';
import { on } from '../core/events.js';
import { meta, save, hooks } from '../core/save.js';
import { sfx } from '../core/audio.js';
import { WEAPONS } from '../data/weapons.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { burst, shake } from './fx.js';

on('DamageDealt', (d) => {
  if (d.source === state.player) meta.stats.damage += d.amount;
});
on('Kill', ({ target: t, tags = [] }) => {
  if (t.team !== 'e') return;
  const s = meta.stats;
  s.kills++;
  state.streak++;
  state.streakT = 3; // streak: kill'ler arası max 3 sn
  if (state.streak > s.bestStreak) s.bestStreak = state.streak;
  const w = state.weapon;
  if (w && state.streak > (meta.weaponStreak[w] || 0))
    meta.weaponStreak[w] = state.streak;
  for (const tag of tags) {
    const id = tag.toLowerCase();
    if (WEAPONS[id]) meta.weaponKills[id] = (meta.weaponKills[id] || 0) + 1;
  }
  for (const c of state.picked)
    meta.cardKills[c] = (meta.cardKills[c] || 0) + 1;
  if (state.kills + 1 > s.mostKills) s.mostKills = state.kills + 1;
  if (t.boss) bossDown(t);
  save();
});

function bossDown(t) {
  const no = state.wave.n / 5;
  meta.stats.bossKills[t.name] = (meta.stats.bossKills[t.name] || 0) + 1;
  if (!meta.bossesDefeated.includes(t.name)) {
    meta.bossesDefeated.push(t.name);
    hooks.popup('Boss Point +1', t.name + ' ilk kez yenildi', '#e0b040');
  }
  if (no > meta.bestBoss) meta.bestBoss = no;
  for (const [id, w] of Object.entries(WEAPONS))
    if (
      w.unlock &&
      !meta.unlockedWeapons.includes(id) &&
      meta.bestBoss >= w.unlock.boss
    ) {
      meta.unlockedWeapons.push(id);
      hooks.popup('Yeni silah açıldı: ' + w.name, w.unlock.text, '#4aa3ff');
    }
  if (no % 2 === 0) state.pendingClass = true; // her 2 bossta bir class seçimi
  burst(t.x, t.y, t.col, 50, 380, 0.9);
  shake(0.8);
  save(true);
}
export function onWaveStart(n, boss) {
  const s = meta.stats;
  if (n > s.bestWave) s.bestWave = n;
  if (boss) s.bossReached = Math.max(s.bossReached, n / 5);
  sfx(boss ? 'boss' : 'wave');
  save();
}
export function finishRun() {
  meta.stats.deaths++;
  save(true);
}
let acc = 0;
export function updateTracking(dt) {
  meta.stats.time += dt;
  if ((state.streakT -= dt) <= 0) state.streak = 0;
  if ((acc += dt) >= 1) {
    acc = 0;
    for (const a of ACHIEVEMENTS)
      if (!meta.ach[a.id] && a.test(meta, state)) {
        meta.ach[a.id] = Date.now();
        hooks.popup('Başarım: ' + a.name, a.desc, '#e0b040');
        save(true);
      }
  }
}
