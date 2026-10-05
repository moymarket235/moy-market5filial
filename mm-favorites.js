/* МОЙ МАРКЕТ — LIKE + FAVORITES PROFESSIONAL V26
   FIXED FAVORITES DUPLICATES

   FIXES:
   - Prevents duplicate favorites after refresh
   - Cleans old duplicate favorite records
   - Uses stable product identity
   - Does NOT toggle Like itself
   - Reads real .liked state from mm-engagement.js
   - Keeps Favorites in localStorage
   - Keeps cart position unchanged
   - Supports homepage Like
   - Supports Product Viewer Like
   - Supports RU / KG
*/

(() => {
  'use strict';

  const FAVORITES_KEY = 'mmFavoritesV15';
  const ITEMS_KEY = 'mmFavoritesItemsV15';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  let favorites = new Set();
  let items = {};
  let panel = null;
  let viewerHooked = false;
  let initialized = false;

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
      const raw =
        localStorage.getItem(FAVORITES_KEY);

      const data =
        raw ? JSON.parse(raw) : [];

      if (!Array.isArray(data)) {
        return new Set();
      }

      return new Set(
        data
          .map(String)
          .filter(Boolean)
      );
    } catch (_) {
      return new Set();
    }
  }

  function saveSet() {
    try {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(
          Array.from(favorites)
        )
      );
    } catch (_) {}
  }

  function loadItems() {
    try {
      const raw =
        localStorage.getItem(ITEMS_KEY);

      const data =
        raw ? JSON.parse(raw) : {};

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

  function cards() {
    return $$('#products .product, #products .product-card, #products [data-product-card]');
  }

  function getCardFromLike(button) {
    if (!button) {
      return null;
    }

    return button.closest(
      '#products .product, #products .product-card, #products [data-product-card]'
    );
  }

  function getCardName(card) {
    if (!card) {
      return 'Товар';
    }

    const element =
      $(
        'h3, .pname, .product-name, .product-title, [data-product-name]',
        card
      );

    return cleanText(
      element?.textContent || 'Товар'
    );
  }

  function getCardPrice(card) {
    if (!card) {
      return '';
    }

    const element =
      $(
        '.price, .product-price, [data-price]',
        card
      );

    if (element) {
      return cleanText(
        element.textContent
      );
    }

    const fallback =
      $('b, strong', card);

    return cleanText(
      fallback?.textContent || ''
    );
  }

  function getCardImage(card) {
    if (!card) {
      return 'assets/products/placeholder.svg';
    }

    const image =
      $('img', card);

    return (
      image?.currentSrc ||
      image?.src ||
      'assets/products/placeholder.svg'
    );
  }

  /*
    IMPORTANT:
    We do NOT use image URL alone as the product ID.

    Old version used:
      name + image

    This could create another ID after refresh
    if the image URL changed.

    New version:
      real product ID if available
      otherwise stable name + price
  */

  function getStableProductId(card) {
    if (!card) {
      return '';
    }

    const realId =
      card.dataset.productId ||
      card.dataset.product ||
      card.dataset.pid ||
      card.dataset.id;

    if (realId) {
      const id =
        String(realId).trim();

      card.dataset.mmFavoriteId = id;

      return id;
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

  function getCardId(card) {
    if (!card) {
      return '';
    }

    if (card.dataset.mmFavoriteId) {
      return String(
        card.dataset.mmFavoriteId
      );
    }

    return getStableProductId(card);
  }

  function cardInfo(card) {
    return {
      id: getCardId(card),

      name: getCardName(card),

      price: getCardPrice(card),

      image: getCardImage(card),

      updatedAt: Date.now()
    };
  }

  function saveCard(card) {
    const info =
      cardInfo(card);

    if (!info.id) {
      return null;
    }

    items[info.id] = {
      id: info.id,
      name: info.name,
      price: info.price,
      image: info.image,
      updatedAt: Date.now()
    };

    saveItems();

    return info;
  }

  /* =========================================================
     DUPLICATE CLEANER
  ========================================================= */

  function itemSignature(item) {
    if (!item) {
      return '';
    }

    const name =
      normalizeText(
        item.name || item.title || ''
      );

    const price =
      normalizeText(
        item.price || ''
      );

    return `${name}|${price}`;
  }

  function migrateDuplicates() {
    try {
      const oldItems =
        items &&
        typeof items === 'object'
          ? items
          : {};

      const oldFavorites =
        Array.from(favorites);

      const signatureToId =
        new Map();

      const idMap =
        new Map();

      const newItems = {};

      /*
        First create one canonical ID
        for every identical product.
      */

      Object.keys(oldItems)
        .forEach((oldId) => {
          const item =
            oldItems[oldId];

          if (
            !item ||
            typeof item !== 'object'
          ) {
            return;
          }

          const signature =
            itemSignature(item);

          if (!signature) {
            return;
          }

          let canonicalId =
            signatureToId.get(
              signature
            );

          if (!canonicalId) {
            canonicalId =
              `mmfav_${hash(signature)}`;

            signatureToId.set(
              signature,
              canonicalId
            );
          }

          idMap.set(
            String(oldId),
            canonicalId
          );

          /*
            Keep only one copy.
            Prefer the newest item.
          */

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
                  item.price || ''
                ),
              image:
                item.image ||
                'assets/products/placeholder.svg',
              updatedAt:
                Number(
                  item.updatedAt || 0
                )
            };
          }
        });

      /*
        Rebuild Favorites from canonical IDs.
        This is the important part that changes:

          old ID 1
          old ID 2

        for the same product into:

          one canonical ID
      */

      const newFavorites =
        new Set();

      oldFavorites.forEach(
        (oldId) => {
          const key =
            String(oldId);

          const mapped =
            idMap.get(key);

          if (mapped) {
            newFavorites.add(
              mapped
            );
            return;
          }

          /*
            If an old favorite has no
            corresponding item, keep it
            temporarily only if it exists
            as a real product later.
          */
          if (
            oldItems[key] &&
            typeof oldItems[key] ===
              'object'
          ) {
            const signature =
              itemSignature(
                oldItems[key]
              );

            if (signature) {
              newFavorites.add(
                `mmfav_${hash(signature)}`
              );
            }
          }
        }
      );

      items = newItems;
      favorites = newFavorites;

      saveItems();
      saveSet();

    } catch (_) {
      /*
        Never break the whole website
        because Favorites migration failed.
      */
    }
  }

  /* =========================================================
     FAVORITES BUTTON
  ========================================================= */

  function ensureButton() {
    let button =
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open');

    if (!button) {
      button =
        document.createElement(
          'button'
        );

      button.type = 'button';

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

    /*
      IMPORTANT:
      Do not add the same click listener
      every 700ms.
    */

    if (
      button.dataset.mmFavoritesBound !== '1'
    ) {
      button.addEventListener(
        'click',
        onFavoriteButtonClick
      );

      button.dataset.mmFavoritesBound =
        '1';
    }

    syncButton();
    positionButton();
  }

  function ensureExistingButton() {
    return (
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open')
    );
  }

  function positionButton() {
    const button =
      ensureExistingButton();

    const cart =
      $('#cartBtn');

    if (!button || !cart) {
      return;
    }

    const rect =
      cart.getBoundingClientRect();

    const width =
      button.offsetWidth || 46;

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
      ensureExistingButton();

    if (!button) {
      return;
    }

    const count =
      $('#mmFavoritesCount') ||
      $('.mm-favorites-count', button);

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

    const label =
      lang() === 'ky'
        ? `Тандалгандар: ${favorites.size}`
        : `Избранное: ${favorites.size}`;

    button.setAttribute(
      'aria-label',
      label
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
      active
        ? 'true'
        : 'false'
    );
  }

  function applyAllFavoriteVisuals() {
    $$('#products [data-mm-action="like"]')
      .forEach(
        applyFavoriteVisual
      );
  }

  function readRealLikeState(
    button
  ) {
    /*
      mm-engagement.js owns .liked.
      Favorites NEVER changes .liked directly.
    */

    return button.classList.contains(
      'liked'
    );
  }

  function syncFavoriteFromRealLike(
    button
  ) {
    const card =
      getCardFromLike(button);

    if (!card) {
      return;
    }

    const info =
      saveCard(card);

        if (!info) {
      return;
    }

    const liked =
      readRealLikeState(button);

    if (liked) {
      removeDuplicateFavoritesFor(info);

      favorites.add(
        String(info.id)
      );

      items[String(info.id)] =
        info;
    } else {
      favorites.delete(
        String(info.id)
      );

      const identity =
        productIdentity(info);

      Array.from(
        favorites
      ).forEach((id) => {
        const item =
          items[String(id)];

        if (
          item &&
          productIdentity(item) ===
            identity
        ) {
          favorites.delete(
            String(id)
          );

          delete items[
            String(id)
          ];
        }
      });
    }

    cleanupDuplicateFavorites();

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

    setTimeout(() => {
      syncFavoriteFromRealLike(button);
    }, 0);

    setTimeout(() => {
      syncFavoriteFromRealLike(button);
    }, 80);
  }

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

        if (!button) {
          return;
        }

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
      }
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

    const backdrop =
      panel.querySelector(
        '.mm-favorites-backdrop'
      );

    const close =
      panel.querySelector(
        '.mm-favorites-close'
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

  function removeFavorite(id) {
    const target =
      String(id);

    favorites.delete(
      target
    );

    saveSet();
    saveItems();

    applyAllFavoriteVisuals();
    syncButton();
    renderPanel();
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

      const item =
        items[
          String(
            add.dataset.favAdd
          )
        ];

      addFavoriteToCart(
        item
      );
    }
  }

  function addFavoriteToCart(
    item
  ) {
    if (!item) {
      return;
    }

    const card =
      cards().find(
        (candidate) =>
          getCardId(candidate) ===
          String(item.id)
      );

    if (card) {
      const add =
        card.querySelector(
          '.cart-add, .add-to-cart, [data-add-cart], .buy'
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
    if (!panel) {
      return;
    }

    const list =
      panel.querySelector(
        '.mm-favorites-list'
      );

    if (!list) {
      return;
    }

    const selected =
      Array.from(
        favorites
      )
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
      {
        passive: true
      }
    );

    window.addEventListener(
      'scroll',
      positionButton,
      {
        passive: true
      }
    );

    setInterval(() => {
      if (
        !ensureExistingButton()
      ) {
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
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
