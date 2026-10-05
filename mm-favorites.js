/* МОЙ МАРКЕТ — LIKE + FAVORITES PROFESSIONAL V25
   FIXED FAVORITES DUPLICATE SYSTEM

   FIXES:
   - Prevents duplicate Favorites after page refresh
   - Prevents the same product from being stored under different IDs
   - Cleans old duplicate Favorites automatically
   - Keeps the real Like state owned by mm-engagement.js
   - Supports homepage Like
   - Supports Product Viewer Like
   - Keeps Favorites synchronized with localStorage
   - Keeps Cart position unchanged
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

  let favorites = loadSet();
  let items = loadItems();
  let panel = null;
  let viewerHooked = false;

  /* =========================================================
     STORAGE
  ========================================================= */

  function loadSet() {
    try {
      const raw =
        localStorage.getItem(FAVORITES_KEY);

      const data =
        raw ? JSON.parse(raw) : [];

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

      return data &&
        typeof data === 'object'
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

  /* =========================================================
     LANGUAGE
  ========================================================= */

  function lang() {
    try {
      return (
        localStorage.getItem('moyLang') ||
        document.documentElement.lang ||
        'ru'
      )
        .toLowerCase()
        .startsWith('ky')
        ? 'ky'
        : 'ru';
    } catch (_) {
      return 'ru';
    }
  }

  /* =========================================================
     ESCAPE HTML
  ========================================================= */

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* =========================================================
     PRODUCT CARDS
  ========================================================= */

  function cards() {
    return $$(
      '#products .product, ' +
      '#products .product-card, ' +
      '#products [data-product-card]'
    );
  }

  function getCardFromLike(button) {
    return button?.closest(
      '#products .product, ' +
      '#products .product-card, ' +
      '#products [data-product-card]'
    ) || null;
  }

  /* =========================================================
     NORMALIZATION
  ========================================================= */

  function normalizeText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function normalizeImage(src) {
    return String(src || '')
      .split('?')[0]
      .split('#')[0]
      .trim()
      .toLowerCase();
  }

  /* =========================================================
     PRODUCT ID
  ========================================================= */

  function getCardId(card) {
    if (!card) {
      return '';
    }

    const direct =
      card.dataset.productId ||
      card.dataset.id ||
      card.dataset.product ||
      card.dataset.pid ||
      card.dataset.mmId ||
      card.dataset.mmFavoriteId;

    if (direct) {
      const id =
        String(direct).trim();

      card.dataset.mmFavoriteId = id;

      return id;
    }

    /*
      Fallback ID.
      Used only when the product card has no real ID.
    */

    const name =
      (
        $(
          'h3, .pname, .product-name, ' +
          '.product-title, [data-product-name]',
          card
        )?.textContent || 'Товар'
      )
        .replace(/\s+/g, ' ')
        .trim();

    const image =
      $('img', card)?.currentSrc ||
      $('img', card)?.src ||
      '';

    const source =
      normalizeText(name) +
      '|' +
      normalizeImage(image);

    let hash = 2166136261;

    for (
      let i = 0;
      i < source.length;
      i += 1
    ) {
      hash ^= source.charCodeAt(i);

      hash =
        Math.imul(
          hash,
          16777619
        );
    }

    const id =
      `mm_${(hash >>> 0).toString(36)}`;

    card.dataset.mmFavoriteId = id;

    return id;
  }

  /* =========================================================
     CARD INFO
  ========================================================= */

  function cardInfo(card) {
    if (!card) {
      return null;
    }

    const name =
      (
        $(
          'h3, .pname, .product-name, ' +
          '.product-title, [data-product-name]',
          card
        )?.textContent || 'Товар'
      )
        .replace(/\s+/g, ' ')
        .trim();

    const price =
      (
        $(
          '.price, .product-price, [data-price]',
          card
        )?.textContent || ''
      )
        .replace(/\s+/g, ' ')
        .trim();

    const image =
      $('img', card)?.currentSrc ||
      $('img', card)?.src ||
      'assets/products/placeholder.svg';

    return {
      id: getCardId(card),
      name,
      price,
      image,
      updatedAt: Date.now()
    };
  }

  /* =========================================================
     PRODUCT IDENTITY
     
     IMPORTANT:
     The same product may sometimes receive a different
     technical ID after the catalog is rendered again.

     Therefore Favorites use a stable product identity:
     NAME + PRICE + IMAGE
  ========================================================= */

  function productIdentity(info) {
    if (!info) {
      return '';
    }

    const name =
      normalizeText(info.name);

    const price =
      normalizeText(info.price);

    const image =
      normalizeImage(info.image);

    return [
      name,
      price,
      image
    ].join('|');
  }

  /* =========================================================
     FIND EXISTING PRODUCT
  ========================================================= */

  function findExistingItemByIdentity(info) {
    const identity =
      productIdentity(info);

    if (!identity) {
      return null;
    }

    for (
      const id of Object.keys(items)
    ) {
      const existing =
        items[id];

      if (
        productIdentity(existing) ===
        identity
      ) {
        return {
          id: String(id),
          item: existing
        };
      }
    }

    return null;
  }

  /* =========================================================
     SAVE CARD — DUPLICATE SAFE
  ========================================================= */

  function saveCard(card) {
    const info =
      cardInfo(card);

    if (
      !info ||
      !info.id
    ) {
      return null;
    }

    const currentId =
      String(info.id);

    const existing =
      findExistingItemByIdentity(info);

    /*
      If this exact product already exists under another ID,
      use the existing ID instead of creating another Favorite.
    */

    if (
      existing &&
      existing.id !== currentId
    ) {
      info.id =
        existing.id;

      card.dataset.mmFavoriteId =
        existing.id;

      /*
        Remove the newly-created duplicate ID
        if it exists.
      */

      if (
        items[currentId] &&
        currentId !== existing.id
      ) {
        delete items[currentId];
      }
    }

    items[info.id] = {
      ...items[info.id],
      ...info
    };

    saveItems();

    return items[info.id];
  }

  /* =========================================================
     CLEAN DUPLICATES
     
     Runs on startup and removes:
     - duplicate IDs
     - orphan IDs
     - products stored twice
  ========================================================= */

  function cleanupDuplicateFavorites() {
    const seen =
      new Map();

    const newFavorites =
      new Set();

    const duplicateIds =
      new Set();

    Array.from(favorites)
      .forEach((rawId) => {
        const id =
          String(rawId);

        const item =
          items[id];

        /*
          Favorite points to an item that no longer exists.
        */

        if (!item) {
          return;
        }

        const identity =
          productIdentity(item);

        /*
          If identity is empty, keep by ID.
        */

        if (!identity) {
          newFavorites.add(id);
          return;
        }

        /*
          Duplicate product found.
        */

        if (
          seen.has(identity)
        ) {
          duplicateIds.add(id);
          return;
        }

        seen.set(
          identity,
          id
        );

        newFavorites.add(id);
      });

    /*
      Remove duplicate item records.
    */

    duplicateIds.forEach(
      (id) => {
        delete items[id];
      }
    );

    favorites =
      newFavorites;

    saveSet();
    saveItems();
  }

  /* =========================================================
     REMOVE DUPLICATES FOR ONE PRODUCT
     
     Used immediately after Like.
     This prevents:
       Like -> 1
       Refresh -> 2
  ========================================================= */

  function removeDuplicateFavoritesFor(info) {
    if (!info) {
      return;
    }

    const identity =
      productIdentity(info);

    if (!identity) {
      return;
    }

    const keepId =
      String(info.id);

    const idsToRemove =
      [];

    favorites.forEach(
      (id) => {
        const stringId =
          String(id);

        if (
          stringId === keepId
        ) {
          return;
        }

        const item =
          items[stringId];

        if (!item) {
          idsToRemove.push(
            stringId
          );
          return;
        }

        if (
          productIdentity(item) ===
          identity
        ) {
          idsToRemove.push(
            stringId
          );
        }
      }
    );

    idsToRemove.forEach(
      (id) => {
        favorites.delete(id);
        delete items[id];
      }
    );
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

    /*
      Prevent adding the same click listener
      every time ensureButton() runs.
    */

    if (
      button.dataset.mmFavoritesBound !==
      '1'
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

  /* =========================================================
     POSITION FAVORITES BUTTON
  ========================================================= */

  function positionButton() {
    const button =
      ensureExistingButton();

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

  function ensureExistingButton() {
    return (
      $('#mmFavoritesBtn') ||
      $('.mm-favorites-open')
    );
  }

  /* =========================================================
     SYNC BUTTON
  ========================================================= */

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

  /* =========================================================
     FAVORITE VISUAL STATE
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

  /* =========================================================
     REAL LIKE STATE
     
     mm-engagement.js owns `.liked`.
  ========================================================= */

  function readRealLikeState(
    button
  ) {
    return button.classList.contains(
      'liked'
    );
  }

  /* =========================================================
     SYNC LIKE -> FAVORITES
  ========================================================= */

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

    /*
      LIKE ON
    */

    if (liked) {
      /*
        First remove old duplicate IDs
        representing the same product.
      */

      removeDuplicateFavoritesFor(
        info
      );

      /*
        Add only the canonical ID.
      */

      favorites.add(
        String(info.id)
      );

      /*
        Make sure the item exists.
      */

      items[String(info.id)] =
        info;
    }

    /*
      LIKE OFF
    */

    else {
      /*
        Remove the current ID.
      */

      favorites.delete(
        String(info.id)
      );

      /*
        Also remove any old IDs that
        represent the same product.
      */

      const identity =
        productIdentity(info);

      Array.from(
        favorites
      ).forEach(
        (id) => {
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
        }
      );
    }

    /*
      Final cleanup.
    */

    cleanupDuplicateFavorites();

    saveSet();
    saveItems();

    applyAllFavoriteVisuals();
    syncButton();

    if (
      panel?.classList.contains(
        'show'
      )
    ) {
      renderPanel();
    }
  }

  /* =========================================================
     HOMEPAGE LIKE CLICK
  ========================================================= */

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
      mm-engagement.js changes `.liked`.
      We wait until it finishes.
    */

    setTimeout(
      () => {
        syncFavoriteFromRealLike(
          button
        );
      },
      0
    );

    setTimeout(
      () => {
        syncFavoriteFromRealLike(
          button
        );
      },
      80
    );
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

        setTimeout(
          () => {
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
          },
          0
        );

        setTimeout(
          () => {
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
          },
          100
        );
      }
    );
  }

  /* =========================================================
     PANEL
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
        
