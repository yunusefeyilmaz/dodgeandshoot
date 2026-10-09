import { RARITIES } from '../core/rarity.js';
import { LABELS, fmtMod } from '../core/labels.js';
const tip = document.getElementById('tip');
let fn = null,
  mx = 0,
  my = 0;
function place() {
  tip.style.left =
    Math.max(4, Math.min(mx + 14, innerWidth - tip.offsetWidth - 8)) + 'px';
  tip.style.top =
    Math.max(4, Math.min(my + 14, innerHeight - tip.offsetHeight - 8)) + 'px';
}
addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (fn) place();
});
export const tipOn = (el, f) => {
  el.onmouseenter = () => setTip(f);
  el.onmouseleave = () => setTip(null);
};
export function setTip(f) {
  fn = f;
  refreshTip();
}
export function refreshTip() {
  if (!fn) {
    tip.style.display = 'none';
    return;
  }
  tip.innerHTML = fn();
  tip.style.display = 'block';
  place();
}

// Dinamik (getter'lı) modifier'lar "şu an" etiketiyle gösterilir: öldürmeye bağlı kazanç anlık görünür
export const partLines = (part) =>
  (part.mods || [])
    .map((m) => {
      const dyn = !!Object.getOwnPropertyDescriptor(m, 'value')?.get;
      return (
        '<div>' +
        fmtMod(m) +
        ' ' +
        LABELS[m.stat] +
        (m.tag ? ' (' + m.tag + ')' : '') +
        (dyn ? ' <small style="color:#e0b040">(şu an)</small>' : '') +
        '</div>'
      );
    })
    .join('');
export function itemTip(inst) {
  const r = RARITIES[inst.def.rarity];
  return (
    '<b style="color:' +
    r.col +
    '">' +
    inst.def.name +
    '</b> <small>' +
    r.name +
    '</small>' +
    partLines(inst.part) +
    (inst.def.desc ? '<div class="dim">' + inst.def.desc + '</div>' : '') +
    (inst.def.tracks
      ? '<div>Aldıktan sonraki öldürme: <b>' + inst.kills + '</b></div>'
      : '') +
    '<div class="dim">Satış: ' +
    r.sell +
    ' altın</div>'
  );
}
