import { state, toast } from '../core/state.js';
import { meta, save } from '../core/save.js';
import { toggleMute, sfx } from '../core/audio.js';
import { is, keyOf, keyName } from '../core/keymap.js';
import { questList, setWaypoint } from './quests.js';
import { ABILITIES } from '../data/abilities.js';
import { stat } from '../core/stats.js';
import { LABELS, DESCS, fmtStat } from '../core/labels.js';
import { RARITIES } from '../core/rarity.js';
import { CLASSES } from '../data/classes.js';
import { PETS } from '../data/pets.js';
import { startWave } from '../systems/waves.js';
import { xpNeed } from '../systems/rewards.js';
import { affordable } from '../systems/upgrades.js';
import { objectiveInfo } from '../systems/objectives.js';
import { dashState, dashRecharge } from '../systems/dash.js';
import { finishRun, abandonRun } from '../systems/tracking.js';
import { sellItem } from '../systems/inventory.js';
import { releaseClass } from '../systems/classes.js';
import { removePet } from '../systems/pets.js';
import { openShop } from './shop.js';
import { picked } from './cards.js';
import {
  showOverlay,
  hideOverlay,
  overlayKind,
  btn,
  confirmBox,
} from './overlay.js';
import { setTip, tipOn, refreshTip, itemTip, partLines } from './tooltip.js';
import {
  syncIcons,
  glyphOf,
  abDesc,
  abTip,
  cardTip,
  cardGlyph,
  CLASS_GLYPH,
} from './icons.js';
import { BASE } from '../core/entity.js';
import { WEAPONS } from '../data/weapons.js';
import { CARDS } from '../data/cards.js';
const $ = (id) => document.getElementById(id);
const panels = {
  inv: $('invP'),
  stat: $('statP'),
  cls: $('clsP'),
  pet: $('petP'),
};
const STAT_KEYS = [
  'ad',
  'ap',
  'attackSpeed',
  'haste',
  'critChance',
  'critDmg',
  'armor',
  'mr',
  'armorPen',
  'lethality',
  'magicPen',
  'magicFlat',
  'maxHp',
  'regen',
  'lifesteal',
  'omnivamp',
  'speed',
  'magnet',
  'luck',
  'backstab',
  'damage',
  'knockback',
  'poison',
  'chain',
  'slow',
  'voidShred',
  'effPower',
  'resPen',
  'blast',
  'blastPower',
  'blastRadius',
  'blastCount',
  'dashCharges',
  'dashCdMul',
  'dashIframe',
];
let shopBtn,
  pipSig = '',
  sel = -1,
  clsSel = null,
  petSel = null,
  invSig = '',
  clsSig = '',
  petSig = '',
  frame = 0,
  overShown = false;
const open = (k) => panels[k].style.display === 'block';
const anyOpen = () => Object.keys(panels).some(open);

