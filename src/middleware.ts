import { defineMiddleware } from 'astro:middleware';

import { setPublicPageCache } from './lib/cache';

export const onRequest = defineMiddleware(async ({ request }, next) => {
	const startedAt = performance.now();
	const response = await next();
	const duration = Math.max(0, performance.now() - startedAt);

	response.headers.append('Server-Timing', `app;dur=${duration.toFixed(1)}`);
	const cachePolicy = response.headers.get('X-Cache-Policy');
	response.headers.delete('X-Cache-Policy');

	if (request.method !== 'GET' || response.headers.has('Cache-Control') || cachePolicy !== 'public-page') {
		return response;
	}

	const contentType = response.headers.get('Content-Type') ?? '';
	const isPublicHtml = response.status === 200 && contentType.includes('text/html') && !response.headers.has('Set-Cookie');

	if (isPublicHtml) {
		setPublicPageCache(response.headers);
	}

	return response;
});
