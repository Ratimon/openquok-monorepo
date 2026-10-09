import { describe, expect, it } from 'vitest';

import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';
import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import { getPublicMcpLandingBySlug } from '$lib/content/constants/mcps';
import {
	AGENT_HOST_ECOSYSTEM_BY_SLUG,
	AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE,
	buildAgentHostEcosystemChannelSiblingGridHubDescription,
	buildAgentHostEcosystemChannelSiblingGridHubTitle,
	buildAgentHostEcosystemFaqItems,
	buildMcpClientEcosystemFaqItems,
	buildPublicChannelEcosystemAudienceTailoredCard,
	getAgentHostEcosystem,
	getAgentHostEcosystemId,
	getChannelPageEcosystemId,
	getMcpClientEcosystemId,
	isFirstClassChannelForHost,
	resolveAgentHostAudienceCards,
	resolveAgentChannelAudienceCards,
	resolveMcpChannelAudienceCards,
	resolveMcpClientAudienceCards,
	sortAgentChannelHubLinks,
	sortAgentIntegrationsForEcosystem
} from '$lib/content/constants/agents/ecosystems';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import type { PublicAgentChannelHubLinkViewModel } from '$lib/content/constants/agents/channels/types';
import { icons } from '$data/icons';

const BASE_AUDIENCE_CARD = {
	iconName: 'CustomizedDrawnRobot' as const,
	iconClass: 'text-emerald-400',
	title: 'Base',
	description: 'Base card.',
	containerClass: 'h-full min-h-[18rem]'
};

describe('AGENT_HOST_ECOSYSTEM_BY_SLUG', () => {
	it('maps known host slugs to three ecosystem profiles', () => {
		expect(AGENT_HOST_ECOSYSTEM_BY_SLUG.openclaw).toBe('openai-personal-agents');
		expect(AGENT_HOST_ECOSYSTEM_BY_SLUG.dots).toBe('openai-personal-agents');
		expect(AGENT_HOST_ECOSYSTEM_BY_SLUG['meta-muse']).toBe('meta-consumer');
		expect(AGENT_HOST_ECOSYSTEM_BY_SLUG['grok-bot']).toBe('xai-grok');
	});

	it('registers only hosts that exist in PUBLIC_AGENT_HOST_LANDING_PAGES', () => {
		const registeredSlugs = new Set(
			PUBLIC_AGENT_HOST_LANDING_PAGES.map((page) => page.slug)
		);
		for (const slug of Object.keys(AGENT_HOST_ECOSYSTEM_BY_SLUG)) {
			expect(registeredSlugs.has(slug), `unknown host slug in ecosystem map: ${slug}`).toBe(
				true
			);
		}
	});
});

describe('getAgentHostEcosystem', () => {
	it('returns meta first-class channels for Meta Muse', () => {
		const ecosystem = getAgentHostEcosystem('meta-muse');
		expect(ecosystem?.firstClassChannelSlugs).toEqual(['facebook', 'instagram', 'threads']);
	});

	it('returns OpenAI sibling pins for OpenClaw', () => {
		const ecosystem = getAgentHostEcosystem('openclaw');
		expect(ecosystem?.relatedAgentSlugs).toEqual(['dots', 'openclaw']);
		expect(ecosystem?.relatedMcpSlugs).toContain('chatgpt');
	});

	it('is undefined for hosts outside the ecosystem map', () => {
		expect(getAgentHostEcosystemId('hermes')).toBeUndefined();
	});
});

