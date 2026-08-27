const runtimeEnvironment = typeof process !== 'undefined' ? process.env : undefined;

export function getPublicEnv(name: string, fallback = ''): string {
	return runtimeEnvironment?.[name] ?? import.meta.env[name] ?? fallback;
}
