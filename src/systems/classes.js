import { state, toast } from '../core/state.js';
import { addPart } from '../core/entity.js';
import { stat } from '../core/stats.js';
import { CLASSES, KOMBOS, DEFAULT_KOMBO, SYNERGIES } from '../data/classes.js';
import { dealDamage } from './combat.js';
import { discover } from '../core/save.js';

const sync = () => {
  state.combos = state.player.extras.map((x) => x.name);
};
// Sınıf ekler; mevcut her sınıf ile kombo, seçili silahla sinerji kurar. Her parça takip edilir (bırakılınca silinir).
export function addClass(id) {
  const p = state.player;
  p.extras ??= [];
  p.classParts ??= {};
  for (const other of p.classes) {
    const key = [other, id].sort().join('+'),
      c = KOMBOS[key] || DEFAULT_KOMBO;
    const part = {
      triggers: [
        {
          on: 'DamageDealt',
          run: (own, d) => {
            if (d.tags.includes('Combo') || d.tags.includes('Status')) return; // kombo/DoT hasarı tekrar kombo tetiklemez
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
    };
    addPart(p, part);
    p.extras.push({
      name: c.name,
      kind: 'kombo',
      classes: [other, id],
      part,
      desc:
        'Her vuruşa +%' +
        Math.round(c.bonus * 100) +
        ' ekstra kombo hasarı (zırh yok sayılır, kritik vurabilir)' +
        (c.heal ? ', hasarın %' + Math.round(c.heal * 100) + "'si can" : '') +
        (c.armorScale ? ', zırhından hasar' : ''),
    });
    toast('KOMBO: ' + c.name);
    discover('combos', key, c.name, 'Kombo');
  }
  p.classes.push(id);
  p.classParts[id] = CLASSES[id].part;
  addPart(p, CLASSES[id].part);
  discover('classes', id, CLASSES[id].name, 'Sınıf');
  const sy = state.weapon && SYNERGIES[state.weapon + ':' + id];
  if (sy) {
    const part = { mods: sy.mods };
    addPart(p, part);
    p.extras.push({
      name: sy.name,
      kind: 'synergy',
      classes: [id],
      part,
      desc: sy.desc,
    });
    toast('SİNERJİ: ' + sy.name);
    discover('combos', 'w:' + state.weapon + ':' + id, sy.name, 'Silah Kombo');
  }
  sync();
}
// Sınıfı bırakır: parçası, kombo'ları ve silah sinerjisi kalkar; slot boşalır (sonraki sınıf seçiminde yenisi alınabilir)
export function releaseClass(id) {
  const p = state.player,
    drop = [
      p.classParts[id],
      ...p.extras.filter((x) => x.classes.includes(id)).map((x) => x.part),
    ];
  p.classes = p.classes.filter((c) => c !== id);
  p.parts = p.parts.filter((x) => !drop.includes(x));
  p.extras = p.extras.filter((x) => !x.classes.includes(id));
  delete p.classParts[id];
  sync();
}
