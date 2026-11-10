import { setTip } from './tooltip.js';
// Yetenek ağacı (Yükseltmeler, silah ağacı, karakter ağacı ortak bileşeni). Kökler görünür, bir düğüm açılınca çocukları belirir;
// bir adım ötesi kilitli "???" silüeti olarak görünür (merak). api: {icon, level, can, sub, tip, buy, rerender, max?, cost?, detail?}
const NW = 214,
  NH = 80,
  GX = 256,
  GY = 98;
export function renderTree(el, nodes, api) {
  const by = {},
    kids = {};
  nodes.forEach((n) => {
    by[n.id] = n;
    (kids[n.parent || ''] ??= []).push(n);
  });
  const pos = {};
  let row = 0;
  const place = (n, d) => {
    const c = kids[n.id] || [];
    if (!c.length) pos[n.id] = { d, r: row++ };
    else {
      c.forEach((x) => place(x, d + 1));
      const rs = c.map((x) => pos[x.id].r);
      pos[n.id] = { d, r: (Math.min(...rs) + Math.max(...rs)) / 2 };
    }
  };
  (kids[''] || []).forEach((n) => place(n, 0));
  const vis = (n) => !n.parent || api.level(by[n.parent]) > 0,
    ghost = (n) => !vis(n) && vis(by[n.parent]);
  const D = Math.max(...Object.values(pos).map((p) => p.d)) + 1,
    Wd = D * GX - (GX - NW) + 8,
    Ht = Math.max(1, row) * GY - (GY - NH) + 8;
  let svg = '';
  for (const n of nodes)
    if (n.parent && (vis(n) || ghost(n))) {
      const a = pos[n.parent],
        b = pos[n.id],
        x1 = a.d * GX + NW,
        y1 = a.r * GY + NH / 2,
        x2 = b.d * GX,
        y2 = b.r * GY + NH / 2,
        mx = (x1 + x2) / 2,
        on = vis(n) && api.level(n) > 0;
      svg += `<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" class="${on ? 'edge on' : 'edge'}"/>`;
    }
  const box = document.createElement('div');
  box.className = 'treebox';
  box.style.cssText = `width:${Wd}px;height:${Ht}px`;
  box.innerHTML = `<svg width="${Wd}" height="${Ht}">${svg}</svg>`;
  for (const n of nodes) {
    if (!vis(n) && !ghost(n)) continue;
    const p = pos[n.id],
      d = document.createElement('div'),
      g = ghost(n),
      lv = g ? 0 : api.level(n),
      mx = !g && api.max ? api.max(n) : 0,
      can = !g && api.can(n),
      maxed = mx > 0 && lv >= mx;
    d.className =
      'tn' +
      (g ? ' ghost' : lv > 0 ? ' own' : '') +
      (can ? ' can' : '') +
      (maxed ? ' maxed' : '');
    d.style.cssText = `left:${p.d * GX}px;top:${p.r * GY}px;width:${NW}px;height:${NH}px`;
    const cost = !g && api.cost ? api.cost(n) : '';
    d.innerHTML = g
      ? '<div class="tn-ico">🔒</div><div class="tn-main"><b>???</b><small>Üstteki yeteneği aç</small></div>'
      : `<div class="tn-ico">${api.icon ? api.icon(n) : ''}${lv > 0 ? '<i class="tn-lv">' + (maxed ? '✔' : lv) + '</i>' : ''}</div><div class="tn-main"><b>${n.name}</b>${mx > 1 ? '<div class="tn-bar"><i style="width:' + Math.min(100, (100 * lv) / mx) + '%"></i></div>' : ''}<small>${api.sub(n)}</small></div>${cost && !maxed ? '<span class="tn-cost ' + (can ? 'ok' : 'no') + '">' + cost + '</span>' : ''}`;
    if (!g) {
      d.onmouseenter = () => {
        if (api.detail) api.detail.innerHTML = api.tip(n);
        else setTip(() => api.tip(n));
      };
      d.onmouseleave = () => {
        if (!api.detail) setTip(null);
      };
      d.onclick = () => {
        const touchy = document.body.classList.contains('touch') && api.detail;
        if (touchy && el._sel !== n.id) {
          // dokunmatik: ilk dokunuş = seç ve detayı göster (hover yok)
          el._sel = n.id;
          el.querySelectorAll('.tn.sel').forEach((x) =>
            x.classList.remove('sel'),
          );
          d.classList.add('sel');
          api.detail.innerHTML =
            api.tip(n) +
            (api.can(n)
              ? '<button class="buybtn go">Satın al</button>'
              : '<div class="dim" style="margin-top:6px">' +
                (api.level(n) > 0 && api.max && api.level(n) >= api.max(n)
                  ? '✔ Tamamlandı'
                  : 'Henüz alınamaz') +
                '</div>');
          const bb = api.detail.querySelector('.buybtn');
          if (bb)
            bb.onclick = (e) => {
              e.stopPropagation();
              if (api.can(n)) {
                api.buy(n);
                d.classList.add('bought');
                api.rerender();
              }
            };
          return;
        }
        if (api.can(n)) {
          api.buy(n);
          setTip(null);
          d.classList.add('bought');
          api.rerender();
        }
      };
    }
    box.appendChild(d);
  }
  el.replaceChildren(box);
  if (el._sel && api.detail) {
    const sn = by[el._sel],
      dn = [...box.children].find(
        (x) =>
          x.classList &&
          x.classList.contains('tn') &&
          x.querySelector('b') &&
          sn &&
          x.querySelector('b').textContent === sn.name,
      );
    if (dn) {
      dn.classList.add('sel');
      if (sn && api.detail && document.body.classList.contains('touch')) {
        api.detail.innerHTML =
          api.tip(sn) +
          (api.can(sn) ? '<button class="buybtn go">Satın al</button>' : '');
        const bb = api.detail.querySelector('.buybtn');
        if (bb)
          bb.onclick = () => {
            if (api.can(sn)) {
              api.buy(sn);
              api.rerender();
            }
          };
      }
    }
  }
  if (!el._pan) {
    // boş alandan sürükleyerek kaydırma
    el._pan = 1;
    let sx,
      sy,
      sl,
      st,
      on = false;
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tn')) return;
      on = true;
      sx = e.clientX;
      sy = e.clientY;
      sl = el.scrollLeft;
      st = el.scrollTop;
      el.classList.add('panning');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!on) return;
      el.scrollLeft = sl - (e.clientX - sx);
      el.scrollTop = st - (e.clientY - sy);
    });
    const end = () => {
      on = false;
      el.classList.remove('panning');
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
}
