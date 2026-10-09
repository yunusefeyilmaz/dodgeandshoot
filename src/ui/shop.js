import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { UPGRADES, stepAt } from '../data/upgrades.js';
import { WEAPONS } from '../data/weapons.js';
import { CAPS } from '../data/balance.js';
import { LABELS, DESCS, fmtStat, fmtMod } from '../core/labels.js';
import {
  buy as buyUp,
  costOf,
  levelOf,
  isMax,
  weaponUpgrades,
} from '../systems/upgrades.js';
import { petNodes } from '../systems/pets.js';
import { sfx } from '../core/audio.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
import { renderTree } from './tree.js';
// Yükseltmeler ekranı (ağaç). Tooltip: ne artıyor, şu anki -> sonraki değer, örnek hasar, maliyet.
const owner = (u) =>
  u.pet
    ? state.pets.find((x) => x.petId === u.pet) || state.player
    : state.player;
const nowNext = (u) => {
  const o = owner(u),
    tags = u.tag ? [u.tag] : [],
    cur = stat(o, u.stat, tags),
    st = stepAt(u, levelOf(u.id)),
    raw = u.op === 'add' ? cur + st : cur * st,
    cap = CAPS[u.stat];
  return [cur, cap !== undefined ? Math.min(cap, raw) : raw, st];
};
function example(u) {
  // saldırı gücü/büyü gücü/hasar çarpanı: silah vuruşunun hasarı kaçtan kaça çıkar
  if (!state.weapon || u.pet) return '';
  const p = state.player,
    w = WEAPONS[state.weapon].ability,
    f = w.effects[0],
    type = w.dmgType === 'magic' ? 'ap' : 'ad';
  if (u.stat === 'ad' || u.stat === 'ap') {
    if (u.stat !== type)
      return (
        '<div class="dim">' +
        w.name +
        ' ' +
        (type === 'ad' ? 'AD' : 'AP') +
        ' ile güçlenir; bu stat silahını değil diğer skillerini etkiler.</div>'
      );
  } else if (u.stat !== 'damage') return '';
  const [cur, nxt] = nowNext(u),
    base = stat(p, type),
    dm = stat(p, 'damage', w.tags),
    r = f.ratio ?? 1;
  const d0 = Math.round((f.damage + base * r) * dm),
    d1 =
      u.stat === 'damage'
        ? Math.round((((f.damage + base * r) * dm) / (cur || 1)) * nxt)
        : Math.round((f.damage + nxt * r) * dm);
  return (
    '<div>' + w.name + ' vuruşu: <b>' + d0 + ' → ' + d1 + '</b> hasar</div>'
  );
}
const tip = (n) => {
  const L = levelOf(n.id),
    [cur, nxt, st] = nowNext(n),
    step = fmtMod({ stat: n.stat, op: n.op, value: st });
  return (
    '<b>' +
    n.name +
    '</b> <small>Seviye ' +
    L +
    (n.max ? '/' + n.max : '') +
    '</small><div class="dim">' +
    (DESCS[n.stat] || '') +
    '</div>' +
    (isMax(n)
      ? '<div><b>MAKSİMUM seviye</b></div>'
      : '<div>Sonraki seviye: <b>' +
        step +
        '</b><br>' +
        LABELS[n.stat] +
        ': <b>' +
        fmtStat(n.stat, cur) +
        ' → ' +
        fmtStat(n.stat, nxt) +
        '</b></div>' +
        example(n) +
        '<div class="dim">Maliyet: ' +
        costOf(n) +
        ' altın</div>') +
    (n.tag
      ? '<div class="dim">Sadece ' +
        (WEAPONS[state.weapon] ? WEAPONS[state.weapon].name : n.tag) +
        ' için geçerli</div>'
      : '') +
    '<div class="dim">Her seviyede kazanç artar (+%8).</div>'
  );
};
export function openShop() {
  state.remindT = 40; // hatırlatma sayacı sıfırlanır
  const el = document.createElement('div'),
    nodes = weaponUpgrades().concat(UPGRADES, petNodes());
  el.className = 'treewrap';
  const draw = () => {
    document.getElementById('ovt').textContent =
      'Yükseltmeler — ' + state.coins + ' altın';
    renderTree(el, nodes, {
      level: (n) => levelOf(n.id),
      can: (n) => !isMax(n) && state.coins >= costOf(n),
      sub: (n) =>
        'Sv ' +
        levelOf(n.id) +
        (n.max ? '/' + n.max : '') +
        ' · ' +
        (isMax(n)
          ? 'MAX'
          : fmtMod({
              stat: n.stat,
              op: n.op,
              value: stepAt(n, levelOf(n.id)),
            }) +
            ' · ' +
            costOf(n) +
            ' altın'),
      tip,
      buy: (n) => {
        if (buyUp(n)) sfx('click');
      },
      rerender: draw,
    });
  };
  showOverlay('Yükseltmeler', [el, btn('Kapat [B]', hideOverlay)], 'shop');
  draw();
}
