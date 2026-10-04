import { state } from '../core/state.js';
import { stat } from '../core/stats.js';
import { RARITIES } from '../core/rarity.js';
import { CARDS } from '../data/cards.js';
import { PETS } from '../data/pets.js';
import { setTip, partLines } from './tooltip.js';
// LoL tarzı küçük kare ikonlar: glyph + renkli çerçeve + dönen cooldown/süre taraması + sayı. Elemanlar anahtarla korunur (hover bozulmaz).
export function syncIcons(box, items) {
  box._m = box._m || new Map();
  const seen = new Set();
  for (const it of items) {
    seen.add(it.id);
    let d = box._m.get(it.id);
    if (!d) {
      d = document.createElement('div');
      d.className = 'ico';
      d.innerHTML = '<span class="g"></span><i></i><b></b>';
      d.onmouseenter = () => setTip(() => d._tip());
      d.onmouseleave = () => setTip(null);
      box.appendChild(d);
      box._m.set(it.id, d);
      d.firstChild.textContent = it.glyph;
    }
    d._tip = it.tip;
    d.style.borderColor = it.col;
    d.style.setProperty('--f', Math.max(0, Math.min(1, it.frac || 0)));
    d.lastChild.textContent = it.text || '';
  }
  for (const [id, d] of box._m)
    if (!seen.has(id)) {
      d.remove();
      box._m.delete(id);
    }
}
const GL = {
  Sword: '⚔️',
  Bow: '🏹',
  Bomb: '💣',
  Fire: '🔥',
  Ice: '❄️',
  Poison: '☠️',
  Lightning: '⚡',
  Earth: '🪨',
  Dark: '🌑',
  Blood: '🩸',
  Wind: '🌪️',
  Dash: '💨',
  Cero: '🔆',
  Pet: '🐾',
};
export const glyphOf = (ab) => {
  for (const t of ab.tags) if (GL[t]) return GL[t];
  return '✦';
};
export const CLASS_GLYPH = {
  assassin: '🗡️',
  vampire: '🦇',
  tank: '🛡️',
  sylas: '🔮',
  gambler: '🎲',
  berserker: '🪓',
  archmage: '🧙',
};
const SG = {
  poison: '☠️',
  chain: '⚡',
  slow: '🐌',
  voidShred: '🌑',
  blast: '💥',
  blastCount: '💥',
  blastPower: '💥',
  blastRadius: '💥',
  ad: '⚔️',
  ap: '🔮',
  maxHp: '❤️',
  regen: '❤️',
  armor: '🛡️',
  mr: '🛡️',
  speed: '👟',
  critChance: '🎯',
  critDmg: '🎯',
  luck: '🍀',
  haste: '⏱️',
  damage: '💢',
  lifesteal: '🩸',
  omnivamp: '🩸',
  pierce: '➶',
  multishot: '➶',
  area: '⭕',
  knockback: '👊',
  effPower: '✨',
  resPen: '✨',
};
export function cardGlyph(c) {
  if (!c) return '🃏';
  if (c.kind === 'Pet') {
    const p = Object.values(PETS).find((x) => x.name === c.name);
    return p ? p.icon : '🐾';
  }
  if (c.part && c.part.ability) return glyphOf(c.part.ability);
  if (c.part && c.part.orbit) return '🌀';
  const mod = c.part && c.part.mods && c.part.mods[0];
  return (mod && SG[mod.stat]) || '🃏';
}

