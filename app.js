const WA="996507668866";
let products=[], categories=[], cart=JSON.parse(localStorage.getItem("moyCart")||"[]"), activeCat="all";
let lang=localStorage.getItem("moyLang")||"ky";
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("ru-RU").format(n)+" сом";
const T={
ky:{heroEyebrow:"БИШКЕК • КҮН САЙЫН 09:00–21:00",heroTitle:"Үйүңүзгө керектүүнүн<br><em>баары бир жерде.</em>",heroText:"Идиш-аяк, техника, казан, наборлор жана күнүмдүк керектүү товарлар.",heroButton:"Каталогду көрүү",delivery:"Жеткирүү бар",deliveryYandex:"Жеткирүү Яндекс Go (төлөмдүү)",deliveryYandexRu:"Доставка Яндекс Go (платный)",deliveryRegions:"Региондорго жеткирүү Ылдам Экспресс (төлөмдүү)",deliveryRegionsRu:"Доставка регионам Ылдам Экспресс (платный)",waOrder:"WhatsApp заказ",payment:"Ыңгайлуу төлөм",selectedSections:"ТАНДАЛГАН БӨЛҮМДӨР",catalog:"Каталог",viewAll:"Баарын көрүү",newProducts:"ЖАҢЫ ТОВАРЛАР",liked:"Сизге жаккан нерселер",searchPlaceholder:"Товар издеңиз...",notFound:"Товар табылган жок",tryAnother:"Башка ат менен издеп көрүңүз.",footerText:"Үйгө керектүүнүн баары — бир жерде.",addresses:"Даректер",contacts:"Байланыш",dailyHours:"Күн сайын 09:00–21:00",home:"Башкы",search:"Издөө",cart:"Корзина",total:"Жалпы:",waOrderButton:"WhatsApp аркылуу заказ",addCart:"Себетке кошуу",emptyCart:"Корзина бош",chooseProduct:"Товар тандап баштаңыз.",item:"товар",items:"товар",qty:"Саны",price:"Баасы",subtotal:"Жалпы"},
ru:{heroEyebrow:"БИШКЕК • ЕЖЕДНЕВНО 09:00–21:00",heroTitle:"Всё необходимое<br><em>для вашего дома.</em>",heroText:"Посуда, бытовая техника, казаны, наборы и товары для дома.",heroButton:"Смотреть каталог",delivery:"Есть доставка",deliveryYandex:"Доставка Яндекс Go (платный)",deliveryYandexRu:"Доставка Яндекс Go (платный)",deliveryRegions:"Доставка регионам Ылдам Экспресс (платный)",deliveryRegionsRu:"Доставка регионам Ылдам Экспресс (платный)",waOrder:"Заказ в WhatsApp",payment:"Удобная оплата",selectedSections:"ПОПУЛЯРНЫЕ РАЗДЕЛЫ",catalog:"Каталог",viewAll:"Смотреть всё",newProducts:"НОВЫЕ ТОВАРЫ",liked:"ВЫБЕРИТЕ ТОВАР",searchPlaceholder:"Поиск товара...",notFound:"Товар не найден",tryAnother:"Попробуйте поискать по-другому.",footerText:"Всё необходимое для дома — в одном месте.",addresses:"Адреса",contacts:"Контакты",dailyHours:"Ежедневно 09:00–21:00",home:"Главная",search:"Поиск",cart:"Корзина",total:"Итого:",waOrderButton:"Заказать в WhatsApp",addCart:"В корзину",emptyCart:"Корзина пуста",chooseProduct:"Выберите товар, чтобы начать.",item:"товар",items:"товаров",qty:"Количество",price:"Цена",subtotal:"Сумма"}
}

  deliveryEyebrow:"Доставка",
  deliveryTitle:"Удобная доставка для вас",
  deliveryYandex:"Бишкек — Яндекс Go",
  deliveryYldam:"Регионы — Ылдам Экспресс",
  deliveryPaid:"Доставка платная",
  checkoutDeliveryTitle:"Выберите способ доставки",
  checkoutBishkek:"Бишкек — Яндекс Go",
  checkoutRegions:"Регионы — Ылдам Экспресс",
  deliveryAddressPlaceholder:"Адрес доставки",
  deliveryPhonePlaceholder:"Ваш номер телефона",;
