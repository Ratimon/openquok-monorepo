import type {
	LinkDirectoryApprovalMode,
	LinkDirectoryCostTier,
	LinkDirectoryDofollow
} from '$lib/link-directory/link-directory.types';

export const EDITORIAL_TAG_SLUGS = ['high-dr', 'community-moderated', 'github'] as const;

export type BuildBacklinksEditorialTagSlug = (typeof EDITORIAL_TAG_SLUGS)[number];

export type BuildBacklinksVirtualTagSlug =
	| 'dofollow'
	| 'instant-approval'
	| 'paid-listing'
	| 'profile-link'
	| 'guest-post'
	| 'open-source';

export type BuildBacklinksPublishedTagQuery = {
	tagSlugs?: string[];
	costTiers?: LinkDirectoryCostTier[];
	dofollow?: LinkDirectoryDofollow[];
	approvalMode?: LinkDirectoryApprovalMode[];
	opportunityTypeSlugs?: string[];
};

export type BuildBacklinksVirtualTag = {
	slug: BuildBacklinksVirtualTagSlug;
	name: string;
	description: string;
	toPublishedQuery: () => BuildBacklinksPublishedTagQuery;
};

const EDITORIAL_TAG_SLUG_SET = new Set<string>(EDITORIAL_TAG_SLUGS);

export const BUILD_BACKLINKS_VIRTUAL_TAGS: readonly BuildBacklinksVirtualTag[] = [
	{
		slug: 'dofollow',
		name: 'Dofollow links',
		description: 'Sites with at least one published opportunity that passes dofollow link equity.',
		toPublishedQuery: () => ({ dofollow: ['dofollow'] })
	},
	{
		slug: 'instant-approval',
		name: 'Instant approval',
		description: 'Opportunities you can claim without waiting on manual review.',
		toPublishedQuery: () => ({ approvalMode: ['instant'] })
	},
	{
		slug: 'paid-listing',
		name: 'Paid listing',
		description: 'Listings or placements that require a paid tier or listing fee.',
		toPublishedQuery: () => ({ costTiers: ['paid'] })
	},
	{
		slug: 'profile-link',
		name: 'Profile link',
		description: 'Website or profile fields where you can add a backlink.',
		toPublishedQuery: () => ({ opportunityTypeSlugs: ['profile_link'] })
	},
	{
		slug: 'guest-post',
		name: 'Guest post',
		description: 'Contributed articles or posts with editorial review.',
		toPublishedQuery: () => ({ opportunityTypeSlugs: ['guest_post'] })
	},
	{
		slug: 'open-source',
		name: 'Open source',
		description: 'GitHub lists, README links, or contribution workflows.',
		toPublishedQuery: () => ({ opportunityTypeSlugs: ['github_contribution'] })
	}
];

const VIRTUAL_TAG_BY_SLUG = new Map(
	BUILD_BACKLINKS_VIRTUAL_TAGS.map((tag) => [tag.slug, tag])
);

export type BuildBacklinksResolvedTagSlug =
	| { kind: 'editorial'; slug: BuildBacklinksEditorialTagSlug }
	| { kind: 'virtual'; tag: BuildBacklinksVirtualTag }
	| { kind: 'unknown'; slug: string };

export function isBuildBacklinksEditorialTagSlug(slug: string): boolean {
	return EDITORIAL_TAG_SLUG_SET.has(slug.trim());
}

export function resolveBuildBacklinksTagSlug(slug: string): BuildBacklinksResolvedTagSlug {
	const normalized = slug.trim();
	if (!normalized) {
		return { kind: 'unknown', slug: normalized };
	}
	if (EDITORIAL_TAG_SLUG_SET.has(normalized)) {
		return { kind: 'editorial', slug: normalized as BuildBacklinksEditorialTagSlug };
	}
	const virtual = VIRTUAL_TAG_BY_SLUG.get(normalized as BuildBacklinksVirtualTagSlug);
	if (virtual) {
		return { kind: 'virtual', tag: virtual };
	}
	return { kind: 'unknown', slug: normalized };
}

function mergeStringField<T extends string>(
	base: T[] | undefined,
	add: T[] | undefined
): T[] | undefined {
	const merged = [...(base ?? []), ...(add ?? [])];
	const unique = [...new Set(merged)];
	return unique.length > 0 ? unique : undefined;
}

function mergePublishedTagQuery(
	target: BuildBacklinksPublishedTagQuery,
	part: BuildBacklinksPublishedTagQuery
): BuildBacklinksPublishedTagQuery {
	return {
		tagSlugs: mergeStringField(target.tagSlugs, part.tagSlugs),
		costTiers: mergeStringField(target.costTiers, part.costTiers),
		dofollow: mergeStringField(target.dofollow, part.dofollow),
		approvalMode: mergeStringField(target.approvalMode, part.approvalMode),
		opportunityTypeSlugs: mergeStringField(target.opportunityTypeSlugs, part.opportunityTypeSlugs)
	};
}

export function buildPublishedQueryFromTagSlugs(
	tagSlugs: string[]
): { ok: true; query: BuildBacklinksPublishedTagQuery } | { ok: false; unknownSlugs: string[] } {
	const unknownSlugs: string[] = [];
	let query: BuildBacklinksPublishedTagQuery = {};

	for (const raw of tagSlugs) {
		const resolved = resolveBuildBacklinksTagSlug(raw);
		if (resolved.kind === 'unknown') {
			unknownSlugs.push(resolved.slug);
			continue;
		}
		if (resolved.kind === 'editorial') {
			query = mergePublishedTagQuery(query, { tagSlugs: [resolved.slug] });
			continue;
		}
		query = mergePublishedTagQuery(query, resolved.tag.toPublishedQuery());
	}

	if (unknownSlugs.length > 0) {
		return { ok: false, unknownSlugs };
	}
	return { ok: true, query };
}

export function mergePublishedSiteFilterArrays<T extends string>(
	primary: T[] | undefined,
	secondary: T[] | undefined
): T[] | undefined {
	return mergeStringField(primary, secondary);
}
