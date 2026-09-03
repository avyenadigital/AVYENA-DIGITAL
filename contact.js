const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, message:'Método não permitido.' });
  try {
    const { nome='', empresa='', email='', telefone='', servico='', mensagem='', website='' } = req.body || {};
    if (website) return res.status(200).json({ ok:true });
    if (!email || !servico || !mensagem) return res.status(400).json({ ok:false, message:'Preenche os campos obrigatórios.' });
    if (!/^\S+@\S+\.\S+$/.test(email) || String(email).length > 180) return res.status(400).json({ ok:false, message:'Indica um email válido.' });
    if ([nome, empresa, telefone, servico, mensagem].some(v => String(v).length > 5000)) return res.status(400).json({ ok:false, message:'Pedido demasiado longo.' });
    if (!process.env.RESEND_API_KEY) return res.status(500).json({ ok:false, message:'O envio de email ainda não está configurado no servidor.' });

    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Novo contacto — AVYENA Digital</h2>
      <p><b>Nome:</b> ${escapeHtml(nome)}</p>
      <p><b>Empresa:</b> ${escapeHtml(empresa)}</p>
      <p><b>Email:</b> ${escapeHtml(email)}</p>
      <p><b>Telefone:</b> ${escapeHtml(telefone)}</p>
      <p><b>Serviço:</b> ${escapeHtml(servico)}</p>
      <p><b>Mensagem:</b><br>${escapeHtml(mensagem).replace(/\n/g,'<br>')}</p>
    </div>`;

    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:process.env.CONTACT_FROM || 'AVYENA Website <onboarding@resend.dev>',
        to:['geral@avyena.pt'],
        reply_to:email,
        subject:`Novo contacto AVYENA — ${String(servico).slice(0,100)}`,
        html
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ ok:false, message:'Não foi possível enviar agora. Tenta novamente.', detail:data?.message });
    return res.status(200).json({ ok:true });
  } catch {
    return res.status(500).json({ ok:false, message:'Ocorreu um erro. Tenta novamente.' });
  }
}
