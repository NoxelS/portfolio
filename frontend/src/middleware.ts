import { defineMiddleware } from 'astro:middleware';

const MARKDOWN_MEDIA_TYPE = 'text/markdown';

function acceptsMarkdown(acceptHeader: string | null): boolean {
	if (!acceptHeader) return false;

	return acceptHeader.split(',').some((mediaRange) => {
		const [mediaType, ...parameters] = mediaRange.trim().toLowerCase().split(';');
		if (mediaType !== MARKDOWN_MEDIA_TYPE) return false;

		const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
		return !quality || Number.parseFloat(quality.trim().slice(2)) > 0;
	});
}

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname === '/' && acceptsMarkdown(context.request.headers.get('accept'))) {
		return context.rewrite('/index.md');
	}

	return next();
});
