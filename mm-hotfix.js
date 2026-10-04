/* MOY MARKET — FINAL FUNCTIONAL FIX v2
   - keeps the existing engagement logic
   - replaces Unicode symbols with clean inline SVG icons
   - fixes the duplicate/broken account modal
   - survives product re-rendering
*/
(() => {
  'use strict';

  const ICON_VERSION = '2';
  const ACCOUNT_MODAL_ID = 'mmAccountModal';

  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[ch]));

  const icons = {
    heart: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.84 8.7c0 5.2-8.84 10.1-8.84 10.1S3.16 13.9 3.16 8.7A4.7 4.7 0 0 1 12 6.12 4.7 4.7 0 0 1 20.84 8.7Z"/>
      </svg>`,

    comment: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 11.2c0 4.4-3.8 7.8-8.6 7.8a9.7 9.7 0 0 1-3.8-.75L4 19.9l.8-3.35A7.35 7.35 0 0 1 3 11.2c0-4.35 3.8-7.8 8.6-7.8s8.6 3.45 8.6 7.8Z"/>
      </svg>`,

    share: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 3 10.5 13.5"/>
        <path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z"/>
      </svg>`,

    eye: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.2 12s3.45-6 9.8-6 9.8 6 9.8 6-3.45 6-9.8 6-9.8-6-9.8-6Z"/>
        <circle cx="12" cy="12" r="2.8"/>
      </svg>`
  };

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function ensureBrokenAccountIsGone() {
    const modal = document.getElementById(ACCOUNT_MODAL_ID);
    if (!modal) return;

    // The correct account module creates #mmAccountBody.
    // The old engagement account creates a duplicate modal without it.
    if (!modal.querySelector('#mmAccountBody')) {
      modal.remove();
      document.body.classList.remove('mm-account-open');
    }
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.className = 'mm-card-actions';
    bar.dataset.mmHotfixIcons = ICON_VERSION;
    bar.innerHTML = `
      <button class="mm-social-btn"
              type="button"
              data-mm-action="like"
              aria-label="Лайк">
        <span class="mm-social-icon mm-heart">${icons.heart}</span>
        <b>0</b>
      </button>

      <button class="mm-social-btn"
              type="button"
              data-mm-action="comment"
              aria-label="Комментарий">
        <span class="mm-social-icon mm-comment-icon">${icons.comment}</span>
        <b>0</b>
      </button>

      <button class="mm-social-btn"
              type="button"
              data-mm-action="share"
              aria-label="Поделиться">
        <span class="mm-social-icon mm-share-icon">${icons.share}</span>
        <b>0</b>
      </button>

      <span class="mm-social-view"
            data-mm-view="1"
            aria-label="Көрүүлөр">
        <span class="mm-social-icon mm-eye-icon">${icons.eye}</span>
        <b>0</b>
      </span>
    `;
    return bar;
  }

  function upgradeBar(bar) {
    if (!bar) return;

    // Already upgraded.
    if (bar.dataset.mmHotfixIcons === ICON_VERSION) return;

    const like = bar.querySelector('[data-mm-action="like"]');
    const comment = bar.querySelector('[data-mm-action="comment"]');
    const share = bar.querySelector('[data-mm-action="share"]');
    const view = bar.querySelector('[data-mm-view]');

    const oldLikeCount = like?.querySelector('b')?.textContent ?? '0';
    const oldCommentCount = comment?.querySelector('b')?.textContent ?? '0';
    const oldShareCount = share?.querySelector('b')?.textContent ?? '0';
    const oldViewCount = view?.querySelector('b')?.textContent ?? '0';
    const liked = like?.classList.contains('liked') || false;

    bar.innerHTML = `
      <button class="mm-social-btn${liked ? ' liked' : ''}"
              type="button"
              data-mm-action="like"
              aria-label="Лайк">
        <span class="mm-social-icon mm-heart">${icons.heart}</span>
        <b>${esc(oldLikeCount)}</b>
      </button>

      <button class="mm-social-btn"
              type="button"
              data-mm-action="comment"
              aria-label="Комментарий">
        <span class="mm-social-icon mm-comment-icon">${icons.comment}</span>
        <b>${esc(oldCommentCount)}</b>
      </button>

      <button class="mm-social-btn"
              type="button"
              data-mm-action="share"
              aria-label="Поделиться">
        <span class="mm-social-icon mm-share-icon">${icons.share}</span>
        <b>${esc(oldShareCount)}</b>
      </button>

      <span class="mm-social-view"
            data-mm-view="1"
            aria-label="Көрүүлөр">
        <span class="mm-social-icon mm-eye-icon">${icons.eye}</span>
        <b>${esc(oldViewCount)}</b>
      </span>
    `;

    bar.dataset.mmHotfixIcons = ICON_VERSION;
  }

  function processProducts() {
    const cards = qsa(
      '#products .product, #products .product-card, #products [data-product-card]'
    );

    cards.forEach(card => {
      let bar = qs('.mm-card-actions', card);

      // Fallback: if engagement script failed to add its bar, create it here.
      if (!bar) {
        bar = buildBar();
        card.appendChild(bar);
      }

      upgradeBar(bar);
    });
  }

  function boot() {
    ensureBrokenAccountIsGone();
    processProducts();

    const products = qs('#products');
    if (products) {
      const observer = new MutationObserver(() => {
        ensureBrokenAccountIsGone();
        processProducts();
      });

      observer.observe(products, {
        childList: true,
        subtree: true
      });
    }

    // Account modal may be created after this script starts.
    // Watch the document so a duplicate old modal is removed immediately.
    const accountObserver = new MutationObserver(() => {
      ensureBrokenAccountIsGone();
    });

    accountObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // One extra pass after all synchronous scripts finish.
    setTimeout(() => {
      ensureBrokenAccountIsGone();
      processProducts();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