describe('sortAgentChannelHubLinks', () => {
	it('pins Meta first-class channels ahead of the catalog tail', () => {
		const links: PublicAgentChannelHubLinkViewModel[] = [
			{
				slug: 'tiktok',
				platformLabel: 'TikTok',
				icon: icons.TikTok.name,
				href: '/agents/meta-muse/tiktok',
				description: 'TikTok',
				available: true
			},
			{
				slug: 'threads',
				platformLabel: 'Threads',
				icon: icons.Threads.name,
				href: '/agents/meta-muse/threads',
				description: 'Threads',
				available: true
			},
			{
				slug: 'facebook',
				platformLabel: 'Facebook',
				icon: icons.FacebookGlyph.name,
				href: '/agents/meta-muse/facebook',
				description: 'Facebook',
				available: true
			}
		];

		const sorted = sortAgentChannelHubLinks(links, 'meta-muse');
		expect(sorted.map((link) => link.slug)).toEqual(['facebook', 'threads', 'tiktok']);
	});
});

describe('isFirstClassChannelForHost', () => {
	it('detects X for Grok Bot and Threads for Meta Muse', () => {
		expect(isFirstClassChannelForHost('grok-bot', 'x')).toBe(true);
		expect(isFirstClassChannelForHost('grok-bot', 'facebook')).toBe(false);
		expect(isFirstClassChannelForHost('meta-muse', 'threads')).toBe(true);
		expect(isFirstClassChannelForHost('grok-build', 'x')).toBe(true);
		expect(isFirstClassChannelForHost('muse-code', 'threads')).toBe(true);
	});
});

describe('sortAgentIntegrationsForEcosystem', () => {
	it('pins dots and openclaw for OpenAI personal agent hosts', () => {
		const items = [
			{ slug: 'hermes', title: 'Hermes' },
			{ slug: 'openclaw', title: 'OpenClaw' },
			{ slug: 'dots', title: 'Dots' }
		];
		const sorted = sortAgentIntegrationsForEcosystem(items, 'dots', 'agent-host');
		expect(sorted.map((item) => item.slug)).toEqual(['dots', 'openclaw', 'hermes']);
	});

	it('pins chatgpt MCP for openclaw ecosystem', () => {
		const items = [
			{ slug: 'cursor', title: 'Cursor' },
			{ slug: 'chatgpt', title: 'ChatGPT' }
		];
		const sorted = sortAgentIntegrationsForEcosystem(items, 'openclaw', 'mcp-client');
		expect(sorted[0]?.slug).toBe('chatgpt');
	});
});

describe('buildAgentHostEcosystemFaqItems', () => {
	it('includes Muse Code contrast and first-class channel links for Meta Muse', () => {
		const items = buildAgentHostEcosystemFaqItems('meta-muse');
		expect(items.length).toBeGreaterThanOrEqual(2);
		const titles = items.map((item) => item.title);
		expect(new Set(titles).size).toBe(titles.length);
		const html = items.map((item) => item.description).join(' ');
		expect(html).toContain(publicFaqHref.museCodeLanding);
		expect(html).toContain('/agents/meta-muse/threads');
	});

	it('does not add OpenAI ecosystem host FAQs (OpenClaw and Dots use host picker copy)', () => {
		expect(buildAgentHostEcosystemFaqItems('openclaw')).toHaveLength(0);
		expect(buildAgentHostEcosystemFaqItems('dots')).toHaveLength(0);
	});

	it('does not duplicate titles when merged with host seed FAQs', () => {
		const hostPage = PUBLIC_AGENT_HOST_LANDING_PAGES.find((page) => page.slug === 'openclaw');
		expect(hostPage).toBeDefined();
		const ecosystemItems = buildAgentHostEcosystemFaqItems('openclaw');
		const hostTitles = new Set(hostPage!.faqItems.map((item) => item.title));
		for (const item of ecosystemItems) {
			expect(hostTitles.has(item.title)).toBe(false);
		}
	});

	it('merges Meta Muse host without duplicate Muse Code FAQ titles', () => {
		const page = getPublicAgentHostBySlug('meta-muse');
		expect(page).toBeDefined();
		const titles = page!.faqItems.map((item) => item.title);
		expect(titles.filter((t) => /muse code/i.test(t))).toHaveLength(1);
		expect(titles).toContain('How is Meta Muse different from Muse Code?');
		expect(titles).not.toContain('Is Meta Muse the same as Muse Code?');
	});

	it('compares Grok Bot with Grok Build and Cursor', () => {
		const page = getPublicAgentHostBySlug('grok-bot');
		expect(page).toBeDefined();
		const titles = page!.faqItems.map((item) => item.title);
		expect(titles).toContain('How is Grok Bot different from Grok Build or Cursor?');
		expect(titles).not.toContain('How does Grok Bot relate to Grok Build or Cursor?');
		const compare = page!.faqItems.find(
			(item) => item.title === 'How is Grok Bot different from Grok Build or Cursor?'
		);
		expect(compare?.description).toContain(publicFaqHref.grokBuildLanding);
		expect(compare?.description).toContain(publicFaqHref.cursorLanding);
	});
});

