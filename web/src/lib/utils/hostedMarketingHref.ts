import { getRootPathPublicAgents } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
import { getRootPathPublicCreators } from '$lib/area-public/constants/getRootPathPublicCreators';
import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { getRootPathPublicRoadmap } from '$lib/area-public/constants/getRootPathPublicRoadmap';
import { getRootPathPublicTools } from '$lib/area-public/constants/getRootPathPublicTools';
import { route, url } from '$lib/utils/path';

/** Canonical hosted marketing origin. Self-host instances backlink here. */
export const OPENQUOK_HOSTED_WEB_ORIGIN = 'https://www.openquok.com';

const EXTRA_HOSTED_MARKETING_SEGMENTS = ['pricing', 'about'] as const;

/** Normalized prefixes (`/docs`, `/blog`, …) for public marketing routes. */
export const HOSTED_MARKETING_PATH_PREFIXES: readonly string[] = [
	getRootPathPublicDocs(),
	getRootPathPublicBlog(),
	getRootPathPublicAgents(),
	getRootPathPublicChannels(),
	getRootPathPublicPlaybooks(),
	getRootPathPublicBuildingBlocks(),
	getRootPathPublicCreators(),
	getRootPathPublicCompare(),
	getRootPathPublicAlternatives(),
	getRootPathPublicTools(),
	getRootPathPublicRoadmap(),
	...EXTRA_HOSTED_MARKETING_SEGMENTS
].map((segment) => route(segment));

export type HostedMarketingHrefOptions = {
	/** Override Vite `import.meta.env.DEV` (unit tests). */
	isDev?: boolean;
};

export type HostedMarketingAnchorAttrs = {
	href: string;
	external: boolean;
	target?: '_blank';
	rel?: 'noopener';
};

function isAbsoluteHttpUrl(href: string): boolean {
	return href.startsWith('http://') || href.startsWith('https://');
}

function splitHref(href: string): { pathname: string; search: string; hash: string } {
	const trimmed = href.trim();
	if (isAbsoluteHttpUrl(trimmed)) {
		const parsed = new URL(trimmed);
		return { pathname: parsed.pathname || '/', search: parsed.search, hash: parsed.hash };
	}

	const hashIndex = trimmed.indexOf('#');
	const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : '';
	const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
	const searchIndex = withoutHash.indexOf('?');
	const search = searchIndex >= 0 ? withoutHash.slice(searchIndex) : '';
	const pathname = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash;
	return { pathname: route(pathname), search, hash };
}

function toRelativeHref(href: string): string {
	const { pathname, search, hash } = splitHref(href);
	return `${url(pathname)}${search}${hash}`;
}

function toHostedAbsoluteHref(href: string): string {
	const { pathname, search, hash } = splitHref(href);
	return `${OPENQUOK_HOSTED_WEB_ORIGIN}${pathname}${search}${hash}`;
}

function resolveIsDev(options?: HostedMarketingHrefOptions): boolean {
	return options?.isDev ?? import.meta.env.DEV;
}

/** True when `origin` is `openquok.com` or a subdomain (`www.openquok.com`, `app.openquok.com`). */
export function isOpenquokHostedOrigin(origin: string): boolean {
	try {
		const hostname = new URL(origin).hostname.replace(/\.$/, '').toLowerCase();
		return hostname === 'openquok.com' || hostname.endsWith('.openquok.com');
	} catch {
		return false;
	}
}

/** True when the path (or URL pathname) is a public marketing prefix, including nested routes. */
export function isHostedMarketingPath(path: string): boolean {
	if (!path.trim()) return false;
	try {
		const pathname = splitHref(path).pathname;
		return HOSTED_MARKETING_PATH_PREFIXES.some(
			(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
		);
	} catch {
		return false;
	}
}

function shouldKeepMarketingHrefRelative(
	currentOrigin: string,
	options?: HostedMarketingHrefOptions
): boolean {
	return resolveIsDev(options) || isOpenquokHostedOrigin(currentOrigin);
}

/**
 * Resolve a public marketing path for the current origin.
 * Hosted `*.openquok.com` and Vite DEV stay same-origin (`url` / `route`).
 * Any other origin becomes `https://www.openquok.com` + path.
 * Non-marketing paths are left as relative `url()` / `route()` results (absolute third-party URLs unchanged).
 */
export function hostedMarketingHref(
	path: string,
	currentOrigin: string,
	options?: HostedMarketingHrefOptions
): string {
	if (!isHostedMarketingPath(path)) {
		return isAbsoluteHttpUrl(path) ? path : toRelativeHref(path);
	}
	if (shouldKeepMarketingHrefRelative(currentOrigin, options)) {
		return toRelativeHref(path);
	}
	return toHostedAbsoluteHref(path);
}

/**
 * Anchor attributes for a marketing (or already-resolved) href.
 * External self-host backlinks use `target="_blank"` and `rel="noopener"` only
 * (no `nofollow` / `noreferrer`) so link equity and the referrer survive.
 */
export function hostedMarketingAnchorAttrs(
	path: string,
	currentOrigin: string,
	options?: HostedMarketingHrefOptions
): HostedMarketingAnchorAttrs {
	const href = hostedMarketingHref(path, currentOrigin, options);
	const isHostedBacklink =
		isHostedMarketingPath(path) &&
		isAbsoluteHttpUrl(href) &&
		!shouldKeepMarketingHrefRelative(currentOrigin, options);
	if (!isHostedBacklink) {
		return { href, external: false };
	}
	return { href, external: true, target: '_blank', rel: 'noopener' };
}
