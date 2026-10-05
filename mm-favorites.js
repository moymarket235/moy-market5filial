/* МОЙ МАРКЕТ — LIKE + FAVORITES PROFESSIONAL V27
   CLEAN / NO DOUBLE TOGGLE

   FIXES:
   - mm-engagement.js owns the real .liked state
   - Favorites never changes .liked directly
   - Like -> Favorites is synchronized after the real Like action
   - Unlike immediately removes the product from Favorites
   - Removing from Favorites clicks the real homepage Like to unlike it
   - Duplicate/stale Favorite records are cleaned safely
   - Real product IDs are preserved
   - Fallback ID is stable by name + price
   - Favorite counter always follows the real Favorites Set
   - Homepage Like counters/icons are not overwritten here
   - Product Viewer Like syncs through the homepage Like
   - RU / KG supported
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
  let bound = false;

  /* =========================================================
     BASIC HELPERS
  ========================================================= */

  function normalizeText(value) {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function cleanText(value) {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function lang() {
    try {
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
    } catch (_) {
      return 'ru';
    }
  }

  function isKy() {
    return lang() === 'ky';
  }

  function hash(value) {
    let h = 2166136261;
    const source = String(value);

    for (let i = 0; i < source.length; i += 1) {
      h ^= source.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return (h >>> 0).toString(36);
  }

  /* =========================================================
     STORAGE
  ========================================================= */

  function loadSet() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const data = raw ? JSON.parse(raw) : [];

      return new Set(
        Array.isArray(data)
          ? data.map(String).filter(Boolean)
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

      if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data)
      ) {
        return {};
      }

      return data;
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

  /* =========================================================
     PRODUCT CARDS
  ========================================================= */

  function productCards() {
    return $$(
      '#products .product, #products .product-card, #products [data-product-card]'
    );
  }

  function getCardFromLike(button) {
    if (!button) return null;

    return button.closest(
      '#products .product, #products .product-card, #products [data-product-card], #products [data-product-id], #products [data-id], #products [data-product], #products [data-pid]'
    );
  }

  function getCardName(card) {
    if (!card) return 'Товар';

    return cleanText(
      $(
        'h3, .pname, .product-name, .product-title, [data-product-name]',
        card
      )?.textContent || 'Товар'
    );
  }

  function getCardPrice(card) {
    if (!card) return '';

    return cleanText(
      $(
        '.price, .product-price, [data-price]',
        card
      )?.textContent || ''
    );
  }

  function getCardImage(card) {
    if (!card) {
      return 'assets/products/placeholder.svg';
    }

    const image = $('img', card);

    return (
      image?.currentSrc ||
      image?.src ||
      'assets/products/placeholder.svg'
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
      const id = String(direct).trim();

      card.dataset.mmFavoriteId = id;

      return id;
    }

    if (card.dataset.mmFavoriteId) {
      return String(card.dataset.mmFavoriteId);
    }

    const name =
      normalizeText(
        getCardName(card)
      );

    const price =
      normalizeText(
        getCardPrice(card)
      );

    const source =
      `${name}|${price}`;

    const id =
      `mmfav_${hash(source)}`;

    card.dataset.mmFavoriteId = id;

    return id;
  }

  function cardInfo(card) {
    const id = getCardId(card);

    if (!id) return null;

    return {
      id,
      name: getCardName(card),
      price: getCardPrice(card),
      image: getCardImage(card),
      updatedAt: Date.now()
    };
  }

  function productSignature(value) {
    if (!value) return '';

    const name =
      normalizeText(
        value.name ||
        value.title ||
        ''
      );

    const price =
      normalizeText(
        value.price ||
        ''
      );

    return `${name}|${price}`;
  }

  function saveCard(card) {
    const info =
      cardInfo(card);

    if (!info) {
      return null;
    }

    items[info.id] =
      info;

    saveItems();

    return info;
  }

  function readRealLikeState(button) {
    if (!button) {
      return false;
    }

    return button.classList.contains(
      'liked'
    );
  }

  /* =========================================================
     DUPLICATE / STALE CLEANUP
  ========================================================= */

  function isGeneratedId(id) {
    return /^(mm_|mmfav_)/.test(
      String(id || '')
    );
  }

  function cleanupStoredDuplicates() {
    try {
      const groups =
        new Map();

      const idMap =
        new Map();

      const newItems =
        {};

      Object.keys(items)
        .forEach((oldId) => {
          const item =
            items[oldId];

          if (
            !item ||
            typeof item !== 'object'
          ) {
            return;
          }

          const signature =
            productSignature(item);

          if (!signature) {
            return;
          }

          let canonicalId =
            groups.get(signature);

          if (!canonicalId) {
            canonicalId =
              String(oldId);

            groups.set(
              signature,
              canonicalId
            );

          } else if (
            isGeneratedId(canonicalId) &&
            !isGeneratedId(oldId)
          ) {
            canonicalId =
              String(oldId);

            groups.set(
              signature,
              canonicalId
            );
          }

          idMap.set(
            String(oldId),
            String(canonicalId)
          );

          const existing =
            newItems[canonicalId];

          if (
            !existing ||
            Number(item.updatedAt || 0) >=
              Number(existing.updatedAt || 0)
          ) {
            newItems[canonicalId] = {
              id: canonicalId,

              name:
                cleanText(
                  item.name ||
                  item.title ||
                  'Товар'
                ),

              price:
                cleanText(
                  item.price ||
                  ''
                ),

              image:
                item.image ||
                'assets/products/placeholder.svg',

              updatedAt:
                Number(
                  item.updatedAt ||
                  0
                )
            };
          }
        });

      const newFavorites =
        new Set();

      Array.from(favorites)
        .forEach((oldId) => {
          const key =
            String(oldId);

          const mapped =
            idMap.get(key);

          if (mapped) {
            newFavorites.add(
              String(mapped)
            );
          }
        });

      favorites =
        newFavorites;

      items =
        newItems;

      saveSet();
      saveItems();

    } catch (_) {
      /* Never break the website because cleanup failed. */
    }
  }

  function syncFavoritesFromHomepageLikes() {
    const cards =
      productCards();

    if (!cards.length) {
      return;
    }

    let changed =
      false;

    const currentGroups =
      new Map();

    cards.forEach((card) => {
      const button =
        $('[data-mm-action="like"]', card);

      const info =
        cardInfo(card);

      if (
        !button ||
        !info
      ) {
        return;
      }

      const signature =
        productSignature(info);

      if (!signature) {
        return;
      }

      const liked =
        readRealLikeState(button);

      const existing =
        currentGroups.get(
          signature
        );

      /*
        If duplicate cards exist,
        a liked one wins.
      */

      if (
        !existing ||
        liked
      ) {
        currentGroups.set(
          signature,
          {
            card,
            button,
            info,
            liked
          }
        );
      }
    });

    currentGroups.forEach(
      ({
        info,
        liked
      },
      signature) => {

        const id =
          String(info.id);

        /*
          Remove old duplicate records
          with the same product signature.
        */

        Array.from(favorites)
          .forEach((favoriteId) => {
            const item =
              items[String(favoriteId)];

            if (
              String(favoriteId) !== id &&
              item &&
              productSignature(item) ===
                signature
            ) {
              favorites.delete(
                String(favoriteId)
              );

              delete items[
                String(favoriteId)
              ];

              changed = true;
            }
          });

        if (liked) {
          const oldItem =
            items[id];

          if (!favorites.has(id)) {
            favorites.add(id);
            changed = true;
          }

          if (
            !oldItem ||
            oldItem.name !== info.name ||
            oldItem.price !== info.price ||
            oldItem.image !== info.image
          ) {
            items[id] =
              info;

            changed = true;
          }

        } else {
          if (favorites.has(id)) {
            favorites.delete(id);
            changed = true;
          }

          if (items[id]) {
            delete items[id];
            changed = true;
          }
        }
      }
    );

    /*
      Never keep a Favorite ID
      without an item record.
    */

    Array.from(favorites)
      .forEach((id) => {
        if (!items[String(id)]) {
          favorites.delete(
            String(id)
          );

          changed = true;
        }
      });

    if (changed) {
      saveSet();
      saveItems();
    }

    applyAllFavoriteVisuals();
    syncButton();

    if (
      panel &&
      panel.classList.contains('show')
    ) {
      renderPanel();
    }
  }

  /* =========================================================
     FAVORITES BUTTON
  ========================================================= */

  function getFavoriteButton() {
    return (
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open')
    );
  }

  function ensureButton() {
    let button =
      getFavoriteButton();

    if (!button) {
      button =
        document.createElement(
          'button'
        );

      button.type =
        'button';

      button.id =
        'mmFavoritesBtn';

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

      document.body.appendChild(
        button
      );
    }

    if (
      button.dataset.mmFavoritesButtonBound !== '1'
    ) {
      button.addEventListener(
        'click',
        handleFavoriteButtonClick,
        true
      );

      button.dataset.mmFavoritesButtonBound =
        '1';
    }

    syncButton();
    positionButton();
  }

  function positionButton() {
    const button =
      getFavoriteButton();

    const cart =
      $('#cartBtn');

    if (
      !button ||
      !cart
    ) {
      return;
    }

    const rect =
      cart.getBoundingClientRect();

    const width =
      button.offsetWidth ||
      46;

    button.style.position =
      'fixed';

    button.style.left =
      `${Math.round(
        rect.left +
        (rect.width - width) / 2
      )}px`;

    button.style.top =
      `${Math.round(
        rect.bottom + 12
      )}px`;

    button.style.margin =
      '0';

    button.style.zIndex =
      '1400';
  }

  function syncButton() {
    const button =
      getFavoriteButton();

    if (!button) {
      return;
    }

    const count =
      $(
        '#mmFavoritesCount',
        button
      ) ||
      $(
        '.mm-favorites-count',
        button
      ) ||
      $('#mmFavoritesCount');

    if (count) {
      count.textContent =
        String(
          favorites.size
        );
    }

    button.classList.toggle(
      'has-items',
      favorites.size > 0
    );

    button.setAttribute(
      'aria-label',
      isKy()
        ? `Тандалгандар: ${favorites.size}`
        : `Избранное: ${favorites.size}`
    );

    button.title =
      isKy()
        ? 'Тандалгандар'
        : 'Избранное';
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

  /* =========================================================
     LIKE → FAVORITES
  ========================================================= */

  function applyFavoriteVisual(
    button
  ) {
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
      favorites.has(
        String(id)
      );

    /*
      IMPORTANT:
      Do NOT touch .liked here.
      mm-engagement.js owns it.
    */

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
      active
        ? 'true'
        : 'false'
    );
  }

  function applyAllFavoriteVisuals() {
    $$(
      '[data-mm-action="like"]'
    ).forEach(
      applyFavoriteVisual
    );
  }

  function syncFavoriteFromRealLike(
    button
  ) {
    if (!button) {
      return;
    }

    const card =
      getCardFromLike(button);

    if (!card) {
      return;
    }

    const info =
      cardInfo(card);

    if (!info) {
      return;
    }

    const id =
      String(info.id);

    const liked =
      readRealLikeState(button);

    if (liked) {
      favorites.add(id);
      items[id] = info;

      /*
        Remove any older duplicate
        record for the same product.
      */

      const signature =
        productSignature(info);

      Array.from(favorites)
        .forEach((favoriteId) => {
          const item =
            items[String(favoriteId)];

          if (
            String(favoriteId) !== id &&
            item &&
            productSignature(item) ===
              signature
          ) {
            favorites.delete(
              String(favoriteId)
            );

            delete items[
              String(favoriteId)
            ];
          }
        });

    } else {
      favorites.delete(id);
      delete items[id];

      /*
        Remove old duplicate records
        for the same product.
      */

      const signature =
        productSignature(info);

      Array.from(favorites)
        .forEach((favoriteId) => {
          const item =
            items[String(favoriteId)];

          if (
            item &&
            productSignature(item) ===
              signature
          ) {
            favorites.delete(
              String(favoriteId)
            );

            delete items[
              String(favoriteId)
            ];
          }
        });
    }

    saveSet();
    saveItems();

    applyAllFavoriteVisuals();
    syncButton();

    if (
      panel &&
      panel.classList.contains('show')
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

    if (!button) {
      return;
    }

    /*
      mm-engagement.js owns the real Like.
      Do not preventDefault or stopPropagation.
    */

    setTimeout(() => {
      syncFavoriteFromRealLike(
        button
      );
    }, 0);

    setTimeout(() => {
      syncFavoriteFromRealLike(
        button
      );
    }, 80);
  }

  function bindHomepageLikeSync() {
    if (bound) {
      return;
    }

    bound = true;

    document.addEventListener(
      'click',
      handleHomepageLikeClick,
      true
    );
  }

  /* =========================================================
     REMOVE FAVORITE
  ========================================================= */

  function removeFavorite(id) {
    const target =
      String(id || '');

    if (!target) {
      return;
    }

    /*
      Find the real homepage Like button
      and toggle it OFF.
    */

    let foundButton =
      null;

    $$(
      '[data-mm-action="like"]'
    ).some(
      (button) => {
        const card =
          getCardFromLike(button);

        if (!card) {
          return false;
        }

        const cardId =
          getCardId(card);

        if (
          String(cardId) ===
          target
        ) {
          foundButton =
            button;

          return true;
        }

        return false;
      }
    );

    if (
      foundButton &&
      readRealLikeState(
        foundButton
      )
    ) {
      foundButton.click();
    }

    favorites.delete(
      target
    );

    delete items[
      target
    ];

    saveSet();
    saveItems();

    applyAllFavoriteVisuals();
    syncButton();
    renderPanel();
  }

    /* =========================================================
     PRODUCT VIEWER
  ========================================================= */

  function hookViewer() {
    const viewer =
      $('#mmProductViewer');

    if (
      !viewer ||
      viewerHooked
    ) {
      return;
    }

    viewerHooked =
      true;

    viewer.addEventListener(
      'click',
      (event) => {
        const button =
          event.target.closest(
            '[data-vaction="like"]'
          );

        if (!button) {
          return;
        }

        /*
          Product Viewer өзүнүн Like абалын
          өзгөртөт.

          Биз Favorites'ти ошол өзгөрүүдөн
          кийин гана синхрондойбуз.
        */

        setTimeout(() => {
          const card =
            viewer._card;

          if (!card) {
            return;
          }

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

          if (!card) {
            return;
          }

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
      },
      true
    );
  }

  /* =========================================================
     FAVORITES PANEL
  ========================================================= */

  function ensurePanel() {
    if (
      panel &&
      document.body.contains(panel)
    ) {
      return;
    }

    panel =
      document.createElement(
        'aside'
      );

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

        <div
          class="mm-favorites-head"
        >

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

    const backdrop =
      $(
        '.mm-favorites-backdrop',
        panel
      );

    const close =
      $(
        '.mm-favorites-close',
        panel
      );

    if (backdrop) {
      backdrop.addEventListener(
        'click',
        closePanel
      );
    }

    if (close) {
      close.addEventListener(
        'click',
        closePanel
      );
    }

    panel.addEventListener(
      'click',
      handlePanelClick
    );
  }

  function openPanel() {
    ensurePanel();

    renderPanel();

    panel.classList.add(
      'show'
    );

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

    panel.classList.remove(
      'show'
    );

    panel.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'mm-favorites-lock'
    );
  }

  function handlePanelClick(
    event
  ) {
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
          add.dataset.favAdd ||
          ''
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

    /*
      Show only Favorites that have
      a valid stored item.
    */

    const selected =
      Array.from(favorites)
        .map(
          (id) =>
            items[String(id)]
        )
        .filter(Boolean);

    if (!selected.length) {
      list.innerHTML = `
        <div
          class="mm-favorites-empty"
        >

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
                  src="${esc(item.image)}"
                  alt="${esc(item.name)}"
                  loading="lazy"
                  onerror="this.src='assets/products/placeholder.svg'"
                >
              </div>

              <div
                class="mm-fav-info"
              >

                <div
                  class="mm-fav-name"
                >
                  ${esc(item.name)}
                </div>

                ${
                  item.price
                    ? `
                      <strong
                        class="mm-fav-price"
                      >
                        ${esc(item.price)}
                      </strong>
                    `
                    : ''
                }

                <div
                  class="mm-fav-actions"
                >

                  <button
                    type="button"
                    data-fav-add="${esc(item.id)}"
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
                    data-fav-remove="${esc(item.id)}"
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

  /* =========================================================
     RENDER / RELOAD SYNC
  ========================================================= */

  function syncAfterRender() {
    setTimeout(() => {
      syncFavoritesFromHomepageLikes();
      hookViewer();
      positionButton();
    }, 0);

    setTimeout(() => {
      syncFavoritesFromHomepageLikes();
      hookViewer();
      positionButton();
    }, 120);
  }

  /* =========================================================
     INIT
  ========================================================= */

  function init() {
    ensurePanel();

    ensureButton();

    bindHomepageLikeSync();

    hookViewer();

    cleanupStoredDuplicates();

    syncFavoritesFromHomepageLikes();

    /*
      app.js should dispatch:
        mm:products-rendered

      after rendering #products.
    */

    document.addEventListener(
      'mm:products-rendered',
      syncAfterRender
    );

    window.addEventListener(
      'resize',
      positionButton,
      {
        passive: true
      }
    );

    setTimeout(() => {
      syncFavoritesFromHomepageLikes();
      hookViewer();
      positionButton();
    }, 250);
  }

  /* =========================================================
     START
  ========================================================= */

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
