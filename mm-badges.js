(function(){
  'use strict';

  const STATE_KEY = 'mmEngagementV11';
  const STYLE_ID = 'mm-badges-style';
  const BADGE_CLASS = 'mm-product-badge';

  function loadState(){
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {}; }
    catch(e){ return {}; }
  }

  function titleOf(card){
    const el = card.querySelector('h3,.pname,.product-name,.product-title,[data-product-name]');
    return el ? el.textContent.trim() : '';
  }

  function idOf(card){
    if (card.dataset.mmId) return card.dataset.mmId;
    const title = titleOf(card).toLowerCase();
    let h = 2166136261;
    for(let i=0;i<title.length;i++){
      h ^= title.charCodeAt(i);
      h = Math.imul(h,16777619);
    }
    return 'p_' + (h >>> 0).toString(36);
  }

  function stats(card, state){
    const s = state[idOf(card)] || {};
    return {
      views: Number(s.views || 0),
      likes: Number(s.likes || 0),
      shares: Number(s.shares || 0)
    };
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .mm-badge-wrap{position:absolute;left:10px;top:10px;z-index:12;display:flex;gap:6px;flex-wrap:wrap;pointer-events:none}
      .mm-product-badge{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;border:1px solid rgba(255,145,0,.55);border-radius:999px;background:rgba(10,13,18,.90);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);color:#fff;font:700 11px/1.1 system-ui,sans-serif;box-shadow:0 5px 16px rgba(0,0,0,.28)}
      .mm-product-badge.hot{border-color:rgba(255,102,0,.7)}
      .mm-product-badge.viewed{border-color:rgba(255,166,0,.65)}
      .mm-product-badge.new{border-color:rgba(255,255,255,.45)}
      #products .product,.products-grid .product,.product-card{position:relative}
      @media(max-width:600px){.mm-product-badge{font-size:10px;padding:6px 8px}.mm-badge-wrap{left:8px;top:8px}}
    `;
    document.head.appendChild(style);
  }

  function cards(){
    return Array.from(document.querySelectorAll('#products .product,.products-grid .product,.product-card'))
      .filter(c=>titleOf(c));
  }

  function apply(){
    ensureStyle();
    const state=loadState();
    const list=cards();
    if(!list.length) return;

    const all=list.map(c=>({card:c,s:stats(c,state)}));
    const maxViews=Math.max.apply(null,all.map(x=>x.s.views));
    const maxScore=Math.max.apply(null,all.map(x=>x.s.views+x.s.likes*3+x.s.shares*2));

    all.forEach(({card,s},index)=>{
      const old=card.querySelector('.mm-badge-wrap');
      if(old) old.remove();
      const wrap=document.createElement('div');
      wrap.className='mm-badge-wrap';

      // Show "New" only for the first two catalog cards. This is a visual storefront label,
      // not a claim about product age, so it never modifies product data.
      if(index < 2){
        const b=document.createElement('span'); b.className=BADGE_CLASS+' new'; b.textContent='✨ Жаңы'; wrap.appendChild(b);
      }
      if(maxViews > 0 && s.views === maxViews && s.views >= 3){
        const b=document.createElement('span'); b.className=BADGE_CLASS+' viewed'; b.textContent='👁 Көп көрүлүүдө'; wrap.appendChild(b);
      }
      const score=s.views+s.likes*3+s.shares*2;
      if(maxScore > 0 && score === maxScore && score >= 5){
        const b=document.createElement('span'); b.className=BADGE_CLASS+' hot'; b.textContent='🔥 Популярдуу'; wrap.appendChild(b);
      }
      if(wrap.children.length) card.appendChild(wrap);
    });
  }

  function boot(){
    apply();
    const target=document.querySelector('#products') || document.body;
    let timer;
    new MutationObserver(function(){
      clearTimeout(timer); timer=setTimeout(apply,80);
    }).observe(target,{childList:true,subtree:true});
    window.addEventListener('storage',apply);
    window.addEventListener('pageshow',apply);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
