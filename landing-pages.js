(() => {
  'use strict';
  document.querySelector('[data-print-guide]')?.addEventListener('click', () => window.print());
  const source = document.body.dataset.landing;
  const form = document.querySelector('.lp-form');
  if (!form) return;
  const note = form.querySelector('.lp-note');
  const button = form.querySelector('[type=submit]');
  if (new URLSearchParams(location.search).get('newsletter') === 'confirmed') note.textContent = 'Subscrição confirmada. Obrigado por acompanhar a AVYENA!';
  const track = event => window.AvyenaAnalytics?.track(event, {landing_page:source});
  form.addEventListener('focusin', () => track('landing_form_start'), {once:true});
  if (source === 'black-friday') {
    fetch('/api/landing-campaign').then(r => {if (!r.ok) throw Error(); return r.json();}).then(data => {
      const status = document.querySelector('#campaign-status');
      form.hidden = !data.active;
      if (data.active) status.textContent = 'Campanha disponível até 30 de novembro de 2026.';
      else if (data.now >= data.end) status.textContent = 'Esta campanha terminou. Pode continuar a falar connosco através do contacto no site principal.';
    }).catch(() => { document.querySelector('#campaign-status').textContent = 'Não foi possível verificar a campanha. Tente novamente mais tarde ou contacte geral@avyena.pt.'; });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    button.disabled = true;
    note.textContent = 'A enviar o seu pedido…';
    const body = Object.fromEntries(new FormData(form));
    const wantsNewsletter = Boolean(body.newsletter);
    body.source = source;
    body.privacy = true;
    const params = new URLSearchParams(location.search);
    body.utm_source = (params.get('utm_source') || '').slice(0,150);
    body.utm_campaign = (params.get('utm_campaign') || '').slice(0,150);
    try {
      const response = await fetch('/api/landing-contact', {method:'POST', headers:{'Content-Type':'application/json','X-Requested-With':'AVYENA-Contact'},body:JSON.stringify(body)});
      const result = await response.json();
      if (!response.ok || !result.ok) throw Error(result.message || 'Não foi possível enviar. Tente novamente.');
      track('generate_lead');
      form.reset();
      if (source === 'guia-gratuito') {
        form.querySelector('.lp-success').hidden = false;
        note.textContent = 'O guia está disponível abaixo. Pode abri-lo e guardá-lo.';
        if (wantsNewsletter) {
          try {
            const nr = await fetch('/api/landing-newsletter?action=subscribe', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:body.email,consent:true,website:body.website,source:'guia-gratuito',lang:'pt'})});
            if (!nr.ok) throw Error();
            note.textContent += ' Enviámos também um email para confirmar a newsletter.';
          } catch { note.textContent += ' Não foi possível iniciar a subscrição da newsletter. O acesso ao guia está disponível.'; }
        }
      } else note.textContent = 'Obrigado! Recebemos o seu pedido e vamos responder por email.';
    } catch(error) { note.textContent = error.message || 'Não foi possível enviar. Tente novamente.'; }
    finally {button.disabled = false;}
  });
})();
