import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import IndexPage from '../../src/pages/index.astro';
import { GET as getIndexMarkdown } from '../../src/pages/index.md';
import { GET as getLlms } from '../../src/pages/llms.txt';
import { GET as getRobots } from '../../src/pages/robots.txt';

describe('metadata endpoints', () => {
	it('renders canonical SEO metadata on the homepage', async () => {
		const container = await AstroContainer.create();
		const html = await container.renderToString(IndexPage);

		expect(html).toContain('<link rel="canonical" href="https://noel.fyi/">');
		expect(html).toContain('<meta property="og:url" content="https://noel.fyi/">');
		expect(html).toContain('application/ld+json');
	});

	it('exposes robots.txt with the XML sitemap', async () => {
		const response = await getRobots({} as never);
		const body = await response.text();

		expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
		expect(body).toContain('Sitemap: https://noel.fyi/sitemap-index.xml');
		expect(body).not.toContain('Sitemap: https://noel.fyi/llms.txt');
	});

	it('exposes LLM-readable entrypoints', async () => {
		const [llmsResponse, markdownResponse] = await Promise.all([getLlms({} as never), getIndexMarkdown({} as never)]);

		expect(await llmsResponse.text()).toContain('[Full LLM context](https://noel.fyi/llms-full.txt)');
		expect(await markdownResponse.text()).toContain('Canonical URL: https://noel.fyi/');
	});
});
