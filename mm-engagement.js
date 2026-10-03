/* MOY MARKET — engagement layer v1.1
   Works with the existing 4.0 storefront (app.js/products.json).
   This layer is local-only until a real shared backend is connected.
*/
(() => {
  'use strict';

  const STATE_KEY = 'mmEngagementV11';
  const VISITOR_KEY = 'mmVisitor24hV11';
  const DAY = 86400000;

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {products:{}}; }
    catch (_) { return {products:{}}; }
  };
  const save = s => localStorage.setItem(STATE_KEY, JSON.stringify(s));
  const state = load();

  function hashId(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'p' + (h >>> 0).toString(16);
  }

  function cardTitle(card) {
    const el = card.querySelector('h3,.pname,.product-name,.product-title,[data-product-name]');
    return (el?.textContent || card.textContent || 'Товар').replace(/\s+/g,' ').trim().slice(0,160);
  }

  function cardPrice(card) {
    const el = card.querySelector('.price,.product-price,[data-price],b,strong');
    return (el?.textContent || '').replace(/\s+/g,' ').trim();
  }

  function getId(card) {
    if (!card.dataset.mmId) card.dataset.mmId = hashId(cardTitle(card));
    return card.dataset.mmId;
  }

  function ensureProduct(id) {
    if (!state.products[id]) state.products[id] = {views:0,likes:0,liked:false,shares:0,comments:[]};
    return state.products[id];
  }

  function visitor24h() {
    const now = Date.now();
    let v;
    try { v = JSON.parse(localStorage.getItem(VISITOR_KEY)); } catch (_) {}
    if (!v || now - v.windowStart >= DAY) {
      v = {windowStart: now, count: 1, counted: true};
      localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
    }
    return v;
  }

  function injectStats() {
    if (document.getElementById('mmEngagementStats')) return;
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    const box = document.createElement('div');
    box.id = 'mmEngagementStats';
    box.className = 'mm-eng-stats';
    box.innerHTML = `
      <div class="mm-stat-main">👥 <b id="mmVisitorCount">1</b> <span>24 саат</span></div>
      <div class="mm-stat-note">❤️ Лайк · 💬 Комментарий · 🔗 Бөлүшүү · 👁️ Көрүү</div>
    `;
    topbar.insertAdjacentElement('afterend', box);
    refreshVisitor();
  }

  function refreshVisitor() {
    const el = document.getElementById('mmVisitorCount');
    if (el) el.textContent = Math.max(1, Number(visitor24h().count || 1));
  }

  function ensureCommentModal() {
    if (document.getElementById('mmCommentModal')) return;
    const wrap = document.createElement('div');
    wrap.id = 'mmCommentModal';
    wrap.className = 'modal';
    wrap.innerHTML = `
      <div class="modal-box mm-comment-box">
        <button id="mmCommentClose" aria-label="Close">×</button>
        <div id="mmCommentBody"></div>
      </div>`;
    document.body.appendChild(wrap);
    document.getElementById('mmCommentClose').onclick = () => wrap.classList.remove('show');
    wrap.addEventListener('click', e => { if (e.target === wrap) wrap.classList.remove('show'); });
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function openComments(card) {
    ensureCommentModal();
    const id = getId(card);
    const s = ensureProduct(id);
    const title = escapeHtml(cardTitle(card));
    const modal = document.getElementById('mmCommentModal');
    const body = document.getElementById('mmCommentBody');

    body.innerHTML = `
      <div class="mm-comments-head">
        <span class="eyebrow">💬 Комментарийлер</span>
        <h2>${title}</h2>
      </div>
      <div class="mm-comment-list">
        ${s.comments.length ? s.comments.map(c =>
          `<div class="mm-comment"><b>${escapeHtml(c.name || 'Кардар')}</b><span>${escapeHtml(c.text)}</span><small>${new Date(c.at).toLocaleString()}</small></div>`
        ).join('') : '<div class="mm-empty-comment">Азырынча комментарий жок.</div>'}
      </div>
      <form id="mmCommentForm" class="mm-comment-form">
        <input id="mmCommentInput" maxlength="300" required placeholder="Комментарий жазыңыз...">
        <button class="primary" type="submit">Жөнөтүү</button>
      </form>`;

    modal.classList.add('show');
    document.getElementById('mmCommentForm').onsubmit = e => {
      e.preventDefault();
      const input = document.getElementById('mmCommentInput');
      const text = input.value.trim();
      if (!text) return;
      s.comments.push({text, name:'Кардар', at:Date.now()});
      save(state);
      openComments(card);
    };
  }

  function trackView(card) {
    const id = getId(card);
    const key = 'mmViewed24h_' + id;
    const seen = Number(sessionStorage.getItem(key) || 0);
    if (seen && Date.now() - seen < DAY) return;
    const s = ensureProduct(id);
    s.views++;
    sessionStorage.setItem(key, String(Date.now()));
    save(state);
  }

  function decorateCard(card) {
    if (!card || card.dataset.mmEngaged === '1') return;
    card.dataset.mmEngaged = '1';
    const id = getId(card);
    const s = ensureProduct(id);

    const bar = document.createElement('div');
    bar.className = 'mm-eng-actions';
    bar.innerHTML = `
      <button type="button" class="mm-eng-btn mm-like">❤️ <b>${s.likes}</b></button>
      <button type="button" class="mm-eng-btn mm-comment">💬 <b>${s.comments.length}</b></button>
      <button type="button" class="mm-eng-btn mm-share">🔗 <b>${s.shares}</b></button>
      <span class="mm-views">👁️ <b>${s.views}</b></span>`;
    card.appendChild(bar);

    const like = bar.querySelector('.mm-like');
    if (s.liked) like.classList.add('is-on');

    like.onclick = e => {
      e.preventDefault(); e.stopPropagation();
      s.liked = !s.liked;
      s.likes = Math.max(0, s.likes + (s.liked ? 1 : -1));
      save(state);
      like.classList.toggle('is-on', s.liked);
      like.querySelector('b').textContent = s.likes;
    };

    bar.querySelector('.mm-comment').onclick = e => {
      e.preventDefault(); e.stopPropagation();
      openComments(card);
    };

    bar.querySelector('.mm-share').onclick = async e => {
      e.preventDefault(); e.stopPropagation();
      const url = new URL(location.href);
      url.hash = 'product-' + id;
      const title = cardTitle(card);
      try {
        if (navigator.share) {
          await navigator.share({title, text: `${title} ${cardPrice(card)}`, url:url.href});
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url.href);
          if (window.toast) window.toast('🔗 Шилтеме көчүрүлдү');
        }
        s.shares++;
        save(state);
        e.currentTarget.querySelector('b').textContent = s.shares;
      } catch (_) {}
    };

    trackView(card);
    bar.querySelector('.mm-views b').textContent = ensureProduct(id).views;
  }

  function decorateAll() {
    document.querySelectorAll('#products .product').forEach(decorateCard);
    refreshVisitor();
  }

  function start() {
    injectStats();
    decorateAll();

    const target = document.getElementById('products');
    if (target) {
      new MutationObserver(() => requestAnimationFrame(decorateAll))
        .observe(target, {childList:true, subtree:true});
    }
    setInterval(refreshVisitor, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();
