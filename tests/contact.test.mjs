// Run with: node --test tests/contact.test.mjs (Node.js 20+)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../contact.js', import.meta.url), 'utf8');
const { default: handler } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

function response() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}
let requestCount = 0;
function request(body = {}, headers = {}, method = 'POST') {
  const ip = `192.0.2.${++requestCount}`;
  return {
    method, body,
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'AVYENA-Contact',
      'x-forwarded-for': ip,
      ...headers
    },
    socket: { remoteAddress: ip }
  };
}
const valid = {
  nome: 'Pessoa Teste', email: 'teste@example.org',
  servico: 'Websites & Landing Pages', mensagem: 'Pedido de informações'
};

test('rejects non-POST methods', async () => {
  const res = response();
  await handler(request(valid, {}, 'GET'), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
});
test('rejects an untrusted origin', async () => {
  const res = response();
  await handler(request(valid, { origin: 'https://example.org' }), res);
  assert.equal(res.statusCode, 403);
});
test('rejects an invalid service', async () => {
  const res = response();
  await handler(request({ ...valid, servico: 'Outro' }), res);
  assert.equal(res.statusCode, 400);
});
test('rejects missing required fields', async () => {
  const res = response();
  await handler(request({ ...valid, nome: '' }), res);
  assert.equal(res.statusCode, 400);
});
test('rejects invalid email', async () => {
  const res = response();
  await handler(request({ ...valid, email: 'invalid' }), res);
  assert.equal(res.statusCode, 400);
});
test('rejects oversized content length', async () => {
  const res = response();
  await handler(request(valid, { 'content-length': '99999' }), res);
  assert.equal(res.statusCode, 413);
});
test('honeypot returns success without sending email', async () => {
  const original = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => { called = true; throw Error('unexpected'); };
  try {
    const res = response();
    await handler(request({ ...valid, website: 'spam' }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = original;
  }
});
test('valid request sends escaped email through Resend', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env['RESEND_API_KEY'];
  let payload;
  process.env['RESEND_API_KEY'] = 'test-key-not-real';
  globalThis.fetch = async (_url, opts) => {
    payload = JSON.parse(opts.body);
    return { ok: true };
  };
  try {
    const res = response();
    await handler(request({ ...valid, mensagem: '<script>alert(1)</script>' }), res);
    assert.equal(res.statusCode, 200);
    assert.ok(payload.html.includes('&lt;script&gt;'));
    assert.ok(!payload.html.includes('<script>'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env['RESEND_API_KEY'];
    else process.env['RESEND_API_KEY'] = originalKey;
  }
});