function toggleQuests() {
  meta.settings.questsClosed = !meta.settings.questsClosed;
  save(true);
  sfx('click');
}
function refreshKbd() {
  document.querySelectorAll('[data-p]').forEach((b) => {
    const k = b.querySelector('kbd');
    if (k) k.textContent = keyName(keyOf(b.dataset.p));
  });
  const sk = $('startBtn').querySelector('kbd');
  if (sk) sk.textContent = keyName(keyOf('wave'));
}
function leaveRun() {
  // oyun içinden ana menüye dönüş (onaylı)
  if (state.mode !== 'run' || state.over) return;
  confirmBox(
    'Emin misin? Turu bitirip ana menüye dönmek istiyor musun?',
    () => {
      abandonRun();
      location.reload();
    },
  );
}
function toggle(p) {
  if (p === 'shop') {
    if (overlayKind() === 'shop') hideOverlay();
    else if (!overlayKind() && state.weapon) openShop();
    return;
  }
  if (p === 'menu') {
    if (!overlayKind()) leaveRun();
    return;
  }
  panels[p].style.display = open(p) ? 'none' : 'block';
}
export function initHud() {
  $('startBtn').onclick = startWave;
  shopBtn = document.querySelector('[data-p=shop]');
  $('auto').onchange = (e) => (state.wave.auto = e.target.checked);
  document
    .querySelectorAll('[data-p]')
    .forEach(
      (b) => (b.onclick = () => state.mode === 'run' && toggle(b.dataset.p)),
    );
  const D = (t, d) => () => '<b>' + t + '</b><div class="dim">' + d + '</div>';
  tipOn(
    $('hpf').parentElement,
    D('Can', '0 olursa oyun biter. Tur bitince %25 yenilenir.'),
  );
  tipOn(
    $('xpf').parentElement,
    D('Deneyim', 'Dolunca level atlar ve bir kart seçersin.'),
  );
  tipOn(
    $('coins'),
    D('Seviye · Altın', 'Altın ile Yükseltmeler (B) ekranından stat alınır.'),
  );
  tipOn(
    $('startBtn'),
    D(
      'Turu başlat',
      'Sıradaki turu başlatır. Otomatik tur açıksa kendisi başlar.',
    ),
  );
  tipOn(
    $('auto').parentElement,
    D('Otomatik tur', 'Tur bitince 2 sn sonra yeni tur kendiliğinden başlar.'),
  );
  const T = {
    inv: ['Envanter (I)', 'Itemlar burada. Tıklayıp satabilirsin.'],
    stat: ['Statlar (C)', 'Tüm statlarını ve kartlarını gör.'],
    cls: ['Sınıflar (K)', 'Sınıf slotların, kombolar. Sınıfı bırakabilirsin.'],
    pet: ['Petler (P)', 'Petlerini ve skillerini yönet, bırak.'],
    shop: ['Yükseltmeler (B)', 'Altın ile yetenek ağacından stat al.'],
    menu: ['Ana menü (Esc)', 'Turu bitirip ana menüye döner (onay sorar).'],
  };
  for (const k in T)
    tipOn(document.querySelector('[data-p=' + k + ']'), D(...T[k]));
  $('statGrid').onmouseover = (e) => {
    const k = e.target.dataset && e.target.dataset.k;
    setTip(
      k
        ? () =>
            '<b>' + LABELS[k] + '</b><div class="dim">' + DESCS[k] + '</div>'
        : null,
    );
  };
  $('statGrid').onmouseleave = () => setTip(null);
  $('ts').onmouseover = $('statGrid').onmouseover;
  $('ts').onmouseleave = () => setTip(null);
  addEventListener('keydown', (e) => {
    if (is(e, 'mute')) {
      toggleMute();
      toast(meta.settings.mute ? 'Ses kapalı' : 'Ses açık');
    }
    if (state.mode !== 'run') return;
    if (is(e, 'inv')) toggle('inv');
    else if (is(e, 'stat')) toggle('stat');
    else if (is(e, 'cls')) toggle('cls');
    else if (is(e, 'pet')) toggle('pet');
    else if (is(e, 'shop')) toggle('shop');
    else if (is(e, 'quests')) toggleQuests();
    else if (is(e, 'wave')) {
      e.preventDefault();
      if (!overlayKind()) startWave();
    } else if (is(e, 'menu')) {
      if (anyOpen())
        Object.values(panels).forEach((p) => (p.style.display = 'none'));
      else if (['shop', 'confirm', 'poi'].includes(overlayKind()))
        hideOverlay();
      else if (!overlayKind()) leaveRun();
    }
  });
  document.querySelector('.qtitle').onclick = () => toggleQuests();
  $('c').addEventListener('mousedown', (ev) => {
    // düşmana tıkla: hedef kartı
    if (state.mode !== 'run') return;
    const x = state.view.x + ev.clientX,
      y = state.view.y + ev.clientY;
    let best = null,
      bd = 1e9;
    for (const e of state.ents)
      if (e.team === 'e' && e.hp > 0 && !e.under) {
        const d = Math.hypot(e.x - x, e.y - y) - e.r;
        if (d < 14 && d < bd) {
          bd = d;
          best = e;
        }
      }
    state.target = best;
  });
}

