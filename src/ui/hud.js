import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { CLASSES } from '../data/classes.js';
import { startWave } from '../systems/waves.js';
import { openShop } from './shop.js';
import { picked } from './cards.js';
const $ = (id) => document.getElementById(id);
export function initHud() {
  $('startBtn').onclick = startWave;
  $('shopBtn').onclick = () => state.weapon && openShop();
  $('auto').onchange = (e) => (state.wave.auto = e.target.checked);
}
export function updateHud() {
  const p = state.player,
    w = state.wave,
    f = (n, d = 0) => stat(p, n).toFixed(d),
    pc = (n) => (stat(p, n) * 100).toFixed(1);
  $('coins').textContent = 'Coin: ' + state.coins;
  $('wave').textContent =
    'Tur: ' + w.n + (w.phase === 'active' ? ' (devam ediyor)' : '');
  $('startBtn').disabled = w.phase === 'active' || state.over || !state.weapon;
  $('inv').innerHTML = state.inventory
    .map(
      (i) =>
        '<div class="slot' +
        (i ? ' on' : '') +
        '">' +
        (i ? i.name : '') +
        '</div>',
    )
    .join('');
  $('cards').innerHTML =
    picked.map((c) => '<span>' + c + '</span>').join('') || '—';
  $('stats').innerHTML =
    'Class (' +
    p.classes.length +
    '/' +
    state.classSlots +
    '): ' +
    (p.classes.map((c) => CLASSES[c].name).join(', ') || '—') +
    (state.combos.length ? ' · Combo: ' + state.combos.join(', ') : '') +
    '<br>Skiller: ' +
    p.abilities.map((a) => a.name).join(', ') +
    '<br>AD ' +
    f('ad') +
    ' · AP ' +
    f('ap') +
    ' · Kritik %' +
    pc('critChance') +
    ' x' +
    f('critDmg', 2) +
    ' · Luck ' +
    f('luck', 1) +
    '<br>Zırh ' +
    f('armor') +
    ' · MR ' +
    f('mr') +
    ' · Zırh delme %' +
    pc('armorPen') +
    ' · Lethality ' +
    f('lethality');
}
