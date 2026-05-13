export const buildInfo = {
	service: 'portfolio',
	version: import.meta.env.PUBLIC_BUILD_VERSION || import.meta.env.PUBLIC_COMMIT_SHA || 'development',
	commit: import.meta.env.PUBLIC_COMMIT_SHA || 'development',
	builtAt: import.meta.env.PUBLIC_BUILT_AT || new Date().toISOString(),
} as const;
