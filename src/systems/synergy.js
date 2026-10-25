import { state } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { CARDS } from '../data/cards.js';
// ——— BAĞLAR (kart sinerjileri): aynı temadan kart topladıkça kademe atlar (2 / 4 / 6 kart). Her kademe kalıcı bonus verir.
// Amaç: "bir kart daha alırsam Ateş Kademe II!" merakı + build kimliği. Bonuslar küçüktür ve birikimlidir.
const M = (stat, op, value, tag) => ({ stat, op, value, tag });
export const SYN = {
  fire: {
    name: 'Ateş',
    icon: '🔥',
    col: '#ff7a3a',
    t: [
      [M('blast', 'add', 0.06)],
      [M('blast', 'add', 0.06), M('damage', 'mul', 1.08, 'Fire')],
      [M('blastPower', 'add', 0.25), M('damage', 'mul', 1.12, 'Fire')],
    ],
    txt: [
      'Patlama şansı +%6',
      'Patlama +%6, Ateş skilleri +%8 hasar',
      'Patlama gücü +%25, Ateş skilleri +%12 hasar',
    ],
  },
  ice: {
    name: 'Buz',
    icon: '❄️',
    col: '#6fd0ff',
    t: [
      [M('slow', 'add', 0.12)],
      [M('slow', 'add', 0.12), M('damage', 'mul', 1.08, 'Ice')],
      [M('effPower', 'add', 0.15), M('damage', 'mul', 1.12, 'Ice')],
    ],
    txt: [
      'Yavaşlatma +%12',
      'Yavaşlatma +%12, Buz skilleri +%8 hasar',
      'Efekt gücü +%15, Buz skilleri +%12 hasar',
    ],
  },
  poison: {
    name: 'Zehir',
    icon: '☠️',
    col: '#7bd94a',
    t: [
      [M('poison', 'add', 0.1)],
      [M('poison', 'add', 0.15)],
      [M('poison', 'add', 0.2), M('lifesteal', 'add', 0.02)],
    ],
    txt: ['Zehir +%10', 'Zehir +%15', 'Zehir +%20, %2 can çalma'],
  },
  storm: {
    name: 'Şimşek',
    icon: '⚡',
    col: '#ffe066',
    t: [
      [M('chain', 'add', 0.12)],
      [M('chain', 'add', 0.15), M('haste', 'add', 8)],
      [M('chain', 'add', 0.2), M('haste', 'add', 12)],
    ],
    txt: [
      'Zincir +%12',
      'Zincir +%15, +8 hızlandırma',
      'Zincir +%20, +12 hızlandırma',
    ],
  },
  void: {
    name: 'Void',
    icon: '🌑',
    col: '#b08aff',
    t: [
      [M('voidShred', 'add', 0.06)],
      [M('voidShred', 'add', 0.08), M('magicPen', 'add', 0.06)],
      [M('voidShred', 'add', 0.1), M('ap', 'add', 8)],
    ],
    txt: ['Void aşındırma +%6', 'Void +%8, büyü delme +%6', 'Void +%10, +8 AP'],
  },
  shot: {
    name: 'Mermi',
    icon: '🏹',
    col: '#e6d3a3',
    t: [
      [M('projSpeed', 'mul', 1.1)],
      [M('pierce', 'add', 1)],
      [M('multishot', 'add', 1)],
    ],
    txt: ['Mermi hızı +%10', 'Mermiler +1 deler', '+1 ek mermi'],
  },
  area: {
    name: 'Alan',
    icon: '⭕',
    col: '#ffb36a',
    t: [
      [M('area', 'mul', 1.06)],
      [M('area', 'mul', 1.06)],
      [M('area', 'mul', 1.1)],
    ],
    txt: ['Alan +%6', 'Alan +%6', 'Alan +%10'],
  },
  dash: {
    name: 'Atılgan',
    icon: '💨',
    col: '#7fe3ff',
    t: [
      [M('dashCdMul', 'mul', 0.92)],
      [M('speed', 'mul', 1.06)],
      [M('dashCharges', 'add', 1)],
    ],
    txt: ['Dash dolumu %8 hızlı', 'Hareket hızı +%6', '+1 dash hakkı'],
  },
  guard: {
    name: 'Koruma',
    icon: '🛡️',
    col: '#9bb0c8',
    t: [
      [M('armor', 'add', 6), M('mr', 'add', 6)],
      [M('maxHp', 'add', 40)],
      [M('regen', 'add', 2), M('maxHp', 'add', 40)],
    ],
    txt: ['+6 zırh, +6 büyü direnci', '+40 can', '+2 yenileme, +40 can'],
  },
};
export const AT = [2, 4, 6];
const ST = {
  blast: 'fire',
  blastPower: 'fire',
  blastRadius: 'fire',
  blastCount: 'fire',
  dashBlast: 'fire',
  dashTrail: 'fire',
  slow: 'ice',
  poison: 'poison',
  chain: 'storm',
  voidShred: 'void',
  pierce: 'shot',
  multishot: 'shot',
  projSpeed: 'shot',
  ricochet: 'shot',
  homing: 'shot',
  volley: 'shot',
  area: 'area',
  crescent: 'area',
  surge: 'area',
  dashCharges: 'dash',
  dashCdMul: 'dash',
  dashIframe: 'dash',
  refreshDash: 'dash',
  armor: 'guard',
  mr: 'guard',
  maxHp: 'guard',
  regen: 'guard',
  lifesteal: 'guard',
  omnivamp: 'guard',
};
const AB = {
  Fire: 'fire',
  Ice: 'ice',
  Frost: 'ice',
  Poison: 'poison',
  Lightning: 'storm',
  Dark: 'void',
  Void: 'void',
  Area: 'area',
  Projectile: 'shot',
  Dash: 'dash',
  Heal: 'guard',
};
const KW = [
  [/ateş|alev|meteor|patlama|cehennem|ejder|kor/i, 'fire'],
  [/buz|don|kış|soğuk/i, 'ice'],
  [/zehir|asit/i, 'poison'],
  [/şimşek|yıldırım|fırtına|gök|zincir/i, 'storm'],
  [/void|boşluk|karanlık/i, 'void'],
];
const cache = new Map();
export function cardTags(c) {
  // bir kartın tema etiketleri (en çok 2)
  if (!c) return [];
  const k = c.name;
  if (cache.has(k)) return cache.get(k);
  const n = {};
  const add = (t, w) => {
    if (t) n[t] = (n[t] || 0) + w;
  };
  for (const m of (c.part && c.part.mods) || []) add(ST[m.stat], 2);
  if (c.part && c.part.ability)
    for (const t of c.part.ability.tags) add(AB[t], 3);
  for (const [re, t] of KW) if (re.test(c.name)) add(t, 2);
  const out = Object.entries(n)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((x) => x[0]);
  cache.set(k, out);
  return out;
}
export const tierFor = (n) => AT.filter((a) => n >= a).length;
export function countSyn(names = state.picked) {
  const cnt = {};
  for (const nm of names) {
    const c = CARDS.find((x) => x.name === nm);
    for (const t of cardTags(c)) cnt[t] = (cnt[t] || 0) + 1;
  }
  return cnt;
}
export function recount() {
  // kart alınınca çağrılır: state.syn = {tag:{n,tier}}
  const cnt = countSyn(),
    old = state.syn || {},
    ups = [];
  state.syn = {};
  for (const t in cnt) {
    state.syn[t] = { n: cnt[t], tier: tierFor(cnt[t]) };
    if (state.syn[t].tier > ((old[t] || {}).tier || 0)) ups.push(t);
  }
  for (const t of ups) {
    const s = SYN[t];
    state.bannerQ.push({
      text:
        s.icon +
        ' ' +
        s.name.toUpperCase() +
        ' · KADEME ' +
        'I'.repeat(state.syn[t].tier),
      sub: s.txt[state.syn[t].tier - 1],
      kind: 'evo',
    });
  }
  state.synSig = JSON.stringify(state.syn);
  return ups;
}
export function installSynergy(p) {
  // koşu başında bir kez: dinamik modlar state.syn'i okur
  state.syn = {};
  state.synSig = '{}';
  const mods = [];
  for (const [t, s] of Object.entries(SYN))
    s.t.forEach((list, i) => {
      for (const m of list) {
        const neutral = m.op === 'mul' ? 1 : 0;
        mods.push({
          stat: m.stat,
          op: m.op,
          tag: m.tag,
          get value() {
            return ((state.syn[t] || {}).tier || 0) >= i + 1
              ? m.value
              : neutral;
          },
        });
      }
    });
  addPart(p, { mods });
}
// Bir kartı alırsak ne olur? [{tag, n, after, up}]
export function synPreview(c) {
  const cnt = countSyn();
  return cardTags(c).map((t) => {
    const n = cnt[t] || 0,
      a = n + 1,
      nxt = AT.find((x) => x > n);
    return {
      tag: t,
      n,
      after: a,
      up: tierFor(a) > tierFor(n),
      tier: tierFor(a),
      need: nxt ? nxt - n : 0,
      nxt,
    };
  });
}
export function evoHint(c) {
  // bu kart hangi evrime götürür? {name, have, need}
  const evo = CARDS.find(
    (x) =>
      x.needs && x.needs.includes(c.name) && !state.picked.includes(x.name),
  );
  if (!evo) return null;
  const have = evo.needs.filter(
    (n) => state.picked.includes(n) || n === c.name,
  ).length;
  return {
    name: evo.name,
    have,
    need: evo.needs.length,
    ready: have >= evo.needs.length,
  };
}

export const SYN_MAXTIER = (st) =>
  Math.max(0, ...Object.values(st.syn || {}).map((x) => x.tier));
