import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import type { ItemList, ListItem, Thing } from 'schema-dts';

/** HTML `id` and JSON-LD `@id` fragment for `PublicLandingHeroStatBadges`. */
export const PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID = 'product-highlights';

function normalizePageBase(pageUrl: string): string {
	return pageUrl.replace(/#.*$/, '').replace(/\/$/, '') || pageUrl;
}

function slugifyBadgeId(id: string): string {
	return id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'highlight';
}

function resolveBadgeItemUrl(
	href: string | undefined,
	pageOrigin: string | undefined
): string | undefined {
	if (!href?.trim()) return undefined;
	const trimmed = href.trim();
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	if (!pageOrigin) return trimmed;
	const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	return `${pageOrigin.replace(/\/$/, '')}${path}`;
}

/**
 * JSON-LD `ItemList` for visible hero stat badge rows (`#product-highlights`).
 * @see https://schema.org/ItemList
 */
export function createPublicHeroStatBadgesSEOSchema(params: {
	pageUrl: string;
	pageOrigin?: string;
	sectionName?: string;
	badges: readonly PublicLandingHeroStatBadge[];
}): ItemList | null {
	const { pageUrl, pageOrigin, sectionName, badges } = params;

	if (badges.length === 0) {
		return null;
	}

	const pageBase = normalizePageBase(pageUrl);
	const listId = `${pageBase}#${PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID}`;

	return {
		'@type': 'ItemList',
		'@id': listId,
		...(sectionName?.trim() ? { name: sectionName.trim() } : {}),
		numberOfItems: badges.length,
		itemListElement: badges.map((badge, index) => {
			const itemId = `${pageBase}#${PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID}-${slugifyBadgeId(badge.id)}`;
			const itemUrl = resolveBadgeItemUrl(badge.href, pageOrigin);

			const item: Thing = {
				'@type': 'Thing',
				'@id': itemId,
				name: badge.value.trim(),
				description: badge.label.trim(),
				...(itemUrl ? { url: itemUrl } : {})
			};

			return {
				'@type': 'ListItem',
				position: index + 1,
				name: `${badge.value.trim()} — ${badge.label.trim()}`,
				item
			} as ListItem;
		})
	};
}
