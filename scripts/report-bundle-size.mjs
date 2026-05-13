import { createGzip } from 'node:zlib';
import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const clientDir = 'dist/client';
const serverDir = 'dist/server';
const trackedExtensions = new Set(['.css', '.js', '.mjs']);

const [clientAssets, serverAssets] = await Promise.all([collectAssets(clientDir), collectAssets(serverDir)]);

const clientTracked = clientAssets.filter((asset) => trackedExtensions.has(extname(asset.path)));
const serverTracked = serverAssets.filter((asset) => trackedExtensions.has(extname(asset.path)));

const report = {
	client: summarize(clientTracked),
	server: summarize(serverTracked),
	largestClientAssets: largest(clientTracked),
	largestServerAssets: largest(serverTracked),
};

console.log(JSON.stringify(report, null, 2));

async function collectAssets(dir) {
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		const nested = await Promise.all(
			entries.map(async (entry) => {
				const path = join(dir, entry.name);

				if (entry.isDirectory()) {
					return collectAssets(path);
				}

				const stats = await stat(path);
				return [
					{
						path,
						size: stats.size,
						gzipSize: await gzipSize(path),
					},
				];
			})
		);

		return nested.flat();
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			return [];
		}

		throw error;
	}
}

function summarize(assets) {
	return {
		assetCount: assets.length,
		totalBytes: sum(assets, 'size'),
		totalGzipBytes: sum(assets, 'gzipSize'),
	};
}

function largest(assets) {
	return assets
		.toSorted((a, b) => b.size - a.size)
		.slice(0, 10)
		.map((asset) => ({
			path: relative(process.cwd(), asset.path),
			bytes: asset.size,
			gzipBytes: asset.gzipSize,
		}));
}

function sum(assets, key) {
	return assets.reduce((total, asset) => total + asset[key], 0);
}

function gzipSize(path) {
	return new Promise((resolve, reject) => {
		let size = 0;
		const gzip = createGzip({ level: 9 });

		createReadStream(path)
			.on('error', reject)
			.pipe(gzip)
			.on('data', (chunk) => {
				size += chunk.length;
			})
			.on('error', reject)
			.on('end', () => resolve(size));
	});
}
