import { state } from '../core/state.js';
import { objectiveInfo } from '../systems/objectives.js';
// Sol taraftaki GÖREVLER listesi (MMO tarzı): tur hedefi, boss, mini boss, elit kampı, haritadaki olaylar. at: konumu olan (tıklanabilir) girdiler.
const m = (a, p) => Math.round(Math.hypot(a.x - p.x, a.y - p.y) / 10);
let seq = 0;
export function questList() {
  const p = state.player,
    L = [],
    o = objectiveInfo(),
    ob = state.obj;
  if (o)
    L.push({
      id: 'obj',
      head: o.label,
      icon: o.icon,
      title: o.title,
      sub: o.detail,
      frac: o.frac,
      status: o.status,
      at:
        ob && ob.type === 'zone' && !ob.done
          ? { x: ob.x, y: ob.y }
          : ob &&
              ob.type === 'hunt' &&
              ob.target &&
              ob.target.hp > 0 &&
              !ob.done
            ? { x: ob.target.x, y: ob.target.y }
            : null,
    });
  const b = state.ents.find((e) => e.boss && e.hp > 0);
  if (b)
    L.push({
      id: 'boss',
      head: 'BOSS',
      icon: '☠️',
      title: b.bossName || b.name,
      sub: m(b, p) + ' m',
      frac: 1 - Math.max(0, b.hp) / b.hpMax,
      status: 'run',
      at: { x: b.x, y: b.y },
    });
  const mi = state.ents.find((e) => e.mini && e.hp > 0);
  if (mi)
    L.push({
      id: 'mini',
      head: 'MİNİ BOSS',
      icon: '💀',
      title: mi.name,
      sub: m(mi, p) + ' m',
      frac: 1 - Math.max(0, mi.hp) / mi.hpMax,
      status: 'run',
      at: { x: mi.x, y: mi.y },
    });
  for (const q of state.pois.slice(0, 5)) {
    q.id = q.id || 'p' + ++seq;
    if (q.type === 'camp') {
      const alive = q.members.filter(
        (e) => e.hp > 0 && state.ents.includes(e),
      ).length;
      L.push({
        id: q.id,
        head: 'KAMP',
        icon: q.glyph,
        title: 'Elit Kampı',
        sub: alive + '/' + q.members.length + ' elit · ' + m(q, p) + ' m',
        frac: 1 - alive / q.members.length,
        status: 'run',
        at: q,
      });
    } else
      L.push({
        id: q.id,
        head: 'KEŞİF',
        icon: q.glyph,
        title: q.name,
        sub: m(q, p) + ' m',
        frac: null,
        status: 'run',
        at: q,
      });
  }
  return L;
}
export const setWaypoint = (at, label) => {
  state.waypoint = { x: at.x, y: at.y, label, t: 12 };
};
