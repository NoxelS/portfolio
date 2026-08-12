import type { APIRoute } from 'astro';

import { defaultSeo } from '../data/site';
import { setPublicDocumentCache } from '../lib/cache';

export const prerender = false;

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
		'Content-Type': 'text/plain; charset=utf-8',
	});
	setPublicDocumentCache(headers);

	return new Response(body, { headers });
};