function buildInv() {
  const g = $('invGrid');
  g.innerHTML = '';
  state.inventory.forEach((inst, i) => {
    const d = document.createElement('div');
    d.className = 'slot' + (i === sel ? ' sel' : '');
    if (inst) {
      const r = RARITIES[inst.def.rarity];
      d.style.borderColor = r.col;
      d.style.color = r.col;
      d.textContent = inst.def.name;
      d.onmouseenter = () => setTip(() => itemTip(inst));
      d.onmouseleave = () => setTip(null);
      d.onclick = () => {
        sel = i;
        invSig = '';
      };
    }
    g.appendChild(d);
  });
  const s = $('invSel'),
    inst = state.inventory[sel];
  s.innerHTML = '';
  if (inst)
    s.appendChild(
      btn(
        'Sat: ' +
          inst.def.name +
          ' (+' +
          RARITIES[inst.def.rarity].sell +
          ' altın)',
        () => {
          sellItem(sel);
          sel = -1;
          setTip(null);
          invSig = '';
        },
      ),
    );
}
function slotEl(on, glyph, label, col, click, tip) {
  const d = document.createElement('div');
  d.className = 'cslot' + (on ? ' on' : '');
  if (on) {
    d.style.borderColor = col;
    d.style.color = col;
    d.innerHTML = '<span class="gl">' + glyph + '</span>' + label;
    d.onclick = click;
    d.onmouseenter = () => setTip(tip);
    d.onmouseleave = () => setTip(null);
  } else d.textContent = 'Boş slot';
  return d;
}
function buildCls() {
  // sınıf slotları (envanter gibi), kombolar, bırakma
  const p = state.player,
    g = $('clsGrid');
  g.innerHTML = '';
  for (let i = 0; i < state.classSlots; i++) {
    const id = p.classes[i],
      c = id && CLASSES[id];
    g.appendChild(
      slotEl(
        !!c,
        CLASS_GLYPH[id],
        c && c.name,
        c && RARITIES[c.rarity].col,
        () => {
          clsSel = id;
          clsSig = '';
        },
        () =>
          c &&
          '<b style="color:' +
            RARITIES[c.rarity].col +
            '">' +
            c.name +
            '</b> <small>' +
            RARITIES[c.rarity].name +
            '</small><div class="dim">' +
            c.desc +
            '</div>' +
            partLines(c.part),
      ),
    );
    if (id === clsSel) g.lastChild.classList.add('sel');
  }
  const s = $('clsSel');
  s.innerHTML = '';
  if (clsSel && CLASSES[clsSel] && p.classes.includes(clsSel))
    s.appendChild(
      btn('Bırak: ' + CLASSES[clsSel].name, () =>
        confirmBox(
          CLASSES[clsSel].name +
            " bırakılsın mı? Bonusları ve kombo'ları kalkar, slot boşalır.",
          () => {
            releaseClass(clsSel);
            clsSel = null;
            clsSig = '';
          },
        ),
      ),
    );
  $('clsCombos').innerHTML =
    (p.extras || [])
      .map(
        (x) =>
          '<div><b style="color:#e0b040">' +
          (x.kind === 'synergy' ? '⚔ ' : '✦ ') +
          x.name +
          '</b><small>' +
          x.desc +
          '</small></div>',
      )
      .join('') ||
    '<small style="color:#9aa3b5">Henüz kombo yok. İki sınıf birleşince kombo oluşur.</small>';
}
function buildPet() {
  const g = $('petGrid');
  g.innerHTML = '';
  for (let i = 0; i < state.petSlots; i++) {
    const pt = state.pets[i],
      d = pt && PETS[pt.petId];
    g.appendChild(
      slotEl(
        !!pt,
        d && d.icon,
        d && d.name,
        d && RARITIES[d.rarity].col,
        () => {
          petSel = pt;
          petSig = '';
        },
        () =>
          d &&
          '<b style="color:' +
            RARITIES[d.rarity].col +
            '">' +
            d.name +
            '</b> <small>' +
            RARITIES[d.rarity].name +
            '</small><div class="dim">' +
            d.desc +
            '</div>',
      ),
    );
    if (pt && pt === petSel) g.lastChild.classList.add('sel');
  }
  const s = $('petSel');
  s.innerHTML = '';
  if (petSel && state.pets.includes(petSel)) {
    const pt = petSel,
      d = PETS[pt.petId];
    s.innerHTML =
      '<div style="margin:8px 0 4px"><b>' +
      d.name +
      '</b> · Skill slotu ' +
      pt.abilities.length +
      '/' +
      state.petSkillSlots +
      '</div>' +
      pt.abilities
        .map(
          (a) =>
            '<div><small>' +
            glyphOf(a) +
            ' ' +
            a.name +
            ' · ' +
            a.cooldown +
            ' sn</small></div>',
        )
        .join('');
    s.appendChild(
      btn('Bırak: ' + d.name, () =>
        confirmBox(d.name + ' bırakılsın mı?', () => {
          removePet(pt);
          petSel = null;
          petSig = '';
        }),
      ),
    );
  }
}

