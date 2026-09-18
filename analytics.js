(() => {
  const MEASUREMENT_ID = 'G-QHZPWRM6DE';
  const CONSENT_KEY = 'avyena_analytics_consent';
  const CONSENT_CSS = '/privacy-consent.css?v=20260918';

  const copy = {
    pt: {
      bannerLabel: 'Preferências de privacidade',
      title: 'Privacidade e análise',
      body: 'Usamos analítica para perceber como o site é utilizado e melhorar a sua experiência.',
      privacy: 'Privacidade & Cookies',
      decline: 'Recusar',
      accept: 'Aceitar',
      preferences: 'Preferências',
      preferencesTitle: 'Preferências de privacidade',
      preferencesBody: 'Escolha os dados que nos permite utilizar. Pode alterar esta escolha a qualquer momento.',
      essential: 'Essenciais',
      essentialText: 'Necessários para o funcionamento e segurança do site.',
      alwaysOn: 'Sempre ativos',
      analytics: 'Analítica',
      analyticsText: 'Ajuda-nos a compreender como o site é utilizado e a melhorar os nossos serviços.',
      save: 'Guardar preferências',
      saved: 'Preferências guardadas',
      close: 'Fechar preferências'
    },
    en: {
      bannerLabel: 'Privacy preferences',
      title: 'Privacy & analytics',
      body: 'We use analytics to understand how the website is used and improve your experience.',
      privacy: 'Privacy & Cookies',
      decline: 'Decline',
      accept: 'Accept',
      preferences: 'Preferences',
      preferencesTitle: 'Privacy preferences',
      preferencesBody: 'Choose which data you allow us to use. You can change this choice at any time.',
      essential: 'Essential',
      essentialText: 'Required for the website to function securely.',
      alwaysOn: 'Always active',
      analytics: 'Analytics',
      analyticsText: 'Helps us understand how the website is used and improve our services.',
      save: 'Save preferences',
      saved: 'Preferences saved',
      close: 'Close preferences'
    }
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function consentValue() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
  }

  function loadAnalytics() {
    if (document.querySelector('script[data-avyena-ga4]')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    script.dataset.avyenaGa4 = 'true';
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
  }

  function applyConsent(granted) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (granted) loadAnalytics();
  }

  function currentLanguage() {
    try {
      if (localStorage.getItem('avyena_lang') === 'en') return 'en';
    } catch (_) {}
    return (document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'pt';
  }

  function tr(key) {
    return copy[currentLanguage()][key];
  }

  function ensureConsentStyles() {
    const existing = document.querySelector('link[data-avyena-consent-styles]');
    if (existing) return Promise.resolve();

    return new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CONSENT_CSS;
      link.dataset.avyenaConsentStyles = 'true';
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
      window.setTimeout(resolve, 1200);
    });
  }

  function removeBanner() {
    document.getElementById('avyena-cookie-consent')?.remove();
  }

  function removePreferences() {
    document.getElementById('avyena-privacy-preferences')?.remove();
    document.body.classList.remove('avyena-privacy-open');
  }

  function analyticsIcon() {
    const icon = document.createElement('span');
    icon.className = 'avyena-cookie-consent__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<span></span><span></span><span></span>';
    return icon;
  }

  function showToast() {
    document.querySelector('.avyena-privacy-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'avyena-privacy-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<span class="avyena-privacy-toast__check" aria-hidden="true">✓</span><span>' + tr('saved') + '</span>';
    document.body.appendChild(toast);
    window.setTimeout(() => toast.classList.add('is-visible'), 20);
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 260);
    }, 2200);
  }

  function showPreferences() {
    removePreferences();

    const overlay = document.createElement('div');
    overlay.id = 'avyena-privacy-preferences';
    overlay.className = 'avyena-privacy-preferences';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'avyena-privacy-title');

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'avyena-privacy-preferences__backdrop';
    backdrop.setAttribute('aria-label', tr('close'));

    const panel = document.createElement('div');
    panel.className = 'avyena-privacy-preferences__panel';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'avyena-privacy-preferences__close';
    close.setAttribute('aria-label', tr('close'));
    close.textContent = '×';

    const heading = document.createElement('div');
    heading.className = 'avyena-privacy-preferences__heading';
    heading.innerHTML =
      '<p class="avyena-privacy-preferences__eyebrow">AVYENA DIGITAL</p>' +
      '<h2 id="avyena-privacy-title">' + tr('preferencesTitle') + '</h2>' +
      '<p>' + tr('preferencesBody') + '</p>';

    const settings = document.createElement('div');
    settings.className = 'avyena-privacy-preferences__settings';

    const essential = document.createElement('div');
    essential.className = 'avyena-privacy-preferences__row';
    essential.innerHTML =
      '<div><strong>' + tr('essential') + '</strong><p>' + tr('essentialText') + '</p></div>' +
      '<span class="avyena-privacy-preferences__always">' + tr('alwaysOn') + '</span>';

    const analyticsRow = document.createElement('label');
    analyticsRow.className = 'avyena-privacy-preferences__row avyena-privacy-preferences__row--toggle';

    const analyticsText = document.createElement('div');
    analyticsText.innerHTML =
      '<strong>' + tr('analytics') + '</strong>' +
      '<p>' + tr('analyticsText') + '</p>';

    const toggle = document.createElement('span');
    toggle.className = 'avyena-privacy-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = consentValue() === 'granted';
    checkbox.setAttribute('aria-label', tr('analytics'));

    const slider = document.createElement('span');
    slider.className = 'avyena-privacy-toggle__slider';
    slider.setAttribute('aria-hidden', 'true');

    toggle.append(checkbox, slider);
    analyticsRow.append(analyticsText, toggle);
    settings.append(essential, analyticsRow);

    const footer = document.createElement('div');
    footer.className = 'avyena-privacy-preferences__footer';

    const privacyLink = document.createElement('a');
    privacyLink.href = '/privacy-cookies.html';
    privacyLink.textContent = tr('privacy');

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'avyena-privacy-preferences__save';
    save.textContent = tr('save');

    footer.append(privacyLink, save);
    panel.append(close, heading, settings, footer);
    overlay.append(backdrop, panel);
    document.body.appendChild(overlay);
    document.body.classList.add('avyena-privacy-open');

    const closePanel = () => removePreferences();

    backdrop.addEventListener('click', closePanel);
    close.addEventListener('click', closePanel);
    save.addEventListener('click', () => {
      const granted = checkbox.checked;
      setConsent(granted ? 'granted' : 'denied');
      applyConsent(granted);
      removePreferences();
      removeBanner();
      showToast();
    });

    window.setTimeout(() => close.focus(), 20);
  }

  function showBanner() {
    removeBanner();

    const banner = document.createElement('div');
    banner.id = 'avyena-cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', tr('bannerLabel'));
    banner.className = 'avyena-cookie-consent';

    const intro = document.createElement('div');
    intro.className = 'avyena-cookie-consent__intro';

    const copyWrap = document.createElement('div');
    copyWrap.className = 'avyena-cookie-consent__copy';

    const title = document.createElement('strong');
    title.className = 'avyena-cookie-consent__title';
    title.textContent = tr('title');

    const text = document.createElement('p');
    text.className = 'avyena-cookie-consent__text';
    text.append(document.createTextNode(tr('body') + ' '));

    const privacyLink = document.createElement('a');
    privacyLink.className = 'avyena-cookie-consent__link';
    privacyLink.href = '/privacy-cookies.html';
    privacyLink.textContent = tr('privacy');
    text.appendChild(privacyLink);

    copyWrap.append(title, text);
    intro.append(analyticsIcon(), copyWrap);

    const actions = document.createElement('div');
    actions.className = 'avyena-cookie-consent__actions';

    const decline = document.createElement('button');
    decline.type = 'button';
    decline.textContent = tr('decline');
    decline.className = 'avyena-cookie-consent__button';

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = tr('accept');
    accept.className = 'avyena-cookie-consent__button avyena-cookie-consent__button--accept';

    const preferences = document.createElement('button');
    preferences.type = 'button';
    preferences.textContent = tr('preferences');
    preferences.className = 'avyena-cookie-consent__preferences';

    decline.addEventListener('click', () => {
      setConsent('denied');
      applyConsent(false);
      removeBanner();
    });

    accept.addEventListener('click', () => {
      setConsent('granted');
      applyConsent(true);
      removeBanner();
    });

    preferences.addEventListener('click', showPreferences);

    actions.append(decline, accept, preferences);
    banner.append(intro, actions);
    document.body.appendChild(banner);
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-avyena-cookie-settings]');
    if (!trigger) return;
    event.preventDefault();
    window.AvyenaCookieSettings?.();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('avyena-privacy-preferences')) {
      removePreferences();
    }
  });

  window.AvyenaCookieSettings = () => {
    ensureConsentStyles().then(showPreferences);
  };

  window.AvyenaAnalytics = {
    track(eventName, params = {}) {
      if (consentValue() !== 'granted') return;
      loadAnalytics();
      window.gtag('event', eventName, params);
    }
  };

  const saved = consentValue();
  if (saved === 'granted') {
    applyConsent(true);
  } else if (saved === 'denied') {
    applyConsent(false);
  } else {
    const start = () => ensureConsentStyles().then(showBanner);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }
})();
