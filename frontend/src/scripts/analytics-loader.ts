import type { OpenPanelConfig } from '../data/analytics';

const consentKey = 'portfolio.analytics.consent';
const config = window.__PORTFOLIO_ANALYTICS__;

if (config) {
	setupAnalytics(config);
}

function setupAnalytics(config: OpenPanelConfig): void {
	const banner = document.querySelector<HTMLElement>('[data-analytics-consent-banner]');
	const accept = document.querySelector('[data-analytics-consent-accept]');
	const reject = document.querySelector('[data-analytics-consent-reject]');
	const consent = window.localStorage.getItem(consentKey);

	if (consent === 'granted') {
		loadAnalytics(config);
	} else if (!consent && banner) {
		banner.hidden = false;
	}

	accept?.addEventListener('click', () => {
		window.localStorage.setItem(consentKey, 'granted');
		if (banner) banner.hidden = true;
		loadAnalytics(config);
	});

	reject?.addEventListener('click', () => {
		window.localStorage.setItem(consentKey, 'denied');
		if (banner) banner.hidden = true;
	});
}

async function loadAnalytics(config: OpenPanelConfig): Promise<void> {
	const analytics = await import('./analytics');
	analytics.startAnalytics(config);
}

declare global {
	interface Window {
		__PORTFOLIO_ANALYTICS__?: OpenPanelConfig;
	}
}
