/* MOY MARKET — SAFE FUNCTIONAL HOTFIX */
(() => {
  'use strict';

  function removeBrokenAccountModal() {
    const modal = document.getElementById('mmAccountModal');

    /*
      mm-engagement.js эски/дубль аккаунт модалын түзүп койсо,
      аны өчүрөбүз.
      Туура аккаунтту mm-account.js кайра өзү түзөт.
    */
    if (modal && !modal.querySelector('#mmAccountBody')) {
      modal.remove();
      document.body.classList.remove('mm-account-open');
    }
  }

  /*
    mm-engagement.js Escape басылганда closeAccount() чакырат.
    Ошол ката чыкпаш үчүн коопсуз функция.
  */
  window.closeAccount = function () {
    const modal = document.getElementById('mmAccountModal');
    if (modal) modal.classList.remove('show');
    document.body.classList.remove('mm-account-open');
  };

  function addProductIcons() {
    const cards = document.querySelectorAll(
      '#products .product, #products .product-card, #products [data-product-card]'
    );

    cards.forEach(card => {
      if (card.querySelector('.mm-card-actions')) return;

      const bar = document.createElement('div');
      bar.className = 'mm-card-actions';

      bar.innerHTML = `
        <button
          class="mm-social-btn"
          type="button"
          data-mm-action="like"
          aria-label="Лайк">
          <span class="mm-social-icon mm-heart">♡</span>
          <b>0</b>
        </button>

        <button
          class="mm-social-btn"
          type="button"
          data-mm-action="comment"
          aria-label="Комментарий">
          <span class="mm-social-icon mm-comment-icon"></span>
          <b>0</b>
        </button>

        <button
          class="mm-social-btn"
          type="button"
          data-mm-action="share"
          aria-label="Бөлүшүү">
          <span class="mm-social-icon mm-share-icon">➤</span>
          <b>0</b>
        </button>

        <span
          class="mm-social-view"
          data-mm-view="1"
          aria-label="Көрүүлөр">
          <span class="mm-social-icon mm-eye-icon">◉</span>
          <b>0</b>
        </span>
      `;

      card.appendChild(bar);
    });
  }

  function boot() {
    removeBrokenAccountModal();
    addProductIcons();

    const root = document.querySelector('#products');

    if (root) {
      const observer = new MutationObserver(() => {
        removeBrokenAccountModal();
        addProductIcons();
      });

      observer.observe(root, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
