import type { APIRoute } from 'astro';

import { buildInfo } from '../lib/build-info';
import { setPublicDataCache } from '../lib/cache';

export const prerender = false;

export const GET: APIRoute = () => {
	const headers = new Headers({
		'Content-Type': 'application/json; charset=utf-8',
	});
	setPublicDataCache(headers);

	return new Response(
		JSON.stringify({
			status: 'ok',
			service: buildInfo.service,
			version: buildInfo.version,
			commit: buildInfo.commit,
			builtAt: buildInfo.builtAt,
		}),
		{ headers }
	);
};
