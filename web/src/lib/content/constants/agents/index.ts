import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import {
	buildAgentHostEcosystemFaqItems,
	resolveAgentHostAudienceCards
} from '$lib/content/constants/agents/ecosystems';
import type { PublicFaqItem } from '$lib/content/constants/faq';
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
export {
	AGENT_HOST_ECOSYSTEM_BY_SLUG,
	AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE,
	MCP_CLIENT_ECOSYSTEM_BY_SLUG,
	buildAgentHostEcosystemChannelSiblingGridHubDescription,
	buildAgentHostEcosystemChannelSiblingGridHubTitle,
	buildAgentChannelEcosystemFaqItems,
	buildAgentChannelEcosystemHeroDescription,
	buildAgentHostEcosystemFaqItems,
	buildMcpClientEcosystemFaqItems,
	getAgentHostEcosystem,
	getAgentHostEcosystemId,
	getMcpClientEcosystemId,
	isFirstClassChannelForHost,
	resolveAgentChannelAudienceCards,
	resolveAgentHostAudienceCards,
	resolveMcpClientAudienceCards,
	sortAgentChannelHubLinks,
	sortAgentIntegrationsForEcosystem,
	type AgentHostEcosystem,
	type AgentHostEcosystemId
} from '$lib/content/constants/agents/ecosystems';
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

function prependAgentHostEcosystemFaqItems(
	hostItems: readonly PublicFaqItem[],
	hostSlug: string
): PublicFaqItem[] {
	const hostTitles = new Set(hostItems.map((item) => item.title));
	const ecosystemItems = buildAgentHostEcosystemFaqItems(hostSlug).filter(
		(item) => !hostTitles.has(item.title)
	);
	return [...ecosystemItems, ...hostItems];
}

function withAgentHostEcosystem(
	page: PublicAgentHostLandingPageViewModel
): PublicAgentHostLandingPageViewModel {
	return {
		...page,
		audienceCards: resolveAgentHostAudienceCards(page.audienceCards, page.slug),
		faqItems: prependAgentHostEcosystemFaqItems(page.faqItems, page.slug)
	};
}

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
	return page ? withAgentHostGeneralFaqs(withAgentHostEcosystem(page)) : undefined;
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
