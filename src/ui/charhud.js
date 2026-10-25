import { state } from '../core/state.js';
import { passiveInfo } from '../systems/characters.js';
import { CHARS } from '../data/characters.js';
import { setTip } from './tooltip.js';
// Karakter pasif çubuğu (sol üst): Öfke / Nişan / Gölge / Arkana / Ruh sayacı
let el, bar, txt, nm;
export function updateCharHud() {
  if (state.mode !== 'run') {
    if (el) el.style.display = 'none';
    return;
  }
  const inf = passiveInfo();
  if (!inf) return;
  if (!el) {
    el = document.createElement('div');
    el.id = 'cpass';
    el.innerHTML =
      '<div class="cn"></div><div class="bar"><i></i><span></span></div>';
    document.getElementById('chips').after(el);
    nm = el.firstChild;
    bar = el.querySelector('i');
    txt = el.querySelector('span');
    el.onmouseenter = () =>
      setTip(() => {
        const c = CHARS[state.charId];
        return (
          '<b>' +
          c.icon +
          ' ' +
          c.name +
          ' — ' +
          c.passive.name +
          '</b><div class="dim">' +
          c.passive.text +
          '</div>'
        );
      });
    el.onmouseleave = () => setTip(null);
  }
  el.style.display = 'block';
  const c = CHARS[state.charId];
  nm.textContent = c.icon + ' ' + inf.name;
  bar.style.width = Math.max(0, Math.min(1, inf.frac)) * 100 + '%';
  bar.style.background = inf.col;
  txt.textContent = inf.text;
  el.classList.toggle('on', !!inf.on);
}
