import { keyOf, keyName } from '../core/keymap.js';
import { getLang } from '../i18n/index.js';
const K = (a) => '<b>' + keyName(keyOf(a)) + '</b>';
// İpuçları (tur başında, ölüm/zafer ekranında) ve Rehber bölümleri. Tuşlar atamaya göre dinamik yazılır.
export const TIPS = [
  () =>
    'Hareket etmeden de hayatta kalabilirsin ama kaçınmak hep daha ucuzdur: ' +
    K('dash') +
    ' ile dash at, dokunulmazken saldırı değerse MÜKEMMEL KAÇIŞ olur.',
  () =>
    'Mükemmel kaçış zamanı yavaşlatır ve kısa bir güç bonusu verir. Boss saldırısının tam vuracağı anda dash at.',
  () =>
    'Kırmızı daireler ve çizgiler (uyarılar) dolunca patlar. İçinde durma, dışarı çık.',
  () =>
    'Kartlarda şansını artırmak için Luck statı kullan; nadirlik oranları kart sayısından bağımsızdır.',
  () =>
    'Yenile ve Yasakla düğmelerini boşa harcama: kötü bir kartı yasaklarsan havuzdan çıkar.',
  () =>
    'Evrim kartı için gerekli kartları topla: iki kart birleşince çok daha güçlü bir kart açılır.',
  () =>
    'Tur sonunda altın ve eşyalar sana çekilir; yine de uzaktaysan yürüyüp topla.',
  () =>
    'Her 5. tur bir BOSS gelir. Boss öldürmek kalıcı Boss Puanı kazandırır (silah ağacı için).',
  () =>
    'Bazı bosslar belirli büyü türünü emer (can yeniler). Uyarıyı okuyup o skili kapat: skil ikonuna tıkla.',
  () =>
    'Her 3. tur SÜRÜ turu: çok sayıda zayıf düşman gelir. Alan hasarı olan skiller burada parlar.',
  () =>
    'Sandık, sunak, tüccar gibi harita nesnelerine yaklaşıp ' +
    K('interact') +
    ' ile etkileşime gir.',
  () =>
    'Tur hedefleri (sol liste) ekstra ödül verir: zaman, dokunulmazlık, bölge ve avcı hedefleri. Listeye tıklayınca yol çizgisi çıkar.',
  () =>
    'Kılıçta Hilal Dalgası ve Üçleme, yayda Sekme ve Odak, asada Küre Dönüşü gibi silah ağacı özellikleri oyun tarzını değiştirir.',
  () =>
    'Okçu karakterinde yerinde 0.5 sn durmak saldırı hızını ve kritik şansını artırır.',
  () =>
    'Suikastçıda dash sonrası ilk vuruş +%80 hasar verir: dash at, sonra vur.',
  () =>
    'Savaşçı dolan Öfke ile 6 sn çok daha güçlüdür. Hem vurmak hem hasar almak Öfke biriktirir.',
  () =>
    'Nekromant her 6 öldürmede bir iskelet asker çağırır; ordu büyüdükçe sen geride kalabilirsin.',
  () =>
    'Büyücünün her 8. skili bedava bir Arkana patlaması çıkarır. Skill sayını artıran kartlar bunu hızlandırır.',
  () =>
    'Zorluk (Heat) yükseldikçe düşmanlar güçlenir ama haritada 2 ve 3 yıldız Zorluk 2+ ve 4+ ile bitirmekten gelir.',
  () =>
    'Yıldızlar Yıldız Yetenekleri için harcanır; "İkinci Nefes" yeteneği ölümden bir kez döndürür.',
  () =>
    "Garu karşı duruşa geçince (beyaz) saldırma: hasarın %75'i boşa gider ve karşılık verir. Uzaklaş ve bekle.",
  () =>
    "Itaçi'nin Tsukuyomi'sinde kontrollerin tersine döner. Dash atmak büyüyü bozar.",
  () =>
    'Peyn seni çekip sonra patlatır: çekim bitmeden dash at veya patlama alanının dışına kaç.',
  () =>
    "Kenpaçi'nin yakınında ruhani baskı canını eritir. Uzaktan vur, yaklaşırsa kaç.",
  () =>
    'Ayzen sahte klonlar çağırır. Gerçeğin can çubuğu olur ve klonlar tek vuruşta patlar: mesafeni koru.',
  () =>
    "Frizo yarı canında dönüşür ve yeni skiller kazanır. Ölüm Topu'nun alanı çok büyüktür: erken kaç.",
  () =>
    "Kaboom'un mayınlarına basma; ateşle patlatabilirsin. Mayının yanında düşmanlar da hasar alır.",
  () =>
    "Sukuno'nun çizgileri kısa uyarıyla gelir. Çizginin üstündeyse hemen yana adım at.",
  () =>
    'Yükseltmeler ekranında (' +
    K('shop') +
    ') tooltip, bir yükseltmenin hangi skilleri nasıl değiştireceğini önce → sonra olarak gösterir.',
];
export const GUIDE = [
  {
    t: 'Temel Kontroller',
    b: () =>
      `<p>Hareket: <b>${keyName(keyOf('up'))}${keyName(keyOf('left'))}${keyName(keyOf('down'))}${keyName(keyOf('right'))}</b> veya ok tuşları. Karakterin yakındaki düşmanlara <b>otomatik</b> saldırır.</p><p>${K('dash')}: dash (kısa dokunulmazlık). ${K('wave')}: turu başlat. ${K('interact')}: etkileşim. ${K('inv')} envanter, ${K('stat')} statlar, ${K('cls')} sınıflar, ${K('pet')} petler, ${K('shop')} yükseltmeler, ${K('quests')} görevler.</p><p>Tuşları Ayarlar'dan değiştirebilirsin.</p>`,
  },
  {
    t: 'Turlar ve Haritalar',
    b: () =>
      '<p>Her harita <b>50 tur</b> sürer; her 5. turda bir boss gelir (haritada 10 boss). 50. turu bitirince haritayı kazanırsın, istersen sonsuz modda devam edersin.</p><p><b>Gölge Ormanı</b> (kolay), <b>Kızıl Çöl</b> (zorluk ×1.18) ve <b>Boşluk Kalesi</b> (×1.4). Çöl ve Boşluk, bir önceki haritayı 1 yıldızla bitirince açılır. Her haritanın kendine özgü düşmanları, kartları ve boss sırası vardır.</p>',
  },
  {
    t: 'Kartlar, Nadirlik, Luck',
    b: () =>
      '<p>Seviye atlayınca 3 kart sunulur. Kartların nadirliği 9 kademedir (Yaygın → Kozmik). <b>Luck</b> yüksek nadirlik şansını artırır. <b>Yenile</b> kartları değiştirir, <b>Yasakla</b> bir kartı havuzdan çıkarır.</p><p>Bazı kartlar <b>evrim</b> geçirir: gerekli kartlara sahipsen daha güçlü hâline dönüşür. Kart üstüne gelince skillerinin <b>önce → sonra</b> değerlerini görürsün (ör. Mermi adedi 1 → 2).</p>',
  },
  {
    t: 'Silahlar',
    b: () =>
      '<p><b>Kılıç</b>: yakın alan. Hilal Dalgası (her 3. vuruşta dalga), Üçleme (güçlü 3. vuruş), Girdap (çekim), Karşı Duruş (öldürünce dash yenile).</p><p><b>Yay</b>: uzak, hızlı ok. Sekme, Ok Yağmuru (her 5. atış), Odak (aynı hedefe art arda +hasar), Hayalet Ok (güdüm).</p><p><b>Asa</b>: büyü (AP ile güçlenir). Küre Dönüşü, Aşırı Yükleme, Kıvılcım (sekme), Ruh Peşinde (güdüm), Yıldız Patlaması.</p><p>Silah ağaçları <b>Boss Puanı</b> ile açılır; altınla alınan koşu içi yükseltmeler ise statları artırır.</p>',
  },
  {
    t: 'Karakterler ve Ruh',
    b: () =>
      '<p>Beş karakter: <b>Savaşçı</b> (açık), <b>Okçu</b> 1000, <b>Suikastçı</b> 3000, <b>Büyücü</b> 6000, <b>Nekromant</b> 10000 Ruh. Her koşu sonunda Ruh kazanırsın (öldürme, tur ve boss başına; zorluk ve harita çarpanıyla).</p><p>Karakter, koşu sonu XP ile seviye atlar; her seviye <b>1 Ruh Puanı</b> verir ve karakter ağacında harcanır. Her karakterin bir pasifi vardır (Öfke, Av Sabrı, Gölge Öldürüşü, Arkana Akışı, Ruh Hasadı).</p>',
  },
  {
    t: 'Yıldızlar',
    b: () =>
      "<p>Her haritada 3 yıldız: ★ haritayı bitir, ★★ Zorluk 2+ ile bitir, ★★★ Zorluk 4+ ile bitir. Yıldızlar Yıldız Yetenekleri'nde kalıcı güçler alır: hasar, can, hız, altın, şans ve <b>İkinci Nefes</b>.</p>",
  },
  {
    t: 'Bossların Arenası',
    b: () =>
      "<p>Her bossun kendine özgü bir arena mekaniği vardır; uyarı toast'ında yazar. Örnekler: Garu (karşı duruş), Itaçi (kontrol tersi), Kakaşi (şimşek fırtınası), Peyn (çek ve patlat), Kenpaçi (baskı alanı), Byakuro (yaprak spiralleri), Ulkiora (boşluk çukurları), Grimjo (pençe izleri), Ayzen (sahte klonlar), Frizo (4 form + daralan çember), Sukuno (Kutsal Mabet).</p><p>Kırmızı uyarılar dolunca patlar: çık. Dash dokunulmazlık verir ama bekleme süresi vardır.</p>",
  },
  {
    t: 'Sınıflar ve Pet',
    b: () =>
      '<p>Sınıf kartları (12 sınıf) kalıcı bonuslar ve silahla <b>sinerji</b> verir. İki sınıf bir araya gelince <b>kombo</b> açılır. Petler seninle savaşır; zehir/ateş emen bosslarda o tür skillerini kapatmayı unutma.</p>',
  },
];
const TIPS_EN = [
  () =>
    'You can survive without moving but dodging is always cheaper: dash with ' +
    K('dash') +
    '; if an attack lands while you are invulnerable it is a PERFECT DODGE.',
  () =>
    'A perfect dodge slows time and gives a short power bonus. Dash at the exact moment a boss attack would hit.',
  () =>
    'Red circles and lines (warnings) explode when they fill up. Do not stand inside, step out.',
  () =>
    'Raise Luck to improve your chances for rare cards; rarity odds do not depend on the number of cards.',
  () =>
    'Do not waste Reroll and Ban: banning a bad card removes it from the pool.',
  () =>
    'Collect the required cards for an evolution: when two cards combine, a much stronger card unlocks.',
  () =>
    'At the end of a wave gold and items are pulled to you; if you are far, walk over and collect them.',
  () =>
    'A BOSS arrives every 5th wave. Killing bosses earns permanent Boss Points (for weapon trees).',
  () =>
    'Some bosses absorb a damage type (and heal). Read the warning and switch that skill off: click the skill icon.',
  () =>
    'Every 3rd wave is a SWARM wave: lots of weak enemies. Area skills shine here.',
  () =>
    'Approach map objects like chests, altars and merchants and press ' +
    K('interact') +
    ' to interact.',
  () =>
    'Wave objectives (left list) give bonus rewards: time, no-hit, zone and hunter goals. Click the list to draw a path line.',
  () =>
    'Weapon tree features like Crescent Wave and Triple Strike (sword), Ricochet and Focus (bow), Orb Orbit (staff) change how you play.',
  () =>
    'For the Archer, standing still for 0.5s boosts attack speed and crit chance.',
  () =>
    'For the Assassin, the first hit after a dash deals +80% damage: dash, then strike.',
  () =>
    "The Warrior's filled Rage makes him much stronger for 6s. Both hitting and taking damage build Rage.",
  () =>
    'The Necromancer summons a skeleton soldier every 6 kills; as the army grows you can stay behind.',
  () =>
    'Every 8th skill cast of the Mage releases a free Arcane burst. Cards that add skills trigger it faster.',
  () =>
    'Higher Difficulty (Heat) makes enemies tougher, but stars 2 and 3 on a map require clearing at Difficulty 2+ and 4+.',
  () =>
    'Stars are spent in Star Perks; the "Second Wind" perk brings you back from death once.',
  () =>
    'When Garu enters a counter stance (white), do not attack: 75% of your damage is wasted and he counters. Back off and wait.',
  () =>
    "During Itaçi's Tsukuyomi your controls reverse. Dashing breaks the spell.",
  () =>
    'Peyn pulls you in and then blasts: dash before the pull ends or run out of the blast area.',
  () =>
    'Near Kenpaçi, his spirit pressure drains your health. Shoot from afar and run if he closes in.',
  () =>
    'Ayzen summons fake clones. The real one has the health bar, and clones explode on a single hit: keep your distance.',
  () =>
    'Frizo transforms at half health and gains new skills. The Death Ball has a huge area: dodge early.',
  () =>
    "Do not step on Kaboom's mines; you can detonate them by shooting. Enemies next to a mine take damage too.",
  () =>
    "Sukuno's lines come with a short warning. If you are on a line, sidestep immediately.",
  () =>
    'In the Upgrades screen (' +
    K('shop') +
    ') the tooltip shows how an upgrade changes your skills as before → after.',
];
export const tipOf = (i) =>
  (getLang() === 'en' ? TIPS_EN : TIPS)[Math.abs(i) % TIPS.length]();
