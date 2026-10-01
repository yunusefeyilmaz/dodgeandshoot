import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { RARITIES, weightOf } from '../core/rarity.js';
import { addPart } from '../core/entity.js';
import { CARDS } from '../data/cards.js';
import { CLASSES } from '../data/classes.js';
import { WEAPONS } from '../data/weapons.js';
import { addClass } from '../systems/classes.js';
import { weaponUpgrades, freeLevel, isMax } from '../systems/upgrades.js';
import { xpNeed } from '../systems/rewards.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
export const picked = [];

export function openWeaponPick() {
  showOverlay(
    'Silah seç',
    Object.entries(WEAPONS).map(([id, w]) =>
      btn('<b>' + w.name + '</b>' + w.desc, () => {
        state.weapon = id;
        addPart(state.player, { ability: w.ability });
        hideOverlay();
      }),
    ),
  );
}

export function openCards() {
  const p = state.player,
    luck = stat(p, 'luck');
  state.xp -= xpNeed();
  state.level++;
  const free = p.classes.length < state.classSlots,
    pool = [];
  if (free)
    for (const id in CLASSES)
      if (!p.classes.includes(id))
        pool.push({
          name: 'Class: ' + CLASSES[id].name,
          desc: CLASSES[id].desc,
          cls: 1,
          rarity: 'rare',
          apply: () => addClass(id),
        });
  for (const c of CARDS)
    if (
      !(c.part?.ability && p.abilities.includes(c.part.ability)) &&
      !(c.max && picked.filter((n) => n === c.name).length >= c.max)
    )
      pool.push({ ...c, apply: c.apply || (() => addPart(p, c.part)) });
  for (const u of weaponUpgrades())
    if (!isMax(u))
      pool.push({
        name: 'Silah: ' + u.name,
        desc: u.desc,
        rarity: u.rarity,
        apply: () => freeLevel(u),
      });
  const picks = [],
    take = (c) => {
      picks.push(c);
      pool.splice(pool.indexOf(c), 1);
    };
  if (free) {
    const cl = pool.filter((c) => c.cls);
    take(cl[Math.floor(Math.random() * cl.length)]);
  } // boş slot varken en az 1 class kartı gelir
  const w = (c) => weightOf(c.rarity, luck); // luck nadir kartların ağırlığını artırır
  while (picks.length < 3 && pool.length) {
    let r = Math.random() * pool.reduce((s, c) => s + w(c), 0);
    take(pool.find((c) => (r -= w(c)) <= 0) || pool[0]);
  }
  showOverlay(
    'Level ' + state.level + ' — bir kart seç',
    picks.map((c) =>
      btn(
        '<b>' +
          c.name +
          '</b><small style="color:' +
          RARITIES[c.rarity || 'common'].col +
          '">' +
          RARITIES[c.rarity || 'common'].name +
          '</small><br>' +
          c.desc,
        () => {
          c.apply();
          picked.push(c.name);
          hideOverlay();
        },
        false,
        RARITIES[c.rarity || 'common'].col,
      ),
    ),
  );
}
