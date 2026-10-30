import {
	formatRedditCommunityInput,
	parseRedditCommunityInput,
	REDDIT_COMMUNITY_SLUG_MAX_LENGTH,
	redditCommunityValidationError,
	redditCommunitySlugValidationError,
	redditCommunitySlugOnly,
} from 'openquok-common';

/** @deprecated Prefer `REDDIT_COMMUNITY_SLUG_MAX_LENGTH` */
export const REDDIT_SUBREDDIT_MAX_LENGTH = REDDIT_COMMUNITY_SLUG_MAX_LENGTH;

/** Canonical `r/slug` or `u/slug` (bare slug → `r/slug`). */
export function normalizeSubredditInput(raw: string): string {
	return formatRedditCommunityInput(raw);
}

/**
 * Slug segment for the composited prefix field (strips `r/` / `u/`, slashes, extra path).
 * Use with a separate visual `r/` or `u/` prefix in the UI.
 */
export function subredditSlugForField(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return '';
	const canonical = normalizeSubredditInput(trimmed);
	if (canonical) {
		const parsed = parseRedditCommunityInput(canonical);
		if (parsed?.slug) return parsed.slug;
	}
	return redditCommunitySlugOnly(trimmed);
}

/** Canonical value + slug for ProviderSubredditInput after blur or paste. */
export function normalizeSubredditFieldInput(raw: string): { canonical: string; slug: string } {
	const canonical = normalizeSubredditInput(raw);
	const slug = canonical ? subredditSlugForField(canonical) : subredditSlugForField(raw);
	return { canonical, slug };
}

export function subredditSlugValidationError(normalizedSlug: string): string | null {
	return redditCommunitySlugValidationError(redditCommunitySlugOnly(normalizedSlug));
}

export function subredditInputValidationError(raw: string): string | null {
	return redditCommunityValidationError(raw);
}

export {
	formatRedditCommunityInput,
	redditCommunityValidationError,
	parseRedditCommunityInput,
} from 'openquok-common';
