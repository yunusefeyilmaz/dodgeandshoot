import { meta, wipe } from '../core/save.js';
import { RARITIES } from '../core/rarity.js';
import { sfx, toggleMute } from '../core/audio.js';
import { WEAPONS } from '../data/weapons.js';
import { CARDS } from '../data/cards.js';
import { CLASSES, COMBOS } from '../data/classes.js';
import { ITEMS } from '../data/items.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { BOSSES } from '../data/enemies.js';
import {
  points,
  owned,
  buyNode,
  resetTree,
  isUnlocked,
} from '../systems/meta.js';
import { startRun } from '../systems/run.js';
import { renderTree } from './tree.js';
import { setTip } from './tooltip.js';
const M = document.getElementById('menu'),
  $ = (id) => document.getElementById(id);
let tab = 'ach',
  selW = 'sword';
const hov = (el, html) => {
  el.onmouseenter = () => setTip(() => html);
  el.onmouseleave = () => setTip(null);
};
const fmtT = (s) =>
  Math.floor(s / 3600) + 's ' + Math.floor((s % 3600) / 60) + 'dk';
const go = (fn) => {
  setTip(null);
  sfx('click');
  fn();
};
const back = '<button id="mBack">← Geri</button>';

export function openMenu() {
  M.style.display = 'flex';
  mainScreen();
}

function mainScreen() {
  M.innerHTML = `<div class="mwrap center"><h1>MODÜLER<br>KART OYUNU</h1><div class="sub">Boss Point: <b>${points()}</b></div>
    <button class="big" id="mPlay">Oyna</button><button class="big" id="mAch">Başarılar</button><button class="big" id="mStat">İstatistikler</button>
    <div class="mfoot"><button id="mMute"></button><button id="mWipe">Kaydı sil</button></div></div>`;
  const mute = () =>
    ($('mMute').textContent =
      'Ses: ' + (meta.settings.mute ? 'kapalı' : 'açık') + ' (M)');
  mute();
  $('mPlay').onclick = () => go(weaponScreen);
  $('mAch').onclick = () => go(achScreen);
  $('mStat').onclick = () => go(statScreen);
  $('mMute').onclick = () => {
    toggleMute();
    mute();
  };
  $('mWipe').onclick = () =>
    confirm('Tüm ilerleme (açılanlar, istatistikler, puanlar) silinsin mi?') &&
    wipe();
  hov($('mPlay'), 'Silah seç ve yeni oyuna başla');
  hov($('mWipe'), 'Tarayıcıdaki kayıtlı ilerlemeyi siler');
}

