import { meta } from './save.js';
// TUŞ ATAMALARI (event.code tabanlı, klavye düzeninden bağımsız). Menü > Ayarlar'dan değiştirilir; çakışan tuşlar yer değiştirir.
export const ACTIONS = [
  ['up', 'Yukarı', 'KeyW'],
  ['down', 'Aşağı', 'KeyS'],
  ['left', 'Sola', 'KeyA'],
  ['right', 'Sağa', 'KeyD'],
  ['dash', 'Dash', 'ShiftLeft'],
  ['interact', 'Etkileşim (E)', 'KeyE'],
  ['wave', 'Turu başlat', 'Space'],
  ['inv', 'Envanter', 'KeyI'],
  ['stat', 'Statlar', 'KeyC'],
  ['cls', 'Sınıflar', 'KeyK'],
  ['pet', 'Petler', 'KeyP'],
  ['shop', 'Yükseltmeler', 'KeyB'],
  ['quests', 'Görev listesi', 'KeyJ'],
  ['mute', 'Sesi aç/kapa', 'KeyM'],
  ['menu', 'Menü / Geri', 'Escape'],
];
const DEF = Object.fromEntries(ACTIONS.map((a) => [a[0], a[2]])),
  ARROWS = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  };
export const keyOf = (a) =>
  (meta.settings.keys && meta.settings.keys[a]) || DEF[a];
export const setKey = (a, code) => {
  (meta.settings.keys ??= {})[a] = code;
};
export const resetKeys = () => {
  meta.settings.keys = {};
};
export function rebind(a, code) {
  const o = ACTIONS.find((x) => x[0] !== a && keyOf(x[0]) === code);
  if (o) setKey(o[0], keyOf(a));
  setKey(a, code);
}
const NAMES = {
  ShiftLeft: 'Sol Shift',
  ShiftRight: 'Sağ Shift',
  Space: 'Boşluk',
  Escape: 'Esc',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Tab: 'Tab',
  Enter: 'Enter',
  ControlLeft: 'Sol Ctrl',
  AltLeft: 'Sol Alt',
  Backquote: '`',
};
export const keyName = (c) =>
  NAMES[c] ||
  String(c)
    .replace(/^Key|^Digit/, '')
    .replace(/^Numpad/, 'Num ');
export const is = (e, a) =>
  e.code === keyOf(a) || (keyOf(a) === 'ShiftLeft' && e.code === 'ShiftRight');
const down = new Set();
addEventListener('keydown', (e) => down.add(e.code));
addEventListener('keyup', (e) => down.delete(e.code));
addEventListener('blur', () => down.clear());
export const held = (a) =>
  down.has(keyOf(a)) || (ARROWS[a] && down.has(ARROWS[a])); // ok tuşları her zaman da hareket ettirir
