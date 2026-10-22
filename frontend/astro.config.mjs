// @ts-check
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://noel.fyi',
	fonts: [
		{
			name: 'Lora',
			cssVariable: '--font-portfolio-lora',
			provider: fontProviders.local(),
			weights: ['400 700'],
			styles: ['normal', 'italic'],
			formats: ['woff2'],
			fallbacks: ['serif'],
			display: 'optional',
			options: {
				variants: [
					{ weight: '400 700', style: 'normal', src: ['./src/assets/fonts/lora/Lora-variable.woff2'] },
					{ weight: '400 700', style: 'italic', src: ['./src/assets/fonts/lora/Lora-italic-variable.woff2'] },
				],
			},
		},
		{
			name: 'Source Sans 3',
			cssVariable: '--font-portfolio-source-sans',
			provider: fontProviders.local(),
			weights: ['200 900'],
			styles: ['normal', 'italic'],
			formats: ['woff2'],
			fallbacks: ['sans-serif'],
			display: 'optional',
			options: {
				variants: [
					{ weight: '200 900', style: 'normal', src: ['./src/assets/fonts/source-sans-3/SourceSans3-variable.woff2'] },
					{ weight: '200 900', style: 'italic', src: ['./src/assets/fonts/source-sans-3/SourceSans3-italic-variable.woff2'] },
				],
			},
		},
	],
	i18n: {
		locales: ['en', 'de'],
		defaultLocale: 'en',
		routing: 'manual',
	},
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
		sitemap({
			// Dynamic legal routes are not discovered by the sitemap integration.
			customPages: ['en', 'de'].flatMap(locale =>
				['legal-notice', 'privacy', 'cookies'].map(page => `https://noel.fyi/${locale}/${page}/`)),
		}),
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
				iconoir: ['arrow-down', 'arrow-right', 'open-new-window', 'search', 'asterisk', "mail", "phone", "calendar", 'network', 'server', 'database-script', 'git-fork', 'server-connection', 'database'],
			},
		}),
	],
});
