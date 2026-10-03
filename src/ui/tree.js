import { setTip } from './tooltip.js';
// Yetenek ağacı: kökler görünür, bir düğüm açılınca çocukları belirir; bir adım ötesi "???" silüeti olarak görünür.
const NW = 172,
  NH = 66,
  GX = 214,
  GY = 82;
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
    Wd = D * GX,
    Ht = Math.max(1, row) * GY;
  let svg = '';
  for (const n of nodes)
    if (n.parent && (vis(n) || ghost(n))) {
      const a = pos[n.parent],
        b = pos[n.id],
        x1 = a.d * GX + NW,
        y1 = a.r * GY + NH / 2,
        x2 = b.d * GX,
        y2 = b.r * GY + NH / 2,
        mx = (x1 + x2) / 2;
      svg += `<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="${vis(n) && api.level(n) > 0 ? '#e0b040' : '#555'}" stroke-width="2"/>`;
    }
  const box = document.createElement('div');
  box.className = 'treebox';
  box.style.cssText = `width:${Wd}px;height:${Ht}px`;
  box.innerHTML = `<svg width="${Wd}" height="${Ht}">${svg}</svg>`;
  for (const n of nodes) {
    if (!vis(n) && !ghost(n)) continue;
    const p = pos[n.id],
      d = document.createElement('div'),
      g = ghost(n);
    d.className =
      'tn' +
      (g ? ' ghost' : api.level(n) > 0 ? ' own' : '') +
      (!g && api.can(n) ? ' can' : '');
    d.style.cssText = `left:${p.d * GX}px;top:${p.r * GY}px;width:${NW}px;height:${NH}px`;
    d.innerHTML = g
      ? '<b>???</b><small>Üst yeteneği aç</small>'
      : `<b>${n.name}</b><small>${api.sub(n)}</small>`;
    if (!g) {
      d.onmouseenter = () => setTip(() => api.tip(n));
      d.onmouseleave = () => setTip(null);
      d.onclick = () => {
        if (api.can(n)) {
          api.buy(n);
          setTip(null);
          api.rerender();
        }
      };
    }
    box.appendChild(d);
  }
  el.replaceChildren(box);
}
