/* MOY MARKET — Favorites / Избранное — FINAL V14
   Favorites button: directly under the header cart.
   Icon: hexagon + heart.
   Uses existing product like buttons as favorite triggers.
   Safe initialization, localStorage, no MutationObserver loops.
*/

(() => {
  'use strict';

  const KEY = 'mmFavoritesV1';

  let favorites = loadFavorites();
  let panel = null;
  let button = null;
  let countEl = null;
  let listEl = null;

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.map(String) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(Array.from(favorites))
      );
    } catch (_) {}
  }

  function getLanguage() {
    const lang =
      localStorage.getItem('moyLang') ||
      localStorage.getItem('lang') ||
      document.documentElement.lang ||
      'ru';

    return String(lang)
      .toLowerCase()
      .startsWith('ky')
      ? 'ky'
      : 'ru';
  }

  function t(ru, ky) {
    return getLanguage() === 'ky' ? ky : ru;
  }

  function currentProducts() {
    if (Array.isArray(window.products)) {
      return window.products;
    }

    if (Array.isArray(window.PRODUCTS)) {
      return window.PRODUCTS;
    }

    if (Array.isArray(window.productList)) {
      return window.productList;
    }

    return [];
  }

  function productId(product) {
    if (!product) return '';

    return String(
      product.id ??
      product.productId ??
      product.slug ??
      product.code ??
      product.sku ??
      ''
    );
  }

  function productName(product) {
    if (!product) return '';

    if (getLanguage() === 'ky') {
      return String(
        product.nameKg ??
        product.nameKG ??
        product.titleKg ??
        product.titleKG ??
        product.name_ky ??
        product.title_ky ??
        product.name ??
        product.title ??
        ''
      );
    }

    return String(
      product.nameRu ??
      product.nameRU ??
      product.titleRu ??
      product.titleRU ??
      product.name_ru ??
      product.title_ru ??
      product.name ??
      product.title ??
      ''
    );
  }

  function productImage(product) {
    if (!product) return '';

    const value =
      product.image ??
      product.img ??
      product.photo ??
      product.imageUrl ??
      product.imageURL ??
      (
        Array.isArray(product.images)
          ? product.images[0]
          : ''
      );

    return String(value || '');
  }

  function productPrice(product) {
    if (!product) return '';

    const value =
      product.price ??
      product.salePrice ??
      product.currentPrice ??
      product.cost ??
      '';

    if (value === '' || value == null) {
      return '';
    }

    const number = Number(
      String(value)
        .replace(/[^\d.,-]/g, '')
        .replace(',', '.')
    );

    if (!Number.isFinite(number)) {
      return String(value);
    }

    return `${number.toLocaleString('ru-RU')} сом`;
  }

  function findCartButton() {
    return (
      document.getElementById('cartBtn') ||
      $('[data-cart-button]') ||
      $('.cart-mini') ||
      $('button[aria-label*="Корзина"]') ||
      $('button[aria-label*="корзина"]')
    );
  }

  function ensureButton() {
    if (
      button &&
      document.body.contains(button)
    ) {
      syncButton();
      positionButton();
      return;
    }

    button = document.createElement('button');

    button.type = 'button';
    button.className = 'mm-favorites-open';

    button.setAttribute(
      'aria-label',
      t(
        'Избранное',
        'Тандалангандар'
      )
    );

    button.title =
      t(
        'Избранное',
        'Тандалангандар'
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
        >

          <path
            class="hex-shape"
            d="M24 3.5 41.5 13.75v20.5L24 44.5 6.5 34.25v-20.5L24 3.5Z">
          </path>

          <path
            class="hex-heart"
            d="M24 33.2s-10.1-6.15-10.1-12.7c0-3.4 2.35-5.75 5.35-5.75 2.08 0 3.8 1.17 4.75 2.83.95-1.66 2.67-2.83 4.75-2.83 3 0 5.35 2.35 5.35 5.75C34.1 27.05 24 33.2 24 33.2Z">
          </path>

        </svg>
      </span>

      <span class="mm-favorites-label">
        ${t(
          'Избранное',
          'Тандалангандар'
        )}
      </span>

      <b class="mm-favorites-count">
        0
      </b>
    `;

    button.addEventListener(
      'click',
      openFavorites
    );

    document.body.appendChild(button);

    countEl =
      $('.mm-favorites-count', button);

    syncButton();
    positionButton();
  }

  function positionButton() {
    if (
      !button ||
      !document.body.contains(button)
    ) {
      return;
    }

    const cart =
      findCartButton();

    if (!cart) {
      button.style.left = '14px';
      button.style.top = '92px';
      return;
    }

    const rect =
      cart.getBoundingClientRect();

    const gap = 8;

    const width =
      button.offsetWidth || 52;

    const height =
      button.offsetHeight || 52;

    let left =
      rect.left +
      (rect.width - width) / 2;

    let top =
      rect.bottom + gap;

    const maxLeft =
      window.innerWidth -
      width -
      8;

    left =
      Math.max(
        8,
        Math.min(
          left,
          maxLeft
        )
      );

    if (
      top + height >
      window.innerHeight - 8
    ) {
      top =
        Math.max(
          8,
          rect.top -
          height -
          gap
        );
    }

    button.style.left =
      `${Math.round(left)}px`;

    button.style.top =
      `${Math.round(top)}px`;
  }

  function syncButton() {
    if (
      !countEl ||
      !button
    ) {
      return;
    }

    countEl.textContent =
      String(favorites.size);

    button.classList.toggle(
      'has-items',
      favorites.size > 0
    );

    button.setAttribute(
      'aria-label',
      `${t(
        'Избранное',
        'Тандалангандар'
      )}: ${favorites.size}`
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
        aria-label="${t(
          'Избранное',
          'Тандалангандар'
        )}"
      >

        <div class="mm-favorites-head">

          <div>

            <h2 class="mm-favorites-title">
              ${t(
                'Избранное',
                'Тандалангандар'
              )}
            </h2>

            <small class="mm-favorites-subtitle">
              ${t(
                'Ваши любимые товары',
                'Сиз тандаган товарлар'
              )}
            </small>

          </div>

          <button
            type="button"
            class="mm-favorites-close"
            aria-label="${t(
              'Закрыть',
              'Жабуу'
            )}"
          >
            ×
          </button>

        </div>

        <div class="mm-favorites-list"></div>

      </div>
    `;

    document.body.appendChild(panel);

    listEl =
      $('.mm-favorites-list', panel);

    $(
      '.mm-favorites-backdrop',
      panel
    ).addEventListener(
      'click',
      closeFavorites
    );

    $(
      '.mm-favorites-close',
      panel
    ).addEventListener(
      'click',
      closeFavorites
    );

    panel.addEventListener(
      'click',
      (event) => {

        const remove =
          event.target.closest(
            '[data-fav-remove]'
          );

        if (remove) {

          event.preventDefault();

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

          const id =
            String(
              add.dataset.favAdd || ''
            );

          const product =
            currentProducts().find(
              (item) =>
                productId(item) === id
            );

          if (
            product &&
            typeof window.addToCart ===
              'function'
          ) {
            window.addToCart(product);
          }
        }

      }
    );
  }

  function openFavorites() {

    ensurePanel();

    renderFavorites();

    panel.classList.add('show');

    panel.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'mm-favorites-lock'
    );
  }

  function closeFavorites() {

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

  function renderFavorites() {

    if (!listEl) {
      return;
    }

    const products =
      currentProducts().filter(
        (item) =>
          favorites.has(
            productId(item)
          )
      );

    if (!products.length) {

      listEl.innerHTML = `
        <div class="mm-favorites-empty">

          <div class="mm-favorites-empty-icon">
            ♡
          </div>

          <strong>
            ${t(
              'Пока нет избранных товаров',
              'Азырынча тандалган товар жок'
            )}
          </strong>

          <span>
            ${t(
              'Нажмите ❤️ на товаре, чтобы добавить его сюда.',
              'Товардагы ❤️ белгисин басып, бул жерге кошуңуз.'
            )}
          </span>

        </div>
      `;

      return;
    }

    listEl.innerHTML =
      products
        .map(
          (product) => {

            const id =
              productId(product);

            const name =
              productName(product) ||
              t(
                'Товар',
                'Товар'
              );

            const image =
              productImage(product);

            const price =
              productPrice(product);

            return `
              <article
                class="mm-favorite-item"
              >

                <div
                  class="mm-favorite-item-image"
                >
                  ${
                    image
                      ? `
                        <img
                          src="${escapeHtml(image)}"
                          alt="${escapeHtml(name)}"
                          loading="lazy"
                        >
                      `
                      : ''
                  }
                </div>

                <div
                  class="mm-favorite-item-info"
                >

                  <strong>
                    ${escapeHtml(name)}
                  </strong>

                  ${
                    price
                      ? `
                        <b>
                          ${escapeHtml(price)}
                        </b>
                      `
                      : ''
                  }

                  <div
                    class="mm-favorite-item-actions"
                  >

                    <button
                      type="button"
                      data-fav-add="${escapeHtml(id)}"
                    >
                      ${t(
                        'В корзину',
                        'Себетке'
                      )}
                    </button>

                    <button
                      type="button"
                      data-fav-remove="${escapeHtml(id)}"
                      aria-label="${t(
                        'Удалить',
                        'Өчүрүү'
                      )}"
                    >
                      ♡
