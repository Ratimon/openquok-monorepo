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
