import { state } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { WEAPONS } from '../data/weapons.js';
import { meta, discover, save } from '../core/save.js';
import { treeMods } from './meta.js';
// Menüden silah seçilince koşu başlar: silah skilli + kalıcı ağaç bonusları oyuncuya eklenir
export function startRun(id) {
  const w = WEAPONS[id];
  state.weapon = id;
  addPart(state.player, { ability: w.ability });
  addPart(state.player, { mods: treeMods(id).map((x) => ({ ...x })) });
  discover('weapons', id, w.name, 'Silah');
  meta.stats.runs++;
  save(true);
  state.mode = 'run';
  state.paused = false;
  document.getElementById('menu').style.display = 'none';
}
