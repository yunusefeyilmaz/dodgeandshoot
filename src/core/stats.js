import { CAPS } from '../data/balance.js';
// Final stat = (base + add) * mul. NaN koruması + sert limitler (CAPS) + hasar çarpanında azalan getiri (3x üstü yarıdan az etki eder)
export function stat(e, name, tags = []) {
  let add = 0,
    mul = 1;
  for (const p of e.parts)
    for (const m of p.mods || [])
      if (m.stat === name && (!m.tag || tags.includes(m.tag)))
        m.op === 'add' ? (add += m.value) : (mul *= m.value);
  let v = (e.base[name] + add) * mul;
  if (!Number.isFinite(v)) v = Number.isFinite(e.base[name]) ? e.base[name] : 0;
  if (name === 'damage' && v > 3) v = 3 + (v - 3) * 0.4;
  const c = CAPS[name];
  if (c !== undefined && v > c) v = c;
  return v;
}
