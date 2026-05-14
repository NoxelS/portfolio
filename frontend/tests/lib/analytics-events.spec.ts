import { describe, expect, it } from 'vitest';

import {
	consentStorageKey,
	getDeviceClass,
	getReachedScrollMilestones,
	getScrollDepthPercent,
	getStoredConsent,
	sanitizePath,
	setStoredConsent,
} from '../../src/lib/analytics-events';

describe('analytics event helpers', () => {
	it('stores and reads explicit analytics consent', () => {
		const storage = new Map<string, string>();
		const adapter = {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => storage.set(key, value),
		};

		expect(getStoredConsent(adapter)).toBeNull();

		setStoredConsent(adapter, 'granted');

		expect(storage.get(consentStorageKey)).toBe('granted');
		expect(getStoredConsent(adapter)).toBe('granted');
	});

	it('deduplicates scroll milestones', () => {
		expect(getReachedScrollMilestones(76, new Set([25]))).toEqual([50, 75]);
	});

	it('calculates scroll depth and handles short pages', () => {
		expect(getScrollDepthPercent(0, 900, 800)).toBe(100);
		expect(getScrollDepthPercent(500, 500, 2000)).toBe(50);
	});

	it('classifies devices by viewport width', () => {
		expect(getDeviceClass(390)).toBe('mobile');
		expect(getDeviceClass(900)).toBe('tablet');
		expect(getDeviceClass(1440)).toBe('desktop');
	});

	it('strips query strings and external paths', () => {
		expect(sanitizePath('/projects?token=secret', 'https://noel.fyi')).toBe('/projects');
		expect(sanitizePath('https://github.com/NoxelS?tab=repositories', 'https://noel.fyi')).toBe('https://github.com');
	});
});
