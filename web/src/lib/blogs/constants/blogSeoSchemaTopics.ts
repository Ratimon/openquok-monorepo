/** Topic slug for How-to Tutorials posts (from `generate_unique_slug` on topic name). */
export const BLOG_SEO_TOPIC_SLUG_HOWTO = 'howto-tutorials';

/** Topic slug for Feature Walkthroughs by Use Case posts (from `generate_unique_slug` on topic name). */
export const BLOG_SEO_TOPIC_SLUG_GUIDE = 'feature-walkthroughs-by-use-case';

/** Topic slugs eligible for Product structured data. */
export const BLOG_SEO_TOPIC_SLUGS_PRODUCT = [
	'product-updates',
	'roadmap-previews',
	'adoption-announcements-migration-tips'
] as const;

/** Seeded topic id for HowTo structured data (How-to Tutorials). */
export const BLOG_SEO_TOPIC_ID_HOWTO = 'd5f7a000-0000-4000-a000-000000000202';

/** Seeded topic id for Guide structured data (Feature Walkthroughs by Use Case). */
export const BLOG_SEO_TOPIC_ID_GUIDE = 'd5f7a000-0000-4000-a000-000000000203';

/** Seeded topic ids for Product structured data. */
export const BLOG_SEO_TOPIC_IDS_PRODUCT = [
	'd5f7a000-0000-4000-a000-000000000301',
	'd5f7a000-0000-4000-a000-000000000302',
	'd5f7a000-0000-4000-a000-000000000303'
] as const;

/** True when the post has a topic — admins may add optional HowTo steps on any topic. */
export function isBlogTopicEligibleForHowTo(
	topicSlug: string | null | undefined,
	topicId?: string | null | undefined
): boolean {
	return Boolean(topicId?.trim() || topicSlug?.trim());
}

export function isBlogTopicEligibleForGuide(
	topicSlug: string | null | undefined,
	topicId?: string | null | undefined
): boolean {
	if (topicId === BLOG_SEO_TOPIC_ID_GUIDE) return true;
	return topicSlug === BLOG_SEO_TOPIC_SLUG_GUIDE;
}

/** True when the post has a topic — admins may add an optional product summary on any topic. */
export function isBlogTopicEligibleForProduct(
	topicSlug: string | null | undefined,
	topicId?: string | null | undefined
): boolean {
	return Boolean(topicId?.trim() || topicSlug?.trim());
}
