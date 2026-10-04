/* MOY MARKET — detailed product information inside the existing product viewer.
   This file does NOT replace the existing engagement viewer.
   Like / Comment / Share / View remain handled by mm-engagement.js + mm-viewer-hotfix.js.
*/
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

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
    try {
      if (typeof window.lang === 'string') lang = window.lang;
    } catch (_) {}

    // app.js stores language in localStorage, so use that as the reliable fallback.
    try {
      lang = localStorage.getItem('moyLang') || lang;
    } catch (_) {}

    const specs = lang === 'ru'
      ? (product.characteristicsRu || product.characteristics || [])
      : (product.characteristics || product.characteristicsRu || []);

    if (Array.isArray(specs) && specs.length) return specs.filter(Boolean).map(String);

    const desc = lang === 'ru'
      ? (product.descriptionRu || product.description || '')
      : (product.description || product.descriptionRu || '');

    return desc ? [String(desc)] : [];
  }

  function ensureDetailBox(viewer) {
    const body = $('.mm-viewer-body', viewer);
    const actions = $('.mm-viewer-actions', viewer);
    if (!body) return null;

    let box = $('.mm-product-detail-box', viewer);
    if (!box) {
      box = document.createElement('section');
      box.className = 'mm-product-detail-box';
      box.setAttribute('aria-label', 'Product characteristics');
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

    const box = ensureDetailBox(viewer);
    if (!box) return;

    const product = getProductFromViewer(viewer);
    const list = getSpecs(product);
    const title = $('.mm-product-detail-title', box);
    const ul = $('.mm-product-detail-list', box);

    const lang = (() => {
      try { return localStorage.getItem('moyLang') || 'ky'; } catch (_) { return 'ky'; }
    })();

    if (title) title.textContent = lang === 'ru' ? 'Характеристики:' : 'Характеристикалары:';
    if (ul) {
      ul.innerHTML = list.length
        ? list.map(x => `<li>${escapeHtml(x)}</li>`).join('')
        : `<li>${lang === 'ru' ? 'Дополнительная информация отсутствует.' : 'Кошумча маалымат жок.'}</li>`;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  function boot() {
    const observer = new MutationObserver(() => {
      const viewer = $('#mmProductViewer');
      if (!viewer) return;
      refresh(viewer);
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    // The viewer is created only after the first product click.
    setInterval(() => {
      const viewer = $('#mmProductViewer');
      if (viewer) refresh(viewer);
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
