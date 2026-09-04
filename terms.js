(() => {
  'use strict';
  const pt = document.getElementById('legalPt');
  const en = document.getElementById('legalEn');
  const btn = document.getElementById('legalLang');
  const back = document.getElementById('backText');
  let lang = 'pt';
  try {
    const saved = localStorage.getItem('avyena_lang');
    if (saved === 'en' || saved === 'pt') lang = saved;
  } catch (_) {}

  const apply = () => {
    const isPt = lang === 'pt';
    pt.hidden = !isPt;
    en.hidden = isPt;
    document.documentElement.lang = isPt ? 'pt-PT' : 'en';
    document.title = isPt ? 'Termos de Utilização | AVYENA Digital' : 'Terms of Use | AVYENA Digital';
    btn.textContent = isPt ? 'EN' : 'PT';
    btn.setAttribute('aria-label', isPt ? 'Switch to English' : 'Mudar para Português');
    back.textContent = isPt ? 'Voltar ao site' : 'Back to website';
  };

  btn.addEventListener('click', () => {
    lang = lang === 'pt' ? 'en' : 'pt';
    try { localStorage.setItem('avyena_lang', lang); } catch (_) {}
    apply();
  });
  apply();
})();
