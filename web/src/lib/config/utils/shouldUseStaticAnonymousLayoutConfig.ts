/**
 * Path prefixes where anonymous SSR may use git-managed company/marketing defaults
 * instead of live `/company/*` API fetches when {@link USE_STATIC_ANONYMOUS_LAYOUT_CONFIG} is enabled.
 */
export const STATIC_ANONYMOUS_LAYOUT_PATH_PREFIXES = [
	'/compare',
	'/agents',
	'/channels',
	'/tools',
	'/alternatives',
	'/playbooks',
	'/building-blocks',
	'/build-backlinks',
	'/creators',
	'/social-media-posting-api',
	'/social-media-scheduling-api',
	'/blog',
	'/docs',
	'/pricing',
	'/about',
	'/roadmap'
] as const;

export function pathnameMatchesStaticAnonymousLayoutAllowlist(pathname: string): boolean {
	const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	return STATIC_ANONYMOUS_LAYOUT_PATH_PREFIXES.some(
		(prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
	);
}

export function parseUseStaticAnonymousLayoutConfigFlag(
	raw: string | undefined
): boolean {
	const value = String(raw ?? '').trim().toLowerCase();
	return value === '1' || value === 'true' || value === 'yes';
}

export function shouldUseStaticAnonymousLayoutConfig(params: {
	pathname: string;
	envEnabled: string | undefined;
	isLoggedIn: boolean;
}): boolean {
	if (params.isLoggedIn) return false;
	if (!parseUseStaticAnonymousLayoutConfigFlag(params.envEnabled)) return false;
	return pathnameMatchesStaticAnonymousLayoutAllowlist(params.pathname);
}
