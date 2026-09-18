(() => {
  const MEASUREMENT_ID = 'G-QHZPWRM6DE';
  const CONSENT_KEY = 'avyena_analytics_consent';

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

  function removeBanner() {
    document.getElementById('avyena-cookie-consent')?.remove();
  }

  function showBanner() {
    removeBanner();

    const en = currentLanguage() === 'en';
    const banner = document.createElement('div');
    banner.id = 'avyena-cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', en ? 'Analytics preferences' : 'Preferências de analítica');
    banner.className = 'avyena-cookie-consent';

    const text = document.createElement('div');
    text.className = 'avyena-cookie-consent__text';
    text.innerHTML = en
      ? 'We use Google Analytics only with your permission to understand website usage and improve our services. <a class="avyena-cookie-consent__link" href="/privacy-cookies.html">Privacy & Cookies</a>.'
      : 'Usamos o Google Analytics apenas com a sua autorização para compreender a utilização do site e melhorar os nossos serviços. <a class="avyena-cookie-consent__link" href="/privacy-cookies.html">Privacidade & Cookies</a>.';

    const actions = document.createElement('div');
    actions.className = 'avyena-cookie-consent__actions';

    const decline = document.createElement('button');
    decline.type = 'button';
    decline.textContent = en ? 'Decline' : 'Recusar';
    decline.className = 'avyena-cookie-consent__button';

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = en ? 'Accept analytics' : 'Aceitar analítica';
    accept.className = 'avyena-cookie-consent__button avyena-cookie-consent__button--accept';

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

    actions.append(decline, accept);
    banner.append(text, actions);
    document.body.appendChild(banner);
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('[data-avyena-cookie-settings]');
    if (!trigger) return;
    event.preventDefault();
    window.AvyenaCookieSettings?.();
  });

  window.AvyenaCookieSettings = () => {
    try { localStorage.removeItem(CONSENT_KEY); } catch (_) {}
    applyConsent(false);
    showBanner();
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
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner, { once: true });
  } else {
    showBanner();
  }
})();
