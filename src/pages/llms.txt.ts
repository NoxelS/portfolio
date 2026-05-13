import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

export const prerender = true;

export const GET: APIRoute = () => {
	const body = `# ${defaultSeo.siteName}

> Main portfolio and professional profile for ${defaultSeo.authorName}.

## Core Pages

- [Home](${defaultSeo.site}/): Portfolio homepage.
- [Full LLM context](${defaultSeo.site}/llms-full.txt): Curated text export for language models.
- [Markdown export](${defaultSeo.site}/index.md): Markdown export of the homepage.

## Notes

This file is intentionally minimal until the portfolio content is added.
`;

	const headers = new Headers({
		'Content-Type': 'text/plain; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
