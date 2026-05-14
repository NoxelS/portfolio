import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

export const prerender = true;

export const GET: APIRoute = () => {
	const body = `# ${defaultSeo.authorName}

Canonical site: ${defaultSeo.site}

## Profile

Portfolio profile content has not been added yet.

## Projects

Project content has not been added yet.

## Resume

Resume content has not been added yet.

## Contact

Contact content has not been added yet.

## Source Pages

- ${defaultSeo.site}/
- ${defaultSeo.site}/index.md
`;

	const headers = new Headers({
		'Content-Type': 'text/plain; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
