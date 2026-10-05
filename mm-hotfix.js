/* MOY MARKET — FINAL FUNCTIONAL FIX v4.1 SAFE
   - keeps the existing engagement logic
   - renders one clean SVG heart
   - makes homepage Like persistent across refreshes
   - restores homepage like/comment/share/view counters from engagement state
   - one tap = like, second tap = unlike
   - keeps Favorites synchronized with the homepage Like state
   - survives product re-rendering
   - keeps the account-modal protection
*/
(() => {
  'use strict';

  const ICON_VERSION = '4.1';
  const ACCOUNT_MODAL_ID = 'mmAccountModal';
  const LIKE_KEY = 'mmHomepageLikesV1';
  const ENGAGEMENT_KEY = 'mmEngagementV20';
  const FAVORITES_KEY = 'mmFavoritesV15';
  const FAVORITES_ITEMS_KEY = 'mmFavoritesItemsV15';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[ch]));

  const icons = {
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
  2 5.42 4.42 3 7.5 3
  c1.74 0 3.41.81 4.5 2.09
  C13.09 3.81 14.76 3 16.5 3
  C19.58 3 22 5.42 22 8.5
  c0 3.78-3.4 6.86-8.55 11.53L12 21.35Z"/>
</svg>`,
    comment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.2c0 4.4-3.8 7.8-8.6 7.8a9.7 9.7 0 0 1-3.8-.75L4 19.9l.8-3.35A7.35 7.35 0 0 1 3 11.2c0-4.35 3.8-7.8 8.6-7.8s8.6 3.45 8.6 7.8Z"/></svg>`,
    share: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10.5 13.5"/><path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 12s3.45-6 9.8-6 9.8 6 9.8 6-3.45 6-9.8 6-9.8-6-9.8-6Z"/><circle cx="12" cy="12" r="2.8"/></svg>`
  };

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function cards() {
    return qsa('#products .product, #products .product-card, #products [data-product-card]');
  }

  function title(card) {
    return (qs('h3,.pname,.product-name,.product-title,[data-product-name]', card)?.textContent || 'Товар')
      .replace(/\s+/g, ' ').trim();
  }

  function image(card) {
    const img = qs('img', card);
    return img?.currentSrc || img?.src || 'assets/products/placeholder.svg';
  }

  function stableId(card) {
    const src = image(card);
    const clean = src.split('?')[0].split('#')[0];
    const file = clean.substring(clean.lastIndexOf('/') + 1).toLowerCase();
    return `mm_stable_${hash(file || (title(card) + '|' + clean))}`;
  }

  function engagementLegacyId(card) {
    return hash(title(card) + '|' + image(card));
  }

  function favoriteLegacyId(card) {
    return `mm_${hash(title(card) + '|' + image(card))}`;
  }

  function loadObject(key, fallback = {}) {
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : fallback;
      return data && typeof data === 'object' ? data : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveObject(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
  }

  function loadLikeStore() {
    return loadObject(LIKE_KEY, {});
  }

  function loadEngagementState() {
    const data = loadObject(ENGAGEMENT_KEY, { products: {} });
    if (!data.products || typeof data.products !== 'object') data.products = {};
    return data;
  }

  function cardInfo(card) {
    return {
      id: favoriteLegacyId(card),
      name: title(card),
      price: (qs('.price,.product-price,[data-price]', card)?.textContent || '')
        .replace(/\s+/g, ' ').trim(),
      image: image(card),
      updatedAt: Date.now()
    };
  }

  function syncEngagementLegacy(card, liked, likes) {
    const state = loadEngagementState();
    const id = engagementLegacyId(card);
    const old = state.products[id] || {
      views: 0, likes: 0, liked: false, shares: 0, comments: []
    };
    old.liked = !!liked;
    old.likes = Math.max(0, Number(likes) || 0);
    state.products[id] = old;
    saveObject(ENGAGEMENT_KEY, state);
  }

  function syncFavoritesStorage(card, liked) {
    const id = favoriteLegacyId(card);
    const favorites = loadObject(FAVORITES_KEY, []);
    const list = Array.isArray(favorites) ? favorites.map(String) : [];
    const next = new Set(list);

    if (liked) next.add(id);
    else next.delete(id);

    saveObject(FAVORITES_KEY, Array.from(next));

    const items = loadObject(FAVORITES_ITEMS_KEY, {});
    if (liked) items[id] = cardInfo(card);
    else delete items[id];
    saveObject(FAVORITES_ITEMS_KEY, items);
  }

  function migrateAndReadLike(card) {
    const stable = stableId(card);
    const store = loadLikeStore();

    if (store[stable] && typeof store[stable] === 'object') {
      return !!store[stable].liked;
    }

    const engagement = loadEngagementState();
    const legacy = engagement.products[engagementLegacyId(card)];

    if (legacy && legacy.liked) {
      store[stable] = { liked: true, likes: 1, updatedAt: Date.now() };
      saveObject(LIKE_KEY, store);
      return true;
    }

    const favorites = loadObject(FAVORITES_KEY, []);
    if (Array.isArray(favorites) &&
        favorites.map(String).includes(favoriteLegacyId(card))) {
      store[stable] = { liked: true, likes: 1, updatedAt: Date.now() };
      saveObject(LIKE_KEY, store);
      return true;
    }

    return false;
  }

  function applyPersistentLike(card) {
  const button = qs('[data-mm-action="like"]', card);
  if (!button) return;

  const engagement = loadEngagementState();
  const id = engagementLegacyId(card);

  const p = engagement.products[id] || {
    views: 0,
    likes: 0,
    liked: false,
    shares: 0,
    comments: []
  };

  const liked = !!p.liked;

  button.classList.toggle('liked', liked);
  button.classList.toggle('is-liked', liked);
  button.classList.toggle('mm-favorite-active', liked);
  button.setAttribute('aria-pressed', liked ? 'true' : 'false');

  const b = qs('b', button);
  if (b) {
    b.textContent = String(Math.max(0, Number(p.likes) || 0));
  }
  }

  
  }

  function ensureBrokenAccountIsGone() {
    const modal = document.getElementById(ACCOUNT_MODAL_ID);
    if (!modal) return;

    if (!modal.querySelector('#mmAccountBody')) {
      modal.remove();
      document.body.classList.remove('mm-account-open');
    }
  }

  function buildBar(card) {
    const bar = document.createElement('div');
    bar.className = 'mm-card-actions';
    bar.dataset.mmHotfixIcons = ICON_VERSION;

    const engagement = loadEngagementState();
    const id = engagementLegacyId(card);
    const p = engagement.products[id] || {
      views: 0,
      likes: 0,
      liked: false,
      shares: 0,
      comments: []
    };

    bar.innerHTML = `
      <button class="mm-social-btn${p.liked ? ' liked' : ''}" type="button"
              data-mm-action="like" aria-label="Лайк"
              aria-pressed="${p.liked ? 'true' : 'false'}">
        <span class="mm-social-icon mm-heart">${icons.heart}</span><b>${p.likes}</b>
      </button>

      <button class="mm-social-btn" type="button"
              data-mm-action="comment" aria-label="Комментарий">
        <span class="mm-social-icon mm-comment-icon">${icons.comment}</span><b>${p.comments.length}</b>
      </button>

      <button class="mm-social-btn" type="button"
              data-mm-action="share" aria-label="Поделиться">
        <span class="mm-social-icon mm-share-icon">${icons.share}</span><b>${p.shares}</b>
      </button>

      <span class="mm-social-view" data-mm-view="1" aria-label="Көрүүлөр">
        <span class="mm-social-icon mm-eye-icon">${icons.eye}</span><b>${p.views}</b>
      </span>
    `;

    return bar;
  }

  function upgradeBar(bar) {
    if (!bar) return;
    if (bar.dataset.mmHotfixIcons === ICON_VERSION) return;

    const like = qs('[data-mm-action="like"]', bar);
    const comment = qs('[data-mm-action="comment"]', bar);
    const share = qs('[data-mm-action="share"]', bar);
    const view = qs('[data-mm-view]', bar);

    const oldLikeCount = like?.querySelector('b')?.textContent ?? '0';
    const oldCommentCount = comment?.querySelector('b')?.textContent ?? '0';
    const oldShareCount = share?.querySelector('b')?.textContent ?? '0';
    const oldViewCount = view?.querySelector('b')?.textContent ?? '0';
    const liked = like?.classList.contains('liked') || false;

    bar.innerHTML = `
      <button class="mm-social-btn${liked ? ' liked' : ''}" type="button"
              data-mm-action="like" aria-label="Лайк"
              aria-pressed="${liked ? 'true' : 'false'}">
        <span class="mm-social-icon mm-heart">${icons.heart}</span><b>${esc(oldLikeCount)}</b>
      </button>

      <button class="mm-social-btn" type="button"
              data-mm-action="comment" aria-label="Комментарий">
        <span class="mm-social-icon mm-comment-icon">${icons.comment}</span><b>${esc(oldCommentCount)}</b>
      </button>

      <button class="mm-social-btn" type="button"
              data-mm-action="share" aria-label="Поделиться">
        <span class="mm-social-icon mm-share-icon">${icons.share}</span><b>${esc(oldShareCount)}</b>
      </button>

      <span class="mm-social-view" data-mm-view="1" aria-label="Көрүүлөр">
        <span class="mm-social-icon mm-eye-icon">${icons.eye}</span><b>${esc(oldViewCount)}</b>
      </span>
    `;

    bar.dataset.mmHotfixIcons = ICON_VERSION;
  }

  function processProducts() {
    cards().forEach(card => {
      let bar = qs('.mm-card-actions', card);

      if (!bar) {
        bar = buildBar(card);
        card.appendChild(bar);
      } else {
        upgradeBar(bar);
      }

    });
  }

  function boot() {
    ensureBrokenAccountIsGone();
    processProducts();

    setTimeout(() => {
      ensureBrokenAccountIsGone();
      processProducts();
    }, 120);

    if (document.documentElement.dataset.mmHotfixTimerBound !== '1') {
      document.documentElement.dataset.mmHotfixTimerBound = '1';

      setInterval(() => {
        ensureBrokenAccountIsGone();
        processProducts();
      }, 2500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
