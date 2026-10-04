// Final stat = (base + tüm add modifierlar) * tüm mul modifierlar. tag'li modifier sadece o tag'e sahip skillere uygulanır.
export function stat(e, name, tags = []) {
  let add = 0,
    mul = 1;
  for (const p of e.parts)
    for (const m of p.mods || [])
      if (m.stat === name && (!m.tag || tags.includes(m.tag)))
        m.op === 'add' ? (add += m.value) : (mul *= m.value);
  const v = (e.base[name] + add) * mul;
  return Number.isFinite(v)
    ? v
    : Number.isFinite(e.base[name])
      ? e.base[name]
      : 0; // NaN koruması
}
