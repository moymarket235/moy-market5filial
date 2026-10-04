/* MOY MARKET — Daily global visitor counter
   Frontend:
   - removes the old 24h/social legend
   - shows only icon + current daily count + status dot + arrow
   - calls a Cloudflare Worker endpoint for one unique visitor/day
*/

(() => {
  'use strict';

  /*
    Deploy visitor-counter-worker.js to your Cloudflare Worker and
    use its public URL here.

    Example:
    https://moy-market-visitors.<your-subdomain>.workers.dev/api/visitors

    The existing admin Worker is NOT overwritten by this file.
  */
  const VISITOR_API =
    "https://moy-market-visitors.moimarketjibekjolu.workers.dev/api/visitors

  const BADGE_ID = 'mmDailyVisitors';
  const OLD_ID = 'mmEngagementStats';
  const SITE_ROOT = '.topbar';

  const VISITOR_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2"></circle>
      <path d="M3.8 19.3c.7-3.1 2.7-4.8 5.2-4.8s4.5 1.7 5.2 4.8"></path>
      <circle cx="17" cy="9" r="2.4"></circle>
      <path d="M14.7 14.5c1 .2 2.8 1.2 3.6 3.6"></path>
    </svg>`;

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function makeBadge() {
    let badge = document.getElementById(BADGE_ID);
    if (badge) return badge;

    const top = qs(SITE_ROOT);
    if (!top) return null;

    badge = document.createElement('div');
    badge.id = BADGE_ID;
    badge.className = 'mm-daily-visitors';
    badge.setAttribute('aria-label', 'Daily visitors');
    badge.dataset.loading = '1';
    badge.innerHTML = `
      <span class="mm-daily-visitors-icon">${VISITOR_ICON}</span>
      <span class="mm-daily-visitors-count">0</span>
      <span class="mm-daily-visitors-dot"></span>
      <span class="mm-daily-visitors-arrow" aria-hidden="true"></span>
    `;

    top.insertAdjacentElement('afterend', badge);
    return badge;
  }

  function removeOldBar() {
    const old = document.getElementById(OLD_ID);
    if (old) old.remove();

    // Extra guard for the old class if an older version created it.
    document.querySelectorAll('.mm-engagement-stats').forEach(el => {
      if (el.id !== BADGE_ID) el.remove();
    });
  }

  function showCount(value) {
    const badge = makeBadge();
    if (!badge) return;

    const count = Number(value);
    const formatted =
      Number.isFinite(count) && count >= 0
        ? Math.floor(count).toLocaleString('en-US')
        : '0';

    const el = qs('.mm-daily-visitors-count', badge);
    if (el) el.textContent = formatted;

    badge.dataset.loading = '0';
  }

  async function requestCount() {
    const badge = makeBadge();
    if (!badge) return;

    try {
      const response = await fetch(VISITOR_API, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Visitor API ${response.status}`);

      const data = await response.json();
      showCount(data.count);
    } catch (error) {
      // Keep the UI clean when the API has not been deployed yet.
      // A real global number is never faked here.
      showCount(0);
      console.warn('Daily visitor counter unavailable:', error);
    }
  }

  function boot() {
    removeOldBar();
    makeBadge();
    requestCount();

    // The backend decides the daily reset (Bishkek date).
    // Refreshing periodically keeps the visible number current without
    // counting the same visitor again.
    setInterval(requestCount, 5 * 60 * 1000);

    const observer = new MutationObserver(() => {
      removeOldBar();
      if (!document.getElementById(BADGE_ID)) makeBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
