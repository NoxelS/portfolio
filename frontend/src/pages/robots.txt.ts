import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

export const prerender = true;

export const GET: APIRoute = () => {
	const isStaging = import.meta.env.PUBLIC_DEPLOYMENT_ENV === 'staging';
	const body = [
		'User-agent: *',
		isStaging ? 'Disallow: /' : 'Allow: /',
		'',
		...(isStaging ? [] : [`Sitemap: ${defaultSeo.site}/sitemap-index.xml`]),
		'',
	].join('\n');

	const headers = new Headers({
		'Content-Type': 'text/plain; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
