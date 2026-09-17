/**
 * Edge cache hints for anonymous public marketing HTML (Vercel / Cloudflare).
 * Logged-in visitors skip these headers so navbar auth state is not served from a shared cache entry.
 */
export const PUBLIC_CMS_PAGE_CACHE_CONTROL =
	'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

export function applyPublicCmsPageCacheHeaders(
	setHeaders: (headers: Record<string, string>) => void
): void {
	setHeaders({
		'cache-control': PUBLIC_CMS_PAGE_CACHE_CONTROL
	});
}
