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
				providerIdentifiers: ['skool']
			}
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).toBeDefined();
		expect(description).not.toContain('analytics:platform');
		expect(description).not.toContain('pull platform and post analytics');
		expect(description).toContain('draft and schedule');
		expect(description).toContain('posts:create');
	});

	it('includes analytics on Bluesky agent channel config', () => {
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
		expect(description).toContain('analytics:platform');
		expect(blueskyConfig!.analyticsCliCommands).toContain('analytics:platform');
	});

	it('omits analytics marketing on Grok Bot × Skool', () => {
		const grokBot = getPublicAgentHostBySlug('grok-bot');
		const skoolChannel = getPublicChannelBySlug('skool');
		const skoolConfig = getPublicAgentChannelBySlug('grok-bot', 'skool');
		expect(grokBot).toBeDefined();
		expect(skoolChannel).toBeDefined();
		expect(skoolConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: grokBot!,
			channel: skoolChannel!,
			channelConfig: skoolConfig!
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).not.toContain('analytics:platform');
		expect(vm.featureSections.some((section) => section.subtitle === 'Scale what works')).toBe(
			false
		);
		expect(vm.featureSections.some((section) => section.bentoId === 'skool-follow-ups')).toBe(true);
	});

	it('omits analytics marketing on OpenClaw × Reddit and surfaces member handoff', () => {
		const openclaw = getPublicAgentHostBySlug('openclaw');
		const redditChannel = getPublicChannelBySlug('reddit');
		const redditConfig = getPublicAgentChannelBySlug('openclaw', 'reddit');
		expect(openclaw).toBeDefined();
		expect(redditChannel).toBeDefined();
		expect(redditConfig).toBeDefined();

		const vm = buildAgentChannelLandingVm({
			baseAgent: openclaw!,
			channel: redditChannel!,
			channelConfig: redditConfig!
		});

		const description = capabilitiesFaqDescription(vm.faqItems);
		expect(description).not.toContain('analytics:platform');
		expect(redditConfig!.analyticsCliCommands).toContain('AWAITING_MEMBER');
		expect(redditConfig!.analyticsCliCommands).not.toContain('analytics:platform');
		expect(vm.featureSections.some((section) => section.bentoId === 'reddit-member-handoff')).toBe(
			true
		);
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

	it('uses Reddit draft handoff hero and subreddit moderators card on /agents/antigravity-cli/reddit', () => {
		const baseMcp = getPublicMcpLandingBySlug('antigravity-cli');
		const redditChannel = getPublicChannelBySlug('reddit');
		const redditConfig = getPublicAgentChannelBySlug('antigravity-cli', 'reddit');
		expect(baseMcp).toBeDefined();
		expect(redditChannel).toBeDefined();
		expect(redditConfig).toBeDefined();

		const vm = buildMcpChannelLandingVm({
			baseMcp: baseMcp!,
			channel: redditChannel!,
			channelConfig: redditConfig!
		});

		expect(vm.heroTitle).toBe(
			'Draft in OpenQuok with Antigravity CLI\npost on reddit.com — lower ban risk'
		);
		expect(vm.heroDescription).toContain('you submit on reddit.com');
		expect(vm.heroDescription).toContain('No server auto-post');
		const titles = vm.audienceCards.map((card) => card.title);
		expect(titles).toContain('Subreddit moderators');
		expect(titles).toContain('Gemini-first in Google’s toolchain');
		const moderators = vm.audienceCards.find((card) => card.title === 'Subreddit moderators');
		expect(moderators?.description).toContain('Antigravity CLI');
		expect(moderators?.description).toContain('reddit.com');
	});

	it('uses directory launch workflow mock on peerpush, not social schedule preview', () => {
		const vm = buildClaudeCodePeerpushMcpVm();

		expect(vm.workflowSection.deviceMock).toBe('desktop');
		expect(vm.workflowSection.deviceMockContent).toBe('mcp-directory-launch-claude-code');
		expect(vm.workflowSection.title).toContain('PeerPush');
		expect(vm.workflowSection.deviceMockContent).not.toBe('mcp-workflow-claude-code');
	});
});

