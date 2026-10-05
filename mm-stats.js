/* MOY MARKET — storefront analytics bridge v1.1 */
(() => {
  'use strict';

  const API = String(window.MM_STATS_API || '').replace(/\/+$/, '');
  if (!API) return;

  const EVENT_API = API + '/api/event';
  const VISITOR_KEY = 'mmStatsVisitorIdV1';

  let visitorId = '';

  try {
    visitorId = localStorage.getItem(VISITOR_KEY) || '';

    if (!visitorId) {
      visitorId =
        (crypto.randomUUID
          ? crypto.randomUUID()
          : `mm-${Date.now()}-${Math.random().toString(36).slice(2)}`);

      localStorage.setItem(VISITOR_KEY, visitorId);
    }
  } catch (_) {
    visitorId =
      `mm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  const sentSearches = new Map();
  const sentProductViews = new WeakSet();

  function currentLang() {
    try {
      const x =
        localStorage.getItem('moyLang') ||
        document.documentElement.lang ||
        'ky';

      return String(x).toLowerCase().startsWith('ru')
        ? 'ru'
        : 'ky';
    } catch (_) {
      return 'ky';
    }
  }

  function device() {
    const w =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      0;

    if (w >= 1000) return 'desktop';
    if (w >= 650) return 'tablet';
    return 'mobile';
  }

  function source() {
    const ref = document.referrer || '';

    if (!ref) return 'direct';

    try {
      const h = new URL(ref).hostname.toLowerCase();

      if (
        h.includes('google.') ||
        h.includes('yandex.')
      ) {
        return 'search';
      }

      if (
        h.includes('instagram.') ||
        h.includes('facebook.') ||
        h.includes('tiktok.') ||
        h.includes('youtube.')
      ) {
        return 'social';
      }

      if (
        h.includes('github.io') ||
        h.includes('moimarket')
      ) {
        return 'site';
      }

      return 'other';
    } catch (_) {
      return 'other';
    }
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
    fetch(EVENT_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      keepalive: true
    }).catch(() => {});
  } catch (_) {}
  }
  
  function cardProduct(card) {
    if (!card) return null;

    const name =
      card.querySelector('.pname')?.textContent
        ?.replace(/\s+/g, ' ')
        .trim() || '';

    const image =
      card.querySelector('img')
        ?.getAttribute('src') || '';

    let id = '';

    const buyButton =
      card.querySelector(
        'button.buy[onclick], .buy[onclick], [data-add-cart]'
      );

    const onclick =
      buyButton?.getAttribute('onclick') || '';

    const match =
      onclick.match(
        /addToCart\(\s*['"]([^'"]+)['"]\s*\)/
      );

    if (match) {
      id = match[1];
    }

    if (!id) {
      id = image || name || 'unknown-product';
    }

    return {
      id: String(id),
      name: name || 'Товар'
    };
  }

  function trackProduct(card, type) {
    const p = cardProduct(card);
    if (!p) return;

    send(type, {
      productId: p.id,
      productName: p.name
    });
  }

  function boot() {
    /* 1. Сайтка кирүү */
    send('page_view');

    /* 2. Себетке кошуу */
    try {
      if (
        typeof window.addToCart === 'function' &&
        !window.addToCart.__mmStatsWrapped
      ) {
        const original =
          window.addToCart;

        function wrappedAddToCart(id) {
          const result =
            original.apply(
              this,
              arguments
            );

          try {
            const cards =
              document.querySelectorAll(
                '#products .product, #products .product-card, #products [data-product-card]'
              );

            let name = '';

            cards.forEach(card => {
              const p = cardProduct(card);

              if (
                p &&
                String(p.id) === String(id)
              ) {
                name = p.name;
              }
            });

            send('cart_add', {
              productId: String(id || ''),
              productName: name || 'Товар'
            });
          } catch (_) {}

          return result;
        }

        wrappedAddToCart.__mmStatsWrapped = true;
        window.addToCart = wrappedAddToCart;
      }
    } catch (_) {}

    /* 3. Товар / Like / Share */
    document.addEventListener(
      'click',
      event => {
        const card =
          event.target.closest(
            '#products .product, #products .product-card, #products [data-product-card]'
          );

        if (
          card &&
          !event.target.closest(
            '.mm-card-actions, button.buy, .buy, .cart-add, [data-add-cart]'
          )
        ) {
          if (
            !sentProductViews.has(card)
          ) {
            sentProductViews.add(card);

            trackProduct(
              card,
              'product_view'
            );
          }
        }

        const like =
          event.target.closest(
            '[data-mm-action="like"]'
          );

        if (like) {
          const c =
            like.closest(
              '#products .product, #products .product-card, #products [data-product-card]'
            );

          if (c) {
            trackProduct(
              c,
              'like'
            );

            if (
              like.classList.contains(
                'liked'
              )
            ) {
              trackProduct(
                c,
                'favorite'
              );
            }
          }
        }

        const share =
          event.target.closest(
            '[data-mm-action="share"]'
          );

        if (share) {
          const c =
            share.closest(
              '#products .product, #products .product-card, #products [data-product-card]'
            );

          if (c) {
            trackProduct(
              c,
              'share'
            );
          }
        }
      },
      true
    );

    /* 4. Издөө */
    const searchInputs = [
      document.querySelector('#searchInput'),
      document.querySelector('#mmSmartSearchInput')
    ].filter(Boolean);

    searchInputs.forEach(input => {
      input.addEventListener(
        'keydown',
        event => {
          if (
            event.key !== 'Enter'
          ) {
            return;
          }

          const term =
            input.value
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 100);

          if (term.length < 2) {
            return;
          }

          const key =
            term.toLowerCase();

          const last =
            sentSearches.get(key) || 0;

          if (
            Date.now() - last <
            10000
          ) {
            return;
          }

          sentSearches.set(
            key,
            Date.now()
          );

          send('search', {
            searchTerm: term
          });
        }
      );
    });

    /* 5. KG / RU */
    const langButton =
      document.querySelector(
        '#langSwitch'
      );

    if (langButton) {
      langButton.addEventListener(
        'click',
        () => {
          setTimeout(
            () => send('language'),
            100
          );
        }
      );
    }
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();
