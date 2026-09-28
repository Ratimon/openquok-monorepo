import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';
import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';

export * from '$lib/content/constants/agents/types';
export * from '$lib/content/constants/agents/general';
export { PUBLIC_AGENTS_HUB } from '$lib/content/constants/agents/hub';
export { openclawAgent } from '$lib/content/constants/agents/hosts/openclaw';
export { hermesAgent } from '$lib/content/constants/agents/hosts/hermes';
export { grokBotAgent } from '$lib/content/constants/agents/hosts/grok-bot';
export { thinkrailAgent } from '$lib/content/constants/agents/hosts/thinkrail';
export {
	PUBLIC_AGENT_HOST_LANDING_PAGES,
	listPublicAgentHostSeedsForFooter
} from '$lib/content/constants/agents/seeds';

const agentHostBySlug = new Map(
	PUBLIC_AGENT_HOST_LANDING_PAGES.map((page) => [page.slug, page])
);

function withAgentHostGeneralFaqs(
	page: PublicAgentHostLandingPageViewModel
): PublicAgentHostLandingPageViewModel {
	return {
		...page,
		faqItems: appendPublicGeneralFaqItems(page.faqItems, PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS)
	};
}

export function getPublicAgentHostBySlug(slug: string): PublicAgentHostLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	const page = agentHostBySlug.get(key);
	return page ? withAgentHostGeneralFaqs(page) : undefined;
}

export function getAvailablePublicAgentHostBySlug(
	slug: string
): PublicAgentHostLandingPageViewModel | undefined {
	const page = getPublicAgentHostBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicAgentsForHub(): PublicAgentHostLandingPageViewModel[] {
	return [...PUBLIC_AGENT_HOST_LANDING_PAGES];
}

export function listAvailablePublicAgents(): PublicAgentHostLandingPageViewModel[] {
	return PUBLIC_AGENT_HOST_LANDING_PAGES.filter((page) => page.available);
}
