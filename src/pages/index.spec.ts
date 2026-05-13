import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import IndexPage from './index.astro';

describe('home page', () => {
	it('renders the portfolio owner name', async () => {
		const container = await AstroContainer.create();
		const html = await container.renderToString(IndexPage);

		expect(html).toMatch(/<h1\b[^>]*>Noel Schwabenland<\/h1>/);
	});
});
