import { getLang } from '../i18n/index.js';
// HESAP RÜTBESİ: her koşu Hesap XP'si verir; her rütbe kalıcı küçük bir ödül açar. Ödüller birikir → "koşudan koşuya güçleniyorum" hissi.
export const MAX_ACC = 40;
export const accNeed = (lv) => 90 + 40 * lv; // lv -> lv+1 için gereken Hesap XP
export const TITLES = [
  [1, 'Çaylak'],
  [5, 'Gezgin'],
  [10, 'Avcı'],
  [15, 'Gaddar'],
  [20, 'Kahraman'],
  [25, 'Efsane'],
  [30, 'Titan'],
  [35, 'Yarı Tanrı'],
  [40, 'Ölümsüz'],
];
const TITLES_EN = [
  'Rookie',
  'Wanderer',
  'Hunter',
  'Ruthless',
  'Hero',
  'Legend',
  'Titan',
  'Demigod',
  'Immortal',
];
export const titleOf = (lv) => {
  const i = TITLES.filter((t) => lv >= t[0]).length - 1;
  return getLang() === 'en' ? TITLES_EN[i] : TITLES[i][1];
};
export const rwText = (r) => (getLang() === 'en' ? r.en : r.text);
const CYC = ['gold', 'dmg', 'hp', 'reroll', 'luck', 'spd', 'ban', 'armor'];
const mk = (kind, tier) =>
  ({
    gold: {
      kind,
      v: 20 + 15 * tier,
      icon: '🪙',
      text: `+${20 + 15 * tier} başlangıç altını`,
      en: `+${20 + 15 * tier} starting gold`,
    },
    dmg: { kind, v: 0.02, icon: '💥', text: '+%2 hasar', en: '+2% damage' },
    hp: {
      kind,
      v: 10 + 5 * tier,
      icon: '❤️',
      text: `+${10 + 5 * tier} maksimum can`,
      en: `+${10 + 5 * tier} max health`,
    },
    reroll: {
      kind,
      v: 1,
      icon: '🔄',
      text: '+1 Yenile hakkı',
      en: '+1 Reroll',
    },
    luck: { kind, v: 1, icon: '🍀', text: '+1 şans', en: '+1 luck' },
    spd: {
      kind,
      v: 0.02,
      icon: '👟',
      text: '+%2 hareket hızı',
      en: '+2% move speed',
    },
    ban: { kind, v: 1, icon: '🚫', text: '+1 Yasakla hakkı', en: '+1 Ban' },
    armor: { kind, v: 3, icon: '🛡️', text: '+3 zırh', en: '+3 armor' },
    card: {
      kind,
      v: 1,
      icon: '🎴',
      text: 'Koşuya ücretsiz bir kart seçerek başla',
      en: 'Start the run with a free card pick',
    },
  })[kind];
export const REWARDS = {};
for (let lv = 2; lv <= MAX_ACC; lv++) {
  const tier = Math.floor((lv - 2) / 8);
  let k = CYC[(lv - 2) % 8];
  if (lv % 5 === 0) k = 'card';
  if (k === 'reroll' && tier > 2) k = 'gold';
  if (k === 'ban' && tier > 1) k = 'hp';
  REWARDS[lv] = mk(k, tier);
}
export function accountBonus(lv) {
  // 2..lv arası tüm ödüllerin toplamı
  const b = {
    gold: 0,
    dmg: 0,
    hp: 0,
    reroll: 0,
    luck: 0,
    spd: 0,
    ban: 0,
    armor: 0,
    card: 0,
  };
  for (let i = 2; i <= lv; i++) b[REWARDS[i].kind] += REWARDS[i].v;
  return b;
}
