import { state, toast, rnd, W, H } from '../core/state.js';
import { sfx } from '../core/audio.js';
import { rollItem } from './rewards.js';
import { spawnPoi } from './pois.js';
import { burst, ring } from './fx.js';
// TUR HEDEFLERİ (boss turları hariç): başarırsan ödül, kaçırırsan ceza yok. + RİSK PORTALI denemesi (20 sn hayatta kal)
const cl = (v, a, b) => Math.min(b, Math.max(a, v));
export function startObjective(n) {
  state.obj = null;
  if (n % 5 === 0 || n < 2) return;
  const p = state.player,
    type = ['time', 'nohit', 'zone', 'hunt'][Math.floor(Math.random() * 4)],
    o = { type, done: false, failed: false, t: 0 };
  if (type === 'time') o.limit = Math.round(40 + n * 1.5);
  if (type === 'nohit') o.hits0 = state.hitsTaken;
  if (type === 'zone') {
    let x = p.x,
      y = p.y;
    for (let i = 0; i < 20; i++) {
      const a = rnd(0, 6.28),
        r = rnd(350, 800);
      x = p.x + Math.cos(a) * r;
      y = p.y + Math.sin(a) * r;
      if (x > 250 && x < W - 250 && y > 250 && y < H - 250) break;
    }
    o.x = cl(x, 250, W - 250);
    o.y = cl(y, 250, H - 250);
    o.r = 190;
    o.need = 15;
  }
  if (type === 'hunt') {
    const e = state.spawnAt(
      n < 8 ? 'swordsman' : 'knight',
      cl(p.x + rnd(-700, 700), 100, W - 100),
      cl(p.y + rnd(-700, 700), 100, H - 100),
      true,
    );
    e.objTarget = true;
    e.name = 'Hedef: ' + e.name;
    o.target = e;
  }
  state.obj = o;
}
export function objectiveText() {
  const tr = state.trial;
  if (tr) return 'RİSK PORTALI: ' + Math.ceil(tr.t) + ' sn hayatta kal!';
  const o = state.obj;
  if (!o) return '';
  return (
    (o.done ? '✓ ' : o.failed ? '✗ ' : '') +
    {
      time:
        'Hedef: ' +
        o.limit +
        ' sn içinde bitir (' +
        Math.max(0, Math.ceil(o.limit - o.t)) +
        ')',
      nohit: 'Hedef: hiç hasar almadan bitir',
      zone:
        'Hedef: işaretli bölgede kal (' +
        Math.floor(o.t) +
        '/' +
        o.need +
        ' sn)',
      hunt: 'Hedef: işaretli elit düşmanı öldür',
    }[o.type]
  );
}
function reward(o, x, y) {
  o.done = true;
  sfx('level');
  ring(x, y, 100, '#5cc8ff');
  const n = state.wave.n,
    coins = (c) => {
      for (let i = 0; i < 8; i++)
        state.pickups.push({
          type: 'coin',
          v: Math.max(1, Math.round(c / 8)),
          x: x + rnd(-40, 40),
          y: y + rnd(-40, 40),
        });
    };
  if (o.type === 'time') {
    coins(30 + n * 4);
    toast('Hedef tamam! Bonus coin');
  }
  if (o.type === 'nohit') {
    state.rerolls++;
    coins(20 + n * 3);
    toast('Hasarsız tur! +1 kart yenileme');
  }
  if (o.type === 'zone') {
    state.pickups.push({ type: 'item', def: rollItem(3, 1), x, y });
    toast('Bölge savunuldu! Ödül item');
  }
  if (o.type === 'hunt') {
    const c = spawnPoi('chest', { x, y });
    c.good = true;
    c.cost = 0;
    c.mimic = false;
    toast('Hedef avlandı! Ödül sandığı');
  }
}
export function updateObjective(dt) {
  const o = state.obj,
    p = state.player;
  if (o && !o.done && !o.failed && state.wave.phase === 'active') {
    if (o.type === 'time') {
      o.t += dt;
      if (o.t > o.limit) {
        o.failed = true;
        toast('Süre doldu');
      }
    } else if (o.type === 'nohit') {
      if (state.hitsTaken > o.hits0) {
        o.failed = true;
        toast('Hedef başarısız: hasar aldın');
      }
    } else if (o.type === 'zone') {
      if (Math.hypot(p.x - o.x, p.y - o.y) < o.r) o.t += dt;
      if (o.t >= o.need) reward(o, o.x, o.y);
    } else if (o.type === 'hunt' && o.target.hp <= 0)
      reward(o, o.target.x, o.target.y);
  }
  const tr = state.trial;
  if (tr) {
    tr.t -= dt;
    tr.spawnT -= dt;
    if (tr.spawnT <= 0) {
      tr.spawnT = 2.2;
      const c = 6 + Math.floor(state.wave.n / 3);
      for (let i = 0; i < c; i++) {
        const a = (i * 6.283) / c;
        state.spawnAt(
          'swarmer',
          cl(p.x + Math.cos(a) * 520, 30, W - 30),
          cl(p.y + Math.sin(a) * 520, 30, H - 30),
        );
      }
    }
    if (tr.t <= 0) {
      state.trial = null;
      state.pickups.push({ type: 'item', def: rollItem(5, 2), x: p.x, y: p.y });
      for (let i = 0; i < 10; i++)
        state.pickups.push({
          type: 'coin',
          v: 4 + state.wave.n,
          x: p.x + rnd(-50, 50),
          y: p.y + rnd(-50, 50),
        });
      toast('Portal denemesi tamam! Ödül düştü');
      ring(p.x, p.y, 160, '#5b6cff');
      burst(p.x, p.y, '#5b6cff', 30, 320, 0.8);
    }
  }
}
export function endObjective() {
  // tur sonu: zaman/dokunulmaz hedefleri burada ödüllenir, diğerleri kaçırılmış sayılır
  const o = state.obj;
  if (!o || o.done || o.failed) return;
  if (o.type === 'time' || o.type === 'nohit')
    reward(o, state.player.x, state.player.y);
  else {
    o.failed = true;
    toast('Hedef kaçırıldı');
  }
}
export function startTrial() {
  state.trial = { t: 20, spawnT: 0 };
  toast('RİSK PORTALI: 20 sn hayatta kal!');
}
