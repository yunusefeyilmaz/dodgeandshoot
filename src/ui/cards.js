import { state, toast } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addPart } from '../core/entity.js';
import { RARITIES, weightsFor, rarityBoost, tierOdds } from '../core/rarity.js';
import { discover, meta } from '../core/save.js';
import { sfx } from '../core/audio.js';
import { CARDS } from '../data/cards.js';
import { CLASSES } from '../data/classes.js';
import { addClass } from '../systems/classes.js';
import {
  weaponUpgrades,
  freeLevel,
  isMax,
  levelOf,
} from '../systems/upgrades.js';
import { stepAt } from '../data/upgrades.js';
import { xpNeed } from '../systems/rewards.js';
import { burst, ring } from '../systems/fx.js';
import { showOverlay, hideOverlay, btn, overlayKind } from './overlay.js';
import { setTip } from './tooltip.js';
import { previewParts, cardGlyph } from './icons.js';
import { LABELS, fmtStat } from '../core/labels.js';
import { powerRating, fmtPower } from '../systems/progress.js';
import {
  SYN,
  synPreview,
  evoHint,
  recount,
  tierFor,
} from '../systems/synergy.js';
export const picked = state.picked;

// ——— Kart bileşeni: nadirliğe göre çerçeve, büyük simge, stat farkı (önce → sonra), güç artışı, bağ (sinerji) kademesi, evrim ilerlemesi ———
const GOOD_LOW = new Set(['dashCdMul']);
function statChips(part) {
  if (!part || !part.mods || !part.mods.length) return '';
  const p = state.player,
    fake = { ...p, parts: [...p.parts, part] },
    seen = new Set();
  let h = '';
  for (const m of part.mods) {
    if (seen.has(m.stat) || seen.size >= 4) continue;
    seen.add(m.stat);
    const tg = m.tag ? [m.tag] : [],
      a = stat(p, m.stat, tg),
      b = stat(fake, m.stat, tg);
    if (Math.abs(a - b) < 1e-9) continue;
    const good = GOOD_LOW.has(m.stat) ? b < a : b > a;
    h +=
      '<span class="c2-chip ' +
      (good ? 'up' : 'down') +
      '"><i>' +
      (LABELS[m.stat] || m.stat) +
      (m.tag ? ' · ' + m.tag : '') +
      '</i><b>' +
      fmtStat(m.stat, a) +
      ' → ' +
      fmtStat(m.stat, b) +
      '</b></span>';
  }
  return h;
}
function cardEl(c, onPick, idx = 0) {
  const r = RARITIES[c.rarity || 'common'],
    d = document.createElement('div'),
    p = state.player,
    part = c.part;
  d.className = 'card2 t' + r.tier + (c.evo ? ' evo' : '');
  d.style.setProperty('--c', r.col);
  d.style.setProperty('--i', idx);
  const pw =
      part && part.mods
        ? powerRating({ ...p, parts: [...p.parts, part] }) - powerRating(p)
        : 0,
    isNew = c.codex && r.tier >= 2 && !meta.found.cards[c.name];
  const syn =
    c.part || c.id
      ? synPreview(c)
          .map((s) => {
            const S = SYN[s.tag];
            return (
              '<span class="c2-tag' +
              (s.up ? ' up' : '') +
              '" style="--tc:' +
              S.col +
              '">' +
              S.icon +
              ' ' +
              S.name +
              ' <b>' +
              s.n +
              ' → ' +
              s.after +
              '</b>' +
              (s.up
                ? ' <em>KADEME ' + 'I'.repeat(s.tier) + '!</em>'
                : s.need > 1
                  ? ' <small>(' +
                    s.need +
                    ' kart → ' +
                    SYN[s.tag].txt[tierFor(s.n + s.need) - 1].split(',')[0] +
                    ')</small>'
                  : '') +
              '</span>'
            );
          })
          .join('')
      : '';
  const ev = c.part ? evoHint(c) : null;
  d.innerHTML =
    '<div class="c2-fx"></div><div class="c2-top"><span class="c2-rar">' +
    r.name +
    '</span>' +
    (c.kind ? '<span class="c2-kind">' + c.kind + '</span>' : '') +
    (isNew ? '<span class="c2-new">YENİ</span>' : '') +
    '<kbd>' +
    (idx + 1) +
    '</kbd></div>' +
    '<div class="c2-art"><span>' +
    cardGlyph(c) +
    '</span></div><h3>' +
    c.name +
    '</h3><p>' +
    c.desc +
    '</p><div class="c2-chips">' +
    statChips(part) +
    '</div>' +
    (syn ? '<div class="c2-tags">' + syn + '</div>' : '') +
    (ev
      ? '<div class="c2-evo' +
        (ev.ready ? ' ready' : '') +
        '">★ Evrim → <b>' +
        ev.name +
        '</b> <span>' +
        '●'.repeat(ev.have) +
        '○'.repeat(ev.need - ev.have) +
        '</span></div>'
      : '') +
    (c.evo ? '<div class="c2-evo ready">★ EVRİM KARTI</div>' : '') +
    (pw > 0
      ? '<div class="c2-pwr">⚡ GÜÇ <b>+' + fmtPower(pw) + '</b></div>'
      : '') +
    (c.requires
      ? '<div class="c2-req">Gerektirir: ' + c.requires + '</div>'
      : '');
  d.onclick = () => {
    sfx('click');
    setTip(null);
    onPick();
  };
  d.onmouseenter = () => {
    setTip(() => previewParts(c.part) || null);
  };
  d.onmouseleave = () => setTip(null);
  return d;
}
function pickWeighted(pool, n, luck) {
  // kademe eğrisine göre ağırlıklı seçim (kademe başına eşitlenmiş)
  const out = [];
  while (out.length < n && pool.length) {
    const ws = weightsFor(pool, luck);
    let x = Math.random() * ws.reduce((a, b) => a + b, 0),
      i = ws.findIndex((w) => (x -= w) <= 0);
    if (i < 0) i = 0;
    out.push(pool.splice(i, 1)[0]);
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
        part: {
          mods: [
            {
              stat: u.stat,
              op: u.op,
              value: stepAt(u, levelOf(u.id)),
              tag: u.tag,
            },
          ],
        },
        apply: () => freeLevel(u),
      });
  return pool;
}
export function openCards() {
  ring(state.player.x, state.player.y, 170, '#ffd84f');
  burst(state.player.x, state.player.y, '#ffd84f', 26, 300, 0.7);
  state.flash = Math.max(state.flash, 0.25); // seviye atlama patlaması
  const p = state.player;
  state.xp -= xpNeed();
  state.level++;
  ring(p.x, p.y, 140, '#e0b040');
  burst(p.x, p.y, '#e0b040', 28, 280, 0.8);
  sfx('level');
  state.bannerQ.push({ text: 'SEVİYE ' + state.level, kind: 'level' });
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
      cardEl(
        c,
        () => {
          if (ban) {
            banPick(i);
            return showCards(false);
          }
          c.apply();
          state.picked.push(c.name);
          if (c.codex) discover('cards', c.name, c.name, 'Kart');
          recount();
          if (c.evo) {
            meta.stats.evos = (meta.stats.evos || 0) + 1;
            state.bannerQ.push({ text: 'EVRİM!', sub: c.name, kind: 'evo' });
            toast('EVRİM! ' + c.name);
            ring(state.player.x, state.player.y, 200, '#ff5fd2');
            burst(state.player.x, state.player.y, '#ff5fd2', 40, 360, 0.9);
          }
          cur = null;
          hideOverlay();
        },
        i,
      ),
    );
  const row = document.createElement('div');
  row.className = 'c2-row';
  row.append(...nodes);
  const ctl = document.createElement('div');
  ctl.className = 'c2-ctl';
  const rr = btn(
      '🔄 Yenile <b>' + state.rerolls + '</b>',
      () => {
        state.rerolls--;
        showCards(false, true);
      },
      state.rerolls < 1 || !!ban,
    ),
    bb = btn(
      ban ? 'İptal' : '🚫 Yasakla <b>' + state.banishes + '</b>',
      () => showCards(!ban),
      !ban && state.banishes < 1,
    );
  const info = btn('ⓘ Olasılıklar', () => {});
  info.className = 'c2-info';
  info.onmouseenter = () =>
    setTip(
      () =>
        '<b>Çıkma olasılıkları</b> <small>(şans bonusu ' +
        boost.toFixed(1) +
        ' = luck + tur + boss)</small><br>' +
        tierOdds(buildPool(), boost)
          .map((t) =>
            t.n
              ? '<span style="color:' +
                t.col +
                '">' +
                t.name +
                ' %' +
                (t.p >= 1
                  ? t.p.toFixed(1)
                  : t.p >= 0.01
                    ? t.p.toFixed(2)
                    : t.p >= 0.0001
                      ? t.p.toFixed(4)
                      : '<0.0001') +
                '</span>'
              : '',
          )
          .filter(Boolean)
          .join('<br>'),
    );
  info.onmouseleave = () => setTip(null);
  ctl.append(rr, bb, info);
  showOverlay(
    ban
      ? 'Hangi kartı bir daha görmek istemiyorsun?'
      : '<span class="lvl">SEVİYE ' + state.level + '</span> Bir kart seç',
    [row, ctl],
    ban ? 'ban' : 'cards',
    '⚡ Güç <b>' +
      fmtPower(powerRating()) +
      '</b> · Kart sayısı <b>' +
      state.picked.length +
      '</b>',
  );
}
addEventListener('keydown', (e) => {
  if (overlayKind() !== 'cards' && overlayKind() !== 'ban') return;
  const n = +e.key;
  if (n >= 1 && n <= 3) {
    const el = document.querySelectorAll('#choices .card2')[n - 1];
    if (el) el.click();
  }
});

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
  const crow = document.createElement('div');
  crow.className = 'c2-row';
  crow.append(
    ...picks.map((c, i) =>
      cardEl(
        c,
        () => {
          addClass(c.id);
          hideOverlay();
        },
        i,
      ),
    ),
  );
  showOverlay(
    'Sınıf seç',
    [crow],
    'class',
    'Kalıcı bir bonus ve silahınla sinerji kazanırsın',
  );
}

// ——— Arayüzsüz seviye atlama / sınıf seçimi: denge simülatörü ve testler için (tools/balance, test/) ———
export function autoLevelUp(choose) {
  state.xp -= xpNeed();
  state.level++;
  const picks = drawPicks();
  if (!picks.length) return null;
  const c = (choose && choose(picks)) || picks[0];
  c.apply();
  state.picked.push(c.name);
  recount();
  if (c.evo) meta.stats.evos = (meta.stats.evos || 0) + 1;
  return c;
}
export function autoClassPick(choose) {
  const p = state.player;
  state.pendingClass = false;
  if (p.classes.length >= state.classSlots) return null;
  const pool = Object.entries(CLASSES)
    .filter(([id]) => !p.classes.includes(id))
    .map(([id, c]) => ({ id, ...c }));
  if (!pool.length) return null;
  const c = (choose && choose(pool)) || pool[0];
  addClass(c.id);
  return c;
}
