export const consentStorageKey = 'portfolio.analyticsConsent';

export type AnalyticsConsent = 'granted' | 'denied';

export type AnalyticsEventName =
	| 'page_view'
	| 'click'
	| 'outbound_link'
	| 'download'
	| 'scroll_depth'
	| 'contact_action'
	| 'web_vital'
	| 'navigation_timing'
	| 'resource_timing'
	| 'client_error';

export const scrollMilestones = [25, 50, 75, 90, 100] as const;

export interface AnalyticsClickEvent {
	event: AnalyticsEventName;
	id: string;
	label?: string;
	href?: string;
	isExternal: boolean;
}

export function getStoredConsent(storage: Pick<Storage, 'getItem'>): AnalyticsConsent | null {
	const value = storage.getItem(consentStorageKey);

	if (value === 'granted' || value === 'denied') {
		return value;
	}

	return null;
}

export function setStoredConsent(storage: Pick<Storage, 'setItem'>, consent: AnalyticsConsent): void {
	storage.setItem(consentStorageKey, consent);
}

export function sanitizePath(url: string, origin: string): string {
	try {
		const parsed = new URL(url, origin);
		return parsed.origin === origin ? parsed.pathname : parsed.origin;
	} catch {
		return '/';
	}
}

export function getDeviceClass(width: number): 'mobile' | 'tablet' | 'desktop' {
	if (width < 768) {
		return 'mobile';
	}

	if (width < 1024) {
		return 'tablet';
	}

	return 'desktop';
}

export function getReachedScrollMilestones(depthPercent: number, reached: ReadonlySet<number>): number[] {
	return scrollMilestones.filter((milestone) => depthPercent >= milestone && !reached.has(milestone));
}

export function getScrollDepthPercent(scrollY: number, viewportHeight: number, documentHeight: number): number {
	if (documentHeight <= viewportHeight) {
		return 100;
	}

	return Math.min(100, Math.round(((scrollY + viewportHeight) / documentHeight) * 100));
}

export function extractAnalyticsClick(target: EventTarget | null, origin: string): AnalyticsClickEvent | null {
	if (!(target instanceof Element)) {
		return null;
	}

	const element = target.closest<HTMLElement>('[data-analytics-event]');

	if (!element) {
		return null;
	}

	const eventName = normalizeEventName(element.dataset.analyticsEvent);
	const id = element.dataset.analyticsId;

	if (!eventName || !id) {
		return null;
	}

	const link = element.closest<HTMLAnchorElement>('a[href]');
	const href = link?.href;
	const isExternal = href ? new URL(href, origin).origin !== origin : false;
	const isDownload = Boolean(link?.download);

	return {
		event: isDownload ? 'download' : isExternal ? 'outbound_link' : eventName,
		id,
		label: element.dataset.analyticsLabel,
		href: href ? sanitizePath(href, origin) : undefined,
		isExternal,
	};
}

function normalizeEventName(value: string | undefined): AnalyticsEventName | null {
	const allowed = new Set<AnalyticsEventName>([
		'click',
		'outbound_link',
		'download',
		'contact_action',
	]);

	return value && allowed.has(value as AnalyticsEventName) ? (value as AnalyticsEventName) : null;
}
