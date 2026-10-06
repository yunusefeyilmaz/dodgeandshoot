import { state, toast, rnd, W, H } from '../core/state.js';
import { stat } from '../core/stats.js';
import { addPart } from '../core/entity.js';
import { RARITIES, weightOf } from '../core/rarity.js';
import { discover } from '../core/save.js';
import { sfx } from '../core/audio.js';
import { CARDS } from '../data/cards.js';
import { ITEMS } from '../data/items.js';
import { rollItem } from './rewards.js';
import { addItem } from './inventory.js';
import { burst, ring, shake } from './fx.js';
import { openAltar, openMerchant } from '../ui/poi.js';
import { startTrial } from './objectives.js';
// HARİTA OLAYLARI: gezip bulunur, E ile etkileşilir. Tur bitince yeni olaylar doğar; 2 tur içinde kullanılmazsa kaybolur.
const pickPool = (minTier) => {
  const p = state.player;
  return CARDS.filter(
    (c) =>
      RARITIES[c.rarity || 'common'].tier >= minTier &&
      !(c.part && c.part.ability && p.abilities.includes(c.part.ability)) &&
      !(c.max
        ? state.picked.filter((x) => x === c.name).length >= c.max
        : !c.repeat && state.picked.includes(c.name)) &&
      (!c.requires || state.picked.includes(c.requires)) &&
      (!c.cond || c.cond()),
  );
};
function giveCard(minTier) {
  // sunağın verdiği kart (luck'a göre ağırlıklı)
  const p = state.player,
    pool = pickPool(minTier);
  if (!pool.length) return toast('Sunak sessiz kaldı...');
  const luck = stat(p, 'luck'),
    ws = pool.map((c) => weightOf(c.rarity, luck));
  let x = Math.random() * ws.reduce((a, b) => a + b, 0);
  const i = ws.findIndex((w) => (x -= w) <= 0),
    c = pool[i < 0 ? 0 : i];
  if (c.apply) c.apply();
  else addPart(p, c.part);
  state.picked.push(c.name);
  if (c.codex) discover('cards', c.name, c.name, 'Kart');
  toast('Sunak verdi: ' + c.name);
}
export const DEALS = [
  {
    name: 'Kan Anlaşması',
    desc: "Canının %30'unu feda et → rastgele Nadir+ kart",
    ok: (p) => p.hp > stat(p, 'maxHp') * 0.4,
    apply: (p) => {
      p.hp -= p.hp * 0.3;
      giveCard(2);
    },
  },
  {
    name: 'Altın Anlaşma',
    desc: "Coinlerinin %40'ını feda et → +3 luck",
    ok: () => state.coins >= 20,
    apply: (p) => {
      state.coins = Math.floor(state.coins * 0.6);
      addPart(p, { mods: [{ stat: 'luck', op: 'add', value: 3 }] });
      toast('+3 luck');
    },
  },
  {
    name: 'Lanetli Güç',
    desc: 'Sonraki 3 tur düşman canı +%25 → kalıcı +%15 hasar',
    ok: () => !(state.curse && state.curse.waves > 0),
    apply: (p) => {
      state.curse = { waves: 3 };
      addPart(p, { mods: [{ stat: 'damage', op: 'mul', value: 1.15 }] });
      toast('Lanetlendin: +%15 hasar');
    },
  },
  {
    name: 'Ateşli Anlaşma',
    desc: 'Max can -%20 → saldırı hızı +%12, hız +%10',
    ok: () => true,
    apply: (p) => {
      addPart(p, {
        mods: [
          { stat: 'maxHp', op: 'mul', value: 0.8 },
          { stat: 'attackSpeed', op: 'mul', value: 1.12 },
          { stat: 'speed', op: 'mul', value: 1.1 },
        ],
      });
      toast('Ateşli anlaşma yapıldı');
    },
  },
];
function openChest(q) {
  state.coins -= q.cost || 0;
  q.done = true;
  sfx('item');
  ring(q.x, q.y, 80, q.col);
  burst(q.x, q.y, q.col, 24, 300, 0.6);
  if (q.mimic) {
    toast('TAKLİTÇİ! Sandık canlandı!');
    shake(0.5);
    ['swordsman', 'brute', 'knight'].forEach((id) =>
      state.spawnAt(id, q.x + rnd(-50, 50), q.y + rnd(-50, 50), true),
    );
    return;
  }
  if (!q.good && Math.random() < 0.3) {
    for (let i = 0; i < 8; i++)
      state.pickups.push({
        type: 'coin',
        v: Math.max(1, Math.round((q.cost || 20) * 0.4)),
        x: q.x + rnd(-30, 30),
        y: q.y + rnd(-30, 30),
      });
    return toast('Sandıktan altın saçıldı!');
  }
  const def = rollItem(q.good ? 6 : 3, q.good ? 2 : 0);
  state.pickups.push({ type: 'item', def, x: q.x, y: q.y });
  toast('Sandıktan çıktı: ' + def.name);
}
const stockOf = (n) =>
  Array.from({ length: 3 }, () => {
    const def = rollItem(2);
    return {
      def,
      price: Math.round(RARITIES[def.rarity].sell * 5 + n * 6),
      sold: false,
    };
  });
