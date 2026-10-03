/* MOY MARKET — Customer account / registration v1
   Front-end profile layer. Data is stored locally in this browser.
   Real SMS OTP, cross-device accounts and push notifications require a backend.
*/
(() => {
  'use strict';
  const KEY='mmCustomerV1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||null}catch(_){return null}};
  const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function ensureStyles(){if(document.getElementById('mmAccountStyles'))return;}
  function ensureModal(){
    if(document.getElementById('mmAccountModal'))return;
    const w=document.createElement('div'); w.id='mmAccountModal'; w.className='mm-account-modal';
    w.innerHTML=`<div class="mm-account-backdrop"></div><section class="mm-account-panel" role="dialog" aria-modal="true" aria-label="Кардар аккаунту">
      <button class="mm-account-close" type="button" aria-label="Жабуу">×</button>
      <div id="mmAccountBody"></div>
    </section>`;
    document.body.appendChild(w);
    w.querySelector('.mm-account-close').onclick=close;
    w.querySelector('.mm-account-backdrop').onclick=close;
  }
  function open(){ensureModal();render();document.getElementById('mmAccountModal').classList.add('show');document.body.classList.add('mm-account-open')}
  function bindButton(){const b=document.getElementById('accountBtn');if(b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open()})}}
  function close(){const w=document.getElementById('mmAccountModal');if(w){w.classList.remove('show');document.body.classList.remove('mm-account-open')}}
  function render(){
    const body=document.getElementById('mmAccountBody'); if(!body)return; const c=load();
    if(c){
      body.innerHTML=`<div class="mm-account-icon">👤</div><div class="mm-account-kicker">МОЙ МАРКЕТ</div><h2>Менин аккаунтум</h2><p class="mm-account-muted">Кардар маалыматы ушул түзмөктө сакталды.</p>
      <div class="mm-account-profile"><div><span>Аты-жөнү</span><b>${esc(c.fullName)}</b></div><div><span>Телефон</span><b>${esc(c.phone)}</b></div></div>
      <label class="mm-account-check"><input id="mmAccountNotify" type="checkbox" ${c.notifications?'checked':''}> <span>Жаңы товарлар чыкканда билдирүү алгым келет</span></label>
      <div class="mm-account-row"><button id="mmAccountSave" class="mm-account-primary">Сактоо</button><button id="mmAccountLogout" class="mm-account-secondary">Чыгуу</button></div>
      <div id="mmAccountMsg" class="mm-account-msg"></div>`;
      body.querySelector('#mmAccountSave').onclick=()=>{const next={...c,notifications:!!body.querySelector('#mmAccountNotify').checked,updatedAt:Date.now()};save(next);showMsg('Маалымат сакталды.');};
      body.querySelector('#mmAccountLogout').onclick=()=>{localStorage.removeItem(KEY);render();};
    } else {
      body.innerHTML=`<div class="mm-account-icon">👤</div><div class="mm-account-kicker">МОЙ МАРКЕТ</div><h2>Кардар катары катталыңыз</h2><p class="mm-account-muted">Атыңызды жана телефон номериңизди сактап, заказ жана комментарийлерде өзүңүздү оңой колдонуңуз.</p>
      <form id="mmAccountForm" class="mm-account-form"><label>Аты-жөнү<input id="mmAccountName" required maxlength="80" autocomplete="name" placeholder="Мисалы: Азамат Алиев"></label><label>Телефон номери<input id="mmAccountPhone" required inputmode="tel" maxlength="20" autocomplete="tel" placeholder="+996 555 123 456"></label><label class="mm-account-check"><input id="mmAccountNotify" type="checkbox" checked> <span>Жаңы товарлар тууралуу билдирүү алууга уруксат берем</span></label><button class="mm-account-primary" type="submit">Катталуу</button></form><div class="mm-account-msg">SMS-код менен чыныгы текшерүү кийинки backend этабында кошулат.</div>`;
      body.querySelector('#mmAccountForm').onsubmit=e=>{e.preventDefault();const fullName=body.querySelector('#mmAccountName').value.trim();const phone=body.querySelector('#mmAccountPhone').value.trim();if(fullName.length<2||phone.length<7){showMsg('Аты-жөнү жана телефон номерин туура жазыңыз.');return}save({fullName,phone,notifications:!!body.querySelector('#mmAccountNotify').checked,createdAt:Date.now(),updatedAt:Date.now()});render();};
    }
  }
  function showMsg(text){const el=document.getElementById('mmAccountMsg');if(el){el.textContent=text;setTimeout(()=>{if(el.textContent===text)el.textContent=''},2500)}}
  function injectButton(){
    if(document.getElementById('mmAccountOpen'))return;
    const top=document.querySelector('.topbar'); if(!top)return;
    const b=document.createElement('button'); b.id='mmAccountOpen'; b.className='mm-account-open-btn'; b.type='button'; b.setAttribute('aria-label','Кардар аккаунту');
    b.innerHTML='<span class="mm-account-open-icon">👤</span><span class="mm-account-open-label">Аккаунт</span>';
    b.onclick=open;
    const cart=top.querySelector('#cartBtn,.cart-btn,.cart-button,[aria-label*="Корз"]');
    if(cart?.parentElement===top) top.insertBefore(b,cart); else top.appendChild(b);
    refreshButton();
  }
  function refreshButton(){const b=document.getElementById('mmAccountOpen');if(!b)return;const c=load();b.classList.toggle('is-registered',!!c);b.querySelector('.mm-account-open-label').textContent=c?(c.fullName.split(/\s+/)[0]||'Аккаунт'):'Аккаунт'}
  function start(){injectButton();window.addEventListener('storage',refreshButton);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});}
  function start(){bindButton();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
