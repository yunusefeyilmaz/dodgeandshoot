import { state } from '../core/state.js';
const ov = document.getElementById('ov'),
  box = document.getElementById('choices');
export function showOverlay(title, nodes) {
  document.getElementById('ovt').textContent = title;
  box.replaceChildren(...nodes);
  ov.style.display = 'flex';
  state.paused = true;
}
export function hideOverlay() {
  ov.style.display = 'none';
  state.paused = false;
}
export const btn = (html, onclick, disabled) => {
  const b = document.createElement('button');
  b.innerHTML = html;
  b.onclick = onclick;
  b.disabled = !!disabled;
  return b;
};
