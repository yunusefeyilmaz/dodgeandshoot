import { state, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
import { RARITIES } from '../core/rarity.js';
import { T } from '../i18n/index.js';
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
const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
function drawDecor(th) {
  // haritaya özel zemin süsleri (ağaç, kaktüs, kristal): hücre başına sabit, ekran dışı çizilmez
  const S = 170,
    t = performance.now() / 1000;
  for (let cx = Math.floor(v.x / S) - 1; cx <= (v.x + v.w) / S; cx++)
    for (let cy = Math.floor(v.y / S) - 1; cy <= (v.y + v.h) / S; cy++) {
      if (hash(cx, cy) > th.density) continue;
      const x = cx * S + hash(cy, cx) * S,
        y = cy * S + hash(cx + 7, cy + 3) * S,
        s = 0.7 + hash(cx + 1, cy + 9) * 0.8,
        k = hash(cx + 5, cy + 5);
      if (x < 0 || y < 0 || x > W || y > H) continue;
      if (th.decor === 'forest') {
        g.fillStyle = '#2a1f14';
        g.fillRect(x - 3 * s, y, 6 * s, 16 * s);
        g.fillStyle = k > 0.5 ? '#16301d' : '#1c3a22';
        circle(x, y - 6 * s, 22 * s);
        g.fill();
        circle(x - 12 * s, y + 2 * s, 15 * s);
        g.fill();
        circle(x + 12 * s, y + 2 * s, 15 * s);
        g.fill();
        if (k > 0.8) {
          g.fillStyle = '#9bffd0';
          g.globalAlpha = 0.4 + 0.4 * Math.sin(t * 2 + x);
          circle(x + Math.sin(t + y) * 20, y - 24 * s, 2);
          g.fill();
          g.globalAlpha = 1;
        }
      } else if (th.decor === 'desert') {
        if (k > 0.55) {
          g.fillStyle = '#2f5a2a';
          g.fillRect(x - 3 * s, y - 20 * s, 6 * s, 30 * s);
          g.fillRect(x - 12 * s, y - 12 * s, 9 * s, 4 * s);
          g.fillRect(x - 12 * s, y - 20 * s, 4 * s, 12 * s);
          g.fillRect(x + 3 * s, y - 8 * s, 9 * s, 4 * s);
          g.fillRect(x + 8 * s, y - 16 * s, 4 * s, 12 * s);
        } else {
          g.strokeStyle = '#5a3a1e';
          g.lineWidth = 3;
          g.beginPath();
          g.arc(x, y + 30 * s, 40 * s, 3.6, 5.8);
          g.stroke();
          g.fillStyle = '#4a3220';
          circle(x + 30 * s, y + 8 * s, 8 * s);
          g.fill();
        }
      } else {
        g.fillStyle = k > 0.5 ? '#3a2a6a' : '#2a1f55';
        const fl = Math.sin(t + x * 0.01) * 6;
        g.beginPath();
        g.moveTo(x, y - 30 * s + fl);
        g.lineTo(x + 10 * s, y + fl);
        g.lineTo(x, y + 22 * s + fl);
        g.lineTo(x - 10 * s, y + fl);
        g.closePath();
        g.fill();
        g.fillStyle = '#b08aff';
        g.globalAlpha = 0.35 + 0.3 * Math.sin(t * 1.5 + y);
        circle(x + 40 * s, y - 20 * s, 2);
        g.fill();
        g.globalAlpha = 1;
      }
    }
}
function drawProj(pr) {
  // her mermi türü kendine özgü şekilde çizilir
  const a = Math.atan2(pr.vy, pr.vx),
    s = pr.size || 4,
    c = pr.col || '#fff';
  g.save();
  g.translate(pr.x, pr.y);
  g.rotate(a);
  g.fillStyle = c;
  g.strokeStyle = c;
  switch (pr.shape) {
    case 'arrow':
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-s * 3, 0);
      g.lineTo(s * 2, 0);
      g.stroke();
      g.beginPath();
      g.moveTo(s * 3, 0);
      g.lineTo(s * 1.2, -s * 0.9);
      g.lineTo(s * 1.2, s * 0.9);
      g.closePath();
      g.fill();
      g.strokeStyle = '#fff8';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-s * 3, 0);
      g.lineTo(-s * 3.8, -s * 0.8);
      g.moveTo(-s * 3, 0);
      g.lineTo(-s * 3.8, s * 0.8);
      g.stroke();
      break;
    case 'fire': {
      const fl = 1 + Math.sin((pr.age || 0) * 30) * 0.15;
      g.fillStyle = '#ff5a1a';
      g.beginPath();
      g.ellipse(0, 0, s * 1.8 * fl, s, 0, 0, 7);
      g.fill();
      g.fillStyle = '#ffd36a';
      g.beginPath();
      g.ellipse(s * 0.3, 0, s, s * 0.55, 0, 0, 7);
      g.fill();
      g.fillStyle = '#ff8a3d99';
      g.beginPath();
      g.moveTo(-s * 1.5, 0);
      g.lineTo(-s * 4 * fl, -s * 0.5);
      g.lineTo(-s * 4 * fl, s * 0.5);
      g.closePath();
      g.fill();
      break;
    }
    case 'shard':
      g.beginPath();
      g.moveTo(s * 3, 0);
      g.lineTo(0, -s * 0.9);
      g.lineTo(-s * 2.2, 0);
      g.lineTo(0, s * 0.9);
      g.closePath();
      g.fill();
      g.fillStyle = '#ffffffaa';
      g.beginPath();
      g.moveTo(s * 2.4, 0);
      g.lineTo(0, -s * 0.3);
      g.lineTo(-s, 0);
      g.closePath();
      g.fill();
      break;
    case 'dagger':
      g.rotate((pr.age || 0) * 22);
      g.beginPath();
      g.moveTo(s * 2.4, 0);
      g.lineTo(-s, -s * 0.7);
      g.lineTo(-s * 0.5, 0);
      g.lineTo(-s, s * 0.7);
      g.closePath();
      g.fill();
      g.fillStyle = '#4a3f6a';
      g.fillRect(-s * 1.8, -s * 0.35, s, s * 0.7);
      break;
    case 'blade':
      g.rotate((pr.age || 0) * 18);
      for (let i = 0; i < 2; i++) {
        g.rotate(1.5708);
        g.beginPath();
        g.moveTo(s * 2, 0);
        g.lineTo(0, -s * 0.5);
        g.lineTo(0, s * 0.5);
        g.closePath();
        g.fill();
      }
      break;
    case 'bolt':
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-s * 3, 0);
      g.lineTo(-s, -s * 0.9);
      g.lineTo(0, s * 0.6);
      g.lineTo(s * 2, -s * 0.4);
      g.lineTo(s * 3, 0);
      g.stroke();
      break;
    case 'glob': {
      const w = 1 + Math.sin((pr.age || 0) * 20) * 0.18;
      g.beginPath();
      g.ellipse(0, 0, s * 1.4 * w, s / w, 0, 0, 7);
      g.fill();
      g.fillStyle = '#ffffff55';
      g.beginPath();
      g.arc(-s * 0.3, -s * 0.3, s * 0.4, 0, 7);
      g.fill();
      break;
    }
    case 'petal':
      g.beginPath();
      g.ellipse(0, 0, s * 2, s * 0.8, 0, 0, 7);
      g.fill();
      break;
    case 'crescent':
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(-s * 0.6, 0, s * 1.6, -1.1, 1.1);
      g.stroke();
      break;
    default:
      g.beginPath();
      g.arc(0, 0, s, 0, 7);
      g.fill();
      g.fillStyle = '#ffffff88';
      g.beginPath();
      g.arc(-s * 0.25, -s * 0.25, s * 0.45, 0, 7);
      g.fill();
  }
  g.restore();
}
function drawFx(f) {
  // alan efektleri: ateş patlaması, buz kristalleri, yıldırım, zehir, kılıç savurması...
  const k = 1 - f.t / 0.25,
    a = Math.min(1, f.t * 4),
    r = f.r * (0.5 + 0.5 * k),
    seed = f.x * 0.013 + f.y * 0.007;
  g.globalAlpha = a;
  g.lineWidth = 3;
  switch (f.s) {
    case 'fire':
      g.fillStyle = '#ff7a2a66';
      circle(f.x, f.y, r);
      g.fill();
      g.strokeStyle = '#ffd36a';
      circle(f.x, f.y, r);
      g.stroke();
      g.strokeStyle = '#ff5a1a';
      for (let i = 0; i < 8; i++) {
        const an = i * 0.785 + seed;
        g.beginPath();
        g.moveTo(f.x + Math.cos(an) * r * 0.5, f.y + Math.sin(an) * r * 0.5);
        g.lineTo(f.x + Math.cos(an) * r * 1.15, f.y + Math.sin(an) * r * 1.15);
        g.stroke();
      }
      break;
    case 'ice':
      g.strokeStyle = '#bff0ff';
      circle(f.x, f.y, r);
      g.stroke();
      g.fillStyle = '#9be0ff44';
      g.fill();
      for (let i = 0; i < 8; i++) {
        const an = i * 0.785 + 0.39;
        g.beginPath();
        g.moveTo(f.x + Math.cos(an) * r * 0.35, f.y + Math.sin(an) * r * 0.35);
        g.lineTo(f.x + Math.cos(an) * r * 1.1, f.y + Math.sin(an) * r * 1.1);
        g.stroke();
      }
      break;
    case 'bolt':
      g.strokeStyle = '#fff6a0';
      g.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const an = i * 1.57 + seed;
        g.beginPath();
        g.moveTo(f.x, f.y);
        for (let j = 1; j <= 4; j++)
          g.lineTo(
            f.x + (Math.cos(an + (j % 2 ? 0.35 : -0.35)) * r * j) / 4,
            f.y + (Math.sin(an + (j % 2 ? 0.35 : -0.35)) * r * j) / 4,
          );
        g.stroke();
      }
      g.strokeStyle = '#ffe066';
      circle(f.x, f.y, r * 0.6);
      g.stroke();
      break;
    case 'poison':
      g.fillStyle = '#7bd94a44';
      circle(f.x, f.y, r);
      g.fill();
      g.fillStyle = '#7bd94a';
      for (let i = 0; i < 6; i++) {
        const an = i * 1.05 + seed;
        circle(
          f.x + Math.cos(an) * r * 0.6,
          f.y + Math.sin(an) * r * 0.6 - k * 12,
          4 + (i % 3),
        );
        g.fill();
      }
      break;
    case 'slash':
      g.strokeStyle = '#fff3c4';
      g.lineWidth = 7 * a + 1;
      g.lineCap = 'round';
      {
        const a0 = (seed * 40) % 6.28;
        g.beginPath();
        g.arc(f.x, f.y, r, a0, a0 + 2.2 + k * 1.2);
        g.stroke();
        g.strokeStyle = '#ffffffaa';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(f.x, f.y, r * 0.85, a0 + 0.2, a0 + 2 + k);
        g.stroke();
      }
      g.lineCap = 'butt';
      break;
    case 'quake':
      g.strokeStyle = '#b08a5a';
      circle(f.x, f.y, r);
      g.stroke();
      g.strokeStyle = '#5a4630';
      for (let i = 0; i < 7; i++) {
        const an = i * 0.9 + seed;
        g.beginPath();
        g.moveTo(f.x, f.y);
        g.lineTo(f.x + Math.cos(an) * r * 0.6, f.y + Math.sin(an) * r * 0.6);
        g.lineTo(f.x + Math.cos(an + 0.2) * r, f.y + Math.sin(an + 0.2) * r);
        g.stroke();
      }
      break;
    case 'dark':
      g.fillStyle = '#4a1f7a55';
      circle(f.x, f.y, r);
      g.fill();
      g.strokeStyle = '#b04fff';
      circle(f.x, f.y, r);
      g.stroke();
      circle(f.x, f.y, r * 0.55);
      g.stroke();
      break;
    case 'heal':
      g.strokeStyle = '#7bff9b';
      circle(f.x, f.y, r);
      g.stroke();
      g.fillStyle = '#7bff9b';
      for (let i = 0; i < 5; i++) {
        const an = i * 1.26 + seed;
        g.font = '14px system-ui';
        g.fillText(
          '+',
          f.x + Math.cos(an) * r * 0.7 - 4,
          f.y + Math.sin(an) * r * 0.7 - k * 14,
        );
      }
      break;
    default:
      g.strokeStyle = '#9be0ff';
      g.lineWidth = 2;
      circle(f.x, f.y, r);
      g.stroke();
  }
  g.globalAlpha = 1;
}
const body = (e) => {
  // düşman şekilleri
  const r = e.r,
    s = e.shape,
    f = e.face || 0;
  g.beginPath();
  if (s === 'square') g.rect(e.x - r, e.y - r, r * 2, r * 2);
  else if (s === 'tri') {
    g.moveTo(e.x + Math.cos(f) * r * 1.3, e.y + Math.sin(f) * r * 1.3);
    g.lineTo(
      e.x + Math.cos(f + 2.5) * r * 1.2,
      e.y + Math.sin(f + 2.5) * r * 1.2,
    );
    g.lineTo(
      e.x + Math.cos(f - 2.5) * r * 1.2,
      e.y + Math.sin(f - 2.5) * r * 1.2,
    );
    g.closePath();
  } else if (s === 'diamond') {
    g.moveTo(e.x, e.y - r * 1.2);
    g.lineTo(e.x + r * 1.2, e.y);
    g.lineTo(e.x, e.y + r * 1.2);
    g.lineTo(e.x - r * 1.2, e.y);
    g.closePath();
  } else g.arc(e.x, e.y, r, 0, 7);
  g.fill();
};

