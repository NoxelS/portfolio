import type { APIRoute } from 'astro';
import { setPublicDocumentCache } from '../../lib/cache';

export const prerender = false;

const catalogUrl = 'https://noel.fyi/.well-known/api-catalog';
const catalog = {
	linkset: [
		{
			anchor: catalogUrl,
			item: [{ href: 'https://noel.fyi/health', title: 'Portfolio health API' }],
		},
		{
			anchor: 'https://noel.fyi/health',
			'service-desc': [{ href: 'https://noel.fyi/openapi.json', type: 'application/vnd.oai.openapi+json' }],
			'service-doc': [{ href: 'https://noel.fyi/api-docs/', type: 'text/html' }],
			status: [{ href: 'https://noel.fyi/health', type: 'application/json' }],
		},
	],
};

function headers(): Headers {
	const result = new Headers({
		'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
		Link: `<${catalogUrl}>; rel="api-catalog"`,
	});
	setPublicDocumentCache(result);
	return result;
}

export const GET: APIRoute = () => new Response(JSON.stringify(catalog), { headers: headers() });
export const HEAD: APIRoute = () => new Response(null, { headers: headers() });
