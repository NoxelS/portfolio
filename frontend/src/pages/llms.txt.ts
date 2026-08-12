import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

// Keep this as a static root document so hosts and crawlers can retrieve the
// Markdown file without relying on server-side route handling.
export const prerender = true;

export const GET: APIRoute = () => {
	const body = `# ${defaultSeo.authorName}

> ${defaultSeo.description}

This is a concise machine-readable overview of the portfolio. Use the full Markdown portfolio for project, capability, and contact details.

## Resources

- Full portfolio: ${defaultSeo.site}/index.md
- Website: ${defaultSeo.site}/
- GitHub: https://github.com/NoxelS
- LinkedIn: https://www.linkedin.com/in/noel-schwabenland/

## Topics

- AI agent systems
- Retrieval-augmented generation (RAG)
- Voice AI and speech pipelines
- Full-stack software engineering
- AI infrastructure, evaluation, and automation
`;
	const headers = new Headers({
		'Content-Type': 'text/markdown; charset=utf-8',
		Link: '</index.md>; rel="alternate"; type="text/markdown"',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
