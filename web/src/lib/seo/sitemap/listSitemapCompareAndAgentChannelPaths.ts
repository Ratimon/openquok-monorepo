import {
	PUBLIC_AGENT_CHANNEL_HOST_SLUGS,
	getPublicAgentChannelBySlug,
	listPublicAgentChannelsForHub
} from '$lib/content/constants/agents/channels';
import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';
import {
	PUBLIC_COMPARE_PRODUCTS,
	canCompareProducts,
	getComparePair
} from '$lib/content/constants/competitors';
import type { CompareProductSlug } from '$lib/content/constants/competitors/types';
import { getAvailablePublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { MCP_LANDING_SEEDS } from '$lib/content/constants/mcps/seeds';

import {
	canonicalCompareDetailParamSlugs,
	type CompareDetailPrerenderParams
} from '../prerender/listPrerenderableCompareDetailParams';

export type SitemapProgrammaticSeoPaths = {
	compare: string[];
	agentChannel: string[];
};

function compareDetailPath(productA: CompareProductSlug, productB: CompareProductSlug): string {
	return `/compare/${encodeURIComponent(productA)}/${encodeURIComponent(productB)}`;
}

function agentChannelPath(slug: string, channelSlug: string): string {
	return `/agents/${encodeURIComponent(slug)}/${encodeURIComponent(channelSlug)}`;
}

/** Compare detail URLs that resolve via `getComparePair` (canonical slug order, no duplicate A/B). */
export function listSitemapCompareDetailParams(): CompareDetailPrerenderParams[] {
	const entries: CompareDetailPrerenderParams[] = [];
	const seen = new Set<string>();

	for (const left of PUBLIC_COMPARE_PRODUCTS) {
		for (const right of PUBLIC_COMPARE_PRODUCTS) {
			if (left.slug === right.slug || !canCompareProducts(left, right)) continue;

			const [productA, productB] = canonicalCompareDetailParamSlugs(left.slug, right.slug);
			const key = `${productA}/${productB}`;
			if (seen.has(key)) continue;

			if (!getComparePair(productA, productB)) continue;

			seen.add(key);
			entries.push({ productA, productB });
		}
	}

	return entries;
}

function pushAgentChannelIfResolvable(
	paths: string[],
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

	seen.add(pathKey);
	paths.push(agentChannelPath(slug, channelKey));
}

/** Agent × channel URLs that resolve via `getPublicAgentChannelBySlug`. */
export function listSitemapAgentChannelPaths(): string[] {
	const paths: string[] = [];
	const seen = new Set<string>();

	for (const hostSlug of PUBLIC_AGENT_CHANNEL_HOST_SLUGS) {
		for (const link of listPublicAgentChannelsForHub(hostSlug)) {
			pushAgentChannelIfResolvable(paths, seen, hostSlug, link.slug);
		}
	}

	for (const seed of MCP_LANDING_SEEDS) {
		if (!getAvailablePublicMcpLandingBySlug(seed.slug)) continue;
		for (const channel of PUBLIC_AGENT_CHANNEL_HUB_CHANNELS) {
			pushAgentChannelIfResolvable(paths, seen, seed.slug, channel.slug);
		}
	}

	return paths;
}

export function listSitemapCompareAndAgentChannelPaths(): SitemapProgrammaticSeoPaths {
	return {
		compare: listSitemapCompareDetailParams().map(({ productA, productB }) =>
			compareDetailPath(productA, productB)
		),
		agentChannel: listSitemapAgentChannelPaths()
	};
}
