/** Facet browse tag URLs; not stored in `link_directory_tags`. */
export const BUILD_BACKLINKS_VIRTUAL_TAG_SLUGS = [
    "dofollow",
    "instant-approval",
    "paid-listing",
    "profile-link",
    "guest-post",
    "open-source",
] as const;

export type BuildBacklinksVirtualTagSlug = (typeof BUILD_BACKLINKS_VIRTUAL_TAG_SLUGS)[number];

/** Editorial slugs from the DB plus virtual facet slugs for `/build-backlinks/tags/*` sitemap entries. */
export function mergeBuildBacklinksSitemapTagSlugs(editorialTagSlugs: string[]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];

    for (const slug of [...editorialTagSlugs, ...BUILD_BACKLINKS_VIRTUAL_TAG_SLUGS]) {
        const trimmed = slug.trim();
        if (!trimmed || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        merged.push(trimmed);
    }

    return merged;
}
