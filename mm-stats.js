/* MOY MARKET — storefront analytics bridge v1
   Safe by design: does nothing until MM_STATS_API is configured.
   It never changes existing UI, cart logic, favorites, search, or visitors UI.
*/
(() => {
  'use strict';

  const API = window.MM_STATS_API || '';
  if (!API) return;

  const VISITOR_KEY = 'mmStatsVisitorIdV1';
  let visitorId = '';
  try {
    visitorId = localStorage.getItem(VISITOR_KEY) || '';
    if (!visitorId) {
      visitorId = (crypto.randomUUID ? crypto.randomUUID() : `mm-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
  } catch (_) {
    visitorId = `mm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  const sentSearches = new Map();
  const sentProductViews = new WeakSet();

  function currentLang() {
    try {
      const x = localStorage.getItem('moyLang') || document.documentElement.lang || 'ky';
      return String(x).toLowerCase().startsWith('ru') ? 'ru' : 'ky';
    } catch (_) { return 'ky'; }
  }

  function device() {
    const w = Math.min(window.innerWidth || 0, screen?.width || 0);
    if (w >= 1000) return 'desktop';
    if (w >= 650) return 'tablet';
    return 'mobile';
  }

  function source() {
    const ref = document.referrer || '';
    if (!ref) return 'direct';
    try {
      const h = new URL(ref).hostname.toLowerCase();
      if (h.includes('google.') || h.includes('yandex.')) return 'search';
      if (h.includes('instagram.') || h.includes('facebook.') || h.includes('tiktok.') || h.includes('youtube.')) return 'social';
      if (h.includes('github.io') || h.includes('moimarket')) return 'site';
      return 'other';
    } catch (_) { return 'other'; }
  }

  function cardProduct(card) {
    if (!card) return null;
    const name = card.querySelector('.pname')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const list = Array.isArray(window.products) ? window.products : [];
    const byImage = list.find(p => String(p?.image || '') === img);
    if (byImage) return byImage;
    return list.find(p => String(p?.name || p?.nameRu || '').trim() === name || String(p?.nameRu || '').trim() === name) || { id: '', name, nameRu: name };
  }

  function send(type, extra = {}) {
    const payload = {
      type,
      visitorId,
      ts: Date.now(),
      lang: currentLang(),
      device: device(),
      trafficSource: source(),
      referrer: document.referrer || '',
      ...extra
    };
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(API, blob)) return;
      }
      fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true, mode: 'cors' }).catch(() => {});
    } catch (_) {}
  }

  function trackProduct(card, type = 'product_view') {
    const p = cardProduct(card);
    if (!p) return;
    send(type, {
      productId: String(p.id || ''),
      productName: String(p.name || p.nameRu || card.querySelector('.pname')?.textContent || '').replace(/\s+/g, ' ').trim()
    });
  }

  function boot() {
    send('page_view');

    // Cart: wrap the existing global function without changing its behavior.
    try {
      if (typeof window.addToCart === 'function' && !window.addToCart.__mmStatsWrapped) {
        const original = window.addToCart;
        function wrappedAddToCart(id) {
          const result = original.apply(this, arguments);
          try {
            const p = Array.isArray(window.products) ? window.products.find(x => String(x?.id) === String(id)) : null;
            send('cart_add', { productId: String(id || ''), productName: String(p?.name || p?.nameRu || '') });
          } catch (_) {}
          return result;
        }
        wrappedAddToCart.__mmStatsWrapped = true;
        window.addToCart = wrappedAddToCart;
      }
    } catch (_) {}

    document.addEventListener('click', (event) => {
      const card = event.target.closest('#products .product, #products .product-card, #products [data-product-card]');
      if (card && !event.target.closest('.mm-card-actions, button.buy, .buy, .cart-add, [data-add-cart]')) {
        if (!sentProductViews.has(card)) {
          sentProductViews.add(card);
          trackProduct(card);
        }
      }

      const like = event.target.closest('[data-mm-action="like"]');
      if (like) {
        const c = like.closest('#products .product, #products .product-card, #products [data-product-card]');
        if (c) trackProduct(c, 'like');
      }

      const favorite = event.target.closest('.mm-favorite, [data-favorite], .mm-favorites-toggle');
      if (favorite) {
        const c = favorite.closest('#products .product, #products .product-card, #products [data-product-card]');
        if (c) trackProduct(c, 'favorite');
      }

      const share = event.target.closest('[data-mm-action="share"]');
      if (share) {
        const c = share.closest('#products .product, #products .product-card, #products [data-product-card]');
        if (c) trackProduct(c, 'share');
      }
    }, true);

    const searchInput = document.querySelector('#searchInput');
    const smart = document.querySelector('#mmSmartSearchInput');
    [searchInput, smart].filter(Boolean).forEach(input => {
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        const term = input.value.replace(/\s+/g, ' ').trim().slice(0, 100);
        if (term.length < 2) return;
        const key = term.toLowerCase();
        const last = sentSearches.get(key) || 0;
        if (Date.now() - last < 10000) return;
        sentSearches.set(key, Date.now());
        send('search', { searchTerm: term });
      });
    });

    const langButton = document.querySelector('#langSwitch');
    if (langButton) langButton.addEventListener('click', () => setTimeout(() => send('language'), 50));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
