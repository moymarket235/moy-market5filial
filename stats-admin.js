(() => {
  'use strict';
  const API = window.MM_STATS_API || '';
  const TOKEN_KEY = 'mmStatsAdminTokenV1';
  let token = sessionStorage.getItem(TOKEN_KEY) || '';

  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt = n => Number(n || 0).toLocaleString('ru-RU');

  function msg(t, bad=false){ const el=$('#msg'); if(el){ el.textContent=t; el.style.color=bad?'#ff9a9a':'#8fd5a8'; } }

  async function api(path, options={}) {
    const headers = {'content-type':'application/json', ...(options.headers || {})};
    if (token) headers.authorization = `Bearer ${token}`;
    const r = await fetch(API + path, {...options, headers});
    let data = null; try { data = await r.json(); } catch (_) {}
    if (r.status === 401) { logout(); throw new Error('UNAUTHORIZED'); }
    if (!r.ok) throw new Error(data?.detail || data?.error || `HTTP_${r.status}`);
    return data;
  }

  function loginView(){ $('#login').style.display='block'; $('#app').style.display='none'; }
  function appView(){
  $('#login').style.display='none';
  $('#app').style.display='flex';
  startAutoRefresh();
  }
  function logout(){
  stopAutoRefresh();
  token='';
  sessionStorage.removeItem(TOKEN_KEY);
  loginView();
  }

  async function login(){
    const username=$('#username').value.trim(), password=$('#password').value;
    if(!username || !password){ msg('Логин жана сырсөздү жазыңыз.', true); return; }
    try{
      const r=await fetch(API+'/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});
      const data=await r.json();
      if(!r.ok) throw new Error(data?.error || 'UNAUTHORIZED');
      token=data.token; sessionStorage.setItem(TOKEN_KEY,token); appView(); await loadAll();
    }catch(e){msg(e.message==='UNAUTHORIZED'?'Кирүү уруксат берилген жок.':'Серверге туташуу мүмкүн эмес.',true);}
  }
  function renderFunnel(kpi){
  const wrap=$('#funnel');
  if(!wrap)return;

  const items=[
    {icon:'👤',label:'Уникалдуу кардарлар',value:Number(kpi?.uniqueVisitors||0)},
    {icon:'👁',label:'Товар көрүүлөрү',value:Number(kpi?.productViews||0)},
    {icon:'🛒',label:'Себетке кошуу',value:Number(kpi?.cartAdds||0)},
    {icon:'❤️',label:'Избранное',value:Number(kpi?.favorites||0)},
    {icon:'↗️',label:'Бөлүшүүлөр',value:Number(kpi?.shares||0)}
  ];

  const max=Math.max(1,...items.map(x=>x.value));

  wrap.innerHTML=items.map(x=>{
    const width=Math.max(10,Math.round(x.value/max*100));

    return `
      <div class="funnel-row">
        <div class="funnel-stage">
          <span class="funnel-icon">${x.icon}</span>
          <span class="funnel-label">${x.label}</span>
          <b>${fmt(x.value)}</b>
        </div>
        <div class="funnel-track">
          <i style="width:${width}%"></i>
        </div>
      </div>
    `;
  }).join('');
  }
  function metric(id, value){ const el=$(id); if(el) el.textContent=fmt(value); }
  let autoRefreshTimer = null;

function markUpdated(){
  const el = $('#updatedAt');
  if(el){
    el.textContent = new Date().toLocaleTimeString('ky-KG',{
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });
  }
}
function startAutoRefresh(){
  if(autoRefreshTimer) clearInterval(autoRefreshTimer);

  autoRefreshTimer = setInterval(()=>{
    if(token && document.visibilityState === 'visible'){
      loadAll().catch(()=>{});
    }
  },60000);
}

function stopAutoRefresh(){
  if(autoRefreshTimer){
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}
  function renderChart(rows){
    const wrap=$('#trend'); if(!wrap)return;
    const max=Math.max(1,...rows.map(x=>Number(x.visitors||0)));
    wrap.innerHTML = rows.length ? rows.map(x=>{
      const h=Math.max(3,Math.round(Number(x.visitors||0)/max*160));
      const label=String(x.day||'').slice(5);
      return `<div class="barcol"><i style="height:${h}px" title="${fmt(x.visitors)}"></i><span>${esc(label)}</span></div>`;
    }).join('') : '<div class="empty">Маалымат азырынча жок</div>';
  }

  function renderList(id, rows, key, nameKey='name'){
    const wrap=$(id); if(!wrap)return;
    wrap.innerHTML=rows.length ? rows.map((x,i)=>`<div class="row"><span>${i+1}. ${esc(x[nameKey] ?? x[key] ?? '')}</span><span class="pill">${fmt(x.count)}</span></div>`).join('') : '<div class="empty">Азырынча маалымат жок</div>';
  }

  function renderBars(id, rows, key){
    const wrap=$(id); if(!wrap)return;
    const max=Math.max(1,...rows.map(x=>Number(x.count||0)));
    wrap.innerHTML=rows.length ? rows.map(x=>`<div class="barline"><span>${esc(x[key]||'—')}</span><div class="bar"><i style="width:${Math.round(Number(x.count||0)/max*100)}%"></i></div><b>${fmt(x.count)}</b></div>`).join('') : '<div class="empty">Азырынча маалымат жок</div>';
  }
  function renderHourly(rows){
  const wrap = $('#hourly');
  if(!wrap)return;

  const data = Array.from({length:24},(_,h)=>{
    const x = rows.find(r => Number(r.hour) === h);
    return {hour:h,count:Number(x?.count || 0)};
  });

  const max = Math.max(1,...data.map(x=>x.count));

  wrap.innerHTML = data.map(x=>{
    const height = Math.max(4,Math.round(x.count/max*150));
    const label = String(x.hour).padStart(2,'0')+':00';

    return `
      <div class="barcol">
        <i style="height:${height}px" title="${fmt(x.count)}"></i>
        <span>${label}</span>
      </div>
    `;
  }).join('');
  }
  async function loadDashboard(){
    const days=$('#period').value || '7';
    const d=await api(`/api/dashboard?days=${encodeURIComponent(days)}`);
    metric('#visitorsToday',d.kpi.visitorsToday); metric('#uniqueVisitors',d.kpi.uniqueVisitors); metric('#productViews',d.kpi.productViews); metric('#cartAdds',d.kpi.cartAdds); metric('#favorites',d.kpi.favorites); metric('#searches',d.kpi.searches); metric('#likes',d.kpi.likes); metric('#shares',d.kpi.shares);
    renderChart(d.trend); renderList('#products',d.products,'id'); renderList('#searchList',d.searches,'term','term'); renderBars('#devices',d.devices,'device'); renderBars('#languages',d.languages,'lang'); renderBars('#sources',d.sources,'source');
    renderHourly(d.hourly);
    renderFunnel(d.kpi);
    const p=d.products?.[0];
    const s=d.searches?.[0];
    const src=d.sources?.[0];

$('#topProduct').textContent=p?.name || 'Маалымат жок';
$('#topProductCount').textContent=`${fmt(p?.count)} көрүү`;

$('#topSearch').textContent=s?.term || 'Маалымат жок';
$('#topSearchCount').textContent=`${fmt(s?.count)} издөө`;

$('#topSource').textContent=src?.source || 'Маалымат жок';
$('#topSourceCount').textContent=`${fmt(src?.count)} кирүү`;
}
  async function loadUsers(){
    try{
      const d=await api('/api/users');
      const wrap=$('#users'); const users=d.users||[]; let html='';
      for(let i=0;i<5;i++){
        const u=users[i];
        html += u ? `<div class="slot"><b>Орун ${i+1}: ${esc(u.username)}</b><small>Статистика көрүүгө уруксаты бар</small><div style="margin-top:8px;display:flex;gap:6px"><button class="danger" data-delete-user="${u.id}">Өчүрүү</button><button class="secondary" data-change-user="${u.id}">Сырсөз</button></div></div>` : `<div class="slot"><b>Орун ${i+1}: бош</b><small>Админ бул орунга адам кошо алат</small></div>`;
      }
      wrap.innerHTML=html;
      wrap.querySelectorAll('[data-delete-user]').forEach(b=>b.onclick=async()=>{ if(!confirm('Бул статистика көрүүчү аккаунтту өчүрөсүзбү?'))return; try{await api('/api/users/'+b.dataset.deleteUser,{method:'DELETE'});await loadUsers();}catch(e){alert('Өчүрүү ишке ашкан жок.');} });
      wrap.querySelectorAll('[data-change-user]').forEach(b=>b.onclick=async()=>{const p=prompt('Жаңы сырсөз (кеминде 6 белги):');if(!p)return;try{await api('/api/users/'+b.dataset.changeUser,{method:'PUT',body:JSON.stringify({password:p})});alert('Сырсөз жаңыртылды.');}catch(e){alert('Сырсөз жаңырган жок.');}});
      $('#slotCount').textContent=`${users.length}/5`;
    }catch(e){ }
  }

  async function addUser(){
    const username=$('#newUser').value.trim(), password=$('#newPass').value;
    if(!username || password.length<6){$('#userMsg').textContent='Логин жана кеминде 6 белгиден турган сырсөз керек.';return;}
    try{await api('/api/users',{method:'POST',body:JSON.stringify({username,password})});$('#newUser').value='';$('#newPass').value='';$('#userMsg').textContent='Колдонуучу кошулду ✅';await loadUsers();}catch(e){$('#userMsg').textContent=e.message==='MAX_VIEWERS'?'5 орун толду.':'Кошуу мүмкүн болгон жок: '+e.message;}
  }

  async function loadAll(){
    $('#role').textContent = token ? 'Коопсуз кирүү' : '';
    try{ await loadDashboard(); }catch(e){}
    try{ const me=await api('/api/me'); if(me.role==='admin'){ $('#usersCard').style.display='block'; await loadUsers(); } else $('#usersCard').style.display='none'; }catch(e){}
    markUpdated();
  }
  
  function boot(){
    $('#loginForm').addEventListener('submit',e=>{e.preventDefault();login();});
    $('#period').addEventListener('change',()=>loadDashboard().catch(()=>{}));
    $('#refresh').addEventListener('click',()=>loadAll());
    $('#logout').addEventListener('click',logout);
    $('#addUser').addEventListener('click',addUser);
    if(!API){ msg('MM_STATS_API коюлган эмес.', true); return; }
    if(token) { appView(); loadAll(); } else loginView();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
// deploy test
