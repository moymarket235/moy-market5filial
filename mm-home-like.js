/* МОЙ МАРКЕТ — HOME LIKE FINAL V23
   REAL FIX for the homepage product Like icon.

   WHY:
   mm-engagement.js creates the home Like as:
   <span class="mm-social-icon mm-heart">♡</span>
   and mm-favorites.js also updates that span's text.
   Older CSS/V22 fixer rules could leave a broken pseudo/SVG mixture.

   THIS FILE:
   - only targets #products (homepage product cards)
   - hides all old pseudo heart drawings
   - draws ONE inline SVG heart
   - keeps 20x20 in both states
   - redraws after Like click
   - does not touch #mmProductViewer
   - does not change Like counters or favorite storage
*/

(() => {
  'use strict';

  const HEART_PATH =
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z';

  const STYLE_ID =
    'mm-home-like-final-v23-style';

  const SELECTOR =
    '#products .mm-card-actions .mm-social-btn[data-mm-action="like"]';

  function allLikes() {
    return Array.from(
      document.querySelectorAll(SELECTOR)
    );
  }

  function isLiked(button) {
    return (
      button.classList.contains('liked') ||
      button.classList.contains('is-liked') ||
      button.classList.contains('mm-favorite-active')
    );
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style =
      document.createElement('style');

    style.id = STYLE_ID;

    style.textContent = `
      ${SELECTOR} {
        width: 30px !important;
        height: 30px !important;
        min-width: 30px !important;
        min-height: 30px !important;
        max-width: 30px !important;
        max-height: 30px !important;
        flex: 0 0 30px !important;

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        margin: 0 !important;
        padding: 0 !important;

        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      ${SELECTOR} .mm-heart {
        position: relative !important;

        width: 20px !important;
        height: 20px !important;

        min-width: 20px !important;
        min-height: 20px !important;
        max-width: 20px !important;
        max-height: 20px !important;

        flex: 0 0 20px !important;

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        margin: 0 !important;
        padding: 0 !important;

        box-sizing: border-box !important;

        font-size: 0 !important;
        line-height: 0 !important;

        color: transparent !important;

        background: transparent !important;
        background-image: none !important;

        border: 0 !important;
        box-shadow: none !important;

        overflow: visible !important;
        transform: none !important;

        opacity: 1 !important;
        visibility: visible !important;
      }

      ${SELECTOR} .mm-heart::before,
      ${SELECTOR} .mm-heart::after {
        content: none !important;
        display: none !important;
      }

      ${SELECTOR} .mm-home-like-final-svg {
        width: 20px !important;
        height: 20px !important;

        min-width: 20px !important;
        min-height: 20px !important;
        max-width: 20px !important;
        max-height: 20px !important;

        flex: 0 0 20px !important;

        display: block !important;

        margin: 0 !important;
        padding: 0 !important;

        overflow: visible !important;
      }

      ${SELECTOR} .mm-home-like-final-path {
        fill: none;
        stroke: #f4f6f8;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      ${SELECTOR}.liked
      .mm-home-like-final-path,
      ${SELECTOR}.is-liked
      .mm-home-like-final-path,
      ${SELECTOR}.mm-favorite-active
      .mm-home-like-final-path {
        fill: #ff4d55 !important;
        stroke: #ff4d55 !important;
        stroke-width: 1.7 !important;
      }
    `;

    document.head.appendChild(style);
  }

  function render(button) {
    if (!button) return;

    const heart =
      button.querySelector('.mm-heart');

    if (!heart) return;

    const liked =
      isLiked(button);

    /*
      Keep the icon DOM completely under our control.
      This removes Unicode and any SVG/background left
      by older fix scripts.
    */
    heart.replaceChildren();

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
    heart.style.transform = 'none';
    heart.style.opacity = '1';
    heart.style.visibility = 'visible';

    const svg =
      document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );

    svg.classList.add(
      'mm-home-like-final-svg'
    );

    svg.setAttribute(
      'viewBox',
      '0 0 24 24'
    );

    svg.setAttribute(
      'width',
      '20'
    );

    svg.setAttribute(
      'height',
      '20'
    );

    svg.setAttribute(
      'aria-hidden',
      'true'
    );

    svg.setAttribute(
      'focusable',
      'false'
    );

    svg.style.width = '20px';
    svg.style.height = '20px';
    svg.style.display = 'block';
    svg.style.flex = '0 0 20px';
    svg.style.overflow = 'visible';

    const path =
      document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );

    path.classList.add(
      'mm-home-like-final-path'
    );

    path.setAttribute(
      'd',
      HEART_PATH
    );

    path.setAttribute(
      'fill',
      liked ? '#ff4d55' : 'none'
    );

    path.setAttribute(
      'stroke',
      liked ? '#ff4d55' : '#f4f6f8'
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

    svg.appendChild(path);
    heart.appendChild(svg);
  }

  function renderAll() {
    ensureStyle();
    allLikes().forEach(render);
  }

  function afterClick(button) {
    /*
      Engagement and Favorites listeners are registered
      before this fixer. Wait until both have finished,
      then redraw the final state.
    */
    requestAnimationFrame(() => {
      render(button);

      requestAnimationFrame(() => {
        render(button);
      });
    });

    setTimeout(() => {
      render(button);
    }, 80);
  }

  function bind() {
    document.addEventListener(
      'click',
      (event) => {
        const button =
          event.target.closest(
            SELECTOR
          );

        if (!button) return;

        afterClick(button);
      },
      true
    );
  }

  function init() {
    ensureStyle();
    renderAll();
    bind();

    /*
      Products are rendered dynamically by app.js,
      so a light periodic resync is safer here than
      adding another heavy MutationObserver.
    */
    setInterval(
      renderAll,
      700
    );
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
