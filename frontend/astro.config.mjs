// @ts-check
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://noel.fyi',
	output: 'server',
	prerender: {
		default: true,
	},
	adapter: node({
		mode: 'standalone',
	}),
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [sitemap(), icon({ include: { mdi: ['github', 'linkedin'], iconoir: ['arrow-down'] } })],
});
