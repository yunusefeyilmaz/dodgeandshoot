import { RARITIES } from '../core/rarity.js';
import { showOverlay, hideOverlay, btn } from './overlay.js';
// Sunak: anlaşma seç
export function openAltar(deals, pick) {
  showOverlay(
    'Sunak — bir anlaşma seç',
    [
      ...deals.map((d) =>
        btn(
          '<b>' + d.name + '</b>' + d.desc,
          () => {
            hideOverlay();
            pick(d);
          },
          d.disabled,
          '#c05bff',
        ),
      ),
      btn('Reddet', hideOverlay),
    ],
    'poi',
  );
}
// Gezgin tüccar: api = {coins, buy(i), heal(), reroll(), healPrice, rerollPrice}
export function openMerchant(q, api) {
  const draw = () => {
    const nodes = q.stock.map((s, i) => {
      const r = RARITIES[s.def.rarity];
      return btn(
        '<b style="color:' +
          r.col +
          '">' +
          s.def.name +
          '</b><small style="color:' +
          r.col +
          '">' +
          r.name +
          '</small><br>' +
          (s.sold ? 'SATILDI' : s.price + ' altın'),
        () => {
          api.buy(i);
          draw();
        },
        s.sold || api.coins() < s.price,
        r.col,
      );
    });
    nodes.push(
      btn(
        "<b>Can iksiri</b>Canın %50'si yenilenir<br>" +
          api.healPrice() +
          ' altın',
        () => {
          api.heal();
          draw();
        },
        api.coins() < api.healPrice(),
      ),
    );
    nodes.push(
      btn(
        '<b>Stoğu yenile</b>Yeni eşyalar<br>' + api.rerollPrice() + ' altın',
        () => {
          api.reroll();
          draw();
        },
        api.coins() < api.rerollPrice(),
      ),
    );
    nodes.push(btn('Kapat', hideOverlay));
    showOverlay('Gezgin Tüccar — ' + api.coins() + ' altın', nodes, 'poi');
  };
  draw();
}
