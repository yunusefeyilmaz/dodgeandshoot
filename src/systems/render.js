import { state, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
import { xpNeed } from './rewards.js';
const g = document.getElementById('c').getContext('2d');
export function render() {
  const p = state.player;
  g.clearRect(0, 0, W, H);
  if (state.showMagnet) {
    g.strokeStyle = '#e0b04033';
    g.beginPath();
    g.arc(p.x, p.y, stat(p, 'magnet'), 0, 7);
    g.stroke();
  }
  for (const f of state.fx) {
    g.strokeStyle = '#9be0ff';
    g.globalAlpha = f.t * 4;
    g.beginPath();
    g.arc(f.x, f.y, f.r, 0, 7);
    g.stroke();
    g.globalAlpha = 1;
  }
  for (const k of state.pickups) {
    g.fillStyle = k.type === 'coin' ? '#e0b040' : '#5cff9a';
    if (k.type === 'coin') {
      g.beginPath();
      g.arc(k.x, k.y, 4, 0, 7);
      g.fill();
    } else g.fillRect(k.x - 5, k.y - 5, 10, 10);
  }
  for (const pr of state.projs) {
    g.fillStyle = pr.col || '#fff';
    g.beginPath();
    g.arc(pr.x, pr.y, 4, 0, 7);
    g.fill();
  }
  for (const e of state.ents) {
    if (e.face !== undefined) {
      g.strokeStyle = '#fff8';
      g.beginPath();
      g.moveTo(e.x, e.y);
      g.lineTo(
        e.x + Math.cos(e.face) * (e.r + 6),
        e.y + Math.sin(e.face) * (e.r + 6),
      );
      g.stroke();
    }
    g.fillStyle = e === p ? '#5cc8ff' : e.col;
    g.beginPath();
    g.arc(e.x, e.y, e.r, 0, 7);
    g.fill();
    if (e.boss) {
      g.fillStyle = '#333';
      g.fillRect(200, 44, 400, 8);
      g.fillStyle = e.col;
      g.fillRect(200, 44, (400 * Math.max(0, e.hp)) / e.hpMax, 8);
      g.fillStyle = '#e8e6df';
      g.fillText(e.name, 200, 40);
    }
  }
  const mh = stat(p, 'maxHp');
  g.fillStyle = '#333';
  g.fillRect(10, 10, 160, 10);
  g.fillStyle = '#e05a5a';
  g.fillRect(10, 10, (160 * Math.max(0, p.hp)) / mh, 10);
  g.fillStyle = '#333';
  g.fillRect(10, 24, 160, 6);
  g.fillStyle = '#e0b040';
  g.fillRect(10, 24, (160 * state.xp) / xpNeed(), 6);
  g.fillStyle = '#e8e6df';
  g.font = '13px system-ui';
  g.fillText('Lv ' + state.level, 180, 20);
  if (state.msgT > 0) {
    state.msgT -= 1 / 60;
    g.fillText(state.msg, W / 2 - 60, 80);
  }
  if (state.over) {
    g.font = '28px system-ui';
    g.fillText('Öldün — sayfayı yenile', 250, H / 2);
  }
}
