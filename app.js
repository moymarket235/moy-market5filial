const WA="996507668866";
const FALLBACK_CATEGORIES=[{"id": "dishes", "name": "Идиш-аяк", "nameRu": "Посуда", "icon": "🍽️", "subcategories": ["Пиалалар", "Кеселер", "Тарелкалар", "Салатницалар", "Пловницалар", "Фруктовницалар", "Нарезкалар", "Сухофруктовницалар", "Конфетницалар", "Хлебницалар", "Кружкалар"]}, {"id": "appliances", "name": "Бытовая техника", "nameRu": "Бытовая техника", "icon": "⚡", "subcategories": ["Микроволновкалар", "Блендерлер", "Үтүктөр", "Электр чайниктер", "Соковыжималкалар", "Эт туурагычтар", "Фендер", "Миксерлер", "Тостерлер", "Пылесостор", "Кофемолкалар", "Кофемашиналар"]}, {"id": "cookware", "name": "Казан & Ашкана", "nameRu": "Казаны и кухня", "icon": "🍳", "subcategories": ["Казандар", "Сковородалар", "Блинницалар", "Яичницалар", "Ковштор"]}, {"id": "sets", "name": "Наборлор", "nameRu": "Наборы", "icon": "🎁", "subcategories": ["Набор кружкалар", "Набор бокалдар", "Набор варенницалар", "Набор персон", "Ашкана наборлору"]}, {"id": "sale", "name": "Акциялар", "nameRu": "Акции", "icon": "🔥", "subcategories": ["Акциядагы товарлар"]}];
const FALLBACK_PRODUCTS=[{"id":"midea-microwave-5800","name":"Midea — Микроволновая печь","nameRu":"Midea — Микроволновая печь","price":5800,"category":"appliances","categoryName":"Бытовая техника","categoryNameRu":"Бытовая техника","subcategory":"microwave","subcategoryName":"Микроволновкалар","subcategoryNameRu":"Микроволновые печи","description":"Midea микроволновкасы. 700 Вт, көлөмү 20 л.","descriptionRu":"Микроволновая печь Midea. 700 Вт, объём 20 л.","image":"assets/products/Midea-microwave-5800.png"},{"id":"technomir-microwave-5800","name":"ТЕХНОМИР — Микроволновая печь","nameRu":"ТЕХНОМИР — Микроволновая печь","price":5800,"category":"appliances","categoryName":"Бытовая техника","categoryNameRu":"Бытовая техника","subcategory":"microwave","subcategoryName":"Микроволновкалар","subcategoryNameRu":"Микроволновые печи","description":"ТЕХНОМИР микроволновкасы. 700 Вт, көлөмү 20 л.","descriptionRu":"Микроволновая печь ТЕХНОМИР. 700 Вт, объём 20 л.","image":"assets/products/TEHNOMIR-microwave-5800.png"},{"id":"vicalina-vl-725x-8700","name":"VICALINA VL-725X — Пылесос","nameRu":"VICALINA VL-725X — Пылесос","price":8700,"category":"appliances","categoryName":"Бытовая техника","categoryNameRu":"Бытовая техника","subcategory":"vacuum","subcategoryName":"Пылесостор","subcategoryNameRu":"Пылесосы","description":"VICALINA VL-725X. Кургак тазалоо, 2400 Вт, 5 м шнур, циклондук фильтр, турборежим жана соруу күчүн жөндөө.","descriptionRu":"VICALINA VL-725X. Сухая уборка, 2400 Вт, кабель 5 м, циклонный фильтр, турборежим и регулировка мощности.","characteristics":["Модель: VL-725X","Кубаттуулугу: 2400 Вт","Тазалоо: кургак","Шнур: 5 м","Циклондук фильтр","Турборежим","Соруу күчүн жөндөө"],"characteristicsRu":["Модель: VL-725X","Мощность: 2400 Вт","Уборка: сухая","Шнур: 5 м","Циклонный фильтр","Турборежим","Регулировка мощности"],"image":"assets/products/vicalina-vl-725x-8700.png"},{"id":"vicalina-2000w-8700","name":"VICALINA — Пылесос 2000W","nameRu":"VICALINA — Пылесос 2000W","price":8700,"category":"appliances","categoryName":"Бытовая техника","categoryNameRu":"Бытовая техника","subcategory":"vacuum","subcategoryName":"Пылесостор","subcategoryNameRu":"Пылесосы","description":"VICALINA 2000W. Контейнердик чаң чогултуу, Turbo Cyclone System, шланг жана телескоптук түтүк.","descriptionRu":"VICALINA 2000W. Контейнерный пылесборник, Turbo Cyclone System, шланг и телескопическая труба.","characteristics":["Бренд: VICALINA","Кубаттуулугу: 2000 Вт","Чаң чогултуу: контейнер","Turbo Cyclone System","Шланг жана телескоптук түтүк","Негизги пол насадкасы"],"characteristicsRu":["Бренд: VICALINA","Мощность: 2000 Вт","Пылесборник: контейнер","Turbo Cyclone System","Шланг и телескопическая труба","Основная насадка для пола"],"image":"assets/products/vicalina-2000w-8700.png"},{"id":"haley-hy-29h-1900","name":"HALEY HY-29H — Блендер","nameRu":"HALEY HY-29H — Блендер","price":1900,"category":"appliances","categoryName":"Бытовая техника","categoryNameRu":"Бытовая техника","subcategory":"blender","subcategoryName":"Блендерлер","subcategoryNameRu":"Блендеры","description":"HALEY HY-29H. Күнүмдүк ашкана колдонууга ылайыктуу блендер, 1000 Вт, 2 ылдамдык жана 2-in-1 түзүлүш.","descriptionRu":"HALEY HY-29H. Блендер для кухни: 1000 Вт, 2 скорости и конструкция 2-в-1.","characteristics":["Модель: HY-29H","Кубаттуулугу: 1000 Вт","2 ылдамдык","2-in-1 түзүлүш","Өлчөөчү стакан капкагы менен","Дат баспас болоттон жасалган бычак","Төмөн ызы-чуудагы мотор","Кошумча майдалагыч насадка"],"characteristicsRu":["Модель: HY-29H","Мощность: 1000 Вт","2 скорости","Конструкция 2-в-1","Мерный стакан с крышкой","Нож из нержавеющей стали","Мотор с низким уровнем шума","Дополнительная насадка-измельчитель"],"image":"assets/products/haley-hy-29h-1900.png"},{"id":"haley-hy-9918-5600","name":"HALEY HY-9918 — Пылесос","nameRu":"HALEY HY-9918 — Пылесос","price":5600,"category":"appliances","categoryName":"Бытовая техника","categoryNameRu":"Бытовая техника","subcategory":"vacuum","subcategoryName":"Пылесостор","subcategoryNameRu":"Пылесосы","description":"HALEY HY-9918. Күчтүү кургак тазалоочу пылесос, соруу күчүн жөндөө жана HEPA фильтрациясы менен.","descriptionRu":"HALEY HY-9918. Мощный пылесос для сухой уборки с регулировкой мощности всасывания и HEPA-фильтрацией.","characteristics":["Модель: HY-9918","Кубаттуулугу: 3000 Вт","Чаң чогулткуч: 4,5 л","Соруу күчүн жөндөө","HEPA фильтрация","Шнур: 5 м","Кургак тазалоо","Насадкалар комплектте"],"characteristicsRu":["Модель: HY-9918","Мощность: 3000 Вт","Пылесборник: 4,5 л","Регулировка мощности всасывания","HEPA-фильтрация","Шнур: 5 м","Сухая уборка","Насадки в комплекте"],"image":"assets/products/haley-hy-9918-5600.png"}]
let products=[],categories=[],cart=JSON.parse(localStorage.getItem("moyCart")||"[]");
let activeCat="all",activeSub="all",lang=localStorage.getItem("moyLang")||"ky";
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("ru-RU").format(Number(n)||0)+" сом";
const T={
ky:{heroEyebrow:"БИШКЕК • КҮН САЙЫН 09:00–21:00",heroTitle:"Үйүңүзгө керектүүнүн<br><em>баары бир жерде.</em>",heroText:"Идиш-аяк, техника, казан, наборлор жана күнүмдүк керектүү товарлар.",heroButton:"Каталогду көрүү",delivery:"Жеткирүү бар",waOrder:"WhatsApp заказ",payment:"Ыңгайлуу төлөм",selectedSections:"ТАНДАЛГАН БӨЛҮМДӨР",catalog:"Каталог",viewAll:"Баарын көрүү →",newProducts:"ТОВАРЛАР",liked:"Сизге жаккан нерселер",searchPlaceholder:"Товар издеңиз...",notFound:"Товар табылган жок",tryAnother:"Башка ат менен издеп көрүңүз.",characteristics:"Характеристикалары:",footerText:"Үйгө керектүүнүн баары — бир жерде.",robotTitle:"Мой Маркет жардамчысы",robotOnline:"Онлайн • жардам берүүгө даяр",robotGreeting:"Салам! 👋 Сизге кандай жардам керек?",robotSearch:"Товар табуу",robotCart:"Корзинамды ачуу",robotDelivery:"Жеткирүү тууралуу",robotSale:"Акцияларды көрүү",robotOrder:"Заказ берүүгө жардам",robotLanguage:"Тилди өзгөртүү",robotDeliveryText:"🚚 ЖЕТКИРҮҮ ТУУРАЛУУ ТОЛУК МААЛЫМАТ\n\n🏙 Бишкек: Яндекс Go аркылуу — 2 сааттын ичинде.\n📦 Региондор: Ылдам Экспресс аркылуу — 1–2 күндүн ичинде.\n💳 Жеткирүү төлөмдүү, баасы тандалган кызматка жараша эсептелет.\n🕘 Дүкөн: күн сайын 09:00–21:00.\n📍 Филиалдар: Жибек-Жолу 235; Жибек-Жолу 227; Ауэзова 17; Бейшеналиева 20; Токтогул 259/10.\n📞 WhatsApp: +996 507 66 88 66.\n\nДаректи жана телефон номериңизди корзинадан көрсөтүп, заказды WhatsApp аркылуу жөнөтсөңүз болот.",robotSaleText:"🔥 Акциядагы товарларды көрүү үчүн каталогду ачып берем.",robotOrderText:"💬 Товарларды корзинага чогултуп бүткөн соң WhatsApp аркылуу заказ жөнөтө аласыз.",robotSearchText:"🔎 Издөө талаасын ачтым. Каалаган товарыңыздын атын жазыңыз.",robotCartText:"🛒 Корзинаңызды ачтым. Товарлардын санын, баасын жана жалпы суммасын көрө аласыз.",robotLanguageText:"🌐 Тилди өзгөртүү үчүн KG / RU баскычын колдонуңуз.",robotVoiceOff:"🔇 Үн жеткиликтүү эмес.",robotCloseText:"Чатты жабуу",backToShop:"Артка",robotInputPlaceholder:"Сурооңузду жазыңыз...",robotAsk:"Жооп алуу",addresses:"Даректер",contacts:"Байланыш",dailyHours:"Күн сайын 09:00–21:00",home:"Башкы",search:"Издөө",cart:"Корзина",total:"Жалпы:",waOrderButton:"WhatsApp аркылуу заказ",addCart:"Себетке кошуу",emptyCart:"Корзина бош",chooseProduct:"Товар тандап баштаңыз.",item:"товар",items:"товар",deliveryEyebrow:"Жеткирүү",deliveryTitle:"Сизге ыңгайлуу жеткирүү",deliveryYandex:"Бишкек — Яндекс Go • 2 сааттын ичинде",deliveryYldam:"Региондор — Ылдам Экспресс • 1–2 күн",deliveryPaid:"Төлөмдүү жеткирүү",checkoutDeliveryTitle:"Жеткирүү түрүн тандаңыз",checkoutBishkek:"Бишкек — Яндекс Go",checkoutRegions:"Региондор — Ылдам Экспресс",deliveryAddressPlaceholder:"Жеткирүү дареги",deliveryPhonePlaceholder:"Телефон номери",categoryAll:"Баары",qty:"Саны",price:"Баасы",subtotal:"Жалпы",addedToCart:"Корзинага кошулду"},
ru:{heroEyebrow:"БИШКЕК • ЕЖЕДНЕВНО 09:00–21:00",heroTitle:"Всё необходимое<br><em>для вашего дома.</em>",heroText:"Посуда, бытовая техника, казаны, наборы и товары для дома.",heroButton:"Смотреть каталог",delivery:"Есть доставка",waOrder:"Заказ в WhatsApp",payment:"Удобная оплата",selectedSections:"РАЗДЕЛЫ КАТАЛОГА",catalog:"Каталог",viewAll:"Смотреть всё →",newProducts:"ТОВАРЫ",liked:"Выберите нужный товар",searchPlaceholder:"Поиск товара...",notFound:"Товар не найден",tryAnother:"Попробуйте изменить запрос.",characteristics:"Характеристики:",footerText:"Всё необходимое для дома — в одном месте.",robotTitle:"Помощник Мой Маркет",robotOnline:"Онлайн • готов помочь",robotGreeting:"Здравствуйте! 👋 Чем могу помочь?",robotSearch:"Найти товар",robotCart:"Открыть корзину",robotDelivery:"О доставке",robotSale:"Посмотреть акции",robotOrder:"Помощь с заказом",robotLanguage:"Сменить язык",robotDeliveryText:"🚚 ПОЛНАЯ ИНФОРМАЦИЯ О ДОСТАВКЕ\n\n🏙 Бишкек: Яндекс Go — в течение 2 часов.\n📦 Регионы: Ылдам Экспресс — в течение 1–2 дней.\n💳 Доставка платная, стоимость зависит от выбранной службы.\n🕘 Магазин работает ежедневно 09:00–21:00.\n📍 Филиалы: Жибек-Жолу 235; Жибек-Жолу 227; Ауэзова 17; Бейшеналиева 20; Токтогул 259/10.\n📞 WhatsApp: +996 507 66 88 66.\n\nУкажите адрес и телефон в корзине, затем отправьте заказ в WhatsApp.",robotSaleText:"🔥 Открываю каталог, чтобы вы могли посмотреть товары и акции.",robotOrderText:"💬 Добавьте товары в корзину, затем отправьте заказ в WhatsApp.",robotSearchText:"🔎 Открыл поиск. Напишите название нужного товара.",robotCartText:"🛒 Открыл корзину. Здесь видны товары, количество, цены и итоговая сумма.",robotLanguageText:"🌐 Язык меняется кнопкой KG / RU в верхней части сайта.",robotVoiceOff:"🔇 Голосовой режим недоступен.",robotCloseText:"Закрыть чат",backToShop:"Назад",robotInputPlaceholder:"Напишите свой вопрос...",robotAsk:"Получить ответ",addresses:"Адреса",contacts:"Контакты",dailyHours:"Ежедневно 09:00–21:00",home:"Главная",search:"Поиск",cart:"Корзина",total:"Итого:",waOrderButton:"Заказать в WhatsApp",addCart:"В корзину",emptyCart:"Корзина пуста",chooseProduct:"Выберите товар, чтобы начать.",item:"товар",items:"товаров",deliveryEyebrow:"Доставка",deliveryTitle:"Удобная доставка для вас",deliveryYandex:"Бишкек — Яндекс Go • до 2 часов",deliveryYldam:"Регионы — Ылдам Экспресс • 1–2 дня",deliveryPaid:"Доставка платная",checkoutDeliveryTitle:"Выберите способ доставки",checkoutBishkek:"Бишкек — Яндекс Go",checkoutRegions:"Регионы — Ылдам Экспресс",deliveryAddressPlaceholder:"Адрес доставки",deliveryPhonePlaceholder:"Номер телефона",categoryAll:"Все",qty:"Количество",price:"Цена",subtotal:"Сумма",addedToCart:"Товар добавлен в корзину"}};
const tr=k=>T[lang][k]||k;
const nameOf=p=>lang==="ru"?(p.nameRu||p.name):(p.name||"");
const descOf=p=>lang==="ru"?(p.descriptionRu||p.description):(p.description||"");
const catName=c=>lang==="ru"?(c.nameRu||c.name):(c.name||"");
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function applyText(){document.querySelectorAll("[data-i18n]").forEach(e=>e.textContent=tr(e.dataset.i18n));document.querySelectorAll("[data-i18n-html]").forEach(e=>e.innerHTML=tr(e.dataset.i18nHtml));document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>e.placeholder=tr(e.dataset.i18nPlaceholder));document.documentElement.lang=lang;$("#langSwitch").textContent=lang==="ky"?"KG / RU":"RU / KG"}
function renderCats(){
 const wrap=$("#categories");
 wrap.innerHTML=`<button class="cat ${activeCat==="all"?"active":""}" data-cat="all"><span class="ico">🛍️</span><b>${tr("categoryAll")}</b><span class="arrow">→</span></button>`+
 categories.map(c=>`<button class="cat ${activeCat===c.id?"active":""}" data-cat="${esc(c.id)}"><span class="ico">${c.icon||"🛍️"}</span><b>${esc(catName(c))}</b><span class="arrow">→</span></button>`).join("");
 wrap.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;activeSub="all";renderCats();renderSubcats();renderProducts()});
}
function renderSubcats(){
 const box=$("#subcategories"); const cat=categories.find(c=>c.id===activeCat);
 if(!cat){box.innerHTML="";return}
 box.innerHTML=`<button class="subcat active" data-sub="all">${tr("categoryAll")}</button>`+(cat.subcategories||[]).map((s,i)=>`<button class="subcat" data-sub="${i}">${esc(lang==="ru"?({"Микроволновкалар":"Микроволновые печи","Блендерлер":"Блендеры","Пылесостор":"Пылесосы"}[s]||s):s)}</button>`).join("");
 box.querySelectorAll(".subcat").forEach(b=>b.onclick=()=>{activeSub=b.dataset.sub;box.querySelectorAll(".subcat").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts()});
}
function renderProducts(){
 const q=($("#searchInput")?.value||"").trim().toLowerCase();
 const cat=categories.find(c=>c.id===activeCat);
 const sub=activeSub!=="all"?cat?.subcategories?.[Number(activeSub)]:null;
 const list=products.filter(p=>{
  const hay=[p.name,p.nameRu,p.description,p.descriptionRu,p.categoryName,p.categoryNameRu,p.subcategoryName,p.subcategoryNameRu].join(" ").toLowerCase();
  return (activeCat==="all"||p.category===activeCat)&&(!sub||p.subcategoryName===sub||p.subcategoryNameRu===sub)&&hay.includes(q);
 });
 $("#resultCount").textContent=list.length?`${list.length} ${list.length===1?tr("item"):tr("items")}`:"";
 $("#empty").hidden=list.length>0;
 const card=p=>{
  const specs=lang==="ru"?(p.characteristicsRu||p.characteristics||[]):(p.characteristics||[]);
  // The description is shown only for products without a specifications list.
  return `<article class="product"><div class="photo" data-product-id="${esc(p.id)}"><img src="${esc(p.image||"assets/products/placeholder.svg")}" alt="${esc(nameOf(p))}" loading="lazy" onerror="this.onerror=null;this.src='assets/products/placeholder.svg'"></div><div class="pbody"><div class="pname">${esc(nameOf(p))}</div>${specs.length?"":`<div class="desc">${esc(descOf(p))}</div>`}<div class="price">${money(p.price)}</div>${specs.length?`<div class="specs"><b>${tr("characteristics")}</b><ul>${specs.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}<button class="buy" onclick="addToCart('${esc(p.id)}')">🛒 ${tr("addCart")}</button></div></article>`;
 };
 const sections=[
  {key:"vacuum",ky:"Пылесостор",ru:"Пылесосы"},
  {key:"blender",ky:"Блендерлер",ru:"Блендеры"},
  {key:"microwave",ky:"Микроволновкалар",ru:"Микроволновые печи"}
 ];
 // On the full catalog and appliance overview, group appliances by product type.
 if(activeSub==="all" && (activeCat==="all"||activeCat==="appliances")){
  const grouped=new Set();let html="";
  for(const section of sections){
   const items=list.filter(p=>p.category==="appliances"&&p.subcategory===section.key);
   if(!items.length)continue;
   items.forEach(p=>grouped.add(p.id));
   html+=`<section class="product-group"><div class="product-group-head"><h3>${lang==="ru"?section.ru:section.ky}</h3><button type="button" class="group-all" data-group="${section.key}">${lang==="ru"?"Все":"Баары"} →</button></div><div class="products group-products">${items.map(card).join("")}</div></section>`;
  }
  const other=list.filter(p=>!grouped.has(p.id));
  if(other.length)html+=`<section class="product-group"><div class="product-group-head"><h3>${lang==="ru"?"Другие товары":"Башка товарлар"}</h3></div><div class="products group-products">${other.map(card).join("")}</div></section>`;
  $("#products").classList.add("grouped");$("#products").innerHTML=html;
  $("#products").querySelectorAll(".group-all").forEach(btn=>btn.onclick=()=>{
   activeCat="appliances";const c=categories.find(c=>c.id==="appliances");
   activeSub=String(c.subcategories.findIndex(s=>({vacuum:"Пылесостор",blender:"Блендерлер",microwave:"Микроволновкалар"})[btn.dataset.group]===s));
   renderCats();renderSubcats();renderProducts();document.querySelector("#catalog").scrollIntoView({behavior:"smooth"});
  });
 }else{$("#products").classList.remove("grouped");$("#products").innerHTML=list.map(card).join("");}
}

function brandOf(p){
 const n=(p.name||p.nameRu||"").trim();
 return (n.split(/\s+/)[0]||"Мой Маркет").replace(/[—–-].*$/,"" ).trim() || "Мой Маркет";
}
const nameOfLang=(p,l)=>l==="ru"?(p.nameRu||p.name||""):(p.name||p.nameRu||"");
const descOfLang=(p,l)=>l==="ru"?(p.descriptionRu||p.description||""):(p.description||p.descriptionRu||"");
function detectQueryLang(text){
 const x=String(text||"").toLowerCase();
 if(/[өүң]/.test(x))return "ky";
 if(/[ыэъё]/.test(x))return "ru";
 const kyWords=['барбы','канча','баасы','баа','кайда','кандай','жана','үчүн','менен','берчи','көрсөт','товар','блендер','пылесос','жеткирүү','шаар','регион','сом','суроо','сурасам','керек','алсам','алуу','заказ кыл'];
 const ruWords=['есть','цена','сколько','где','какой','какая','какие','товар','блендер','пылесос','доставка','город','регион','руб','заказ','нужен','нужна','можно','покажи','характеристик','стоимость'];
 let ky=0,ru=0;kyWords.forEach(w=>{if(x.includes(w))ky++});ruWords.forEach(w=>{if(x.includes(w))ru++});
 return ky>ru?'ky':ru>ky?'ru':lang;
}
function openProductPreview(id){
 const p=products.find(x=>x.id===id); if(!p)return;
 const modal=$("#productPreview");
 $("#previewBrand").textContent=brandOf(p);$("#previewImg").src=p.image||"assets/products/placeholder.svg";$("#previewImg").alt=nameOfLang(p,lang);$("#previewName").textContent=nameOfLang(p,lang);$("#previewPrice").textContent=money(p.price);
 modal.classList.remove("brand-phase");modal.classList.add("open");document.body.classList.add("preview-open");requestAnimationFrame(()=>modal.classList.add("brand-phase"));clearTimeout(window.__previewTimer);window.__previewTimer=setTimeout(()=>modal.classList.add("show-image"),1100);
}
function closeProductPreview(){const modal=$("#productPreview");if(!modal)return;modal.classList.remove("open","brand-phase","show-image");document.body.classList.remove("preview-open");clearTimeout(window.__previewTimer)}

function save(){localStorage.setItem("moyCart",JSON.stringify(cart))}
function productImageUrl(p){try{return new URL(p.image||"assets/products/placeholder.svg",document.baseURI).href}catch(e){return p.image||""}}
function showToast(message){let t=$("#cartToast");if(!t){t=document.createElement("div");t.id="cartToast";t.className="cart-toast";document.body.appendChild(t)}t.textContent="🛒  "+message;t.classList.add("show");clearTimeout(window.__cartToastTimer);window.__cartToastTimer=setTimeout(()=>t.classList.remove("show"),1800)}
function addToCart(id){const x=cart.find(a=>a.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();showToast(tr("addedToCart"))}
function changeQty(id,n){const x=cart.find(a=>a.id===id);if(!x)return;x.qty+=n;if(x.qty<1)cart=cart.filter(a=>a.id!==id);save();renderCart()}
function renderCart(){const drawer=$("#cartDrawer"); if(drawer) drawer.classList.toggle("empty", !cart.length); const rows=cart.map(x=>{const p=products.find(a=>a.id===x.id);if(!p)return"";return `<div class="cart-row"><img src="${esc(p.image)}" onerror="this.src='assets/products/placeholder.svg'"><div><b>${esc(nameOf(p))}</b><small>${money(p.price)}</small><div class="qty"><button onclick="changeQty('${esc(p.id)}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${esc(p.id)}',1)">+</button></div></div><strong>${money(p.price*x.qty)}</strong></div>`}).join("");$("#cartItems").innerHTML=rows||`<div class="empty"><div>🛒</div><h3>${tr("emptyCart")}</h3><p>${tr("chooseProduct")}</p></div>`;const count=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>{const p=products.find(a=>a.id===x.id);return s+(p?p.price*x.qty:0)},0);$("#cartCount").textContent=count;$("#mobileCartCount").textContent=count;$("#cartTotal").textContent=money(total)}
function openCart(){$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("open");document.body.classList.add("cart-open");closeRobot()}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("open");document.body.classList.remove("cart-open")}
function order(){if(!cart.length)return;let total=0,msg=lang==="ru"?"Здравствуйте! Хочу оформить заказ в Мой Маркет:":"Салам! Мой Маркеттен заказ бергим келет:";cart.forEach(x=>{const p=products.find(a=>a.id===x.id);if(!p)return;const sub=p.price*x.qty;total+=sub;msg+=`\n\n• ${nameOf(p)}\n${tr("qty")}: ${x.qty}\n${tr("price")}: ${p.price} сом\n${tr("subtotal")}: ${sub} сом\n🖼️ ${lang==="ru"?"Ссылка на фото":"Сүрөттүн шилтемеси"}: ${productImageUrl(p)}`});const d=document.querySelector('input[name="deliveryChoice"]:checked')?.value||"yandex";msg+=`\n\n🚚 ${lang==="ru"?"Доставка":"Жеткирүү"}: ${d==="yldam"?"Ылдам Экспресс":"Яндекс Go"}`;const a=$("#deliveryAddress").value.trim(),ph=$("#deliveryPhone").value.trim();if(a)msg+=`\n📍 ${lang==="ru"?"Адрес":"Дарек"}: ${a}`;if(ph)msg+=`\n📞 Телефон: ${ph}`;msg+=`\n\n${tr("total")} ${total} сом`;location.href=`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`}
async function load(){products=FALLBACK_PRODUCTS;categories=FALLBACK_CATEGORIES;try{const b=location.href.substring(0,location.href.lastIndexOf("/")+1);const [p,c]=await Promise.all([fetch(b+"products.json?v=43",{cache:"no-store"}).then(r=>r.ok?r.json():FALLBACK_PRODUCTS).catch(()=>FALLBACK_PRODUCTS),fetch(b+"categories.json?v=43",{cache:"no-store"}).then(r=>r.ok?r.json():FALLBACK_CATEGORIES).catch(()=>FALLBACK_CATEGORIES)]);if(Array.isArray(p)&&p.length)products=p;if(Array.isArray(c)&&c.length)categories=c}catch(e){console.log("fallback",e)}applyText();renderCats();renderSubcats();renderProducts();renderCart()}
$("#langSwitch").onclick=()=>{lang=lang==="ky"?"ru":"ky";localStorage.setItem("moyLang",lang);applyText();renderCats();renderSubcats();renderProducts();renderCart()};
document.addEventListener("click",e=>{const photo=e.target.closest(".photo[data-product-id]");if(photo)openProductPreview(photo.dataset.productId);if(e.target.closest("#previewClose")||e.target.id==="previewBackdrop")closeProductPreview()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeProductPreview()});
$("#searchBtn").onclick=()=>{document.querySelector("#searchbox").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#searchInput").focus(),300)};
function robotScrollToLatest(smooth=true){const chat=$("#robotChat");if(!chat)return;requestAnimationFrame(()=>{chat.scrollTop=chat.scrollHeight;const last=chat.lastElementChild;if(last&&last.scrollIntoView)last.scrollIntoView({behavior:smooth?'smooth':'auto',block:'end'});setTimeout(()=>{chat.scrollTop=chat.scrollHeight},120);setTimeout(()=>{chat.scrollTop=chat.scrollHeight},420)})}
function robotBubble(text,type='bot'){const chat=$("#robotChat");if(!chat)return;const b=document.createElement('div');b.className=`robot-bubble ${type}`;b.appendChild(document.createTextNode(text));chat.appendChild(b);robotScrollToLatest(true)}
function robotProductCards(list,responseLang){const chat=$("#robotChat");if(!chat||!list.length)return;chat.querySelectorAll('.robot-product-results').forEach(el=>el.remove());const wrap=document.createElement('div');wrap.className='robot-product-results';list.slice(0,6).forEach(p=>{const specs=responseLang==='ru'?(p.characteristicsRu||[]):(p.characteristics||[]);const card=document.createElement('article');card.className='robot-product-card';card.innerHTML=`<img src="${esc(p.image||'assets/products/placeholder.svg')}" alt="${esc(nameOfLang(p,responseLang))}" loading="lazy" onerror="this.onerror=null;this.src='assets/products/placeholder.svg'"><div class="rpc-body"><b>${esc(nameOfLang(p,responseLang))}</b><strong>${money(p.price)}</strong>${specs.length?`<div class="rpc-specs"><span>${responseLang==='ru'?'Характеристики':'Характеристикалары'}:</span><ul>${specs.slice(0,7).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}<button type="button" onclick="addToCart('${esc(p.id)}')">🛒 ${tr('addCart')}</button></div>`;const img=card.querySelector('img');img?.addEventListener('load',()=>robotScrollToLatest(false));wrap.appendChild(card)});chat.appendChild(wrap);robotScrollToLatest(true)}
function normalizeQuery(s){return (s||'').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim()}
function robotFindProducts(q){const x=normalizeQuery(q);if(!x)return[];const aliases={"блендер":"blender","блендерлер":"blender","блендеры":"blender","блендерди":"blender","блендерге":"blender","блендерлерди":"blender","пылесос":"vacuum","пылесостор":"vacuum","пылесосы":"vacuum","пылесосту":"vacuum","пылесоско":"vacuum","чаң соргуч":"vacuum","чаң соргучтар":"vacuum","микроволновка":"microwave","микроволновкалар":"microwave","микроволновые печи":"microwave","микроволновая печь":"microwave","микроволновую":"microwave","микроволновке":"microwave","микроволновканы":"microwave","утюг":"iron","үтүк":"iron","үтүктөр":"iron","чайник":"kettle","чайники":"kettle","чайникти":"kettle"};const key=Object.keys(aliases).find(a=>x.includes(a));if(key){const list=products.filter(p=>p.subcategory===aliases[key]);if(list.length)return list.slice(0,8)}const tokens=x.split(' ').filter(w=>w.length>2);return products.map(p=>{const name=normalizeQuery([p.name,p.nameRu].join(' '));const hay=normalizeQuery([p.name,p.nameRu,p.description,p.descriptionRu,p.categoryName,p.categoryNameRu,p.subcategoryName,p.subcategoryNameRu,p.id].join(' '));let score=0;tokens.forEach(t=>{if(name.includes(t))score+=4;else if(hay.includes(t))score+=1});return{p,score}}).filter(a=>a.score>0).sort((a,b)=>b.score-a.score||a.p.price-b.p.price).slice(0,8).map(a=>a.p)}
function robotFindProductByName(q){const x=normalizeQuery(q);if(!x)return null;let best=null,score=0;products.forEach(p=>{let s=0;[p.name,p.nameRu,p.id].map(normalizeQuery).forEach(n=>{if(n&&x.includes(n))s=Math.max(s,n.length+20);else s=Math.max(s,n.split(' ').filter(t=>t.length>2).reduce((v,t)=>v+(x.includes(t)?2:0),0))});if(s>score){score=s;best=p}});return score>=3?best:null}
function robotCatalogAnswer(list,mode,responseLang){if(!list.length)return'';const shown=list.slice(0,6);if(mode==='specs'&&shown.length===1){const p=shown[0],specs=responseLang==='ru'?(p.characteristicsRu||[]):(p.characteristics||[]);return specs.length?`${nameOfLang(p,responseLang)}. ${responseLang==='ru'?'Цена':'Баасы'} ${money(p.price)}. ${responseLang==='ru'?'Характеристики: ':'Характеристикалары: '}${specs.join(', ')}.`:`${nameOfLang(p,responseLang)}. ${money(p.price)}. ${descOfLang(p,responseLang)}`}if(mode==='price')return shown.map(p=>`${nameOfLang(p,responseLang)} — ${money(p.price)}`).join('. ')+'.';return(responseLang==='ru'?'Да, в каталоге есть: ':'Ооба, каталогдо бар: ')+shown.map(p=>`${nameOfLang(p,responseLang)} — ${money(p.price)}`).join('; ')+'.'}
function answerRobotQuestion(q){
 const raw=(q||'').trim();if(!raw)return;const responseLang=detectQueryLang(raw),x=normalizeQuery(raw);let answer='';
 const direct=robotFindProductByName(raw),found=robotFindProducts(raw);
 const isGreeting=/^(салам|саламатсызбы|саламдашуу|hello|hi|здравствуйте|здравствуй|привет|добрый день|добрый вечер|доброе утро)\b/.test(x);
 const isThanks=/рахмат|спасибо|благодар/.test(x);
 const isWho=/сен ким|кимсиң|кто ты|кто вы|что ты умеешь|эмне кыла аласың/.test(x);
 const isDelivery=/жеткир|доставка|доставк|канча убакыт|сколько времени|когда приед|сколько едет/.test(x);
 const isAddress=/дарек|адрес|филиал|филиалы|кайда жайгаш|где находит/.test(x);
 const isHours=/саат|время работы|работаете|открыт|закрыт|график|когда откры/.test(x);
 const isContact=/телефон|номер|whatsapp|ватсап|байланыш|связ/.test(x);
 const isPayment=/төлөм|оплата|налич|карта|перевод/.test(x);
 const isCart=/корзин|себет|заказ|заказа|заказ бер|заказ кыл/.test(x);
 const asksPrice=/баа|баасы|цена|ценасы|сколько стоит|сколько|канча сом/.test(x);
 const asksSpecs=/характерист|сипат|кубат|мощност|литр|модель|специфика|өзгөчөлүк/.test(x);
 const asksStock=/барбы|бар бекен|есть ли|налич|имеется|имеются|эмне бар|что есть|покажи|көрсөт|изде|найти/.test(x);
 const isCategories=/категор|бөлүм|раздел|что продаете|эмнелер бар|кандай товар/.test(x);
 if(isGreeting)answer=responseLang==='ru'?'Здравствуйте! Я помощник Мой Маркет. Помогу найти товар, узнать цену и характеристики, рассказать о доставке и помочь с заказом.':'Саламатсызбы! Мен Мой Маркеттин жардамчысымын. Товарды таап, баасын жана мүнөздөмөлөрүн айтып, жеткирүү жана заказ боюнча жардам берем.';
 else if(isThanks)answer=responseLang==='ru'?'Пожалуйста! Рад помочь.':'Ар дайым жардам берүүгө даярмын!';
 else if(isWho)answer=responseLang==='ru'?'Я виртуальный консультант Мой Маркет. Я помогаю с товарами, ценами, характеристиками, доставкой, филиалами и заказами.':'Мен Мой Маркеттин виртуалдык консультант роботумун. Товарлар, баалар, мүнөздөмөлөр, жеткирүү, филиалдар жана заказдар боюнча жардам берем.';
 else if(isDelivery)answer=responseLang==='ru'?tr('robotDeliveryText'):tr('robotDeliveryText');
 else if(isAddress)answer=responseLang==='ru'?'Наши филиалы: Жибек-Жолу 235; Жибек-Жолу 227; Ауэзова 17; Бейшеналиева 20; Токтогул 259/10.':'Биздин филиалдар: Жибек-Жолу 235; Жибек-Жолу 227; Ауэзова 17; Бейшеналиева 20; Токтогул 259/10.';
 else if(isHours)answer=responseLang==='ru'?'Мы работаем ежедневно с 09:00 до 21:00.':'Биз күн сайын 09:00дөн 21:00гө чейин иштейбиз.';
 else if(isContact)answer=responseLang==='ru'?'WhatsApp: плюс 996 507 66 88 66. Заказ можно отправить прямо из корзины.':'WhatsApp: плюс 996 507 66 88 66. Заказды түз эле корзинадан жөнөтсөңүз болот.';
 else if(isPayment)answer=responseLang==='ru'?'Оплата и доставка уточняются при оформлении заказа. Стоимость доставки зависит от выбранного способа.':'Төлөм жана жеткирүү заказ учурунда такталат. Жеткирүүнүн баасы тандалган ыкмага жараша болот.';
 else if(isCategories)answer=responseLang==='ru'?'В каталоге есть посуда, бытовая техника, казаны и кухонные товары, наборы и акционные товары.':'Каталогдо идиш-аяк, тиричилик техникасы, казан жана ашкана товарлары, наборлор жана акциядагы товарлар бар.';
 else if(direct)answer=robotCatalogAnswer([direct],asksSpecs?'specs':asksPrice?'price':'stock',responseLang);
 else if(found.length)answer=robotCatalogAnswer(found,asksSpecs?'specs':asksPrice?'price':'stock',responseLang);
 else if(isCart)answer=responseLang==='ru'?'Корзина открывается кнопкой корзины. Добавьте нужные товары, проверьте количество и сумму, затем отправьте заказ в WhatsApp.':'Корзинаны корзина баскычы аркылуу ачыңыз. Каалаган товарларды кошуп, санын жана жалпы суммасын текшерип, андан кийин WhatsApp аркылуу заказ жөнөтө аласыз.';
 else answer=responseLang==='ru'?'Сейчас этого товара нет в каталоге Мой Маркет. Возможно, он ещё не добавлен на сайт.':'Азыр бул товар Мой Маркеттин каталогунда жок. Балким, ал сайтка азырынча киргизиле элек.';
 robotBubble(raw,'user');robotBubble(answer,'bot');
 if(direct||found.length){robotProductCards(direct?[direct]:found,responseLang)}
 const box=$('#robotReply');if(box){box.hidden=true;box.textContent=''}
}
function robotReply(key){const box=$("#robotReply"); if(box){box.hidden=true;box.textContent=""} const text=tr(key);robotBubble(text,"bot");}
function openRobot(){$("#robotPanel").classList.add("open");$("#robotPanel").setAttribute("aria-hidden","false");clearTimeout(window.__robotGreetingTimer);if(!$("#robotChat")?.children.length)window.__robotGreetingTimer=setTimeout(()=>{const t=tr("robotGreeting");robotBubble(t,"bot")},180)}
function closeRobot(){$("#robotPanel").classList.remove("open");$("#robotPanel").setAttribute("aria-hidden","true");}
$("#robotFab").onclick=()=>{if($("#robotPanel").classList.contains("open"))closeRobot();else openRobot()};
$("#robotClose").onclick=closeRobot;$("#robotCloseBottom").onclick=closeRobot;$("#cartBackBottom").onclick=closeCart;
document.querySelectorAll("[data-robot-action]").forEach(btn=>btn.onclick=()=>{const a=btn.dataset.robotAction;if(a==="search"){robotReply("robotSearchText");closeRobot();$("#searchBtn").click();}else if(a==="cart"){robotReply("robotCartText");closeRobot();openCart();}else if(a==="delivery"){robotReply("robotDeliveryText");document.querySelector(".delivery-info")?.scrollIntoView({behavior:"smooth"});}else if(a==="sale"){robotReply("robotSaleText");activeCat="sale";activeSub="all";renderCats();renderSubcats();renderProducts();document.querySelector("#catalog")?.scrollIntoView({behavior:"smooth"});}else if(a==="order"){robotReply("robotOrderText");closeRobot();openCart();}else if(a==="language"){lang=lang==="ky"?"ru":"ky";localStorage.setItem("moyLang",lang);applyText();renderCats();renderSubcats();renderProducts();renderCart();robotReply("robotLanguageText");}});
const robotQuestion=$("#robotQuestion"),robotAsk=$("#robotAsk");robotAsk?.addEventListener("click",()=>answerRobotQuestion(robotQuestion?.value));robotQuestion?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();answerRobotQuestion(robotQuestion.value)}});

