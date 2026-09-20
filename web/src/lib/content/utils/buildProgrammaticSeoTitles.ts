import type { CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';

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

export function buildComparePairMetaTitle(left: CompareProduct, right: CompareProduct): string {
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
