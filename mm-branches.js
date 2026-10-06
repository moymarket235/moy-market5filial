/* =========================================
   MOY MARKET — BRANCHES
   ========================================= */

(function(){

  const branches = [
    "Жибек-Жолу 235, Бишкек, Кыргызстан",
    "Жибек-Жолу 227, Бишкек, Кыргызстан",
    "Ауэзова 17, Бишкек, Кыргызстан",
    "Бейшеналиева 20, Бишкек, Кыргызстан",
    "Токтогул 259/10, Бишкек, Кыргызстан"
  ];

  function openBranches(){
    const el=document.getElementById("mmBranchesOverlay");
    if(!el)return;

    el.classList.add("is-open");
    el.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  }

  function closeBranches(){
    const el=document.getElementById("mmBranchesOverlay");
    if(!el)return;

    el.classList.remove("is-open");
    el.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }

  function mapUrl(address){
    return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(address);
  }

  function renderBranches(){
    const wrap=document.getElementById("mmBranchesList");
    if(!wrap)return;

    wrap.innerHTML=branches.map((address,index)=>`
      <div class="mm-branch-card">
        <div class="mm-branch-icon">📍</div>

        <div>
          <div class="mm-branch-name">
            Филиал ${index+1}
          </div>
          <div class="mm-branch-address">
            ${address}
          </div>
        </div>

        <a
          class="mm-branch-map"
          href="${mapUrl(address)}"
          target="_blank"
          rel="noopener"
        >
          🗺️ Карта
        </a>
      </div>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded",()=>{

    renderBranches();

    document.querySelectorAll(".branches-pill").forEach(btn=>{
      btn.addEventListener("click",openBranches);
    });

    const backdrop=document.getElementById("mmBranchesOverlay");
    const closeBtn=document.getElementById("mmBranchesClose");

    closeBtn?.addEventListener("click",closeBranches);

    backdrop?.addEventListener("click",e=>{
      if(e.target===backdrop) closeBranches();
    });

    document.addEventListener("keydown",e=>{
      if(e.key==="Escape") closeBranches();
    });

  });

  window.MMBranches={
    open:openBranches,
    close:closeBranches
  };

})();
