import { describe, expect, it } from 'vitest';

import { getComparePair } from '$lib/content/constants/competitors';
import { getPublicAgentChannelBySlug } from '$lib/content/constants/agents/channels';

import {
	listSitemapAgentChannelPaths,
	listSitemapCompareAndAgentChannelPaths,
	listSitemapCompareDetailParams
} from './listSitemapCompareAndAgentChannelPaths';

describe('listSitemapCompareAndAgentChannelPaths', () => {
	const { compare, agentChannel } = listSitemapCompareAndAgentChannelPaths();

	it('includes a known live compare pair', () => {
		expect(compare).toContain('/compare/openquok/buffer');
	});

	it('does not emit cross-category or invalid compare pairs', () => {
		expect(compare).not.toContain('/compare/buffer/boringlaunch');
	});

	it('has no duplicate compare paths', () => {
		expect(new Set(compare).size).toBe(compare.length);
	});

	it('resolves every compare path with getComparePair', () => {
		for (const path of compare) {
			const match = /^\/compare\/([^/]+)\/([^/]+)$/.exec(path);
			expect(match, path).toBeTruthy();
			const productA = decodeURIComponent(match![1]);
			const productB = decodeURIComponent(match![2]);
			expect(getComparePair(productA, productB), path).not.toBeNull();
		}
	});

	it('canonical compare slugs match listSitemapCompareDetailParams', () => {
		const fromParams = listSitemapCompareDetailParams().map(
			({ productA, productB }) => `/compare/${productA}/${productB}`
		);
		expect([...compare].sort()).toEqual([...fromParams].sort());
	});

	it('includes a known agent × channel path', () => {
		expect(agentChannel.some((path) => path.startsWith('/agents/openclaw/'))).toBe(true);
	});

	it('has no duplicate agent-channel paths', () => {
		expect(new Set(agentChannel).size).toBe(agentChannel.length);
	});

	it('resolves every agent-channel path with getPublicAgentChannelBySlug', () => {
		for (const path of agentChannel) {
			const match = /^\/agents\/([^/]+)\/([^/]+)$/.exec(path);
			expect(match, path).toBeTruthy();
			const slug = decodeURIComponent(match![1]);
			const channelSlug = decodeURIComponent(match![2]);
			expect(getPublicAgentChannelBySlug(slug, channelSlug), path).toBeDefined();
		}
	});
});
