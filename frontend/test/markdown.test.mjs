import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptsMarkdown, markdownResponse, varyAccept } from '../src/lib/markdown.mjs';

test('only explicit acceptable Markdown opts in', () => {
	for (const header of [null, '*/*', 'text/html', 'text/markdown;q=0', 'text/markdown;q=no', 'text/markdown;q=2']) assert.equal(acceptsMarkdown(header), false);
	for (const header of ['text/markdown', 'text/html, text/markdown;q=0.8', 'TEXT/MARKDOWN; charset=utf-8']) assert.equal(acceptsMarkdown(header), true);
});

test('conversion preserves content, links and cache policy, strips UI and stale validators', async () => {
	const response = new Response('<html><body><nav>Menu</nav><main><h1>Über mich</h1><p>Hello <strong>world</strong>.</p><a href="/en/">English</a><script>secret()</script><svg><text>icon</text></svg><button>Filter</button></main></body></html>', { headers: { 'Content-Type': 'text/html', Vary: 'Accept-Language', ETag: 'old', 'Content-Length': '999', 'Cache-Control': 'public, max-age=60' } });
	const result = await markdownResponse(response, new URL('https://noel.fyi/de/'));
	const body = await result.text();
	assert.match(body, /# Über mich/);
	assert.match(body, /Hello \*\*world\*\*/);
	assert.match(body, /\[English\]\(https:\/\/noel.fyi\/en\/\)/);
	assert.doesNotMatch(body, /Menu|secret|icon|Filter|<[^>]+>/);
	assert.equal(result.headers.get('content-type'), 'text/markdown; charset=utf-8');
	assert.equal(result.headers.get('vary'), 'Accept-Language, Accept');
	assert.equal(result.headers.get('cache-control'), 'public, max-age=60');
	assert.equal(result.headers.get('CDN-Cache-Control'), 'no-store');
	assert.equal(result.headers.get('etag'), null);
	assert.equal(result.headers.get('content-length'), null);
	assert.equal(varyAccept(result).headers.get('vary'), 'Accept-Language, Accept');
});
