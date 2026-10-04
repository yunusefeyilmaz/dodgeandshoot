import { state } from '../core/state.js';
// Uyarı alanları: boss/düşman saldırıları önce kırmızı alan/çizgi olarak görünür, süre dolunca onEnd çalışır.
export const addTele = (t) => {
  t.max = t.t;
  state.teles.push(t);
};
export function updateTele(dt) {
  for (const t of state.teles) {
    t.t -= dt;
    if (t.follow && t.follow.hp <= 0) t.cancel = true;
    if (t.t <= 0 && !t.cancel) t.onEnd && t.onEnd();
  }
  state.teles = state.teles.filter((t) => t.t > 0 && !t.cancel);
}
