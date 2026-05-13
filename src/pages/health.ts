import type { APIRoute } from 'astro';

import { buildInfo } from '../lib/build-info';
import { setPrivateCache } from '../lib/cache';

export const prerender = false;

const startedAt = Date.now();

export const GET: APIRoute = () => {
	const headers = new Headers({
		'Content-Type': 'application/json; charset=utf-8',
	});
	setPrivateCache(headers);

	return new Response(
		JSON.stringify({
			status: 'ok',
			service: buildInfo.service,
			version: buildInfo.version,
			commit: buildInfo.commit,
			builtAt: buildInfo.builtAt,
			uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
			timestamp: new Date().toISOString(),
		}),
		{ headers }
	);
};
