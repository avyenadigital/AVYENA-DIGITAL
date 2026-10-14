const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const code = read('black-edition.js');
const start = Date.parse('2026-11-01T00:00:00Z');
const end = Date.parse('2026-12-01T00:00:00Z');
const week = 7 * 86400000;
const key = 'avyena:black-edition:2026:dismissed';
function server(date, environment = 'production', method = 'GET') {
  let output, status;
  const context = { Date: class extends Date { static now() { return date; } }, process: { env: { VERCEL_ENV: environment } } };
  vm.createContext(context);
  vm.runInContext(read('black-edition-config.js').replace('export default function handler', 'function handler'), context);
  context.handler({method}, {setHeader() {}, status(n) {status = n; return this;}, json(data) {output = data;}});
  return {status, ...output};
}
async function client({date = start + 1000, preview = false, dismissed, html, storageFails = false, apiFails = false, contactFails = false} = {}) {
  const dom = new JSDOM(html || '<html lang="pt-PT"><body><header class="site-header"></header><button id="origin">Origin</button></body></html>', {url: 'https://preview.example/', runScripts: 'outside-only', pretendToBeVisual: true});
  const w = dom.window;
  let clock = date, nextID = 1;
  const timers = new Map();
  const calls = [];
  w.Date.now = () => clock;
  w.setTimeout = (fn, delay) => { const id = nextID++; timers.set(id, {fn, at: clock + delay}); return id; };
  w.clearTimeout = id => timers.delete(id);
  w.setInterval = (fn, delay) => { const id = nextID++; timers.set(id, {fn, at: clock + delay, interval:delay}); return id; };
  w.clearInterval = w.clearTimeout;
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); this.querySelector('button').focus(); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  w.fetch = async (url, options) => {
    calls.push({url, options});
    if (apiFails) throw Error('offline');
    if (url === '/api/black-edition') return {ok:true, json:async () => ({...server(date, preview ? 'preview' : 'production')})};
    return {ok:!contactFails, json:async () => ({ok:!contactFails, message:'Controlled test error'})};
  };
  if (dismissed) w.localStorage.setItem(key, String(dismissed));
  if (storageFails) { w.Storage.prototype.getItem = () => { throw Error('denied'); }; w.Storage.prototype.setItem = () => {throw Error('denied');}; }
  w.eval(code);
  await new Promise(resolve => setImmediate(resolve));
  const tick = async duration => {
    const target = clock + duration;
    for (;;) {
      const entries = [...timers.entries()].filter(([,t]) => t.at <= target).sort((a,b) => a[1].at-b[1].at);
      if (!entries.length) break;
      const [id, t] = entries[0]; clock = t.at;
      if (t.interval) t.at += t.interval; else timers.delete(id);
      t.fn();
    }
    clock = target;
    await new Promise(resolve => setImmediate(resolve));
  };
  return {w, calls, tick, doc:w.document, close:() => dom.window.close()};
}
test('Lisbon November boundaries, production, preview and invalid method', () => {
  for (const [date, expected] of [[start-1,false],[start,true],[end-1,true],[end,false]]) assert.equal(server(date).active, expected);
  assert.equal(server(start-week,'preview').active,true);
  assert.equal(server(start-week,'production').preview,false);
  assert.equal(server(start,'production','POST').status,405);
});
test('opens at 3 seconds; closes 8 seconds later; remembers dismissal', async () => {
  const c = await client();
  await c.tick(2999); assert.equal(c.doc.querySelector('dialog'),null);
  await c.tick(1); assert.ok(c.doc.querySelector('dialog').open);
  await c.tick(7999); assert.ok(c.doc.querySelector('dialog').open);
  await c.tick(1); assert.equal(c.doc.querySelector('dialog').open,false);
  assert.ok(Number(c.w.localStorage.getItem(key)) > start); c.close();
});
test('pointer, keyboard and touch intent cancel automatic dismissal', async () => {
  for (const type of ['pointermove','pointerdown','keydown','wheel']) {
    const c=await client(); await c.tick(3000);
    c.doc.querySelector('dialog').dispatchEvent(new c.w.Event(type));
    await c.tick(20000); assert.ok(c.doc.querySelector('dialog').open,type); c.close();
  }
});
test('manual reopen remains open and restores triggering focus on close', async () => {
  const c=await client({dismissed:start});
  const button=c.doc.querySelector('.be-linkbar button'); button.focus(); button.click();
  await c.tick(20000); assert.ok(c.doc.querySelector('dialog').open);
  c.doc.querySelector('.be-close').click();
  assert.equal(c.doc.activeElement,button); assert.ok(!c.doc.body.classList.contains('be-scroll-lock')); c.close();
});
test('Escape and continue close and remember', async () => {
  for (const escape of [true,false]) {
    const c=await client(); await c.tick(3000);
    if (escape) c.doc.querySelector('dialog').dispatchEvent(new c.w.Event('cancel',{cancelable:true}));
    else c.doc.querySelector('.be-continue').click();
    assert.equal(c.doc.querySelector('dialog').open,false); assert.ok(c.w.localStorage.getItem(key)); c.close();
  }
});
test('dismissal suppresses for exactly 7 days', async () => {
  for (const [age, opens] of [[week-1,false],[week,true]]) {
    const c=await client({date:start+week+1000,dismissed:start+week+1000-age});
    await c.tick(3000); assert.equal(!!c.doc.querySelector('dialog')?.open,opens); c.close();
  }
});
test('consent, another modal and form entry defer the campaign', async () => {
  for (const html of ['<div id="avyena-cookie-consent"></div>','<div aria-modal="true"></div>','<input autofocus>']) {
    const c=await client({html:`<html><body><header class="site-header"></header>${html}</body></html>`});
    c.doc.querySelector('input')?.focus(); await c.tick(3000); assert.equal(c.doc.querySelector('dialog'),null);
    c.doc.querySelector('#avyena-cookie-consent, [aria-modal], input').remove();
    await c.tick(3000); assert.ok(c.doc.querySelector('dialog').open); c.close();
  }
});
test('blocked storage does not crash dismissal or reopening', async () => {
  const c=await client({storageFails:true}); await c.tick(3000);
  c.doc.querySelector('.be-close').click(); c.doc.querySelector('.be-linkbar button').click();
  assert.ok(c.doc.querySelector('dialog').open); c.close();
});
test('inactive dates and endpoint failure leave host site untouched', async () => {
  for (const options of [{date:start-1},{date:end},{apiFails:true}]) {
    const c=await client(options); await c.tick(3000);
    assert.equal(c.doc.querySelector('.be-linkbar'),null); assert.equal(c.doc.querySelector('dialog'),null); c.close();
  }
});
test('open tabs expire within one second on December 1', async () => {
  const c=await client({date:end-5000}); await c.tick(3000); assert.ok(c.doc.querySelector('dialog').open);
  await c.tick(2000); assert.ok(!c.doc.querySelector('dialog').open); assert.equal(c.doc.querySelector('.be-linkbar'),null); c.close();
});
test('English entry points use English copy and destination', async () => {
  const c=await client({html:'<html lang="en"><body><header class="site-header"></header></body></html>'});
  await c.tick(3000); assert.match(c.doc.querySelector('h2').textContent,/Will you wait/);
  assert.equal(c.doc.querySelector('dialog a').getAttribute('href'),'/en/black-edition-2026.html'); c.close();
});
function fill(c) {
  const form=c.doc.getElementById('be-form');
  for (const [name,value] of Object.entries({nome:'Test',email:'test@example.invalid',servico:'Websites & Landing Pages',mensagem:'A test request'})) form.elements[name].value=value;
  form.elements.privacy.checked=true;
  return form;
}
test('preview form validates fields and never calls the contact API', async () => {
  const c=await client({preview:true,html:read('black-edition-2026.html')});
  const form=fill(c); assert.ok(form.checkValidity());
  form.dispatchEvent(new c.w.Event('submit',{cancelable:true})); await c.tick(0);
  assert.match(c.doc.getElementById('be-form-note').textContent,/Nenhum email/);
  assert.equal(c.calls.length,1); c.close();
});
test('live form reuses existing API with campaign attribution and error recovery', async () => {
  for (const fail of [false,true]) {
    const c=await client({contactFails:fail,html:read('black-edition-2026.html')});
    const form=fill(c); form.dispatchEvent(new c.w.Event('submit',{cancelable:true})); await c.tick(0);
    assert.equal(c.calls[1].url,'/api/contact');
    const payload=JSON.parse(c.calls[1].options.body);
    assert.match(payload.mensagem,/Black Edition 2026/);
    assert.equal(c.calls[1].options.headers['X-Requested-With'],'AVYENA-Contact');
    assert.equal(form.querySelector('[type="submit"]').disabled,false);
    assert.match(c.doc.getElementById('be-form-note').textContent, fail ? /Controlled test error/ : /Pedido enviado/); c.close();
  }
});
test('required consent and invalid email block submission', async () => {
  const c=await client({preview:true,html:read('black-edition-2026.html')});
  const form=fill(c); form.elements.privacy.checked=false; assert.ok(!form.checkValidity());
  form.elements.privacy.checked=true; form.elements.email.value='invalid'; assert.ok(!form.checkValidity()); c.close();
});
test('dedicated pages have labels, alt text, accessible status and fallback', async () => {
  for (const file of ['black-edition-2026.html','en/black-edition-2026.html']) {
    const c=await client({date:end,html:read(file)});
    assert.ok(c.doc.getElementById('be-form').hidden);
    assert.ok(!c.doc.getElementById('be-unavailable').hidden);
    for (const field of c.doc.querySelectorAll('input,select,textarea')) assert.ok(field.closest('label'));
    for (const img of c.doc.images) assert.ok(img.hasAttribute('alt'));
    assert.equal(c.doc.querySelectorAll('h1').length,1); c.close();
  }
});
test('Vercel assets/routes preserve CSP and all service values are accepted', () => {
  const cfg=JSON.parse(read('vercel.json'));
  for (const name of ['black-edition.js','black-edition.css','black-edition-2026.html','en/black-edition-2026.html','black-edition-config.js']) assert.ok(cfg.builds.some(b=>b.src===name));
  assert.ok(cfg.routes.findIndex(r=>r.src==='/api/black-edition') < cfg.routes.findIndex(r=>r.handle==='filesystem'));
  assert.match(cfg.routes[0].headers['Content-Security-Policy'],/script-src 'self'/);
  const dom=new JSDOM(read('black-edition-2026.html'));
  for (const option of dom.window.document.querySelectorAll('option[value]')) if (option.value) assert.ok(read('contact.js').includes(`'${option.value}'`));
  dom.window.close();
});
