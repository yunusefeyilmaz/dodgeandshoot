// Tüm denge ayarları tek yerde. Oynayıp buradan oynayın.
export const BAL = {
  itemDropBase: 0.035,
  itemDropLuck: 0.0008,
  itemDropMax: 0.12,
  itemLife: 60, // item düşme şansı (düşman başına), yerde kalma süresi (sn)
  enemyHp: 1.8,
  enemyHpPerWave: 0.2,
  enemyDmgPerWave: 0.08, // normal düşman can çarpanı ve tur başına artış
  bossHp: 7,
  bossHpPerWave: 0.08,
  bossDmg: 1.6, // boss can çarpanı (data/enemies.js'teki taban canla çarpılır)
  waveBase: 12,
  wavePerWave: 4,
  groupEvery: 3,
  spawnBase: 0.7,
  spawnDecay: 0.012,
  spawnMin: 0.12, // normal tur: düşman sayısı ve doğma hızı
  miniHp: 6,
  swarmBase: 30,
  swarmPerWave: 2,
  swarmMax: 90, // swarm boyutu
};
