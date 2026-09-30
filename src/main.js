import { state } from './core/state.js';
import { make, addPart } from './core/entity.js';
import { ABILITIES } from './data/abilities.js';
import { upgradePart } from './systems/upgrades.js';
import { updatePlayer } from './systems/player.js';
import { updateCombat } from './systems/combat.js';
import { updateWaves } from './systems/waves.js';
import { updatePickups, xpNeed } from './systems/rewards.js';
import { render } from './systems/render.js';
import { initHud, updateHud } from './ui/hud.js';
import { openCards, openWeaponPick } from './ui/cards.js';

const player = make({
  team: 'p',
  classes: [],
  x: 400,
  y: 250,
  r: 11,
  hp: 100,
  base: { speed: 170, magnet: 70, critChance: 0.05 },
});
addPart(player, { ability: ABILITIES.bolt });
addPart(player, upgradePart);
state.player = player;
state.ents.push(player);
initHud();
openWeaponPick();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!state.paused && !state.over) {
    updateWaves(dt);
    updatePlayer(dt);
    updateCombat(dt);
    updatePickups(dt);
    if (state.xp >= xpNeed()) openCards();
  }
  render();
  updateHud();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