describe('buildMcpClientEcosystemFaqItems', () => {
	it('mirrors Meta Muse contrast and first-class channels on Muse Code', () => {
		const items = buildMcpClientEcosystemFaqItems('muse-code');
		expect(items.map((item) => item.title)).toEqual([
			'How is Muse Code different from Meta Muse?',
			'Which channels are first-class for Muse Code?'
		]);
		const html = items.map((item) => item.description).join(' ');
		expect(html).toContain(publicFaqHref.metaMuseLanding);
		expect(html).toContain('/agents/muse-code/threads');
		const page = getPublicMcpLandingBySlug('muse-code');
		expect(page?.faqItems.map((item) => item.title)).toContain(
			'How is Muse Code different from Meta Muse?'
		);
	});

	it('compares Grok Build and Cursor with Grok Bot', () => {
		const grokBuild = getPublicMcpLandingBySlug('grok-build');
		const cursor = getPublicMcpLandingBySlug('cursor');
		expect(grokBuild?.faqItems.map((item) => item.title)).toContain(
			'How is Grok Build different from Grok Bot or Cursor?'
		);
		expect(grokBuild?.faqItems.map((item) => item.title)).toContain(
			'Which channel is first-class for Grok Build?'
		);
		expect(cursor?.faqItems.map((item) => item.title)).toContain(
			'How is Cursor different from Grok Bot or Grok Build?'
		);
		const grokBuildCompare = grokBuild?.faqItems.find(
			(item) => item.title === 'How is Grok Build different from Grok Bot or Cursor?'
		);
		expect(grokBuildCompare?.description).toContain(publicFaqHref.grokBotLanding);
		expect(grokBuildCompare?.description).toContain(publicFaqHref.cursorLanding);
		expect(cursor?.faqItems.find((item) => item.title.includes('Grok Bot'))?.description).toContain(
			publicFaqHref.grokBuildLanding
		);
	});
});

describe('resolveAgentHostAudienceCards', () => {
	it('appends a fourth card for ecosystem hosts only', () => {
		const withMeta = resolveAgentHostAudienceCards([BASE_AUDIENCE_CARD], 'meta-muse');
		expect(withMeta).toHaveLength(2);
		const without = resolveAgentHostAudienceCards([BASE_AUDIENCE_CARD], 'hermes');
		expect(without).toHaveLength(1);
	});
});

describe('resolveMcpChannelAudienceCards', () => {
	it('appends Grok Build X-home-network and first-class hook, not the /channels/x Grok Bot card', () => {
		const cards = resolveMcpChannelAudienceCards([BASE_AUDIENCE_CARD], 'grok-build', 'x', 'X');
		expect(cards.map((card) => card.title)).toEqual(['Base', 'X as your home network']);
		expect(cards[0]?.description).toContain('first-class for Grok Build');
		expect(cards.at(-1)?.description).toContain('terminal coding agent');
		expect(buildPublicChannelEcosystemAudienceTailoredCard('x', 'X')?.title).toBe(
			'Grok Bot & xAI cloud desktop'
		);
	});
});

