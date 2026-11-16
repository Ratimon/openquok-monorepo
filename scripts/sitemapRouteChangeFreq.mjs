/**
 * Sitemap changefreq hints for routes-manifest generation.
 * Keep backend/middlewares/generateSitemap.ts `resolveSitemapChangeFreq` aligned.
 */

/** Marketing hubs and indexes that ship copy, FAQ, or filter UX more often than long-tail landings. */
export const WEEKLY_MARKETING_HUB_PATHS = new Set([
	'/alternatives',
	'/alternatives/categories',
	'/compare',
	'/agents',
	'/channels',
	'/tools',
	'/pricing',
	'/build-backlinks',
	'/build-backlinks/categories',
	'/build-backlinks/tags',
	'/browser-extension',
	'/building-blocks',
	'/building-blocks/categories',
	'/building-blocks/tags',
	'/playbooks',
	'/playbooks/categories',
	'/playbooks/tags',
	'/docs',
	'/directory-submission-tool'
]);

/**
 * @param {string} routePath
 * @param {string} [routeType]
 * @returns {'daily' | 'weekly' | 'monthly'}
 */
export function resolveManifestRouteChangeFreq(routePath, routeType) {
	if (WEEKLY_MARKETING_HUB_PATHS.has(routePath)) {
		return 'weekly';
	}

	switch (routeType) {
		case 'programmatic-alternatives':
		case 'public-catalog':
		case 'programmatic-api-marketing-hub':
		case 'programmatic-api-marketing-platform':
			return 'weekly';
		case 'programmatic-compare':
		case 'programmatic-agent-channel':
		case 'programmatic-tool-channel':
			return 'monthly';
		default:
			return 'monthly';
	}
}