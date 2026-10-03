/* MOY MARKET — engagement layer v1
   Safe add-on: does not replace products.js or script.js.
   Shared/server statistics are intentionally not faked; this v1 uses localStorage
   until a real backend (Firebase/Supabase) is connected.
*/
(() => {
  'use strict';

  const KEY = 'mmEngagementV1';
  const VISITOR_KEY = 'mmVisitor24hV1';
  const DAY = 86400000;

  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {products:{}}; }
    catch (_) { return {products:{}}; }
  };
  const save = s => localStorage.setItem(KEY, JSON.stringify(s));
  const state = load();

  const pidOf = el => String(el?.dataset?.productId || '');
  const productById = id => (typeof P !== 'undefined' ? P : []).find(p => String(p.id) === String(id));
  const productName = p => {
    if (!p) return 'Товар';
    const ru = localStorage.getItem('mmLang') === 'ru';
    return ru ? (p.ru || p.ky || 'Товар') : (p.ky || p.ru || 'Товар');
  };

  function ensureProduct(id) {
    if (!state.products[id]) state.products[id] = {views:0, likes:0, liked:false, shares:0, comments:[]};
    return state.products[id];
  }

  function ensureVisitor24h() {
    const now = Date.now();
    let v;
    try { v = JSON.parse(localStorage.getItem(VISITOR_KEY)); } catch (_) {}
    if (!v || now - v.firstSeen >= DAY) {
      v = {firstSeen: now, count: 1};
      localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
    } else if (!v.countedThisSession) {
      v.count = Math.max(1, Number(v.count || 1));
      v.countedThisSession = true;
      localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
    }
    return v;
  }

  function injectStats() {
    if (document.getElementById('mmEngagementStats')) return;
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const box = document.createElement('div');
    box.id = 'mmEngagementStats';
    box.className = 'mm-eng-stats';
    box.innerHTML = `
      <div class="mm-stat-main">👥 <b id="mmVisitorCount">1</b> <span>24 саат</span></div>
      <div class="mm-stat-note">❤️ Лайк · 💬 Комментарий · 🔗 Бөлүшүү · 👁️ Көрүү</div>
    `;
    nav.insertAdjacentElement('afterend', box);
    refreshVisitor();
  }

  function refreshVisitor() {
    const el = document.getElementById('mmVisitorCount');
    if (!el) return;
    const v = ensureVisitor24h();
    el.textContent = Math.max(1, Number(v.count || 1));
  }

  function openComments(id) {
    const p = productById(id), s = ensureProduct(id);
    const ru = localStorage.getItem('mmLang') === 'ru';
    const title = ru ? 'Комментарии' : 'Комментарийлер';
    const placeholder = ru ? 'Комментарий жазыңыз...' : 'Комментарий жазыңыз...';
    const send = ru ? 'Жөнөтүү' : 'Жөнөтүү';
    const comments = s.comments || [];
    const html = `
      <div class="mm-comments">
        <div class="mm-comments-head">
          <span class="eyebrow">💬 ${title}</span>
          <h2>${escapeHtml(productName(p))}</h2>
        </div>
        <div class="mm-comment-list">
          ${comments.length ? comments.map(c => `<div class="mm-comment"><b>${escapeHtml(c.name || 'Кардар')}</b><span>${escapeHtml(c.text)}</span><small>${new Date(c.at).toLocaleString()}</small></div>`).join('') :
          `<div class="mm-empty-comment">${ru ? 'Пока комментариев нет.' : 'Азырынча комментарий жок.'}</div>`}
        </div>
        <form id="mmCommentForm" class="mm-comment-form">
          <input id="mmCommentInput" maxlength="300" required placeholder="${placeholder}">
          <button class="primary" type="submit">${send}</button>
        </form>
      </div>`;
    const modal = document.querySelector('#modal');
    const body = document.querySelector('#modalBody');
    if (!modal || !body) return;
    body.innerHTML = html;
    modal.classList.add('show');
    document.querySelector('#mmCommentForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = document.querySelector('#mmCommentInput');
      const text = input?.value.trim();
      if (!text) return;
      s.comments.push({text, name: 'Кардар', at: Date.now()});
      save(state);
      openComments(id);
    });
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function trackView(card) {
    const id = pidOf(card);
    if (!id) return;
    const sessionKey = `mmViewed_${id}`;
    const seen = Number(sessionStorage.getItem(sessionKey) || 0);
    if (seen && Date.now() - seen < DAY) return;
    const s = ensureProduct(id);
    s.views++;
    sessionStorage.setItem(sessionKey, String(Date.now()));
    save(state);
  }

  function decorateCard(card) {
    if (!card || card.dataset.mmEngaged === '1') return;
    const id = pidOf(card);
    if (!id) return;
    const s = ensureProduct(id);
    card.dataset.mmEngaged = '1';

    const bar = document.createElement('div');
    bar.className = 'mm-eng-actions';
    bar.innerHTML = `
      <button type="button" class="mm-eng-btn mm-like ${s.liked ? 'is-on' : ''}" aria-label="Like">❤️ <b>${s.likes}</b></button>
      <button type="button" class="mm-eng-btn mm-comment" aria-label="Comment">💬 <b>${s.comments.length}</b></button>
      <button type="button" class="mm-eng-btn mm-share" aria-label="Share">🔗 <b>${s.shares}</b></button>
      <span class="mm-views">👁️ <b>${s.views}</b></span>
    `;
    const add = card.querySelector('.add');
    (add?.parentElement || card).appendChild(bar);

    bar.querySelector('.mm-like').addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const ss = ensureProduct(id);
      ss.liked = !ss.liked;
      ss.likes = Math.max(0, ss.likes + (ss.liked ? 1 : -1));
      save(state);
      const b = e.currentTarget;
      b.classList.toggle('is-on', ss.liked);
      b.querySelector('b').textContent = ss.likes;
    });

    bar.querySelector('.mm-comment').addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      openComments(id);
    });

    bar.querySelector('.mm-share').addEventListener('click', async e => {
      e.preventDefault(); e.stopPropagation();
      const p = productById(id), ss = ensureProduct(id);
      const url = new URL(location.href);
      url.hash = `product-${id}`;
      const data = {title: productName(p), text: `${productName(p)} — ${p?.price || ''} сом`, url: url.href};
      try {
        if (navigator.share) await navigator.share(data);
        else if (navigator.clipboard) { await navigator.clipboard.writeText(url.href); if (window.toast) window.toast('🔗 Шилтеме көчүрүлдү'); }
        ss.shares++;
        save(state);
        e.currentTarget.querySelector('b').textContent = ss.shares;
      } catch (_) {}
    });

    trackView(card);
    bar.querySelector('.mm-views').querySelector('b').textContent = ensureProduct(id).views;
  }

  function decorateAll() {
    document.querySelectorAll('#products .product').forEach(decorateCard);
    refreshVisitor();
  }

  injectStats();
  decorateAll();

  const target = document.getElementById('products');
  if (target) {
    const observer = new MutationObserver(() => {
      requestAnimationFrame(decorateAll);
    });
    observer.observe(target, {childList:true, subtree:true});
  }

  // Refresh the 24h visitor value when the page is reopened after a day.
  setInterval(refreshVisitor, 60000);
})();