describe('resolveAgentChannelAudienceCards', () => {
	it('uses Grok Bot X-home-network instead of the channel-page cloud-desktop card', () => {
		const cards = resolveAgentChannelAudienceCards([BASE_AUDIENCE_CARD], 'grok-bot', 'x', 'X');
		expect(cards.map((card) => card.title)).toEqual(['Base', 'X as your home network']);
		expect(cards[0]?.description).toContain('first-class for Grok Bot');
		expect(cards.at(-1)?.description).toContain('cloud computer');
	});
});

describe('resolveMcpClientAudienceCards', () => {
	it('appends X-home-network for Grok Build and Meta-owned for Muse Code', () => {
		expect(getMcpClientEcosystemId('grok-build')).toBe('xai-grok');
		expect(getMcpClientEcosystemId('muse-code')).toBe('meta-consumer');
		expect(resolveMcpClientAudienceCards([BASE_AUDIENCE_CARD], 'grok-build').at(-1)?.title).toBe(
			'X as your home network'
		);
		expect(resolveMcpClientAudienceCards([BASE_AUDIENCE_CARD], 'muse-code').at(-1)?.title).toBe(
			'Meta-owned channels first'
		);
		expect(resolveMcpClientAudienceCards([BASE_AUDIENCE_CARD], 'cursor')).toHaveLength(1);
	});

	it('lands Grok Build and Muse Code with four WhoIsFor cards', () => {
		expect(getPublicMcpLandingBySlug('grok-build')?.audienceCards).toHaveLength(4);
		expect(getPublicMcpLandingBySlug('grok-build')?.audienceCards.at(-1)?.title).toBe(
			'X as your home network'
		);
		expect(getPublicMcpLandingBySlug('muse-code')?.audienceCards).toHaveLength(4);
		expect(getPublicMcpLandingBySlug('muse-code')?.audienceCards.at(-1)?.title).toBe(
			'Meta-owned channels first'
		);
		expect(getPublicMcpLandingBySlug('cursor')?.audienceCards).toHaveLength(3);
	});
});

describe('ecosystem grid copy', () => {
	it('emphasizes Meta-owned networks on the hub title and description', () => {
		expect(buildAgentHostEcosystemChannelSiblingGridHubTitle('Meta Muse', 'meta-muse')).toContain(
			'Meta channels first'
		);
		expect(
			buildAgentHostEcosystemChannelSiblingGridHubDescription('Meta Muse', 'meta-muse')
		).toContain('Facebook, Instagram, and Threads');
	});

	it('emphasizes X on Grok Bot hub copy', () => {
		expect(buildAgentHostEcosystemChannelSiblingGridHubTitle('Grok Bot', 'grok-bot')).toContain(
			'X first'
		);
		expect(
			buildAgentHostEcosystemChannelSiblingGridHubDescription('Grok Bot', 'grok-bot')
		).toContain('Start with X');
	});
});

describe('AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE', () => {
	it('is a non-empty label for UI badges', () => {
		expect(AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE.length).toBeGreaterThan(0);
	});
});

describe('channel page ecosystem (/channels/{slug})', () => {
	it('maps X and Meta channels to ecosystem ids', () => {
		expect(getChannelPageEcosystemId('x')).toBe('xai-grok');
		expect(getChannelPageEcosystemId('facebook')).toBe('meta-consumer');
		expect(buildPublicChannelEcosystemAudienceTailoredCard('x', 'X')?.title).toContain(
			'Grok Bot'
		);
	});

	it('pins grok-build then cursor MCP for Grok Bot ecosystem', () => {
		const items = [
			{ slug: 'chatgpt', title: 'ChatGPT' },
			{ slug: 'cursor', title: 'Cursor' },
			{ slug: 'grok-build', title: 'Grok Build' }
		];
		expect(sortAgentIntegrationsForEcosystem(items, 'grok-bot', 'mcp-client').map((item) => item.slug)).toEqual(
			['grok-build', 'cursor', 'chatgpt']
		);
	});
});
