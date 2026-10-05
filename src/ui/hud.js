import { state, toast } from '../core/state.js';
import { meta } from '../core/save.js';
import { toggleMute } from '../core/audio.js';
import { stat } from '../core/stats.js';
import { LABELS, DESCS, fmtStat } from '../core/labels.js';
import { RARITIES } from '../core/rarity.js';
import { CLASSES } from '../data/classes.js';
import { PETS } from '../data/pets.js';
import { startWave } from '../systems/waves.js';
import { xpNeed } from '../systems/rewards.js';
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
let pipSig = '',
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
    D('Level · Coin', 'Coin ile Mağaza (B) yükseltmeleri alınır.'),
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
    cls: ['Classlar (K)', 'Class slotların, combolar. Classı bırakabilirsin.'],
    pet: ['Petler (P)', 'Petlerini ve skillerini yönet, bırak.'],
    shop: ['Mağaza (B)', 'Coin ile yetenek ağacından stat al.'],
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
    const k = e.key.toLowerCase();
    if (k === 'm') {
      toggleMute();
      toast(meta.settings.mute ? 'Ses kapalı' : 'Ses açık');
    }
    if (state.mode !== 'run') return;
    if (k === 'i') toggle('inv');
    else if (k === 'c') toggle('stat');
    else if (k === 'k') toggle('cls');
    else if (k === 'p') toggle('pet');
    else if (k === 'b') toggle('shop');
    else if (k === ' ') {
      e.preventDefault();
      if (!overlayKind()) startWave();
    } else if (k === 'escape') {
      if (anyOpen())
        Object.values(panels).forEach((p) => (p.style.display = 'none'));
      else if (['shop', 'confirm', 'poi'].includes(overlayKind()))
        hideOverlay();
      else if (!overlayKind()) leaveRun();
    }
  });
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
          ' coin)',
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
  // class slotları (envanter gibi), combolar, bırakma
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
            " bırakılsın mı? Bonusları ve combo'ları kalkar, slot boşalır.",
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
    '<small style="color:#9aa3b5">Henüz combo yok. İki class birleşince combo oluşur.</small>';
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
// Statlar paneli alt kısmı: silah / skiller / kartlar ikon olarak, hover'da ne yaptığı, hasarı, kill'i
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
export function updateHud() {
  const p = state.player,
    w = state.wave,
    mh = stat(p, 'maxHp');
  frame++;
  $('hpf').style.width = (100 * Math.max(0, p.hp)) / mh + '%';
  $('hpt').textContent = Math.ceil(Math.max(0, p.hp)) + ' / ' + Math.ceil(mh);
  $('xpf').style.width = (100 * state.xp) / xpNeed() + '%';
  $('coins').textContent = 'Lv ' + state.level + ' · ' + state.coins + ' coin';
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
          (n % 3 === 0 ? ' · SWARM' : '') +
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
        tip: () => abTip(ab, p),
      };
    }),
  ]);
  // sol alt: classlar, combolar, petler (hover'da açıklama)
  syncIcons($('clsRow'), [
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
        (x.kind === 'synergy' ? 'Silah sinerjisi' : 'Combo') +
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
  if (state.over && !overShown) {
    overShown = true;
    finishRun();
    hideOverlay();
    showOverlay(
      'Öldün — Tur ' + w.n,
      [btn('Menüye dön', () => location.reload())],
      'over',
    );
  }
}
