import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { LABELS, fmtStat } from '../core/labels.js';
import { RARITIES } from '../core/rarity.js';
import { CLASSES } from '../data/classes.js';
import { startWave } from '../systems/waves.js';
import { sellItem } from '../systems/inventory.js';
import { openShop } from './shop.js';
import { picked } from './cards.js';
import { showOverlay, hideOverlay, overlayKind, btn } from './overlay.js';
import { setTip, refreshTip, itemTip, partLines } from './tooltip.js';
const $ = (id) => document.getElementById(id);
const panels = { inv: $('invP'), stat: $('statP') };
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
];
let pipSig = '',
  sel = -1,
  invSig = '',
  clsSig = '',
  frame = 0,
  overShown = false;

function toggle(p) {
  if (p === 'shop') {
    if (overlayKind() === 'shop') hideOverlay();
    else if (!overlayKind() && state.weapon) openShop();
    return;
  }
  const el = panels[p];
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}
export function initHud() {
  $('startBtn').onclick = startWave;
  $('auto').onchange = (e) => (state.wave.auto = e.target.checked);
  document
    .querySelectorAll('[data-p]')
    .forEach((b) => (b.onclick = () => toggle(b.dataset.p)));
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'i') toggle('inv');
    else if (k === 'c') toggle('stat');
    else if (k === 'b') toggle('shop');
    else if (k === ' ') {
      e.preventDefault();
      if (!overlayKind()) startWave();
    } else if (k === 'escape') {
      panels.inv.style.display = panels.stat.style.display = 'none';
      if (overlayKind() === 'shop') hideOverlay();
    }
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

export function updateHud() {
  const p = state.player,
    w = state.wave,
    mh = stat(p, 'maxHp');
  frame++;
  $('hpf').style.width = (100 * Math.max(0, p.hp)) / mh + '%';
  $('hpt').textContent = Math.ceil(Math.max(0, p.hp)) + ' / ' + Math.ceil(mh);
  $('xpf').style.width = (100 * state.xp) / (4 + state.level * 3) + '%';
  $('coins').textContent = 'Lv ' + state.level + ' · ' + state.coins + ' coin';
  const left = state.ents.length - 1 + w.toSpawn + (w.bossPending ? 1 : 0);
  $('wave').textContent =
    w.n === 0
      ? 'Hazır'
      : 'Tur ' + w.n + (w.phase === 'active' ? ' · kalan ' + left : ' · bitti');
  $('startBtn').style.display = w.phase === 'active' ? 'none' : 'block';
  $('startBtn').disabled = state.over || !state.weapon;
  // Tur göstergesi: 5 baloncuk, 5. = boss (☠), geçilen turlar ✓, her 3. tur swarm (turuncu)
  const done = w.phase === 'active' ? w.n - 1 : w.n,
    blk = Math.floor(done / 5),
    psig = blk + ',' + done + ',' + w.phase;
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
  const boss = state.ents.find((e) => e.boss),
    bb = $('bossbar');
  bb.style.display = boss ? 'block' : 'none';
  if (boss) {
    bb.firstChild.style.width = (100 * Math.max(0, boss.hp)) / boss.hpMax + '%';
    bb.lastChild.textContent = boss.name;
  }
  const t = $('toast');
  t.textContent = state.msg;
  t.style.opacity = state.msgT > 0 ? 1 : 0;
  if (state.msgT > 0) state.msgT -= 1 / 60;

  const sig = state.inventory.map((i) => (i ? i.def.id : '-')).join() + sel;
  if (sig !== invSig) {
    invSig = sig;
    buildInv();
  }
  const cs = p.classes.join() + state.combos.join();
  if (cs !== clsSig) {
    clsSig = cs;
    const bl = $('bl');
    bl.innerHTML = '';
    p.classes.forEach((id) => {
      const c = CLASSES[id],
        s = document.createElement('span');
      s.textContent = c.name;
      s.onmouseenter = () =>
        setTip(
          () =>
            '<b>' +
            c.name +
            '</b><div class="dim">' +
            c.desc +
            '</div>' +
            partLines(c.part),
        );
      s.onmouseleave = () => setTip(null);
      bl.appendChild(s);
    });
    state.combos.forEach((n) => {
      const s = document.createElement('span');
      s.textContent = '✦ ' + n;
      s.style.color = '#e0b040';
      bl.appendChild(s);
    });
  }
  if (frame % 10 === 0 && panels.stat.style.display === 'block') {
    $('statGrid').innerHTML = STAT_KEYS.map(
      (k) =>
        '<span>' + LABELS[k] + '</span><b>' + fmtStat(k, stat(p, k)) + '</b>',
    ).join('');
    $('statExtra').innerHTML =
      'Silah: ' +
      (state.weapon || '—') +
      ' · Kill: ' +
      state.kills +
      '<br>Skiller: ' +
      p.abilities.map((a) => a.name).join(', ') +
      '<br>Kartlar: ' +
      (picked.join(', ') || '—');
  }
  if (frame % 6 === 0) refreshTip();
  if (state.over && !overShown) {
    overShown = true;
    hideOverlay();
    showOverlay(
      'Öldün — Tur ' + w.n,
      [btn('Yeniden başla', () => location.reload())],
      'over',
    );
  }
}
