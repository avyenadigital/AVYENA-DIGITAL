const assert=require('node:assert/strict');const crypto=require('node:crypto');
process.env['RESEND_API_KEY']='test';process.env.NEWSLETTER_SIGNING_SECRET='test';
const handler=require('../landing-newsletter.cjs');let sent=[],contact=null;let fail=false;
global.fetch=async(url,o)=>{if(fail)return {ok:false,status:403};const body=o.body?JSON.parse(o.body):null;sent.push({url,method:o.method,body,headers:o.headers});if(url.endsWith('/emails'))return {ok:true,status:200,json:async()=>({id:'test'})};if(o.method==='GET')return contact?{ok:true,status:200,json:async()=>contact}:{ok:false,status:404};if(o.method==='POST'&&url.endsWith('/contacts'))contact={id:'test',...body};return {ok:true,status:200,json:async()=>({id:'test'})};};
let ip=0;function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(s){this.code=s;return this},json(b){this.body=b;return this},end(){return this}}}
async function call(action,body,extra={}){const res=response();await handler({url:'/api/newsletter?action='+action,method:'POST',headers:{'content-type':'application/json',origin:'https://www.avyena.pt','x-forwarded-for':String(++ip)},body,...extra},res);return res;}
(async()=>{
 assert.equal((await call('subscribe',{email:'bad',consent:true})).code,400);
 assert.equal((await call('subscribe',{email:'test@example.com',consent:false})).code,400);
 assert.equal((await call('subscribe',{}, {headers:{origin:'https://evil.example','content-type':'application/json'}})).code,403);
 assert.equal((await call('subscribe',{website:'bot'})).code,200);assert.equal(sent.length,0);
 assert.equal((await call('subscribe',{email:'test@example.com',consent:true,source:'homepage',lang:'en'})).code,200);assert.equal(contact,null);
 const mail=sent.at(-1);assert.equal(mail.body.from,'AVYENA Digital <newsletter@avyena.pt>');assert.match(mail.body.subject,/Confirm/);assert(mail.headers['Idempotency-Key']);
 const token=decodeURIComponent(mail.body.text.match(/#token=([^\s]+)/)[1]);
 const scan=await call('confirm',null,{method:'GET',url:'/api/newsletter?action=confirm&token='+encodeURIComponent(token)});assert.equal(scan.code,303);assert.equal(contact,null);
 assert.equal((await call('confirm',{token:token+'bad'})).code,400);
 assert.equal((await call('confirm',{token})).code,200);assert.equal(contact.segments[0].id,'179db3a5-e00c-4d4f-9c1f-ae2531170ef5');assert.equal(contact.properties.newsletter_source,'homepage');assert(contact.properties.newsletter_consent_at);
 contact.unsubscribed=true;assert.equal((await call('confirm',{token})).code,409);assert.equal(contact.unsubscribed,true);
 const realNow=Date.now;Date.now=()=>realNow()+25*3600000;assert.equal((await call('confirm',{token})).code,400);Date.now=realNow;
 fail=true;assert.equal((await call('subscribe',{email:'other@example.com',consent:true})).code,502);
 console.log('PASS: validation, origin, honeypot, confirmation email, no signup on GET, tampering, expiry, consent properties, segment format, cancellation preservation and provider failure.');
})();
