import { meta, wipe, save } from '../core/save.js';
import { getLang, applyLang } from '../i18n/index.js';
import { ACTIONS, keyOf, resetKeys, rebind, keyName } from '../core/keymap.js';
import { RARITIES } from '../core/rarity.js';
import { sfx, toggleMute } from '../core/audio.js';
import { WEAPONS } from '../data/weapons.js';
import { CARDS } from '../data/cards.js';
import { CLASSES, KOMBOS, SYNERGIES } from '../data/classes.js';
import { ITEMS } from '../data/items.js';
import { PETS } from '../data/pets.js';
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
import { MAP_LIST } from '../data/maps.js';
import { guideList, tipOf } from '../data/tips.js';
import { acc } from '../systems/progress.js';
import {
  REWARDS,
  accNeed,
  titleOf,
  MAX_ACC,
  accountBonus,
  rwText,
} from '../data/account.js';
import { CHARS, CHAR_LIST, xpFor, MAX_CHAR_LEVEL } from '../data/characters.js';
import {
  mapState,
  isMapUnlocked,
  starsEarned,
  starPoints,
  STAR_PERKS,
  hasPerk,
  buyPerk,
  resetPerks,
  starReq,
} from '../systems/campaign.js';
import {
  charMeta,
  isCharUnlocked,
  unlockChar,
  charPoints,
  charOwned,
  buyCharNode,
  resetCharTree,
} from '../systems/characters.js';
import { renderTree } from './tree.js';
import { nodeGlyph, statGlyph, CLASS_GLYPH, cardGlyph } from './icons.js';
import { setTip } from './tooltip.js';
const M = document.getElementById('menu'),
  $ = (id) => document.getElementById(id);
let tab = 'ach',
  selW = 'sword',
  selM = meta.settings.map || 'forest',
  selC = meta.settings.char || 'warrior',
  viewC = 'warrior';
