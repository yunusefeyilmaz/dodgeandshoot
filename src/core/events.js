import { state } from './state.js';
const listeners = {};
// Global dinleyici: sistemler birbirini çağırmadan olaylara abone olur (drop, xp vs.)
export const on = (evt, fn) => (listeners[evt] ??= []).push(fn);
export function emit(evt, data) {
  for (const f of listeners[evt] || []) f(data);
  // Part trigger'ları: kart/item, olayın kaynağı kendi sahibiyse çalışır
  for (const e of state.ents)
    for (const p of e.parts)
      for (const t of p.triggers || [])
        if (t.on === evt && data.source === e) t.run(e, data);
}
