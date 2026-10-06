/**
 * Edge cache hints for anonymous public marketing HTML (Vercel / Cloudflare).
 * Logged-in visitors skip these headers so navbar auth state is not served from a shared cache entry.
 *
 * Layering (Redis origin cache does not replace these): see
 * `web/src/content/docs/configuration-backend/cache-design.md` → Public CMS HTTP cache layers.
 */
export const PUBLIC_CMS_PAGE_CACHE_CONTROL =
	'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

/** HTML for editor-managed public detail pages — pair with backend + SSR API no-cache. */
export const EDITOR_MANAGED_PUBLIC_PAGE_CACHE_CONTROL =
	'private, no-cache, must-revalidate';

const BUILD_BACKLINKS_NON_SITE_SEGMENTS = new Set(['tags', 'categories']);

/** `/build-backlinks/{siteSlug}` site guides (not hub, tags, or categories indexes). */
export function isBuildBacklinksSiteGuideDetailPath(pathname: string): boolean {
	const match = pathname.match(/^\/build-backlinks\/([^/]+)\/?$/);
	if (!match) return false;
	return !BUILD_BACKLINKS_NON_SITE_SEGMENTS.has(match[1]);
}

const BLOG_NON_POST_SEGMENTS = new Set(['topic', 'author']);

/** `/blog/{postSlug}` — not hub, topic, or author indexes. */
export function isPublicBlogPostDetailPath(pathname: string): boolean {
	const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
	if (!match) return false;
	return !BLOG_NON_POST_SEGMENTS.has(match[1]);
}

/** Creator catalog detail: building block or playbook by slug (matches listing/stack API detail reads). */
export function isPublicCreatorListingDetailPath(pathname: string): boolean {
	return /^\/creators\/[^/]+\/(building-blocks|playbooks)\/[^/]+\/?$/.test(pathname);
}

/**
 * Pathnames whose SSR HTML is edited in secret-admin and must not be edge-cached.
 * Aligns with backend `isEditorManagedPublicDetailRoute` URL families (blog post, listing/stack, link-directory site).
 */
export function isEditorManagedPublicHtmlPath(pathname: string): boolean {
	return (
		isBuildBacklinksSiteGuideDetailPath(pathname) ||
		isPublicBlogPostDetailPath(pathname) ||
		isPublicCreatorListingDetailPath(pathname)
	);
}

export function applyPublicCmsPageCacheHeaders(
	setHeaders: (headers: Record<string, string>) => void
): void {
	setHeaders({
		'cache-control': PUBLIC_CMS_PAGE_CACHE_CONTROL
	});
}

export function applyEditorManagedPublicPageCacheHeaders(
	setHeaders: (headers: Record<string, string>) => void
): void {
	setHeaders({
		'cache-control': EDITOR_MANAGED_PUBLIC_PAGE_CACHE_CONTROL
	});
}

/** Anonymous public HTML cache policy for a pathname (layout load). */
export function applyPublicHtmlCacheHeadersForPathname(
	pathname: string,
	setHeaders: (headers: Record<string, string>) => void
): void {
	if (isEditorManagedPublicHtmlPath(pathname)) {
		applyEditorManagedPublicPageCacheHeaders(setHeaders);
		return;
	}
	applyPublicCmsPageCacheHeaders(setHeaders);
}
