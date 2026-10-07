/* =========================================
   MOY MARKET — BRANCHES PREMIUM
   MAP + CALL + WHATSAPP
   3 PHONE SLOTS PER BRANCH
   ========================================= */

(function(){

  const branches = [

    {
      name: "Филиал 1",
      address: "Жибек-Жолу 235, Бишкек, Кыргызстан",
      phones: [
        "996507668866",
        "",
        ""
      ]
    },

    {
      name: "Филиал 2",
      address: "Жибек-Жолу 227, Бишкек, Кыргызстан",
      phones: [
        "996709129700",
        "",
        ""
      ]
    },

    {
      name: "Филиал 3",
      address: "Ауэзова 17, Бишкек, Кыргызстан",
      phones: [
        "996555828796",
        "",
        ""
      ]
    },

    {
      name: "Филиал 4",
      address: "Бейшеналиева 20, Бишкек, Кыргызстан",
      phones: [
        "996708484242",
        "",
        ""
      ]
    },

    {
      name: "Филиал 5",
      address: "Токтогул 259/10, Бишкек, Кыргызстан",
      phones: [
        "996706125597",
        "",
        ""
      ]
    }

  ];


  /* =========================================
     OPEN BRANCHES
     ========================================= */

  function openBranches(){

    const el = document.getElementById("mmBranchesOverlay");

    if(!el) return;

    el.classList.add("is-open");
    el.setAttribute("aria-hidden","false");

    document.body.style.overflow = "hidden";
  }


  /* =========================================
     CLOSE BRANCHES
     ========================================= */

  function closeBranches(){

    const el = document.getElementById("mmBranchesOverlay");

    if(!el) return;

    el.classList.remove("is-open");
    el.setAttribute("aria-hidden","true");

    document.body.style.overflow = "";
  }


  /* =========================================
     GOOGLE MAPS ROUTE
     ========================================= */

  function routeUrl(address){

    return "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(address);

  }


  /* =========================================
     WHATSAPP
     ========================================= */

  function whatsappUrl(address, phone){

    const text =
      "Саламатсызбы! Мой Маркеттен заказ боюнча маалымат алгым келет.\n" +
      "Филиал: " + address;

    return "https://wa.me/" +
      phone +
      "?text=" +
      encodeURIComponent(text);

  }


  /* =========================================
     PHONE ACTIONS
     ========================================= */

  function renderPhoneActions(branch){

    return branch.phones
      .filter(phone => phone && phone.trim())
      .map(phone => `

        <a
          class="mm-branch-action mm-branch-call"
          href="tel:+${phone}"
        >
          📞 <span>Чалуу</span>
        </a>

        <a
          class="mm-branch-action mm-branch-wa"
          href="${whatsappUrl(branch.address, phone)}"
          target="_blank"
          rel="noopener"
        >
          💬 <span>WhatsApp</span>
        </a>

      `)
      .join("");

  }


  /* =========================================
     RENDER BRANCHES
     ========================================= */

 function populateCheckoutBranches(){

  const select = document.getElementById("checkoutBranch");

  if(!select) return;

  select.innerHTML = `
    <option value="">
      ${lang === "ru"
        ? "Выберите филиал"
        : "Филиалды тандаңыз"}
    </option>
  `;

  branches.forEach((branch,index)=>{

    const phone =
      branch.phones.find(
        p => p && p.trim()
      ) || "";

    const option =
      document.createElement("option");

    option.value = String(index);

    option.textContent =
      `${branch.name} — ${branch.address}`;

    option.dataset.address =
      branch.address;

    option.dataset.phone =
      phone;

    select.appendChild(option);

  });

 }
   function renderBranches(){
    const wrap =
      document.getElementById("mmBranchesList");

    if(!wrap) return;


    wrap.innerHTML = branches.map(branch => `

      <div class="mm-branch-card">

        <div class="mm-branch-icon">
          📍
        </div>


        <div class="mm-branch-main">

          <div class="mm-branch-name">
            ${branch.name}
          </div>

          <div class="mm-branch-address">
            ${branch.address}
          </div>

        </div>


        <div class="mm-branch-actions">

          <!-- ROUTE -->

          <a
            class="mm-branch-action mm-branch-route"
            href="${routeUrl(branch.address)}"
            target="_blank"
            rel="noopener"
          >
            🗺️ <span>Маршрут</span>
          </a>


          <!-- PHONE NUMBERS -->

          ${renderPhoneActions(branch)}

        </div>

      </div>

    `).join("");

  }


  /* =========================================
     INIT
     ========================================= */

  document.addEventListener("DOMContentLoaded", () => {

    renderBranches();
    populateCheckoutBranches();


    /* OPEN BUTTONS */

    document
      .querySelectorAll(".branches-pill,.location-pill")
      .forEach(btn => {

        btn.addEventListener(
          "click",
          openBranches
        );

      });


    /* CLOSE BUTTON */

    const closeBtn =
      document.getElementById("mmBranchesClose");

    closeBtn?.addEventListener(
      "click",
      closeBranches
    );


    /* BACKDROP */

    const backdrop =
      document.getElementById("mmBranchesOverlay");

    backdrop?.addEventListener(
      "click",
      e => {

        if(e.target === backdrop){
          closeBranches();
        }

      }
    );


    /* ESC */

    document.addEventListener(
      "keydown",
      e => {

        if(e.key === "Escape"){
          closeBranches();
        }

      }
    );

  });


  /* =========================================
     GLOBAL API
     ========================================= */

  window.MMBranches = {

    open: openBranches,
    close: closeBranches

  };

})();
