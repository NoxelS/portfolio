import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

export const prerender = true;

export const GET: APIRoute = () => {
	const body = `# ${defaultSeo.authorName}

Portfolio homepage content has not been added yet.

Canonical URL: ${defaultSeo.site}/
`;

	const headers = new Headers({
		'Content-Type': 'text/markdown; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
