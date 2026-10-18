const crypto = require('node:crypto');
const SEGMENT = '179db3a5-e00c-4d4f-9c1f-ae2531170ef5';
const BASE = 'https://www.avyena.pt';
const FROM = 'AVYENA Digital <newsletter@avyena.pt>';
const headers = {'Content-Type':'application/json','Cache-Control':'no-store'};
const key = () => process.env.NEWSLETTER_SIGNING_SECRET;
function sign(value){return crypto.createHmac('sha256',key()).update(value).digest('base64url');}
function token(email){const payload=Buffer.from(JSON.stringify({email,expires:Date.now()+24*3600*1000})).toString('base64url');return payload+'.'+sign(payload);}
function verify(t){const [p,s]=String(t||'').split('.');if(!p||!s||s.length!==43)return null;const expected=sign(p);if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return null;const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.expires>Date.now()&&typeof d.email==='string'?d.email:null;}
async function resend(path,body){const response=await fetch('https://api.resend.com'+path,{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok)throw new Error('Resend '+response.status+': '+(await response.text()).slice(0,400));return response.json();}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!process.env.RESEND_API_KEY||!key())return res.status(503).json({error:'Serviço temporariamente indisponível.'});
 try{
  const url=new URL(req.url,BASE),action=url.searchParams.get('action');
  if(req.method==='POST'&&action==='subscribe'){
   if((req.headers['content-type']||'').split(';')[0]!=='application/json')return res.status(415).json({error:'Formato inválido.'});
   const data=typeof req.body==='object'?req.body:JSON.parse(req.body||'{}');
   const email=String(data.email||'').trim().toLowerCase();
   if(data.website)return res.status(200).json({ok:true});
   if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||data.consent!==true)return res.status(400).json({error:'Confirme o email e a autorização para receber a newsletter.'});
   const link=BASE+'/api/newsletter?action=confirm&token='+encodeURIComponent(token(email));
   await resend('/emails',{from:FROM,to:[email],subject:'Confirme a subscrição da AVYENA Insights',reply_to:'geral@avyena.pt',html:'<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#18202d"><h1>AVYENA Insights</h1><p>Recebemos um pedido para subscrever a nossa newsletter mensal.</p><p>Para confirmar que este email é seu, clique no botão:</p><p><a href="'+link+'" style="display:inline-block;background:#172334;color:#fff;padding:14px 20px;text-decoration:none">Confirmar subscrição</a></p><p>Se não fez este pedido, ignore esta mensagem. O link expira em 24 horas.</p><p>AVYENA Digital</p></div>'});
   return res.status(200).json({ok:true,message:'Enviámos um email para confirmar a subscrição.'});
  }
  if(req.method==='GET'&&action==='confirm'){
   const email=verify(url.searchParams.get('token'));
   if(!email)return res.status(400).setHeader('Content-Type','text/html; charset=utf-8').end('<h1>Link inválido ou expirado</h1><p>Volte ao site e subscreva novamente.</p>');
   await resend('/contacts',{email,segments:[SEGMENT],unsubscribed:false});
   return res.status(303).setHeader('Location','/?newsletter=confirmed#newsletter').end();
  }
  return res.status(405).json({error:'Operação não permitida.'});
 }catch(e){console.error('Newsletter error',e.message);return res.status(500).json({error:'Não foi possível concluir o pedido. Tente novamente mais tarde.'});}
};