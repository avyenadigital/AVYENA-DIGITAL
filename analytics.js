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
    banner.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:18px',
      'transform:translateX(-50%)',
      'z-index:99999',
      'width:min(92vw,760px)',
      'background:rgba(3,8,20,.97)',
      'border:1px solid rgba(0,229,255,.24)',
      'box-shadow:0 16px 50px rgba(0,0,0,.45)',
      'border-radius:16px',
      'padding:16px 18px',
      'color:#eef5ff',
      'font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'backdrop-filter:blur(14px)'
    ].join(';');

    const text = document.createElement('div');
    text.style.cssText = 'margin:0 0 12px';
    text.innerHTML = en
      ? 'We use Google Analytics only with your permission to understand website usage and improve our services. <a href="/privacy-cookies.html" style="color:#00e5ff">Privacy & Cookies</a>.'
      : 'Usamos o Google Analytics apenas com a sua autorização para compreender a utilização do site e melhorar os nossos serviços. <a href="/privacy-cookies.html" style="color:#00e5ff">Privacidade & Cookies</a>.';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap';

    const decline = document.createElement('button');
    decline.type = 'button';
    decline.textContent = en ? 'Decline' : 'Recusar';
    decline.style.cssText = 'border:1px solid rgba(255,255,255,.22);background:transparent;color:#eef5ff;border-radius:999px;padding:9px 15px;cursor:pointer;font:inherit';

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = en ? 'Accept analytics' : 'Aceitar analítica';
    accept.style.cssText = 'border:0;background:#00e5ff;color:#031018;border-radius:999px;padding:9px 15px;cursor:pointer;font:700 14px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';

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
