/* МОЙ МАРКЕТ — SMART SEARCH v1.0 */

(() => {
  "use strict";

  const OVERLAY_ID = "mmSearchOverlay";
  const INPUT_ID = "mmSmartSearchInput";
  const RESULTS_ID = "mmSearchResults";
  const COUNT_ID = "mmSearchCount";
  const RECENT_KEY = "mmSearchRecentV1";

  const $ = (s, root = document) =>
    root.querySelector(s);

  const $$ = (s, root = document) =>
    Array.from(root.querySelectorAll(s));

  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch])
    );
  }

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getProducts() {
    try {
      return Array.isArray(products)
        ? products
        : [];
    } catch (_) {
      return [];
    }
  }

  function productName(p) {
    try {
      return nameOf(p);
    } catch (_) {
      return p?.nameRu || p?.name || "Товар";
    }
  }

  function productPrice(p) {
    try {
      return money(p.price);
    } catch (_) {
      return `${Number(p?.price) || 0} сом`;
    }
  }

  function productCategory(p) {
    try {
      return lang === "ru"
        ? (p.categoryNameRu || p.categoryName || "")
        : (p.categoryName || p.categoryNameRu || "");
    } catch (_) {
      return p?.categoryNameRu || p?.categoryName || "";
    }
  }

  function productSearchText(p) {
    return normalize([
      p?.name,
      p?.nameRu,
      p?.description,
      p?.descriptionRu,
      p?.categoryName,
      p?.categoryNameRu,
      p?.subcategoryName,
      p?.subcategoryNameRu,
      p?.id
    ].join(" "));
  }

  function searchProducts(query) {
    const q = normalize(query);
    const list = getProducts();

    if (!q) {
      return [];
    }

    const words = q
      .split(" ")
      .filter(word => word.length >= 2);

    return list
      .map(p => {
        const name = normalize([
          p?.name,
          p?.nameRu
        ].join(" "));

        const text = productSearchText(p);

        let score = 0;

        if (name === q) {
          score += 100;
        }

        if (name.includes(q)) {
          score += 60;
        }

        words.forEach(word => {
          if (name.includes(word)) {
            score += 20;
          } else if (text.includes(word)) {
            score += 7;
          }
        });

        return {
          product: p,
          score
        };
      })
      .filter(x => x.score > 0)
      .sort((a, b) =>
        b.score - a.score
      )
      .slice(0, 12)
      .map(x => x.product);
  }

  function loadRecent() {
    try {
      const data = JSON.parse(
        localStorage.getItem(RECENT_KEY) || "[]"
      );

      return Array.isArray(data)
        ? data
        : [];
    } catch (_) {
      return [];
    }
  }

  function saveRecent(query) {
    const q = String(query || "").trim();

    if (!q) return;

    const old = loadRecent();

    const list = [
      q,
      ...old.filter(
        x => normalize(x) !== normalize(q)
      )
    ].slice(0, 8);

    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(list)
    );

    renderRecent();
  }

  function renderRecent() {
    const section =
      $("#mmSearchRecentSection");

    const box =
      $("#mmSearchRecent");

    if (!section || !box) return;

    const recent = loadRecent();

    section.hidden =
      recent.length === 0;

    box.innerHTML =
      recent.map(item => `
        <button
          type="button"
          data-search-recent="${escapeHtml(item)}"
        >
          ${escapeHtml(item)}
        </button>
      `).join("");
  }

  function openSearch() {
    const overlay =
      $(`#${OVERLAY_ID}`);

    const input =
      $(`#${INPUT_ID}`);

    if (!overlay) return;

    overlay.classList.add("open");
    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow = "hidden";

    renderRecent();

    if (input) {
      input.focus();
      renderResults(input.value.trim());
    }
  }

  function closeSearch() {
    const overlay =
      $(`#${OVERLAY_ID}`);

    if (!overlay) return;

    overlay.classList.remove("open");
    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";
  }

  function renderResults(query) {
    const box =
      $(`#${RESULTS_ID}`);

    const count =
      $(`#${COUNT_ID}`);

    if (!box) return;

    const list =
      searchProducts(query);

    if (!query) {
      if (count) count.textContent = "";

      box.innerHTML = `
        <div class="mm-search-empty">
          <strong>🔎 Начните поиск</strong>
          <span>
            Введите название товара
            или выберите популярный запрос.
          </span>
        </div>
      `;

      return;
    }

    if (count) {
      count.textContent =
        `${list.length} найдено`;
    }

    if (!list.length) {
      box.innerHTML = `
        <div class="mm-search-empty">
          <strong>😕 Ничего не найдено</strong>
          <span>
            Попробуйте другое название товара.
          </span>
        </div>
      `;

      return;
    }

    box.innerHTML = list.map(p => `
      <article
        class="mm-search-result-card"
        data-product-id="${escapeHtml(p.id)}"
      >

        <div class="mm-search-result-photo">

          <img
            src="${escapeHtml(
              p.image ||
              "assets/products/placeholder.svg"
            )}"
            alt="${escapeHtml(
              productName(p)
            )}"
            loading="lazy"
            onerror="
              this.onerror=null;
              this.src='assets/products/placeholder.svg'
            "
          >

        </div>

        <div class="mm-search-result-body">

          <div class="mm-search-result-name">
            ${escapeHtml(
              productName(p)
            )}
          </div>

          <div class="mm-search-result-category">
            ${escapeHtml(
              productCategory(p)
            )}
          </div>

          <div class="mm-search-result-price">
            ${escapeHtml(
              productPrice(p)
            )}
          </div>

          <button
            class="mm-search-result-add"
            type="button"
            data-search-add="${escapeHtml(p.id)}"
          >
            🛒 В корзину
          </button>

        </div>

      </article>
    `).join("");
  }

  function bindHeaderSearch() {

    const button =
      $("#searchBtn");

    if (button) {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();
          event.stopPropagation();
          openSearch();
        },
        true
      );
    }

    const mobile =
      $("#mobileSearch");

    if (mobile) {
      mobile.addEventListener(
        "click",
        event => {
          event.preventDefault();
          event.stopPropagation();
          openSearch();
        },
        true
      );
    }
  }

  function bindInput() {

    const input =
      $(`#${INPUT_ID}`);

    if (!input) return;

    input.addEventListener(
      "input",
      () => {
        renderResults(
          input.value.trim()
        );
      }
    );

    input.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          const q =
            input.value.trim();

          if (q) {
            saveRecent(q);
            renderResults(q);
          }
        }

        if (event.key === "Escape") {
          closeSearch();
        }
      }
    );
  }

  function bindClear() {

    const button =
      $("#mmSearchClear");

    if (!button) return;

    button.addEventListener(
      "click",
      () => {

        const input =
          $(`#${INPUT_ID}`);

        if (!input) return;

        input.value = "";
        renderResults("");
        input.focus();
      }
    );
  }

  function bindClose() {

    const button =
      $("#mmSearchClose");

    if (button) {
      button.addEventListener(
        "click",
        closeSearch
      );
    }

    const overlay =
      $(`#${OVERLAY_ID}`);

    if (overlay) {
      overlay.addEventListener(
        "click",
        event => {

          if (
            event.target === overlay
          ) {
            closeSearch();
          }

        }
      );
    }
  }

  function bindPopular() {

    $$(".mm-search-chip")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const q =
              button.dataset.search || "";

            const input =
              $(`#${INPUT_ID}`);

            if (input) {
              input.value = q;
              input.focus();
            }

            saveRecent(q);
            renderResults(q);
          }
        );

      });
  }

  function bindRecent() {

    const box =
      $("#mmSearchRecent");

    if (!box) return;

    box.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-search-recent]"
          );

        if (!button) return;

        const q =
          button.dataset.searchRecent || "";

        const input =
          $(`#${INPUT_ID}`);

        if (input) {
          input.value = q;
          input.focus();
        }

        renderResults(q);
      }
    );
  }

  function bindResults() {

    const box =
      $(`#${RESULTS_ID}`);

    if (!box) return;

    box.addEventListener(
      "click",
      event => {

        const add =
          event.target.closest(
            "[data-search-add]"
          );

        if (add) {

          event.preventDefault();
          event.stopPropagation();

          const id =
            add.dataset.searchAdd;

          try {
            addToCart(id);

            add.textContent =
              "✓ Кошулду";

            setTimeout(() => {
              add.textContent =
                lang === "ru"
                  ? "🛒 В корзину"
                  : "🛒 Себетке кошуу";
            }, 1100);

          } catch (_) {}

          return;
        }

        const card =
          event.target.closest(
            ".mm-search-result-card"
          );

        if (!card) return;

        const id =
          card.dataset.productId;

        try {
          openProductPreview(id);
          closeSearch();
        } catch (_) {}
      }
    );
  }

  function bindEscape() {

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {
          closeSearch();
        }

      }
    );
  }

  function boot() {

    const overlay =
      $(`#${OVERLAY_ID}`);

    if (!overlay) return;

    bindHeaderSearch();
    bindInput();
    bindClear();
    bindClose();
    bindPopular();
    bindRecent();
    bindResults();
    bindEscape();

    renderRecent();
    renderResults("");
  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true }
    );

  } else {

    boot();

  }

})();
