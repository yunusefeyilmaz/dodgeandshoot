import { state } from '../core/state.js';
const ov = document.getElementById('ov'),
  box = document.getElementById('choices');
let kind = null;
export const overlayKind = () => kind;
export function showOverlay(title, nodes, k = 'modal') {
  document.getElementById('ovt').textContent = title;
  box.replaceChildren(...nodes);
  ov.style.display = 'flex';
  state.paused = true;
  kind = k;
}
export function hideOverlay() {
  ov.style.display = 'none';
  state.paused = false;
  kind = null;
}
export const btn = (html, onclick, disabled, col) => {
  const b = document.createElement('button');
  b.innerHTML = html;
  b.onclick = onclick;
  b.disabled = !!disabled;
  if (col) b.style.borderColor = col;
  return b;
};