function weaponScreen() {
  if (!isUnlocked(selW)) selW = 'sword';
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Silah seç</h2><div class="sub">Boss Point: <b id="bp"></b></div></div>
    <div class="wlist">${Object.entries(WEAPONS)
      .map(([id, w]) => {
        const u = isUnlocked(id);
        return `<div class="wcard ${u ? '' : 'lock'} ${id === selW ? 'sel' : ''}" data-w="${id}"><div class="ico">${u ? w.icon : '🔒'}</div><b>${u ? w.name : '???'}</b><small>${u ? w.desc : 'Kilitli: ' + w.unlock.text}</small>
      ${u ? `<small>Kill: ${meta.weaponKills[id] || 0} · En iyi streak: ${meta.weaponStreak[id] || 0}</small>` : ''}</div>`;
      })
      .join('')}</div>
    <div class="treehead"><b>${WEAPONS[selW].name} yetenek ağacı</b><button id="mReset">Puanları sıfırla</button></div>
    <div id="mtree" class="treewrap"></div><button class="big go" id="mGo">Başla</button></div>`;
  $('mBack').onclick = () => go(mainScreen);
  M.querySelectorAll('.wcard').forEach((c) => {
    const id = c.dataset.w,
      w = WEAPONS[id];
    c.onclick = () =>
      isUnlocked(id) &&
      go(() => {
        selW = id;
        weaponScreen();
      });
    hov(
      c,
      isUnlocked(id)
        ? `<b>${w.name}</b><div class="dim">${w.desc}</div>`
        : `<b>Kilitli silah</b><div class="dim">${w.unlock.text}</div>`,
    );
  });
  const draw = () => {
    $('bp').textContent = points();
    renderTree($('mtree'), WEAPONS[selW].tree, {
      level: (n) => (owned(selW, n.id) ? 1 : 0),
      can: (n) => !owned(selW, n.id) && points() >= n.cost,
      sub: (n) => (owned(selW, n.id) ? 'Açık ✓' : n.cost + ' Boss Point'),
      tip: (n) =>
        `<b>${n.name}</b><div>${n.desc}</div><div class="dim">${owned(selW, n.id) ? 'Açık' : 'Maliyet: ' + n.cost + ' Boss Point'}</div>`,
      buy: (n) => {
        if (buyNode(selW, n)) sfx('click');
      },
      rerender: draw,
    });
  };
  draw();
  $('mReset').onclick = () =>
    go(() => {
      resetTree();
      weaponScreen();
    });
  hov(
    $('mReset'),
    "Harcanan tüm Boss Point'leri geri alır, ağacı yeniden kurabilirsin",
  );
  $('mGo').onclick = () => {
    setTip(null);
    M.style.display = 'none';
    startRun(selW);
  };
}

function entries() {
  const rc = (id) => RARITIES[id || 'common'];
  return {
    ach: ACHIEVEMENTS.map((a) => ({
      f: !!meta.ach[a.id],
      t: a.name,
      s: a.desc,
      col: '#e0b040',
      show: 1,
    })),
    weapons: Object.entries(WEAPONS).map(([id, w]) => ({
      f: isUnlocked(id),
      t: w.icon + ' ' + w.name,
      s: `Kill: ${meta.weaponKills[id] || 0} · En iyi streak: ${meta.weaponStreak[id] || 0}`,
      h: w.unlock ? 'Kilit: ' + w.unlock.text : '',
      col: '#4aa3ff',
      d: w.desc,
    })),
    cards: CARDS.filter((c) => c.codex).map((c) => ({
      f: !!meta.found.cards[c.name],
      t: c.name,
      s: `${rc(c.rarity).name} · Kill: ${meta.cardKills[c.name] || 0}`,
      col: rc(c.rarity).col,
      d: c.desc,
    })),
    classes: Object.entries(CLASSES).map(([id, c]) => ({
      f: !!meta.found.classes[id],
      t: c.name,
      s: rc(c.rarity).name,
      col: rc(c.rarity).col,
      d: c.desc,
    })),
    combos: (() => {
      const ids = Object.keys(CLASSES).sort(),
        o = [];
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++) {
          const k = ids[i] + '+' + ids[j];
          o.push({
            f: !!meta.found.combos[k],
            t: (COMBOS[k] || { name: 'Synergy' }).name,
            s: CLASSES[ids[i]].name + ' + ' + CLASSES[ids[j]].name,
            col: '#e0b040',
            d: 'İki class birlikteyken her vuruşa ekstra combo hasarı.',
          });
        }
      return o;
    })(),
    items: ITEMS.map((i) => ({
      f: !!meta.found.items[i.id],
      t: i.name,
      s: rc(i.rarity).name,
      col: rc(i.rarity).col,
      d: i.desc || 'Bir itemdır.',
    })),
  };
}
function achScreen() {
  const TABS = [
      ['ach', 'Başarımlar'],
      ['weapons', 'Silahlar'],
      ['cards', 'Kartlar'],
      ['classes', 'Classlar'],
      ['combos', 'Combolar'],
      ['items', 'Itemlar'],
    ],
    E = entries(),
    list = E[tab];
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Başarılar</h2><div class="sub">${list.filter((e) => e.f).length} / ${list.length} açık</div></div>
    <div class="tabs">${TABS.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n} (${E[k].filter((e) => e.f).length}/${E[k].length})</button>`).join('')}</div>
    <div class="grid">${list.map((e) => `<div class="tile ${e.f || e.show ? '' : 'lock'} ${e.f ? '' : 'dim'}" style="--c:${e.col}"><b>${e.f ? e.t : e.show ? '🔒 ' + e.t : '🔒 ???'}</b><small>${e.f || e.show ? e.s : e.h || 'Henüz keşfedilmedi'}</small></div>`).join('')}</div></div>`;
  $('mBack').onclick = () => go(mainScreen);
  M.querySelectorAll('[data-t]').forEach(
    (b) =>
      (b.onclick = () =>
        go(() => {
          tab = b.dataset.t;
          achScreen();
        })),
  );
  M.querySelectorAll('.tile').forEach((t, i) => {
    const e = list[i];
    hov(
      t,
      e.f
        ? `<b style="color:${e.col}">${e.t}</b><div class="dim">${e.d || e.s}</div>`
        : e.show
          ? `<b>${e.t}</b><div class="dim">${e.s} (kilitli)</div>`
          : '<b>Kilitli</b><div class="dim">Oyun içinde keşfet</div>',
    );
  });
}

function statScreen() {
  const s = meta.stats,
    bn = (i) => BOSSES[i % 10].name;
  const rows = [
    ['Toplam kill', s.kills],
    ['En iyi tur', s.bestWave],
    ['En iyi streak', s.bestStreak],
    ['Tek oyunda en çok kill', s.mostKills],
    ['Oynanan oyun', s.runs],
    ['Ölüm', s.deaths],
    ['Toplam süre', fmtT(s.time)],
    ['Toplam coin', s.coins],
    ['Toplam hasar', Math.round(s.damage).toLocaleString('tr')],
    [
      'Ulaşılan en son boss',
      s.bossReached ? bn(s.bossReached - 1) + ' (#' + s.bossReached + ')' : '—',
    ],
    ['Yenilen farklı boss', meta.bossesDefeated.length + ' / ' + BOSSES.length],
    ['Boss Point', points()],
  ];
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>İstatistikler</h2></div>
    <div class="sgrid">${rows.map(([k, v]) => `<div class="srow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    <h3 style="margin:14px 0 4px">Bosslar</h3><div class="grid">${BOSSES.map(
      (b, i) => {
        const k = s.bossKills[b.name] || 0,
          r = s.bossReached >= i + 1;
        return `<div class="tile ${k || r ? '' : 'lock'}" style="--c:${b.col}"><b>${k || r ? b.name : '🔒 ???'}</b><small>${k ? 'Yenildi ×' + k : r ? 'Ulaşıldı (tur ' + (i + 1) * 5 + ')' : 'Tur ' + (i + 1) * 5}</small></div>`;
      },
    ).join('')}</div></div>`;
  $('mBack').onclick = () => go(mainScreen);
}
