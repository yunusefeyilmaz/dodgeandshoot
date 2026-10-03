import { state } from '../core/state.js';
import { UPGRADES } from '../data/upgrades.js';
import {
  buy as buyUp,
  costOf,
  levelOf,
  isMax,
  weaponUpgrades,
} from '../systems/upgrades.js';
import { sfx } from '../core/audio.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
import { renderTree } from './tree.js';
// Oyun içi coin mağazası: ağaç şeklinde
export function openShop() {
  const el = document.createElement('div'),
    nodes = weaponUpgrades().concat(UPGRADES);
  el.className = 'treewrap';
  const draw = () => {
    document.getElementById('ovt').textContent =
      'Mağaza — ' + state.coins + ' coin';
    renderTree(el, nodes, {
      level: (n) => levelOf(n.id),
      can: (n) => !isMax(n) && state.coins >= costOf(n),
      sub: (n) =>
        'Sv ' +
        levelOf(n.id) +
        (n.max ? '/' + n.max : '') +
        ' · ' +
        (isMax(n) ? 'MAX' : costOf(n) + ' coin'),
      tip: (n) =>
        '<b>' +
        n.name +
        '</b><div>' +
        n.desc +
        '</div><div class="dim">Seviye ' +
        levelOf(n.id) +
        (n.max ? '/' + n.max : '') +
        ' · ' +
        (isMax(n) ? 'MAX' : 'Maliyet: ' + costOf(n) + ' coin') +
        '</div>' +
        (n.tag ? '<div class="dim">Sadece ' + n.tag + ' için</div>' : ''),
      buy: (n) => {
        if (buyUp(n)) sfx('click');
      },
      rerender: draw,
    });
  };
  showOverlay('Mağaza', [el, btn('Kapat [B]', hideOverlay)], 'shop');
  draw();
}