function tr(k){return T[lang]?.[k]||T.ky[k]||k}
function field(p,base,ruBase=base+"Ru"){return lang==="ru"?(p[ruBase]??p[base]??""):(p[base]??"")}
function catName(c){return lang==="ru"?(c.nameRu||c.name):(c.name||"")}
function applyLanguage(){
 document.documentElement.lang=lang;
 document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
 document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));
 document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));
 $("#langSwitch").textContent=lang==="ky"?"KG / RU":"RU / KG";
 $("#searchBtn").setAttribute("aria-label",tr("search"));$("#cartBtn").setAttribute("aria-label",tr("cart"));
 renderCats();renderProducts();renderCart();
}
async function load(){
 try{[products,categories]=await Promise.all([fetch("products.json",{cache:"no-store"}).then(r=>r.json()),fetch("categories.json",{cache:"no-store"}).then(r=>r.json())])}
 catch(e){products=[];categories=[]}
 applyLanguage();
}
function renderCats(){
 $("#categories").innerHTML=categories.map(c=>`<button class="cat ${activeCat===c.id?"active":""}" data-cat="${c.id}"><span class="ico">${c.icon||"🛍️"}</span><b>${esc(catName(c))}</b><span style="color:#9aa4b2">→</span></button>`).join("");
 document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;renderCats();renderProducts();document.getElementById("catalog").scrollIntoView({behavior:"smooth"})});
}
function renderProducts(){
 const q=$("#searchInput").value.trim().toLowerCase();
 const list=products.filter(p=>{const hay=[p.name,p.nameRu,p.description,p.descriptionRu,p.categoryName,p.categoryNameRu,p.subcategoryName,p.subcategoryNameRu].filter(Boolean).join(" ").toLowerCase();return(activeCat==="all"||p.category===activeCat)&&hay.includes(q)});
 $("#resultCount").textContent=list.length?`${list.length} ${list.length===1?tr("item"):tr("items")}`:"";$("#empty").hidden=!!list.length;
 $("#products").innerHTML=list.map(p=>`<article class="product"><div class="photo"><img src="${p.image||"assets/products/placeholder.svg"}" alt="${esc(field(p,"name","nameRu"))}" loading="lazy"></div><div class="pbody"><div class="pname">${esc(field(p,"name","nameRu"))}</div><div class="desc">${esc(field(p,"description","descriptionRu")||(lang==="ru"?"Качественный товар":"Сапаттуу товар"))}</div><div class="price">${money(Number(p.price)||0)}</div><button class="buy" onclick="addToCart('${escAttr(p.id)}')">🛒 ${tr("addCart")}</button></div></article>`).join("");
}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;const old=cart.find(x=>x.id===id);old?old.qty++:cart.push({id,qty:1});saveCart();renderCart();openCart()}
function saveCart(){localStorage.setItem("moyCart",JSON.stringify(cart))}
function renderCart(){
 const rows=cart.map(x=>{const p=products.find(y=>y.id===x.id);return p?`<div class="cart-row"><img src="${p.image||"assets/products/placeholder.svg"}"><div><b>${esc(field(p,"name","nameRu"))}</b><small>${money(Number(p.price)||0)}</small><div class="qty"><button onclick="changeQty('${escAttr(p.id)}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${escAttr(p.id)}',1)">+</button></div></div><strong>${money((Number(p.price)||0)*x.qty)}</strong></div>`:""}).join("");
 $("#cartItems").innerHTML=rows||`<div class="empty"><div>🛒</div><h3>${tr("emptyCart")}</h3><p>${tr("chooseProduct")}</p></div>`;
 const count=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>{const p=products.find(y=>y.id===x.id);return s+(p?(Number(p.price)||0)*x.qty:0)},0);
 $("#cartCount").textContent=count;$("#mobileCartCount").textContent=count;$("#cartTotal").textContent=money(total);
}
function changeQty(id,n){const x=cart.find(y=>y.id===id);if(!x)return;x.qty+=n;if(x.qty<=0)cart=cart.filter(y=>y.id!==id);saveCart();renderCart()}
function openCart(){$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("open")}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("open")}
function order(){
 if(!cart.length)return;
 let total=0,msg=encodeURIComponent(lang==="ru"?"Здравствуйте! Хочу оформить заказ в Мой Маркет:":"Салам! Мой Маркеттен заказ бергим келет:")+"%0A%0A";
 cart.forEach(x=>{const p=products.find(y=>y.id===x.id);if(p){const sub=(Number(p.price)||0)*x.qty;total+=sub;const imageUrl=p.image?new URL(p.image,location.href).href:"";msg+=`• ${encodeURIComponent(field(p,"name","nameRu"))}%0A`;msg+=`${encodeURIComponent(tr("qty"))}: ${x.qty}%0A`;msg+=`${encodeURIComponent(tr("price"))}: ${Number(p.price)||0} сом%0A`;msg+=`${encodeURIComponent(tr("subtotal"))}: ${sub} сом%0A`;if(imageUrl)msg+=`${encodeURIComponent(lang==="ru"?"Фото":"Сүрөт")}: ${encodeURIComponent(imageUrl)}%0A`;msg+="%0A"}});msg+=`${encodeURIComponent(tr("total"))}: ${total} сом`;location.href=`https://wa.me/${WA}?text=${msg}`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function escAttr(s){return String(s??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
$("#langSwitch").onclick=()=>{lang=lang==="ky"?"ru":"ky";localStorage.setItem("moyLang",lang);applyLanguage()};
$("#searchBtn").onclick=()=>{document.getElementById("searchbox").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#searchInput").focus(),400)};
$("#mobileSearch").onclick=()=>$("#searchBtn").click();
$("#cartBtn").onclick=openCart;$("#mobileCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#backdrop").onclick=closeCart;$("#orderBtn").onclick=order;
$("#allBtn").onclick=()=>{activeCat="all";renderCats();renderProducts()};
$("#searchInput").oninput=renderProducts;$("#clearSearch").onclick=()=>{$("#searchInput").value="";renderProducts()};
load();
