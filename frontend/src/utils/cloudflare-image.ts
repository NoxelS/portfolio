type CloudflareImageOptions = {
	width?: number;
	quality?: number;
};

/** Add Cloudflare Image Transformations only in the production deployment. */
export function cloudflareImageUrl(source: string, options: CloudflareImageOptions = {}): string {
	if (
		import.meta.env.PUBLIC_CLOUDFLARE_IMAGE_RESIZING !== 'true' ||
		!source.startsWith('/') ||
	/source\.svg(?:$|\?)/i.test(source)
	) {
		return source;
	}

	const transformations = [
		options.width ? `width=${options.width}` : 'width=auto',
		`quality=${options.quality ?? 80}`,
		'format=auto',
	];

	return `/cdn-cgi/image/${transformations.join(',')}${source}`;
}
