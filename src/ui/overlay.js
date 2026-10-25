import { state } from '../core/state.js';
const ov = document.getElementById('ov'),
  box = document.getElementById('choices');
let kind = null;
export const overlayKind = () => kind;
export function showOverlay(title, nodes, k = 'modal', sub = '') {
  document.getElementById('ovt').innerHTML = title;
  const s = document.getElementById('ovs');
  s.innerHTML = sub;
  s.style.display = sub ? 'block' : 'none';
  box.replaceChildren(...nodes);
  ov.style.display = 'flex';
  document.body.classList.add('ovopen');
  ov.dataset.kind = k;
  state.paused = true;
  kind = k;
}
export function hideOverlay() {
  ov.style.display = 'none';
  document.body.classList.remove('ovopen');
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
export function confirmBox(title, yes) {
  showOverlay(
    title,
    [
      btn('Evet', () => {
        hideOverlay();
        yes();
      }),
      btn('Hayır', hideOverlay),
    ],
    'confirm',
  );
}
