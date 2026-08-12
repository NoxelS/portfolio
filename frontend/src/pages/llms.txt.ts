import type { APIRoute } from 'astro';

import { getIndexMarkdownBody } from './index.md';
import { setPublicDocumentCache } from '../lib/cache';

export const prerender = false;

export const GET: APIRoute = () => {
	const headers = new Headers({
		'Content-Type': 'text/plain; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(getIndexMarkdownBody(), { headers });
};
