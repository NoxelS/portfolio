import { defineMiddleware } from 'astro:middleware';
import { defaultLocale, isLocale, type Locale } from './i18n';

import { acceptsMarkdown, markdownResponse, varyAccept } from './lib/markdown.mjs';

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname === '/' && acceptsMarkdown(context.request.headers.get('accept'))) {
		return varyAccept(await context.rewrite('/index.md'));
	}

	if (context.url.pathname === '/') {
		const locale = preferredLocale(context.request.headers.get('cookie'), context.request.headers.get('accept-language'));
		return new Response(null, {
			status: 302,
			headers: {
				Location: `/${locale}/`,
				'Cache-Control': 'private, no-store',
				Vary: 'Accept, Cookie, Accept-Language',
			},
		});
	}

	const localeSwitch = context.url.pathname.match(/^\/_locale\/(en|de)$/);
	if (localeSwitch) {
		const locale = localeSwitch[1] as Locale;
		const returnTo = context.url.searchParams.get('returnTo');
		const target = returnTo && returnTo.startsWith(`/${locale}/`) ? returnTo : `/${locale}/`;
		return new Response(null, {
			status: 302,
			headers: {
				Location: target,
				'Set-Cookie': `portfolio_locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly`,
				'Cache-Control': 'private, no-store',
			},
		});
	}

	const response = await next();
	if (!response.headers.get('content-type')?.includes('text/html') || response.status !== 200) return response;
	varyAccept(response);
	if (!['GET', 'HEAD'].includes(context.request.method) || !acceptsMarkdown(context.request.headers.get('accept'))) return response;
	return markdownResponse(response, context.url, context.request.method === 'HEAD');
});

function preferredLocale(cookie: string | null, acceptLanguage: string | null): Locale {
	const cookieLocale = cookie?.match(/(?:^|;\s*)portfolio_locale=(en|de)(?:;|$)/)?.[1];
	if (isLocale(cookieLocale)) return cookieLocale;

	const requested = acceptLanguage?.split(',').map((value) => value.trim().split(';')[0]?.toLowerCase().split('-')[0]);
	return requested?.find(isLocale) ?? defaultLocale;
}
