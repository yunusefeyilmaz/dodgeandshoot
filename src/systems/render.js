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
      g.globalAlpha = 0.25;
      g.fillStyle = c;
      circle(k.x, k.y, 12);
      g.fill();
      g.globalAlpha = 1;
      g.fillRect(k.x - 6, k.y - 6, 12, 12);
    }
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
  for (const pr of state.projs) {
    if (pr.shape === 'crescent') {
      g.save();
      g.translate(pr.x, pr.y);
      g.rotate(Math.atan2(pr.vy, pr.vx));
      g.strokeStyle = pr.col;
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(-pr.size * 0.6, 0, pr.size * 1.6, -1.1, 1.1);
      g.stroke();
      g.lineCap = 'butt';
      g.restore();
    } else {
      g.fillStyle = pr.col || '#fff';
      circle(pr.x, pr.y, pr.size || 4);
      g.fill();
    }
  }
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
    g.globalAlpha = Math.min(1, x.t * 3);
    g.font = (x.big ? 'bold 20px' : 'bold 13px') + ' system-ui';
    g.fillStyle = x.col;
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
