import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const cfg=JSON.parse(fs.readFileSync('vercel.json'));
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
const titles=new Set();
for(const url of urls){
 const pathname=new URL(url).pathname;
 const file=pathname.endsWith('/')?pathname.slice(1)+'index.html':pathname.slice(1)+(path.extname(pathname)?'':'.html');
 const html=fs.readFileSync(file,'utf8');
 assert(html.includes('rel="canonical" href="'+url+'"'),'Canonical mismatch: '+file);
 assert(!/<meta name="robots"[^>]*noindex/.test(html),'Noindex in sitemap: '+file);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'Expected one H1: '+file);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 assert(title&&!titles.has(title),'Missing/duplicate title: '+file);titles.add(title);
 for(const [,local] of html.matchAll(/(?:href|src)="([^"#?]*)(?:[?#][^"]*)?"/g)){
  if(!local||/^(?:[a-z]+:|\/\/)/i.test(local))continue;
  const target=local.startsWith('/')?local.slice(1):path.join(path.dirname(file),local);
  if(path.extname(target))assert(fs.existsSync(target),'Broken local resource in '+file+': '+local);
 }
 for(const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(json);
}
const en=fs.readFileSync('en/index.html','utf8');
const js=fs.readFileSync('app.js','utf8');
const dict=vm.runInNewContext('('+js.slice(js.indexOf('const translations = ')+21,js.indexOf('\nlet lang =')).replace(/;\s*$/,'')+')').en;
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"');
for(const [,tag,attrs,key,content] of en.matchAll(/<([a-z0-9]+)([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g)){
 assert(dict[key],'Missing English translation '+key);
 assert.equal(decode(content),dict[key],'English HTML depends on JS for '+key);
}
assert(!/href="\/(?:websites|redes-sociais|seo-local|branding|google-business|solucoes-digitais|publicidade-digital)-algarve.html"/.test(en),'English cards link to Portuguese');
for(const slug of ['diagnostico-digital','criacao-websites']){
 assert(urls.includes('https://www.avyena.pt/'+slug));
 assert(cfg.routes.some(r=>r.src==='/'+slug+'/?'&&r.dest==='/'+slug+'.html'));
}
for(const slug of ['black-friday','newsletter','guia-gratuito','guia-presenca-digital'])assert(!urls.some(u=>u.endsWith('/'+slug)),'Noindex page added to sitemap');
console.log('PASS: '+urls.length+' canonical pages, unique titles, H1, local resources, JSON-LD, English without JS, and landing routes.');
