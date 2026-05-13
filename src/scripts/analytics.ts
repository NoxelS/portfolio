import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

import { buildInfo } from '../lib/build-info';
import { hasOpenPanelConfig, openPanelConfig } from '../data/analytics';
import {
	extractAnalyticsClick,
	getDeviceClass,
	getReachedScrollMilestones,
	getScrollDepthPercent,
	getStoredConsent,
	sanitizePath,
	setStoredConsent,
	type AnalyticsConsent,
	type AnalyticsEventName,
} from '../lib/analytics-events';

if (hasOpenPanelConfig) {
	startAnalytics();
}

function startAnalytics(): void {
	const initialConsent = getStoredConsent(window.localStorage);
	installOpenPanelQueue();
	window.op('init', {
		clientId: openPanelConfig.clientId,
		apiUrl: openPanelConfig.apiUrl,
		disabled: initialConsent !== 'granted',
		trackAttributes: false,
		trackOutgoingLinks: false,
		trackScreenViews: false,
	});
	loadOpenPanelScript();

	const track = (name: AnalyticsEventName, properties: Record<string, unknown> = {}) => {
		if (getStoredConsent(window.localStorage) === 'denied') {
			return;
		}

		window.op('track', name, {
			...getPageProperties(),
			...properties,
		});
	};

	setupConsentBanner(track, initialConsent);
	track('page_view');
	trackNavigationTiming(track);
	trackResourceTiming(track);
	trackWebVitals(track);
	trackClicks(track);
	trackScrollDepth(track);
	trackClientErrors(track);
}

function setupConsentBanner(
	track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void,
	initialConsent: AnalyticsConsent | null
): void {
	const banner = document.querySelector<HTMLElement>('[data-analytics-consent-banner]');

	if (!banner || initialConsent) {
		return;
	}

	banner.hidden = false;

	banner.querySelector('[data-analytics-consent-accept]')?.addEventListener('click', () => {
		setStoredConsent(window.localStorage, 'granted');
		window.op('ready');
		track('click', { analyticsId: 'analytics-consent.accept' });
		banner.hidden = true;
	});

	banner.querySelector('[data-analytics-consent-reject]')?.addEventListener('click', () => {
		setStoredConsent(window.localStorage, 'denied');
		banner.hidden = true;
	});
}

function trackClicks(track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void): void {
	document.addEventListener(
		'click',
		(event) => {
			const click = extractAnalyticsClick(event.target, window.location.origin);

			if (!click) {
				return;
			}

			track(click.event, {
				analyticsId: click.id,
				label: click.label,
				href: click.href,
				isExternal: click.isExternal,
			});
		},
		{ passive: true }
	);
}

function trackScrollDepth(track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void): void {
	const reached = new Set<number>();
	let ticking = false;

	const checkDepth = () => {
		ticking = false;
		const depth = getScrollDepthPercent(window.scrollY, window.innerHeight, document.documentElement.scrollHeight);

		for (const milestone of getReachedScrollMilestones(depth, reached)) {
			reached.add(milestone);
			track('scroll_depth', { depth: milestone });
		}
	};

	window.addEventListener(
		'scroll',
		() => {
			if (!ticking) {
				ticking = true;
				window.requestAnimationFrame(checkDepth);
			}
		},
		{ passive: true }
	);

	checkDepth();
}

function trackWebVitals(track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void): void {
	const report = (metric: Metric) => {
		track('web_vital', {
			id: metric.id,
			name: metric.name,
			value: metric.value,
			delta: metric.delta,
			rating: metric.rating,
			navigationType: metric.navigationType,
		});
	};

	onCLS(report);
	onFCP(report);
	onINP(report);
	onLCP(report);
	onTTFB(report);
}

function trackNavigationTiming(track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void): void {
	window.addEventListener('load', () => {
		const navigation = performance.getEntriesByType('navigation')[0];

		if (!navigation) {
			return;
		}

		track('navigation_timing', {
			type: navigation.type,
			redirectCount: navigation.redirectCount,
			dns: duration(navigation.domainLookupStart, navigation.domainLookupEnd),
			connect: duration(navigation.connectStart, navigation.connectEnd),
			tls: navigation.secureConnectionStart > 0 ? duration(navigation.secureConnectionStart, navigation.connectEnd) : 0,
			request: duration(navigation.requestStart, navigation.responseStart),
			response: duration(navigation.responseStart, navigation.responseEnd),
			domInteractive: Math.round(navigation.domInteractive),
			load: Math.round(navigation.loadEventEnd),
			serverTiming: Object.fromEntries(navigation.serverTiming.map((timing) => [timing.name, timing.duration])),
		});
	});
}

function trackResourceTiming(track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void): void {
	window.addEventListener('load', () => {
		const resources = performance
			.getEntriesByType('resource')
			.filter((entry): entry is PerformanceResourceTiming => entry instanceof PerformanceResourceTiming)
			.map((resource) => ({
				name: sanitizePath(resource.name, window.location.origin),
				initiatorType: resource.initiatorType,
				duration: Math.round(resource.duration),
				transferSize: resource.transferSize,
				encodedBodySize: resource.encodedBodySize,
				decodedBodySize: resource.decodedBodySize,
			}))
			.sort((a, b) => b.transferSize - a.transferSize || b.duration - a.duration)
			.slice(0, 10);

		track('resource_timing', { resources });
	});
}

function trackClientErrors(track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void): void {
	window.addEventListener('error', (event) => {
		track('client_error', {
			message: truncate(event.message),
			filename: event.filename ? sanitizePath(event.filename, window.location.origin) : undefined,
			lineno: event.lineno,
			colno: event.colno,
		});
	});

	window.addEventListener('unhandledrejection', (event) => {
		track('client_error', {
			message: truncate(String(event.reason)),
			type: 'unhandledrejection',
		});
	});
}

function getPageProperties(): Record<string, unknown> {
	return {
		schema: 'portfolio.analytics.v1',
		release: buildInfo.version,
		commit: buildInfo.commit,
		path: window.location.pathname,
		referrer: document.referrer ? sanitizePath(document.referrer, window.location.origin) : undefined,
		title: document.title,
		deviceClass: getDeviceClass(window.innerWidth),
		viewport: `${window.innerWidth}x${window.innerHeight}`,
		language: navigator.language,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	};
}

function duration(start: number, end: number): number {
	return Math.max(0, Math.round(end - start));
}

function truncate(value: string): string {
	return value.slice(0, 240);
}

function loadOpenPanelScript(): void {
	if (document.querySelector('script[data-openpanel-sdk]')) {
		return;
	}

	const script = document.createElement('script');
	script.src = openPanelConfig.scriptUrl;
	script.async = true;
	script.defer = true;
	script.dataset.openpanelSdk = 'true';
	document.head.append(script);
}

function installOpenPanelQueue(): void {
	if (window.op) {
		return;
	}

	const queue: unknown[][] = [];
	const op = ((...args: unknown[]) => {
		queue.push(args);
	}) as OpenPanelQueue;
	op.q = queue;

	window.op = new Proxy(op, {
		get(target, property) {
			if (property === 'q') {
				return target.q;
			}

			return (...args: unknown[]) => {
				queue.push([property, ...args]);
			};
		},
		has() {
			return true;
		},
	});
}

type OpenPanelQueue = {
	(...args: unknown[]): void;
	q: unknown[][];
};

declare global {
	interface Window {
		op: OpenPanelQueue;
	}
}
