import { keyOf, keyName } from '../core/keymap.js';
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
export const tipOf = (i) => TIPS[Math.abs(i) % TIPS.length]();
