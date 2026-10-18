import { state, toast } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { WEAPONS } from '../data/weapons.js';
import { meta, discover, save } from '../core/save.js';
import { treeMods, treeParts } from './meta.js';
import { initPois } from './pois.js';
import { pickMutators, MUTATORS } from '../data/mutators.js';
import { MAPS } from '../data/maps.js';
import { starPerkMods, hasPerk, STAR_PERKS } from './campaign.js';
import { applyChar, isCharUnlocked } from './characters.js';
// Menüden silah seçilince koşu başlar: silah skilli + kalıcı ağaç bonusları oyuncuya eklenir
export function startRun(id, opts = {}) {
  const w = WEAPONS[id];
  state.weapon = id;
  state.map = MAPS[opts.map] || MAPS.forest;
  state.won = false;
  state.victory = null;
  addPart(state.player, { mods: starPerkMods() });
  state.revive = hasPerk('sp_rev') ? 1 : 0;
  state.paid = 0;
  state.charId = isCharUnlocked(opts.char) ? opts.char : 'warrior';
  applyChar(state.player, state.charId);
  for (const p of STAR_PERKS)
    if (p.coins && hasPerk(p.id)) state.coins += p.coins;
  addPart(state.player, { ability: w.ability });
  addPart(state.player, { mods: treeMods(id).map((x) => ({ ...x })) });
  for (const pt of treeParts(id))
    addPart(state.player, { orbit: { ...pt.orbit } });
  discover('weapons', id, w.name, 'Silah');
  meta.stats.runs++;
  save(true);
  state.heat = meta.settings.heat || 0;
  state.mutators = opts.mutators
    ? MUTATORS.filter((x) => opts.mutators.includes(x.id))
    : pickMutators(state.heat);
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
