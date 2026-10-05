/* MOY MARKET — stable product viewer + engagement v2.0
   No swipe. Every product card can be opened repeatedly.
*/
(() => {
  'use strict';
  const STATE_KEY = 'mmEngagementV20';
  const VISITOR_KEY = 'mmVisitor24hV20';
  const state = loadState();
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];

  function loadState(){ try{return JSON.parse(localStorage.getItem(STATE_KEY)) || {products:{}};}catch(_){return {products:{}};} }
  function save(){ try{localStorage.setItem(STATE_KEY, JSON.stringify(state));}catch(_){} }
  function hash(s){let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0).toString(36);}
  function text(el){return (el?.textContent || '').replace(/\s+/g,' ').trim();}
  function title(card){return text(qs('h3,.pname,.product-name,.product-title,[data-product-name]',card)) || 'Товар';}
  function price(card){return text(qs('.price,.product-price,[data-price]',card)) || text(qs('b,strong',card));}
  function image(card){const img=qs('img',card); return img?.currentSrc || img?.src || 'assets/products/placeholder.svg';}
  function id(card){return card.dataset.mmId || (card.dataset.mmId = hash(title(card) + '|' + image(card)));}
  function ensure(card){const k=id(card); if(!state.products[k]) state.products[k]={views:0,likes:0,liked:false,shares:0,comments:[]}; return state.products[k];}

  function visitor24h(){
    try{
      const now=Date.now(), old=JSON.parse(localStorage.getItem(VISITOR_KEY)||'null');
      if(!old || now-old.started>86400000){localStorage.setItem(VISITOR_KEY, JSON.stringify({started:now,count:1})); return 1;}
      return old.count || 1;
    }catch(_){return 1;}
  }

  function ensureStats(){
    if(qs('#mmEngagementStats')) return;
    const top=qs('.topbar'); if(!top) return;
    const bar=document.createElement('div'); bar.id='mmEngagementStats'; bar.className='mm-engagement-stats';
    bar.innerHTML='<span>👥 <b id="mmVisitorCount">1</b> <small>24 саат</small></span><span>❤️ Лайк · 💬 Комментарий · 🔗 Бөлүшүү · 👁️ Көрүү</span>';
    top.insertAdjacentElement('afterend',bar); qs('#mmVisitorCount').textContent=visitor24h();
  }

  function addCardActions(card){
    if(card.dataset.mmActions==='1') return;
    const p=ensure(card);
    const bar=document.createElement('div');
    bar.className='mm-card-actions';
    bar.innerHTML=`<button class="mm-social-btn" type="button" data-mm-action="like" aria-label="Лайк"><span class="mm-social-icon mm-heart">♡</span><b>${p.likes}</b></button><button class="mm-social-btn" type="button" data-mm-action="comment" aria-label="Комментарий"><span class="mm-social-icon mm-comment-icon"></span><b>${p.comments.length}</b></button><button class="mm-social-btn" type="button" data-mm-action="share" aria-label="Бөлүшүү"><span class="mm-social-icon mm-share-icon">➤</span><b>${p.shares}</b></button><span class="mm-social-view" data-mm-view="1" aria-label="Көрүүлөр"><span class="mm-social-icon mm-eye-icon">◉</span><b>${p.views}</b></span>`;
    card.appendChild(bar);
    card.dataset.mmActions='1';
  }

  function getPhoto(card){
    return qs('.photo',card) || qs('.product-photo,.image-wrap,.product-image',card);
  }

  function ensureBadges(card,index){
    const photo=getPhoto(card);
    if(!photo) return null;
    let wrap=qs('.mm-product-badges',photo);
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='mm-product-badges';
      wrap.setAttribute('aria-hidden','true');
      photo.appendChild(wrap);
    }
    return wrap;
  }

  function refreshBadges(card,index){
    const wrap=ensureBadges(card,index);
    if(!wrap) return;
    const p=ensure(card);
    const badges=[];
    if(index < 3) badges.push('<span class="mm-badge-new">✨ Жаңы</span>');
    if(p.views >= 5) badges.push('<span class="mm-badge-view">👁 Көп көрүлүүдө</span>');
    if(p.likes >= 3) badges.push('<span class="mm-badge-pop">🔥 Популярдуу</span>');
    wrap.innerHTML=badges.join('');
  }

  function decorate(){
    qsa('#products .product, #products .product-card, #products [data-product-card]').forEach((card,index)=>{
      addCardActions(card);
      ensureBadges(card,index);
      refreshBadges(card,index);
    });
  }

  let viewer, viewerImg, viewerName, viewerPrice, viewerBrand;
  function ensureViewer(){
    if(viewer) return;
    viewer=document.createElement('div'); viewer.id='mmProductViewer'; viewer.className='mm-product-viewer'; viewer.setAttribute('aria-hidden','true');
    viewer.innerHTML=`<div class="mm-viewer-backdrop"></div><button class="mm-viewer-close" type="button" aria-label="Жабуу">×</button><div class="mm-viewer-card"><div class="mm-viewer-image-wrap"><img class="mm-viewer-img" alt=""></div><div class="mm-viewer-body"><div class="mm-viewer-brand" id="mmViewerBrand">МОЙ МАРКЕТ</div><h2 id="mmViewerName"></h2><div class="mm-viewer-price" id="mmViewerPrice"></div><div class="mm-viewer-actions"><button type="button" data-vaction="like">❤️ <b>0</b></button><button type="button" data-vaction="comment">💬 <b>0</b></button><button type="button" data-vaction="share">🔗 <b>0</b></button><button type="button" class="mm-viewer-cart" data-vaction="cart">🛒 Себетке кошуу</button></div><div class="mm-viewer-hint">Товарды чоң көрүү режими. Башка товарды көрүү үчүн жабып, каалаган товарды кайра басыңыз.</div></div></div>`;
    document.body.appendChild(viewer);
    viewerImg=qs('.mm-viewer-img',viewer); viewerName=qs('#mmViewerName',viewer); viewerPrice=qs('#mmViewerPrice',viewer); viewerBrand=qs('#mmViewerBrand',viewer);
    qs('.mm-viewer-backdrop',viewer).addEventListener('click',closeViewer);
    qs('.mm-viewer-close',viewer).addEventListener('click',closeViewer);
    viewer.addEventListener('click',e=>{const b=e.target.closest('[data-vaction]'); if(!b)return; e.preventDefault(); e.stopPropagation(); const action=b.dataset.vaction; const card=viewer._card; if(!card)return; handleAction(action,card); refreshViewer(card);});
  }

  let activeCard=null;
  function openViewer(card){
    ensureViewer();
    activeCard=card; viewer._card=card;
    const p=ensure(card); p.views += 1; save();
    viewerImg.src=image(card); viewerImg.alt=title(card); viewerName.textContent=title(card); viewerPrice.textContent=price(card); viewerBrand.textContent='МОЙ МАРКЕТ'; refreshViewer(card); updateCard(card);
    viewer.classList.add('show'); viewer.setAttribute('aria-hidden','false'); document.body.classList.add('mm-viewer-open');
  }
  function closeViewer(){if(!viewer)return; viewer.classList.remove('show'); viewer.setAttribute('aria-hidden','true'); document.body.classList.remove('mm-viewer-open'); activeCard=null; viewer._card=null;}
  function refreshViewer(card){const p=ensure(card); qsa('[data-vaction="like"] b',viewer)[0].textContent=p.likes; qsa('[data-vaction="comment"] b',viewer)[0].textContent=p.comments.length; qsa('[data-vaction="share"] b',viewer)[0].textContent=p.shares;}

  function updateCard(card){const p=ensure(card); const bar=qs('.mm-card-actions',card); if(!bar)return; const vals={like:p.likes,comment:p.comments.length,share:p.shares}; Object.entries(vals).forEach(([k,v])=>{const b=qs(`[data-mm-action="${k}"] b`,bar);if(b)b.textContent=v;}); const eye=qs('[data-mm-view] b',bar);if(eye)eye.textContent=p.views; const like=qs('[data-mm-action="like"]',bar); if(like)like.classList.toggle('liked',p.liked);
    const cards=qsa('#products .product, #products .product-card, #products [data-product-card]');
    refreshBadges(card, Math.max(0,cards.indexOf(card)));}

  function handleAction(action,card){
    const p=ensure(card);
    if(action==='like'){p.liked=!p.liked;p.likes=Math.max(0,p.likes+(p.liked?1:-1));}
    else if(action==='comment'){openComment(card);return;}
    else if(action==='share'){p.shares+=1; const url=location.href.split('#')[0]; const shareData={title:title(card),text:`${title(card)} — ${price(card)}`,url}; if(navigator.share) navigator.share(shareData).catch(()=>{}); else if(navigator.clipboard) navigator.clipboard.writeText(url).catch(()=>{});}
    else if(action==='cart'){const btn=qs('.cart-add,.add-to-cart,[data-add-cart],.buy',card); if(btn){btn.click();} else {document.dispatchEvent(new CustomEvent('mm:add-to-cart',{detail:{card}}));}}
    save(); updateCard(card);
  }

  function openComment(card){
    let modal=qs('#mmCommentModal'); if(!modal){modal=document.createElement('div');modal.id='mmCommentModal';modal.className='mm-comment-modal';modal.innerHTML='<div class="mm-comment-backdrop"></div><div class="mm-comment-panel"><button class="mm-comment-close">×</button><h3>Комментарий</h3><textarea id="mmCommentText" maxlength="300" placeholder="Пикириңизди жазыңыз..."></textarea><button id="mmCommentSend">Жөнөтүү</button></div>';document.body.appendChild(modal);qs('.mm-comment-backdrop',modal).onclick=()=>modal.classList.remove('show');qs('.mm-comment-close',modal).onclick=()=>modal.classList.remove('show');}
    modal._card=card; qs('#mmCommentText',modal).value=''; modal.classList.add('show'); qs('#mmCommentText',modal).focus(); qs('#mmCommentSend').onclick=()=>{const v=qs('#mmCommentText',modal).value.trim();if(!v)return;const p=ensure(card);const a=loadAccount(); p.comments.push({name:a.name||'Кардар',phone:a.phone||'',text:v,at:Date.now()});save();updateCard(card);if(viewer?.classList.contains('show')&&viewer._card===card)refreshViewer(card);modal.classList.remove('show');};
  }

  function isActionTarget(el){return !!el.closest('button,a,input,textarea,select,[data-mm-action],[data-vaction],.mm-card-actions,.cart-add,.add-to-cart,[data-add-cart]');}
  function bindDelegated(){
    document.addEventListener('click',e=>{
      const action=e.target.closest('[data-mm-action]');
      if(action){const card=action.closest('#products .product, #products .product-card, #products [data-product-card]');if(card){e.preventDefault();e.stopPropagation();handleAction(action.dataset.mmAction,card);}return;}
      const card=e.target.closest('#products .product, #products .product-card, #products [data-product-card]');
      if(!card || isActionTarget(e.target)) return;
      // Capture at document level so re-rendered product cards always work.
      e.preventDefault(); e.stopPropagation(); openViewer(card);
    }, true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeViewer();closeAccount();}});
  }


  // STEP 10.1 — customer account (persistent on this browser/device; editable, no delete button)
  const ACCOUNT_KEY='mmCustomerAccountV1';
  let accountModal=null;
  function loadAccount(){
    try {
      const raw=localStorage.getItem(ACCOUNT_KEY);
      if(raw){ const a=JSON.parse(raw); if(a && typeof a==='object') return {name:a.name||'',phone:a.phone||'',updatedAt:a.updatedAt||0}; }
    } catch(_){}
    return {name:'',phone:'',updatedAt:0};
  }
  function saveAccount(data){
    const clean={name:String(data.name||'').trim(),phone:String(data.phone||'').trim(),updatedAt:Date.now()};
    try{
      localStorage.setItem(ACCOUNT_KEY,JSON.stringify(clean));
      // Keep a second browser-level copy so a normal storage refresh does not lose the profile.
      document.cookie=ACCOUNT_KEY+'='+encodeURIComponent(JSON.stringify(clean))+'; max-age=31536000; path=/; SameSite=Lax';
    }catch(_){}
    updateAccountButton();
  }
  function ensureAccountButton(){
    if(qs('#mmAccountButton')) return;
    const b=document.createElement('button');
    b.id='mmAccountButton'; b.type='button'; b.className='mm-account-button';
    b.innerHTML='<span class="mm-account-icon">👤</span><span class="mm-account-label">Аккаунт</span>';
    b.addEventListener('click',openAccount);
    document.body.appendChild(b); updateAccountButton();
  }
  function updateAccountButton(){
    const b=qs('#mmAccountButton'); if(!b)return;
    const a=loadAccount();
    b.classList.toggle('mm-account-filled',!!(a.name&&a.phone));
    b.querySelector('.mm-account-label').textContent=a.name ? a.name.split(/\s+/)[0] : 'Аккаунт';
    b.title=a.name&&a.phone ? `${a.name} • ${a.phone}` : 'Аккаунт';
  }
  function ensureAccountModal(){
    if(accountModal) return;
    accountModal=document.createElement('div'); accountModal.id='mmAccountModal'; accountModal.className='mm-account-modal'; accountModal.setAttribute('aria-hidden','true');
    accountModal.innerHTML=`<div class="mm-account-backdrop"></div><div class="mm-account-panel" role="dialog" aria-modal="true" aria-labelledby="mmAccountTitle"><button type="button" class="mm-account-close" aria-label="Жабуу">×</button><div class="mm-account-head"><div class="mm-account-avatar">👤</div><div><div class="mm-account-kicker">МОЙ МАРКЕТ</div><h3 id="mmAccountTitle">Кардар аккаунту</h3></div></div><label>Аты-жөнү<input id="mmAccountName" type="text" maxlength="80" autocomplete="name" placeholder="Аты-жөнүңүз"></label><label>Телефон номери<input id="mmAccountPhone" type="tel" maxlength="20" autocomplete="tel" inputmode="tel" placeholder="+996 ___ ___ ___"></label><div class="mm-account-note">Маалымат сакталат жана кайра киргенде автоматтык чыгат. Кааласаңыз кийин өзгөртө аласыз.</div><button type="button" id="mmAccountSave" class="mm-account-save">💾 Сактоо</button></div>`;
    document.body.appendChild(accountModal);
    qs('.mm-account-backdrop',accountModal).addEventListener('click',closeAccount);
    qs('.mm-account-close',accountModal).addEventListener('click',closeAccount);
    qs('#mmAccountSave',accountModal).addEventListener('click',()=>{
      const name=qs('#mmAccountName',accountModal).value.trim();
      const phone=qs('#mmAccountPhone',accountModal).value.trim();
      if(name.length<2){qs('#mmAccountName',accountModal).focus(); return;}
      if(phone.length<5){qs('#mmAccountPhone',accountModal).focus(); return;}
      saveAccount({name,phone,updatedAt:Date.now()}); closeAccount();
    });
    qs('#mmAccountClear',accountModal).addEventListener('click',()=>{
      try{localStorage.removeItem(ACCOUNT_KEY);}catch(_){}
      qs('#mmAccountName',accountModal).value=''; qs('#mmAccountPhone',accountModal).value=''; updateAccountButton();
    });
  }
  function openAccount(){ensureAccountModal(); const a=loadAccount(); qs('#mmAccountName',accountModal).value=a.name||''; qs('#mmAccountPhone',accountModal).value=a.phone||''; accountModal.classList.add('show'); accountModal.setAttribute('aria-hidden','false'); setTimeout(()=>qs('#mmAccountName',accountModal).focus(),40);}
  function closeAccount(){if(!accountModal)return; accountModal.classList.remove('show'); accountModal.setAttribute('aria-hidden','true');}

  function start(){
    ensureStats(); bindDelegated(); decorate(); ensureAccountModal();
    const root=qs('#products');
    if(root){
      const observer=new MutationObserver(()=>{
        observer.disconnect();
        try{ decorate(); } finally { observer.observe(root,{childList:true,subtree:true}); }
      });
      observer.observe(root,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