export const merchantApi = (q) => ({
  coins: () => state.coins,
  healPrice: () => 30 + state.wave.n * 3,
  rerollPrice: () => 20 + 10 * (q.rerolls || 0),
  buy: (i) => {
    const s = q.stock[i];
    if (s.sold || state.coins < s.price) return;
    if (!addItem(s.def)) return toast('Envanter dolu!');
    state.coins -= s.price;
    s.sold = true;
    sfx('item');
  },
  heal: () => {
    const p = state.player,
      c = 30 + state.wave.n * 3;
    if (state.coins < c) return;
    state.coins -= c;
    p.hp = Math.min(stat(p, 'maxHp'), p.hp + stat(p, 'maxHp') * 0.5);
    sfx('item');
  },
  reroll: () => {
    const c = 20 + 10 * (q.rerolls || 0);
    if (state.coins < c) return;
    state.coins -= c;
    q.rerolls = (q.rerolls || 0) + 1;
    q.stock = stockOf(state.wave.n);
  },
});
const openShopMenu = (q) => openMerchant(q, merchantApi(q));
export const TYPES = {
  chest: {
    glyph: '🎁',
    name: 'Sandık',
    col: '#e0b040',
    w: 45,
    min: 1,
    make: (q) => {
      q.cost = Math.round(20 + state.wave.n * 6);
      q.mimic = Math.random() < 0.12;
    },
    label: (q) => 'Sandığı aç' + (q.cost ? ' (' + q.cost + ' coin)' : ''),
    use: (q) => {
      if (state.coins < (q.cost || 0)) return toast('Yetersiz coin!');
      openChest(q);
    },
  },
  altar: {
    glyph: '🗿',
    name: 'Sunak',
    col: '#c05bff',
    w: 20,
    min: 2,
    make: () => {},
    label: () => 'Sunağa yaklaş',
    use: (q) => {
      const p = state.player,
        deals = DEALS.filter((d) => d.ok(p))
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
      q.done = true;
      openAltar(deals, (d) => {
        d.apply(p);
        sfx('level');
        ring(q.x, q.y, 100, q.col);
      });
    },
  },
  merchant: {
    glyph: '🧙',
    name: 'Gezgin Tüccar',
    col: '#6fd36f',
    w: 15,
    min: 3,
    make: (q) => {
      q.stock = stockOf(state.wave.n);
    },
    label: () => 'Tüccarla konuş',
    use: (q) => openShopMenu(q),
  },
  cursed: {
    glyph: '💀',
    name: 'Lanetli Sandık',
    col: '#ff4a4a',
    w: 8,
    min: 5,
    make: () => {},
    label: () => 'Lanetli sandığı aç (bedava, bedeli var!)',
    use: (q) => {
      const list = ITEMS.filter((i) => i.cursed),
        def = list[Math.floor(Math.random() * list.length)];
      q.done = true;
      state.pickups.push({ type: 'item', def, x: q.x, y: q.y });
      ring(q.x, q.y, 80, q.col);
      toast('Lanetli eşya: ' + def.name);
    },
  },
  portal: {
    glyph: '🌀',
    name: 'Risk Portalı',
    col: '#5b6cff',
    w: 8,
    min: 4,
    make: () => {},
    label: () => 'Risk portalına gir (20 sn hayatta kal, ödül!)',
    use: (q) => {
      q.done = true;
      startTrial();
    },
  },
  camp: {
    glyph: '⚔️',
    name: 'Elit Kampı',
    col: '#ff8a3d',
    w: 10,
    min: 4,
    label: () => '',
    use: () => {},
    make: (q) => {
      q.members = [];
      const ids =
        state.wave.n < 8
          ? ['swordsman', 'tank']
          : ['brute', 'knight', 'magmaslime', 'swordsman'];
      for (let i = 0; i < 3; i++) {
        const e = state.spawnAt(
          ids[i % ids.length],
          q.x + rnd(-60, 60),
          q.y + rnd(-60, 60),
          true,
        );
        if (e) {
          e.dormant = true;
          q.members.push(e);
        }
      }
    },
  },
};
export function spawnPoi(type, at) {
  const p = state.player,
    d = TYPES[type];
  let x, y;
  if (at) ({ x, y } = at);
  else
    for (let i = 0; i < 25; i++) {
      const a = rnd(0, 6.28),
        r = rnd(350, 1100);
      x = p.x + Math.cos(a) * r;
      y = p.y + Math.sin(a) * r;
      if (x > 120 && x < W - 120 && y > 120 && y < H - 120) break;
    }
  const q = {
    type,
    x: Math.min(W - 100, Math.max(100, x)),
    y: Math.min(H - 100, Math.max(100, y)),
    wave: state.wave.n,
    glyph: d.glyph,
    col: d.col,
    name: d.name,
  };
  d.make(q);
  state.pois.push(q);
  return q;
}
const roll = () => {
  const L = Object.entries(TYPES).filter(([, d]) => state.wave.n >= d.min);
  let x = Math.random() * L.reduce((s, [, d]) => s + d.w, 0);
  for (const [id, d] of L) if ((x -= d.w) <= 0) return id;
  return 'chest';
};
export function initPois() {
  state.pois = [];
  spawnPoi('chest');
  spawnPoi('chest');
  toast('Haritada sandıklar var! E: etkileşim');
}
export function onWaveEnd(n) {
  if (state.curse && state.curse.waves > 0) {
    state.curse.waves--;
    if (!state.curse.waves) toast('Lanet kalktı');
  }
  state.pois = state.pois.filter(
    (q) => n - q.wave < (q.type === 'camp' ? 4 : 3),
  );
  for (
    let i = 0, c = 1 + (Math.random() < 0.5 ? 1 : 0);
    i < c && state.pois.length < 6;
    i++
  )
    spawnPoi(roll());
  toast('Haritada yeni bir olay belirdi!');
}
export function updatePois() {
  const p = state.player;
  state.prompt = null;
  for (const q of state.pois) {
    if (q.type === 'camp') {
      if (q.members.every((m) => m.hp <= 0 || !state.ents.includes(m))) {
        q.done = true;
        const c = spawnPoi('chest', { x: q.x, y: q.y });
        c.good = true;
        c.cost = 0;
        c.mimic = false;
        toast('Kamp temizlendi! Ödül sandığı belirdi');
      }
      continue;
    }
    if (Math.hypot(q.x - p.x, q.y - p.y) < 70)
      state.prompt = { x: q.x, y: q.y, text: 'E · ' + TYPES[q.type].label(q) };
  }
  state.pois = state.pois.filter((q) => !q.done || false);
}
export function interact() {
  if (state.mode !== 'run' || state.paused || state.over) return;
  const p = state.player;
  let best = null,
    bd = 70;
  for (const q of state.pois) {
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < bd && q.type !== 'camp') {
      bd = d;
      best = q;
    }
  }
  if (best) {
    TYPES[best.type].use(best);
    state.pois = state.pois.filter((q) => !q.done);
  }
}
addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e' && !e.repeat) interact();
});
