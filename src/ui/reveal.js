import { RARITIES } from '../core/rarity.js';
import { ITEMS } from '../data/items.js';
import { sfx } from '../core/audio.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
// Sandık/ödül çarkı (Vampire Survivors tarzı): şeritler döner, yavaşlayarak ödül item'a oturur; nadirliğe göre renk, parlama ve kıvılcım.
const TW = 112,
  WIN = 30,
  GL = ['⚔️', '🛡️', '🔮', '💍', '👑', '🗡️'],
  glyph = (it) => (it.cursed ? '💀' : GL[it.id.length % GL.length]);
export function revealItem(def) {
  const strip = document.createElement('div');
  strip.className = 'wstrip';
  strip.innerHTML = Array.from({ length: 36 }, (_, i) =>
    i === WIN ? def : ITEMS[(Math.random() * ITEMS.length) | 0],
  )
    .map(
      (it) =>
        '<div class="wt" style="--c:' +
        RARITIES[it.rarity].col +
        '"><span>' +
        glyph(it) +
        '</span><small>' +
        it.name +
        '</small></div>',
    )
    .join('');
  const wheel = document.createElement('div');
  wheel.className = 'wheel';
  wheel.innerHTML = '<div class="wmark"></div>';
  wheel.appendChild(strip);
  const res = document.createElement('div');
  res.className = 'wres';
  res.textContent = 'Çark dönüyor...';
  const ok = btn('Al', hideOverlay, true),
    skip = btn('Atla', () => finish(true));
  let done = false;
  const timers = [];
  const pos = () =>
    'translateX(' +
    -(WIN * TW - ((wheel.offsetWidth || 640) / 2 - TW / 2)) +
    'px)';
  function finish(fast) {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    if (fast) {
      strip.style.transition = 'none';
      strip.style.transform = pos();
    }
    const r = RARITIES[def.rarity];
    res.style.setProperty('--c', r.col);
    res.className = 'wres on t' + r.tier;
    res.innerHTML =
      '<b style="color:' +
      r.col +
      '">' +
      def.name +
      '</b> <small style="color:' +
      r.col +
      '">' +
      r.name +
      '</small>' +
      (def.cursed
        ? '<div style="color:#ff6a6a;font-size:12px">☠ Lanetli eşya!</div>'
        : '');
    ok.disabled = false;
    skip.style.display = 'none';
    sfx(r.tier >= 3 ? 'level' : 'item');
    for (let i = 0, n = 8 + r.tier * 6; i < n; i++) {
      const s = document.createElement('i'),
        a = Math.random() * 6.28,
        d = 60 + Math.random() * 170;
      s.className = 'spark';
      s.style.cssText =
        'left:50%;top:50%;background:' +
        r.col +
        ';--x:' +
        Math.cos(a) * d +
        'px;--y:' +
        Math.sin(a) * d +
        'px';
      res.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }
  showOverlay('Sandıktan ne çıkacak?', [wheel, res, ok, skip], 'poi');
  timers.push(
    setTimeout(() => {
      strip.style.transition = 'transform 3.6s cubic-bezier(.12,.75,.12,1)';
      strip.style.transform = pos();
    }, 40),
  );
  for (let t = 0, gap = 55; t < 3500; t += gap, gap *= 1.09)
    timers.push(setTimeout(() => sfx('click'), t)); // tık sesleri yavaşlar
  timers.push(setTimeout(() => finish(false), 3800));
}