// Durum ikonları (zehir, yavaşlama, zırh kırma, sersemletme): oyuncu ve hedef için ortak
function statusItems(e) {
  const L = [],
    z = e.poison,
    sl = e.slow,
    sh = e.shred;
  if (z)
    L.push({
      id: 'poison',
      glyph: '☠️',
      col: '#e05a5a',
      frac: z.t / 3,
      text: '',
      tip: () =>
        '<b style="color:#6be04a">Zehir</b><div class="dim">' +
        z.dps.toFixed(1) +
        ' hasar/sn · savunmayı yok sayar</div>',
    });
  if (sl)
    L.push({
      id: 'slow',
      glyph: '🐌',
      col: '#e05a5a',
      frac: sl.t / 1.5,
      text: '',
      tip: () =>
        '<b style="color:#6fd3ff">Yavaşlama</b><div class="dim">Hareket hızı %' +
        Math.round(sl.v * 100) +
        ' düştü</div>',
    });
  if (sh)
    L.push({
      id: 'shred',
      glyph: '💔',
      col: '#e05a5a',
      frac: sh.t / 4,
      text: '',
      tip: () =>
        '<b style="color:#c05bff">Void aşınması</b><div class="dim">Zırh ve büyü direnci %' +
        Math.round(sh.v * 100) +
        ' düştü</div>',
    });
  if (e.stun > 0)
    L.push({
      id: 'stun',
      glyph: '💫',
      col: '#e05a5a',
      frac: Math.min(1, e.stun),
      text: '',
      tip: () =>
        '<b style="color:#ffd84f">Sersemletme</b><div class="dim">Hareket edemiyor ve skill kullanamıyor</div>',
    });
  return L;
}
// Statlar paneli alt kısmı: silah / skiller / kartlar ikon olarak, hover'da ne yaptığı, hasarı, öldürme'i
function updateStatIcons() {
  const p = state.player,
    w = WEAPONS[state.weapon];
  syncIcons(
    $('stW'),
    w
      ? [
          {
            id: 'w',
            glyph: glyphOf(w.ability),
            col: '#e0b040',
            frac: 0,
            text: '',
            tip: () =>
              '<b>' +
              w.name +
              '</b><div class="dim">' +
              w.desc +
              '</div>' +
              abTip(w.ability, p),
          },
        ]
      : [],
  );
  syncIcons(
    $('stS'),
    p.abilities
      .filter((a) => !(w && a === w.ability))
      .map((ab) => ({
        id: ab.id,
        glyph: glyphOf(ab),
        col: ab.dmgType === 'magic' ? '#6fb4ff' : '#e8e6df',
        frac: 0,
        text: '',
        tip: () => abTip(ab, p),
      })),
  );
  syncIcons(
    $('stC'),
    [...new Set(state.picked)].map((n) => {
      const c = CARDS.find((x) => x.name === n),
        cnt = state.picked.filter((x) => x === n).length;
      return {
        id: n,
        glyph: cardGlyph(c),
        col: RARITIES[(c && c.rarity) || 'common'].col,
        frac: 0,
        text: cnt > 1 ? cnt : '',
        tip: () => cardTip(n),
      };
    }),
  );
}
function updateTarget() {
  const t = state.target,
    box = $('tgt');
  if (!t || t.hp <= 0 || t.under || !state.ents.includes(t)) {
    state.target = null;
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';
  $('tn').textContent = t.name || '?';
  $('tf').style.width = (100 * Math.max(0, t.hp)) / (t.hpMax || 1) + '%';
  $('tt').textContent = Math.ceil(t.hp) + ' / ' + Math.ceil(t.hpMax || 0);
  const sh = 1 - (t.shred ? t.shred.v : 0),
    R = t.res || {},
    pc = (v) => Math.round((v || 0) * 100);
  const rows = STAT_KEYS.filter(
    (k) => Math.abs(stat(t, k) - BASE[k]) > 1e-9 || k === 'armor' || k === 'mr',
  )
    .map(
      (k) =>
        '<span data-k="' +
        k +
        '">' +
        LABELS[k] +
        '</span><b data-k="' +
        k +
        '">' +
        fmtStat(k, stat(t, k) * (k === 'armor' || k === 'mr' ? sh : 1)) +
        '</b>',
    )
    .join('');
  const html =
    '<div class="sg">' +
    rows +
    '</div>Hasar azaltma %' +
    pc(t.dr) +
    '<br>Direnç: yavaşlatma %' +
    pc(R.slow) +
    ' · zehir %' +
    pc(R.poison) +
    ' · void %' +
    pc(R.void) +
    ' · zincir %' +
    pc(R.chain) +
    (t.abilities.length
      ? '<br>Skiller: ' + t.abilities.map((a) => a.name).join(', ')
      : '') +
    (t.absorb
      ? '<br><b style="color:#6fd36f">Emer: ' +
        t.absorb
          .map(
            (x) =>
              ({
                Fire: 'Ateş',
                Ice: 'Buz',
                Poison: 'Zehir',
                Lightning: 'Yıldırım',
              })[x] || x,
          )
          .join(', ') +
        ' (can yeniler)</b>'
      : '');
  if (html !== box._h) {
    box._h = html;
    $('ts').innerHTML = html;
  }
  syncIcons($('te'), statusItems(t));
}

// Dash ikonu (skill barının başında): dolum taraması + kalan hak
const dashItem = (p) => {
  const d = dashState(p),
    mx = Math.round(stat(p, 'dashCharges')),
    rt = dashRecharge(p);
  return {
    id: 'dash',
    glyph: '💨',
    col: '#5cc8ff',
    frac: d.charges < mx ? Math.max(0, d.t) / rt : 0,
    text: d.charges + '/' + mx,
    tip: () =>
      '<b>Dash</b> <small>Shift</small><div class="dim">Kısa mesafe atılır ve ~' +
      stat(p, 'dashIframe').toFixed(2) +
      ' sn dokunulmaz olursun.</div><div>Dolum: <b>' +
      rt.toFixed(1) +
      ' sn</b> · Hak: <b>' +
      d.charges +
      '/' +
      mx +
      '</b></div><div class="dim">Bir saldırı değmeden hemen önce dash atarsan <b>MÜKEMMEL KAÇIŞ</b>: zaman yavaşlar + saldırı hızı buff\'ı.</div>',
  };
};
function renderObj() {
  // tur hedefi kutusu: ikon, başlık, ilerleme çubuğu, ödül
  const o = objectiveInfo(),
    box = $('obj');
  if (!o) {
    box.style.display = 'none';
    box._k = '';
    return;
  }
  box.style.display = 'block';
  box.className = o.status + (o.flash > 0 ? ' new' : '');
  const k = o.icon + o.label + o.title + o.detail;
  if (k !== box._k) {
    box._k = k;
    box.innerHTML =
      '<div class="ol">' +
      o.label +
      '</div><div class="ot">' +
      o.icon +
      ' ' +
      o.title +
      '</div><div class="od">' +
      o.detail +
      '</div><div class="ob"><i></i></div>';
  }
  box.querySelector('.ob i').style.width = 100 * o.frac + '%';
}
let qSig = '',
  qEls = {},
  qNow = {};
function renderQuests() {
  // sol görev listesi; tıklanabilirler haritada 📍 gösterir
  const L = questList(),
    box = $('quests'),
    list = $('qlist'),
    sig = L.map((q) => q.id).join('|'),
    closed = !!meta.settings.questsClosed;
  box.style.display = L.length ? 'block' : 'none';
  box.classList.toggle('collapsed', closed);
  const ttl =
    (closed ? '▸ ' : '▾ ') + 'GÖREVLER' + (closed ? ' (' + L.length + ')' : '');
  if (box._t !== ttl) {
    box._t = ttl;
    box.firstChild.textContent = ttl;
  }
  const wp = state.waypoint;
  if (wp && wp.qid) {
    const q = L.find((x) => x.id === wp.qid);
    if (q && q.at) {
      wp.x = q.at.x;
      wp.y = q.at.y;
    } else state.waypoint = null;
  } // takip edilen görev: yol işareti hedefi canlı izler
  if (sig !== qSig) {
    qSig = sig;
    qEls = {};
    list.innerHTML = '';
    for (const q of L) {
      const d = document.createElement('div');
      d.innerHTML =
        '<div class="qh"></div><div class="qt"></div><div class="qs"></div><div class="qb"><i></i></div>';
      d.onclick = () => {
        const c = qNow[q.id];
        if (!c || !c.at) return;
        sfx('click');
        if (state.waypoint && state.waypoint.qid === q.id) {
          state.waypoint = null;
          toast('Yol işareti kaldırıldı');
        } else {
          setWaypoint(c.at, c.title, q.id);
          toast('📍 Yol gösteriliyor: ' + c.title);
        }
      };
      list.appendChild(d);
      qEls[q.id] = d;
    }
  }
  qNow = {};
  for (const q of L) {
    qNow[q.id] = q;
    const d = qEls[q.id],
      k =
        q.head +
        q.icon +
        q.title +
        q.sub +
        q.status +
        !!q.at +
        (state.waypoint && state.waypoint.qid === q.id);
    if (d._k !== k) {
      d._k = k;
      d.className =
        'q ' +
        (q.status || '') +
        (q.at ? ' go' : '') +
        (state.waypoint && state.waypoint.qid === q.id ? ' tracked' : '');
      const c = d.children;
      c[0].textContent = q.head;
      c[1].textContent = q.icon + ' ' + q.title + (q.at ? '  📍' : '');
      c[2].textContent = q.sub || '';
      c[3].style.display = q.frac == null ? 'none' : 'block';
    }
    d.children[3].firstChild.style.width = 100 * (q.frac || 0) + '%';
  }
}
function showBanners() {
  // TUR n / TAMAMLANDI / BOSS / SEVİYE banner'ları
  while (state.bannerQ.length) {
    const b = state.bannerQ.shift(),
      d = document.createElement('div');
    d.className = 'bn ' + (b.kind || 'wave');
    d.innerHTML =
      '<b>' + b.text + '</b>' + (b.sub ? '<span>' + b.sub + '</span>' : '');
    $('banners').appendChild(d);
    setTimeout(() => d.remove(), 2600);
  }
}
const fmtTime = (s) =>
  Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
function summaryEl() {
  // koşu özeti: istatistikler + en çok hasar veren skiller
  const d = document.createElement('div'),
    p = state.player,
    top = Object.entries(state.abStats)
      .sort((a, b) => b[1].dmg - a[1].dmg)
      .slice(0, 5),
    mx = top.length ? top[0][1].dmg || 1 : 1;
  d.className = 'sum';
  d.innerHTML =
    '<div class="sg2">' +
    [
      ['Ulaşılan tur', state.wave.n],
      ['Öldürme', state.kills],
      ['En iyi seri', state.bestStreakRun || 0],
      ['Seviye', state.level],
      ['Süre', fmtTime(state.runTime || 0)],
      ['Kart', state.picked.length],
      ['Yenilen boss', state.bossKillsRun || 0],
      ['Sınıf / Pet', p.classes.length + ' / ' + state.pets.length],
    ]
      .map(([k, v]) => '<span>' + k + '</span><b>' + v + '</b>')
      .join('') +
    '</div>' +
    (top.length
      ? '<div class="sh">EN ÇOK HASAR VEREN</div>' +
        top
          .map(
            ([id, s]) =>
              '<div class="bar2"><i style="width:' +
              (100 * s.dmg) / mx +
              '%"></i><span>' +
              ((ABILITIES[id] && ABILITIES[id].name) ||
                (id === 'orbit' ? 'Tırpanlar' : id)) +
              '</span><b>' +
              Math.round(s.dmg).toLocaleString('tr') +
              '</b></div>',
          )
          .join('')
      : '');
  return d;
}
export function updateHud() {
  const p = state.player,
    w = state.wave,
    mh = stat(p, 'maxHp');
  frame++;
  $('hpf').style.width = (100 * Math.max(0, p.hp)) / mh + '%';
  $('hpt').textContent = Math.ceil(Math.max(0, p.hp)) + ' / ' + Math.ceil(mh);
  $('xpf').style.width = (100 * state.xp) / xpNeed() + '%';
  $('coins').textContent = 'Sv ' + state.level + ' · ' + state.coins + ' altın';
  const left =
    state.ents.filter((e) => e.team === 'e').length +
    w.toSpawn +
    (w.bossPending ? 1 : 0);
  $('wave').textContent =
    w.n === 0
      ? 'Hazır'
      : 'Tur ' + w.n + (w.phase === 'active' ? ' · kalan ' + left : ' · bitti');
  $('startBtn').style.display = w.phase === 'active' ? 'none' : 'block';
  $('startBtn').disabled = state.over || !state.weapon;
  const done = w.phase === 'active' ? w.n - 1 : w.n,
    blk = Math.floor(done / 5),
    psig = blk + ',' + done + ',' + w.phase; // 5 baloncuk, 5. = boss
  if (psig !== pipSig) {
    pipSig = psig;
    $('pips').innerHTML = [0, 1, 2, 3, 4]
      .map((i) => {
        const n = blk * 5 + i + 1;
        return (
          '<div class="pip' +
          (n <= done ? ' done' : '') +
          (w.phase === 'active' && n === w.n ? ' cur' : '') +
          (i === 4 ? ' boss' : '') +
          (n % 3 === 0 ? ' swarm' : '') +
          '" title="Tur ' +
          n +
          (i === 4 ? ' · BOSS' : '') +
          (n % 3 === 0 ? ' · SÜRÜ' : '') +
          '">' +
          (n <= done ? '✓' : i === 4 ? '☠' : n) +
          '</div>'
        );
      })
      .join('');
  }
  const bs = state.ents.filter((e) => e.boss),
    bb = $('bossbar'); // grup bosslarda toplam can
  bb.style.display = bs.length ? 'block' : 'none';
  if (bs.length) {
    bb.firstChild.style.width =
      (100 *
        Math.max(
          0,
          bs.reduce((a, b) => a + b.hp, 0),
        )) /
        bs.reduce((a, b) => a + b.hpMax, 0) +
      '%';
    bb.lastChild.textContent =
      (bs[0].bossName || bs.map((b) => b.name).join(' · ')) +
      (bs[0].phase > 1 ? ' · Faz ' + bs[0].phase : '') +
      (bs[0].exposed > 0 ? ' · BİTKİN! ×1.6' : '');
  }
  renderQuests();
  showBanners();
  const aff = state.mode === 'run' && !overlayKind() && affordable();
  shopBtn.classList.toggle('pulse', aff); // yükseltme alacak kadar altın varsa buton yanıp söner
  if (
    aff &&
    w.phase === 'idle' &&
    (state.remindT = (state.remindT ?? 10) - 1 / 60) <= 0
  ) {
    toast('💰 Yükseltme alacak kadar altının var! (B)');
    state.remindT = 30;
  }
  const t = $('toast');
  t.textContent = state.msg;
  t.style.opacity = state.msgT > 0 ? 1 : 0;
  if (state.msgT > 0) state.msgT -= 1 / 60;

  // buff / debuff barı (HP'nin altı)
  syncIcons($('buffs'), [
    ...p.buffs.map((b) => ({
      id: 'b_' + b.id,
      glyph: b.glyph,
      col: '#6fd36f',
      frac: b.t / b.max,
      text: Math.ceil(b.t),
      tip: () =>
        '<b style="color:#6fd36f">' +
        b.name +
        '</b><div class="dim">' +
        b.desc +
        '</div><div>' +
        Math.max(0, b.t).toFixed(1) +
        ' sn kaldı</div>',
    })),
    ...statusItems(p),
    ...(state.curse && state.curse.waves > 0
      ? [
          {
            id: 'curse',
            glyph: '😈',
            col: '#e05a5a',
            frac: 0,
            text: state.curse.waves,
            tip: () =>
              '<b style="color:#e05a5a">Lanet</b><div class="dim">Düşman canı +%25. ' +
              state.curse.waves +
              ' tur kaldı. (Karşılığında kalıcı hasar bonusu aldın)</div>',
          },
        ]
      : []),
  ]);
  // skill barı (ekranın alt ortası): ikon + dönen cooldown taraması
  syncIcons($('skills'), [
    dashItem(p),
    ...p.abilities.map((ab) => {
      const cd = Math.max(0, p.cd[ab.id] || 0),
        mx = p.cdMax[ab.id] || ab.cooldown,
        as = ab.tags.includes('Weapon') ? stat(p, 'attackSpeed', ab.tags) : 1;
      return {
        id: ab.id,
        glyph: glyphOf(ab),
        col: ab.dmgType === 'magic' ? '#6fb4ff' : '#e8e6df',
        frac: cd / mx,
        text: cd > 0.05 ? cd.toFixed(cd < 10 ? 1 : 0) : '',
        tip: () =>
          abTip(ab, p) +
          '<div class="dim">Tıkla: ' +
          (p.off && p.off[ab.id] ? 'AÇ (şu an KAPALI)' : 'kapat') +
          '</div>',
        off: !!(p.off && p.off[ab.id]),
        click: () => {
          p.off = p.off || {};
          p.off[ab.id] = !p.off[ab.id];
          sfx('click');
        },
      };
    }),
  ]);
  // sol alt: sınıflar, kombolar, petler (hover'da açıklama)
  syncIcons($('clsRow'), [
    ...state.mutators.map((mu) => ({
      id: 'm_' + mu.id,
      glyph: '🎲',
      col: '#ff8a3d',
      frac: 0,
      text: '',
      tip: () =>
        '<b style="color:#ff8a3d">Mutatör: ' +
        mu.name +
        '</b><div class="dim">' +
        mu.desc +
        '</div>' +
        (state.heat ? '<div>Zorluk ' + state.heat + '</div>' : ''),
    })),
    ...p.classes.map((id) => {
      const c = CLASSES[id];
      return {
        id: 'c_' + id,
        glyph: CLASS_GLYPH[id] || '✦',
        col: RARITIES[c.rarity].col,
        frac: 0,
        text: '',
        tip: () =>
          '<b style="color:' +
          RARITIES[c.rarity].col +
          '">' +
          c.name +
          '</b> <small>' +
          RARITIES[c.rarity].name +
          '</small><div class="dim">' +
          c.desc +
          '</div>' +
          partLines(c.part),
      };
    }),
    ...(p.extras || []).map((x) => ({
      id: 'x_' + x.name,
      glyph: x.kind === 'synergy' ? '⚔️' : '✦',
      col: '#e0b040',
      frac: 0,
      text: '',
      tip: () =>
        '<b style="color:#e0b040">' +
        x.name +
        '</b> <small>' +
        (x.kind === 'synergy' ? 'Silah sinerjisi' : 'Kombo') +
        '</small><div class="dim">' +
        x.desc +
        '</div>',
    })),
  ]);
  syncIcons(
    $('petRow'),
    state.pets.map((pt) => {
      const d = PETS[pt.petId],
        a0 = pt.abilities[0],
        cd = Math.max(0, pt.cd[a0.id] || 0),
        mx = pt.cdMax[a0.id] || a0.cooldown;
      return {
        id: 'p_' + pt.petId,
        glyph: d.icon,
        col: d.col,
        frac: cd / mx,
        text: cd > 0.05 ? cd.toFixed(0) : '',
        tip: () =>
          '<b style="color:' +
          d.col +
          '">' +
          d.name +
          '</b> <small>' +
          RARITIES[d.rarity].name +
          '</small><div class="dim">' +
          d.desc +
          '</div>' +
          pt.abilities
            .map(
              (a) =>
                '<div>' +
                glyphOf(a) +
                ' ' +
                a.name +
                ' · ' +
                a.cooldown +
                ' sn<br><small>' +
                abDesc(a, pt) +
                '</small></div>',
            )
            .join(''),
      };
    }),
  );
  updateTarget();

  const sig = state.inventory.map((i) => (i ? i.def.id : '-')).join() + sel;
  if (sig !== invSig) {
    invSig = sig;
    buildInv();
  }
  const cs =
    p.classes.join() +
    state.classSlots +
    (p.extras || []).map((x) => x.name).join() +
    clsSel;
  if (cs !== clsSig) {
    clsSig = cs;
    buildCls();
  }
  const ps =
    state.pets.map((x) => x.petId + x.abilities.length).join() +
    state.petSlots +
    (petSel && petSel.petId) +
    state.petSkillSlots;
  if (ps !== petSig) {
    petSig = ps;
    buildPet();
  }
  if (frame % 10 === 0 && open('stat')) {
    $('statGrid').innerHTML = STAT_KEYS.map(
      (k) =>
        '<span data-k="' +
        k +
        '">' +
        LABELS[k] +
        '</span><b data-k="' +
        k +
        '">' +
        fmtStat(k, stat(p, k)) +
        '</b>',
    ).join('');
  }
  if (open('stat')) updateStatIcons();
  if (frame % 6 === 0) refreshTip();
  if (frame % 60 === 1) refreshKbd();
  if (state.over && !overShown) {
    overShown = true;
    finishRun();
    hideOverlay();
    showOverlay(
      'Düştün — Tur ' + w.n,
      [summaryEl(), btn('Menüye dön', () => location.reload())],
      'over',
    );
  }
}
