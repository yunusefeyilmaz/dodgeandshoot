import { state, toast } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { RARITIES } from '../core/rarity.js';
import { discover } from '../core/save.js';
// Item = {def, kills, part}. Part oyuncuya eklenir; satılınca çıkarılır.
export function addItem(def) {
  const i = state.inventory.indexOf(null);
  if (i < 0) return false;
  const inst = { def, kills: 0 };
  inst.part = def.build(inst);
  state.inventory[i] = inst;
  addPart(state.player, inst.part);
  toast('Item: ' + def.name);
  discover('items', def.id, def.name, 'Item');
  return true;
}
export function sellItem(i) {
  const inst = state.inventory[i];
  if (!inst) return;
  state.player.parts = state.player.parts.filter((x) => x !== inst.part);
  state.inventory[i] = null;
  state.coins += RARITIES[inst.def.rarity].sell;
}
