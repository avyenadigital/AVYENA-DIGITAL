const MAX_BODY_BYTES = 12 * 1024;

const ALLOWED_SERVICES = new Set([
  'Gestão de Redes Sociais', 'Social Media Management',
  'Google Business & Presença Local', 'Google Business & Local Presence',
  'Soluções Digitais & Experiência', 'Digital Solutions & Customer Experience',
  'Websites & Landing Pages',
  'Branding & Identidade Visual', 'Branding & Visual Identity',
  'SEO & Visibilidade Online', 'SEO & Online Visibility',
  'Publicidade Digital', 'Digital Advertising'
]);

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
}[c]));

const clean = (value = '', max = 200) => String(value)
  .replace(/\u0000/g, '')
  .replace(/\r\n?/g, '\n')
  .trim()
  .slice(0, max);

const json = (res, status, body) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
};

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // permits non-browser clients; remaining validations still apply

  const defaults = ['https://avyena.pt', 'https://www.avyena.pt'];
  const configured = String(process.env.CONTACT_ALLOWED_ORIGINS || '')
    .split(',').map(v => v.trim()).filter(Boolean);
  return new Set([...defaults, ...configured]).has(origin);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok:false, message:'Método não permitido.' });
  }

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return json(res, 415, { ok:false, message:'Formato de pedido inválido.' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json(res, 413, { ok:false, message:'Pedido demasiado longo.' });
  }

  if (!originAllowed(req)) {
    return json(res, 403, { ok:false, message:'Origem não autorizada.' });
  }

  const fetchSite = String(req.headers['sec-fetch-site'] || '');
  if (fetchSite && !['same-origin', 'same-site'].includes(fetchSite)) {
    return json(res, 403, { ok:false, message:'Pedido não autorizado.' });
  }

  if (req.headers['x-requested-with'] !== 'AVYENA-Contact') {
    return json(res, 403, { ok:false, message:'Pedido não autorizado.' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const website = clean(body.website, 200);
    if (website) return json(res, 200, { ok:true }); // honeypot

    const nome = clean(body.nome, 120);
    const empresa = clean(body.empresa, 160);
    const email = clean(body.email, 254).toLowerCase();
    const telefone = clean(body.telefone, 50);
    const servico = clean(body.servico, 100);
    const mensagem = clean(body.mensagem, 3000);

    if (!nome || !email || !servico || !mensagem) {
      return json(res, 400, { ok:false, message:'Preenche os campos obrigatórios.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)) {
      return json(res, 400, { ok:false, message:'Indica um email válido.' });
    }

    if (!ALLOWED_SERVICES.has(servico)) {
      return json(res, 400, { ok:false, message:'Seleciona um serviço válido.' });
    }

    if (telefone && !/^[0-9+().\-\s]{5,50}$/u.test(telefone)) {
      return json(res, 400, { ok:false, message:'Indica um telefone válido.' });
    }

    if (!process.env.RESEND_API_KEY) {
      return json(res, 500, { ok:false, message:'O envio de email ainda não está configurado no servidor.' });
    }

    const safeSubjectService = servico.replace(/[\r\n]/g, ' ').slice(0, 80);
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Novo contacto — AVYENA Digital</h2>
      <p><b>Nome:</b> ${escapeHtml(nome)}</p>
      <p><b>Empresa:</b> ${escapeHtml(empresa)}</p>
      <p><b>Email:</b> ${escapeHtml(email)}</p>
      <p><b>Telefone:</b> ${escapeHtml(telefone)}</p>
      <p><b>Serviço:</b> ${escapeHtml(servico)}</p>
      <p><b>Mensagem:</b><br>${escapeHtml(mensagem).replace(/\n/g,'<br>')}</p>
    </div>`;

    const text = [
      'Novo contacto — AVYENA Digital',
      `Nome: ${nome}`, `Empresa: ${empresa}`, `Email: ${email}`,
      `Telefone: ${telefone}`, `Serviço: ${servico}`, '', mensagem
    ].join('\n');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method:'POST',
        signal: controller.signal,
        headers:{
          'Authorization':`Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          from:process.env.CONTACT_FROM || 'AVYENA Website <onboarding@resend.dev>',
          to:['geral@avyena.pt'],
          reply_to:email,
          subject:`Novo contacto AVYENA — ${safeSubjectService}`,
          html,
          text
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // Do not expose provider details to the browser.
      return json(res, 502, { ok:false, message:'Não foi possível enviar agora. Tenta novamente.' });
    }

    return json(res, 200, { ok:true });
  } catch (error) {
    console.error('Contact form error:', error instanceof Error ? error.message : 'unknown error');
    return json(res, 500, { ok:false, message:'Ocorreu um erro. Tenta novamente.' });
  }
}
