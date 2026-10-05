import { state, W, H } from './core/state.js';
import { make, addPart } from './core/entity.js';
import { upgradePart } from './systems/upgrades.js';
import { updatePlayer } from './systems/player.js';
import { updatePets } from './systems/pets.js';
import { updateDash } from './systems/dash.js';
import { updatePois } from './systems/pois.js';
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

// SABİT ZAMAN ADIMI: oyun her zaman 1/60 sn'lik adımlarla ilerler (kare hızı düşse bile yavaş çekim olmaz, cooldown'lar şaşmaz)
const STEP = 1 / 60;
let last = null,
  acc = 0;
function step() {
  const dt = STEP * (state.slowT > 0 ? 0.35 : 1);
  state.slowT = Math.max(0, (state.slowT || 0) - STEP); // mükemmel kaçışta zaman yavaşlar
  updateWaves(dt);
  updatePlayer(dt);
  updateDash(dt);
  updatePois(dt);
  updatePets(dt);
  updateCombat(dt);
  updatePickups(dt);
  updateTracking(dt);
  if (state.xp >= xpNeed()) openCards();
  else if (state.pendingClass) openClassPick();
}
function loop(now) {
  if (last === null) last = now; // ilk kare: zaman tabanı ne olursa olsun güvenli
  acc += Math.max(0, Math.min(0.25, (now - last) / 1000));
  last = now; // negatif/çok büyük süreler (sekme dönüşü) yok sayılır
  for (let n = 0; acc >= STEP && n < 5; n++) {
    // bir karede en fazla 5 adım (ağır sahnede sarmal olmasın)
    acc -= STEP;
    if (state.mode === 'run' && !state.paused && !state.over) {
      step();
      if (state.paused) {
        acc = 0;
        break;
      }
    }
  }
  if (acc > STEP * 5) acc = 0;
  render();
  updateHud();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
