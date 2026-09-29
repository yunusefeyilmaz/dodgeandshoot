import { state } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { CARDS } from '../data/cards.js';
import { xpNeed } from '../systems/rewards.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
export const picked = [];
export function openCards() {
  const p = state.player;
  state.xp -= xpNeed();
  state.level++;
  const pool = CARDS.filter(
    (c) =>
      !(c.part.ability && p.abilities.includes(c.part.ability)) &&
      !(c.unique && p.parts.includes(c.part)),
  );
  const picks = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  showOverlay(
    'Level ' + state.level + ' — bir kart seç',
    picks.map((c) =>
      btn('<b>' + c.name + '</b>' + c.desc, () => {
        addPart(p, c.part);
        picked.push(c.name);
        hideOverlay();
      }),
    ),
  );
}
