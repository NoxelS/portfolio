import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

// Keep this on-demand so the runtime preserves the document cache headers.
export const prerender = false;

export const GET: APIRoute = () => {
	const body = `# auth.md

## Audience

This document is for AI agents accessing the public portfolio at [${defaultSeo.authorName}'s portfolio](${defaultSeo.site}).

## Public access and credential use

The portfolio is publicly readable. No account, API key, bearer token, or other credential is required to read its pages or machine-readable documents.

- [Full portfolio](${defaultSeo.site}/index.md)
- [Overview](${defaultSeo.site}/llms.txt)

## Agent registration and supported methods

Agent registration and credential provisioning are not available. There are no registration or provisioning endpoints and no supported registration methods.

This site does not expose a protected API or advertise an OAuth authorization server. OAuth metadata and agent authentication flows are therefore not published.
`;
	const headers = new Headers({
		'Content-Type': 'text/markdown; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
