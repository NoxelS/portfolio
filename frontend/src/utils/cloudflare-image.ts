type CloudflareImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
};

/** Add Cloudflare Image Transformations when enabled at build time. */
export function cloudflareImageUrl(source: string, options: CloudflareImageOptions = {}): string {
	if (
		import.meta.env.PUBLIC_CLOUDFLARE_IMAGE_RESIZING !== 'true' ||
		!source.startsWith('/') ||
		source.startsWith('//') ||
		/\.svg(?:$|[?#])/i.test(source)
	) {
		return source;
	}

	const transformations = [
		options.width ? `width=${options.width}` : 'width=auto',
		...(options.height ? [`height=${options.height}`] : []),
		`quality=${options.quality ?? 80}`,
		'format=auto',
	];

	return `/cdn-cgi/image/${transformations.join(',')}${source}`;
}

/** Width candidates for images whose CSS size changes with the viewport. */
export function cloudflareImageSrcSet(source: string, widths: readonly number[]): string | undefined {
	if (cloudflareImageUrl(source) === source) return undefined;

	return widths.map(width => `${cloudflareImageUrl(source, { width })} ${width}w`).join(', ');
}

/** Density candidates sized to a fixed CSS bounding box without changing aspect ratio. */
export function cloudflareImageDensitySrcSet(
	source: string,
	options: Required<Pick<CloudflareImageOptions, 'width' | 'height'>>,
): string | undefined {
	if (cloudflareImageUrl(source) === source) return undefined;

	return [1, 2, 3].map(density => `${cloudflareImageUrl(source, {
		width: options.width * density,
		height: options.height * density,
	})} ${density}x`).join(', ');
}
