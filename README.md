import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { startWave } from '../systems/waves.js';
import { openShop } from './shop.js';
import { picked } from './cards.js';
const $ = id => document.getElementById(id);
export function initHud() {
  $('startBtn').onclick = startWave;
  $('shopBtn').onclick = openShop;
  $('auto').onchange = e => state.wave.auto = e.target.checked;
}
export function updateHud() {
  const p = state.player, w = state.wave;
  $('coins').textContent = 'Coin: ' + state.coins;
  $('wave').textContent = 'Tur: ' + w.n + (w.phase === 'active' ? ' (devam ediyor)' : '');
  $('startBtn').disabled = w.phase === 'active' || state.over;
  $('inv').innerHTML = state.inventory.map(i => '<div class="slot' + (i ? ' on' : '') + '">' + (i ? i.name : '') + '</div>').join('');
  $('cards').innerHTML = picked.map(c => '<span>' + c + '</span>').join('') || '—';
  const f = (n, d = 0) => stat(p, n).toFixed(d);
  $('stats').innerHTML = 'Skiller: ' + p.abilities.map(a => a.name).join(', ') +
    '<br>Kritik: %' + (stat(p, 'critChance') * 100).toFixed(0) + ' x' + f('critDmg', 2) +
    ' · Zırh delme: %' + (stat(p, 'armorPen') * 100).toFixed(0) + ' · Zırh: ' + f('armor') + ' · Magnet: ' + f('magnet');
}
