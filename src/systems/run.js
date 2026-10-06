import { state, toast } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { WEAPONS } from '../data/weapons.js';
import { meta, discover, save } from '../core/save.js';
import { treeMods } from './meta.js';
import { initPois } from './pois.js';
import { pickMutators } from '../data/mutators.js';
// Menüden silah seçilince koşu başlar: silah skilli + kalıcı ağaç bonusları oyuncuya eklenir
export function startRun(id) {
  const w = WEAPONS[id];
  state.weapon = id;
  addPart(state.player, { ability: w.ability });
  addPart(state.player, { mods: treeMods(id).map((x) => ({ ...x })) });
  discover('weapons', id, w.name, 'Silah');
  meta.stats.runs++;
  save(true);
  state.heat = meta.settings.heat || 0;
  state.mutators = pickMutators(state.heat);
  for (const mu of state.mutators) {
    if (mu.mods.length)
      addPart(state.player, { mods: mu.mods.map((x) => ({ ...x })) });
    for (const [k, v] of Object.entries(mu.flags))
      state.mut[k] = typeof v === 'boolean' ? v : state.mut[k] * v;
  }
  initPois();
  toast('Shift: DASH — saldırı değmeden hemen önce dash at!');
  state.mode = 'run';
  state.paused = false;
  document.getElementById('menu').style.display = 'none';
}
