// @ts-check
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://noel.fyi',
	output: 'server',
	adapter: node({
		mode: 'middleware',
		bodySizeLimit: 1_048_576,
	}),
	integrations: [sitemap()],
});
