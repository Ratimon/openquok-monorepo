import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';

import { grokBotAgent } from '$lib/content/constants/agents/grok-bot';
import { hermesAgent } from '$lib/content/constants/agents/hermes';
import { openclawAgent } from '$lib/content/constants/agents/openclaw';
import { thinkrailAgent } from '$lib/content/constants/agents/thinkrail';

/** Single registry for agent-host landings — order drives hub, nav, and footer columns. */
export const PUBLIC_AGENT_HOST_LANDING_PAGES: readonly PublicAgentHostLandingPageViewModel[] = [
	openclawAgent,
	hermesAgent,
	grokBotAgent,
	thinkrailAgent
];

export type PublicAgentHostFooterEntry = { slug: string; label: string };

/** Footer list derived from `PUBLIC_AGENT_HOST_LANDING_PAGES`. */
export function listPublicAgentHostSeedsForFooter(): PublicAgentHostFooterEntry[] {
	return PUBLIC_AGENT_HOST_LANDING_PAGES.map(({ slug, agentLabel }) => ({
		slug,
		label: agentLabel
	}));
}
