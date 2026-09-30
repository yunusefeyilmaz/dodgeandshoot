import { state, toast } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { stat } from '../core/stats.js';
import { CLASSES, COMBOS, DEFAULT_COMBO } from '../data/classes.js';
import { dealDamage } from './combat.js';

// Class ekler; daha önce seçilmiş her class ile çift oluşturup combo part'ı ekler.
export function addClass(id) {
  const p = state.player;
  for (const other of p.classes) {
    const c = COMBOS[[other, id].sort().join('+')] || DEFAULT_COMBO;
    addPart(p, {
      triggers: [
        {
          on: 'DamageDealt',
          run: (own, d) => {
            if (d.tags.includes('Combo')) return; // combo hasarı tekrar combo tetiklemez
            const dealt = dealDamage(
              own,
              d.target,
              d.amount * c.bonus + (c.armorScale || 0) * stat(own, 'armor'),
              [...d.tags, 'Combo'],
              { trueDmg: true },
            );
            if (c.heal)
              own.hp = Math.min(stat(own, 'maxHp'), own.hp + dealt * c.heal);
          },
        },
      ],
    });
    state.combos.push(c.name);
    toast('COMBO: ' + c.name);
  }
  p.classes.push(id);
  addPart(p, CLASSES[id].part);
}
