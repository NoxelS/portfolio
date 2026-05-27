export const buildInfo = {
	service: 'portfolio',
	version: getRuntimeValue('PUBLIC_BUILD_VERSION') || getRuntimeValue('PUBLIC_COMMIT_SHA') || 'development',
	commit: getRuntimeValue('PUBLIC_COMMIT_SHA') || 'development',
	builtAt: getRuntimeValue('PUBLIC_BUILT_AT') || new Date().toISOString(),
} as const;

function getRuntimeValue(name: 'PUBLIC_BUILD_VERSION' | 'PUBLIC_COMMIT_SHA' | 'PUBLIC_BUILT_AT'): string {
	if (typeof window !== 'undefined') {
		const value = window.__PORTFOLIO_RUNTIME__?.[name];
		if (typeof value === 'string') {
			return value;
		}
	}

	if (typeof process !== 'undefined' && process.env) {
		return process.env[name] || '';
	}

	return '';
}

declare global {
	interface Window {
		__PORTFOLIO_RUNTIME__?: Partial<Record<'PUBLIC_BUILD_VERSION' | 'PUBLIC_COMMIT_SHA' | 'PUBLIC_BUILT_AT', string>>;
	}
}
