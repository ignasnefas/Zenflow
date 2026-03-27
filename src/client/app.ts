// Converted from js/app.js
(function(){
  'use strict';
  const w: any = window as any;

  // Passphrase modal controller
  (function setupPassphraseModal(){
    const refs:any = {};
    function cache() {
      refs.modal = document.getElementById('passphraseModal');
      refs.form = document.getElementById('ppForm');
      refs.input = document.getElementById('ppInput');
      refs.toggle = document.getElementById('ppToggle');
      refs.error = document.getElementById('ppError');
      refs.label = document.getElementById('ppLabel');
      refs.submit = document.getElementById('ppSubmitBtn');
      refs.cancel = document.getElementById('ppCancelBtn');
      refs.close = document.getElementById('ppCloseBtn');
      refs.learn = document.getElementById('ppLearnMoreBtn');
    }
    function show(opts?:any) {
      cache();
      if (!refs.modal) return Promise.reject(new Error('Passphrase modal missing'));
      const mode = opts?.mode || 'unlock';
      const title = document.getElementById('ppTitle');
      const ph = mode === 'set' ? 'Create a passphrase' : 'Enter passphrase';
      if (title) title.textContent = mode === 'set' ? 'Set Encryption Passphrase' : 'Encryption Passphrase';
      if (refs.label) refs.label.textContent = opts?.label || (mode === 'set' ? 'Create a passphrase to encrypt your board' : 'Enter your passphrase to unlock your board');
      if (refs.input) { refs.input.type = 'password'; refs.input.value = ''; refs.input.placeholder = ph; refs.input.setAttribute('autocomplete', mode === 'set' ? 'new-password' : 'current-password'); }
      if (refs.error) { refs.error.style.display = 'none'; refs.error.textContent = ''; }
      const toggle = refs.toggle;
      if (toggle) {
        toggle.onclick = () => {
          const isPw = refs.input.type === 'password';
          refs.input.type = isPw ? 'text' : 'password';
          toggle.setAttribute('aria-label', isPw ? 'Hide passphrase' : 'Show passphrase');
          toggle.textContent = isPw ? '🙈' : '👁️';
          refs.input.focus();
        };
      }

      return new Promise((resolve, reject) => {
        let settled = false;
        const close = () => {
          refs.modal.classList.remove('show'); document.body.classList.remove('modal-open');
          if (refs._overlayHandler) { refs.modal.removeEventListener('click', refs._overlayHandler); refs._overlayHandler = null; }
          if (refs._escHandler) { document.removeEventListener('keydown', refs._escHandler, true); refs._escHandler = null; }
        };
        const onCancel = () => { if (!settled) { settled = true; close(); reject(new Error('cancelled')); } };
        const onSubmit = async (e:any) => {
          e.preventDefault();
          const v = refs.input.value.trim();
          if (!v) { if (refs.error) { refs.error.textContent = 'Passphrase required'; refs.error.style.display = 'block'; } return; }
          if (!settled) { settled = true; close(); resolve(v); }
        };

        refs.cancel && (refs.cancel.onclick = onCancel);
        refs.close && (refs.close.onclick = onCancel);
        if (refs.modal) {
          const overlayHandler = (e:any) => { if (e.target === refs.modal) onCancel(); };
          refs._overlayHandler && refs.modal.removeEventListener('click', refs._overlayHandler);
          refs._overlayHandler = overlayHandler;
          refs.modal.addEventListener('click', refs._overlayHandler);
        }
        refs.form && (refs.form.onsubmit = onSubmit);
        if (refs.learn) {
          refs.learn.onclick = (e:any) => { e.preventDefault(); const url = './SECURITY.md'; try { window.open(url, '_blank', 'noopener,noreferrer'); } catch { location.href = url; } };
        }
        const esc = (e:any) => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } };
        refs._escHandler && document.removeEventListener('keydown', refs._escHandler, true);
        refs._escHandler = esc; document.addEventListener('keydown', refs._escHandler, true);

        document.body.classList.add('modal-open');
        refs.modal.classList.add('show');
        setTimeout(() => refs.input?.focus(), 30);
      });
    }
    (w as any).Passphrase = { ask: show };
  })();

  // Initialize (global) after ensuring passphrase is present (for encrypted local storage)
  (async function initApp(){
    console.log('app:initApp started');
    try {
      const hasLocal = !!localStorage.getItem('ZenBoardData');
      let pass = localStorage.getItem('ZenBoard_passphrase') || '';
      console.log('app:initApp local data present?', hasLocal, 'stored pass?', !!pass);
      if (hasLocal && !pass) {
        try { pass = await (w as any).Passphrase.ask({ mode: 'unlock' }); } catch {}
        while (!pass) {
          try { pass = await (w as any).Passphrase.ask({ mode: 'unlock' }); } catch { }
        }
        localStorage.setItem('ZenBoard_passphrase', pass);
      }
    } catch {}
    console.log('app:initApp constructing KanbanBoard');
    (w as any).app = new (w as any).KanbanBoard();
  })();

  try {
    if ('ontouchstart' in window || (navigator && (navigator as any).maxTouchPoints > 0)) {
      document.body.classList.add('is-touch');
    }
  } catch {}

  try {
    const key = 'ZenBoard_perfLite';
    let pref = localStorage.getItem(key);
    if (pref === null) { pref = 'on'; localStorage.setItem(key, pref); }
    if (pref === 'on') { document.documentElement.classList.add('perf-lite'); document.body.classList.add('perf-lite'); }
  } catch {}

  // Header collapse/expand
  (function(){
    const KEY = 'ZenBoard_header_collapsed_v1';
    function applyHeaderState(collapsed:boolean) {
      const hdr = document.querySelector('header');
      const btn = document.getElementById('headerToggleBtn');
      if (!hdr || !btn) return;
      hdr.classList.toggle('collapsed', collapsed);
      document.body.classList.toggle('header-collapsed', collapsed);
      const stats = document.getElementById('statsBar');
      if (stats) stats.style.display = collapsed ? 'none' : '';
      const labelEl = btn.querySelector('.label');
      if (labelEl) labelEl.textContent = collapsed ? 'Show' : 'Hide'; else btn.textContent = collapsed ? 'Show' : 'Hide';
      btn.setAttribute('aria-label', collapsed ? 'Show header' : 'Hide header');
    }
    (w as any).toggleHeader = () => { const current = localStorage.getItem(KEY) === '1'; const next = !current; localStorage.setItem(KEY, next ? '1' : '0'); applyHeaderState(next); };
    window.addEventListener('DOMContentLoaded', () => {
      const collapsed = localStorage.getItem(KEY) === '1';
      applyHeaderState(collapsed);
    });
  })();

  // Global bridges for inline onclicks
  (w as any).showAddCardModal = (columnId:any) => (w as any).app.showAddCardModal(columnId);
  (w as any).closeModal = () => (w as any).app.closeModal();
  (w as any).toggleTheme = () => (w as any).app.toggleTheme();
  (w as any).showFilterModal = () => (w as any).app.openFilterModal();
  (w as any).closeFilterModal = () => (w as any).app.closeFilterModal();
  (w as any).applyFilters = () => (w as any).app.applyFilterModal();
  (w as any).resetFilters = () => (w as any).app.resetFilterModal();
  (w as any).openStatsModal = () => {
    try {
      const modal = document.getElementById('statsModal');
      if (!modal) return;
      // If server-side placeholder is empty (Next.js path), populate full stats markup
      if (!modal.querySelector('.modal-content') || modal.innerHTML.trim() === '') {
        modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="statsTitle">Board Statistics</h2>
          <button class="close-btn" onclick="closeStatsModal()" aria-label="Close">&times;</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tasks by Column</label>
            <canvas id="chartByColumn" height="140"></canvas>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Priorities</label>
              <canvas id="chartPriority" height="160"></canvas>
            </div>
            <div class="form-group">
              <label class="form-label">Due Status</label>
              <canvas id="chartDue" height="160"></canvas>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tasks Created (Last 14 Days)</label>
            <canvas id="chartCreatedTrend" height="140"></canvas>
          </div>
        </div>
      </div>
      `;
      }
    } catch (err) { console.error('[src/app.ts] failed to populate statsModal', err); }
    try { (w as any).app.openStatsModal?.(); } catch (err) { console.error('[src/app.ts] app.openStatsModal threw', err); }
  };
  (w as any).closeStatsModal = () => { const modal = document.getElementById('statsModal'); modal?.classList.remove('show'); document.body.classList.remove('modal-open'); if ((modal as any)?.__overlayHandler) { modal.removeEventListener('click', (modal as any).__overlayHandler); (modal as any).__overlayHandler = null; } if ((modal as any)?.__escHandler) { document.removeEventListener('keydown', (modal as any).__escHandler, true); (modal as any).__escHandler = null; } };
  (w as any).openHelpModal = (sectionId?:string) => {
    document.body.classList.add('modal-open');
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    // If server-side placeholder is empty (Next.js path), populate help modal markup
    try {
      if (!modal.querySelector('.modal-content') || modal.innerHTML.trim() === '') {
        modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="helpTitle">Welcome to ZenBoard</h2>
          <button class="close-btn" onclick="closeHelpModal()" aria-label="Close">&times;</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <p><strong>ZenBoard</strong> is a simple, fast Kanban board to help you plan work and life. It’s great for students, freelancers, small teams, and households&mdash;no setup, works offline, and stays private by default.</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">What is Kanban?</label>
              <ul>
                <li><strong>Visual workflow</strong>: tasks live on cards and move through columns.</li>
                <li><strong>Stages</strong>: customize columns (e.g., Long‑Term → Soon → In Progress → Done).</li>
                <li><strong>Focus</strong>: limit what’s in progress to avoid overload.</li>
              </ul>
            </div>
            <div class="form-group">
              <label class="form-label">Who is it for?</label>
              <ul>
                <li>Students planning assignments and exams.</li>
                <li>Freelancers tracking client work and invoices.</li>
                <li>Small teams organizing sprints or features.</li>
                <li>Personal life: errands, chores, side projects.</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Why ZenBoard?</label>
            <ul>
              <li><strong>Offline‑first & private</strong>: your board is stored in your browser. Optional cloud sync if you want it.</li>
              <li><strong>Fast & minimal</strong>: no accounts needed to start; just add tasks and go.</li>
              <li><strong>Flexible</strong>: rename columns, set WIP limits, filter by priority, due, or category.</li>
            </ul>
          </div>

          <div class="form-group">
            <label class="form-label">Quick Start</label>
            <ol>
              <li>Click <strong>New Task</strong> (or press <strong>Ctrl+N</strong>) and add a title.</li>
              <li>Drag cards between columns as they progress.</li>
              <li>Use <strong>Filters</strong> to focus by priority, category, or due date.</li>
              <li>Customize columns (name/icon) from any column’s menu.</li>
              <li>Optionally set a <strong>WIP limit</strong> to prevent overload.</li>
            </ol>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tips</label>
              <ul>
                <li>Keep card titles short; details go in the description.</li>
                <li>Tag with a category to group related work (e.g., School, Home, Client A).</li>
                <li>Mark due dates to highlight what’s urgent today/this week.</li>
              </ul>
            </div>
            <div class="form-group">
              <label class="form-label">Keyboard</label>
              <ul>
                <li><strong>Ctrl+N</strong>: New task</li>
                <li><strong>Ctrl+/</strong>: Focus search</li>
                <li><strong>Esc</strong>: Close dialogs</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" id="helpPrivacy">Privacy & Encryption</label>
            <p>Your board is encrypted with your passphrase before it’s saved locally or synced. We never store or transmit your passphrase. If you forget it, your encrypted data cannot be recovered.</p>
            <ul>
              <li><strong>How it works:</strong> ZenBoard derives a key from your passphrase (PBKDF2-SHA256) and encrypts your board using AES‑GCM. The result is stored locally and, if you sign in, in your cloud record.</li>
              <li><strong>Your responsibility:</strong> Keep your passphrase safe. Losing it means losing access to your encrypted data.</li>
              <li><strong>Device setup:</strong> You’ll be asked for the same passphrase on each device to unlock your board.</li>
            </ul>
          </div>
        </div>
      </div>
      `;
      }
    } catch (err) { console.error('[src/app.ts] failed to populate helpModal', err); }
    modal.classList.add('show');
    const overlay = (e:any) => { if (e.target === modal) (w as any).closeHelpModal(); };
    const esc = (e:any) => { if (e.key === 'Escape') { e.preventDefault(); (w as any).closeHelpModal(); } };
    if ((modal as any).__overlayHandler) modal.removeEventListener('click', (modal as any).__overlayHandler);
    (modal as any).__overlayHandler = overlay; modal.addEventListener('click', (modal as any).__overlayHandler);
    if ((modal as any).__escHandler) document.removeEventListener('keydown', (modal as any).__escHandler, true);
    (modal as any).__escHandler = esc; document.addEventListener('keydown', (modal as any).__escHandler, true);
    if (sectionId) {
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          try { (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
          const prevTab = target.getAttribute('tabindex');
          target.setAttribute('tabindex', '-1');
          (target as HTMLElement).focus({ preventScroll: true });
          setTimeout(() => { if (prevTab === null) target.removeAttribute('tabindex'); }, 500);
        }
      }, 50);
    }
  };
  (w as any).closeHelpModal = () => { const modal = document.getElementById('helpModal'); modal?.classList.remove('show'); document.body.classList.remove('modal-open'); if ((modal as any)?.__overlayHandler) { modal.removeEventListener('click', (modal as any).__overlayHandler); (modal as any).__overlayHandler = null; } if ((modal as any)?.__escHandler) { document.removeEventListener('keydown', (modal as any).__escHandler, true); (modal as any).__escHandler = null; } };

  (w as any).openCustomizeColumnsModal = () => (w as any).app.openCustomizeColumnsModal();
  (w as any).closeCustomizeColumnsModal = () => (w as any).app.closeCustomizeColumnsModal();
  (w as any).openWipModal = (columnId:any) => (w as any).app.openWipModal(columnId);
  (w as any).closeWipModal = () => (w as any).app.closeWipModal();

  (w as any).openSettingsModal = () => {
    try {
      const modal = document.getElementById('settingsModal');
      console.debug('[src/app.ts] openSettingsModal invoked; modalExists=', !!modal, 'appExists=', !!(w as any).app);
      if (!modal || !(w as any).app) return;

      // If the settings modal hasn't been populated (Next.js injects an empty placeholder)
      // populate a minimal but fully-featured settings form so the wiring below can find
      // the expected elements by id. This mirrors the original static `index.html` markup
      // but keeps the template small and focused on ids used by the code.
      try {
        if (!modal.querySelector('.modal-content') || modal.innerHTML.trim() === '') {
          modal.innerHTML = `
            <div class="modal-content">
              <div class="modal-header">
                <h2 class="modal-title" id="settingsTitle">Settings</h2>
                <button class="close-btn" onclick="closeSettingsModal()" aria-label="Close">&times;</button>
              </div>
              <form id="settingsForm" class="form-grid">
                <div class="form-group">
                  <div class="form-label">Theme</div>
                  <div class="segmented" role="tablist" aria-label="Theme">
                    <button type="button" id="themeLightBtn" class="seg-btn">Light</button>
                    <button type="button" id="themeDarkBtn" class="seg-btn">Dark</button>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="showStatsToggle">Stats Bar</label>
                  <input type="checkbox" id="showStatsToggle"> Show stats bar on header
                </div>
                <div class="form-group">
                  <button type="button" class="btn" id="openCustomizeColumnsBtn">Customize columns…</button>
                  <button type="button" class="btn btn-ghost" id="clearAllWipBtn">Clear all WIP limits</button>
                </div>
                <div class="form-actions">
                  <div class="right-actions">
                    <button type="button" class="btn btn-ghost" onclick="closeSettingsModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                  </div>
                </div>
              </form>
            </div>
          `;
        }
      } catch (err) { console.error('[src/app.ts] failed to populate settingsModal', err); }
      document.body.classList.add('modal-open');
      modal.classList.add('show');
      const overlay = (e:any) => { if (e.target === modal) (w as any).closeSettingsModal(); };
      const esc = (e:any) => { if (e.key === 'Escape') { e.preventDefault(); (w as any).closeSettingsModal(); } };
      if ((modal as any).__overlayHandler) modal.removeEventListener('click', (modal as any).__overlayHandler);
      (modal as any).__overlayHandler = overlay; modal.addEventListener('click', (modal as any).__overlayHandler);
      if ((modal as any).__escHandler) document.removeEventListener('keydown', (modal as any).__escHandler, true);
      (modal as any).__escHandler = esc; document.addEventListener('keydown', (modal as any).__escHandler, true);
      const lightBtn = document.getElementById('themeLightBtn');
      const darkBtn = document.getElementById('themeDarkBtn');
      const setSeg = () => { const isLight = document.body.getAttribute('data-theme') === 'light'; lightBtn?.classList.toggle('active', isLight); darkBtn?.classList.toggle('active', !isLight); };
      setSeg();
      lightBtn?.addEventListener('click', () => { (w as any).app.theme = 'light'; (w as any).app.applyTheme(); setSeg(); (w as any).app.savePrefs?.(); });
      darkBtn?.addEventListener('click', () => { (w as any).app.theme = 'dark'; (w as any).app.applyTheme(); setSeg(); (w as any).app.savePrefs?.(); });

      const stats = document.getElementById('statsBar');
      const chk = document.getElementById('showStatsToggle') as HTMLInputElement | null;
      const current = localStorage.getItem('ZenBoard_showStats');
      const show = current === null ? true : current === 'true';
      if (chk) { chk.checked = show; }
      const applyStats = (val:boolean) => { if (stats) stats.style.display = val ? 'grid' : 'none'; localStorage.setItem('ZenBoard_showStats', String(val)); };
      applyStats(show);
      chk?.addEventListener('change', (e:any) => applyStats(!!e.target.checked));

      document.getElementById('openCustomizeColumnsBtn')?.addEventListener('click', () => { try { (w as any).closeSettingsModal?.(); } catch {} setTimeout(() => { (w as any).app.openCustomizeColumnsModal?.(); }, 0); });
      document.getElementById('clearAllWipBtn')?.addEventListener('click', () => { try { Object.keys((w as any).app.wipLimits || {}).forEach(k => (w as any).app.setWipLimit?.(k, null)); (w as any).Notifications?.showNotification('WIP limits cleared', 'All columns have no WIP limit now', null, 'info'); } catch {} });

      const form = document.getElementById('settingsForm');
      form?.addEventListener('submit', (e:any) => { e.preventDefault(); (w as any).closeSettingsModal(); });
    } catch {}
  };
  (w as any).closeSettingsModal = () => { const modal = document.getElementById('settingsModal'); modal?.classList.remove('show'); document.body.classList.remove('modal-open'); if ((modal as any)?.__overlayHandler) { modal.removeEventListener('click', (modal as any).__overlayHandler); (modal as any).__overlayHandler = null; } if ((modal as any)?.__escHandler) { document.removeEventListener('keydown', (modal as any).__escHandler, true); (modal as any).__escHandler = null; } };

  // Wire settings button with visual flash + debug to assist debugging in TS/Next.js path
  (function enableSettingsButton(){
    function wire() {
      try {
        const btn = document.getElementById('settingsBtn');
        if (!btn) { console.debug('[src/app.ts] settingsBtn not found'); return; }
        console.debug('[src/app.ts] wiring settingsBtn click handler');
        btn.addEventListener('click', (e:any) => {
          try { (btn as HTMLElement).style.outline = '3px solid rgba(30,144,255,0.95)'; setTimeout(() => { (btn as HTMLElement).style.outline = ''; }, 600); } catch (err) {}
          console.debug('[src/app.ts] settingsBtn clicked');
          try { (w as any).openSettingsModal(); } catch (err) { console.error('[src/app.ts] openSettingsModal threw', err); }
        });
        btn.addEventListener('keydown', (e:any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (btn as HTMLElement).click(); } });
      } catch (e) { console.error('[src/app.ts] enableSettingsButton error', e); }
    }
    window.addEventListener('DOMContentLoaded', wire);
    if (document.readyState === 'interactive' || document.readyState === 'complete') setTimeout(wire, 0);
  })();

  (w as any).scrollToColumn = (columnId:string) => { try { const el = document.querySelector(`section.column[data-column-id="${columnId}"]`) || document.querySelector(`[data-column-id="${columnId}"]`); if (!el) return; (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => { (window as any).activateColumn?.(el, { pulse: true }); }, 350); } catch {} };

  (w as any).activateColumn = function(el:any, opts:any = {}) {
    try {
      document.querySelectorAll('section.column.active').forEach(node => (node as HTMLElement).classList.remove('active'));
      (el as HTMLElement).classList.add('active');
      try {
        const id = (el as HTMLElement).getAttribute('data-column-id');
        const nav = document.getElementById('bottomNav');
        if (id && nav) {
          nav.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
          const btn = nav.querySelector(`.bn-item[data-target="${id}"]`);
          if (btn) { btn.classList.add('active'); const accent = getComputedStyle(el as Element).getPropertyValue('--col-accent').trim(); if (accent) nav.style.setProperty('--bn-active', accent); }
        }
      } catch {}
      if (opts.pulse) {
        (el as HTMLElement).classList.add('pulse-once'); (el as HTMLElement).classList.add('flash-accent'); setTimeout(() => (el as HTMLElement).classList.remove('pulse-once'), 700); setTimeout(() => (el as HTMLElement).classList.remove('flash-accent'), 800);
      }
    } catch {}
  };

  // Column observer omitted for brevity; keep original behavior by leaving hook points intact

  // Guest banner removed (legacy sign-in message no longer shown)

  // Stats pulse observer and make stat cards open the Stats modal (restores pre-conversion behavior)
  (function pulseStatsOnChange(){
    try {
      const ids = ['totalTasks','completedTasks','inProgressTasks','productivityScore','overdueInfo'];
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'childList' && (m.target as HTMLElement).classList) {
            try { (m.target as HTMLElement).classList.add('pulse'); } catch {}
            setTimeout(() => { try { (m.target as HTMLElement).classList.remove('pulse'); } catch {} }, 650);
          }
        }
      });
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el, { childList: true });
      });
    } catch {}
  })();

  // Make stat cards open the Stats modal (keyboard & click)
  (function enableStatsClick(){
    function wire() {
      try {
        const cards = Array.from(document.querySelectorAll('#statsBar .stat-card'));
        console.debug('[src/app.ts] wiring stat-card handlers, found', cards.length);
        cards.forEach((card:any) => {
          (card as HTMLElement).onclick = () => {
            console.debug('[src/app.ts] stat-card clicked');
            try { (card as HTMLElement).style.outline = '3px solid rgba(220,20,60,0.95)'; setTimeout(() => { (card as HTMLElement).style.outline = ''; }, 600); } catch (e) {}
            (w as any).openStatsModal?.();
          };
          (card as HTMLElement).onkeydown = (e:any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); console.debug('[src/app.ts] stat-card key activated', e.key); try { (card as HTMLElement).style.outline = '3px solid rgba(220,20,60,0.95)'; setTimeout(() => { (card as HTMLElement).style.outline = ''; }, 600); } catch (e) {} (w as any).openStatsModal?.(); } };
        });
      } catch {}
    }
    window.addEventListener('DOMContentLoaded', wire);
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      setTimeout(wire, 0);
    }
  })();

  // Auth functionality removed - using local storage only

})();

