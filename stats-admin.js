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
    if (!r.ok) throw new Error(data?.error || `HTTP_${r.status}`);
    return data;
  }

  function loginView(){ $('#login').style.display='block'; $('#app').style.display='none'; }
  function appView(){ $('#login').style.display='none'; $('#app').style.display='flex'; }
  function logout(){ token=''; sessionStorage.removeItem(TOKEN_KEY); loginView(); }

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

  function metric(id, value){ const el=$(id); if(el) el.textContent=fmt(value); }

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

  async function loadDashboard(){
    const days=$('#period').value || '7';
    const d=await api(`/api/dashboard?days=${encodeURIComponent(days)}`);
    metric('#visitorsToday',d.kpi.visitorsToday); metric('#uniqueVisitors',d.kpi.uniqueVisitors); metric('#productViews',d.kpi.productViews); metric('#cartAdds',d.kpi.cartAdds); metric('#favorites',d.kpi.favorites); metric('#searches',d.kpi.searches); metric('#likes',d.kpi.likes); metric('#shares',d.kpi.shares);
    renderChart(d.trend); renderList('#products',d.products,'id'); renderList('#searchList',d.searches,'term','term'); renderBars('#devices',d.devices,'device'); renderBars('#languages',d.languages,'lang'); renderBars('#sources',d.sources,'source');
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
