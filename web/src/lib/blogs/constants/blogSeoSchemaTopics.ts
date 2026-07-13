/** Topic slug for How-to Tutorials posts (from `generate_unique_slug` on topic name). */
export const BLOG_SEO_TOPIC_SLUG_HOWTO = 'howto-tutorials';

/** Topic slugs eligible for Product structured data. */
export const BLOG_SEO_TOPIC_SLUGS_PRODUCT = [
	'product-updates',
	'roadmap-previews',
	'adoption-announcements-migration-tips'
] as const;

/** Seeded topic id for HowTo structured data (How-to Tutorials). */
export const BLOG_SEO_TOPIC_ID_HOWTO = 'd5f7a000-0000-4000-a000-000000000202';

/** Seeded topic ids for Product structured data. */
export const BLOG_SEO_TOPIC_IDS_PRODUCT = [
	'd5f7a000-0000-4000-a000-000000000301',
	'd5f7a000-0000-4000-a000-000000000302',
	'd5f7a000-0000-4000-a000-000000000303'
] as const;

export function isBlogTopicEligibleForHowTo(
	topicSlug: string | null | undefined,
	topicId?: string | null | undefined
): boolean {
	if (topicId === BLOG_SEO_TOPIC_ID_HOWTO) return true;
	return topicSlug === BLOG_SEO_TOPIC_SLUG_HOWTO;
}

export function isBlogTopicEligibleForProduct(
	topicSlug: string | null | undefined,
	topicId?: string | null | undefined
): boolean {
	if (topicId && (BLOG_SEO_TOPIC_IDS_PRODUCT as readonly string[]).includes(topicId)) {
		return true;
	}
	if (!topicSlug) return false;
	return (BLOG_SEO_TOPIC_SLUGS_PRODUCT as readonly string[]).includes(topicSlug);
}
