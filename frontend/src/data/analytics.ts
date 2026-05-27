export interface OpenPanelConfig {
	clientId: string;
	apiUrl: string;
	scriptUrl: string;
}

export function getOpenPanelConfig(): OpenPanelConfig | null {
	const clientId = getEnv('PUBLIC_OPENPANEL_CLIENT_ID');
	const apiUrl = getEnv('PUBLIC_OPENPANEL_API_URL');
	const scriptUrl = getEnv('PUBLIC_OPENPANEL_SCRIPT_URL');

	if (!clientId || !apiUrl || !scriptUrl) {
		return null;
	}

	return { clientId, apiUrl, scriptUrl };
}

function getEnv(name: string): string {
	if (typeof process !== 'undefined' && process.env) {
		return process.env[name] || '';
	}

	return '';
}
