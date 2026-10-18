import contact from './contact.js';
const sources = {
  'diagnostico-digital': ['Diagnóstico digital gratuito', 'SEO & Visibilidade Online'],
  'criacao-websites': ['Proposta de website', 'Websites & Landing Pages'],
  'guia-gratuito': ['Pedido do guia gratuito', 'Soluções Digitais & Experiência'],
  'black-friday': ['Black Friday 2026', null]
};
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ok:false,message:'Método não permitido.'});
  const b = req.body;
  if (!b || typeof b !== 'object' || Array.isArray(b) || Buffer.byteLength(JSON.stringify(b)) > 12000)
    return res.status(400).json({ok:false,message:'Pedido inválido.'});
  const source = Object.hasOwn(sources, b.source) ? sources[b.source] : null;
  if (!source || b.privacy !== true) return res.status(400).json({ok:false,message:'Confirme a leitura da política de privacidade.'});
  if (b.source === 'black-friday' && !(Date.now() >= Date.parse('2026-11-01T00:00:00Z') && Date.now() < Date.parse('2026-12-01T00:00:00Z')))
    return res.status(409).json({ok:false,message:'A campanha decorre de 1 a 30 de novembro de 2026.'});
  if (b.source !== 'guia-gratuito' && (!String(b.empresa || '').trim() || !String(b.mensagem || '').trim()))
    return res.status(400).json({ok:false,message:'Preencha a empresa e a mensagem.'});
  const clean = v => String(v || '').replace(/[\r\n]/g, ' ').slice(0,300);
  const message = [source[0], `Página: /${b.source}`, `Link do negócio: ${clean(b.link)}`,
    'Privacidade: aceite para este pedido.', `Data: ${new Date().toISOString()}`,
    `Origem da campanha: ${clean(b.utm_source)}`, `Campanha: ${clean(b.utm_campaign)}`,
    '', String(b.mensagem || 'Solicitou acesso ao guia prático.').slice(0,1800)].join('\n');
  req.body = {...b, lang:'pt', servico:source[1] || b.servico, mensagem:message};
  return contact(req,res);
}
