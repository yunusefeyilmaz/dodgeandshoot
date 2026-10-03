import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addPart } from '../core/entity.js';
import { RARITIES, weightOf } from '../core/rarity.js';
import { discover } from '../core/save.js';
import { sfx } from '../core/audio.js';
import { CARDS } from '../data/cards.js';
import { CLASSES } from '../data/classes.js';
import { addClass } from '../systems/classes.js';
import { weaponUpgrades, freeLevel, isMax } from '../systems/upgrades.js';
import { xpNeed } from '../systems/rewards.js';
import { burst, ring } from '../systems/fx.js';
import { showOverlay, hideOverlay } from './overlay.js';
import { setTip } from './tooltip.js';
export const picked = state.picked;

// Nadirliğe göre renkli kart
function cardEl(c, onPick) {
  const r = RARITIES[c.rarity || 'common'],
    d = document.createElement('div');
  d.className = 'card';
  d.style.setProperty('--c', r.col);
  d.innerHTML =
    '<small>' +
    r.name +
    (c.kind ? ' · ' + c.kind : '') +
    '</small><b>' +
    c.name +
    '</b><p>' +
    c.desc +
    '</p>' +
    (c.requires
      ? '<small style="color:#9aa3b5">Gerektirir: ' + c.requires + '</small>'
      : '');
  d.onclick = () => {
    sfx('click');
    setTip(null);
    onPick();
  };
  d.onmouseenter = () =>
    setTip(
      () =>
        '<b style="color:' +
        r.col +
        '">' +
        c.name +
        '</b> <small>' +
        r.name +
        '</small><div class="dim">' +
        c.desc +
        '</div>' +
        (c.requires
          ? '<div class="dim">Bağlı kart: ' + c.requires + ' gerekli</div>'
          : ''),
    );
  d.onmouseleave = () => setTip(null);
  return d;
}
function pickWeighted(pool, n, luck) {
  // luck yüksek nadirlikleri öne çıkarır
  const out = [],
    w = (c) => weightOf(c.rarity, luck);
  while (out.length < n && pool.length) {
    let x = Math.random() * pool.reduce((s, c) => s + w(c), 0);
    const c = pool.find((c) => (x -= w(c)) <= 0) || pool[0];
    out.push(c);
    pool.splice(pool.indexOf(c), 1);
  }
  return out;
}

export function openCards() {
  const p = state.player,
    luck = stat(p, 'luck');
  state.xp -= xpNeed();
  state.level++;
  ring(p.x, p.y, 140, '#e0b040');
  burst(p.x, p.y, '#e0b040', 28, 280, 0.8);
  sfx('level');
  const pool = [];
  for (const c of CARDS) {
    if (c.part?.ability && p.abilities.includes(c.part.ability)) continue;
    const n = state.picked.filter((x) => x === c.name).length;
    if (c.max ? n >= c.max : n && !c.repeat) continue;
    if (c.requires && !state.picked.includes(c.requires)) continue;
    pool.push({ ...c, apply: c.apply || (() => addPart(p, c.part)) });
  }
  for (const u of weaponUpgrades())
    if (!isMax(u) && (!u.parent || true))
      pool.push({
        name: 'Silah: ' + u.name,
        desc: u.desc,
        rarity: u.rarity,
        kind: 'Silah',
        apply: () => freeLevel(u),
      });
  showOverlay(
    'Level ' + state.level + ' — bir kart seç',
    pickWeighted(pool, 3, luck).map((c) =>
      cardEl(c, () => {
        c.apply();
        state.picked.push(c.name);
        if (c.codex) discover('cards', c.name, c.name, 'Kart');
        hideOverlay();
      }),
    ),
    'cards',
  );
}

// Her 2 bossta bir: 2 class'tan 1'ini seç (slot doluysa gelmez)
export function openClassPick() {
  const p = state.player;
  state.pendingClass = false;
  if (p.classes.length >= state.classSlots) return;
  const pool = Object.entries(CLASSES)
    .filter(([id]) => !p.classes.includes(id))
    .map(([id, c]) => ({ id, ...c, kind: 'Class' }));
  const picks = pickWeighted(pool, 2, stat(p, 'luck'));
  if (!picks.length) return;
  ring(p.x, p.y, 160, '#b86bff');
  sfx('level');
  showOverlay(
    'Class seç — 1 tanesini al',
    picks.map((c) =>
      cardEl(c, () => {
        addClass(c.id);
        hideOverlay();
      }),
    ),
    'class',
  );
}
