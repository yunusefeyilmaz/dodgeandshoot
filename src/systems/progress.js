import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addPart } from '../core/entity.js';
import { meta, save, hooks } from '../core/save.js';
import {
  MAX_ACC,
  accNeed,
  accountBonus,
  REWARDS,
  titleOf,
} from '../data/account.js';
import { GOALS, GOAL_REWARD } from '../data/goals.js';
// ——— GELİŞİM HİSSİ: Güç Puanı ———
// Tek bir sayı: saldırı gücü (hasar×hız×kritik×efektler) ile dayanıklılığın (can×zırh×çalma) geometrik ortalaması. Her kart/yükseltme sayıyı artırır;
// oyuncu "ne kadar güçlendim" sorusunun cevabını anında görür. Dengeyi etkilemez, yalnız gösterge.
export function powerRating(p = state.player) {
  if (!p) return 0;
  const S = (n) => stat(p, n),
    mh = Math.max(1, S('maxHp'));
  const fx =
    1 +
    0.5 * S('multishot') +
    0.15 * S('pierce') +
    0.4 * S('chain') +
    0.5 * S('poison') +
    0.8 * S('blast') +
    0.1 * S('ricochet') +
    0.2 * S('homing') * 0.1 +
    0.25 * S('crescent') +
    0.25 * S('surge') +
    0.2 * S('volley') +
    0.3 * S('killNova') +
    0.3 * S('voidShred') +
    0.15 * S('slow');
  const dps =
    (14 + S('ad') + 0.9 * S('ap')) *
    S('attackSpeed') *
    S('damage') *
    (1 + Math.min(1, S('critChance')) * (S('critDmg') - 1)) *
    fx *
    (1 + S('haste') / 100) *
    (1 + 0.25 * Math.max(0, p.abilities.length - 1)) *
    (1 + S('armorPen') * 0.3 + S('lethality') * 0.01);
  const tough =
    mh *
    (1 + S('armor') / 100) *
    (1 + S('mr') / 200) *
    (1 + 3 * (S('lifesteal') + S('omnivamp')) + (8 * S('regen')) / mh) *
    (1 + 0.08 * S('dashCharges')) *
    (1 + S('speed') / 600);
  return Math.max(1, Math.round(Math.sqrt(dps * tough) * 1.6));
}
export const fmtPower = (n) =>
  n >= 1e6
    ? (n / 1e6).toFixed(1) + 'M'
    : n >= 1e4
      ? (n / 1e3).toFixed(0) + 'K'
      : n >= 1e3
        ? (n / 1e3).toFixed(1) + 'K'
        : String(n);

// ——— HESAP RÜTBESİ ———
export const acc = () => (meta.acc ??= { xp: 0, lvl: 1 });
export function addAccXp(n) {
  // {from, to, gained:[ödüller], xp, need}
  const a = acc(),
    from = a.lvl,
    got = [];
  a.xp += Math.max(0, Math.round(n));
  while (a.lvl < MAX_ACC && a.xp >= accNeed(a.lvl)) {
    a.xp -= accNeed(a.lvl);
    a.lvl++;
    got.push({ lv: a.lvl, ...REWARDS[a.lvl] });
  }
  if (a.lvl >= MAX_ACC) a.xp = 0;
  save(true);
  return { from, to: a.lvl, gained: got, xp: a.xp, need: accNeed(a.lvl) };
}
export function applyAccount(p) {
  // koşu başında kalıcı rütbe ödüllerini uygula
  const b = accountBonus(acc().lvl);
  addPart(p, {
    mods: [
      { stat: 'maxHp', op: 'add', value: b.hp },
      { stat: 'damage', op: 'mul', value: 1 + b.dmg },
      { stat: 'luck', op: 'add', value: b.luck },
      { stat: 'speed', op: 'mul', value: 1 + b.spd },
      { stat: 'armor', op: 'add', value: b.armor },
    ],
  });
  state.coins += b.gold;
  state.rerolls = (state.rerolls || 0) + b.reroll;
  state.banishes = (state.banishes || 0) + b.ban;
  state.freeCards = b.card;
  state.accBonus = b;
}
export { titleOf };
export { rwText } from '../data/account.js';
// ——— KOŞU HEDEFLERİ ———
export function rollGoals() {
  state.goalBase = {
    dodges: meta.stats.dodges || 0,
    evos: meta.stats.evos || 0,
  };
  state.goalSouls = 0;
  state.goalXp = 0;
  state.goals = [1, 2, 3].map((t) => {
    const l = GOALS.filter((g) => g.tier === t),
      g = l[(Math.random() * l.length) | 0];
    return {
      id: g.id,
      tier: t,
      text: g.text,
      t: g.t,
      reward: GOAL_REWARD[t],
      cur: 0,
      done: false,
    };
  });
}
const PW = [250, 500, 1000, 2500, 5000, 10000, 25000, 50000];
export function updateGoals() {
  for (const g of state.goals || []) {
    const d = GOALS.find((x) => x.id === g.id);
    g.cur = Math.min(g.t, Math.max(0, d.cur(state)));
    if (!g.done && g.cur >= g.t) {
      g.done = true;
      state.goalSouls += g.reward;
      state.goalXp += Math.round(g.reward * 0.5);
      state.bannerQ.push({
        text: 'HEDEF TAMAM',
        sub: g.text + ' · +' + g.reward + ' Ruh',
        kind: 'done',
      });
      hooks.popup(
        '🎯 Hedef tamamlandı',
        '+' + g.reward + ' Ruh · +' + Math.round(g.reward * 0.5) + ' Hesap XP',
        '#ffd84f',
      );
    }
  }
  for (const t of PW)
    if ((state.bestPower || 0) >= t && !(state.pwMs || (state.pwMs = {}))[t]) {
      state.pwMs[t] = 1;
      if (state.pwReady)
        state.bannerQ.push({
          text: '⚡ GÜÇ ' + fmtPower(t),
          sub: 'Daha da güçleniyorsun!',
          kind: 'evo',
        });
    }
  state.pwReady = true;
}