export function render() {
  const p = state.player;
  v.x = Math.max(0, Math.min(W - v.w, p.x - v.w / 2));
  v.y = Math.max(0, Math.min(H - v.h, p.y - v.h / 2));
  const th = state.map.theme;
  g.fillStyle = th.bg;
  g.fillRect(0, 0, v.w, v.h);
  const sh = state.shake * 14;
  g.save();
  g.translate(
    -v.x + (Math.random() - 0.5) * sh,
    -v.y + (Math.random() - 0.5) * sh,
  );
  drawDecor(th);
  g.strokeStyle = th.grid;
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
  g.strokeStyle = th.border;
  g.lineWidth = 4;
  g.strokeRect(0, 0, W, H);
  if (state.showMagnet) {
    g.strokeStyle = '#e0b04033';
    circle(p.x, p.y, stat(p, 'magnet'));
    g.stroke();
  }
  for (const f of state.fx) drawFx(f);
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
    if (
      k.x < v.x - 20 ||
      k.x > v.x + v.w + 20 ||
      k.y < v.y - 20 ||
      k.y > v.y + v.h + 20
    )
      continue; // ekran dışı çizilmez
    if (k.type === 'coin') {
      g.fillStyle = '#e0b040';
      circle(k.x, k.y, 4);
      g.fill();
    } else {
      const c = RARITIES[k.def.rarity].col;
      g.globalAlpha = 0.25;
      g.fillStyle = c;
      circle(k.x, k.y, 12);
      g.fill();
      g.globalAlpha = 1;
      g.fillRect(k.x - 6, k.y - 6, 12, 12);
    }
  }
  for (const w of state.arena.waves) {
    g.globalAlpha = 0.55;
    g.strokeStyle = w.col;
    g.lineWidth = w.w;
    circle(w.x, w.y, w.r);
    g.stroke();
    g.globalAlpha = 1;
    g.strokeStyle = '#fff8';
    g.lineWidth = 3;
    circle(w.x, w.y, w.r);
    g.stroke();
  }
  for (const m of state.arena.mines || []) {
    const bl = Math.sin(performance.now() / 160 + m.x) > 0;
    g.fillStyle = '#2a1010';
    circle(m.x, m.y, m.r);
    g.fill();
    g.fillStyle = bl ? '#ff3a3a' : '#7a1a1a';
    circle(m.x, m.y, 6);
    g.fill();
    g.strokeStyle = '#ff3a3a66';
    g.lineWidth = 2;
    circle(m.x, m.y, m.r + 3);
    g.stroke();
  }
  for (const q of state.arena.pillars) {
    g.fillStyle = '#6a7080';
    circle(q.x, q.y, q.r);
    g.fill();
    g.strokeStyle = '#cfd3dc';
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = '#000a';
    g.fillRect(q.x - 20, q.y - q.r - 12, 40, 5);
    g.fillStyle = '#ffd84f';
    g.fillRect(q.x - 20, q.y - q.r - 12, (40 * Math.max(0, q.hp)) / q.max, 5);
  }
  const wp = state.waypoint; // görev listesinden işaretlenen konum
  if (wp && Math.hypot(wp.x - p.x, wp.y - p.y) > 110) {
    // oyuncudan hedefe YOL: akan kesikli çizgi + ilerleyen oklar + mesafe
    const dx = wp.x - p.x,
      dy = wp.y - p.y,
      d = Math.hypot(dx, dy),
      ux = dx / d,
      uy = dy / d,
      ang = Math.atan2(dy, dx);
    g.save();
    g.setLineDash([12, 12]);
    g.lineDashOffset = -performance.now() / 30;
    g.strokeStyle = '#ffffffb0';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(p.x + ux * 24, p.y + uy * 24);
    g.lineTo(wp.x - ux * 34, wp.y - uy * 34);
    g.stroke();
    g.restore();
    for (let t = 70 + ((performance.now() / 8) % 170); t < d - 60; t += 170) {
      g.save();
      g.translate(p.x + ux * t, p.y + uy * t);
      g.rotate(ang);
      g.fillStyle = '#ffd84f';
      g.beginPath();
      g.moveTo(12, 0);
      g.lineTo(-8, -9);
      g.lineTo(-3, 0);
      g.lineTo(-8, 9);
      g.closePath();
      g.fill();
      g.restore();
    }
    g.font = 'bold 13px system-ui';
    g.textAlign = 'center';
    g.lineWidth = 3;
    g.strokeStyle = '#000';
    g.fillStyle = '#fff';
    const lab = T(wp.label || '') + ' · ' + Math.round(d / 10) + ' m';
    g.strokeText(lab, p.x + ux * 100, p.y + uy * 100 - 16);
    g.fillText(lab, p.x + ux * 100, p.y + uy * 100 - 16);
    g.textAlign = 'left';
  }
  if (wp) {
    g.globalAlpha = 0.6 + 0.4 * Math.sin(performance.now() / 150);
    g.strokeStyle = '#fff';
    g.lineWidth = 3;
    circle(wp.x, wp.y, 32 + Math.sin(performance.now() / 200) * 6);
    g.stroke();
    g.globalAlpha = 1;
    g.font = '24px system-ui';
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    g.fillText('📍', wp.x, wp.y - 38);
    g.textAlign = 'left';
  }
  const ob = state.obj;
  if (ob && ob.type === 'zone' && !ob.done && !ob.failed) {
    g.strokeStyle = '#5cc8ff';
    g.fillStyle = '#5cc8ff22';
    g.lineWidth = 3;
    circle(ob.x, ob.y, ob.r);
    g.fill();
    g.stroke();
    g.fillStyle = '#5cc8ff55';
    circle(ob.x, ob.y, ob.r * Math.min(1, ob.t / ob.need));
    g.fill();
  }
  if (ob && ob.type === 'hunt' && !ob.done && ob.target.hp > 0) {
    g.strokeStyle = '#ffd84f';
    g.lineWidth = 3;
    circle(
      ob.target.x,
      ob.target.y,
      ob.target.r + 12 + Math.sin(performance.now() / 120) * 3,
    );
    g.stroke();
  }
  for (const q of state.pois) {
    // haritadaki olaylar
    g.globalAlpha = 0.25;
    g.fillStyle = q.col;
    circle(q.x, q.y, 34 * (1 + Math.sin(performance.now() / 300 + q.x) * 0.08));
    g.fill();
    g.globalAlpha = 1;
    g.font = '26px system-ui';
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    g.fillText(q.glyph, q.x, q.y + 9);
    if (q.type === 'camp') {
      g.strokeStyle = q.col;
      g.lineWidth = 2;
      circle(q.x, q.y, 120);
      g.stroke();
    }
  }
  if (state.prompt) {
    g.font = 'bold 14px system-ui';
    g.textAlign = 'center';
    g.lineWidth = 4;
    g.strokeStyle = '#000';
    g.strokeText(T(state.prompt.text), state.prompt.x, state.prompt.y - 44);
    g.fillStyle = '#ffd84f';
    g.fillText(T(state.prompt.text), state.prompt.x, state.prompt.y - 44);
  }
  g.textAlign = 'left';
  for (const pr of state.projs) drawProj(pr);
  const spin = performance.now() / 180;
  for (const z of state.zones) {
    // yanan iz, hortum
    g.globalAlpha = Math.min(0.45, z.t / 2);
    g.fillStyle = z.col;
    circle(z.x, z.y, z.r);
    g.fill();
    if (z.tornado) {
      g.globalAlpha = 0.8;
      g.strokeStyle = '#fff';
      g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(z.x, z.y, z.r * (0.4 + i * 0.25), spin + i, spin + i + 2.2);
        g.stroke();
      }
    }
  }
  g.globalAlpha = 1;
  for (const t of state.teles) {
    if (t.quiet) continue; // uyarı alanları: kırmızı = düşman saldırısı, mavi = senin
    const k = 1 - t.t / t.max,
      col = t.team === 'e' ? '255,60,40' : '90,200,255';
    if (t.kind === 'circle') {
      g.fillStyle = `rgba(${col},${0.08 + 0.12 * k})`;
      circle(t.x, t.y, t.r);
      g.fill();
      g.fillStyle = `rgba(${col},${0.25 + 0.3 * k})`;
      circle(t.x, t.y, t.r * k);
      g.fill();
      g.strokeStyle = `rgba(${col},.85)`;
      g.lineWidth = 2;
      circle(t.x, t.y, t.r);
      g.stroke();
    } else {
      g.lineCap = 'round';
      g.strokeStyle = `rgba(${col},${0.12 + 0.25 * k})`;
      g.lineWidth = t.w;
      g.beginPath();
      g.moveTo(t.x1, t.y1);
      g.lineTo(t.x2, t.y2);
      g.stroke();
      g.strokeStyle = `rgba(${col},.85)`;
      g.lineWidth = 2;
      g.stroke();
      g.lineCap = 'butt';
    }
  }
  if (state.target && state.target.hp > 0 && !state.target.under) {
    g.strokeStyle = '#ffd84f';
    g.lineWidth = 2;
    circle(state.target.x, state.target.y, state.target.r + 8);
    g.stroke();
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
    if (e.under) continue;
    if (
      !e.segs &&
      (e.x < v.x - 90 ||
        e.x > v.x + v.w + 90 ||
        e.y < v.y - 90 ||
        e.y > v.y + v.h + 90)
    )
      continue; // ekran dışı düşman çizilmez
    if (e.segs) {
      g.fillStyle = '#8a7430';
      for (let i = e.segs.length - 1; i >= 0; i--) {
        const s = e.segs[i];
        g.globalAlpha = 0.9;
        circle(s.x, s.y, s.r * (1 - i / 40));
        g.fill();
      }
      g.globalAlpha = 1;
    }
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
    g.globalAlpha = e === p && p.invuln > 0 ? 0.45 : 1;
    g.fillStyle = e === p ? '#5cc8ff' : e.col;
    if (e === p) {
      g.shadowColor = '#5cc8ff';
      g.shadowBlur = 18;
    }
    body(e);
    g.shadowBlur = 0;
    g.globalAlpha = 1;
    if (e.icon) {
      g.font = '16px system-ui';
      g.textAlign = 'center';
      g.fillText(e.icon, e.x, e.y + 6);
      g.textAlign = 'left';
    }
    if (e.hurt > 0) {
      g.globalAlpha = Math.min(0.8, (e.hurt / 0.12) * 0.8);
      g.fillStyle = '#ff2a2a';
      circle(e.x, e.y, e.r);
      g.fill();
      g.globalAlpha = 1;
    } // hasar alınca kızarma
    g.lineWidth = 2; // durum halkaları
    if (e.segs) {
      g.fillStyle = '#ffd84f';
      circle(
        e.x + Math.cos(e.face) * e.r * 0.45,
        e.y + Math.sin(e.face) * e.r * 0.45,
        7,
      );
      g.fill();
    } // parlayan zayıf nokta
    if (e.exposed > 0) {
      g.strokeStyle = '#ffd84f';
      g.lineWidth = 4;
      circle(e.x, e.y, e.r + 8 + Math.sin(performance.now() / 90) * 3);
      g.stroke();
      g.lineWidth = 2;
    }
    if (e.elite) {
      g.strokeStyle = '#ffd84f';
      g.lineWidth = 3;
      circle(e.x, e.y, e.r + 4);
      g.stroke();
      g.lineWidth = 2;
    }
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
    if (e !== p && !e.boss && (e.barT > 0 || e.mini)) {
      // can barı: hasar alınca görünür, 2.5 sn sonra kaybolur
      const w = e.r * 2 + 8,
        x = e.x - w / 2,
        y = e.y - e.r - 12;
      g.globalAlpha = e.mini ? 1 : Math.min(1, e.barT * 2);
      g.fillStyle = '#000b';
      g.fillRect(x, y, w, 5);
      g.fillStyle = '#e05a5a';
      g.fillRect(x, y, (w * Math.max(0, e.hp)) / e.hpMax, 5);
      g.globalAlpha = 1;
    }
  }
  for (const e of state.ents)
    for (const o of e.orbits)
      for (const b of o.pos) {
        // dönen tırpanlar
        g.save();
        g.translate(b.x, b.y);
        g.rotate(b.a * 3);
        g.fillStyle = o.col || (e.team === 'e' ? '#ff5a5a' : '#c0e8ff');
        g.beginPath();
        g.moveTo(o.size, 0);
        g.lineTo(0, o.size * 0.45);
        g.lineTo(-o.size, 0);
        g.lineTo(0, -o.size * 0.45);
        g.closePath();
        g.fill();
        g.restore();
      }
  g.shadowBlur = 0;
  g.textAlign = 'center';
  g.font = 'bold 13px system-ui';
  g.lineWidth = 3;
  g.strokeStyle = '#000b';
  for (const e of state.ents)
    if ((e.boss || e.mini || e.objTarget) && !e.under) {
      g.fillStyle = '#fff';
      g.strokeText(T(e.name), e.x, e.y - e.r - 14);
      g.fillText(T(e.name), e.x, e.y - e.r - 14);
    } // boss isimleri
  g.textAlign = 'center';
  g.lineJoin = 'round';
  g.lineWidth = 3;
  g.strokeStyle = '#000b'; // hasar sayıları
  for (const x of state.texts) {
    const kk = x.big ? 1 + Math.max(0, x.t - 0.5) * 7 : 1;
    g.globalAlpha = Math.min(1, x.t * 3);
    g.font = 'bold ' + Math.round((x.big ? 20 : 13) * kk) + 'px system-ui';
    g.fillStyle = x.col; // kritik yazısı büyüyerek belirir
    g.strokeText(T(x.text), x.x, x.y);
    g.fillText(T(x.text), x.x, x.y);
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
  const A = state.arena; // ekran katmanları: karanlık, daralan çember, rüzgar
  const hole = (x, y, rr) => {
    g.moveTo(x - v.x + rr, y - v.y);
    g.arc(x - v.x, y - v.y, rr, 0, 6.2832);
  };
  if (A.dark) {
    g.fillStyle = 'rgba(4,4,14,.82)';
    g.beginPath();
    g.rect(0, 0, v.w, v.h);
    hole(p.x, p.y, 80);
    for (const l of A.dark.lights) hole(l.x, l.y, l.r);
    g.fill('evenodd');
    g.strokeStyle = '#ffd84f';
    g.lineWidth = 3;
    for (const l of A.dark.lights) {
      g.beginPath();
      g.arc(l.x - v.x, l.y - v.y, l.r, 0, 6.2832);
      g.stroke();
    }
  }
  if (A.ring) {
    g.fillStyle = 'rgba(40,40,140,.38)';
    g.beginPath();
    g.rect(0, 0, v.w, v.h);
    hole(A.ring.x, A.ring.y, A.ring.r);
    g.fill('evenodd');
    g.strokeStyle = '#8f9bff';
    g.lineWidth = 4;
    g.beginPath();
    g.arc(A.ring.x - v.x, A.ring.y - v.y, A.ring.r, 0, 6.2832);
    g.stroke();
  }
  if (A.wind) {
    g.save();
    g.translate(v.w / 2, v.h * 0.24);
    g.rotate(A.wind.a);
    g.globalAlpha = 0.85;
    g.fillStyle = '#cfeaff';
    g.beginPath();
    g.moveTo(28, 0);
    g.lineTo(-14, -15);
    g.lineTo(-6, 0);
    g.lineTo(-14, 15);
    g.closePath();
    g.fill();
    g.restore();
    g.globalAlpha = 1;
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
      T(e.name) +
        ' · ' +
        Math.round(Math.hypot(e.x - p.x, e.y - p.y) / 10) +
        'm',
      ax - Math.cos(ang) * 50,
      ay - Math.sin(ang) * 40 + 4,
    );
  }
  for (const q of [
    ...state.pois,
    ...(state.waypoint
      ? [
          {
            x: state.waypoint.x,
            y: state.waypoint.y,
            col: '#ffffff',
            glyph: '📍',
          },
        ]
      : []),
    ...(ob && ob.type === 'zone' && !ob.done && !ob.failed
      ? [{ x: ob.x, y: ob.y, col: '#5cc8ff', glyph: '🎯' }]
      : []),
    ...(ob && ob.type === 'hunt' && !ob.done && ob.target.hp > 0
      ? [{ x: ob.target.x, y: ob.target.y, col: '#ffd84f', glyph: '🎯' }]
      : []),
  ]) {
    // ekran dışı olaylar + hedefler için kenar işaretleri
    const sx = q.x - v.x,
      sy = q.y - v.y;
    if (sx > 24 && sx < v.w - 24 && sy > 24 && sy < v.h - 24) continue;
    const ax = Math.min(v.w - 30, Math.max(30, sx)),
      ay = Math.min(v.h - 30, Math.max(30, sy));
    g.globalAlpha = 0.75;
    g.fillStyle = '#000b';
    circle(ax, ay, 15);
    g.fill();
    g.strokeStyle = q.col;
    g.lineWidth = 2;
    g.stroke();
    g.font = '16px system-ui';
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    g.fillText(q.glyph, ax, ay + 6);
    g.globalAlpha = 1;
  }
  g.textAlign = 'left';
}
