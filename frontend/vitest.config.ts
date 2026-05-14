import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
		},
		include: ['src/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts'],
	},
});
