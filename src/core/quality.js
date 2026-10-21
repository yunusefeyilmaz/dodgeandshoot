import { state } from './state.js';
import { meta } from './save.js';
// Grafik kalitesi yöneticisi. Otomatik modda render aralığını ölçer: ~47 fps altına inerse çözünürlüğü ve efekt yoğunluğunu düşürür,
// rahatlayınca (ve en az 8 sn sonra) kademeli geri yükseltir. Yükseltme hemen geri düşerse tavanı indirir (salınımı önler).
const PRESETS = {
  high: { s: 1, fx: 1 },
  medium: { s: 0.75, fx: 0.6 },
  low: { s: 0.55, fx: 0.3 },
};
export const quality = {
  scale: 1,
  ceil: 1,
  ema: 16.7,
  n: 0,
  last: 0,
  lastUp: -1e9,
  fps: 60,
};
const fxFor = (s) => (s >= 0.95 ? 1 : s >= 0.7 ? 0.6 : 0.3);
export function sampleQuality(now, interval, setScale) {
  const mode = meta.settings.gfx || 'auto';
  if (mode !== 'auto') {
    const p = PRESETS[mode] || PRESETS.high;
    if (quality.scale !== p.s) {
      quality.scale = p.s;
      setScale(p.s);
    }
    state.fxQ = p.fx;
    quality.n = 0;
    quality.ema = 16.7;
    return;
  }
  quality.ema += (interval - quality.ema) * 0.08;
  quality.fps = 1000 / quality.ema;
  if (++quality.n < 90) return;
  if (quality.ema > 21 && quality.scale > 0.5 && now - quality.last > 1500) {
    if (now - quality.lastUp < 12000)
      quality.ceil = Math.max(0.5, quality.scale - 0.05);
    quality.scale = Math.max(0.5, +(quality.scale - 0.15).toFixed(2));
    quality.last = now;
    quality.ema = 16.7;
    quality.n = 0;
    setScale(quality.scale);
  } else if (
    quality.ema < 18 &&
    quality.scale < quality.ceil &&
    now - quality.last > 8000
  ) {
    quality.scale = Math.min(quality.ceil, +(quality.scale + 0.1).toFixed(2));
    quality.last = now;
    quality.lastUp = now;
    quality.n = 0;
    setScale(quality.scale);
  }
  state.fxQ = fxFor(quality.scale);
}
