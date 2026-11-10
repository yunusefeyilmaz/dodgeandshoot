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
import { updateGoals } from './systems/progress.js';
import { updateCollisions } from './systems/collide.js';
import { updateMusic } from './core/music.js';
import { sampleQuality } from './core/quality.js';
import { initTouch, updateTouch } from './ui/touch.js';
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

// GERÇEK ZAMANLI ADIM: oyun, ekranın kare süresi kadar ilerler (144 Hz ekranda 144 adım/sn, 60 Hz'de 60). Kare uzunsa en çok 1/60 sn'lik alt adımlara
// bölünür (çarpışma/mermi tünellemesi olmasın). Böylece fps ne olursa olsun oyun gerçek hızda akar: ne yavaş çekim, ne fps tavanı. 15 fps altında oyun yavaşlar.
const MAX_SUB = 1 / 60,
  MAX_FRAME = 1 / 15;
let last = null;
function step(h) {
  const dt = h;
  state.dt = dt;
  state.clock = (state.clock || 0) + dt; // oyun HER ZAMAN gerçek hızda akar: yavaş çekim / hit-stop yok (kaçış, kritik, boss ölümü, hasar yemek zamanı yavaşlatmaz)
  updateWaves(dt);
  updatePlayer(dt);
  updateDash(dt);
  updatePois(dt);
  updateObjective(dt);
  updatePets(dt);
  updateCombat(dt);
  updateCollisions();
  updateCharacter(dt);
  updateArena(dt);
  updatePickups(dt);
  updateTracking(dt);
  state.goalT = (state.goalT || 0) - dt;
  if (state.goalT <= 0) {
    state.goalT = 0.5;
    updateGoals();
  }
  if (state.freeCards > 0 && state.wave.n === 0 && !state.paused) {
    state.freeCards--;
    state.xp += xpNeed();
  } // rütbe ödülü: koşuya ücretsiz kartla başla
  if (state.xp >= xpNeed()) openCards();
  else if (state.pendingClass) openClassPick();
}
let lastR = 0,
  prevR = 0,
  lastHud = 0,
  fpsEl = null,
  fpsT = 0,
  fpsN = 0;
function loop(now) {
  if (last === null) last = now; // ilk kare: zaman tabanı ne olursa olsun güvenli
  const ft = Math.max(0, Math.min(MAX_FRAME, (now - last) / 1000));
  last = now; // negatif/çok büyük süreler (sekme dönüşü) kırpılır
  let did = false;
  if (state.mode === 'run' && !state.paused && !state.over && ft > 0) {
    const n = Math.max(1, Math.ceil(ft / MAX_SUB - 0.05)),
      h = ft / n; // 60 Hz'de 1 adım, 30 fps'te 2 alt adım, 144 Hz'de 1 küçük adım
    for (let i = 0; i < n; i++) {
      step(h);
      did = true;
      if (state.paused || state.over) break;
    }
  }
  // Çizim: simülasyon ilerlediyse her ekran karesinde (maksimum akıcılık); duraklatılmış/menüde 10 Hz yeter
  if (did || now - lastR > 100) {
    if (did && state.mode === 'run' && prevR)
      sampleQuality(now, now - prevR, setScale);
    prevR = did ? now : 0;
    lastR = now;
    render();
    if (now - lastHud >= 45 || !did) {
      state.hudDt = Math.min(0.25, (now - lastHud) / 1000);
      lastHud = now;
      updateHud();
    } // HUD ~20 Hz: DOM yazımları pahalı
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
  updateTouch();
  updateMusic();
  requestAnimationFrame(loop);
}
initTouch();
requestAnimationFrame(loop);
