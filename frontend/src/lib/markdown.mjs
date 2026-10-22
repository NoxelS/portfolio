import TurndownService from 'turndown';
import { parseHTML } from 'linkedom';

// Require an explicit Markdown media range; wildcard browser requests stay HTML.
export function acceptsMarkdown(header) {
	return (header ?? '').split(',').some(range => {
		const [type, ...parameters] = range.trim().toLowerCase().split(';');
		if (type.trim() !== 'text/markdown') return false;
		const quality = parameters.find(parameter => /^\s*q\s*=/.test(parameter));
		if (!quality) return true;
		const value = Number(quality.split('=')[1].trim());
		return value > 0 && value <= 1;
	});
}

export function varyAccept(response) {
	// Prevent shared cache entries at CDNs that do not key on Vary: Accept.
	response.headers.set('CDN-Cache-Control', 'no-store');
	const vary = response.headers.get('Vary')?.split(',').map(value => value.trim()) ?? [];
	if (!vary.some(value => value.toLowerCase() === 'accept' || value === '*')) {
		response.headers.set('Vary', [...vary, 'Accept'].join(', '));
	}
	return response;
}

export async function markdownResponse(response, url, head = false) {
	const { document } = parseHTML(await response.text());
	const content = document.querySelector('main') ?? document.body;
	content.querySelectorAll('script, style, nav, svg, canvas, button, template, [aria-hidden="true"]').forEach(node => node.remove());
	content.querySelectorAll('[href], [src]').forEach(node => {
		for (const attribute of ['href', 'src']) {
			const value = node.getAttribute(attribute);
			if (value) node.setAttribute(attribute, new URL(value, url).href);
		}
	});
	const converter = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
	const body = `${converter.turndown(content.innerHTML)}\n`;
	const headers = new Headers(response.headers);
	headers.set('Content-Type', 'text/markdown; charset=utf-8');
	for (const name of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified', 'Content-Range']) headers.delete(name);
	return varyAccept(new Response(head ? null : body, { status: response.status, headers }));
}
