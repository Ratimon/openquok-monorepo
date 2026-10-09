import { describe, expect, it } from 'vitest';

import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import { getPublicAgentChannelBySlug } from '$lib/content/constants/agents/channels';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { getPublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import { buildAgentChannelLandingVm } from '$lib/content/utils/buildAgentChannelLandingVm';
import { buildMcpChannelLandingVm } from '$lib/content/utils/buildMcpChannelLandingVm';

function capabilitiesFaqDescription(faqItems: { title: string; description: string }[]) {
	return faqItems.find((item) => item.title.startsWith('What can ') && item.title.includes(' with '))
		?.description;
}

describe('buildAgentChannelLandingVm analytics FAQ honesty', () => {
	const baseAgent = getPublicAgentHostBySlug('openclaw');
	const facebookChannel = getPublicChannelBySlug('facebook');
	const facebookConfig = getPublicAgentChannelBySlug('openclaw', 'facebook');

	it('mentions analytics:platform for analytics-capable channels', () => {
		expect(baseAgent).toBeDefined();
		expect(facebookChannel).toBeDefined();
		expect(facebookConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: facebookChannel!,
			channelConfig: facebookConfig!
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).toContain('analytics:platform');
		expect(description).toContain('pull platform and post analytics');
	});

	it('omits analytics claims when provider identifiers are not analytics-capable', () => {
		expect(baseAgent).toBeDefined();
		expect(facebookChannel).toBeDefined();
		expect(facebookConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: facebookChannel!,
			channelConfig: {
				...facebookConfig!,
				// Synthetic future channel — not on SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS
				providerIdentifiers: ['bluesky']
			}
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).toBeDefined();
		expect(description).not.toContain('analytics:platform');
		expect(description).not.toContain('pull platform and post analytics');
		expect(description).toContain('draft and schedule');
		expect(description).toContain('posts:create');
	});

	it('omits analytics on real Bluesky agent channel config', () => {
		expect(baseAgent).toBeDefined();
		const blueskyChannel = getPublicChannelBySlug('bluesky');
		const blueskyConfig = getPublicAgentChannelBySlug('openclaw', 'bluesky');
		expect(blueskyChannel).toBeDefined();
		expect(blueskyConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: blueskyChannel!,
			channelConfig: blueskyConfig!
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).not.toContain('analytics:platform');
		expect(blueskyConfig!.analyticsCliCommands).not.toContain('analytics:platform');
	});
});

describe('buildAgentChannelLandingVm channel FAQ merge', () => {
	it('appends Instagram channel FAQs including music licensing', () => {
		const baseAgent = getPublicAgentHostBySlug('openclaw');
		const instagramChannel = getPublicChannelBySlug('instagram');
		const instagramConfig = getPublicAgentChannelBySlug('openclaw', 'instagram');

		expect(baseAgent).toBeDefined();
		expect(instagramChannel).toBeDefined();
		expect(instagramConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: instagramChannel!,
			channelConfig: instagramConfig!
		});

		const musicFaq = vm.faqItems.find((item) =>
			item.title.includes('trending or copyrighted music')
		);
		expect(musicFaq).toBeDefined();
		expect(musicFaq!.description).toContain('Business and Standalone');
		expect(vm.faqItems.length).toBeGreaterThan(baseAgent!.faqItems.length);
	});
});

describe('buildAgentChannelLandingVm ecosystem hooks', () => {
	it('uses muse.ai hero copy for Meta Muse channel pages', () => {
		const baseAgent = getPublicAgentHostBySlug('meta-muse');
		const threadsChannel = getPublicChannelBySlug('threads');
		const threadsConfig = getPublicAgentChannelBySlug('meta-muse', 'threads');

		expect(baseAgent).toBeDefined();
		expect(threadsChannel).toBeDefined();
		expect(threadsConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: threadsChannel!,
			channelConfig: threadsConfig!
		});

		expect(vm.heroDescription).toContain('muse.ai');
		expect(vm.heroDescription).not.toContain('Telegram');
		expect(vm.heroDescription).toContain('Threads');
	});

	it('adds ecosystem audience card and first-class FAQ for Meta Muse + Threads', () => {
		const baseAgent = getPublicAgentHostBySlug('meta-muse');
		const threadsChannel = getPublicChannelBySlug('threads');
		const threadsConfig = getPublicAgentChannelBySlug('meta-muse', 'threads');

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: threadsChannel!,
			channelConfig: threadsConfig!
		});

		expect(vm.audienceCards.length).toBeGreaterThan(3);
		expect(vm.audienceCards.at(-1)?.title).toBe('Meta-owned channels first');
		expect(vm.audienceCards.map((card) => card.title)).not.toContain('Meta Muse first-class');
		expect(vm.audienceCards[0]?.description).toContain('first-class Meta Muse channel');

		const firstClassFaq = vm.faqItems.find((item) =>
			item.title.includes('first-class for Meta Muse')
		);
		expect(firstClassFaq).toBeDefined();
		expect(firstClassFaq!.description).toContain('/agents/meta-muse/threads');
	});

	it('keeps Telegram messaging hero for OpenClaw channel pages', () => {
		const baseAgent = getPublicAgentHostBySlug('openclaw');
		const facebookChannel = getPublicChannelBySlug('facebook');
		const facebookConfig = getPublicAgentChannelBySlug('openclaw', 'facebook');

		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: facebookChannel!,
			channelConfig: facebookConfig!
		});

		expect(vm.heroDescription).toContain('Telegram');
		expect(vm.heroDescription).toContain('WhatsApp');
	});

	it('does not duplicate Grok Bot cloud-desktop copy on Grok Bot × X', () => {
		const baseAgent = getPublicAgentHostBySlug('grok-bot');
		const xChannel = getPublicChannelBySlug('x');
		const xConfig = getPublicAgentChannelBySlug('grok-bot', 'x');
		const vm = buildAgentChannelLandingVm({
			baseAgent: baseAgent!,
			channel: xChannel!,
			channelConfig: xConfig!
		});
		const titles = vm.audienceCards.map((card) => card.title);
		expect(titles).toContain('X as your home network');
		expect(titles).not.toContain('Grok Bot & xAI cloud desktop');
		expect(vm.audienceCards.at(-1)?.description).toContain('cloud computer');
	});
});

describe('buildMcpChannelLandingVm audience cards', () => {
	it('uses Grok Build X-home-network on /agents/grok-build/x, not the /channels/x Grok Bot card', () => {
		const baseMcp = getPublicMcpLandingBySlug('grok-build');
		const xChannel = getPublicChannelBySlug('x');
		const xConfig = getPublicAgentChannelBySlug('grok-build', 'x');
		expect(baseMcp).toBeDefined();
		expect(xChannel).toBeDefined();
		expect(xConfig).toBeDefined();

		const vm = buildMcpChannelLandingVm({
			baseMcp: baseMcp!,
			channel: xChannel!,
			channelConfig: xConfig!
		});
		const titles = vm.audienceCards.map((card) => card.title);
		expect(titles).toContain('X as your home network');
		expect(titles).not.toContain('Grok Bot & xAI cloud desktop');
		expect(vm.audienceCards.at(-1)?.description).toContain('terminal coding agent');
		expect(vm.audienceCards[0]?.description).toContain('first-class for Grok Build');
		expect(xChannel!.audienceCards.at(-1)?.title).toBe('Grok Bot & xAI cloud desktop');
	});
});