function buildClaudeCodePeerpushMcpVm() {
	const baseMcp = getPublicMcpLandingBySlug('claude-code');
	const peerpushChannel = getPublicChannelBySlug('peerpush');
	const peerpushConfig = getPublicAgentChannelBySlug('claude-code', 'peerpush');
	expect(baseMcp).toBeDefined();
	expect(peerpushChannel).toBeDefined();
	expect(peerpushConfig).toBeDefined();

	return buildMcpChannelLandingVm({
		baseMcp: baseMcp!,
		channel: peerpushChannel!,
		channelConfig: peerpushConfig!
	});
}

describe('buildMcpChannelLandingVm directory channels (claude-code × peerpush)', () => {
	it('uses directory hero and meta instead of social scheduling copy', () => {
		const vm = buildClaudeCodePeerpushMcpVm();

		expect(vm.heroTitle).toBe('Prepare PeerPush launch from Claude Code then you submit');
		expect(vm.heroDescription).toContain('peerpush');
		expect(vm.heroDescription).toContain('listing readiness');
		expect(vm.heroDescription).not.toMatch(/calendar|kanban|schedule.*posts/i);
		expect(vm.metaDescription).toMatch(/domain rating/i);
		expect(vm.metaDescription).not.toMatch(/calendar|kanban/i);
	});

	it('keeps MCP workflow subtitle and uses launch-prep description', () => {
		const vm = buildClaudeCodePeerpushMcpVm();

		expect(vm.workflowSection.subtitle).toBe('Prompt from your terminal');
		expect(vm.workflowSection.title).toBe('One prompt, PeerPush launch prep');
		expect(vm.workflowSection.description).toContain('listing summary');
		expect(vm.workflowSection.description).toContain('no calendar or kanban');
	});

	it('replaces viral-formats opportunities with directory playbooks copy', () => {
		const vm = buildClaudeCodePeerpushMcpVm();

		expect(vm.opportunitiesPreviewSection.title).toBe('PeerPush launch playbooks');
		expect(vm.opportunitiesPreviewSection.title).not.toMatch(/viral/i);
		expect(vm.opportunitiesPreviewSection.description).toContain('directory launch');
	});

	it('includes shared DR guarantee FAQ from the directory channel catalog', () => {
		const vm = buildClaudeCodePeerpushMcpVm();
		expect(
			vm.faqItems.some((item) =>
				/Do you guarantee a specific Domain Rating/i.test(item.title)
			)
		).toBe(true);
	});

	it('maps directory MCP FAQ without social analytics commands', () => {
		const vm = buildClaudeCodePeerpushMcpVm();
		const mcpCapabilitiesFaq = vm.faqItems.find((item) =>
			item.title.includes('OpenQuok MCP for PeerPush on Claude Code')
		);
		const launchFaq = vm.faqItems.find((item) =>
			item.title.includes('prepare PeerPush directory launches')
		);

		expect(mcpCapabilitiesFaq?.description).toContain('listing readiness');
		expect(mcpCapabilitiesFaq?.description).toContain('checkedAt');
		expect(mcpCapabilitiesFaq?.description).not.toContain('analytics:platform');
		expect(launchFaq?.description).toContain('directoryProfilesList');
		expect(launchFaq?.description).toContain('directoryVariantsEnsure');
		expect(launchFaq?.description).not.toMatch(/schedule.*posts|pull platform and post analytics/i);
	});

	it('uses directory-aware integrate step carousel copy', () => {
		const vm = buildClaudeCodePeerpushMcpVm();
		const integrateStep = vm.setupSteps.find((step) => step.animatedContent === 'agent-integrations');
		const skillIntegrateStep = vm.skillSetupSteps.find(
			(step) => step.animatedContent === 'agent-integrations'
		);

		expect(integrateStep?.content).toContain('openquok-directory-launch');
		expect(integrateStep?.content).toContain('PeerPush');
		expect(integrateStep?.animatedModels?.[0]?.description).toMatch(/directory launches|My Products/i);
		expect(integrateStep?.animatedModels?.[0]?.description).not.toContain('schedule approved posts');
		expect(skillIntegrateStep?.animatedModels?.[2]?.description).toContain('openquok-directory-launch');
	});

	it('does not expose social scale or impressions analytics feature rows', () => {
		const vm = buildClaudeCodePeerpushMcpVm();

		expect(vm.featureSections.some((section) => section.subtitle === 'Scale what works')).toBe(
			false
		);
		const analyticsRow = vm.featureSections.find(
			(section) => section.bentoId === 'directory-analytics'
		);
		expect(analyticsRow).toBeDefined();
		expect(analyticsRow?.description).not.toMatch(/winners|impressions/i);
	});
});
