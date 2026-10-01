import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_AGENT_HOST_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';

export * from '$lib/content/constants/agents/types';
export * from '$lib/content/constants/agents/general';
export { buildAgentHostLandingPage } from '$lib/content/constants/agents/buildAgentHostLandingPage';
export {
	AGENT_HOST_DECISION_SCENARIOS,
	buildAgentHostPickerFaqDescription,
	getAgentHostDecisionScenario,
	listAgentHostSlugsForScenario
} from '$lib/content/constants/agents/decision-scenarios';
export {
	AGENT_HOST_PROFILES,
	getAgentHostProfile,
	requireAgentHostProfile
} from '$lib/content/constants/agents/host-profiles';
export { mergeAgentLandingFaqItems } from '$lib/content/constants/agents/mergeAgentLandingFaqItems';
export { PUBLIC_AGENTS_HUB } from '$lib/content/constants/hubs/agents';
export {
	dotsAgent,
	grokBotAgent,
	hermesAgent,
	hermesAgentSeed,
	manusAgent,
	metaMuseAgent,
	openclawAgent,
	openclawAgentSeed,
	thinkrailAgent
} from '$lib/content/constants/agents/hosts';
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
		faqItems: appendPublicGeneralFaqItems(page.faqItems, PUBLIC_AGENT_HOST_FAQ_ITEM_IDS)
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
