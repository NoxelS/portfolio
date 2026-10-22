import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleRequest } from './worker.mjs';

for (const path of ['/', '/?campaign=test', '/en', '/en/', '/de', '/de/']) {
  for (const method of ['GET', 'HEAD']) {
    test(`${method} ${path} retains origin response and appends discovery links`, async () => {
      const request = new Request(`https://noel.fyi${path}`, { method, headers: { Cookie: 'portfolio_locale=de', Accept: 'text/markdown' } });
      const response = await handleRequest(request, async received => {
        assert.equal(received, request);
        return new Response(method === 'HEAD' ? null : 'original', {
          status: 302,
          headers: { Location: '/de/', Vary: 'Cookie, Accept-Language', 'Cache-Control': 'private, no-store', Link: '</asset.js>; rel="preload"' },
        });
      });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('Location'), '/de/');
      assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
      assert.equal(response.headers.get('Vary'), 'Cookie, Accept-Language');
      assert.match(response.headers.get('Link'), /rel="preload"/);
      for (const rel of ['api-catalog', 'service-desc', 'service-doc', 'describedby']) {
        assert.ok(response.headers.get('Link').includes(`rel="${rel}"`));
      }
      assert.equal(await response.text(), method === 'HEAD' ? '' : 'original');
    });
  }
}

test('localized 200 homepage exposes resolvable discovery documents', async () => {
  const response = await handleRequest(new Request('https://noel.fyi/en/'), async () => new Response('homepage'));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'homepage');
  for (const [, path, type] of response.headers.get('Link').matchAll(/<([^>]+)>; rel="[^"]+"; type="([^"]+)"/g)) {
    const target = await handleRequest(new Request(`https://noel.fyi${path}`), async request => {
      assert.equal(new URL(request.url).pathname, '/index.md');
      return new Response('# Portfolio', { headers: { 'Content-Type': 'text/markdown' } });
    });
    assert.equal(target.status, 200);
    assert.ok(target.headers.get('Content-Type').startsWith(type));
  }
});

test('catalog links to valid OpenAPI and documentation for the existing public endpoints', async () => {
  const edgeOnly = () => { throw new Error('Discovery documents must not hit the origin'); };
  const get = path => handleRequest(new Request(`https://noel.fyi${path}`), edgeOnly);
  const catalogResponse = await get('/.well-known/api-catalog');
  assert.match(catalogResponse.headers.get('Content-Type'), /application\/linkset\+json; profile=/);
  const { linkset: [entry] } = await catalogResponse.json();
  assert.equal(entry.anchor, 'https://noel.fyi/index.md');
  const spec = await (await get(new URL(entry['service-desc'][0].href).pathname)).json();
  assert.equal(spec.openapi, '3.1.0');
  assert.deepEqual(Object.keys(spec.paths), ['/index.md', '/llms.txt']);
  assert.ok(spec.paths['/index.md'].get.responses['200'].content['text/markdown']);
  const docs = await (await get(new URL(entry['service-doc'][0].href).pathname)).text();
  for (const path of Object.keys(spec.paths)) assert.ok(docs.includes(`GET ${path}`));
  for (const path of ['/.well-known/api-catalog', '/openapi.json', '/agent-docs']) {
    const head = await handleRequest(new Request(`https://noel.fyi${path}`, { method: 'HEAD' }), edgeOnly);
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const post = await handleRequest(new Request(`https://noel.fyi${path}`, { method: 'POST' }), edgeOnly);
    assert.equal(post.status, 405);
    assert.equal(post.headers.get('Allow'), 'GET, HEAD');
  }
});

test('other paths and homepage mutations pass through unchanged', async () => {
  for (const [path, method] of [['/index.md', 'GET'], ['/en/legal-notice/', 'GET'], ['/health', 'GET'], ['/', 'POST']]) {
    const original = new Response('origin', { status: 202 });
    assert.equal(await handleRequest(new Request(`https://noel.fyi${path}`, { method }), async () => original), original);
  }
});
