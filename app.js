const WA="996507668866";
let products=[],categories=[],cart=JSON.parse(localStorage.getItem("moyCart")||"[]");
let activeCat="all",activeSub="all",lang=localStorage.getItem("moyLang")||"ky";
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("ru-RU").format(n)+" сом";

const T={
 ky:{
  heroEyebrow:"БИШКЕК • КҮН САЙЫН 09:00–21:00",heroTitle:"Үйүңүзгө керектүүнүн<br><em>баары бир жерде.</em>",
  heroText:"Идиш-аяк, техника, казан, наборлор жана күнүмдүк керектүү товарлар.",heroButton:"Каталогду көрүү",
  delivery:"Жеткирүү бар",waOrder:"WhatsApp заказ",payment:"Ыңгайлуу төлөм",selectedSections:"ТАНДАЛГАН БӨЛҮМДӨР",
  catalog:"Каталог",viewAll:"Баарын көрүү →",newProducts:"ТОВАРЛАР",liked:"Сизге жаккан нерселер",
  searchPlaceholder:"Товар издеңиз...",notFound:"Товар табылган жок",tryAnother:"Башка ат менен издеп көрүңүз.",
  footerText:"Үйгө керектүүнүн баары — бир жерде.",addresses:"Даректер",contacts:"Байланыш",
  dailyHours:"Күн сайын 09:00–21:00",home:"Башкы",search:"Издөө",cart:"Корзина",total:"Жалпы:",
  waOrderButton:"WhatsApp аркылуу заказ",addCart:"Себетке кошуу",emptyCart:"Корзина бош",
  chooseProduct:"Товар тандап баштаңыз.",item:"товар",items:"товар",
  qty:"Саны",price:"Баасы",subtotal:"Жалпы",deliveryEyebrow:"Жеткирүү",
  deliveryTitle:"Сизге ыңгайлуу жеткирүү",deliveryYandex:"Бишкек — Яндекс Go",
  deliveryYldam:"Региондор — Ылдам Экспресс",deliveryPaid:"Төлөмдүү жеткирүү",
  checkoutDeliveryTitle:"Жеткирүү түрүн тандаңыз",checkoutBishkek:"Бишкек — Яндекс Go",
  checkoutRegions:"Региондор — Ылдам Экспресс",deliveryAddressPlaceholder:"Жеткирүү дареги",
  deliveryPhonePlaceholder:"Телефон номери"
 },
 ru:{
  heroEyebrow:"БИШКЕК • ЕЖЕДНЕВНО 09:00–21:00",heroTitle:"Всё необходимое<br><em>для вашего дома.</em>",
  heroText:"Посуда, бытовая техника, казаны, наборы и товары для дома.",heroButton:"Смотреть каталог",
  delivery:"Есть доставка",waOrder:"Заказ в WhatsApp",payment:"Удобная оплата",selectedSections:"РАЗДЕЛЫ КАТАЛОГА",
  catalog:"Каталог",viewAll:"Смотреть всё →",newProducts:"ТОВАРЫ",liked:"Выберите нужный товар",
  searchPlaceholder:"Поиск товара...",notFound:"Товар не найден",tryAnother:"Попробуйте изменить запрос.",
  footerText:"Всё необходимое для дома — в одном месте.",addresses:"Адреса",contacts:"Контакты",
  dailyHours:"Ежедневно 09:00–21:00",home:"Главная",search:"Поиск",cart:"Корзина",total:"Итого:",
  waOrderButton:"Заказать в WhatsApp",addCart:"В корзину",emptyCart:"Корзина пуста",
  chooseProduct:"Выберите товар, чтобы начать.",item:"товар",items:"товаров",
  qty:"Количество",price:"Цена",subtotal:"Сумма",deliveryEyebrow:"Доставка",
  deliveryTitle:"Удобная доставка для вас",deliveryYandex:"Бишкек — Яндекс Go",
  deliveryYldam:"Регионы — Ылдам Экспресс",deliveryPaid:"Доставка платная",
  checkoutDeliveryTitle:"Выберите способ доставки",checkoutBishkek:"Бишкек — Яндекс Go",
  checkoutRegions:"Регионы — Ылдам Экспресс",deliveryAddressPlaceholder:"Адрес доставки",
  deliveryPhonePlaceholder:"Номер телефона"
 }
};
const tr=k=>T[lang]?.[k]||T.ky[k]||k;
const field=(p,k,kr=k+"Ru")=>lang==="ru"?(p[kr]??p[k]??""):(p[k]??"");
const catName=c=>lang==="ru"?(c.nameRu||c.name):(c.name||"");

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function escAttr(s){return String(s??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}

function applyLanguage(){
 document.documentElement.lang=lang;
 document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
 document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));
 document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));
 $("#langSwitch").textContent=lang==="ky"?"KG / RU":"RU / KG";
 renderCats();renderSubcats();renderProducts();renderCart();
}

