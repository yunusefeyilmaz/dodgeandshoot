import { state, W, H } from './core/state.js';
import { make, addPart } from './core/entity.js';
import { upgradePart } from './systems/upgrades.js';
import { updatePlayer } from './systems/player.js';
import { updatePets } from './systems/pets.js';
import { updateDash } from './systems/dash.js';
import { updatePois } from './systems/pois.js';
import { updateObjective } from './systems/objectives.js';
import { updateArena } from './systems/arena.js';
import { updateCombat } from './systems/combat.js';
import { updateWaves } from './systems/waves.js';
import { updatePickups, xpNeed } from './systems/rewards.js';
import { updateTracking } from './systems/tracking.js';
import { updateCharacter } from './systems/characters.js';
import { updateMusic } from './core/music.js';
import { sampleQuality } from './core/quality.js';
import { render, setScale } from './systems/render.js';
import { meta } from './core/save.js';
import { initHud, updateHud } from './ui/hud.js';
import { openCards, openClassPick } from './ui/cards.js';
import { openMenu } from './ui/menu.js';
import { MAPS } from './data/maps.js';
import './ui/achievements.js';
import './i18n/index.js';

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
state.map = MAPS.forest;
state.mode = 'menu';
state.paused = true; // menüden silah seçilince startRun() oyunu başlatır
initHud();
openMenu();

// SABİT ZAMAN ADIMI: oyun her zaman 1/60 sn'lik adımlarla ilerler (kare hızı düşse bile yavaş çekim olmaz, cooldown'lar şaşmaz)
const STEP = 1 / 240;
let last = null,
  acc = 0;
function step() {
  const dt =
    STEP * (state.slowT > 0 ? 0.35 : 1) * (state.hitstop > 0 ? 0.06 : 1);
  state.slowT = Math.max(0, (state.slowT || 0) - STEP);
  state.hitstop = Math.max(0, (state.hitstop || 0) - STEP); // hit-stop: kritik/boss ölümünde kısa donma     // mükemmel kaçışta zaman yavaşlar
  updateWaves(dt);
  updatePlayer(dt);
  updateDash(dt);
  updatePois(dt);
  updateObjective(dt);
  updatePets(dt);
  updateCombat(dt);
  updateCharacter(dt);
  updateArena(dt);
  updatePickups(dt);
  updateTracking(dt);
  if (state.xp >= xpNeed()) openCards();
  else if (state.pendingClass) openClassPick();
}
let lastR = 0,
  prevR = 0,
  hudN = 0,
  fpsEl = null,
  fpsT = 0,
  fpsN = 0;
function loop(now) {
  if (last === null) last = now; // ilk kare: zaman tabanı ne olursa olsun güvenli
  acc += Math.max(0, Math.min(0.25, (now - last) / 1000));
  last = now; // negatif/çok büyük süreler (sekme dönüşü) yok sayılır
  let did = 0;
  for (let n = 0; acc >= STEP && n < 3; n++) {
    // bir karede en fazla 3 adım: ağır sahnede sarmal yerine oyun hafifçe yavaşlar
    acc -= STEP;
    if (state.mode === 'run' && !state.paused && !state.over) {
      step();
      did++;
      if (state.paused) {
        acc = 0;
        break;
      }
    }
  }
  if (acc > STEP * 3) acc = 0;
  // Sadece yeni simülasyon adımı varsa çiz (144 Hz ekranda boşa çizim yok); duraklatılmış/menüde 10 Hz yeter
  if (did || now - lastR > 100) {
    if (did && state.mode === 'run' && prevR)
      sampleQuality(now, now - prevR, setScale);
    prevR = did ? now : 0;
    lastR = now;
    render();
    if (++hudN % 3 === 0 || !did) updateHud(); // HUD 20 Hz: DOM yazımları pahalı
    if (meta.settings.fps) {
      fpsN++;
      if (now - fpsT > 500) {
        if (!fpsEl) {
          fpsEl = document.createElement('div');
          fpsEl.style.cssText =
            'position:fixed;right:6px;bottom:4px;font:11px monospace;color:#9f9;background:#0008;padding:2px 6px;z-index:99;pointer-events:none';
          document.body.appendChild(fpsEl);
        }
        fpsEl.style.display = 'block';
        fpsEl.textContent =
          Math.round((fpsN * 1000) / (now - fpsT)) +
          ' fps · çözünürlük ' +
          Math.round(state.view.scale * 100) +
          '% · efekt ' +
          Math.round((state.fxQ ?? 1) * 100) +
          '%';
        fpsN = 0;
        fpsT = now;
      }
    } else if (fpsEl) fpsEl.style.display = 'none';
  }
  updateMusic();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
