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
          (s.sold ? 'SATILDI' : s.price + ' coin'),
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
          ' coin',
        () => {
          api.heal();
          draw();
        },
        api.coins() < api.healPrice(),
      ),
    );
    nodes.push(
      btn(
        '<b>Stoğu yenile</b>Yeni eşyalar<br>' + api.rerollPrice() + ' coin',
        () => {
          api.reroll();
          draw();
        },
        api.coins() < api.rerollPrice(),
      ),
    );
    nodes.push(btn('Kapat', hideOverlay));
    showOverlay('Gezgin Tüccar — ' + api.coins() + ' coin', nodes, 'poi');
  };
  draw();
}