function renderCats(){
 const allBtn=$("#allBtn");
 allBtn.classList.toggle("active",activeCat==="all");
 $("#categories").innerHTML=categories.map(c=>`<button class="cat ${activeCat===c.id?"active":""}" data-cat="${escAttr(c.id)}"><span class="ico">${c.icon||"🛍️"}</span><b>${esc(catName(c))}</b><span style="margin-left:auto;color:#9aa4b2">→</span></button>`).join("");
 document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{
   activeCat=b.dataset.cat;activeSub="all";renderCats();renderSubcats();renderProducts();
 });
}
function renderSubcats(){
 const cat=categories.find(c=>c.id===activeCat);
 if(!cat){$("#subcategories").innerHTML="";return}
 $("#subcategories").innerHTML=[`<button class="subcat ${activeSub==="all"?"active":""}" data-sub="all">${lang==="ru"?"Все":"Баары"}</button>`,
 ...(cat.subcategories||[]).map((s,i)=>`<button class="subcat ${activeSub===String(i)?"active":""}" data-sub="${i}">${esc(s)}</button>`)]
 .join("");
 document.querySelectorAll(".subcat").forEach(b=>b.onclick=()=>{activeSub=b.dataset.sub;renderSubcats();renderProducts()});
}
function renderProducts(){
 const q=$("#searchInput").value.trim().toLowerCase();
 const cat=categories.find(c=>c.id===activeCat);
 const subText=activeSub!=="all"&&cat?.subcategories?.[Number(activeSub)];
 const list=products.filter(p=>{
   const hay=[p.name,p.nameRu,p.description,p.descriptionRu,p.categoryName,p.categoryNameRu,p.subcategoryName,p.subcategoryNameRu].filter(Boolean).join(" ").toLowerCase();
   const subOK=activeSub==="all"||p.subcategoryName===subText||p.subcategoryNameRu===subText;
   return (activeCat==="all"||p.category===activeCat)&&subOK&&hay.includes(q);
 });
 $("#resultCount").textContent=list.length?`${list.length} ${list.length===1?tr("item"):tr("items")}`:"";
 $("#empty").hidden=!!list.length;
 $("#products").innerHTML=list.map(p=>`<article class="product">
   <div class="photo"><img src="${escAttr(p.image||"assets/products/placeholder.svg")}" alt="${esc(field(p,"name","nameRu"))}" loading="lazy" onerror="this.onerror=null;this.src='assets/products/placeholder.svg'"></div>
   <div class="pbody"><div class="pname">${esc(field(p,"name","nameRu"))}</div>
   <div class="desc">${esc(field(p,"description","descriptionRu")||(lang==="ru"?"Качественный товар":"Сапаттуу товар"))}</div>
   <div class="price">${money(Number(p.price)||0)}</div>
   <button class="buy" onclick="addToCart('${escAttr(p.id)}')">🛒 ${tr("addCart")}</button></div>
 </article>`).join("");
}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;const old=cart.find(x=>x.id===id);old?old.qty++:cart.push({id,qty:1});saveCart();renderCart();openCart()}
function saveCart(){localStorage.setItem("moyCart",JSON.stringify(cart))}
function renderCart(){
 const rows=cart.map(x=>{const p=products.find(y=>y.id===x.id);if(!p)return"";
 return `<div class="cart-row"><img src="${escAttr(p.image||"assets/products/placeholder.svg")}" onerror="this.src='assets/products/placeholder.svg'">
 <div><b>${esc(field(p,"name","nameRu"))}</b><small>${money(Number(p.price)||0)}</small>
 <div class="qty"><button onclick="changeQty('${escAttr(p.id)}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${escAttr(p.id)}',1)">+</button></div></div>
 <strong>${money((Number(p.price)||0)*x.qty)}</strong></div>`}).join("");
 $("#cartItems").innerHTML=rows||`<div class="empty"><div>🛒</div><h3>${tr("emptyCart")}</h3><p>${tr("chooseProduct")}</p></div>`;
 const count=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>{const p=products.find(y=>y.id===x.id);return s+(p?(Number(p.price)||0)*x.qty:0)},0);
 $("#cartCount").textContent=count;$("#mobileCartCount").textContent=count;$("#cartTotal").textContent=money(total);
}
function changeQty(id,n){const x=cart.find(y=>y.id===id);if(!x)return;x.qty+=n;if(x.qty<=0)cart=cart.filter(y=>y.id!==id);saveCart();renderCart()}
function openCart(){$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("open")}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("open")}
function order(){
 if(!cart.length)return;
 let total=0,msg=lang==="ru"?"Здравствуйте! Хочу оформить заказ в Мой Маркет:":"Салам! Мой Маркеттен заказ бергим келет:";
 cart.forEach(x=>{const p=products.find(y=>y.id===x.id);if(!p)return;const sub=(Number(p.price)||0)*x.qty;total+=sub;
   msg+=`\n\n• ${field(p,"name","nameRu")}\n${tr("qty")}: ${x.qty}\n${tr("price")}: ${Number(p.price)||0} сом\n${tr("subtotal")}: ${sub} сом`;
   if(p.image)msg+=`\n${lang==="ru"?"Фото":"Сүрөт"}: ${new URL(p.image,location.href).href}`;
 });
 const d=document.querySelector('input[name="deliveryChoice"]:checked')?.value||"yandex";
 const dLabel=d==="yldam"?(lang==="ru"?"Регионы — Ылдам Экспресс (платная доставка)":"Региондор — Ылдам Экспресс (төлөмдүү жеткирүү)"):(lang==="ru"?"Бишкек — Яндекс Go (платная доставка)":"Бишкек — Яндекс Go (төлөмдүү жеткирүү)");
 const address=$("#deliveryAddress").value.trim(),phone=$("#deliveryPhone").value.trim();
 msg+=`\n\n🚚 ${lang==="ru"?"Доставка":"Жеткирүү"}: ${dLabel}`;
 if(address)msg+=`\n📍 ${lang==="ru"?"Адрес":"Дарек"}: ${address}`;
 if(phone)msg+=`\n📞 Телефон: ${phone}`;
 msg+=`\n\n${tr("total")}: ${total} сом`;
 location.href=`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

$("#langSwitch").onclick=()=>{lang=lang==="ky"?"ru":"ky";localStorage.setItem("moyLang",lang);applyLanguage()};
$("#searchBtn").onclick=()=>{document.getElementById("searchbox").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#searchInput").focus(),350)};
$("#mobileSearch").onclick=()=>$("#searchBtn").click();
$("#cartBtn").onclick=openCart;$("#mobileCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#backdrop").onclick=closeCart;$("#orderBtn").onclick=order;
$("#heroCatalog").onclick=()=>$("#catalog").scrollIntoView({behavior:"smooth"});
$("#mobileCatalog").onclick=()=>$("#catalog").scrollIntoView({behavior:"smooth"});
$("#mobileHome").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
$("#allBtn").onclick=()=>{activeCat="all";activeSub="all";renderCats();renderSubcats();renderProducts()};
$("#searchInput").oninput=renderProducts;$("#clearSearch").onclick=()=>{$("#searchInput").value="";renderProducts()};

async function load(){
 try{
   const base=location.href.substring(0,location.href.lastIndexOf("/")+1);
   const [pr,cr]=await Promise.all([
     fetch(base+"products.json?v=2.4",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("products");return r.json()}),
     fetch(base+"categories.json?v=2.4",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("categories");return r.json()})
   ]);
   products=Array.isArray(pr)?pr:[];categories=Array.isArray(cr)?cr:[];
 }catch(e){
   console.error("Мой Маркет load error:",e);
   products=[];categories=[];
 }
 applyLanguage();
}
load();
