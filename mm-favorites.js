/* MOY MARKET — Favorites / Избранное — FIXED
   • Uses the existing Like button as the favorite trigger.
   • Places the Favorites button directly under the header cart (#cartBtn).
   • Does not modify the existing cart/engagement/viewer systems.
*/
(() => {
  'use strict';

  const KEY = 'mmFavoritesV1';
  let favorites = load();
  let panel, button, countEl, listEl;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch (_) {
      return new Set();
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify([...favorites])); } catch (_) {}
  }

  function productId(card) {
    return card?.querySelector('.photo[data-product-id]')?.dataset.productId || '';
  }

  function currentProducts() {
    try {
      return (typeof products !== 'undefined' && Array.isArray(products)) ? products : [];
    } catch (_) {
      return [];
    }
  }

  function currentLang() {
    try { return localStorage.getItem('moyLang') || 'ky'; } catch (_) { return 'ky'; }
  }

  function productName(p) {
    const l = currentLang();
    return l === 'ru' ? (p.nameRu || p.name || '') : (p.name || p.nameRu || '');
  }

  function moneySafe(n) {
    try { if (typeof money === 'function') return money(n); } catch (_) {}
    return `${Number(n) || 0} сом`;
  }

  function escSafe(v) {
    try { if (typeof esc === 'function') return esc(v); } catch (_) {}
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function ensureButton() {
    if (button) return;

    button = document.createElement('button');
    button.type = 'button';
    button.className = 'mm-favorites-open';
    button.setAttribute('aria-label', 'Избранное');
    button.title = 'Избранное';
    button.innerHTML = `
      <span class="mm-favorites-hex" aria-hidden="true"><svg class="mm-favorites-hex-svg" viewBox="0 0 48 48" aria-hidden="true"><path class="hex-shape" d="M24 3.5 42 13.8v20.4L24 44.5 6 34.2V13.8L24 3.5Z"></path><path class="hex-heart" d="M24 33.2c-.5-.5-9.2-7.1-9.2-12.7 0-3.1 2.1-5.4 5-5.4 1.9 0 3.5 1 4.2 2.4.7-1.4 2.3-2.4 4.2-2.4 2.9 0 5 2.3 5 5.4 0 5.6-8.7 12.2-9.2 12.7Z"></path></svg></span>
      <span class="mm-favorites-label">Избранное</span>
      <b class="mm-favorites-count">0</b>
    `;

    button.addEventListener('click', openFavorites);
    document.body.appendChild(button);
    countEl = $('.mm-favorites-count', button);
    syncButton();
    positionButton();

    window.addEventListener('resize', positionButton, { passive: true });
    window.addEventListener('scroll', positionButton, { passive: true });
    setInterval(positionButton, 1200);
  }

  function positionButton() {
    if (!button) return;
    const cart = document.getElementById('cartBtn');
    if (!cart) return;

    const rect = cart.getBoundingClientRect();
    const width = button.offsetWidth || 52;
    const gap = 8;

    let left = rect.left + (rect.width - width) / 2;
    let top = rect.bottom + gap;

    const maxLeft = window.innerWidth - width - 8;
    left = Math.max(8, Math.min(left, maxLeft));

    // Keep it inside the viewport when a very tall header is used.
    if (top + button.offsetHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - button.offsetHeight - 8);
    }

    button.style.left = `${Math.round(left)}px`;
    button.style.top = `${Math.round(top)}px`;
    button.style.right = 'auto';
    button.style.bottom = 'auto';
  }

  function ensurePanel() {
    if (panel) return;

    panel = document.createElement('div');
    panel.className = 'mm-favorites-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="mm-favorites-backdrop"></div>
      <aside class="mm-favorites-drawer" role="dialog" aria-modal="true" aria-labelledby="mmFavoritesTitle">
        <div class="mm-favorites-head">
          <div>
            <span class="mm-favorites-kicker">МОЙ МАРКЕТ</span>
            <h2 id="mmFavoritesTitle">❤️ Избранное</h2>
            <small class="mm-favorites-subtitle"></small>
          </div>
          <button type="button" class="mm-favorites-close" aria-label="Закрыть">×</button>
        </div>
        <div class="mm-favorites-list"></div>
      </aside>
    `;

    document.body.appendChild(panel);
    listEl = $('.mm-favorites-list', panel);

    $('.mm-favorites-backdrop', panel).addEventListener('click', closeFavorites);
    $('.mm-favorites-close', panel).addEventListener('click', closeFavorites);

    panel.addEventListener('click', e => {
      const remove = e.target.closest('[data-fav-remove]');
      if (remove) {
        e.preventDefault();
        removeFavorite(remove.dataset.favRemove);
        return;
      }

      const add = e.target.closest('[data-fav-add]');
      if (add) {
        e.preventDefault();
        const id = add.dataset.favAdd;
        const p = currentProducts().find(x => String(x.id) === String(id));
        if (p && typeof addToCart === 'function') addToCart(p.id);
      }
    });
  }

  function syncButton() {
    if (!countEl || !button) return;
    countEl.textContent = String(favorites.size);
    button.classList.toggle('has-items', favorites.size > 0);
    $('.mm-favorites-heart', button).textContent = favorites.size ? '♥' : '♡';
  }

  function openFavorites() {
    ensurePanel();
    renderFavorites();
    panel.classList.add('show');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mm-favorites-lock');
  }

  function closeFavorites() {
    if (!panel) return;
    panel.classList.remove('show');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mm-favorites-lock');
  }

  function renderFavorites() {
    if (!listEl) return;

    const all = currentProducts();
    const items = [...favorites]
      .map(id => all.find(p => String(p.id) === String(id)))
      .filter(Boolean);

    const lang = currentLang();
    $('.mm-favorites-subtitle', panel).textContent =
      lang === 'ru' ? `${items.length} избранных товаров` : `${items.length} тандалган товар`;

    if (!items.length) {
      listEl.innerHTML = `
        <div class="mm-favorites-empty">
          <div class="mm-favorites-empty-icon">♡</div>
          <h3>${lang === 'ru' ? 'Избранное пока пусто' : 'Избранное азырынча бош'}</h3>
          <p>${lang === 'ru'
            ? 'Нажмите ❤️ на понравившемся товаре, чтобы сохранить его здесь.'
            : 'Жаккан товардагы ❤️ баскычын басып, бул жерге сактап коюңуз.'}</p>
          <button type="button" class="mm-favorites-go">${lang === 'ru' ? 'Смотреть товары' : 'Товарларды көрүү'}</button>
        </div>
      `;
      $('.mm-favorites-go', listEl)?.addEventListener('click', closeFavorites);
      return;
    }

    listEl.innerHTML = items.map(p => `
      <article class="mm-fav-card" data-fav-card="${escSafe(p.id)}">
        <div class="mm-fav-image">
          <img src="${escSafe(p.image || 'assets/products/placeholder.svg')}"
               alt="${escSafe(productName(p))}"
               loading="lazy"
               onerror="this.onerror=null;this.src='assets/products/placeholder.svg'">
        </div>
        <div class="mm-fav-info">
          <b>${escSafe(productName(p))}</b>
          <strong>${moneySafe(p.price)}</strong>
          <div class="mm-fav-actions">
            <button type="button" data-fav-add="${escSafe(p.id)}">🛒 ${lang === 'ru' ? 'В корзину' : 'Себетке'}</button>
            <button type="button" class="mm-fav-remove" data-fav-remove="${escSafe(p.id)}" aria-label="Удалить">♡</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  function setFavoriteFromCard(card) {
    const id = productId(card);
    if (!id) return;

    const like = card.querySelector('[data-mm-action="like"]');
    const liked = !!like?.classList.contains('liked');

    if (liked) favorites.add(String(id));
    else favorites.delete(String(id));

    save();
    syncButton();

    if (panel?.classList.contains('show')) renderFavorites();
  }

  function removeFavorite(id) {
    const sid = String(id);
    favorites.delete(sid);
    save();
    syncButton();

    const card = $(`#products .photo[data-product-id="${CSS.escape(sid)}"]`)?.closest('.product');
    const like = card?.querySelector('[data-mm-action="like"]');
    if (like?.classList.contains('liked')) like.click();

    if (panel?.classList.contains('show')) renderFavorites();
  }

  function bindLikeWatcher() {
    document.addEventListener('click', e => {
      const cardLike = e.target.closest('#products [data-mm-action="like"]');
      if (cardLike) {
        const card = cardLike.closest('#products .product, #products .product-card, #products [data-product-card]');
        if (card) setTimeout(() => setFavoriteFromCard(card), 0);
        return;
      }

      const viewerLike = e.target.closest('#mmProductViewer [data-vaction="like"]');
      if (viewerLike) {
        const viewer = viewerLike.closest('#mmProductViewer');
        const card = viewer?._card;
        if (card) setTimeout(() => setFavoriteFromCard(card), 0);
      }
    }, true);

    const root = $('#products');
    if (root) {
      const observer = new MutationObserver(() => {
        const cards = $$('#products .product');
        cards.forEach(card => {
          const id = productId(card);
          if (!id) return;
          const like = card.querySelector('[data-mm-action="like"]');
          if (like) like.classList.toggle('liked', favorites.has(String(id)));
        });
      });
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  function restoreLikeState() {
    $$('#products .product').forEach(card => {
      const id = productId(card);
      if (!id) return;
      const like = card.querySelector('[data-mm-action="like"]');
      if (like) like.classList.toggle('liked', favorites.has(String(id)));
    });
  }

  function boot() {
    ensureButton();
    ensurePanel();
    bindLikeWatcher();
    restoreLikeState();
    positionButton();

    setInterval(() => {
      restoreLikeState();
      syncButton();
      positionButton();
      if (panel?.classList.contains('show')) renderFavorites();
    }, 1200);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeFavorites();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
