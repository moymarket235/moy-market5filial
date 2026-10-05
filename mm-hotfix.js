/* МОЙ МАРКЕТ — PRODUCT ICONS FINAL FIX v5.0
   ❤️ Лайк
   💬 Комментарий
   ↗️ Поделиться
   👁️ Көрүүлөр

   Бул файл товар карточкасынын алдындагы
   иконкаларды гана кайтарат.

   Like логикасын mm-engagement.js башкарат.
*/

(() => {
  "use strict";

  const ICON_VERSION = "5.0";
  const ACCOUNT_MODAL_ID = "mmAccountModal";
  const ENGAGEMENT_KEY = "mmEngagementV20";

  const qs = (selector, root = document) =>
    root.querySelector(selector);

  const qsa = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[ch])
    );
  }

  function hash(s) {
    let h = 2166136261;

    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return (h >>> 0).toString(36);
  }

  function cards() {
    return qsa(
      "#products .product, #products .product-card, #products [data-product-card]"
    );
  }

  function title(card) {
    return (
      qs(
        "h3,.pname,.product-name,.product-title,[data-product-name]",
        card
      )?.textContent ||
      "Товар"
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  function image(card) {
    const img = qs("img", card);

    return (
      img?.currentSrc ||
      img?.src ||
      "assets/products/placeholder.svg"
    );
  }

  function engagementId(card) {
    return hash(
      title(card) +
      "|" +
      image(card)
    );
  }

  function loadEngagement() {
    try {
      const raw =
        localStorage.getItem(
          ENGAGEMENT_KEY
        );

      const data = raw
        ? JSON.parse(raw)
        : { products: {} };

      if (
        !data.products ||
        typeof data.products !== "object"
      ) {
        data.products = {};
      }

      return data;
    } catch (_) {
      return { products: {} };
    }
  }

  const icons = {

    heart: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M20.84 4.61
             a5.5 5.5 0 0 0-7.78 0
             L12 5.67
             10.94 4.61
             a5.5 5.5 0 0 0-7.78 7.78
             L12 21.23
             l8.84-8.84
             a5.5 5.5 0 0 0 0-7.78Z"
        />
      </svg>
    `,

    comment: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M20.2 11.2
             c0 4.4-3.8 7.8-8.6 7.8
             a9.7 9.7 0 0 1-3.8-.75
             L4 19.9
             l.8-3.35
             A7.35 7.35 0 0 1 3 11.2
             c0-4.35 3.8-7.8 8.6-7.8
             s8.6 3.45 8.6 7.8Z"
        />
      </svg>
    `,

    share: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M21 3 10.5 13.5" />
        <path
          d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z"
        />
      </svg>
    `,

    eye: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M2.2 12
             s3.45-6 9.8-6
             9.8 6 9.8 6
             -3.45 6-9.8 6
             -9.8-6-9.8-6Z"
        />
        <circle
          cx="12"
          cy="12"
          r="2.8"
        />
      </svg>
    `
  };

  function buildBar(card) {

    const engagement =
      loadEngagement();

    const id =
      engagementId(card);

    const p =
      engagement.products[id] || {
        views: 0,
        likes: 0,
        liked: false,
        shares: 0,
        comments: []
      };

    const bar =
      document.createElement("div");

    bar.className =
      "mm-card-actions";

    bar.dataset.mmHotfixIcons =
      ICON_VERSION;

    bar.innerHTML = `
      <button
        class="mm-social-btn${p.liked ? " liked" : ""}"
        type="button"
        data-mm-action="like"
        aria-label="Лайк"
        aria-pressed="${p.liked ? "true" : "false"}"
      >
        <span class="mm-social-icon mm-heart">
          ${icons.heart}
        </span>
        <b>${Number(p.likes) || 0}</b>
      </button>

      <button
        class="mm-social-btn"
        type="button"
        data-mm-action="comment"
        aria-label="Комментарий"
      >
        <span class="mm-social-icon mm-comment-icon">
          ${icons.comment}
        </span>
        <b>${
          Array.isArray(p.comments)
            ? p.comments.length
            : 0
        }</b>
      </button>

      <button
        class="mm-social-btn"
        type="button"
        data-mm-action="share"
        aria-label="Поделиться"
      >
        <span class="mm-social-icon mm-share-icon">
          ${icons.share}
        </span>
        <b>${Number(p.shares) || 0}</b>
      </button>

      <span
        class="mm-social-view"
        data-mm-view="1"
        aria-label="Көрүүлөр"
      >
        <span class="mm-social-icon mm-eye-icon">
          ${icons.eye}
        </span>
        <b>${Number(p.views) || 0}</b>
      </span>
    `;

    return bar;
  }

  function fixCards() {

    cards().forEach(card => {

      let bar =
        qs(
          ".mm-card-actions",
          card
        );

      if (!bar) {
        bar = buildBar(card);
        card.appendChild(bar);
      }

      bar.dataset.mmHotfixIcons =
        ICON_VERSION;
    });
  }

  function ensureBrokenAccountIsGone() {

    const modal =
      document.getElementById(
        ACCOUNT_MODAL_ID
      );

    if (!modal) return;

    if (
      !modal.querySelector(
        "#mmAccountBody"
      )
    ) {
      modal.remove();

      document.body.classList.remove(
        "mm-account-open"
      );
    }
  }

  function boot() {

    ensureBrokenAccountIsGone();
    fixCards();

    if (
      document.documentElement.dataset
        .mmIconsFixTimer !== "1"
    ) {

      document.documentElement.dataset
        .mmIconsFixTimer = "1";

      setInterval(() => {
        ensureBrokenAccountIsGone();
        fixCards();
      }, 900);
    }
  }

  if (
    document.readyState ===
    "loading"
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
