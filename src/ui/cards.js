import { state, toast } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addPart } from '../core/entity.js';
import { RARITIES, weightOf, rarityBoost, tierOdds } from '../core/rarity.js';
import { discover } from '../core/save.js';
import { sfx } from '../core/audio.js';
import { CARDS } from '../data/cards.js';
import { CLASSES } from '../data/classes.js';
import { addClass } from '../systems/classes.js';
import { weaponUpgrades, freeLevel, isMax } from '../systems/upgrades.js';
import { xpNeed } from '../systems/rewards.js';
import { burst, ring } from '../systems/fx.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
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

export function buildPool() {
  // bu an seçilebilir kartlar (yasaklılar, koşullar, evrim şartları dahil)
  const p = state.player,
    pool = [];
  for (const c of CARDS) {
    if (c.part?.ability && p.abilities.includes(c.part.ability)) continue;
    const n = state.picked.filter((x) => x === c.name).length;
    if (c.max ? n >= c.max : n && !c.repeat) continue;
    if (c.requires && !state.picked.includes(c.requires)) continue;
    if (c.needs && !c.needs.every((x) => state.picked.includes(x))) continue; // EVRİM: iki kartın ikisi de gerekir
    if (c.cond && !c.cond()) continue;
    if (state.banned.includes(c.name)) continue;
    pool.push({ ...c, apply: c.apply || (() => addPart(p, c.part)) });
  }
  for (const u of weaponUpgrades())
    if (!isMax(u))
      pool.push({
        name: 'Silah: ' + u.name,
        desc: u.desc,
        rarity: u.rarity,
        kind: 'Silah',
        apply: () => freeLevel(u),
      });
  return pool;
}
export function openCards() {
  const p = state.player;
  state.xp -= xpNeed();
  state.level++;
  ring(p.x, p.y, 140, '#e0b040');
  burst(p.x, p.y, '#e0b040', 28, 280, 0.8);
  sfx('level');
  showCards(false, true);
}
let cur = null; // ekrandaki kartlar: yasak modu / iptal bunları DEĞİŞTİRMEZ, sadece Yenile (hak harcar) yeniler
export const getCur = () => cur;
function drawPicks() {
  const boost = rarityBoost(),
    pool = buildPool(),
    evo = pool.find((c) => c.evo);
  return evo
    ? [
        evo,
        ...pickWeighted(
          pool.filter((c) => c !== evo),
          2,
          boost,
        ),
      ]
    : pickWeighted(pool, 3, boost);
}
export function banPick(i) {
  // seçilen kartı bir daha çıkmayacak şekilde yasakla; sadece onun yerine yenisi gelir
  const c = cur[i];
  state.banned.push(c.name);
  state.banishes--;
  toast('Yasaklandı: ' + c.name);
  const rest = buildPool().filter((x) => !cur.some((y) => y.name === x.name)),
    [n] = pickWeighted(rest, 1, rarityBoost());
  if (n) cur[i] = n;
  else cur.splice(i, 1);
}
function showCards(ban, fresh) {
  if (fresh || !cur) cur = drawPicks();
  if (!cur.length) {
    cur = null;
    return hideOverlay();
  }
  const boost = rarityBoost(),
    nodes = cur.map((c, i) =>
      cardEl(c, () => {
        if (ban) {
          banPick(i);
          return showCards(false);
        }
        c.apply();
        state.picked.push(c.name);
        if (c.codex) discover('cards', c.name, c.name, 'Kart');
        if (c.evo) {
          toast('EVRİM! ' + c.name);
          ring(state.player.x, state.player.y, 200, '#ff5fd2');
          burst(state.player.x, state.player.y, '#ff5fd2', 40, 360, 0.9);
        }
        cur = null;
        hideOverlay();
      }),
    );
  const odds = document.createElement('div');
  odds.style.cssText =
    'flex-basis:100%;text-align:center;font-size:12px;color:#9aa3b5;line-height:1.7';
  odds.innerHTML =
    'Çıkma ihtimalleri <small>(şans bonusu ' +
    boost.toFixed(1) +
    ' = luck + tur + boss)</small><br>' +
    tierOdds(buildPool(), boost)
      .map(
        (t) =>
          '<span style="color:' +
          t.col +
          '">' +
          t.name +
          ' %' +
          (t.p >= 1
            ? t.p.toFixed(1)
            : t.p >= 0.01
              ? t.p.toFixed(2)
              : t.p.toFixed(4)) +
          '</span>',
      )
      .join(' · ');
  nodes.push(odds);
  nodes.push(
    btn(
      '🔄 Yenile (' + state.rerolls + ')',
      () => {
        state.rerolls--;
        showCards(false, true);
      },
      state.rerolls < 1 || !!ban,
    ),
  );
  nodes.push(
    btn(
      ban ? 'İptal' : '🚫 Yasakla (' + state.banishes + ')',
      () => showCards(!ban),
      !ban && state.banishes < 1,
    ),
  );
  showOverlay(
    ban
      ? 'Hangi kartı bir daha görmek istemiyorsun?'
      : 'Seviye ' + state.level + ' — bir kart seç',
    nodes,
    'cards',
  );
}

// Her 2 bossta bir: 2 sınıf'tan 1'ini seç (slot doluysa gelmez)
export function openClassPick() {
  const p = state.player;
  state.pendingClass = false;
  if (p.classes.length >= state.classSlots) return;
  const pool = Object.entries(CLASSES)
    .filter(([id]) => !p.classes.includes(id))
    .map(([id, c]) => ({ id, ...c, kind: 'Sınıf' }));
  const picks = pickWeighted(pool, 2, rarityBoost());
  if (!picks.length) return;
  ring(p.x, p.y, 160, '#b86bff');
  sfx('level');
  showOverlay(
    'Sınıf seç — 1 tanesini al',
    picks.map((c) =>
      cardEl(c, () => {
        addClass(c.id);
        hideOverlay();
      }),
    ),
    'class',
  );
}
