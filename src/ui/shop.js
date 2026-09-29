import { state } from '../core/state.js';
import { UPGRADES } from '../data/upgrades.js';
import { buy, costOf, levelOf, isMax } from '../systems/upgrades.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
export function openShop() {
  const nodes = UPGRADES.map(u => btn(
    '<b>' + u.name + ' (Sv ' + levelOf(u.id) + (u.max ? '/' + u.max : '') + ')</b>' + u.desc + '<br>' + (isMax(u) ? 'MAX' : costOf(u) + ' coin'),
    () => { buy(u); openShop(); }, isMax(u) || state.coins < costOf(u)));
  nodes.push(btn('Kapat', hideOverlay));
  showOverlay('Yükseltmeler — ' + state.coins + ' coin', nodes);
}
