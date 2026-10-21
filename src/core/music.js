import { state } from './state.js';
import { meta } from './save.js';
import { peekAc } from './audio.js';
// Dosyasız, WebAudio ile üretilen prosedürel müzik. Mod: menü / harita (orman, çöl, boşluk) / boss. Kaydırmalı zamanlayıcı yok:
// notalar ses saatine göre ileriye planlanır (update() her karede çağrılır).
const MODES = {
  menu: {
    root: 55,
    bpm: 66,
    scale: [0, 3, 5, 7, 10],
    bass: [0, 0, 5, 3],
    pad: [
      [0, 7, 12],
      [3, 10, 15],
      [5, 12, 17],
      [3, 10, 15],
    ],
    mel: 0.3,
    wave: 'triangle',
    drums: 0,
  },
  forest: {
    root: 49,
    bpm: 78,
    scale: [0, 3, 5, 7, 10],
    bass: [0, 5, 3, 7],
    pad: [
      [0, 7, 15],
      [5, 12, 19],
      [3, 10, 15],
      [7, 14, 19],
    ],
    mel: 0.42,
    wave: 'triangle',
    drums: 0,
  },
  desert: {
    root: 55,
    bpm: 92,
    scale: [0, 1, 4, 5, 7, 8, 10],
    bass: [0, 0, 1, 0],
    pad: [
      [0, 7, 12],
      [1, 8, 13],
      [0, 7, 12],
      [5, 12, 17],
    ],
    mel: 0.5,
    wave: 'sawtooth',
    drums: 1,
  },
  void: {
    root: 46,
    bpm: 62,
    scale: [0, 1, 3, 6, 7, 10],
    bass: [0, 1, 0, 6],
    pad: [
      [0, 6, 12],
      [1, 7, 13],
      [0, 6, 12],
      [6, 12, 18],
    ],
    mel: 0.28,
    wave: 'sine',
    drums: 0,
  },
  boss: {
    root: 41,
    bpm: 132,
    scale: [0, 3, 5, 6, 7, 10],
    bass: [0, 0, 3, 5],
    pad: [
      [0, 7, 12],
      [3, 10, 15],
      [5, 12, 17],
      [6, 13, 18],
    ],
    mel: 0.55,
    wave: 'sawtooth',
    drums: 2,
  },
};
let ctx,
  master,
  noise,
  mode = null,
  next = 0,
  step = 0,
  deg = 2,
  chk = 0,
  want = 'menu';
const hz = (root, semi) => root * Math.pow(2, semi / 12);
function setup(c) {
  master = c.createGain();
  master.gain.value = 0;
  master.connect(c.destination);
  const b = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate),
    d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noise = b;
}
function note(f, t, dur, type, vol, atk = 0.01) {
  const o = ctx.createOscillator(),
    g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function kick(t, v) {
  const o = ctx.createOscillator(),
    g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.2);
}
function hat(t, v, len = 0.05) {
  const s = ctx.createBufferSource(),
    g = ctx.createGain(),
    f = ctx.createBiquadFilter();
  s.buffer = noise;
  f.type = 'highpass';
  f.frequency.value = 6000;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(t);
  s.stop(t + len + 0.02);
}
function schedule(M, t) {
  const beat = 60 / M.bpm,
    s = step % 16,
    bar = (step >> 4) % 4;
  if (s % 2 === 0) {
    note(
      hz(M.root, M.bass[(bar + (s >> 3)) % 4]),
      t,
      beat * 0.9,
      'triangle',
      0.11,
    );
  } // bas: her vuruşta
  if (s === 0)
    for (const c of M.pad[bar])
      note(hz(M.root * 2, c), t, beat * 7.5, 'sine', 0.035, 1.4); // pad: her 2 ölçüde akor
  if (Math.random() < M.mel) {
    deg = Math.max(
      0,
      Math.min(
        M.scale.length * 2 - 1,
        deg + [-2, -1, 0, 1, 2][(Math.random() * 5) | 0],
      ),
    );
    const o =
      deg >= M.scale.length
        ? 24 + M.scale[deg - M.scale.length]
        : 12 + M.scale[deg];
    note(
      hz(M.root * 2, o),
      t,
      beat * (Math.random() < 0.3 ? 1.2 : 0.5),
      M.wave,
      M.drums === 2 ? 0.05 : 0.035,
      0.02,
    );
  }
  if (M.drums >= 1) {
    if (s % 4 === 0) kick(t, M.drums === 2 ? 0.22 : 0.12);
    if (s % 2 === 1) hat(t, M.drums === 2 ? 0.05 : 0.03);
    if (M.drums === 2 && s % 8 === 4) hat(t, 0.09, 0.12);
  }
}
export function updateMusic() {
  if (!ctx) {
    ctx = peekAc();
    if (!ctx) return;
    setup(ctx);
  }
  if (ctx.state !== 'running') return; // kullanıcı etkileşimi öncesi sessiz bekle (her karede resume() çağrısı yok)
  const on = !meta.settings.mute && meta.settings.music !== false,
    target = on ? (meta.settings.mvol ?? 0.5) * 0.55 : 0;
  master.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
  if (!on) return;
  if ((chk -= 1) <= 0) {
    chk = 20;
    want =
      state.mode !== 'run'
        ? 'menu'
        : state.ents.some((e) => e.boss && e.hp > 0 && !e.decoy && !e.crystal)
          ? 'boss'
          : state.map
            ? state.map.id
            : 'forest';
  }
  if (want !== mode) {
    mode = want;
    step = 0;
    next = ctx.currentTime + 0.12;
    deg = 2;
  }
  const M = MODES[mode];
  if (!M) return;
  const dur = 60 / M.bpm / 2;
  while (next < ctx.currentTime + 0.4) {
    schedule(M, next);
    next += dur;
    step++;
  }
}
export const musicMode = () => mode;
