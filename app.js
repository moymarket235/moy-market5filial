const WA="996507668866";
let products=[], categories=[], cart=JSON.parse(localStorage.getItem("moyCart")||"[]"), activeCat="all";

const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("ru-RU").format(n)+" сом";

async function load(){
  try{
    [products,categories]=await Promise.all([
      fetch("products.json",{cache:"no-store"}).then(r=>r.json()),
      fetch("categories.json",{cache:"no-store"}).then(r=>r.json())
    ]);
  }catch(e){products=[];categories=[]}
  renderCats(); renderProducts(); renderCart();
}
function renderCats(){
  $("#categories").innerHTML=categories.map(c=>`<button class="cat ${activeCat===c.id?"active":""}" data-cat="${c.id}">
    <span class="ico">${c.icon||"🛍️"}</span><b>${c.name}</b><span style="color:#9aa4b2">→</span></button>`).join("");
  document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;renderCats();renderProducts();document.getElementById("catalog").scrollIntoView({behavior:"smooth"})});
}
function renderProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  let list=products.filter(p=>(activeCat==="all"||p.category===activeCat)&&(p.name+" "+(p.description||"")+" "+(p.categoryName||"")).toLowerCase().includes(q));
  $("#resultCount").textContent=list.length?`${list.length} товар`:"";
  $("#empty").hidden=!!list.length;
  $("#products").innerHTML=list.map(p=>`
  <article class="product">
    <div class="photo"><img src="${p.image||"assets/products/placeholder.svg"}" alt="${esc(p.name)}" loading="lazy"></div>
    <div class="pbody">
      <div class="pname">${esc(p.name)}</div>
      <div class="desc">${esc(p.description||"Сапаттуу товар")}</div>
      <div class="price">${money(Number(p.price)||0)}</div>
      <button class="buy" onclick="addToCart('${escAttr(p.id)}')">🛒 Себетке кошуу</button>
    </div>
  </article>`).join("");
}
function addToCart(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  const old=cart.find(x=>x.id===id); old?old.qty++:cart.push({id,qty:1});
  saveCart(); renderCart(); openCart();
}
function saveCart(){localStorage.setItem("moyCart",JSON.stringify(cart))}
function renderCart(){
  const rows=cart.map(x=>{const p=products.find(y=>y.id===x.id);return p?`
  <div class="cart-row"><img src="${p.image||"assets/products/placeholder.svg"}"><div><b>${esc(p.name)}</b><small>${money(Number(p.price)||0)}</small><div class="qty"><button onclick="changeQty('${escAttr(p.id)}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${escAttr(p.id)}',1)">+</button></div></div><strong>${money((Number(p.price)||0)*x.qty)}</strong></div>`:""}).join("");
  $("#cartItems").innerHTML=rows||`<div class="empty"><div>🛒</div><h3>Корзина бош</h3><p>Товар тандап баштаңыз.</p></div>`;
  const count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,x)=>{const p=products.find(y=>y.id===x.id);return s+(p?(Number(p.price)||0)*x.qty:0)},0);
  $("#cartCount").textContent=count;$("#mobileCartCount").textContent=count;$("#cartTotal").textContent=money(total);
}
function changeQty(id,n){const x=cart.find(y=>y.id===id);if(!x)return;x.qty+=n;if(x.qty<=0)cart=cart.filter(y=>y.id!==id);saveCart();renderCart()}
function openCart(){$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("open")}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("open")}
function order(){
  if(!cart.length)return;
  let total=0,msg="Салам! Мой Маркеттен заказ бергим келет:%0A%0A";
  cart.forEach(x=>{
    const p=products.find(y=>y.id===x.id);
    if(p){
      const sub=(Number(p.price)||0)*x.qty;
      total+=sub;
      const imageUrl = p.image
        ? new URL(p.image, location.href).href
        : "";
      msg += `• ${encodeURIComponent(p.name)}%0A`;
      msg += `  Саны: ${x.qty} даана%0A`;
      msg += `  Баасы: ${Number(p.price)||0} сом%0A`;
      msg += `  Жалпы: ${sub} сом%0A`;
      if(imageUrl) msg += `  Сүрөт: ${encodeURIComponent(imageUrl)}%0A`;
      msg += `%0A`;
    }
  });
  msg+=`Жалпы заказ: ${total} сом`;
  location.href=`https://wa.me/${WA}?text=${msg}`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function escAttr(s){return String(s??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
$("#searchBtn").onclick=()=>{document.getElementById("searchbox").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#searchInput").focus(),400)}
$("#mobileSearch").onclick=()=>$("#searchBtn").click();
$("#cartBtn").onclick=openCart;$("#mobileCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#backdrop").onclick=closeCart;$("#orderBtn").onclick=order;
$("#allBtn").onclick=()=>{activeCat="all";renderCats();renderProducts()};
$("#searchInput").oninput=renderProducts;$("#clearSearch").onclick=()=>{$("#searchInput").value="";renderProducts()};
load();
