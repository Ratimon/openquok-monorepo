import {
	SOCIAL_PROFILE_LINKS,
	getSocialProfileHref
} from '$lib/config/constants/config';

/**
 * Host suffixes that always pass link equity (first-party product / package hosts).
 * Do **not** put `github.com` here — only {@link FIRST_PARTY_GITHUB_OWNERS} repos follow.
 */
const FOLLOWABLE_HOST_SUFFIXES = ['openquok.com', 'npmjs.com'];

/**
 * GitHub owners treated as first-party for SEO (`trusted` + `follow`).
 * Third-party listing repos stay `nofollow`.
 */
export const FIRST_PARTY_GITHUB_OWNERS = ['Ratimon'] as const;

export type ExternalLinkPolicy = {
	trusted: boolean;
	follow: boolean;
};

export type ExternalAnchorAttrs = {
	href: string;
	target: '_blank';
	rel: string | undefined;
	trusted: boolean;
	follow: boolean;
};

function hostnameOf(href: string): string | null {
	try {
		return new URL(href).hostname.replace(/^www\./, '').toLowerCase();
	} catch {
		return null;
	}
}

function normalizeHrefForCompare(href: string): string | null {
	try {
		const u = new URL(href.trim());
		u.hash = '';
		u.hostname = u.hostname.toLowerCase();
		if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
			u.pathname = u.pathname.slice(0, -1);
		}
		return u.toString();
	} catch {
		return null;
	}
}

/** Host-based allowlist (openquok.com, npmjs.com). */
export function isTrustedExternalHref(href: string): boolean {
	const host = hostnameOf(href);
	if (!host) return false;
	return FOLLOWABLE_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

/** Exact match against configured `SOCIAL_LINKS_*` profile URLs. */
export function isConfiguredBrandSocialHref(href: string): boolean {
	const target = normalizeHrefForCompare(href);
	if (!target) return false;
	for (const link of SOCIAL_PROFILE_LINKS) {
		const configured = getSocialProfileHref(link.CHANNEL_ID);
		if (!configured) continue;
		const normalized = normalizeHrefForCompare(configured);
		if (normalized && normalized === target) return true;
	}
	return false;
}

/** `github.com/<owner>/…` for {@link FIRST_PARTY_GITHUB_OWNERS}. */
export function isFirstPartyGithubHref(href: string): boolean {
	try {
		const u = new URL(href);
		const host = u.hostname.replace(/^www\./, '').toLowerCase();
		if (host !== 'github.com') return false;
		const owner = u.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
		if (!owner) return false;
		return FIRST_PARTY_GITHUB_OWNERS.some((o) => o.toLowerCase() === owner);
	} catch {
		return false;
	}
}

/**
 * Brand social, first-party GitHub, and allowlisted product hosts → `trusted` + `follow`.
 * Everything else → ExternalLink defaults (`noopener noreferrer nofollow`).
 */
export function resolveExternalLinkPolicy(href: string): ExternalLinkPolicy {
	const follow =
		isTrustedExternalHref(href) ||
		isConfiguredBrandSocialHref(href) ||
		isFirstPartyGithubHref(href);
	return { trusted: follow, follow };
}

/** Mirrors ExternalLink.svelte rel attribute rules. */
export function buildExternalLinkRel(options: { trusted?: boolean; follow?: boolean }): string | undefined {
	const relValues: string[] = [];
	if (!options.trusted) relValues.push('noopener', 'noreferrer');
	if (!options.follow) relValues.push('nofollow');
	return relValues.length > 0 ? relValues.join(' ') : undefined;
}

export function externalLinkRelForHref(href: string): string | undefined {
	const policy = resolveExternalLinkPolicy(href);
	return buildExternalLinkRel(policy);
}

/** Anchor attrs for absolute external URLs (target + policy-derived rel). */
export function externalLinkAnchorAttrs(href: string): ExternalAnchorAttrs {
	const policy = resolveExternalLinkPolicy(href);
	return {
		href,
		target: '_blank',
		rel: buildExternalLinkRel(policy),
		trusted: policy.trusted,
		follow: policy.follow
	};
}

/** Absolute http(s) URL (not a relative path). */
export function isAbsoluteHttpHref(href: string): boolean {
	return /^https?:\/\//i.test(href.trim());
}
