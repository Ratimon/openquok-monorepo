import type { PublicPricingProductLine } from '$lib/billing/constants/publicPricingProductLines';

/** URL segment under `/pricing` (empty string = hub). */
export type PublicPricingRouteId = 'all' | 'social-scheduler' | 'directory';

export type PublicPricingPageHeroCopy = {
	lead: string;
	highlight: string;
	gradient: string;
	description: string;
	subnote: string;
};

export type PublicPricingPageSeoDefinition = {
	routeId: PublicPricingRouteId;
	productLine: PublicPricingProductLine;
	/** Path segment after `/pricing` (omit for hub). */
	pathSegment: '' | 'social-scheduler' | 'directory';
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	breadcrumbLabel: string;
	hero: PublicPricingPageHeroCopy;
};

const ALL_HERO: PublicPricingPageHeroCopy = {
	lead: 'Find your',
	highlight: 'perfect plan',
	gradient: 'that match your needs',
	description:
		'Whether you are a solopreneur, a creator team, or AI practitioner using agent at a scale, we have options that scale with you.',
	subnote:
		'Every paid plan uses official platform APIs, plus Public API, MCP, and OAuth apps per workspace.'
};

const SOCIAL_SCHEDULER_HERO: PublicPricingPageHeroCopy = {
	lead: 'Pricing for your',
	highlight: 'social scheduler',
	gradient: 'on every paid tier',
	description:
		'Compare Solo, Team, Ultimate, and Max for multi-channel scheduling, calendars, post analytics, and agent workflows in one workspace.',
	subnote:
		'Every paid plan includes directory launch on the same workspace — switch to Auto Submit pricing to focus on directory features.'
};

const DIRECTORY_HERO: PublicPricingPageHeroCopy = {
	lead: 'Pricing for',
	highlight: 'directory launch',
	gradient: 'and auto-submit',
	description:
		'Business profiles, extension autofill, submission tracking, domain rating analytics, and competitor domains — on the same plans as social scheduling.',
	subnote:
		'Every paid plan includes social scheduling on the same workspace — switch to Social Scheduler pricing for channel and post limits.'
};

export const PUBLIC_PRICING_PAGE_SEO: Record<PublicPricingRouteId, PublicPricingPageSeoDefinition> = {
	all: {
		routeId: 'all',
		productLine: 'all',
		pathSegment: '',
		metaTitle: 'Pricing',
		metaDescription:
			'Compare OpenQuok plans for individuals, teams, and agencies. Start with a 7-day free trial — schedule social media posts across every connected channel.',
		keywords: [
			'social media scheduler',
			'social media scheduling tool',
			'social media scheduler free',
			'free social media scheduling tools',
			'schedule social media posts'
		],
		breadcrumbLabel: 'Pricing',
		hero: ALL_HERO
	},
	'social-scheduler': {
		routeId: 'social-scheduler',
		productLine: 'social',
		pathSegment: 'social-scheduler',
		metaTitle: 'Social Scheduler Pricing',
		metaDescription:
			'OpenQuok social scheduler pricing for Solo, Team, Ultimate, and Max. Official APIs, calendars, analytics, and agent integrations — 7-day free trial, no credit card to start.',
		keywords: [
			'social media scheduler pricing',
			'social media scheduling tool pricing',
			'schedule social media posts',
			'social media management pricing',
			'multi-channel social scheduler'
		],
		breadcrumbLabel: 'Social scheduler pricing',
		hero: SOCIAL_SCHEDULER_HERO
	},
	directory: {
		routeId: 'directory',
		productLine: 'directory',
		pathSegment: 'directory',
		metaTitle: 'Directory Launch Pricing',
		metaDescription:
			'Pricing for OpenQuok directory launch: business profiles, Chrome extension autofill, submission tracking, domain rating analytics, and competitor domains on paid plans.',
		keywords: [
			'directory submission tool pricing',
			'startup directory listing pricing',
			'domain rating analytics',
			'competitor domain tracking',
			'product directory launch'
		],
		breadcrumbLabel: 'Directory launch pricing',
		hero: DIRECTORY_HERO
	}
};

const PRICING_HUB_PATH = '/pricing';

export function publicPricingPathForRouteId(routeId: PublicPricingRouteId): string {
	const def = PUBLIC_PRICING_PAGE_SEO[routeId];
	if (!def.pathSegment) return PRICING_HUB_PATH;
	return `${PRICING_HUB_PATH}/${def.pathSegment}`;
}

export function publicPricingPathForProductLine(line: PublicPricingProductLine): string {
	if (line === 'social') return publicPricingPathForRouteId('social-scheduler');
	if (line === 'directory') return publicPricingPathForRouteId('directory');
	return publicPricingPathForRouteId('all');
}

export function publicPricingRouteIdFromPathname(pathname: string): PublicPricingRouteId | null {
	const normalized = pathname.replace(/\/+$/, '') || '/';
	if (normalized === PRICING_HUB_PATH) return 'all';
	if (normalized === `${PRICING_HUB_PATH}/social-scheduler`) return 'social-scheduler';
	if (normalized === `${PRICING_HUB_PATH}/directory`) return 'directory';
	return null;
}

export function publicPricingProductLineFromPathname(pathname: string): PublicPricingProductLine {
	const routeId = publicPricingRouteIdFromPathname(pathname);
	if (!routeId) return 'all';
	return PUBLIC_PRICING_PAGE_SEO[routeId].productLine;
}

export function publicPricingPageSeoForRouteId(routeId: PublicPricingRouteId): PublicPricingPageSeoDefinition {
	return PUBLIC_PRICING_PAGE_SEO[routeId];
}

/** Legacy `?line=` values → canonical pricing paths. */
export function publicPricingRedirectPathForLineQuery(
	line: string | null | undefined
): string | null {
	if (line === 'social') return publicPricingPathForRouteId('social-scheduler');
	if (line === 'directory') return publicPricingPathForRouteId('directory');
	return null;
}
