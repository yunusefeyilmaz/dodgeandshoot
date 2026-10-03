import { hooks } from '../core/save.js';
import { sfx } from '../core/audio.js';
const box = document.getElementById('pop');
// Sağ altta küçük popup
hooks.popup = (title, sub, col = '#4aa3ff') => {
  const d = document.createElement('div');
  d.className = 'popup';
  d.style.borderLeftColor = col;
  d.innerHTML =
    '<b>' +
    title +
    '</b><div style="color:#9aa3b5;font-size:12px">' +
    (sub || '') +
    '</div>';
  box.appendChild(d);
  sfx('ach');
  setTimeout(() => d.classList.add('out'), 3800);
  setTimeout(() => d.remove(), 4400);
};
