/* MOY MARKET — PRODUCT VIEWER ICONS v1
   Converts the large product viewer's action row to the same clean
   Instagram-style SVG icons used on product cards.
*/
(() => {
  'use strict';

  const SVG = {
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

  function qs(s, root = document) {
    return root.querySelector(s);
  }

  function qsa(s, root = document) {
    return Array.from(root.querySelectorAll(s));
  }

  function getBarState(card) {
    const bar = card ? qs('.mm-card-actions', card) : null;
    const get = (sel) => bar?.querySelector(sel)?.textContent?.trim() || '0';
    return {
      like: get('[data-mm-action="like"] b'),
      comment: get('[data-mm-action="comment"] b'),
      share: get('[data-mm-action="share"] b'),
      view: get('[data-mm-view] b'),
      liked: !!bar?.querySelector('[data-mm-action="like"].liked')
    };
  }

  function replaceViewerActions(viewer) {
    const actions = qs('.mm-viewer-actions', viewer);
    if (!actions) return;

    // Preserve whether the cart control was already present.
    const cart = qs('.mm-viewer-cart', actions);

    // Read current viewer counts before replacing.
    const oldButtons = qsa('button', actions);
    const vals = {
      like: oldButtons.find(b => b.dataset.vaction === 'like')?.querySelector('b')?.textContent?.trim() || '0',
      comment: oldButtons.find(b => b.dataset.vaction === 'comment')?.querySelector('b')?.textContent?.trim() || '0',
      share: oldButtons.find(b => b.dataset.vaction === 'share')?.querySelector('b')?.textContent?.trim() || '0',
      view: '0'
    };

    const row = document.createDocumentFragment();

    const make = (action, icon, label, count, extra = '') => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `mm-viewer-social ${extra}`.trim();
      b.dataset.vaction = action;
      b.setAttribute('aria-label', label);
      b.innerHTML = `
        <span class="mm-viewer-social-icon ${action === 'like' ? 'mm-viewer-heart' : ''}">${icon}</span>
        <b>${count}</b>
      `;
      return b;
    };

    row.appendChild(make('like', SVG.heart, 'Лайк', vals.like));
    row.appendChild(make('comment', SVG.comment, 'Комментарий', vals.comment));
    row.appendChild(make('share', SVG.share, 'Поделиться', vals.share));
    row.appendChild(make('view', SVG.eye, 'Көрүүлөр', vals.view));

    actions.replaceChildren(row);
    if (cart) actions.appendChild(cart);

    actions.dataset.mmViewerHotfix = '1';
  }

  function syncViewer(viewer) {
    if (!viewer?.classList.contains('show')) return;

    const card = viewer._card;
    if (!card) return;

    const state = getBarState(card);

    const setCount = (action, value) => {
      const el = qs(`[data-vaction="${action}"] b`, viewer);
      if (el && el.textContent !== value) el.textContent = value;
    };

    setCount('like', state.like);
    setCount('comment', state.comment);
    setCount('share', state.share);
    setCount('view', state.view);

    const like = qs('[data-vaction="like"]', viewer);
    if (like) like.classList.toggle('liked', state.liked);
  }

  function upgrade() {
    const viewer = qs('#mmProductViewer');
    if (!viewer) return;

    if (!qs('.mm-viewer-actions[data-mm-viewer-hotfix="1"]', viewer)) {
      replaceViewerActions(viewer);
      const actions = qs('.mm-viewer-actions', viewer);
      if (actions) actions.dataset.mmViewerHotfix = '1';
    }

    syncViewer(viewer);
  }

  function boot() {
    upgrade();

    const bodyObserver = new MutationObserver(() => {
      const viewer = qs('#mmProductViewer');
      if (viewer) {
        upgrade();
      }
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // After the viewer opens, sync again after the original engagement
    // script has updated the card counters.
    setInterval(() => {
      const viewer = qs('#mmProductViewer');
      if (viewer?.classList.contains('show')) syncViewer(viewer);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
