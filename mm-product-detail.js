/* MOY MARKET — product details for the EXISTING engagement viewer.
   Safe version: no MutationObserver loop. Existing like/comment/share/view stay intact.
*/
(() => {
  'use strict';

  const qs = (s, r = document) => r.querySelector(s);
  let lastProductKey = '';

  function getProductFromViewer(viewer) {
    const card = viewer?._card;
    if (!card) return null;

    const title = (card.querySelector('.pname, h3, .product-name, .product-title')?.textContent || '').trim();
    const img = card.querySelector('img');
    const src = img?.currentSrc || img?.src || '';

    try {
      if (typeof products !== 'undefined' && Array.isArray(products)) {
        const exact = products.find(p =>
          String(p.name || '').trim() === title ||
          String(p.nameRu || '').trim() === title
        );
        if (exact) return exact;

        const byImage = products.find(p => {
          try {
            const u = new URL(p.image || '', document.baseURI).href;
            return u === src;
          } catch (_) {
            return false;
          }
        });
        if (byImage) return byImage;
      }
    } catch (_) {}

    return null;
  }

  function getSpecs(product) {
    if (!product) return [];

    let lang = 'ky';
    try { lang = localStorage.getItem('moyLang') || 'ky'; } catch (_) {}

    const specs = lang === 'ru'
      ? (product.characteristicsRu || product.characteristics || [])
      : (product.characteristics || product.characteristicsRu || []);

    if (Array.isArray(specs) && specs.length) {
      return specs.filter(Boolean).map(String);
    }

    const desc = lang === 'ru'
      ? (product.descriptionRu || product.description || '')
      : (product.description || product.descriptionRu || '');

    return desc ? [String(desc)] : [];
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  function ensureDetailBox(viewer) {
    const body = qs('.mm-viewer-body', viewer);
    const actions = qs('.mm-viewer-actions', viewer);
    if (!body) return null;

    let box = qs('.mm-product-detail-box', viewer);
    if (!box) {
      box = document.createElement('section');
      box.className = 'mm-product-detail-box';
      box.innerHTML = `
        <b class="mm-product-detail-title">Характеристикалары:</b>
        <ul class="mm-product-detail-list"></ul>
      `;
      if (actions) body.insertBefore(box, actions);
      else body.appendChild(box);
    }

    return box;
  }

  function refresh(viewer) {
    if (!viewer || !viewer.classList.contains('show')) return;

    const card = viewer._card;
    if (!card) return;

    const product = getProductFromViewer(viewer);
    const key = product
      ? String(product.id || product.name || product.nameRu || '')
      : ((card.querySelector('.pname, h3, .product-name, .product-title')?.textContent || '').trim());

    if (key === lastProductKey && qs('.mm-product-detail-box', viewer)) return;
    lastProductKey = key;

    const box = ensureDetailBox(viewer);
    if (!box) return;

    const lang = (() => {
      try { return localStorage.getItem('moyLang') || 'ky'; } catch (_) { return 'ky'; }
    })();

    const specs = getSpecs(product);
    const title = qs('.mm-product-detail-title', box);
    const ul = qs('.mm-product-detail-list', box);

    if (title) title.textContent = lang === 'ru' ? 'Характеристики:' : 'Характеристикалары:';
    if (ul) {
      ul.innerHTML = specs.length
        ? specs.map(x => `<li>${escapeHtml(x)}</li>`).join('')
        : `<li>${lang === 'ru' ? 'Дополнительная информация отсутствует.' : 'Кошумча маалымат жок.'}</li>`;
    }
  }

  function boot() {
    // The existing engagement viewer is created only after a product is opened.
    // Polling is intentionally used instead of a DOM observer to avoid a mutation loop.
    setInterval(() => {
      const viewer = qs('#mmProductViewer');
      if (!viewer) {
        lastProductKey = '';
        return;
      }
      if (!viewer.classList.contains('show')) {
        lastProductKey = '';
        return;
      }
      refresh(viewer);
    }, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
