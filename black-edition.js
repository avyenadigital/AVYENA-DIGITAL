(() => {
  'use strict';
  const KEY = 'avyena:black-edition:2026:dismissed';
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const en = document.documentElement.lang.startsWith('en');
  const t = (pt, english) => en ? english : pt;
  const page = document.body.classList.contains('be-page');
  let config, dialog, linkbar, closeTimer, autoTimer, originFocus;
  let interacted = false, openedAutomatically = false;
  let sessionDismissed = 0;
  const pageURL = en ? '/en/black-edition-2026.html' : '/black-edition-2026.html';
  let receivedAt = 0;
  const now = () => config.now + (Date.now() - receivedAt);
  const active = () => config && (config.preview || (now() >= config.start && now() < config.end));
  const dismissed = () => {
    let timestamp = sessionDismissed;
    try { timestamp = Number(localStorage.getItem(KEY)) || timestamp; } catch (_) { /* Session fallback. */ }
    return timestamp > 0 && now() - timestamp < WEEK;
  };
  function remember() {
    sessionDismissed = now();
    try { localStorage.setItem(KEY, String(sessionDismissed)); } catch (_) { /* Storage may be blocked. */ }
  }
  function close() {
    if (!dialog?.open) return;
    clearTimeout(closeTimer);
    remember();
    dialog.close();
    document.body.classList.remove('be-scroll-lock');
    if (originFocus?.isConnected) originFocus.focus({ preventScroll: true });
  }
  function interact() {
    if (!dialog?.open) return;
    interacted = true;
    clearTimeout(closeTimer);
    dialog.querySelector('.be-timing').textContent = t('Pode explorar ao seu ritmo. Feche quando quiser.', 'Take your time. Close whenever you like.');
  }
  function open(manual = false) {
    if (!active() || dialog?.open) return;
    if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) {
      if (manual) window.location.assign(pageURL);
      return;
    }
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'be-dialog';
      dialog.setAttribute('aria-labelledby', 'be-title');
      dialog.setAttribute('aria-describedby', 'be-description');
      dialog.innerHTML = `<div class="be-inner"><button class="be-close" type="button" aria-label="${t('Fechar campanha', 'Close campaign')}">×</button><p class="be-eyebrow">AVYENA DIGITAL · ${t('NOVEMBRO', 'NOVEMBER')} 2026</p><p class="be-edition" aria-hidden="true">BLACK<span>EDITION <small>2026</small></span></p><h2 id="be-title">${t('Vai esperar por <span class="be-accent">2027</span> para se destacar?', 'Will you wait until <span class="be-accent">2027</span> to stand out?')}</h2><p class="be-lead" id="be-description">${t('A sua concorrência pode não esperar.', 'Your competitors might not wait.')}</p><div class="be-actions"><a class="be-button be-button-primary" href="${pageURL}">${t('Descobrir a campanha', 'Discover the campaign')}</a><button class="be-button be-continue" type="button">${t('Continuar a explorar o site', 'Continue exploring the website')}</button></div><p class="be-timing"></p></div>`;
      document.body.append(dialog);
      dialog.querySelector('.be-close').addEventListener('click', close);
      dialog.querySelector('.be-continue').addEventListener('click', close);
      dialog.querySelector('a').addEventListener('click', remember);
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.addEventListener('pointermove', interact);
      dialog.addEventListener('pointerdown', interact);
      dialog.addEventListener('keydown', interact);
      dialog.addEventListener('wheel', interact, { passive: true });
      dialog.addEventListener('focusin', () => { if (dialog.open && !openedAutomatically) interact(); });
    }
    originFocus = document.activeElement;
    interacted = manual;
    const timing = dialog.querySelector('.be-timing');
    timing.textContent = manual ? t('Pode explorar ao seu ritmo.', 'Take your time.') : t('Fecha após 8 segundos sem interação. ', 'Closes after 8 seconds without interaction. ');
    if (!manual) {
      const keep = document.createElement('button');
      keep.type = 'button';
      keep.textContent = t('Manter aberto', 'Keep open');
      keep.addEventListener('click', interact);
      timing.append(keep);
    }
    openedAutomatically = true;
    dialog.showModal();
    document.body.classList.add('be-scroll-lock');
    openedAutomatically = false;
    if (!manual) closeTimer = setTimeout(() => { if (!interacted) close(); }, 8000);
  }
  function blocked() {
    const el = document.activeElement;
    return document.hidden || !!document.querySelector('#avyena-cookie-consent, dialog[open], [aria-modal="true"]:not([hidden])') || !!el?.matches('input, textarea, select, [contenteditable="true"]');
  }
  function schedule() {
    if (!active() || dismissed()) return;
    autoTimer = setTimeout(() => {
      if (!active() || dismissed()) return;
      if (blocked()) { schedule(); return; }
      open();
    }, 3000);
  }
  function updatePage() {
    const form = document.getElementById('be-form');
    if (!form) return;
    const enabled = active();
    form.hidden = !enabled;
    document.getElementById('be-unavailable').hidden = enabled;
    document.getElementById('be-preview').hidden = !config.preview;
    document.getElementById('be-status').textContent = now() < config.start
      ? t('A Black Edition começa a 1 de novembro de 2026.', 'Black Edition starts on 1 November 2026.')
      : t('A Black Edition 2026 terminou. Continuamos disponíveis para o seu próximo projeto.', 'Black Edition 2026 has ended. We are still here for your next project.');
  }
  async function init() {
    try {
      const response = await fetch('/api/black-edition', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) return;
      config = await response.json();
      if (![config.now, config.start, config.end].every(Number.isFinite) || typeof config.preview !== 'boolean') return;
      receivedAt = Date.now();
    } catch (_) { return; } // Fail closed; never block the host site.
    if (page) {
      updatePage();
      setupForm();
    } else if (active()) {
      linkbar = document.createElement('div');
      linkbar.className = 'be-linkbar';
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.textContent = 'Black Edition';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', () => open(true));
      linkbar.append(trigger);
      if (config.preview) {
        const badge = document.createElement('span');
        badge.textContent = t('PRÉ-VISUALIZAÇÃO', 'PREVIEW');
        linkbar.append(badge);
      }
      const header = document.querySelector('.site-header');
      if (header) header.after(linkbar); else document.body.prepend(linkbar);
      schedule();
    }
    // Also expire a tab left open across midnight on 1 December.
    if (!config.preview && active()) {
      const expiryCheck = setInterval(() => {
        if (active()) return;
        clearInterval(expiryCheck);
        close();
        clearTimeout(autoTimer);
        linkbar?.remove();
        if (page) updatePage();
      }, 1000);
    }
  }
  function setupForm() {
    const form = document.getElementById('be-form');
    const note = document.getElementById('be-form-note');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!active()) { updatePage(); return; }
      if (!form.reportValidity()) return;
      const payload = Object.fromEntries(new FormData(form));
      payload.lang = en ? 'en' : 'pt';
      payload.mensagem = '[Black Edition 2026 — orçamento gratuito]\n' + payload.mensagem;
      if (config.preview) {
        note.textContent = t('Pedido validado em modo de demonstração. Nenhum email foi enviado.', 'Enquiry validated in demo mode. No email was sent.');
        return;
      }
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      note.textContent = t('A enviar o seu pedido…', 'Sending your enquiry…');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch('/api/contact', {
          method: 'POST', credentials: 'same-origin', signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'AVYENA-Contact' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || t('Não foi possível enviar. Tente novamente.', 'Could not send. Please try again.'));
        note.textContent = t('Pedido enviado. Vamos analisar o seu projeto e entrar em contacto.', 'Enquiry sent. We will review your project and get in touch.');
        form.reset();
      } catch (error) {
        note.textContent = error.name === 'AbortError' ? t('O envio demorou demasiado. Tente novamente.', 'Sending timed out. Please try again.') : error.message;
      } finally { clearTimeout(timeout); button.disabled = false; }
    });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && dialog?.open) interact(); });
  window.addEventListener('storage', event => { if (event.key === KEY) clearTimeout(autoTimer); });
  init();
})();
