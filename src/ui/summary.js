import { state } from '../core/state.js';
import { meta } from '../core/save.js';
import { ABILITIES } from '../data/abilities.js';
import { CHARS, xpFor, MAX_CHAR_LEVEL } from '../data/characters.js';
import { REWARDS, accNeed, titleOf, MAX_ACC, rwText } from '../data/account.js';
import { acc, fmtPower } from '../systems/progress.js';
import { tipOf } from '../data/tips.js';
// Koşu sonu / zafer ekranı: rekorlar, hedefler, animasyonlu kalıcı ilerleme (Ruh, karakter XP, hesap rütbesi, yeni ödüller)
const fmtTime = (s) =>
  Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const tile = (ic, k, v, rec) =>
  '<div class="st' +
  (rec ? ' rec' : '') +
  '"><em>' +
  ic +
  '</em><b data-count="' +
  (typeof v === 'number' ? v : '') +
  '">' +
  (typeof v === 'number' ? 0 : v) +
  '</b><small>' +
  k +
  '</small>' +
  (rec ? '<u>REKOR</u>' : '') +
  '</div>';
function countUp(root) {
  for (const el of root.querySelectorAll('[data-count]')) {
    const to = +el.dataset.count;
    if (!el.dataset.count) continue;
    const t0 = performance.now(),
      dur = 900 + Math.min(900, to * 2);
    const f = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(
        'tr',
      );
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  setTimeout(
    () =>
      root.querySelectorAll('[data-w]').forEach((b) => {
        b.style.width = b.dataset.w + '%';
      }),
    120,
  );
}
export function buildSummary(kind = 'over') {
  const d = document.createElement('div'),
    p = state.player,
    g = state.lastGain || {},
    ch = CHARS[state.charId] || CHARS.warrior,
    S = meta.stats,
    win = kind === 'win';
  const top = Object.entries(state.abStats)
      .sort((a, b) => b[1].dmg - a[1].dmg)
      .slice(0, 4),
    mx = top.length ? top[0][1].dmg || 1 : 1,
    pw = state.bestPower || 0;
  const goals = state.goals || [],
    gDone = goals.filter((x) => x.done).length;
  const cl = g.lvTo || 1,
    cxp = g.xpTo || 0,
    cneed = xpFor(cl),
    a = g.acc,
    al = a ? a.to : acc().lvl,
    ax = a ? a.xp : acc().xp,
    aneed = accNeed(al),
    nxt = REWARDS[al + 1];
  d.className = 'sum2';
  d.innerHTML = `<div class="sum-head ${win ? 'win' : ''}"><span class="sum-badge">${win ? '👑' : '☠️'}</span><div><h2>${win ? 'ZAFER' : 'DÜŞTÜN'}</h2><small>${ch.icon} ${ch.name} · ${state.map.name} · Tur ${state.wave.n}${state.heat ? ' · Zorluk ' + state.heat : ''}</small></div>
      ${win && state.victory ? '<div class="sum-stars">' + '★'.repeat(state.victory.stars) + '<i>' + '★'.repeat(3 - state.victory.stars) + '</i></div>' : ''}</div>
    <div class="sum-tiles">${tile('🌊', 'TUR', state.wave.n, state.wave.n >= (S.bestWave || 0) && state.wave.n > 0)}${tile('💀', 'ÖLDÜRME', state.kills, state.kills >= (S.mostKills || 0) && state.kills > 0)}${tile('🔥', 'EN İYİ SERİ', state.bestStreakRun || 0, (state.bestStreakRun || 0) >= (S.bestStreak || 0) && state.bestStreakRun > 0)}${tile('⚡', 'EN YÜKSEK GÜÇ', fmtPower(pw))}${tile('👹', 'BOSS', state.bossKillsRun || 0)}${tile('⏱️', 'SÜRE', fmtTime(state.runTime || 0))}</div>
    <div class="sum-cols"><section><h4>🎯 HEDEFLER <small>${gDone}/${goals.length}</small></h4>${goals.map((x) => '<div class="gl' + (x.done ? ' ok' : '') + '"><span>' + (x.done ? '✔' : '✖') + '</span><p>' + x.text + '</p><b>' + (x.done ? '+' + x.reward + ' Ruh' : Math.floor(x.cur) + '/' + x.t) + '</b></div>').join('') || '<div class="dim">—</div>'}
        ${top.length ? '<h4 style="margin-top:12px">⚔️ EN ÇOK HASAR</h4>' + top.map(([id, s]) => '<div class="bar2"><i data-w="' + (100 * s.dmg) / mx + '" style="width:0"></i><span>' + ((ABILITIES[id] && ABILITIES[id].name) || (id === 'orbit' ? 'Tırpanlar' : id)) + '</span><b>' + Math.round(s.dmg).toLocaleString('tr') + '</b></div>').join('') : ''}</section>
      <section><h4>📈 KALICI İLERLEME</h4>
        <div class="gain"><span>👻 Kazanılan Ruh</span><b data-count="${g.souls || 0}">0</b></div>
        <div class="prog"><div class="ph"><span>${ch.icon} ${ch.name} <b>Sv ${cl}</b>${g.up ? ' <em>▲ SEVİYE ATLADI</em>' : ''}</span><small>${cl >= MAX_CHAR_LEVEL ? 'MAX' : cxp + ' / ' + cneed}</small></div><div class="pbar2"><i data-w="${cl >= MAX_CHAR_LEVEL ? 100 : (100 * cxp) / cneed}" style="width:0"></i></div></div>
        <div class="prog acc"><div class="ph"><span>🏅 Rütbe <b>${titleOf(al)} · Sv ${al}</b>${a && a.gained.length ? ' <em>▲ RÜTBE ATLADIN</em>' : ''}</span><small>${al >= MAX_ACC ? 'MAX' : ax + ' / ' + aneed}</small></div><div class="pbar2"><i data-w="${al >= MAX_ACC ? 100 : (100 * ax) / aneed}" style="width:0"></i></div></div>
        ${a && a.gained.length ? '<div class="newrw">' + a.gained.map((r) => '<div class="rw"><em>' + r.icon + '</em><div><small>YENİ ÖDÜL · Sv ' + r.lv + '</small><b>' + rwText(r) + '</b></div></div>').join('') + '</div>' : ''}
        ${nxt ? '<div class="nextrw">Sıradaki ödül <b>Sv ' + (al + 1) + '</b>: ' + nxt.icon + ' ' + rwText(nxt) + '</div>' : ''}</section></div>
    <div class="dim sum-tip">💡 ${tipOf((Math.random() * 99) | 0)}</div>`;
  setTimeout(() => countUp(d), 60);
  return d;
}