const stars = (n) =>
  '<span class="stars">' +
  '★'.repeat(n) +
  '<span class="off">' +
  '★'.repeat(3 - n) +
  '</span></span>';
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
  const a = acc(),
    al = a.lvl,
    need = accNeed(al),
    pct = al >= MAX_ACC ? 100 : (100 * a.xp) / need,
    nxt = REWARDS[al + 1],
    bn = accountBonus(al);
  const track = [];
  for (let lv = Math.max(2, al - 1); lv <= Math.min(MAX_ACC, al + 5); lv++)
    track.push(
      `<div class="trk ${lv <= al ? 'got' : lv === al + 1 ? 'next' : ''}" title="Sv ${lv}: ${rwText(REWARDS[lv])}"><em>${REWARDS[lv].icon}</em><small>Sv ${lv}</small></div>`,
    );
  const act = [
    bn.gold && '🪙 +' + bn.gold,
    bn.hp && '❤️ +' + bn.hp,
    bn.dmg && '💥 +%' + Math.round(bn.dmg * 100),
    bn.luck && '🍀 +' + bn.luck,
    bn.reroll && '🔄 +' + bn.reroll,
    bn.ban && '🚫 +' + bn.ban,
    bn.card && '🎴 ×' + bn.card,
  ].filter(Boolean);
  M.innerHTML = `<div class="mm"><h1>DODGE<br>AND SHOOT</h1>
    <div class="mm-grid"><div class="mm-left"><button class="big go" id="mPlay">▶ OYNA</button>
      <div class="mm-btns"><button id="mChars"><b>🎭</b>Karakterler</button><button id="mStars"><b>⭐</b>Yıldız Yetenekleri <i>${starPoints() ? '●' : ''}</i></button><button id="mCodex"><b>📖</b>Kodeks</button><button id="mAch"><b>🏆</b>Başarılar</button><button id="mGuide"><b>❓</b>Rehber</button><button id="mStat"><b>📊</b>İstatistikler</button><button id="mSet"><b>⚙️</b>Ayarlar</button></div></div>
      <aside class="rank"><div class="rk-top"><div class="rk-badge" style="--xp:${pct}"><b>${al}</b></div><div><small>HESAP RÜTBESİ</small><h3>${titleOf(al)}</h3><small>${al >= MAX_ACC ? 'MAX' : a.xp + ' / ' + need + ' XP'}</small></div></div>
        <div class="rk-bar"><i style="width:${pct}%"></i></div>
        ${nxt ? `<div class="rk-next"><small>SIRADAKİ ÖDÜL · Sv ${al + 1}</small><b>${nxt.icon} ${rwText(nxt)}</b></div>` : '<div class="rk-next"><b>Tüm ödüller açık!</b></div>'}
        <div class="rk-track">${track.join('')}</div>
        ${act.length ? '<div class="rk-act"><small>AKTİF BONUSLAR</small><span>' + act.join(' · ') + '</span></div>' : ''}
        <div class="rk-res"><span title="Ruh: karakter açar">👻 <b>${meta.souls || 0}</b></span><span title="Boss Puanı: silah ağacı">🏆 <b>${points()}</b></span><span title="Yıldız Puanı: yıldız yetenekleri">⭐ <b>${starPoints()}</b></span></div></aside></div>
    <div class="dim tipline">💡 ${tipOf((Math.random() * 99) | 0)}</div>
    <div class="mfoot"><button id="mMute"></button><button id="mWipe">Kaydı sil</button><button id="mLang"></button></div></div>`;
  const mute = () =>
    ($('mMute').textContent =
      'Ses: ' + (meta.settings.mute ? 'kapalı' : 'açık') + ' (M)');
  mute();
  $('mPlay').onclick = () => go(weaponScreen);
  $('mChars').onclick = () => go(charsScreen);
  $('mStars').onclick = () => go(starsScreen);
  $('mCodex').onclick = () => go(codexScreen);
  $('mGuide').onclick = () => go(guideScreen);
  $('mAch').onclick = () => go(achScreen);
  $('mStat').onclick = () => go(statScreen);
  $('mSet').onclick = () => go(settingsScreen);
  const lg = () =>
    ($('mLang').textContent =
      'Dil: ' + (getLang() === 'en' ? 'English' : 'Türkçe'));
  lg();
  $('mLang').onclick = () => {
    meta.settings.lang = getLang() === 'en' ? 'tr' : 'en';
    save(true);
    applyLang();
    mainScreen();
  };
  $('mMute').onclick = () => {
    toggleMute();
    mute();
  };
  $('mWipe').onclick = () =>
    confirm('Tüm ilerleme (açılanlar, istatistikler, puanlar) silinsin mi?') &&
    wipe();
  hov($('mPlay'), 'Silah seç ve yeni oyuna başla');
  hov($('mWipe'), 'Tarayıcıdaki kayıtlı ilerlemeyi siler');
  hov(
    $('mCodex'),
    'Keşfettiğin kartlar, sınıflar, eşyalar ve bosslar. Keşfedilmemişler gizemli kalır.',
  );
}

