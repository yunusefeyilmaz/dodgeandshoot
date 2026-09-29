import { state, dist } from './state.js';
const BASE = {
  maxHp: 100,
  speed: 100,
  damage: 1,
  cdr: 1,
  critChance: 0,
  critDmg: 1.5,
  armorPen: 0,
  armor: 0,
  magnet: 60,
};
export const make = (o) => ({
  parts: [],
  abilities: [],
  cd: {},
  r: 10,
  ...o,
  base: { ...BASE, ...o.base },
});
export function addPart(e, p) {
  e.parts.push(p);
  if (p.ability && !e.abilities.includes(p.ability))
    e.abilities.push(p.ability);
}
export const foes = (c) =>
  state.ents.filter((e) => e.team !== c.team && e.hp > 0);
export const nearest = (c) =>
  foes(c).reduce((b, e) => (!b || dist(c, e) < dist(c, b) ? e : b), null);