const GUIDE_EN = [
  {
    t: 'Basic Controls',
    b: () =>
      `<p>Move: <b>${keyName(keyOf('up'))}${keyName(keyOf('left'))}${keyName(keyOf('down'))}${keyName(keyOf('right'))}</b> or the arrow keys. Your character attacks nearby enemies <b>automatically</b>.</p><p>${K('dash')}: dash (brief invulnerability). ${K('wave')}: start the wave. ${K('interact')}: interact. ${K('inv')} inventory, ${K('stat')} stats, ${K('cls')} classes, ${K('pet')} pets, ${K('shop')} upgrades, ${K('quests')} quests.</p><p>You can rebind keys in Settings.</p>`,
  },
  {
    t: 'Waves and Maps',
    b: () =>
      '<p>Each map lasts <b>50 waves</b>; a boss arrives every 5th wave (10 bosses per map). Clear wave 50 to win the map; you may continue in endless mode.</p><p><b>Shadow Forest</b> (easy), <b>Crimson Desert</b> (difficulty ×1.18) and <b>Void Citadel</b> (×1.4). The Desert and Void unlock when you clear the previous map with 1 star. Every map has its own enemies, cards and boss order.</p>',
  },
  {
    t: 'Cards, Rarity, Luck',
    b: () =>
      "<p>You are offered 3 cards on each level up. Card rarity has 9 tiers (Common → Cosmic). <b>Luck</b> raises the chance of higher rarity. <b>Reroll</b> swaps the cards, <b>Ban</b> removes a card from the pool.</p><p>Some cards <b>evolve</b>: if you own the required cards they turn into a stronger version. Hover a card to see your skills' <b>before → after</b> values (e.g. Projectile count 1 → 2).</p>",
  },
  {
    t: 'Weapons',
    b: () =>
      '<p><b>Sword</b>: close-range area. Crescent Wave (a wave every 3rd hit), Triple Strike (strong 3rd hit), Whirlpool (pull), Counter Stance (refund dash on kill).</p><p><b>Bow</b>: fast arrows from range. Ricochet, Arrow Rain (every 5th shot), Focus (stacking damage on the same target), Ghost Arrow (homing).</p><p><b>Staff</b>: magic (scales with AP). Orb Orbit, Overload, Spark (ricochet), Soul Chaser (homing), Starburst.</p><p>Weapon trees are unlocked with <b>Boss Points</b>; in-run upgrades bought with gold raise stats.</p>',
  },
  {
    t: 'Characters and Souls',
    b: () =>
      "<p>Five characters: <b>Warrior</b> (unlocked), <b>Archer</b> 1000, <b>Assassin</b> 3000, <b>Mage</b> 6000, <b>Necromancer</b> 10000 Souls. You earn Souls at the end of every run (per kill, wave and boss; with difficulty and map multipliers).</p><p>A character levels up from run XP; every level gives <b>1 Soul Point</b> to spend in the character tree. Each character has a passive (Rage, Hunter's Patience, Shadow Kill, Arcane Flow, Soul Harvest).</p>",
  },
  {
    t: 'Stars',
    b: () =>
      '<p>Each map awards 3 stars: ★ clear the map, ★★ clear at Difficulty 2+, ★★★ clear at Difficulty 4+. Stars buy permanent Star Perks: damage, health, speed, gold, luck and <b>Second Wind</b>.</p>',
  },
  {
    t: 'Boss Arenas',
    b: () =>
      '<p>Every boss has its own arena mechanic, announced in a warning toast. Examples: Garu (counter stance), Itaçi (reversed controls), Kakaşi (lightning storm), Peyn (pull and blast), Kenpaçi (pressure aura), Byakuro (petal spirals), Ulkiora (void pits), Grimjo (claw marks), Ayzen (fake clones), Frizo (4 forms + shrinking ring), Sukuno (Malevolent Shrine).</p><p>Red warnings explode when they fill: get out. Dash grants invulnerability but has a cooldown.</p>',
  },
  {
    t: 'Classes and Pets',
    b: () =>
      '<p>Class cards (12 classes) give permanent bonuses and <b>synergies</b> with your weapon. Two classes together unlock a <b>combo</b>. Pets fight beside you; against bosses that absorb poison/fire, remember to turn those skills off.</p>',
  },
];
export const guideList = () => (getLang() === 'en' ? GUIDE_EN : GUIDE);