function weaponScreen() {
  selM = meta.settings.map || selM;
  selC = meta.settings.char || selC;
  if (!isUnlocked(selW)) selW = 'sword';
  if (!isMapUnlocked(selM)) selM = 'forest';
  if (!isCharUnlocked(selC)) selC = 'warrior';
  const maxH = meta.maxHeat || 0;
  meta.settings.heat = Math.min(meta.settings.heat || 0, maxH);
  M.innerHTML = `<div class="mwrap wide pickscr"><div class="mhead">${back}<h2>Sefere Çık</h2><div class="rchips"><span>👻 <b>${meta.souls || 0}</b></span><span>🏆 <b>${points()}</b></span></div></div>
    <div class="sh2">HARİTA</div><div class="pickrow">${MAP_LIST.map((mp) => {
      const u = isMapUnlocked(mp.id),
        ms = mapState(mp.id);
      return `<div class="pick wide ${u ? '' : 'lock'} ${mp.id === selM ? 'sel' : ''}" data-m="${mp.id}"><div class="pk-ico">${u ? mp.icon : '🔒'}</div><div class="pk-body"><b>${mp.name}</b>${u ? `<div>${stars(ms.stars)}</div><small>${mp.rounds} tur · ${mp.bosses.length} boss · zorluk ×${mp.diff}</small>${ms.best ? '<small>En iyi: tur ' + ms.best + '</small>' : ''}` : `<small>${mp.unlock.text}</small>`}</div></div>`;
    }).join('')}</div>
    <div class="sh2">KARAKTER</div><div class="pickrow">${CHAR_LIST.map(
      (id) => {
        const c = CHARS[id],
          u = isCharUnlocked(id);
        return `<div class="pick ${u ? '' : 'lock'} ${id === selC ? 'sel' : ''}" data-c="${id}"><div class="pk-ico">${u ? c.icon : '🔒'}</div><div class="pk-body"><b>${c.name}</b>${u ? `<small>Seviye ${charMeta(id).lvl}</small><small class="ps">${c.passive.name}</small>` : `<small>${c.cost} Ruh</small>`}</div></div>`;
      },
    ).join('')}</div>
    <div class="sh2">SİLAH</div><div class="pickrow">${Object.entries(WEAPONS)
      .map(([id, w]) => {
        const u = isUnlocked(id);
        return `<div class="pick ${u ? '' : 'lock'} ${id === selW ? 'sel' : ''}" data-w="${id}"><div class="pk-ico">${u ? w.icon : '🔒'}</div><div class="pk-body"><b>${u ? w.name : '???'}</b>${u ? `<small>Öldürme ${meta.weaponKills[id] || 0}</small><small>En iyi seri ${meta.weaponStreak[id] || 0}</small>` : `<small>${w.unlock.text}</small>`}</div></div>`;
      })
      .join('')}</div>
    <div class="launch"><div class="lz"><b>ZORLUK</b><div class="heatseg" id="heatSeg">${[0, 1, 2, 3, 4, 5].map((h) => `<button data-h="${h}" ${h > maxH ? 'disabled' : ''} class="${h === meta.settings.heat ? 'on' : ''}">${h > maxH ? '🔒' : h}</button>`).join('')}</div><small id="heatV"></small></div>
      <button class="big" id="mTree">🌳 Silah Ağacı <em>${points()} BP</em></button><button class="big go" id="mGo">▶ BAŞLA</button></div></div>`;
  $('mBack').onclick = () => go(mainScreen);
  M.querySelectorAll('[data-m]').forEach((c) => {
    const mp = MAP_LIST.find((x) => x.id === c.dataset.m),
      u = isMapUnlocked(mp.id);
    c.onclick = () =>
      u &&
      go(() => {
        selM = mp.id;
        meta.settings.map = selM;
        save(true);
        weaponScreen();
      });
    hov(
      c,
      u
        ? `<b>${mp.name}</b><div class="dim">${mp.desc}</div><div class="dim">Yıldızlar:<br>${[1, 2, 3].map((n) => (mapState(mp.id).stars >= n ? '★ ' : '☆ ') + starReq(n)).join('<br>')}</div>`
        : `<b>Kilitli harita</b><div class="dim">${mp.unlock.text}</div>`,
    );
  });
  M.querySelectorAll('[data-c]').forEach((c) => {
    const ch = CHARS[c.dataset.c],
      u = isCharUnlocked(c.dataset.c);
    c.onclick = () =>
      u &&
      go(() => {
        selC = c.dataset.c;
        meta.settings.char = selC;
        save(true);
        weaponScreen();
      });
    hov(
      c,
      `<b>${ch.icon} ${ch.name}</b><div class="dim">${ch.desc}</div><div><b>${ch.passive.name}:</b> ${ch.passive.text}</div>` +
        (u
          ? ''
          : `<div class="dim">Açmak için ${ch.cost} Ruh gerekir (şu an ${meta.souls || 0})</div>`),
    );
  });
  M.querySelectorAll('[data-w]').forEach((c) => {
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
  const showH = () => {
    const h = meta.settings.heat;
    const en = getLang() === 'en';
    $('heatV').textContent = h
      ? (en
          ? 'Enemies +' +
            15 * h +
            '% health, +' +
            10 * h +
            '% damage · rewards +' +
            15 * h +
            '%' +
            (h >= 3 ? ' · 2 mutators' : '')
          : 'Düşman +%' +
            15 * h +
            ' can, +%' +
            10 * h +
            ' hasar · ödül +%' +
            15 * h +
            (h >= 3 ? ' · 2 mutatör' : '')) +
        (h >= 2 ? ' · ★★' : '') +
        (h >= 4 ? '★' : '')
      : en
        ? 'Normal difficulty · enough for ★'
        : 'Normal zorluk · ★ için yeterli';
    M.querySelectorAll('[data-h]').forEach((b) =>
      b.classList.toggle('on', +b.dataset.h === h),
    );
  };
  M.querySelectorAll('[data-h]').forEach((b) => {
    b.onclick = () => {
      meta.settings.heat = +b.dataset.h;
      sfx('click');
      showH();
    };
    hov(
      b,
      'Zorluk ' +
        b.dataset.h +
        (+b.dataset.h > maxH
          ? ' — kilitli: en yüksek açık zorlukta 15. tura ulaş'
          : ''),
    );
  });
  showH();
  $('mTree').onclick = () => go(treeScreen);
  hov($('mTree'), 'Boss Puanı ile kalıcı silah yetenekleri aç');
  $('mGo').onclick = () => {
    setTip(null);
    M.style.display = 'none';
    startRun(selW, { map: selM, char: selC });
  };
}

function treeScreen() {
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Silah Ağacı</h2><div class="rchips"><span>🏆 Boss Puanı <b id="bp"></b></span></div></div>
    <div class="wtabs">${Object.entries(WEAPONS)
      .map(
        ([id, w]) =>
          `<button data-w="${id}" class="${id === selW ? 'on' : ''}" ${isUnlocked(id) ? '' : 'disabled'}>${isUnlocked(id) ? w.icon + ' ' + w.name : '🔒 ???'}</button>`,
      )
      .join(
        '',
      )}<button id="mReset" class="rst">↺ Puanları sıfırla</button></div>
    <div class="shoplay"><div id="mtree" class="treewrap"></div><aside class="tdetail" id="mdet"><h4>DETAY</h4><div class="dim">Bir yeteneğin üstüne gel.</div></aside></div></div>`;
  $('mBack').onclick = () => go(weaponScreen);
  M.querySelectorAll('[data-w]').forEach(
    (b) =>
      (b.onclick = () =>
        go(() => {
          selW = b.dataset.w;
          treeScreen();
        })),
  );
  const draw = () => {
    $('bp').textContent = points();
    renderTree($('mtree'), WEAPONS[selW].tree, {
      icon: nodeGlyph,
      max: () => 1,
      cost: (n) => n.cost + ' BP',
      level: (n) => (owned(selW, n.id) ? 1 : 0),
      can: (n) => !owned(selW, n.id) && points() >= n.cost,
      detail: $('mdet'),
      sub: (n) => (owned(selW, n.id) ? 'Açık ✓' : n.cost + ' Boss Puanı'),
      tip: (n) =>
        `<h4>${n.name.toUpperCase()}</h4><div>${n.desc}</div><div class="dim" style="margin-top:6px">${owned(selW, n.id) ? '✔ Açık' : 'Maliyet: ' + n.cost + ' Boss Puanı' + (points() >= n.cost ? '' : ' (yetersiz)')}</div>`,
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
      treeScreen();
    });
  hov(
    $('mReset'),
    "Harcanan tüm Boss Puanı'larını geri alır, ağacı yeniden kurabilirsin",
  );
}

// KODEKS: keşfettiklerin renkli, keşfetmediklerin gizemli silüet. Merak + koleksiyon hedefi.
let cxTab = 'cards',
  cxSel = null;
function codexScreen() {
  const F = meta.found,
    rar = (r) => RARITIES[r || 'common'] || RARITIES.common;
  const T = {
    cards: {
      n: 'Kartlar',
      l: CARDS.filter((c) => c.codex && !c.needs).map((c) => ({
        id: c.name,
        name: c.name,
        r: c.rarity,
        ic: cardGlyph(c),
        d: c.desc,
        f: !!F.cards[c.name],
      })),
    },
    evo: {
      n: 'Evrimler',
      l: CARDS.filter((c) => c.needs).map((c) => ({
        id: c.name,
        name: c.name,
        r: c.rarity,
        ic: '🌟',
        d: c.desc,
        f: !!F.cards[c.name],
        extra: 'Tarif: ' + c.needs.join(' + '),
      })),
    },
    classes: {
      n: 'Sınıflar',
      l: Object.entries(CLASSES).map(([id, c]) => ({
        id,
        name: c.name,
        r: c.rarity,
        ic: CLASS_GLYPH[id] || '🎭',
        d: c.desc,
        f: !!F.classes[id],
      })),
    },
    items: {
      n: 'Eşyalar',
      l: ITEMS.map((i) => ({
        id: i.id,
        name: i.name,
        r: i.rarity,
        ic: '💎',
        d: i.desc,
        f: !!F.items[i.id],
      })),
    },
    pets: {
      n: 'Petler',
      l: Object.entries(PETS).map(([id, p]) => ({
        id,
        name: p.name,
        r: 'rare',
        ic: p.icon || '🐾',
        d: p.desc,
        f: !!F.pets[id],
      })),
    },
    bosses: {
      n: 'Bosslar',
      l: BOSSES.map((b) => ({
        id: b.name,
        name: b.name,
        r: 'epic',
        ic: '👹',
        d: 'Boss',
        f: meta.bossesDefeated.includes(b.name),
      })),
    },
  };
  const tot = Object.values(T).reduce((a, t) => a + t.l.length, 0),
    got = Object.values(T).reduce(
      (a, t) => a + t.l.filter((x) => x.f).length,
      0,
    );
  const cur = T[cxTab],
    list = cur.l
      .slice()
      .sort(
        (a, b) =>
          RARITIES[a.r || 'common'].tier - RARITIES[b.r || 'common'].tier ||
          a.name.localeCompare(b.name, 'tr'),
      );
  const sel = list.find((x) => x.id === cxSel) || null;
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Kodeks</h2><div class="rchips"><span>📖 <b>${got}</b> / ${tot} <small>(%${Math.round((100 * got) / tot)})</small></span></div></div>
    <div class="wtabs">${Object.entries(T)
      .map(
        ([k, t]) =>
          `<button data-t="${k}" class="${k === cxTab ? 'on' : ''}">${t.n} <small>${t.l.filter((x) => x.f).length}/${t.l.length}</small></button>`,
      )
      .join('')}</div>
    <div class="shoplay"><div class="cxgrid">${list.map((x) => `<div class="cx ${x.f ? 'f' : ''} ${sel && sel.id === x.id ? 'sel' : ''}" data-i="${x.id.replace(/"/g, '&quot;')}" style="--c:${rar(x.r).col}"><em>${x.f ? x.ic : '❔'}</em><small>${x.f ? x.name : '???'}</small></div>`).join('')}</div>
      <aside class="tdetail" id="cxd">${sel ? (sel.f ? `<h4 style="color:${rar(sel.r).col}">${sel.name.toUpperCase()}</h4><div class="dim">${rar(sel.r).name}</div><p>${sel.d}</p>${sel.extra ? '<div class="dim">' + sel.extra + '</div>' : ''}` : `<h4>???</h4><div class="dim">${rar(sel.r).name}</div><p>Henüz keşfedilmedi. Oynayarak bul!</p>${sel.extra ? '<div class="dim">Tarif: ??? + ???</div>' : ''}`) : '<h4>DETAY</h4><div class="dim">Bir öğeye tıkla.</div>'}</aside></div></div>`;
  $('mBack').onclick = () => go(mainScreen);
  M.querySelectorAll('[data-t]').forEach(
    (b) =>
      (b.onclick = () =>
        go(() => {
          cxTab = b.dataset.t;
          cxSel = null;
          codexScreen();
        })),
  );
  M.querySelectorAll('[data-i]').forEach(
    (c) =>
      (c.onclick = () => {
        cxSel = c.dataset.i;
        sfx('click');
        codexScreen();
      }),
  );
}

function charsScreen() {
  if (!CHARS[viewC]) viewC = 'warrior';
  const c = CHARS[viewC],
    u = isCharUnlocked(viewC),
    cm = charMeta(viewC),
    need = xpFor(cm.lvl);
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Karakterler</h2><div class="sub">Ruh: <b id="soul">${meta.souls || 0}</b></div></div>
    <div class="wlist">${CHAR_LIST.map((id) => {
      const x = CHARS[id],
        k = isCharUnlocked(id);
      return `<div class="wcard ${k ? '' : 'lock'} ${id === viewC ? 'sel' : ''}" data-c="${id}"><div class="ico">${x.icon}</div><b>${x.name}</b><small>${k ? 'Seviye ' + charMeta(id).lvl : x.cost + ' Ruh'}</small></div>`;
    }).join('')}</div>
    <div class="cdet"><div><h3 style="margin:4px 0">${c.icon} ${c.name}</h3><div class="dim">${c.desc}</div><div style="margin-top:6px"><b>${c.passive.name}</b><br><small>${c.passive.text}</small></div>
      <div style="margin-top:8px"><small>Başlangıç: ${c.mods.map((m) => (m.value > 0 && m.op === 'add' ? '+' : '') + (m.op === 'mul' ? '×' + m.value : m.value) + ' ' + m.stat).join(', ')}</small></div>
      ${
        u
          ? `<div style="margin-top:10px">Seviye <b>${cm.lvl}</b>${cm.lvl >= MAX_CHAR_LEVEL ? ' (MAX)' : ` · XP ${cm.xp}/${need}`}</div><div class="xpb"><i style="width:${cm.lvl >= MAX_CHAR_LEVEL ? 100 : (100 * cm.xp) / need}%"></i></div>
      <div style="margin-top:6px">Ruh Puanı: <b id="cp">${charPoints(viewC)}</b> <small>(her seviye 1 puan)</small></div>`
          : `<div style="margin-top:12px"><button class="big" id="cUnlock" ${(meta.souls || 0) >= c.cost ? '' : 'disabled'}>Aç — ${c.cost} Ruh</button></div>`
      }</div>
      <div>${u ? `<div class="treehead"><b>${c.name} ağacı</b><button id="cReset">Puanları sıfırla</button></div><div id="ctree" class="treewrap"></div>` : '<div class="dim">Ruh toplayarak karakteri aç. Ruh, her koşu sonunda kazanılır (öldürme, tur ve boss başına).</div>'}</div></div></div>`;
  $('mBack').onclick = () => go(mainScreen);
  M.querySelectorAll('[data-c]').forEach((e) => {
    e.onclick = () =>
      go(() => {
        viewC = e.dataset.c;
        charsScreen();
      });
  });
  if ($('cUnlock'))
    $('cUnlock').onclick = () => {
      if (unlockChar(viewC)) {
        sfx('click');
        selC = viewC;
        meta.settings.char = selC;
        save(true);
        charsScreen();
      }
    };
  if (u) {
    const draw = () => {
      $('cp').textContent = charPoints(viewC);
      renderTree($('ctree'), c.tree, {
        icon: nodeGlyph,
        max: () => 1,
        cost: (n) => n.cost + ' RP',
        level: (n) => (charOwned(viewC, n.id) ? 1 : 0),
        can: (n) =>
          !charOwned(viewC, n.id) &&
          charPoints(viewC) >= n.cost &&
          (!n.parent || charOwned(viewC, n.parent)),
        sub: (n) => (charOwned(viewC, n.id) ? 'Açık ✓' : n.cost + ' Ruh Puanı'),
        tip: (n) =>
          `<b>${n.name}</b><div>${n.desc}</div><div class="dim">${charOwned(viewC, n.id) ? 'Açık' : 'Maliyet: ' + n.cost + ' Ruh Puanı'}</div>`,
        buy: (n) => {
          if (buyCharNode(viewC, n)) sfx('click');
        },
        rerender: draw,
      });
    };
    draw();
    $('cReset').onclick = () =>
      go(() => {
        resetCharTree(viewC);
        charsScreen();
      });
  }
}
function starsScreen() {
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Yıldız Yetenekleri</h2><div class="sub">Kullanılabilir: <b>${starPoints()}</b> ★ (toplam ${starsEarned()})</div></div>
    <div class="dim">Her harita 3 yıldız verir: ★ haritayı bitir · ★★ Zorluk 2+ ile bitir · ★★★ Zorluk 4+ ile bitir. Yıldızlar kalıcı yetenek satın almak için harcanır.</div>
    <div class="wlist">${MAP_LIST.map((mp) => `<div class="wcard"><div class="ico">${mp.icon}</div><b>${mp.name}</b><div>${stars(mapState(mp.id).stars)}</div></div>`).join('')}</div>
    <div class="treehead"><b>Yetenekler</b><button id="pReset">Yıldızları geri al</button></div>
    <div class="wlist">${STAR_PERKS.map((p) => `<div class="wcard perk ${hasPerk(p.id) ? 'have' : starPoints() >= p.cost ? 'buy' : ''}" data-p="${p.id}"><div class="ico">${p.icon}</div><b>${p.name}</b><small>${p.desc}</small><small>${hasPerk(p.id) ? 'Açık ✓' : p.cost + ' ★'}</small></div>`).join('')}</div></div>`;
  $('mBack').onclick = () => go(mainScreen);
  $('pReset').onclick = () =>
    go(() => {
      resetPerks();
      starsScreen();
    });
  M.querySelectorAll('[data-p]').forEach((e) => {
    e.onclick = () => {
      if (buyPerk(e.dataset.p)) {
        sfx('click');
        go(starsScreen);
      }
    };
  });
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
      s: `Öldürme: ${meta.weaponKills[id] || 0} · En iyi seri: ${meta.weaponStreak[id] || 0}`,
      h: w.unlock ? 'Kilit: ' + w.unlock.text : '',
      col: '#4aa3ff',
      d: w.desc,
    })),
    cards: CARDS.filter((c) => c.codex).map((c) => ({
      f: !!meta.found.cards[c.name],
      t: c.name,
      s: `${rc(c.rarity).name} · Öldürme: ${meta.cardKills[c.name] || 0}`,
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
            t: (KOMBOS[k] || { name: 'Uyum' }).name,
            s: CLASSES[ids[i]].name + ' + ' + CLASSES[ids[j]].name,
            col: '#e0b040',
            d: 'İki sınıf birlikteyken her vuruşa ekstra kombo hasarı.',
          });
        }
      for (const [k, sy] of Object.entries(SYNERGIES)) {
        const [w, c] = k.split(':');
        o.push({
          f: !!meta.found.combos['w:' + k],
          t: sy.name,
          s: WEAPONS[w].name + ' + ' + CLASSES[c].name,
          col: '#4aa3ff',
          d: sy.desc,
        });
      }
      return o;
    })(),
    pets: Object.entries(PETS).map(([id, d]) => ({
      f: !!meta.found.pets[id],
      t: d.icon + ' ' + d.name,
      s: rc(d.rarity).name,
      col: rc(d.rarity).col,
      d: d.desc,
    })),
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
      ['classes', 'Sınıflar'],
      ['combos', 'Kombolar'],
      ['pets', 'Petler'],
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

function settingsScreen() {
  // tuş atama: bir tuşa tıkla, sonra yeni tuşa bas (çakışan tuş yer değiştirir)
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Ayarlar</h2></div><h3>Performans</h3><div class="keys"><div class="krow"><span>Grafik kalitesi</span><button id="sGfx"></button></div><div class="krow"><span>Yavaşlatma/sersemletme (sana)</span><button id="sCc"></button></div><div class="krow"><span>Ekran sarsıntısı</span><button id="sShk"></button></div><div class="krow"><span>FPS göstergesi</span><button id="sFps"></button></div></div><h3>Ses</h3><div class="keys"><div class="krow"><span>Oyun içi ipuçları</span><button id="sTips"></button></div><div class="krow"><span>Müzik</span><button id="sMusic"></button></div><div class="krow"><span>Müzik seviyesi</span><button id="sMv"></button></div><div class="krow"><span>Efekt seviyesi</span><button id="sSv"></button></div></div><h3>Tuş atamaları</h3><div class="sub">Bir tuşa tıkla, sonra yeni tuşa bas. Ok tuşları her zaman da hareket ettirir. İptal için Esc.</div>
    <div class="keys">${ACTIONS.map(([id, name]) => `<div class="krow"><span>${name}</span><button data-a="${id}"></button></div>`).join('')}</div><div class="treehead"><span></span><button id="kReset">Varsayılana dön</button></div></div>`;
  const lv = ['0%', '25%', '50%', '75%', '100%'],
    idx = (v) => Math.round((v ?? 0.5) * 4),
    snd = () => {
      $('sMusic').textContent =
        meta.settings.music === false ? 'Pasif' : 'Aktif';
      $('sMv').textContent = lv[idx(meta.settings.mvol)];
      $('sSv').textContent = lv[idx(meta.settings.sfx ?? meta.settings.vol)];
    };
  snd();
  const GF = ['auto', 'high', 'medium', 'low'],
    GN = { auto: 'Otomatik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' },
    gf = () => {
      $('sGfx').textContent = GN[meta.settings.gfx || 'auto'];
      $('sFps').textContent = meta.settings.fps ? 'Aktif' : 'Pasif';
    };
  gf();
  $('sGfx').onclick = () => {
    meta.settings.gfx = GF[(GF.indexOf(meta.settings.gfx || 'auto') + 1) % 4];
    save(true);
    gf();
  };
  const SK = ['off', 'low', 'normal'],
    SN = { off: 'Kapalı', low: 'Az', normal: 'Normal' };
  const sk = () => ($('sShk').textContent = SN[meta.settings.shake || 'low']);
  sk();
  $('sShk').onclick = () => {
    meta.settings.shake =
      SK[(SK.indexOf(meta.settings.shake || 'low') + 1) % 3];
    save(true);
    sk();
  };
  const cc = () =>
    ($('sCc').textContent = meta.settings.cc === true ? 'Aktif' : 'Pasif');
  cc();
  $('sCc').onclick = () => {
    meta.settings.cc = meta.settings.cc !== true;
    save(true);
    cc();
  };
  $('sFps').onclick = () => {
    meta.settings.fps = !meta.settings.fps;
    save(true);
    gf();
  };
  const tp = () =>
    ($('sTips').textContent = meta.settings.tips === false ? 'Pasif' : 'Aktif');
  tp();
  $('sTips').onclick = () => {
    meta.settings.tips = meta.settings.tips === false;
    save(true);
    tp();
  };
  $('sMusic').onclick = () => {
    meta.settings.music = meta.settings.music === false;
    save(true);
    snd();
  };
  $('sMv').onclick = () => {
    meta.settings.mvol = ((idx(meta.settings.mvol) + 1) % 5) / 4;
    save(true);
    snd();
  };
  $('sSv').onclick = () => {
    meta.settings.sfx =
      ((idx(meta.settings.sfx ?? meta.settings.vol) + 1) % 5) / 4;
    save(true);
    snd();
    sfx('click');
  };
  const draw = () =>
    M.querySelectorAll('[data-a]').forEach(
      (b) => (b.textContent = keyName(keyOf(b.dataset.a))),
    );
  draw();
  $('mBack').onclick = () => go(mainScreen);
  $('kReset').onclick = () => {
    resetKeys();
    save(true);
    draw();
  };
  M.querySelectorAll('[data-a]').forEach(
    (b) =>
      (b.onclick = () => {
        b.textContent = 'Bir tuşa bas...';
        const h = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.removeEventListener('keydown', h, true);
          if (e.code !== 'Escape') rebind(b.dataset.a, e.code);
          save(true);
          draw();
        };
        window.addEventListener('keydown', h, true);
      }),
  );
}
let guideI = 0;
function guideScreen() {
  const GUIDE = guideList();
  M.innerHTML = `<div class="mwrap wide"><div class="mhead">${back}<h2>Rehber</h2></div><div class="cdet"><div style="flex:0 0 220px;min-width:180px">${GUIDE.map((g, i) => `<button class="big" data-g="${i}" style="display:block;width:100%;margin:3px 0;${i === guideI ? 'border-color:#e8c878' : ''}">${g.t}</button>`).join('')}</div>
    <div style="flex:2;min-width:280px"><h3 style="margin-top:0">${GUIDE[guideI].t}</h3>${GUIDE[guideI].b()}</div></div>
    <div class="sh2">İPUÇLARI</div><div class="dim">${[0, 1, 2].map((k) => '💡 ' + tipOf(guideI * 3 + k + 3)).join('<br>')}</div></div>`;
  $('mBack').onclick = () => go(mainScreen);
  M.querySelectorAll('[data-g]').forEach(
    (b) =>
      (b.onclick = () =>
        go(() => {
          guideI = +b.dataset.g;
          guideScreen();
        })),
  );
}
function statScreen() {
  const s = meta.stats,
    bn = (i) => BOSSES[i % BOSSES.length].name;
  const rows = [
    ['Toplam öldürme', s.kills],
    ['En iyi tur', s.bestWave],
    ['En iyi seri', s.bestStreak],
    ['Tek oyunda en çok öldürme', s.mostKills],
    ['Oynanan oyun', s.runs],
    ['Ölüm', s.deaths],
    ['Toplam süre', fmtT(s.time)],
    ['Toplam altın', s.coins],
    ['Toplam hasar', Math.round(s.damage).toLocaleString('tr')],
    [
      'Ulaşılan en son boss',
      s.bossReached ? bn(s.bossReached - 1) + ' (#' + s.bossReached + ')' : '—',
    ],
    ['Yenilen farklı boss', meta.bossesDefeated.length + ' / ' + BOSSES.length],
    ['Boss Puanı', points()],
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
