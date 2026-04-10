import { route } from '$lib/utils/path';

/**
 * Resolves a safe in-app path after sign-in from `redirectURL` query, or returns `defaultPath`.
 */
export function getPostSigninRedirectTarget(
	searchParams: URLSearchParams,
	defaultPath: string
): string {
	function validateRedirectURL(raw: string): string | null {
		if (!raw || !raw.trim()) return null;
		let decoded: string;
		try {
			decoded = decodeURIComponent(raw).trim();
		} catch {
			decoded = raw.trim();
		}
		if (decoded.startsWith('//') || (!decoded.startsWith('/') && !decoded.startsWith('http')))
			return null;
		if (!decoded.startsWith('http') && !decoded.startsWith('/')) decoded = '/' + decoded;
		return decoded;
	}
	function isLandingPath(pathOrUrl: string): boolean {
		const pathname = pathOrUrl.startsWith('http')
			? new URL(pathOrUrl).pathname
			: pathOrUrl.split('?')[0] || '/';
		return route(pathname) === '/';
	}

	const redirectParam = searchParams.get('redirectURL');
	if (redirectParam) {
		const validated = validateRedirectURL(redirectParam);
		if (validated) return isLandingPath(validated) ? defaultPath : validated;
	}
	return defaultPath;
}
