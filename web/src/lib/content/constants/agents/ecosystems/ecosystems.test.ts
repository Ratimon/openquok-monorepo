import { describe, expect, it } from 'vitest';

import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';
import { getPublicAgentHostBySlug } from '$lib/content/constants/agents';
import {
	AGENT_HOST_ECOSYSTEM_BY_SLUG,
	AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE,
	buildAgentHostEcosystemChannelSiblingGridHubDescription,
	buildAgentHostEcosystemChannelSiblingGridHubTitle,
	buildAgentHostEcosystemFaqItems,
	buildPublicChannelEcosystemAudienceTailoredCard,
	getAgentHostEcosystem,
	getAgentHostEcosystemId,
	getChannelPageEcosystemId,
	isFirstClassChannelForHost,
	resolveAgentHostAudienceCards,
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
});

describe('resolveAgentHostAudienceCards', () => {
	it('appends a fourth card for ecosystem hosts only', () => {
		const withMeta = resolveAgentHostAudienceCards([BASE_AUDIENCE_CARD], 'meta-muse');
		expect(withMeta).toHaveLength(2);
		const without = resolveAgentHostAudienceCards([BASE_AUDIENCE_CARD], 'hermes');
		expect(without).toHaveLength(1);
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

	it('pins cursor MCP for Grok Bot ecosystem', () => {
		const items = [
			{ slug: 'chatgpt', title: 'ChatGPT' },
			{ slug: 'cursor', title: 'Cursor' }
		];
		expect(sortAgentIntegrationsForEcosystem(items, 'grok-bot', 'mcp-client')[0]?.slug).toBe(
			'cursor'
		);
	});
});
