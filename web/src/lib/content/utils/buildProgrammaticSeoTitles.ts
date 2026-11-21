import type {
	ComparePairLayout,
	CompareProduct,
	CompareProductCategory,
	CompareProductSlug
} from '$lib/content/constants/competitors/types';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import { canonicalPeerComparePairKey } from '$lib/content/constants/competitors/utils/compareHubPairEmphasis';

/**
 * Repeatable title templates for programmatic SEO (head term + modifier).
 * Keep patterns consistent so crawlers and LLMs recognize the same structure at scale.
 *
 * Tool pages follow a PostPeer-style split:
 * - `metaTitle` → SERP `<title>` (keyword-rich, often ends with "— No Sign Up")
 * - `heroTitle` → on-page `<h1>` (reader-facing, usually starts with "Free")
 */

const FREE_TOOL_NO_SIGN_UP_SUFFIX = '— No Sign Up';

export function buildToolsHubMetaTitle(): string {
	return `Free Social Media Tools ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildToolsHubHeroTitle(): string {
	return 'Free social media tools';
}

export function buildToolsHubMetaDescription(): string {
	return 'Free browser tools for humanizing AI posts, editing channel visuals, building agent skills, testing posting times, and copying API payloads. No sign up required.';
}

export function buildAgentChannelMetaTitle(platformLabel: string, agentLabel: string): string {
	return `Schedule ${platformLabel} with ${agentLabel}`;
}

export function buildMcpChannelMetaTitle(platformLabel: string, clientLabel: string): string {
	return `Connect ${clientLabel} to ${platformLabel} for Social Scheduling`;
}

export function buildPhotoEditorGenericMetaTitle(): string {
	return `Free Social Media Photo Editor ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildPhotoEditorGenericHeroTitle(): string {
	return 'Free social media photo editor';
}

export function buildPhotoEditorGenericMetaDescription(): string {
	return 'Free photo editor in your browser. Resize images for social channels, add text and elements, and download PNG — no sign up required.';
}

export function buildPhotoEditorChannelMetaTitle(platformLabel: string): string {
	return `Free ${platformLabel} Photo Editor ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildPhotoEditorChannelHeroTitle(platformLabel: string): string {
	return `Free ${platformLabel} photo editor`;
}

export function buildSkillBuilderGenericMetaTitle(): string {
	return `Free Social Media Skill Builder ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildSkillBuilderGenericHeroTitle(): string {
	return 'Free social media skill builder';
}

export function buildSkillBuilderGenericMetaDescription(): string {
	return 'Build agent skills from OpenQuok CLI commands and MCP tools. Preview workflows and export SKILL.md for your workspace — free in your browser, no sign up required.';
}

export function buildSkillBuilderChannelMetaTitle(platformLabel: string): string {
	return `Free ${platformLabel} Skill Builder ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildSkillBuilderChannelHeroTitle(platformLabel: string): string {
	return `Free ${platformLabel} skill builder`;
}

export function buildBestTimeToPostGenericMetaTitle(): string {
	return `Free Best Time to Post Calculator ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildBestTimeToPostGenericHeroTitle(): string {
	return 'Free best time to post calculator';
}

export function buildBestTimeToPostGenericMetaDescription(): string {
	return 'Generate benchmark timing test slots for social channels in your browser. Pick a platform, timezone, and cadence — then schedule controlled tests in OpenQuok. No sign up required.';
}

export function buildBestTimeToPostChannelMetaTitle(platformLabel: string): string {
	return `Free Best Time to Post on ${platformLabel} ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

export function buildBestTimeToPostChannelHeroTitle(platformLabel: string): string {
	return `Free ${platformLabel} best time to post calculator`;
}

export function buildHumanizeGenericMetaTitle(): string {
	return `Free AI Humanizer for Social Posts ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

/** On-page H1 — natural reader headline; SERP title uses {@link buildHumanizeGenericMetaTitle}. */
export function buildHumanizeGenericHeroTitle(): string {
	return 'Free AI humanizer';
}

export function buildHumanizeGenericMetaDescription(): string {
	return 'Free AI humanizer in your browser — no sign up. Rewrite AI-written social posts so they sound natural. Copy stays free; schedule when you connect channels.';
}

export function buildHumanizeChannelMetaTitle(platformLabel: string): string {
	return `Free ${platformLabel} AI Humanizer ${FREE_TOOL_NO_SIGN_UP_SUFFIX}`;
}

/** On-page H1 for `/tools/humanizer/{slug}`; SERP title uses {@link buildHumanizeChannelMetaTitle}. */
export function buildHumanizeChannelHeroTitle(platformLabel: string): string {
	return `Free ${platformLabel} AI humanizer`;
}

export function buildHumanizeChannelMetaDescription(platformLabel: string): string {
	return `Free AI humanizer for ${platformLabel} posts in your browser — no sign up. Rewrite AI drafts before you paste or schedule from your workspace.`;
}

export function buildPayloadWizardGenericMetaTitle(): string {
	return `Free API Payload Wizard — Copy POST /public/posts JSON`;
}

/** On-page H1 — natural reader headline; SERP title uses {@link buildPayloadWizardGenericMetaTitle}. */
export function buildPayloadWizardGenericHeroTitle(): string {
	return 'Free API payload wizard';
}

export function buildPayloadWizardGenericMetaDescription(): string {
	return 'Free Payload Wizard with sample channels in your browser. Compose a post, preview JSON for POST /api/v1/public/posts, and copy the payload — no sign up required.';
}

export function buildPayloadWizardChannelMetaTitle(platformLabel: string): string {
	return `Free ${platformLabel} Payload Wizard — Copy POST /public/posts JSON`;
}

/** On-page H1 for `/tools/payload-wizard/{slug}`; SERP title uses {@link buildPayloadWizardChannelMetaTitle}. */
export function buildPayloadWizardChannelHeroTitle(platformLabel: string): string {
	return `Free ${platformLabel} API payload wizard`;
}

export function buildPayloadWizardChannelMetaDescription(platformLabel: string): string {
	return `Compose a ${platformLabel} post with sample channels in your browser, preview JSON for POST /api/v1/public/posts, and copy the payload before you ship your integration. No sign up required.`;
}

export type PublicApiMarketingCapability = 'posting' | 'scheduling';

/** On-page H1 for `/social-media-posting-api` and `/social-media-scheduling-api` hub routes. */
export function buildPublicApiHubHeroTitle(capability: PublicApiMarketingCapability): string {
	return capability === 'posting' ? 'Social Media Posting API' : 'Social Media Scheduling API';
}

/** On-page H1 for `/social-media-{posting|scheduling}-api/{slug}` platform routes. */
export function buildPublicApiPlatformHeroTitle(
	platformLabel: string,
	capability: PublicApiMarketingCapability
): string {
	const verb = capability === 'posting' ? 'Posting' : 'Scheduling';
	return `${platformLabel} ${verb} API`;
}

export function buildComparePairMetaTitle(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePairLayout = 'social_matrix'
): string {
	if (layout === 'cross_product_line') {
		return `${left.name} vs ${right.name}: Scheduler vs Directory Service`;
	}

	if (layout === 'directory_long_form') {
		if (left.slug === COMPARE_HUB_BASE_SLUG) {
			return `${left.name} vs ${right.name}: Directory Launch Comparison`;
		}
		if (right.slug === COMPARE_HUB_BASE_SLUG) {
			return `${right.name} vs ${left.name}: Best ${left.name} Alternative`;
		}
		return `${left.name} vs ${right.name}: Directory Launch Comparison`;
	}

	if (left.slug === COMPARE_HUB_BASE_SLUG) {
		return `${left.name} vs ${right.name}: Social Media Scheduler Comparison`;
	}
	if (right.slug === COMPARE_HUB_BASE_SLUG) {
		return `${right.name} vs ${left.name}: Best ${left.name} Alternative`;
	}
	return `${left.name} vs ${right.name}: Social Media Scheduler Comparison`;
}

export function buildCompareHubMetaTitle(baseProductName: string, isOpenQuokHub: boolean): string {
	if (isOpenQuokHub) {
		return `Compare Social Media Schedulers: ${baseProductName} vs Alternatives`;
	}
	return `Best ${baseProductName} Alternatives`;
}

/** GSC Track A slugs: query-shaped title suffixes (see docs/seo/research/2026-11-21-gsc-scheduler-hub.md). */
const ALTERNATIVES_DETAIL_TRACK_A_TITLE_HOOK: Partial<
	Record<CompareProductSlug, string>
> = {
	buffer: 'Free & Self-Hosted',
	later: 'Free Trials & Pricing',
	socialync: 'Free Trial & MCP'
};

const ALTERNATIVES_DETAIL_TRACK_A_SNIPPET_SLUGS = new Set<CompareProductSlug>([
	'buffer',
	'later',
	'socialync'
]);

/** SERP `<title>` for `/alternatives/{slug}` — keep near ~60 characters before `| OpenQuok` from `createMetaData`. */
export function buildAlternativesDetailMetaTitle(
	targetName: string,
	category: CompareProductCategory = 'social_scheduling',
	targetSlug?: CompareProductSlug
): string {
	if (category === 'directory_submission') {
		return `${targetName} Alternatives (2026): Directory Launch`;
	}
	const titleHook = targetSlug ? ALTERNATIVES_DETAIL_TRACK_A_TITLE_HOOK[targetSlug] : undefined;
	if (titleHook) {
		return `${targetName} Alternatives (2026): ${titleHook}`;
	}
	return `${targetName} Alternatives (2026): Ranked Schedulers`;
}

function formatAlternativesPeerNameList(peerNames: readonly string[]): string {
	const names = peerNames.filter(Boolean).slice(0, 4);
	if (names.length === 0) return '';
	if (names.length === 1) return names[0]!;
	if (names.length === 2) return `${names[0]} and ${names[1]}`;
	if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]}`;
	return `${names[0]}, ${names[1]}, ${names[2]}, and ${names[3]}`;
}

/** Meta description for alternatives detail — Track A leads with query echo + trial; default leads with trial hook. */
export function buildAlternativesDetailMetaDescription(
	targetName: string,
	peerNames: readonly string[],
	targetSlug?: CompareProductSlug
): string {
	const peers = formatAlternativesPeerNameList(peerNames);
	const hook =
		'Start a 7-day free trial, self-host at $0, or schedule with MCP and the Public API on OpenQuok.';
	const isTrackASnippet =
		targetSlug != null && ALTERNATIVES_DETAIL_TRACK_A_SNIPPET_SLUGS.has(targetSlug);

	if (isTrackASnippet) {
		const lead = `Compare the best ${targetName} alternatives — ${hook}`;
		if (!peers) {
			return `${lead} See ranked prices, channels, and agent scheduling.`;
		}
		return `${lead} Top picks include ${peers}. See prices, channels, and agent tools.`;
	}

	if (!peers) {
		return `${hook} Compare ranked ${targetName} alternatives with prices, channels, and agent tools.`;
	}
	return `${hook} Compare the best ${targetName} alternatives: ${peers}. See ranked prices, channels, and agent scheduling.`;
}

/** People-also-ask style headline for the first tailored alternatives FAQ row. */
export function buildAlternativesSwitchFaqTitle(targetName: string): string {
	return `What are the best ${targetName} alternatives?`;
}

export type SchedulingCommercialChannelMetaInput = {
	platformLabel: string;
	/** Short connect path — e.g. app-password or OAuth wording. */
	connectClause: string;
	/** Accurate limits and features for the second sentence. */
	featureClause: string;
	/** When true, title leads with free trial for commercial trial-intent queries. */
	leadTitleWithTrial?: boolean;
};

/** SERP title for channel pages that target “schedule {platform}” and trial queries. */
export function buildSchedulingCommercialChannelMetaTitle(
	platformLabel: string,
	leadTitleWithTrial = false
): string {
	if (leadTitleWithTrial) {
		return `${platformLabel} Scheduler Free Trial — Schedule and Queue Posts`;
	}
	return `Schedule ${platformLabel} Posts — Free Trial Social Scheduler`;
}

/** Meta description — trial and connect in the first sentence so the snippet stays on commercial intent. */
export function buildSchedulingCommercialChannelMetaDescription(
	input: SchedulingCommercialChannelMetaInput
): string {
	const { platformLabel, connectClause, featureClause } = input;
	return `Start a free trial and schedule ${platformLabel} posts with OpenQuok. ${connectClause} ${featureClause}`;
}

/**
 * GSC WS4: richer snippet leads for measured high-impression, low-CTR compare URLs.
 * Do not add winning peer pairs (e.g. mixpost/postiz) — hold their snippets.
 */
const COMPARE_PAIR_WS4_RICH_SNIPPET_LEAD: Partial<Record<string, string>> = {
	'openquok/postiz':
		'OpenQuok vs Postiz: prices from $0 self-host or a 7-day free trial. OpenQuok adds human approval, agent hosts, and directory launch. Postiz packs 30+ networks and OSS self-host.',
	'buffer/recurpost':
		'RecurPost vs Buffer: list prices, free trials, and supported channels. RecurPost recycles evergreen content for agencies. Buffer bundles publish and analytics per channel.',
	'recurpost/typefully':
		'Typefully vs RecurPost: list prices, free trials, and supported channels. Typefully is writing-first for creators and teams. RecurPost recycles evergreen posts for agencies.'
};

function resolveComparePairWs4RichSnippetLead(left: CompareProduct, right: CompareProduct): string | undefined {
	const pairKey = canonicalPeerComparePairKey(left.slug, right.slug);
	return COMPARE_PAIR_WS4_RICH_SNIPPET_LEAD[pairKey];
}

function buildCompareMetaDescriptionClosing(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePairLayout
): string {
	if (layout === 'directory_long_form') {
		if (left.slug === COMPARE_HUB_BASE_SLUG) {
			return `See how ${left.name} gives you control over every directory listing instead of a one-time ${right.name} campaign.`;
		}
		if (right.slug === COMPARE_HUB_BASE_SLUG) {
			return `See how ${right.name} compares as a DIY alternative to ${left.name} for directory launch.`;
		}
		return 'See which directory path fits your launch.';
	}

	if (left.slug === COMPARE_HUB_BASE_SLUG) {
		return `See why teams use ${left.name} instead of ${right.name}. You get agent workflows and separate workspaces.`;
	}
	if (right.slug === COMPARE_HUB_BASE_SLUG) {
		return `See how ${right.name} compares as an alternative to ${left.name}. You can schedule posts and publish from agents.`;
	}
	return 'See which scheduler fits your work.';
}

/** Meta description for `/compare/{a}/{b}` — lead with prices, channels, and trial when OpenQuok is in the pair. */
export function buildComparePairMetaDescription(
	left: CompareProduct,
	right: CompareProduct,
	layout: ComparePairLayout
): string {
	if (layout === 'directory_long_form') {
		return `Compare ${left.name} and ${right.name} for startup directory launch — done-for-you vs DIY profiles, extension autofill, and submission tracking. ${buildCompareMetaDescriptionClosing(left, right, layout)}`;
	}

	if (layout === 'cross_product_line') {
		return `Compare ${left.name} and ${right.name} across product lines — social scheduling vs directory launch. See which job each tool covers, then open category compares for pricing and features.`;
	}

	const ws4RichLead = resolveComparePairWs4RichSnippetLead(left, right);
	if (ws4RichLead) {
		return `${ws4RichLead} See side-by-side pricing, channels, and features.`;
	}

	const hasOpenQuok = left.slug === COMPARE_HUB_BASE_SLUG || right.slug === COMPARE_HUB_BASE_SLUG;
	if (hasOpenQuok) {
		const openQuok = left.slug === COMPARE_HUB_BASE_SLUG ? left : right;
		const peer = left.slug === COMPARE_HUB_BASE_SLUG ? right : left;
		const lead = `${openQuok.name} vs ${peer.name}: prices, channels, free trial.`;
		const differentiators = `${openQuok.tagline}. ${peer.tagline}.`;
		return `${lead} ${differentiators} ${buildCompareMetaDescriptionClosing(left, right, layout)}`;
	}

	const lead = `${left.name} vs ${right.name}: prices, channels, and scheduling features.`;
	const differentiators = `${left.tagline}. ${right.tagline}.`;
	return `${lead} ${differentiators} See which scheduler fits your work.`;
}
