import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';

import { hermesAgent } from '$lib/content/constants/agents/hermes';
import { openclawAgent } from '$lib/content/constants/agents/openclaw';

export * from '$lib/content/constants/agents/types';
export * from '$lib/content/constants/agents/shared';
export { PUBLIC_AGENTS_HUB } from '$lib/content/constants/agents/hub';
export { openclawAgent } from '$lib/content/constants/agents/openclaw';
export { hermesAgent } from '$lib/content/constants/agents/hermes';

export const PUBLIC_AGENT_HOST_LANDING_PAGES: readonly PublicAgentHostLandingPageViewModel[] = [
	openclawAgent,
	hermesAgent
];

const agentHostBySlug = new Map(
	PUBLIC_AGENT_HOST_LANDING_PAGES.map((page) => [page.slug, page])
);

export function getPublicAgentHostBySlug(slug: string): PublicAgentHostLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	return agentHostBySlug.get(key);
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