// Skill açıklaması: GERÇEK değerler (AD/AP, hasar çarpanı, alan, ek mermi dahil)
const bonus = (o, ab, n) => (o ? Math.round(stat(o, n, ab.tags)) : 0);
export function abDesc(ab, o) {
  const dmg = (f) =>
    Math.round(
      (f.damage +
        (o
          ? stat(o, ab.dmgType === 'magic' ? 'ap' : 'ad') * (f.ratio ?? 1)
          : 0)) *
        (o ? stat(o, 'damage', ab.tags) * (o.pw || 1) : 1),
    );
  const area = o ? stat(o, 'area', ab.tags) : 1,
    T = (f) => ' (taban ' + f.damage + ')';
  const FX = {
    Projectile: (f) =>
      'Mermi ×' +
      ((f.count || 1) + bonus(o, ab, 'multishot')) +
      ': <b>' +
      dmg(f) +
      '</b> hasar' +
      T(f) +
      ((f.pierce || 0) + bonus(o, ab, 'pierce')
        ? ', ' + ((f.pierce || 0) + bonus(o, ab, 'pierce')) + ' delme'
        : ''),
    Nova: (f) =>
      'Çevresine alan hasarı: <b>' +
      dmg(f) +
      '</b>' +
      T(f) +
      ' · yarıçap ' +
      Math.round(f.radius * area),
    Rain: (f) =>
      f.count +
      bonus(o, ab, 'multishot') +
      ' rastgele alana: <b>' +
      dmg(f) +
      '</b> hasar' +
      T(f) +
      ' · yarıçap ' +
      Math.round(f.radius * area),
    Dash: (f) =>
      'Atılış' +
      (f.stun ? ' + sersemletme' : '') +
      ': <b>' +
      dmg(f) +
      '</b> hasar',
    Buff: (f) => 'Buff: ' + f.name + ' (' + f.desc + ')',
    Cero: (f) => 'Delici ışın: <b>' + dmg(f) + '</b> hasar',
    Gust: () => 'Rüzgarla iter',
    Tornado: () => 'Kovalayan hortumlar',
    Summon: (f) => f.count + ' düşman çağırır',
    HealAllies: () => 'Yakın müttefikleri iyileştirir',
    Blink: (f) => 'Işınlanıp alan hasarı: ' + dmg(f),
    Slowfield: () => 'Yavaşlatan alanlar',
    Fuse: (f) => 'Fitil yakıp patlar: ' + dmg(f),
  };
  return (
    ab.effects.map((f) => (FX[f.type] || (() => f.type))(f)).join('<br>') +
    Object.entries(
      ab.effects.reduce((a, f) => ({ ...a, ...(f.proc || {}) }), {}),
    )
      .map(
        ([k, v]) =>
          '<br><small>+' + k + ' %' + Math.round(v * 100) + '</small>',
      )
      .join('')
  );
}
// Skill ipucu: etkin bekleme süresi, gerçek hasar, toplam hasar ve kill
export function abTip(ab, o) {
  const s = state.abStats[ab.id] || { dmg: 0, kills: 0 },
    as = ab.tags.includes('Weapon') ? stat(o, 'attackSpeed', ab.tags) : 1;
  return (
    '<b>' +
    ab.name +
    '</b> <small>' +
    (ab.dmgType === 'magic' ? 'Büyü' : 'Fiziksel') +
    '</small><div>Bekleme: <b>' +
    Math.max(
      ab.tags.includes('Weapon') ? 0.16 : 0.3,
      (ab.cooldown * 100) / (100 + stat(o, 'haste', ab.tags)) / Math.min(3, as),
    ).toFixed(2) +
    ' sn</b></div><div class="dim">' +
    abDesc(ab, o) +
    '</div><div style="margin-top:4px">Toplam hasar: <b>' +
    Math.round(s.dmg).toLocaleString('tr') +
    '</b> · Kill: <b>' +
    s.kills +
    '</b></div>'
  );
}
// Kart ipucu: ne yapıyor, şu anki etkisi, bu oyundaki kill/hasar
export function cardTip(name) {
  const c = CARDS.find((x) => x.name === name),
    cnt = state.picked.filter((x) => x === name).length;
  if (!c)
    return (
      '<b>' +
      name +
      '</b><div class="dim">Silah geliştirmesi</div><div>Bu oyunda kill: <b>' +
      (state.cardKills[name] || 0) +
      '</b></div>'
    );
  const r = RARITIES[c.rarity || 'common'];
  let h =
    '<b style="color:' +
    r.col +
    '">' +
    name +
    '</b> <small>' +
    r.name +
    (cnt > 1 ? ' ×' + cnt : '') +
    '</small><div class="dim">' +
    c.desc +
    '</div>';
  if (c.part && c.part.mods) h += partLines(c.part);
  const ab =
      c.part && c.part.ability
        ? c.part.ability.id
        : c.part && c.part.orbit
          ? 'orbit'
          : null,
    s = ab && state.abStats[ab];
  if (ab)
    h +=
      '<div style="margin-top:4px">Toplam hasar: <b>' +
      Math.round(s ? s.dmg : 0).toLocaleString('tr') +
      '</b> · Kill: <b>' +
      (s ? s.kills : 0) +
      '</b></div>';
  return (
    h + '<div>Sahipken kill: <b>' + (state.cardKills[name] || 0) + '</b></div>'
  );
}
