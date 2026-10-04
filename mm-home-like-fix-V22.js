/* MOY MARKET — HOME LIKE ICON STABILIZER V22
   Only fixes the Like icon on product cards in #products.
   Does not touch the product detail/viewer.
   Does not change like/favorites counters or storage.
*/

(() => {
  'use strict';

  const HEART_PATH =
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z";

  const $all = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  function isLiked(button) {
    return (
      button.classList.contains('liked') ||
      button.classList.contains('is-liked') ||
      button.classList.contains('mm-favorite-active')
    );
  }

  function fixHeart(button) {
    if (!button) return;

    const heart = button.querySelector('.mm-heart');
    if (!heart) return;

    const liked = isLiked(button);

    /* Remove the old Unicode heart and any background-image tricks. */
    heart.textContent = '';
    heart.style.width = '20px';
    heart.style.height = '20px';
    heart.style.minWidth = '20px';
    heart.style.minHeight = '20px';
    heart.style.maxWidth = '20px';
    heart.style.maxHeight = '20px';
    heart.style.flex = '0 0 20px';
    heart.style.display = 'inline-flex';
    heart.style.alignItems = 'center';
    heart.style.justifyContent = 'center';
    heart.style.margin = '0';
    heart.style.padding = '0';
    heart.style.boxSizing = 'border-box';
    heart.style.fontSize = '0';
    heart.style.lineHeight = '0';
    heart.style.color = 'transparent';
    heart.style.background = 'transparent';
    heart.style.backgroundImage = 'none';
    heart.style.border = '0';
    heart.style.boxShadow = 'none';
    heart.style.overflow = 'visible';
    heart.style.opacity = '1';
    heart.style.visibility = 'visible';

    let svg = heart.querySelector('.mm-home-like-svg');

    if (!svg) {
      svg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );

      svg.classList.add('mm-home-like-svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );

      path.classList.add('mm-home-like-path');
      path.setAttribute('d', HEART_PATH);

      svg.appendChild(path);
      heart.appendChild(svg);
    }

    svg.style.width = '20px';
    svg.style.height = '20px';
    svg.style.minWidth = '20px';
    svg.style.minHeight = '20px';
    svg.style.maxWidth = '20px';
    svg.style.maxHeight = '20px';
    svg.style.display = 'block';
    svg.style.flex = '0 0 20px';
    svg.style.overflow = 'visible';

    const path = svg.querySelector('.mm-home-like-path');
    if (!path) return;

    path.setAttribute(
      'fill',
      liked ? '#ff4d55' : 'none'
    );

    path.setAttribute(
      'stroke',
      liked ? '#ff4d55' : '#f6f7f8'
    );

    path.setAttribute(
      'stroke-width',
      liked ? '1.7' : '1.9'
    );

    path.setAttribute(
      'stroke-linecap',
      'round'
    );

    path.setAttribute(
      'stroke-linejoin',
      'round'
    );

    path.style.vectorEffect =
      'non-scaling-stroke';
  }

  function syncAll() {
    $all(
      '#products .mm-social-btn[data-mm-action="like"]'
    ).forEach(fixHeart);
  }

  function hookClicks() {
    document.addEventListener(
      'click',
      (event) => {
        const button =
          event.target.closest(
            '#products .mm-social-btn[data-mm-action="like"]'
          );

        if (!button) return;

        /* Let engagement/favorites finish first, then redraw. */
        setTimeout(() => {
          fixHeart(button);
        }, 0);

        setTimeout(() => {
          fixHeart(button);
        }, 80);
      },
      true
    );
  }

  function init() {
    syncAll();
    hookClicks();

    /* Product cards are re-rendered dynamically. */
    setInterval(syncAll, 350);
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
