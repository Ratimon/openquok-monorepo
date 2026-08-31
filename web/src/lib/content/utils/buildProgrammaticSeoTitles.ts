import type { CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';

/**
 * Repeatable title templates for programmatic SEO (head term + modifier).
 * Keep patterns consistent so crawlers and LLMs recognize the same structure at scale.
 */

export function buildAgentChannelMetaTitle(platformLabel: string, agentLabel: string): string {
	return `Schedule ${platformLabel} with ${agentLabel}`;
}

export function buildMcpChannelMetaTitle(platformLabel: string, clientLabel: string): string {
	return `Connect ${clientLabel} to ${platformLabel} for Social Scheduling`;
}

export function buildPhotoEditorChannelMetaTitle(platformLabel: string): string {
	return `${platformLabel} Photo Editor for Social Media`;
}

export function buildSkillBuilderChannelMetaTitle(platformLabel: string): string {
	return `Build ${platformLabel} Social Media Skills`;
}

export function buildBestTimeToPostChannelMetaTitle(platformLabel: string): string {
	return `Best Time to Post on ${platformLabel}`;
}

export function buildHumanizeGenericMetaTitle(): string {
	return 'Free AI Humanizer for Social Posts — No Sign Up';
}

/** On-page H1 — natural reader headline; SERP title uses {@link buildHumanizeGenericMetaTitle}. */
export function buildHumanizeGenericHeroTitle(): string {
	return 'Rewrite AI social posts';
}

export function buildHumanizeGenericMetaDescription(): string {
	return 'Free AI humanizer with no sign up. Rewrite AI-written social posts,so they sound natural — copy stays free; schedule when you connect channels.';
}

export function buildHumanizeChannelMetaTitle(platformLabel: string): string {
	return `Free ${platformLabel} AI Humanizer — No Sign Up`;
}

/** On-page H1 for `/tools/humanizer/{slug}`; SERP title uses {@link buildHumanizeChannelMetaTitle}. */
export function buildHumanizeChannelHeroTitle(platformLabel: string): string {
	return `Humanize ${platformLabel} posts before you publish`;
}

export function buildHumanizeChannelMetaDescription(platformLabel: string): string {
	return `Free AI humanizer for ${platformLabel} posts — no sign up. Rewrite AI drafts in your browser before you paste or schedule from your workspace.`;
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
