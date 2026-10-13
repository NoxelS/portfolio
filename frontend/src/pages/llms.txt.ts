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

- English portfolio: ${defaultSeo.site}/en/index.md
- German portfolio: ${defaultSeo.site}/de/index.md
- Website: ${defaultSeo.site}/
- GitHub: https://github.com/NoxelS
- LinkedIn: https://www.linkedin.com/in/noel-schwabenland/

## Topics

- AI agent systems
- Retrieval-augmented generation (RAG)
- Knowledge systems and enterprise search
- Custom AI applications and workflow automation
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
