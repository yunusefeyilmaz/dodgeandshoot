import { ABILITIES } from './abilities.js';
import { stat } from '../core/stats.js';
import { toast } from '../core/state.js';
const heal = (o, v) => o.hp = Math.min(stat(o, 'maxHp'), o.hp + v);
// Kart de item de aynı "part" yapısı: {mods, triggers, ability}
export const CARDS = [
  { name: 'Fireball', desc: 'Yeni skill: Fireball', part: { ability: ABILITIES.fireball } },
  { name: 'Frost Nova', desc: 'Yeni skill: Frost Nova', part: { ability: ABILITIES.nova } },
  { name: 'Fire Mastery', desc: 'Fire skilleri +%40', part: { mods: [{ stat: 'damage', tag: 'Fire', op: 'mul', value: 1.4 }] } },
  { name: 'Overcharge', desc: 'Tüm hasar +%15', part: { mods: [{ stat: 'damage', op: 'mul', value: 1.15 }] } },
  { name: 'Haste', desc: 'Cooldown -%15', part: { mods: [{ stat: 'cdr', op: 'mul', value: .85 }] } },
  { name: 'Assassin', desc: '+%10 kritik şansı', part: { mods: [{ stat: 'critChance', op: 'add', value: .10 }] } },
  { name: 'Thick Skin', desc: '+40 max can', part: { mods: [{ stat: 'maxHp', op: 'add', value: 40 }] } },
  { name: 'Vampirism', desc: 'Hasarın %8\'i can', part: { triggers: [{ on: 'DamageDealt', run: (o, d) => heal(o, d.amount * .08) }] } },
  { name: 'Sylas Touch', desc: 'Öldürdüğün düşmanın skilini çalarsın', unique: 1, part: { triggers: [{ on: 'Kill', run: (o, d) => {
    for (const a of d.target.abilities) if (!o.abilities.includes(a)) { o.abilities.push(a); toast('Çalındı: ' + a.name); } } }] } },
];
