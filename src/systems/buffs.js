// Geçici buff'lar (süreli modifier). HUD'da ikon olarak görünür.
export function addBuff(e, b) {
  // b: {id,name,desc,col,glyph,dur,mods}
  const old = e.buffs.find((x) => x.id === b.id);
  if (old) {
    old.t = old.max = b.dur;
    return;
  }
  const part = { mods: b.mods };
  e.parts.push(part);
  e.buffs.push({ ...b, t: b.dur, max: b.dur, part });
}
export function updateBuffs(e, dt) {
  for (const b of e.buffs) b.t -= dt;
  if (e.buffs.some((b) => b.t <= 0)) {
    for (const b of e.buffs)
      if (b.t <= 0) e.parts = e.parts.filter((p) => p !== b.part);
    e.buffs = e.buffs.filter((b) => b.t > 0);
  }
}
