import { describe, expect, it } from 'vitest';

import { publicAgentByPagePresenter } from '$lib/area-public';
import {
	PUBLIC_AGENT_CHANNEL_HOST_SLUGS,
	getPublicAgentChannelBySlug
} from '$lib/content/constants/agents/channels';
import { getAvailablePublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { MCP_LANDING_SEEDS } from '$lib/content/constants/mcps/seeds';
import { PUBLIC_AGENT_CHANNEL_HUB_CHANNELS } from '$lib/content/constants/channels/catalog/agentChannelHubSeeds';

import { listPrerenderableAgentChannelParams } from '$lib/seo/prerender/listPrerenderableAgentChannelParams';

describe('listPrerenderableAgentChannelParams', () => {
	const entries = listPrerenderableAgentChannelParams();

	it('returns a non-empty list within a reasonable upper bound', () => {
		const hostChannelCount = PUBLIC_AGENT_CHANNEL_HOST_SLUGS.length * PUBLIC_AGENT_CHANNEL_HUB_CHANNELS.length;
		const mcpChannelCount =
			MCP_LANDING_SEEDS.filter((seed) => getAvailablePublicMcpLandingBySlug(seed.slug)).length *
			PUBLIC_AGENT_CHANNEL_HUB_CHANNELS.length;
		expect(entries.length).toBeGreaterThan(0);
		expect(entries.length).toBeLessThanOrEqual(hostChannelCount + mcpChannelCount);
	});

	it('includes a known agent host smoke path', () => {
		expect(entries).toContainEqual({ slug: 'openclaw', channelSlug: 'facebook' });
	});

	it('includes an MCP client smoke path when cursor is available', () => {
		if (!getAvailablePublicMcpLandingBySlug('cursor')) return;
		expect(entries).toContainEqual({ slug: 'cursor', channelSlug: 'facebook' });
	});

	it('resolves every entry with getPublicAgentChannelBySlug and loadAgentChannelStateless', () => {
		for (const { slug, channelSlug } of entries) {
			expect(getPublicAgentChannelBySlug(slug, channelSlug), `${slug}/${channelSlug}`).toBeDefined();
			expect(
				publicAgentByPagePresenter.loadAgentChannelStateless(slug, channelSlug),
				`${slug}/${channelSlug}`
			).not.toBeNull();
		}
	});

	it('has no duplicate canonical paths', () => {
		const keys = entries.map(({ slug, channelSlug }) => `${slug}/${channelSlug}`);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('normalizes slugs to lowercase', () => {
		for (const { slug, channelSlug } of entries) {
			expect(slug).toBe(slug.toLowerCase());
			expect(channelSlug).toBe(channelSlug.toLowerCase());
		}
	});
});
