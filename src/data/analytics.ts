export const openPanelConfig = {
	clientId: import.meta.env.PUBLIC_OPENPANEL_CLIENT_ID,
	apiUrl: import.meta.env.PUBLIC_OPENPANEL_API_URL,
	scriptUrl: import.meta.env.PUBLIC_OPENPANEL_SCRIPT_URL,
};

export const hasOpenPanelConfig = Boolean(openPanelConfig.clientId && openPanelConfig.apiUrl && openPanelConfig.scriptUrl);
