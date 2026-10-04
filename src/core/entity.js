import { state, dist } from './state.js';
export const BASE = {
  maxHp: 100,
  speed: 100,
  damage: 1,
  ad: 0,
  ap: 0,
  attackSpeed: 1,
  haste: 0,
  critChance: 0,
  critDmg: 1.5,
  armor: 0,
  mr: 0,
  armorPen: 0,
  lethality: 0,
  magicPen: 0,
  magicFlat: 0,
  regen: 0,
  lifesteal: 0,
  omnivamp: 0,
  magnet: 60,
  luck: 0,
  backstab: 1,
  area: 1,
  pierce: 0,
  multishot: 0,
  poison: 0,
  chain: 0,
  slow: 0,
  voidShred: 0,
  knockback: 0,
  kbResist: 0,
  effPower: 1,
  resPen: 0,
  blast: 0,
  blastPower: 0.8,
  blastRadius: 1,
  blastCount: 0,
};
export const make = (o) => ({
  parts: [],
  abilities: [],
  cd: {},
  cdMax: {},
  orbits: [],
  buffs: [],
  r: 10,
  ...o,
  base: { ...BASE, ...o.base },
});
export function addPart(e, p) {
  e.parts.push(p);
  if (p.ability && !e.abilities.includes(p.ability))
    e.abilities.push(p.ability);
  if (p.orbit) e.orbits.push({ ...p.orbit, pos: [], hit: new Map(), a: 0 });
}
export const foes = (c) =>
  state.ents.filter(
    (e) => e.team !== c.team && e.hp > 0 && !e.isPet && !e.under,
  );
export const nearest = (c) =>
  foes(c).reduce((b, e) => (!b || dist(c, e) < dist(c, b) ? e : b), null);
