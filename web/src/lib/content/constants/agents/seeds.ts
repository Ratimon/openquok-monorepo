import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';

import {
	dotsAgent,
	grokBotAgent,
	hermesAgent,
	manusAgent,
	metaMuseAgent,
	openclawAgent,
	thinkrailAgent
} from '$lib/content/constants/agents/hosts';

/** Single registry for agent-host landings — order drives hub, nav, and footer columns. */
export const PUBLIC_AGENT_HOST_LANDING_PAGES: readonly PublicAgentHostLandingPageViewModel[] = [
	openclawAgent,
	hermesAgent,
	grokBotAgent,
	dotsAgent,
	metaMuseAgent,
	thinkrailAgent,
	manusAgent
];

export type PublicAgentHostFooterEntry = { slug: string; label: string };

/** Footer list derived from `PUBLIC_AGENT_HOST_LANDING_PAGES`. */
export function listPublicAgentHostSeedsForFooter(): PublicAgentHostFooterEntry[] {
	return PUBLIC_AGENT_HOST_LANDING_PAGES.map(({ slug, agentLabel }) => ({
		slug,
		label: agentLabel
	}));
}
