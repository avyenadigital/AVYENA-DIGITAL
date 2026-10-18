const crypto = require('node:crypto');
const BASE = 'https://www.avyena.pt';
const SEGMENT = '179db3a5-e00c-4d4f-9c1f-ae2531170ef5';
const VERSION = '2026-10-18';
const limits = new Map();
const apiKey = () => process.env.NEWSLETTER_RESEND_API_KEY || process.env.RESEND_API_KEY;
const key = () => process.env.NEWSLETTER_SIGNING_SECRET;
const sign = value => crypto.createHmac('sha256', key()).update(value).digest('base64url');
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
function token(email, lang, source) {
  // Stable within each hour: provider idempotency avoids duplicate confirmation emails across instances.
  const issued = Math.floor(Date.now()/3600000)*3600000;
  const payload = Buffer.from(JSON.stringify({email, lang, source, issued, expires:issued+24*3600000, version:VERSION})).toString('base64url');
  return payload+'.'+sign(payload);
}
function verify(value) {
  try {
    if (typeof value !== 'string' || value.length > 1800) return null;
    const parts=value.split('.'); if(parts.length!==2) return null;
    const [p,s]=parts;
    if(!/^[\w-]+$/.test(p)||!/^[\w-]{43}$/.test(s)||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(sign(p))))return null;
    const data=JSON.parse(Buffer.from(p,'base64url').toString());
    return validEmail(data.email)&&Number.isFinite(data.expires)&&data.expires>Date.now()?data:null;
  } catch { return null; }
}
async function api(path, method='GET', body, idempotency) {
  const response=await fetch('https://api.resend.com'+path,{method,signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+apiKey(),'Content-Type':'application/json',...(idempotency?{'Idempotency-Key':idempotency}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(response.status===404&&method==='GET')return null;
  if(!response.ok)throw new Error('Newsletter provider status '+response.status);
  return response.json();
}
function allow(req) {
 const origins=[BASE,'https://avyena.pt',...String(process.env.CONTACT_ALLOWED_ORIGINS||'').split(',').filter(Boolean)];
 return (!req.headers.origin||origins.includes(req.headers.origin))&&(!req.headers['sec-fetch-site']||['same-origin','same-site','none'].includes(req.headers['sec-fetch-site']));
}
function limited(id,max,ms){const now=Date.now();for(const [k,v] of limits)if(v.end<=now)limits.delete(k);const v=limits.get(id)||{count:0,end:now+ms};v.count++;limits.set(id,v);return v.count>max;}
function confirmationEmail(link,en) {
 const title=en?'Confirm your subscription':'Confirme a sua subscrição';
 const copy=en?'Thank you for choosing to follow AVYENA. Confirm below to receive our news, projects and ideas for your business.':'Obrigado por querer acompanhar a AVYENA. Confirme abaixo para receber as nossas novidades, projetos e ideias para o seu negócio.';
 const notice=en?'This link expires within 24 hours. If you did not request this email, ignore it. You will not be subscribed.':'Este link expira no prazo de 24 horas. Se não fez este pedido, ignore a mensagem. Não ficará inscrito.';
 const text=`AVYENA Insights\n\n${title}\n\n${copy}\n\n${link}\n\n${notice}\n\nAVYENA Digital · geral@avyena.pt`;
 const html=`<!doctype html><html lang="${en?'en':'pt-PT'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background-color:#02050d"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px"><tr><td bgcolor="#07101f" style="padding:32px;font-family:Arial,Helvetica,sans-serif"><img src="${BASE}/avyena-logo.png" alt="AVYENA Digital" width="200" height="53" border="0" style="display:block;object-fit:contain"><h1 style="color:#f7f9ff;font-size:27px;line-height:1.3">${title}</h1><p style="color:#cbd3e5;font-size:16px;line-height:1.7">${copy}</p><p style="padding-top:16px;padding-bottom:16px"><a href="${link}" style="display:inline-block;background-color:#1f63ff;color:#ffffff;padding:16px 22px;border-radius:8px;text-decoration:none;font-size:16px">${title}</a></p><p style="color:#aeb8cf;font-size:14px;line-height:1.6">${notice}</p><p style="color:#aeb8cf;font-size:14px;line-height:1.6">AVYENA Digital · <a href="mailto:geral@avyena.pt" style="color:#aeb8cf">geral@avyena.pt</a></p></td></tr></table></td></tr></table></body></html>`;
 return {html,text,subject:en?'Confirm your AVYENA Insights subscription':'Confirme a subscrição da AVYENA Insights'};
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 try {
  const url=new URL(req.url,BASE),action=url.searchParams.get('action');
  // Legacy links land on a page; scanners never subscribe a person just by opening a link.
  if(req.method==='GET'&&action==='confirm')return res.status(303).setHeader('Location','/newsletter#token='+encodeURIComponent(url.searchParams.get('token')||'')).end();
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Operação não permitida.'});}
  if(!allow(req))return res.status(403).json({error:'Origem não autorizada.'});
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'Formato inválido.'});
  const d=req.body;if(!d||typeof d!=='object'||Array.isArray(d)||Buffer.byteLength(JSON.stringify(d))>4096)return res.status(400).json({error:'Pedido inválido.'});
  if(d.website)return res.status(200).json({ok:true});
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
  if(limited('ip:'+ip,12,60000))return res.status(429).json({error:'Aguarde um minuto antes de voltar a tentar.'});
  if(!key()||!apiKey())return res.status(503).json({error:'Serviço temporariamente indisponível.'});
  if(action==='subscribe'){
   const email=String(d.email||'').trim().toLowerCase();
   if(!validEmail(email)||d.consent!==true)return res.status(400).json({error:'Confirme o email e a autorização para receber a newsletter.'});
   if(limited('email:'+sign(email),3,3600000))return res.status(429).json({error:'Já enviámos pedidos recentes. Verifique o seu email ou tente mais tarde.'});
   const lang=d.lang==='en'?'en':'pt';
   const source=['homepage','guia-gratuito','newsletter'].includes(d.source)?d.source:'newsletter';
   const t=token(email,lang,source);
   const link=BASE+'/newsletter?lang='+lang+'#token='+encodeURIComponent(t);
   const mail=confirmationEmail(link,lang==='en');
   await api('/emails','POST',{from:'AVYENA Digital <newsletter@avyena.pt>',to:[email],reply_to:'geral@avyena.pt',...mail},'newsletter-confirm-'+crypto.createHash('sha256').update(t).digest('hex'));
   return res.status(200).json({ok:true});
  }
  if(action==='confirm'){
   const t=verify(d.token);if(!t)return res.status(400).json({error:'O link é inválido ou expirou. Peça uma nova confirmação.'});
   const path='/contacts/'+encodeURIComponent(t.email);
   const existing=await api(path);
   // Never undo a cancellation through an old or replayed confirmation link.
   if(existing?.unsubscribed)return res.status(409).json({error:'Este contacto tem a subscrição cancelada. Para voltar a receber novidades, contacte geral@avyena.pt.'});
   const properties={newsletter_consent_at:existing?.properties?.newsletter_consent_at||new Date().toISOString(),newsletter_source:t.source||'guia-gratuito',newsletter_consent_version:t.version||VERSION};
   if(!existing)await api('/contacts','POST',{email:t.email,unsubscribed:false,segments:[{id:SEGMENT}],properties});
   else {
    await api(path,'PATCH',{properties});
    await api(path+'/segments/'+SEGMENT,'POST');
   }
   return res.status(200).json({ok:true});
  }
  return res.status(400).json({error:'Operação inválida.'});
 } catch(e){console.error('Newsletter:',e.message);return res.status(502).json({error:'Não foi possível concluir o pedido. Tente novamente mais tarde.'});}
};
