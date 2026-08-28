import { defineMiddleware } from 'astro:middleware';
import { defaultLocale, isLocale, type Locale } from './i18n';

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

	if (context.url.pathname === '/') {
		const locale = preferredLocale(context.request.headers.get('cookie'), context.request.headers.get('accept-language'));
		return Response.redirect(new URL(`/${locale}/`, context.url), 302);
	}

	const localeSwitch = context.url.pathname.match(/^\/_locale\/(en|de)$/);
	if (localeSwitch) {
		const locale = localeSwitch[1] as Locale;
		const returnTo = context.url.searchParams.get('returnTo');
		const target = returnTo && returnTo.startsWith(`/${locale}/`) ? returnTo : `/${locale}/`;
		return new Response(null, {
			status: 302,
			headers: {
				Location: new URL(target, context.url).toString(),
				'Set-Cookie': `portfolio_locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly`,
				'Cache-Control': 'private, no-store',
			},
		});
	}

	return next();
});

function preferredLocale(cookie: string | null, acceptLanguage: string | null): Locale {
	const cookieLocale = cookie?.match(/(?:^|;\s*)portfolio_locale=(en|de)(?:;|$)/)?.[1];
	if (isLocale(cookieLocale)) return cookieLocale;

	const requested = acceptLanguage?.split(',').map((value) => value.trim().split(';')[0]?.toLowerCase().split('-')[0]);
	return requested?.find(isLocale) ?? defaultLocale;
}
