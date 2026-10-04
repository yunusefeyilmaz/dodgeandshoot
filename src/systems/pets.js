import { state, toast } from '../core/state.js';
import { stat } from '../core/stats.js';
import { make, addPart } from '../core/entity.js';
import { discover } from '../core/save.js';
import { PETS } from '../data/pets.js';
import { ABILITIES } from '../data/abilities.js';
import { U } from '../data/upgrades.js';
const lv = (id) => state.upgradeLevels[id] || 0;
// Pet yükseltmeleri oyun içi mağaza ağacında (sahip olunan her pet için bir dal)
export const petNodes = () =>
  state.pets.flatMap((pt) => {
    const k = pt.petId,
      n = PETS[k].name;
    return [
      U(k + '_dmg', n + ': Hasar', 'damage', 'mul', 1.15, 12, 1.4, 10, {
        pet: k,
      }),
      U(k + '_haste', n + ': Hız', 'haste', 'add', 10, 15, 1.4, 10, {
        pet: k,
        parent: k + '_dmg',
      }),
      U(k + '_area', n + ': Alan', 'area', 'mul', 1.08, 15, 1.45, 8, {
        pet: k,
        parent: k + '_dmg',
      }),
      U(k + '_pow', n + ': Efekt gücü', 'effPower', 'mul', 1.1, 20, 1.5, 8, {
        pet: k,
        parent: k + '_haste',
      }),
    ];
  });
export function rebuildPets() {
  for (const pt of state.pets)
    pt.upg.mods = petNodes()
      .filter((u) => u.pet === pt.petId && lv(u.id))
      .map((u) => ({
        stat: u.stat,
        op: u.op,
        value:
          u.op === 'add' ? u.value * lv(u.id) : Math.pow(u.value, lv(u.id)),
      }));
}
export function addPet(id) {
  const d = PETS[id],
    p = state.player,
    g = (s, f = 1) => ({
      stat: s,
      op: 'add',
      get value() {
        return stat(p, s) * f;
      },
    });
  const ent = make({
    team: 'p',
    isPet: true,
    owner: p,
    x: p.x,
    y: p.y,
    r: 9,
    hp: 1e9,
    col: d.col,
    icon: d.icon,
    petId: id,
    base: { damage: 1 },
  });
  addPart(ent, {
    mods: [
      g('ad', 0.6),
      g('ap', 0.6),
      g('critChance'),
      {
        stat: 'critDmg',
        op: 'add',
        get value() {
          return stat(p, 'critDmg') - 1.5;
        },
      },
      {
        stat: 'damage',
        op: 'mul',
        get value() {
          return stat(p, 'damage');
        },
      },
    ],
  });
  ent.upg = { mods: [] };
  addPart(ent, ent.upg);
  ent.abilities.push(ABILITIES[d.skill]);
  ent.cd[d.skill] = 1;
  state.pets.push(ent);
  state.ents.push(ent);
  fillSkills(ent);
  rebuildPets();
  discover('pets', id, d.name, 'Pet');
  toast('Pet: ' + d.name);
}
export function removePet(ent) {
  state.pets = state.pets.filter((x) => x !== ent);
  state.ents = state.ents.filter((x) => x !== ent);
}
function fillSkills(pet) {
  // petin 2. (ve sonraki) skilli: oyuncunun skillerinden rastgele
  const p = state.player;
  while (pet.abilities.length < state.petSkillSlots) {
    const c = p.abilities.filter((a) => !pet.abilities.includes(a)),
      pref = c.filter((a) => !a.tags.includes('Weapon')),
      pool = pref.length ? pref : c;
    if (!pool.length) return;
    const a = pool[Math.floor(Math.random() * pool.length)];
    pet.abilities.push(a);
    pet.cd[a.id] = 1;
  }
}
export function updatePets(dt) {
  const p = state.player;
  state.pets.forEach((pet, i) => {
    pet.a = (pet.a || 0) + dt * 0.9;
    const a = pet.a + (i * 6.283) / state.pets.length,
      k = Math.min(1, dt * 5);
    pet.x += (p.x + Math.cos(a) * 56 - pet.x) * k;
    pet.y += (p.y + Math.sin(a) * 56 - pet.y) * k;
    if ((pet.fillT = (pet.fillT || 0) - dt) <= 0) {
      pet.fillT = 2;
      fillSkills(pet);
    }
  });
}
