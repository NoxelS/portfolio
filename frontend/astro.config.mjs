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
	integrations: [
		sitemap(),
		icon({
			include: {
				mdi: [
					'angular',
					'aws',
					'brain',
					'chart-bell-curve-cumulative',
					'chip',
					'cog-outline',
					'database',
					'database-outline',
					'database-search',
					'docker',
					'fire',
					'firebase',
					'github',
					'gitlab',
					'google-cloud',
					'graph-outline',
					'graphql',
					'kubernetes',
					'language-cpp',
					'language-css3',
					'language-html5',
					'language-java',
					'language-javascript',
					'language-python',
					'language-typescript',
					'information-outline',
					'layers-triple',
					'lightning-bolt-outline',
					'link',
					'linkedin',
					'linux',
					'matrix',
					'memory',
					'microsoft-azure',
					'nodejs',
					'notebook-outline',
					'nuxt',
					'react',
					'robot-outline',
					'robot-industrial-outline',
					'rocket-launch-outline',
					'router-network',
					'sass',
					'server-network',
					'source-branch',
					'table-large',
					'tailwind',
					'terraform',
					'vector-polyline',
					'vuejs',
					'mail',
				],
				iconoir: ['arrow-down', 'arrow-right', 'open-new-window', 'search', 'asterisk', "mail", "phone", "calendar"],
			},
		}),
	],
});
