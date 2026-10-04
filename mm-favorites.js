/* MOY MARKET — ИЗБРАННОЕ FINAL V15
   FIX:
   - Like click тың capture phase'да кармалат.
   - Избранное localStorage'да сакталат.
   - Existing Like button'дар автоматтык түрдө favorite катары иштейт.
   - Даяр #mmFavoritesBtn болсо, кайра кнопка түзүлбөйт.
   - Панель: Избранное.
*/

(() => {
  'use strict';

  const FAVORITES_KEY = 'mmFavoritesV15';
  const ITEMS_KEY = 'mmFavoritesItemsV15';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  let favorites = loadFavorites();
  let items = loadItems();
  let panel = null;

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const value = raw ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(value)
          ? value.map(String)
          : []
      );
    } catch (_) {
      return new Set();
    }
  }

  function saveFavorites() {
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

      return (
        value &&
        typeof value === 'object'
      )
        ? value
        : {};
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

    return String(value)
      .toLowerCase()
      .startsWith('ky')
      ? 'ky'
      : 'ru';
  }

  function isKy() {
    return getLang() === 'ky';
  }

  function productCards() {
    return $$(
      '#products .product, #products .product-card, #products [data-product-card]'
    );
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

  function getCardFromLike(button) {
    if (!button) return null;

    return button.closest(
      '[data-product-id], [data-id], [data-product], [data-pid], .product, .product-card, [data-product-card], .card'
    );
  }

  function getCardId(card) {
    if (!card) return '';

    const direct =
      card.dataset.productId ||
      card.dataset.id ||
      card.dataset.product ||
      card.dataset.pid;

    if (direct) {
      const id = String(direct);
      card.dataset.mmFavoriteId = id;
      return id;
    }

    if (card.dataset.mmFavoriteId) {
      return String(card.dataset.mmFavoriteId);
    }

    const name =
      text(
        $(
          'h3, .pname, .product-name, .product-title, [data-product-name]',
          card
        )
      ) || 'Товар';

    const image =
      $('img', card)?.currentSrc ||
      $('img', card)?.src ||
      '';

    const source =
      `${name}|${image}`;

    let hash = 2166136261;

    for (
      let i = 0;
      i < source.length;
      i += 1
    ) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(
        hash,
        16777619
      );
    }

    const id =
      `mm_${(hash >>> 0).toString(36)}`;

    card.dataset.mmFavoriteId = id;

    return id;
  }

  function getCardName(card) {
    return (
      text(
        $(
          'h3, .pname, .product-name, .product-title, [data-product-name]',
          card
        )
      ) || 'Товар'
    );
  }

  function getCardPrice(card) {
    const price =
      $(
        '.price, .product-price, [data-price]',
        card
      );

    return price
      ? text(price)
      : '';
  }

  function getCardImage(card) {
    return (
      $('img', card)?.currentSrc ||
      $('img', card)?.src ||
      'assets/products/placeholder.svg'
    );
  }

  function saveCard(card) {
    const id = getCardId(card);

    if (!id) {
      return null;
    }

    const record = {
      id,
      name: getCardName(card),
      price: getCardPrice(card),
      image: getCardImage(card),
      updatedAt: Date.now()
    };

    items[id] = record;
    saveItems();

    return record;
  }

  function getFavoriteButton() {
    return (
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open')
    );
  }

  function getFavoriteCount() {
    return (
      $('#mmFavoritesCount') ||
      $('.mm-favorites-count')
    );
  }

  function syncFavoriteButton() {
    const button =
      getFavoriteButton();

    const count =
      getFavoriteCount();

    if (!button || !count) {
      return;
    }

    const total =
      favorites.size;

    count.textContent =
      String(total);

    button.classList.toggle(
      'has-items',
      total > 0
    );

    button.setAttribute(
      'aria-label',
      isKy()
        ? `Тандалгандар: ${total}`
        : `Избранное: ${total}`
    );

    button.title =
      isKy()
        ? 'Тандалгандар'
        : 'Избранное';
  }

  function syncLikeState() {
    $$(
      '[data-mm-action="like"]'
    ).forEach(
      (button) => {

        const card =
          getCardFromLike(button);

        if (!card) {
          return;
        }

        const id =
          getCardId(card);

        if (!id) {
          return;
        }

        const active =
          favorites.has(id);

        button.classList.toggle(
          'is-liked',
          active
        );

        button.classList.toggle(
          'liked',
          active
        );

        button.classList.toggle(
          'mm-favorite-active',
          active
        );

        button.setAttribute(
          'aria-pressed',
          active
            ? 'true'
            : 'false'
        );

        const icon =
          $('.mm-heart', button);

        if (icon) {
          icon.textContent =
            active
              ? '♥'
              : '♡';
        }
      }
    );
  }

  function toggleFavorite(card) {
    if (!card) {
      return;
    }

    const record =
      saveCard(card);

    if (!record) {
      return;
    }

    const id =
      record.id;

    if (
      favorites.has(id)
    ) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }

    saveFavorites();

    syncFavoriteButton();
    syncLikeState();

    if (
      panel &&
      panel.classList.contains('show')
    ) {
      renderPanel();
    }
  }

  function removeFavorite(id) {
    const key =
      String(id || '');

    if (!key) {
      return;
    }

    favorites.delete(key);

    saveFavorites();

    syncFavoriteButton();
    syncLikeState();
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
    if (!panel) {
      return;
    }

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
      <div
        class="mm-favorites-backdrop"
      ></div>

      <div
        class="mm-favorites-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="${
          isKy()
            ? 'Тандалгандар'
            : 'Избранное'
        }"
      >

        <div class="mm-favorites-head">

          <div>
            <h2
              class="mm-favorites-title"
            >
              ${
                isKy()
                  ? 'Тандалгандар'
                  : 'Избранное'
              }
            </h2>

            <span
              class="mm-favorites-subtitle"
            >
              ${
                isKy()
                  ? 'Сиз тандаган товарлар'
                  : 'Ваши любимые товары'
              }
            </span>
          </div>

          <button
            type="button"
            class="mm-favorites-close"
            aria-label="${
              isKy()
                ? 'Жабуу'
                : 'Закрыть'
            }"
          >
            ×
          </button>

        </div>

        <div
          class="mm-favorites-list"
        ></div>

      </div>
    `;

    document.body.appendChild(
      panel
    );

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

      addToCartFromFavorite(
        items[id]
      );
    }
  }

  function addToCartFromFavorite(
    item
  ) {
    if (!item) {
      return;
    }

    const card =
      productCards().find(
        (candidate) =>
          getCardId(candidate) ===
          String(item.id)
      );

    if (card) {

      const addButton =
        $(
          '.cart-add, .add-to-cart, [data-add-cart], .buy',
          card
        );

      if (addButton) {
        addButton.click();
        return;
      }
    }

    if (
      typeof window.addToCart ===
      'function'
    ) {

      window.addToCart({
        id: item.id,
        name: item.name,
        title: item.name,
        price: item.price,
        image: item.image
      });
    }
  }

  function renderPanel() {
    if (!panel) {
      return;
    }

    const list =
      $(
        '.mm-favorites-list',
        panel
      );

    if (!list) {
      return;
    }

    const selected =
      Array.from(favorites)
        .map(
          (id) =>
            items[String(id)]
        )
        .filter(Boolean);

    if (!selected.length) {

      list.innerHTML = `
        <div class="mm-favorites-empty">

          <div
            class="mm-favorites-empty-icon"
          >
            ♡
          </div>

          <strong>
            ${
              isKy()
                ? 'Азырынча тандалган товар жок'
                : 'Пока нет избранных товаров'
            }
          </strong>

          <span>
            ${
              isKy()
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
            <article
              class="mm-fav-card"
            >

              <div
                class="mm-fav-image"
              >
                <img
                  src="${escapeHtml(item.image)}"
                  alt="${escapeHtml(item.name)}"
                  loading="lazy"
                >
              </div>

              <div
                class="mm-fav-info"
              >

                <div
                  class="mm-fav-name"
                >
                  ${escapeHtml(
                    item.name
                  )}
                </div>

                ${
                  item.price
                    ? `
                      <strong
                        class="mm-fav-price"
                      >
                        ${escapeHtml(
                          item.price
                        )}
                      </strong>
                    `
                    : ''
                }

                <div
                  class="mm-fav-actions"
                >

                  <button
                    type="button"
                    data-fav-add="${escapeHtml(item.id)}"
                  >
                    ${
                      isKy()
                        ? 'Себетке'
                        : 'В корзину'
                    }
                  </button>

                  <button
                    type="button"
                    class="mm-fav-remove"
                    data-fav-remove="${escapeHtml(item.id)}"
                    aria-label="${
                      isKy()
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

  /*
    ВАЖНО:
    capture=true.
    mm-engagement.js документтин capture фазасында
    Like'ты кармайт. Ошондуктан Favorites да capture
    фазасында угат.
  */
  function handleLikeClick(event) {
    const like =
      event.target.closest(
        '[data-mm-action="like"]'
      );

    if (!like) {
      return;
    }

    const card =
      getCardFromLike(like);

    if (!card) {
      return;
    }

    toggleFavorite(card);
  }

  function handleFavoriteButtonClick(
    event
  ) {
    const button =
      event.target.closest(
        '#mmFavoritesBtn, .mm-favorites-open'
      );

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    openPanel();
  }

  function watchProducts() {
    const root =
      $('#products');

    if (!root) {
      return;
    }

    let lastSignature = '';

    setInterval(
      () => {

        const cards =
          productCards();

        const signature =
          cards.length +
          ':' +
          cards
            .map(
              (card) =>
                getCardId(card)
            )
            .join('|');

        if (
          signature !==
          lastSignature
        ) {
          lastSignature =
            signature;

          syncLikeState();
          syncFavoriteButton();
        }

      },
      900
    );
  }

  function init() {

    ensurePanel();

    const button =
      getFavoriteButton();

    if (button) {
      button.addEventListener(
        'click',
        handleFavoriteButtonClick,
        true
      );
    }

    /*
      Критикалык оңдоо:
      true = capture phase.
    */
    document.addEventListener(
      'click',
      handleLikeClick,
      true
    );

    syncLikeState();
    syncFavoriteButton();
    watchProducts();

    window.addEventListener(
      'resize',
      syncFavoriteButton,
      { passive: true }
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