// v3.17 CHAT ROBOT MOTION: subtle idle movement for the floating chat button.
(function initRealRobotMotion(){
  const fab=document.querySelector('#robotFab');
  const img=fab?.querySelector('img');
  if(!fab||!img)return;
  const frames=['assets/robot-frames/robot-1.png','assets/robot-frames/robot-4.png','assets/robot-frames/robot-5.png','assets/robot-frames/robot-1.png'];
  frames.forEach(src=>{const im=new Image();im.src=src});
  let i=0,last=performance.now();
  function tick(now){
    if(now-last>1200){i=(i+1)%frames.length;img.src=frames[i];last=now}
    const bob=Math.sin(now/700)*2;
    fab.style.transform=`translate3d(0,${bob}px,0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

$("#mobileSearch").onclick=()=>$("#searchBtn").click();$("#cartBtn").onclick=openCart;$("#mobileCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#backdrop").onclick=closeCart;$("#orderBtn").onclick=order;$("#heroCatalog").onclick=()=>$("#catalog").scrollIntoView({behavior:"smooth"});$("#mobileCatalog").onclick=()=>$("#catalog").scrollIntoView({behavior:"smooth"});$("#mobileHome").onclick=()=>scrollTo({top:0,behavior:"smooth"});$("#allBtn").onclick=()=>{activeCat="all";activeSub="all";renderCats();renderSubcats();renderProducts()};$("#searchInput").oninput=renderProducts;$("#clearSearch").onclick=()=>{$("#searchInput").value="";renderProducts()};
load();

// v3.20 HERO ROBOT — REAL ANIMATED WALKING MASCOT
// The robot is an actual animated WebP sequence (walking/dance/wave poses) while this controller
// moves the whole animated character across the hero from left -> right -> left. No frame swapping here.
(function initHeroAnimatedRobot(){
  const stage=document.querySelector('#heroRobotStage');
  const bot=document.querySelector('#heroRobot');
  const img=document.querySelector('#heroRobotImg');
  const glow=document.querySelector('.hero-robot-glow');
  const floor=document.querySelector('.hero-robot-floor');
  const bubble=document.querySelector('#heroRobotBubble');
  const fx=document.querySelector('#heroRobotFx');
  if(!stage||!bot||!img)return;

  img.src='assets/robot-animated.webp';

  // These phases are synchronized with robot-animated.webp.
  const phases=[
    {dur:700, from:.03, to:.03, mode:'idle', say:'Салам! 👋'},
    {dur:4080, from:.03, to:.36, mode:'walk', say:'МОЙ МАРКЕТ! 🚶'},
    {dur:900, from:.36, to:.36, mode:'wave', say:'Кош келиңиз! 👋'},
    {dur:2720, from:.36, to:.57, mode:'walk', say:'Товарларды издеп жатам… 🔎'},
    {dur:2640, from:.57, to:.57, mode:'dance', say:'Маанай сонун! 💃'},
    {dur:750, from:.57, to:.57, mode:'point', say:'Каталог ушул жакта →'},
    {dur:2380, from:.57, to:.94, mode:'walk', say:'Жүрө берели! 🚶‍♂️'},
    {dur:4080, from:.94, to:.03, mode:'walkBack', say:'Кайра келем! ↩️'},
    {dur:800, from:.03, to:.03, mode:'wave', say:'Көрүшкөнчө! 👋'}
  ];
  const total=phases.reduce((n,p)=>n+p.dur,0);
  let started=performance.now();
  let lastSay='';

  function setMode(mode){
    stage.classList.toggle('walking',mode==='walk'||mode==='walkBack');
    stage.classList.toggle('dancing',mode==='dance');
    stage.classList.toggle('waving',mode==='wave');
  }
  function setPosition(frac,bob,tilt,direction){
    const stageW=stage.clientWidth;
    const botW=bot.offsetWidth||120;
    const x=Math.max(0,(stageW-botW)*Math.max(0,Math.min(1,frac)));
    bot.style.left=x+'px';
    bot.style.transform=`translate3d(0,${bob}px,0) rotate(${tilt}deg) scaleX(${direction})`;
    if(glow)glow.style.left=x+'px';
    if(floor)floor.style.left=x+'px';
    if(bubble)bubble.style.left=Math.max(0,x+botW*.05)+'px';
    if(fx)fx.style.left=Math.max(0,x+botW*.2)+'px';
  }

  function tick(now){
    const t=(now-started)%total;
    let acc=0,phase=phases[0];
    for(const p of phases){
      if(t<acc+p.dur){phase=p;break}
      acc+=p.dur;
    }
    const local=t-acc;
    const q=Math.min(1,local/phase.dur);
    const eased=q*q*(3-2*q);
    const frac=phase.from+(phase.to-phase.from)*eased;
    let bob=0,tilt=0,direction=1;

    if(phase.mode==='walk'||phase.mode==='walkBack'){
      // Natural step bounce follows the actual animated walking frames.
      bob=-Math.abs(Math.sin(local/170*Math.PI))*4.5;
      tilt=Math.sin(local/340*Math.PI)*1.6;
      direction=phase.mode==='walk'?1:-1;
    }else if(phase.mode==='dance'){
      bob=-Math.abs(Math.sin(local/220*Math.PI))*8;
      tilt=Math.sin(local/330*Math.PI)*6;
    }else if(phase.mode==='wave'){
      bob=-Math.abs(Math.sin(local/250*Math.PI))*2.5;
      tilt=Math.sin(local/300*Math.PI)*1.5;
    }else if(phase.mode==='point'){
      bob=-2; tilt=-2;
    }

    setMode(phase.mode);
    if(phase.say!==lastSay){lastSay=phase.say;if(bubble)bubble.textContent=phase.say}
    setPosition(frac,bob,tilt,direction);
    requestAnimationFrame(tick);
  }

  bot.addEventListener('click',()=>{
    const fab=document.querySelector('#robotFab');
    if(fab)fab.click();
  });

  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
    setPosition(.06,0,0,1);
  }else{
    requestAnimationFrame(tick);
  }
})();

