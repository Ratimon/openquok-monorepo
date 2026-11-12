import { publicAgentByPagePresenter } from '$lib/area-public';
import {
	PUBLIC_AGENT_CHANNEL_HOST_SLUGS,
	getPublicAgentChannelBySlug,
	listPublicAgentChannelsForHub
} from '$lib/content/constants/agents/channels';
import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';
import { getAvailablePublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { MCP_LANDING_SEEDS } from '$lib/content/constants/mcps/seeds';

export type AgentChannelPrerenderParams = {
	slug: string;
	channelSlug: string;
};

function pushIfPrerenderable(
	entries: AgentChannelPrerenderParams[],
	seen: Set<string>,
	agentSlug: string,
	channelSlug: string
): void {
	const slug = agentSlug.trim().toLowerCase();
	const channelKey = channelSlug.trim().toLowerCase();
	if (!slug || !channelKey) return;

	const pathKey = `${slug}/${channelKey}`;
	if (seen.has(pathKey)) return;

	if (!getPublicAgentChannelBySlug(slug, channelKey)) return;
	if (!publicAgentByPagePresenter.loadAgentChannelStateless(slug, channelKey)) return;

	seen.add(pathKey);
	entries.push({ slug, channelSlug: channelKey });
}

/** Agent host configs plus MCP client × hub channel pairs that resolve to public channel pages. */
export function listPrerenderableAgentChannelParams(): AgentChannelPrerenderParams[] {
	const entries: AgentChannelPrerenderParams[] = [];
	const seen = new Set<string>();

	for (const hostSlug of PUBLIC_AGENT_CHANNEL_HOST_SLUGS) {
		for (const link of listPublicAgentChannelsForHub(hostSlug)) {
			pushIfPrerenderable(entries, seen, hostSlug, link.slug);
		}
	}

	for (const seed of MCP_LANDING_SEEDS) {
		if (!getAvailablePublicMcpLandingBySlug(seed.slug)) continue;
		for (const channel of PUBLIC_AGENT_CHANNEL_HUB_CHANNELS) {
			pushIfPrerenderable(entries, seen, seed.slug, channel.slug);
		}
	}

	return entries;
}
