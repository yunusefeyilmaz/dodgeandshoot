import { meta } from './save.js';
// Dosyasız, WebAudio ile üretilen kısa ses efektleri. M tuşu ile kapatılır.
let ctx;
const last = {};
const ac = () => {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};
addEventListener('pointerdown', ac);
addEventListener('keydown', ac);
function tone(f, d, type = 'square', vol = 0.1, slide = 0, delay = 0) {
  const c = ac();
  if (!c || meta.settings.mute) return;
  const t = c.currentTime + delay,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slide)
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(vol * meta.settings.vol * 2, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + d + 0.02);
}
const S = {
  hit: () => tone(220, 0.06, 'square', 0.05, -80),
  crit: () => {
    tone(520, 0.09, 'sawtooth', 0.09, -250);
    tone(780, 0.07, 'square', 0.05, 0, 0.03);
  },
  kill: () => tone(160, 0.12, 'triangle', 0.1, -100),
  coin: () => tone(880, 0.07, 'sine', 0.07, 300),
  item: () => {
    tone(660, 0.1, 'triangle', 0.1);
    tone(990, 0.14, 'triangle', 0.1, 0, 0.08);
  },
  hurt: () => tone(110, 0.15, 'sawtooth', 0.1, -50),
  level: () =>
    [440, 550, 660, 880].forEach((f, i) =>
      tone(f, 0.15, 'triangle', 0.1, 0, i * 0.07),
    ),
  wave: () => tone(330, 0.2, 'square', 0.07, 120),
  boss: () => {
    tone(80, 0.5, 'sawtooth', 0.14, -30);
    tone(60, 0.6, 'square', 0.08);
  },
  click: () => tone(600, 0.04, 'square', 0.05),
  ach: () =>
    [660, 880, 1100].forEach((f, i) =>
      tone(f, 0.12, 'sine', 0.09, 0, i * 0.08),
    ),
};
const GAP = { hit: 60, kill: 40, coin: 50, hurt: 150, crit: 60 };
export function sfx(n) {
  const t = performance.now();
  if (t - (last[n] || 0) < (GAP[n] || 0)) return;
  last[n] = t;
  S[n] && S[n]();
}
export const toggleMute = () => {
  meta.settings.mute = !meta.settings.mute;
};
