/* МОЙ МАРКЕТ — ИЗБРАННОЕ FINAL V14
   НОВАЯ СТАБИЛЬНАЯ ВЕРСИЯ
   - Кнопка уже барда index.html ичинде турат.
   - Кнопка корзинанын түз астында.
   - Товарды Like (❤️) басканда Избранное кошулат/өчөт.
   - Маалымат localStorage'да сакталат.
   - Иштөө window.products'ке көз каранды эмес.
   - MutationObserver жок.
*/

(() => {
  'use strict';

  const FAVORITES_KEY = 'mmFavoritesV14';
  const ITEMS_KEY = 'mmFavoritesItemsV14';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  let favorites = loadSet();
  let items = loadItems();
  let panel = null;

  function loadSet() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const value = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(value) ? value.map(String) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveSet() {
    try {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(Array.from(favorites))
      );
    } catch (_) {}
  }

  function loadItems() {
    try {
      const raw = localStorage.getItem(ITEMS_KEY);
      const value = raw ? JSON.parse(raw) : {};
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function saveItems() {
    try {
      localStorage.setItem(
        ITEMS_KEY,
        JSON.stringify(items)
      );
    } catch (_) {}
  }

  function getLang() {
    const value =
      localStorage.getItem('moyLang') ||
      localStorage.getItem('lang') ||
      document.documentElement.lang ||
      'ru';

    return String(value).toLowerCase().startsWith('ky')
      ? 'ky'
      : 'ru';
  }

  function text(value) {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cardId(card) {
    if (!card) return '';

    if (card.dataset.mmId) {
      return String(card.dataset.mmId);
    }

    const explicit =
      card.dataset.productId ||
      card.dataset.id ||
      card.dataset.product ||
      card.dataset.pid;

    if (explicit) {
      const id = String(explicit);
      card.dataset.mmId = id;
      return id;
    }

    const name =
      text(
        $(
          'h3,.pname,.product-name,.product-title,[data-product-name]',
          card
        )
      ) || 'Товар';

    const img = $('img', card);

    const image =
      img?.currentSrc ||
      img?.src ||
      '';

    const source =
      `${name}|${image}`;

    let hash = 2166136261;

    for (let i = 0; i < source.length; i += 1) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const id =
      `mm_${(hash >>> 0).toString(36)}`;

    card.dataset.mmId = id;

    return id;
  }

  function cardTitle(card) {
    return (
      text(
        $(
          'h3,.pname,.product-name,.product-title,[data-product-name]',
          card
        )
      ) || 'Товар'
    );
  }

  function cardPrice(card) {
    const priceEl = $(
      '.price,.product-price,[data-price]',
      card
    );

    if (priceEl) {
      return text(priceEl);
    }

    const fallback = $$(
      'b,strong',
      card
    ).find(
      (el) =>
        /\d/.test(text(el)) &&
        /сом|₸|₽|\$/.test(text(el))
    );

    return fallback
      ? text(fallback)
      : '';
  }

  function cardImage(card) {
    const img = $('img', card);

    return (
      img?.currentSrc ||
      img?.src ||
      'assets/products/placeholder.svg'
    );
  }

  function cardData(card) {
    const id = cardId(card);

    const record = {
      id,
      name: cardTitle(card),
      price: cardPrice(card),
      image: cardImage(card),
      updatedAt: Date.now()
    };

    items[id] = record;
    saveItems();

    return record;
  }

  function productCards() {
    return $$('#products .product, #products .product-card, #products [data-product-card]');
  }

  function getCardFromLike(button) {
    return button.closest(
      '[data-product-id], [data-id], [data-product], [data-pid], .product, .product-card, [data-product-card], .card'
    );
  }

  function getButton() {
    return $('#mmFavoritesBtn') ||
      $('.mm-favorites-open');
  }

  function getCount() {
    return $('#mmFavoritesCount') ||
      $('.mm-favorites-count');
  }

  function syncButton() {
    const button = getButton();
    const count = getCount();

    if (!button || !count) return;

    const total = favorites.size;

    count.textContent = String(total);

    button.classList.toggle(
      'has-items',
      total > 0
    );

    button.setAttribute(
      'aria-label',
      getLang() === 'ky'
        ? `Тандалгандар: ${total}`
        : `Избранное: ${total}`
    );

    button.title =
      getLang() === 'ky'
        ? 'Тандалгандар'
        : 'Избранное';
  }

  function syncLikes() {
    $$('[data-mm-action="like"]').forEach(
      (button) => {
        const card =
          getCardFromLike(button);

        if (!card) return;

        const id =
          cardId(card);

        const active =
          favorites.has(id);

        button.classList.toggle(
          'is-liked',
          active
        );

        button.classList.toggle(
          'mm-favorite-active',
          active
        );

        button.setAttribute(
          'aria-pressed',
          active ? 'true' : 'false'
        );

        const icon =
          $('.mm-heart', button);

        if (icon) {
          icon.textContent =
            active ? '♥' : '♡';
        }
      }
    );
  }

  function toggleFavorite(card) {
    if (!card) return;

    const data =
      cardData(card);

    const id =
      data.id;

    if (!id) return;

    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }

    saveSet();
    syncButton();
    syncLikes();

    if (
      panel &&
      panel.classList.contains('show')
    ) {
      renderPanel();
    }
  }

  function removeFavorite(id) {
    const key = String(id || '');

    if (!key) return;

    favorites.delete(key);

    saveSet();
    syncButton();
    syncLikes();
    renderPanel();
  }

  function openPanel() {
    ensurePanel();
    renderPanel();

    panel.classList.add('show');

    panel.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'mm-favorites-lock'
    );
  }

  function closePanel() {
    if (!panel) return;

    panel.classList.remove('show');

    panel.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'mm-favorites-lock'
    );
  }

  function ensurePanel() {
    if (
      panel &&
      document.body.contains(panel)
    ) {
      return;
    }

    panel =
      document.createElement('aside');

    panel.className =
      'mm-favorites-panel';

    panel.setAttribute(
      'aria-hidden',
      'true'
    );

    panel.innerHTML = `
      <div class="mm-favorites-backdrop"></div>

      <div
        class="mm-favorites-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="${
          getLang() === 'ky'
            ? 'Тандалгандар'
            : 'Избранное'
        }"
      >
        <div class="mm-favorites-head">

          <div>
            <h2 class="mm-favorites-title">
              ${
                getLang() === 'ky'
                  ? 'Тандалгандар'
                  : 'Избранное'
              }
            </h2>

            <span class="mm-favorites-subtitle">
              ${
                getLang() === 'ky'
                  ? 'Сиз тандаган товарлар'
                  : 'Ваши любимые товары'
              }
            </span>
          </div>

          <button
            type="button"
            class="mm-favorites-close"
            aria-label="${
              getLang() === 'ky'
                ? 'Жабуу'
                : 'Закрыть'
            }"
          >
            ×
          </button>

        </div>

        <div class="mm-favorites-list"></div>
      </div>
    `;

    document.body.appendChild(panel);

    $(
      '.mm-favorites-backdrop',
      panel
    ).addEventListener(
      'click',
      closePanel
    );

    $(
      '.mm-favorites-close',
      panel
    ).addEventListener(
      'click',
      closePanel
    );

    panel.addEventListener(
      'click',
      handlePanelClick
    );
  }

  function handlePanelClick(event) {
    const remove =
      event.target.closest(
        '[data-fav-remove]'
      );

    if (remove) {
      event.preventDefault();
      event.stopPropagation();

      removeFavorite(
        remove.dataset.favRemove
      );

      return;
    }

    const add =
      event.target.closest(
        '[data-fav-add]'
      );

    if (add) {
      event.preventDefault();
      event.stopPropagation();

      const id =
        String(
          add.dataset.favAdd || ''
        );

      const info =
        items[id];

      if (!info) return;

      addItemToCart(info);

      return;
    }
  }

  function addItemToCart(info) {
    const card =
      productCards().find(
        (item) =>
          cardId(item) === String(info.id)
      );

    if (card) {
      const add =
        $(
          '.cart-add,.add-to-cart,[data-add-cart]',
          card
        );

      if (add) {
        add.click();
        return;
      }
    }

    if (
      typeof window.addToCart ===
      'function'
    ) {
      window.addToCart({
        id: info.id,
        name: info.name,
        title: info.name,
        price: info.price,
        image: info.image
      });
    }
  }

  function renderPanel() {
    if (!panel) return;

    const list =
      $('.mm-favorites-list', panel);

    if (!list) return;

    const selected =
      Array.from(favorites)
        .map(
          (id) => items[String(id)]
        )
        .filter(Boolean);

    if (!selected.length) {

      list.innerHTML = `
        <div class="mm-favorites-empty">

          <div class="mm-favorites-empty-icon">
            ♡
          </div>

          <strong>
            ${
              getLang() === 'ky'
                ? 'Азырынча тандалган товар жок'
                : 'Пока нет избранных товаров'
            }
          </strong>

          <span>
            ${
              getLang() === 'ky'
                ? 'Товардагы ❤️ белгисин басып, товарды ушул жерге кошуңуз.'
                : 'Нажмите ❤️ на товаре, чтобы добавить его сюда.'
            }
          </span>

        </div>
      `;

      return;
    }

    list.innerHTML =
      selected
        .map(
          (item) => `
            <article class="mm-fav-card">

              <div class="mm-fav-image">
                <img
                  src="${escapeHtml(item.image)}"
                  alt="${escapeHtml(item.name)}"
                  loading="lazy"
                >
              </div>

              <div class="mm-fav-info">

                <div class="mm-fav-name">
                  ${escapeHtml(item.name)}
                </div>

                ${
                  item.price
                    ? `
                      <strong class="mm-fav-price">
                        ${escapeHtml(item.price)}
                      </strong>
                    `
                    : ''
                }

                <div class="mm-fav-actions">

                  <button
                    type="button"
                    data-fav-add="${escapeHtml(item.id)}"
                  >
                    ${
                      getLang() === 'ky'
                        ? 'Себетке'
                        : 'В корзину'
                    }
                  </button>

                  <button
                    type="button"
                    class="mm-fav-remove"
                    data-fav-remove="${escapeHtml(item.id)}"
                    aria-label="${
                      getLang() === 'ky'
                        ? 'Өчүрүү'
                        : 'Удалить'
                    }"
                  >
                    ♡
                  </button>

                </div>

              </div>

            </article>
          `
        )
        .join('');
  }

  function handleLikeClick(event) {
    const like =
      event.target.closest(
        '[data-mm-action="like"]'
      );

    if (!like) return;

    const card =
      getCardFromLike(like);

    if (!card) return;

    toggleFavorite(card);
  }

  function handleFavoriteButtonClick(event) {
    const button =
      event.target.closest(
        '#mmFavoritesBtn,.mm-favorites-open'
      );

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    openPanel();
  }

  function syncExistingCards() {
  productCards().forEach(
    (card) => {
      if (favorites.has(cardId(card))) {
        cardData(card);
      }
    }
  );

  syncLikes();
  syncButton();
}

function init() {
  const button = getButton();

  if (!button) {
    createFallbackButton();
  }

  const actualButton =
    getButton();

  if (actualButton) {
    actualButton.addEventListener(
      'click',
      handleFavoriteButtonClick,
      true
    );
  }

  document.addEventListener(
    'click',
    handleLikeClick,
    false
  );

  window.addEventListener(
    'resize',
    syncButton,
    { passive: true }
  );

  syncExistingCards();

  setInterval(
    syncExistingCards,
    1500
  );
}

function createFallbackButton() {
  const cart =
    document.getElementById('cartBtn');

  const headerMeta =
    cart?.parentElement;

  if (!headerMeta) return;

  const wrapper =
    document.createElement('div');

  wrapper.className =
    'mm-cart-favorites-stack';

  if (cart) {
    headerMeta.insertBefore(
      wrapper,
      cart
    );

    wrapper.appendChild(
      cart
    );
  } else {
    headerMeta.appendChild(
      wrapper
    );
  }

  const button =
    document.createElement('button');

  button.type = 'button';

  button.id =
    'mmFavoritesBtn';

  button.className =
    'mm-favorites-open';

  button.setAttribute(
    'aria-label',
    'Избранное'
  );

  button.title =
    'Избранное';

  button.innerHTML = `
    <span
      class="mm-favorites-hex"
      aria-hidden="true"
    >
      <svg
        class="mm-favorites-hex-svg"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >

        <path
          class="hex-shape"
          d="M24 3.5 41.5 13.75v20.5L24 44.5 6.5 34.25v-20.5L24 3.5Z"
        ></path>

        <path
          class="hex-heart"
          d="M24 33.2s-10.1-6.15-10.1-12.7c0-3.4 2.35-5.75 5.35-5.75 2.08 0 3.8 1.17 4.75 2.83.95-1.66 2.67-2.83 4.75-2.83 3 0 5.35 2.35 5.35 5.75C34.1 27.05 24 33.2 24 33.2Z"
        ></path>

      </svg>
    </span>

    <b
      class="mm-favorites-count"
      id="mmFavoritesCount"
    >
      0
    </b>
  `;

  wrapper.appendChild(
    button
  );
}

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    init,
    { once: true }
  );

} else {

  init();

}

})();
