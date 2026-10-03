import { state, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
import { RARITIES } from '../core/rarity.js';
const cv = document.getElementById('c'),
  g = cv.getContext('2d'),
  v = state.view;
function resize() {
  cv.width = v.w = innerWidth;
  cv.height = v.h = innerHeight;
}
addEventListener('resize', resize);
resize();
const circle = (x, y, r) => {
  g.beginPath();
  g.arc(x, y, r, 0, 7);
};

export function render() {
  const p = state.player;
  v.x = Math.max(0, Math.min(W - v.w, p.x - v.w / 2));
  v.y = Math.max(0, Math.min(H - v.h, p.y - v.h / 2));
  g.fillStyle = '#1d2029';
  g.fillRect(0, 0, v.w, v.h);
  const sh = state.shake * 14;
  g.save();
  g.translate(
    -v.x + (Math.random() - 0.5) * sh,
    -v.y + (Math.random() - 0.5) * sh,
  );
  g.strokeStyle = '#ffffff0d';
  g.lineWidth = 1;
  g.beginPath();
  for (let x = Math.floor(v.x / 100) * 100; x <= v.x + v.w; x += 100) {
    g.moveTo(x, v.y);
    g.lineTo(x, v.y + v.h);
  }
  for (let y = Math.floor(v.y / 100) * 100; y <= v.y + v.h; y += 100) {
    g.moveTo(v.x, y);
    g.lineTo(v.x + v.w, y);
  }
  g.stroke();
  g.strokeStyle = '#e05a5a55';
  g.lineWidth = 4;
  g.strokeRect(0, 0, W, H);
  if (state.showMagnet) {
    g.strokeStyle = '#e0b04033';
    circle(p.x, p.y, stat(p, 'magnet'));
    g.stroke();
  }
  for (const f of state.fx) {
    g.strokeStyle = '#9be0ff';
    g.lineWidth = 2;
    g.globalAlpha = f.t * 4;
    circle(f.x, f.y, f.r);
    g.stroke();
    g.globalAlpha = 1;
  }
  for (const d of state.deaths) {
    // ölüm: yassılıp yayılarak kaybolur (ezilme)
    const k = 1 - d.t / 0.4;
    g.save();
    g.translate(d.x, d.y + d.r * k * 0.7);
    g.scale(1 + k * 0.9, 1 - k * 0.8);
    g.globalAlpha = 1 - k;
    g.fillStyle = d.col;
    circle(0, 0, d.r);
    g.fill();
    g.restore();
  }
  g.globalAlpha = 1;
  for (const r of state.rings) {
    g.strokeStyle = r.col;
    g.lineWidth = 3;
    g.globalAlpha = r.t / 0.4;
    circle(r.x, r.y, r.r);
    g.stroke();
  }
  for (const q of state.parts) {
    g.globalAlpha = Math.max(0, q.t / q.max);
    g.fillStyle = q.col;
    circle(q.x, q.y, q.r);
    g.fill();
  }
  g.globalAlpha = 1;
  for (const k of state.pickups) {
    if (k.type === 'coin') {
      g.fillStyle = '#e0b040';
      circle(k.x, k.y, 4);
      g.fill();
    } else {
      const c = RARITIES[k.def.rarity].col;
      g.fillStyle = g.shadowColor = c;
      g.shadowBlur = 14;
      g.fillRect(k.x - 6, k.y - 6, 12, 12);
      g.shadowBlur = 0;
    }
  }
  for (const pr of state.projs) {
    g.fillStyle = pr.col || '#fff';
    circle(pr.x, pr.y, 4);
    g.fill();
  }
  for (const l of state.lines) {
    g.strokeStyle = '#8fd0ff';
    g.lineWidth = 3;
    g.globalAlpha = l.t / 0.18;
    g.beginPath();
    g.moveTo(l.x1, l.y1);
    g.lineTo(l.x2, l.y2);
    g.stroke();
    g.globalAlpha = 1;
  }
  for (const e of state.ents) {
    if (e.face !== undefined) {
      g.strokeStyle = '#fff8';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(e.x, e.y);
      g.lineTo(
        e.x + Math.cos(e.face) * (e.r + 6),
        e.y + Math.sin(e.face) * (e.r + 6),
      );
      g.stroke();
    }
    g.fillStyle = e === p ? '#5cc8ff' : e.col;
    if (e === p) {
      g.shadowColor = '#5cc8ff';
      g.shadowBlur = 18;
    }
    circle(e.x, e.y, e.r);
    g.fill();
    g.shadowBlur = 0;
    if (e.hurt > 0) {
      g.globalAlpha = Math.min(0.8, (e.hurt / 0.12) * 0.8);
      g.fillStyle = '#ff2a2a';
      circle(e.x, e.y, e.r);
      g.fill();
      g.globalAlpha = 1;
    } // hasar alınca kızarma
    g.lineWidth = 2; // durum halkaları
    if (e.poison) {
      g.strokeStyle = '#6be04a';
      circle(e.x, e.y, e.r + 3);
      g.stroke();
    }
    if (e.slow) {
      g.strokeStyle = '#6fd3ff';
      circle(e.x, e.y, e.r + 6);
      g.stroke();
    }
    if (e.shred) {
      g.strokeStyle = '#c05bff';
      circle(e.x, e.y, e.r + 9);
      g.stroke();
    }
    if (e !== p && !e.boss && e.barT > 0) {
      // can barı: hasar alınca görünür, 2.5 sn sonra kaybolur
      const w = e.r * 2 + 8,
        x = e.x - w / 2,
        y = e.y - e.r - 12;
      g.globalAlpha = Math.min(1, e.barT * 2);
      g.fillStyle = '#000b';
      g.fillRect(x, y, w, 5);
      g.fillStyle = '#e05a5a';
      g.fillRect(x, y, (w * Math.max(0, e.hp)) / e.hpMax, 5);
      g.globalAlpha = 1;
    }
  }
  g.textAlign = 'center';
  g.lineJoin = 'round';
  g.lineWidth = 3;
  g.strokeStyle = '#000b'; // hasar sayıları
  for (const x of state.texts) {
    g.globalAlpha = Math.min(1, x.t * 3);
    g.font = (x.big ? 'bold 20px' : 'bold 13px') + ' system-ui';
    g.fillStyle = x.col;
    g.strokeText(x.text, x.x, x.y);
    g.fillText(x.text, x.x, x.y);
  }
  g.globalAlpha = 1;
  g.restore();

  // Vignette: can düştükçe kırmızılaşır + hasar yiyince flaş
  const ratio = Math.max(0, p.hp) / stat(p, 'maxHp'),
    a = Math.min(0.92, Math.pow(1 - ratio, 1.3) * 0.85 + state.flash * 0.5);
  if (a > 0.01) {
    const gr = g.createRadialGradient(
      v.w / 2,
      v.h / 2,
      Math.min(v.w, v.h) * 0.3,
      v.w / 2,
      v.h / 2,
      Math.hypot(v.w, v.h) * 0.55,
    );
    gr.addColorStop(0, 'rgba(190,0,0,0)');
    gr.addColorStop(1, 'rgba(190,0,0,' + a + ')');
    g.fillStyle = gr;
    g.fillRect(0, 0, v.w, v.h);
  }
  if (state.flash > 0.01) {
    g.fillStyle = 'rgba(255,0,0,' + state.flash * 0.1 + ')';
    g.fillRect(0, 0, v.w, v.h);
  }

  for (const e of state.ents) {
    // ekran dışı boss oku
    if (!e.boss) continue;
    const sx = e.x - v.x,
      sy = e.y - v.y;
    if (sx > 0 && sx < v.w && sy > 0 && sy < v.h) continue;
    const cx = v.w / 2,
      cy = v.h / 2,
      dx = sx - cx,
      dy = sy - cy,
      ang = Math.atan2(dy, dx);
    const k = Math.min(
        (cx - 50) / (Math.abs(dx) || 1e-6),
        (cy - 50) / (Math.abs(dy) || 1e-6),
      ),
      ax = cx + dx * k,
      ay = cy + dy * k;
    g.save();
    g.translate(ax, ay);
    g.rotate(ang);
    g.fillStyle = e.col;
    g.beginPath();
    g.moveTo(16, 0);
    g.lineTo(-10, -11);
    g.lineTo(-10, 11);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = '#e8e6df';
    g.font = '12px system-ui';
    g.fillText(
      e.name + ' · ' + Math.round(Math.hypot(e.x - p.x, e.y - p.y) / 10) + 'm',
      ax - Math.cos(ang) * 50,
      ay - Math.sin(ang) * 40 + 4,
    );
  }
  g.textAlign = 'left';
}
