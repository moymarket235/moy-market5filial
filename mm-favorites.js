/* МОЙ МАРКЕТ — LIKE + FAVORITES PROFESSIONAL V24
   Stable integration with the existing mm-engagement.js.
   - Does NOT toggle Like itself.
   - Reads the real .liked state after mm-engagement.js runs.
   - Keeps Favorites in localStorage.
   - Creates/positions the Favorites button without moving the cart.
   - Supports Likes from the homepage and the existing product viewer.
*/

(() => {
  'use strict';

  const FAVORITES_KEY = 'mmFavoritesV15';
  const ITEMS_KEY = 'mmFavoritesItemsV15';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  let favorites = loadSet();
  let items = loadItems();
  let panel = null;
  let viewerHooked = false;

  function loadSet() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(data)
          ? data.map(String)
          : []
      );
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
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object'
        ? data
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

  function lang() {
    try {
      return (
        localStorage.getItem('moyLang') ||
        document.documentElement.lang ||
        'ru'
      ).toLowerCase().startsWith('ky')
        ? 'ky'
        : 'ru';
    } catch (_) {
      return 'ru';
    }
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cards() {
    return $$('#products .product, #products .product-card, #products [data-product-card]');
  }

  function getCardFromLike(button) {
    return button?.closest(
      '#products .product, #products .product-card, #products [data-product-card]'
    ) || null;
  }

  function getCardId(card) {
    if (!card) return '';

    const direct =
      card.dataset.productId ||
      card.dataset.id ||
      card.dataset.product ||
      card.dataset.pid ||
      card.dataset.mmId ||
      card.dataset.mmFavoriteId;

    if (direct) {
      const id = String(direct);
      card.dataset.mmFavoriteId = id;
      return id;
    }

    const name =
      (
        $(
          'h3, .pname, .product-name, .product-title, [data-product-name]',
          card
        )?.textContent || 'Товар'
      )
        .replace(/\s+/g, ' ')
        .trim();

    const image =
      $('img', card)?.currentSrc ||
      $('img', card)?.src ||
      '';

    const source = `${name}|${image}`;

    let hash = 2166136261;

    for (let i = 0; i < source.length; i += 1) {
      hash ^= source.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const id =
      `mm_${(hash >>> 0).toString(36)}`;

    card.dataset.mmFavoriteId = id;
    return id;
  }

  function cardInfo(card) {
    return {
      id: getCardId(card),

      name:
        (
          $(
            'h3, .pname, .product-name, .product-title, [data-product-name]',
            card
          )?.textContent || 'Товар'
        )
          .replace(/\s+/g, ' ')
          .trim(),

      price:
        (
          $(
            '.price, .product-price, [data-price]',
            card
          )?.textContent || ''
        )
          .replace(/\s+/g, ' ')
          .trim(),

      image:
        $('img', card)?.currentSrc ||
        $('img', card)?.src ||
        'assets/products/placeholder.svg',

      updatedAt: Date.now()
    };
  }

  function saveCard(card) {
    const info = cardInfo(card);

    if (!info.id) {
      return null;
    }

    items[info.id] = info;
    saveItems();

    return info;
  }

  /* ---------------------------------------------------------
     FAVORITES BUTTON
     Fixed position = cart never moves.
  --------------------------------------------------------- */

  function ensureButton() {
    let button =
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open');

    if (!button) {
      button =
        document.createElement('button');

      button.type = 'button';
      button.id = 'mmFavoritesBtn';
      button.className =
        'mm-favorites-open';

      button.setAttribute(
        'aria-label',
        'Избранное'
      );

      button.innerHTML = `
        <span
          class="mm-favorites-hex"
          aria-hidden="true"
        >
          <svg
            class="mm-favorites-hex-svg"
            viewBox="0 0 48 48"
            aria-hidden="true"
            focusable="false"
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
          id="mmFavoritesCount"
          class="mm-favorites-count"
        >0</b>
      `;

      document.body.appendChild(button);
    }

    button.addEventListener(
      'click',
      onFavoriteButtonClick
    );

    syncButton();
    positionButton();
  }

  function positionButton() {
    const button = ensureExistingButton();
    const cart = $('#cartBtn');

    if (!button || !cart) {
      return;
    }

    const rect =
      cart.getBoundingClientRect();

    const width =
      button.offsetWidth || 46;

    const height =
      button.offsetHeight || 46;

    button.style.position = 'fixed';
    button.style.left =
      `${Math.round(
        rect.left +
        (rect.width - width) / 2
      )}px`;

    button.style.top =
      `${Math.round(
        rect.bottom + 12
      )}px`;

    button.style.margin = '0';
    button.style.zIndex = '1400';
  }

  function ensureExistingButton() {
    return (
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open')
    );
  }

  function syncButton() {
    const button =
      ensureExistingButton();

    if (!button) {
      return;
    }

    const count =
      $('#mmFavoritesCount') ||
      $('.mm-favorites-count', button);

    if (count) {
      count.textContent =
        String(favorites.size);
    }

    button.classList.toggle(
      'has-items',
      favorites.size > 0
    );

    const text =
      lang() === 'ky'
        ? `Тандалгандар: ${favorites.size}`
        : `Избранное: ${favorites.size}`;

    button.setAttribute(
      'aria-label',
      text
    );

    button.title =
      lang() === 'ky'
        ? 'Тандалгандар'
        : 'Избранное';
  }

  function onFavoriteButtonClick(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();
    openPanel();
  }

  /* ---------------------------------------------------------
     LIKE <-> FAVORITES
     IMPORTANT: we NEVER toggle Like here.
     mm-engagement.js owns the Like state.
  --------------------------------------------------------- */

  function applyFavoriteVisual(
    button
  ) {
    const card =
      getCardFromLike(button);

    if (!card) return;

    const id =
      getCardId(card);

    if (!id) return;

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
  }

  function applyAllFavoriteVisuals() {
    $$('#products [data-mm-action="like"]')
      .forEach(applyFavoriteVisual);
  }

  function readRealLikeState(
    button
  ) {
    /*
      ONLY `.liked` belongs to mm-engagement.js.
      `.is-liked` and `.mm-favorite-active` are our
      Favorites presentation classes and must never be
      treated as the source of truth.
    */
    return button.classList.contains('liked');
  }

  function syncFavoriteFromRealLike(
    button
  ) {
    const card =
      getCardFromLike(button);

    if (!card) return;

    const info =
      saveCard(card);

    if (!info) return;

    const liked =
      readRealLikeState(button);

    if (liked) {
      favorites.add(info.id);
    } else {
      favorites.delete(info.id);
    }

    saveSet();
    applyAllFavoriteVisuals();
    syncButton();

    if (
      panel?.classList.contains('show')
    ) {
      renderPanel();
    }
  }

  function handleHomepageLikeClick(
    event
  ) {
    const button =
      event.target.closest(
        '#products [data-mm-action="like"]'
      );

    if (!button) return;

    /*
      mm-engagement.js is loaded first and its
      document-capture listener runs first.
      We only READ the resulting .liked state.
    */
    setTimeout(() => {
      syncFavoriteFromRealLike(button);
    }, 0);

    setTimeout(() => {
      syncFavoriteFromRealLike(button);
    }, 80);
  }

  /* Viewer Like: its own listener lives on the viewer.
     We attach after the viewer exists, so the original
     viewer handler runs first and updates the card state.
  */
  function hookViewer() {
    const viewer =
      $('#mmProductViewer');

    if (
      !viewer ||
      viewerHooked
    ) {
      return;
    }

    viewerHooked = true;

    viewer.addEventListener(
      'click',
      (event) => {
        const button =
          event.target.closest(
            '[data-vaction="like"]'
          );

        if (!button) return;

        setTimeout(() => {
          const card =
            viewer._card;

          if (!card) return;

          const homeLike =
            card.querySelector(
              '[data-mm-action="like"]'
            );

          if (homeLike) {
            syncFavoriteFromRealLike(
              homeLike
            );
          }
        }, 0);

        setTimeout(() => {
          const card =
            viewer._card;

          if (!card) return;

          const homeLike =
            card.querySelector(
              '[data-mm-action="like"]'
            );

          if (homeLike) {
            syncFavoriteFromRealLike(
              homeLike
            );
          }
        }, 100);
      }
    );
  }

  /* ---------------------------------------------------------
     PANEL
  --------------------------------------------------------- */

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
          lang() === 'ky'
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
                lang() === 'ky'
                  ? 'Тандалгандар'
                  : 'Избранное'
              }
            </h2>

            <span
              class="mm-favorites-subtitle"
            >
              ${
                lang() === 'ky'
                  ? 'Сиз тандаган товарлар'
                  : 'Ваши любимые товары'
              }
            </span>
          </div>

          <button
            type="button"
            class="mm-favorites-close"
            aria-label="${
              lang() === 'ky'
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

  function removeFavorite(id) {
    favorites.delete(
      String(id)
    );

    saveSet();
    applyAllFavoriteVisuals();
    syncButton();
    renderPanel();
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

      addFavoriteToCart(
        items[String(add.dataset.favAdd)]
      );
    }
  }

  function addFavoriteToCart(item) {
    if (!item) return;

    const card =
      cards().find(
        (candidate) =>
          getCardId(candidate) ===
          String(item.id)
      );

    if (card) {
      const add =
        $(
          '.cart-add, .add-to-cart, [data-add-cart], .buy',
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
        id: item.id,
        name: item.name,
        title: item.name,
        price: item.price,
        image: item.image
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
              lang() === 'ky'
                ? 'Азырынча тандалган товар жок'
                : 'Пока нет избранных товаров'
            }
          </strong>

          <span>
            ${
              lang() === 'ky'
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
                  src="${esc(item.image)}"
                  alt="${esc(item.name)}"
                  loading="lazy"
                >
              </div>

              <div class="mm-fav-info">

                <div class="mm-fav-name">
                  ${esc(item.name)}
                </div>

                ${
                  item.price
                    ? `
                      <strong class="mm-fav-price">
                        ${esc(item.price)}
                      </strong>
                    `
                    : ''
                }

                <div class="mm-fav-actions">

                  <button
                    type="button"
                    data-fav-add="${esc(item.id)}"
                  >
                    ${
                      lang() === 'ky'
                        ? 'Себетке'
                        : 'В корзину'
                    }
                  </button>

                  <button
                    type="button"
                    class="mm-fav-remove"
                    data-fav-remove="${esc(item.id)}"
                    aria-label="${
                      lang() === 'ky'
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

  function init() {
    ensureButton();
    ensurePanel();

    document.addEventListener(
      'click',
      handleHomepageLikeClick,
      true
    );

    applyAllFavoriteVisuals();
    syncButton();
    positionButton();

    window.addEventListener(
      'resize',
      positionButton,
      { passive: true }
    );

    window.addEventListener(
      'scroll',
      positionButton,
      { passive: true }
    );

    /*
      Products are dynamically rendered by app.js.
      Keep positioning and favorite visuals synchronized.
    */
    setInterval(() => {
      if (!ensureExistingButton()) {
        ensureButton();
      }

      positionButton();
      applyAllFavoriteVisuals();
      hookViewer();
    }, 700);
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
