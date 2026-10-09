import { meta } from '../core/save.js';
import { EN } from './en.js';
// DİL: tüm metinler Türkçe yazılır; İngilizce seçilince sözlükle (en.js) çevrilir. DOM değişimleri otomatik çevrilir (MutationObserver), tuval yazıları T() ile.
const keys = Object.keys(EN).sort((a, b) => b.length - a.length),
  L = '\\p{L}';
const RX = new RegExp(
  '(?<!' +
    L +
    ')(?:' +
    keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') +
    ')(?!' +
    L +
    ')',
  'gu',
);
export const getLang = () => meta.settings.lang || 'tr';
export const T = (s) =>
  getLang() === 'en' && typeof s === 'string' ? s.replace(RX, (m) => EN[m]) : s;
const rec = new WeakMap(); // metin düğümü -> {src: özgün Türkçe, out: çevrilmiş}
function fix(node) {
  const s = node.nodeValue,
    r = rec.get(node);
  if (r && s === r.out) return;
  const out = getLang() === 'en' ? s.replace(RX, (m) => EN[m]) : s;
  rec.set(node, { src: s, out });
  if (out !== s) node.nodeValue = out;
}
function walk(root, fn) {
  if (!document.createTreeWalker) return;
  const w = document.createTreeWalker(root, 4);
  let n;
  while ((n = w.nextNode())) fn(n);
}
export function applyLang() {
  // dil değişince tüm sayfayı yeniden çevir / geri al
  if (typeof document === 'undefined' || !document.body) return;
  walk(document.body, (n) => {
    const r = rec.get(n);
    if (getLang() === 'tr') {
      if (r && n.nodeValue === r.out) n.nodeValue = r.src;
    } else fix(n);
  });
  document.title = getLang() === 'en' ? 'Dodge and Shoot' : 'Dodge and Shoot';
}
if (
  typeof MutationObserver !== 'undefined' &&
  typeof document !== 'undefined' &&
  document.body
) {
  new MutationObserver((list) => {
    if (getLang() !== 'en') return;
    for (const m of list) {
      if (m.type === 'characterData') fix(m.target);
      for (const a of m.addedNodes)
        a.nodeType === 3 ? fix(a) : a.nodeType === 1 && walk(a, fix);
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  applyLang();
}
