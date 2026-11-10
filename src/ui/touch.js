import { state } from '../core/state.js';
import { meta } from '../core/save.js';
import { tryDash } from '../systems/dash.js';
import { interact } from '../systems/pois.js';
import { calcZoom } from '../systems/render.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
// ——— MOBİL / TABLET: dokunmatik kontroller + ekran sınıfları ———
// Sol yarıda herhangi bir yere dokun-sürükle: yüzen joystick (analog). Sağ altta DASH, yanında bağlamsal ETKİLEŞİM düğmesi.
// body sınıfları: touch (kontroller açık), sm (<900 genişlik veya <520 yükseklik), xs (<600 genişlik), short (<520 yükseklik), portrait.
export const joyVec = (dx, dy, R = 58, dead = 0.16) => {
  const d = Math.hypot(dx, dy);
  if (d < R * dead) return [0, 0];
  const m = Math.min(1, (d - R * dead) / (R * (1 - dead)));
  return [(dx / d) * m, (dy / d) * m];
};
export function wantTouch() {
  // ayar: auto | on | off
  const m = meta.settings.touch || 'auto';
  if (m === 'on') return true;
  if (m === 'off') return false;
  return !!(
    state.sawTouch ||
    (typeof matchMedia === 'function' &&
      matchMedia('(pointer: coarse)').matches &&
      !matchMedia('(hover: hover)').matches)
  );
}
export function applyLayout() {
  const b = document.body,
    w = innerWidth,
    h = innerHeight,
    t = wantTouch();
  b.classList.toggle('touch', t);
  b.classList.toggle('sm', w < 900 || h < 520);
  b.classList.toggle('xs', w < 600);
  b.classList.toggle('short', h < 520);
  b.classList.toggle('portrait', h > w);
  const z = calcZoom(w, h);
  b.style.setProperty('--zoom', z);
}
let joy,
  knob,
  zone,
  bDash,
  bAct,
  hint,
  pid = null,
  ox = 0,
  oy = 0,
  vis = false;
export function initTouch() {
  joy = document.getElementById('joy');
  knob = joy.firstElementChild;
  zone = document.getElementById('joyZone');
  bDash = document.getElementById('tDash');
  bAct = document.getElementById('tAct');
  hint = document.getElementById('rotHint');
  const R = () => 58,
    set = (x, y) => {
      const [vx, vy] = joyVec(x - ox, y - oy, R());
      state.touch.x = vx;
      state.touch.y = vy;
      state.touch.active = vx !== 0 || vy !== 0;
      const d = Math.hypot(x - ox, y - oy) || 1,
        k = Math.min(d, R());
      knob.style.transform = `translate(${((x - ox) / d) * k}px,${((y - oy) / d) * k}px)`;
    };
  const end = () => {
    pid = null;
    state.touch.active = false;
    state.touch.x = state.touch.y = 0;
    joy.classList.remove('on');
    knob.style.transform = '';
    joy.style.left = joy.style.top = '';
  };
  zone.addEventListener('pointerdown', (e) => {
    if (pid !== null) return;
    state.sawTouch = true;
    if (!document.body.classList.contains('touch')) applyLayout();
    pid = e.pointerId;
    zone.setPointerCapture(pid);
    ox = e.clientX;
    oy = e.clientY;
    joy.style.left = ox + 'px';
    joy.style.top = oy + 'px';
    joy.classList.add('on');
    set(ox, oy);
    e.preventDefault();
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId === pid) set(e.clientX, e.clientY);
  });
  zone.addEventListener('pointerup', (e) => {
    if (e.pointerId === pid) end();
  });
  zone.addEventListener('pointercancel', (e) => {
    if (e.pointerId === pid) end();
  });
  bDash.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    tryDash();
    navigator.vibrate && navigator.vibrate(12);
    bDash.classList.add('hit');
    setTimeout(() => bDash.classList.remove('hit'), 120);
  });
  bAct.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    interact();
    navigator.vibrate && navigator.vibrate(12);
  });
  document.addEventListener('contextmenu', (e) => {
    if (document.body.classList.contains('touch')) e.preventDefault();
  });
  addEventListener(
    'touchstart',
    () => {
      if (!state.sawTouch) {
        state.sawTouch = true;
        applyLayout();
      }
    },
    { passive: true, once: true },
  );
  document.getElementById('rotX').onclick = () => {
    state.hideRot = true;
  };
  document.addEventListener('visibilitychange', () => {
    // uygulama/sekme arka plana gidince oyunu duraklat (telefonda arama, uygulama değiştirme)
    if (
      document.hidden &&
      state.mode === 'run' &&
      !state.paused &&
      !state.over
    ) {
      const b = btn('▶ Devam', () => hideOverlay());
      b.classList.add('go');
      const c = document.createElement('div');
      c.className = 'c2-ctl';
      c.append(b);
      showOverlay('Duraklatıldı', [c], 'modal', 'Oyun arka plana alındı');
    }
  });
  addEventListener('resize', applyLayout);
  addEventListener('orientationchange', () => setTimeout(applyLayout, 120));
  applyLayout();
}
export function updateTouch() {
  // her çizimde: kontrolleri göster/gizle
  const on =
    document.body.classList.contains('touch') &&
    state.mode === 'run' &&
    !state.paused &&
    !state.over;
  if (on !== vis) {
    vis = on;
    document.getElementById('touchUI').style.display = on ? 'block' : 'none';
    if (!on) {
      state.touch.active = false;
      pid = null;
    }
  }
  if (on) {
    const a = !!state.prompt;
    if (a !== bAct._v) {
      bAct._v = a;
      bAct.style.display = a ? 'grid' : 'none';
    }
  }
  const rot =
    document.body.classList.contains('touch') &&
    document.body.classList.contains('portrait') &&
    document.body.classList.contains('xs') &&
    state.mode === 'run' &&
    !state.hideRot &&
    !state.paused;
  if (rot !== hint._v) {
    hint._v = rot;
    hint.style.display = rot ? 'flex' : 'none';
  }
}
export function toggleFullscreen() {
  const d = document,
    el = d.documentElement;
  if (!el) return;
  if (d.fullscreenElement) {
    d.exitFullscreen && d.exitFullscreen();
    return;
  }
  const f = el.requestFullscreen || el.webkitRequestFullscreen;
  if (f)
    Promise.resolve(f.call(el))
      .then(() => {
        try {
          screen.orientation &&
            screen.orientation.lock &&
            screen.orientation.lock('landscape').catch(() => {});
        } catch (e) {}
      })
      .catch(() => {});
}
