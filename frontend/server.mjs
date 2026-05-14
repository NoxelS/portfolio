import { createServer } from 'node:http';

import sirv from 'sirv';

import { handler } from './dist/server/entry.mjs';

const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 4321);

const cachePolicies = {
	asset: 'public, max-age=31536000, immutable',
	staticAsset: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
	document: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=600',
	page: 'public, max-age=60, s-maxage=600, stale-while-revalidate=60',
};

const serveStatic = sirv('dist/client', {
	dev: false,
	etag: true,
	maxAge: 0,
	setHeaders(response, pathname) {
		const policy = getCachePolicy(pathname);

		if (policy) {
			response.setHeader('Cache-Control', policy);
			response.setHeader('CDN-Cache-Control', policy);
		}
	},
});

createServer((request, response) => {
	serveStatic(request, response, (error) => {
		if (error) {
			handleError(error, response);
			return;
		}

		handler(request, response, (handlerError) => {
			if (handlerError) {
				handleError(handlerError, response);
			}
		});
	});
}).listen(port, host, () => {
	console.log(`Server listening on http://${host}:${port}`);
});

function getCachePolicy(pathname) {
	if (pathname.includes('/_astro/')) {
		return cachePolicies.asset;
	}

	if (/\.(?:css|js|mjs|woff2?|avif|webp|png|jpe?g|gif|svg|ico)$/i.test(pathname)) {
		return cachePolicies.staticAsset;
	}

	if (/\.(?:txt|md|xml|json)$/i.test(pathname)) {
		return cachePolicies.document;
	}

	if (pathname === '/' || pathname.endsWith('.html') || !/\.[^/]+$/.test(pathname)) {
		return cachePolicies.page;
	}

	return undefined;
}

function handleError(error, response) {
	console.error(error);

	if (!response.headersSent) {
		response.statusCode = 500;
		response.end('Internal Server Error');
		return;
	}

	response.destroy(error);
}
