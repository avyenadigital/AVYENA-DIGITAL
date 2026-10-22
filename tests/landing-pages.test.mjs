import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../landing-contact.js';
import campaign from '../landing-campaign.js';
const realNow=Date.now;
process.env['RESEND_API_KEY']='mock-test-key';
let calls=[];
globalThis.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:true,json:async()=>({id:'mock'})};};
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.code=n;return this},json(b){this.body=b;return this}};}
let n=0;
async function run(body,headers={}){const res=response();await handler({method:'POST',headers:{'content-type':'application/json','x-requested-with':'AVYENA-Contact',origin:'https://www.avyena.pt','x-real-ip':String(++n),...headers},body:{nome:'Teste',email:'test@example.com',empresa:'Teste',mensagem:'Pedido de teste',privacy:true,...body}},res);return res;}
for(const source of ['diagnostico-digital','criacao-websites','guia-gratuito']){assert.equal((await run({source})).code,200);assert.match(calls.at(-1).body.text,new RegExp(source));}
assert.equal((await run({source:'guia-gratuito',privacy:false})).code,400);
assert.equal((await run({source:'guia-gratuito',email:'invalid'})).code,400);
assert.equal((await run({source:'guia-gratuito'},{origin:'https://evil.example'})).code,403);
assert.equal((await run({source:'__proto__'})).code,400);
const before=calls.length;assert.equal((await run({source:'guia-gratuito',website:'bot'})).code,200);assert.equal(calls.length,before);
for(const [date,active] of [['2026-10-31T23:59:59Z',false],['2026-11-01T00:00:00Z',true],['2026-11-30T23:59:59Z',true],['2026-12-01T00:00:00Z',false]]){
 Date.now=()=>Date.parse(date);const res=response();campaign({method:'GET'},res);assert.equal(res.body.active,active);
 assert.equal((await run({source:'black-friday',servico:'Websites & Landing Pages'})).code,active?200:409);
}
Date.now=realNow;
globalThis.fetch=async()=>({ok:false});assert.equal((await run({source:'guia-gratuito'})).code,502);
const cfg=JSON.parse(fs.readFileSync('vercel.json'));const files=new Set(cfg.builds.map(x=>x.src));
for(const slug of ['diagnostico-digital','criacao-websites','guia-gratuito','black-friday']){
 assert(files.has(slug+'.html'));assert(cfg.routes.some(x=>x.src==='/'+slug+'/?'&&x.dest==='/'+slug+'.html'));
 const html=fs.readFileSync(slug+'.html','utf8');
 // JSON-LD is a non-executable data block, unlike inline JavaScript or CSS.
 const executableHtml=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,json)=>{JSON.parse(json);return '';});
 assert(!/<(?:script|style)[^>]*>\s*[^<\s]/.test(executableHtml));assert(!/style=/.test(html));assert.equal((html.match(/<h1>/g)||[]).length,1);
 for(const [,path] of html.matchAll(/(?:src|href)="(\/[^"#?]+)(?:[?#][^"]*)?"/g))if(!['/','/diagnostico-digital'].includes(path)&&/\.[a-z]+$/.test(path))assert(fs.existsSync('.'+path),'Missing '+path);
 assert(!/black.edition/i.test(html));
}
console.log('PASS: 4 routes, real assets, CSP compatibility, contact validation, origin, honeypot, provider failure, campaign date boundaries. No emails sent.');
