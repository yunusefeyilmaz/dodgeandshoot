import { state, W, H } from './core/state.js';
import { make, addPart } from './core/entity.js';
import { upgradePart } from './systems/upgrades.js';
import { updatePlayer } from './systems/player.js';
import { updateCombat } from './systems/combat.js';
import { updateWaves } from './systems/waves.js';
import { updatePickups, xpNeed } from './systems/rewards.js';
import { updateTracking } from './systems/tracking.js';
import { render } from './systems/render.js';
import { initHud, updateHud } from './ui/hud.js';
import { openCards, openClassPick } from './ui/cards.js';
import { openMenu } from './ui/menu.js';
import './ui/achievements.js';

const player = make({
  team: 'p',
  classes: [],
  x: W / 2,
  y: H / 2,
  r: 11,
  hp: 100,
  base: { speed: 170, magnet: 70, critChance: 0.05, knockback: 180 },
});
addPart(player, upgradePart);
state.player = player;
state.ents.push(player);
state.mode = 'menu';
state.paused = true; // menüden silah seçilince startRun() oyunu başlatır
initHud();
openMenu();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.mode === 'run' && !state.paused && !state.over) {
    updateWaves(dt);
    updatePlayer(dt);
    updateCombat(dt);
    updatePickups(dt);
    updateTracking(dt);
    if (state.xp >= xpNeed()) openCards();
    else if (state.pendingClass) openClassPick();
  }
  render();
  updateHud();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
