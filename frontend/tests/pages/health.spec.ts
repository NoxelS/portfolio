import { describe, expect, it } from 'vitest';

import { GET as getHealth } from '../../src/pages/health';

describe('health endpoint', () => {
	it('returns static build health metadata', async () => {
		const response = await getHealth({} as never);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get('Cache-Control')).toContain('s-maxage=300');
		expect(body.status).toBe('ok');
		expect(body.service).toBe('portfolio');
		expect(body.version).toBeTruthy();
		expect(body.commit).toBeTruthy();
		expect(body).not.toHaveProperty('uptimeSeconds');
	});
});
