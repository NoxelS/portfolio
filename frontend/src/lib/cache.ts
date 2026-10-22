export const cacheControl = {
	// Cloudflare honors no-transform by skipping JavaScript Detections injection.
	// Keep the public HTML free of edge scripts that probe deprecated browser APIs.
	publicPage: 'public, max-age=60, s-maxage=600, stale-while-revalidate=60, no-transform',
	publicDocument: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=600',
	publicData: 'public, max-age=30, s-maxage=300, stale-while-revalidate=60',
	private: 'private, no-store',
} as const;

export function setPublicPageCache(headers: Headers): void {
	setSharedCache(headers, cacheControl.publicPage);
}

export function setPublicDocumentCache(headers: Headers): void {
	setSharedCache(headers, cacheControl.publicDocument);
}

export function setPublicDataCache(headers: Headers): void {
	setSharedCache(headers, cacheControl.publicData);
}

export function setPrivateCache(headers: Headers): void {
	headers.set('Cache-Control', cacheControl.private);
	headers.set('CDN-Cache-Control', cacheControl.private);
}

function setSharedCache(headers: Headers, value: string): void {
	headers.set('Cache-Control', value);
	headers.set('CDN-Cache-Control', value);
}
