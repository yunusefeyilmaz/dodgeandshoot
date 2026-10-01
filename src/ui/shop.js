import { state } from '../core/state.js';
import { UPGRADES } from '../data/upgrades.js';
import { WEAPONS } from '../data/weapons.js';
import {
  buy,
  costOf,
  levelOf,
  isMax,
  weaponUpgrades,
} from '../systems/upgrades.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
const sec = (t) => {
  const d = document.createElement('div');
  d.style.cssText = 'flex-basis:100%;color:#9aa3b5;font-size:13px';
  d.textContent = t;
  return d;
};
const item = (u) =>
  btn(
    '<b>' +
      u.name +
      ' (Sv ' +
      levelOf(u.id) +
      (u.max ? '/' + u.max : '') +
      ')</b>' +
      u.desc +
      '<br>' +
      (isMax(u) ? 'MAX' : costOf(u) + ' coin'),
    () => {
      buy(u);
      openShop();
    },
    isMax(u) || state.coins < costOf(u),
  );
export function openShop() {
  showOverlay(
    'Yükseltmeler — ' + state.coins + ' coin',
    [
      sec('Silah: ' + WEAPONS[state.weapon].name),
      ...weaponUpgrades().map(item),
      sec('Statlar'),
      ...UPGRADES.map(item),
      btn('Kapat [B]', hideOverlay),
    ],
    'shop',
  );
}
