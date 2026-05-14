import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import IndexPage from '../../src/pages/index.astro';

describe('home page', () => {
	it('renders the portfolio owner name', async () => {
		const container = await AstroContainer.create();
	});
});
