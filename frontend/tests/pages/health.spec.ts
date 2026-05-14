import { describe, expect, it } from 'vitest';

import { GET as getHealth } from '../../src/pages/health';

describe('health endpoint', () => {
	it('returns no-store health metadata', async () => {
		const response = await getHealth({} as never);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get('Cache-Control')).toBe('private, no-store');
		expect(body.status).toBe('ok');
		expect(body.service).toBe('portfolio');
		expect(body.version).toBeTruthy();
		expect(body.commit).toBeTruthy();
		expect(typeof body.uptimeSeconds).toBe('number');
	});
});
