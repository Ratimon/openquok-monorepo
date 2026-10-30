/** Reddit community / profile name max length (reddit.com naming rules). */
export const REDDIT_COMMUNITY_SLUG_MAX_LENGTH = 21;

const SLUG_PATTERN = /^[A-Za-z0-9_]+$/;

export type RedditCommunityKind = 'subreddit' | 'user';

export type RedditCommunityTarget = {
	kind: RedditCommunityKind;
	slug: string;
};

/** Strip optional `r/` / `u/` prefix, trailing slashes, and extra path segments. */
export function redditCommunitySlugOnly(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return '';
	const withoutKind = trimmed.replace(/^(r|u)\//i, '');
	let slug = withoutKind.replace(/^\/+/, '').trim();
	slug = slug.replace(/\/+$/, '');
	const slashIdx = slug.indexOf('/');
	if (slashIdx >= 0) slug = slug.slice(0, slashIdx);
	return slug;
}

/** Parse user input into kind + slug; bare slugs default to subreddit (`r/`). */
export function parseRedditCommunityInput(raw: string): RedditCommunityTarget | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	const lower = trimmed.toLowerCase();
	let kind: RedditCommunityKind = 'subreddit';
	let rest = trimmed;

	if (lower.startsWith('u/')) {
		kind = 'user';
		rest = trimmed.slice(2);
	} else if (lower.startsWith('r/')) {
		kind = 'subreddit';
		rest = trimmed.slice(2);
	}

	const slug = redditCommunitySlugOnly(rest);
	if (!slug) return null;
	return { kind, slug };
}

/** Canonical stored form: `r/name` or `u/name` (empty string when blank). */
export function formatRedditCommunityInput(raw: string): string {
	const parsed = parseRedditCommunityInput(raw);
	if (!parsed) return '';
	const prefix = parsed.kind === 'user' ? 'u' : 'r';
	return `${prefix}/${parsed.slug}`;
}

export function redditCommunitySlugValidationError(slug: string): string | null {
	if (!slug) return null;
	if (slug.length > REDDIT_COMMUNITY_SLUG_MAX_LENGTH) {
		return `Names must be at most ${REDDIT_COMMUNITY_SLUG_MAX_LENGTH} characters`;
	}
	if (!SLUG_PATTERN.test(slug)) {
		return 'Enter a valid name (letters, numbers, and underscores only)';
	}
	return null;
}

export function redditCommunityValidationError(raw: string): string | null {
	const canonical = formatRedditCommunityInput(raw);
	if (!canonical) return null;
	const parsed = parseRedditCommunityInput(canonical);
	if (!parsed) return null;
	return redditCommunitySlugValidationError(parsed.slug);
}

/** Build reddit.com submit path (no origin), e.g. `/r/foo/submit` or `/user/bar/submit`. */
export function redditSubmitPathForCommunity(canonical: string): string | null {
	const formatted = formatRedditCommunityInput(canonical);
	const parsed = parseRedditCommunityInput(formatted);
	if (!parsed) return null;
	if (parsed.kind === 'user') {
		return `/user/${encodeURIComponent(parsed.slug)}/submit`;
	}
	return `/r/${encodeURIComponent(parsed.slug)}/submit`;
}
