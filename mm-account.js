/* MOY MARKET — Customer account / registration v1.1 */
(() => {
  'use strict';
  const KEY = 'mmCustomerV11';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (_) { return null; } };
  const save = v => localStorage.setItem(KEY, JSON.stringify(v));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const qs = s => document.querySelector(s);

  function ensureModal() {
    if (qs('#mmAccountModal')) return;
    const w = document.createElement('div');
    w.id = 'mmAccountModal';
    w.className = 'mm-account-modal';
    w.innerHTML = `<div class="mm-account-backdrop"></div>
      <section class="mm-account-panel" role="dialog" aria-modal="true" aria-label="Кардар аккаунту">
        <button class="mm-account-close" type="button" aria-label="Жабуу">×</button>
        <div id="mmAccountBody"></div>
      </section>`;
    document.body.appendChild(w);
    w.querySelector('.mm-account-close').addEventListener('click', close);
    w.querySelector('.mm-account-backdrop').addEventListener('click', close);
  }

  function open() { ensureModal(); render(); qs('#mmAccountModal').classList.add('show'); document.body.classList.add('mm-account-open'); }
  function close() { const w = qs('#mmAccountModal'); if (w) w.classList.remove('show'); document.body.classList.remove('mm-account-open'); }

  function refreshButton() {
    const b = qs('#accountBtn');
    if (!b) return;
    const c = load();
    b.classList.toggle('is-registered', !!c);
    const label = b.querySelector('.mm-account-open-label');
    if (label) label.textContent = c ? (c.fullName.split(/\s+/)[0] || 'Аккаунт') : 'Аккаунт';
  }

  function bindButton() {
    const b = qs('#accountBtn');
    if (!b || b.dataset.mmBound === '1') return;
    b.dataset.mmBound = '1';
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); open(); });
    refreshButton();
  }

  function render() {
    const body = qs('#mmAccountBody'); if (!body) return;
    const c = load();
    if (c) {
      body.innerHTML = `<div class="mm-account-icon">👤</div><div class="mm-account-kicker">МОЙ МАРКЕТ</div>
        <h2>Менин аккаунтум</h2><p class="mm-account-muted">Кардар маалыматы ушул түзмөктө сакталды.</p>
        <div class="mm-account-profile"><div><span>Аты-жөнү</span><b>${esc(c.fullName)}</b></div><div><span>Телефон</span><b>${esc(c.phone)}</b></div></div>
        <label class="mm-account-check"><input id="mmAccountNotify" type="checkbox" ${c.notifications ? 'checked' : ''}> <span>Жаңы товарлар чыкканда билдирүү алгым келет</span></label>
        <div class="mm-account-row"><button id="mmAccountSave" class="mm-account-primary">Сактоо</button><button id="mmAccountLogout" class="mm-account-secondary">Чыгуу</button></div>
        <div id="mmAccountMsg" class="mm-account-msg"></div>`;
      qs('#mmAccountSave').onclick = () => { save({...c, notifications: !!qs('#mmAccountNotify').checked, updatedAt: Date.now()}); refreshButton(); showMsg('Маалымат сакталды.'); };
      qs('#mmAccountLogout').onclick = () => { localStorage.removeItem(KEY); render(); refreshButton(); };
    } else {
      body.innerHTML = `<div class="mm-account-icon">👤</div><div class="mm-account-kicker">МОЙ МАРКЕТ</div>
        <h2>Кардар катары катталыңыз</h2><p class="mm-account-muted">Атыңызды жана телефон номериңизди сактаңыз.</p>
        <form id="mmAccountForm" class="mm-account-form"><label>Аты-жөнү<input id="mmAccountName" required maxlength="80" autocomplete="name" placeholder="Мисалы: Азамат Алиев"></label>
        <label>Телефон номери<input id="mmAccountPhone" required inputmode="tel" maxlength="20" autocomplete="tel" placeholder="+996 555 123 456"></label>
        <label class="mm-account-check"><input id="mmAccountNotify" type="checkbox" checked> <span>Жаңы товарлар тууралуу билдирүү алууга уруксат берем</span></label>
        <button class="mm-account-primary" type="submit">Катталуу</button></form>
        <div class="mm-account-msg">SMS-код менен текшерүү кийинки backend этабында кошулат.</div>`;
      qs('#mmAccountForm').onsubmit = e => { e.preventDefault(); const fullName=qs('#mmAccountName').value.trim(); const phone=qs('#mmAccountPhone').value.trim(); if(fullName.length<2 || phone.length<7){showMsg('Аты-жөнү жана телефон номерин туура жазыңыз.');return;} save({fullName,phone,notifications:!!qs('#mmAccountNotify').checked,createdAt:Date.now(),updatedAt:Date.now()}); refreshButton(); render(); };
    }
  }
  function showMsg(text) { const el=qs('#mmAccountMsg'); if(el){el.textContent=text; setTimeout(()=>{if(el.textContent===text)el.textContent='';},2500);} }

  function start() {
    bindButton();
    // In case app.js re-renders the header, rebind without duplicating listeners.
    const observer = new MutationObserver(() => bindButton());
    observer.observe(document.body, {childList:true, subtree:true});
    document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
