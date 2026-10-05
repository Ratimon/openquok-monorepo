import { describe, expect, it } from 'vitest';

import {
	buildAgentHostEcosystemChannelSiblingGridHubDescription,
	buildAgentHostEcosystemChannelSiblingGridHubTitle
} from '$lib/content/constants/agents/ecosystems';
import {
	buildPublicAgentChannelSiblingGridCardDescription,
	buildPublicAgentChannelSiblingGridDescription,
	buildPublicAgentChannelSiblingGridHubDescription,
	buildPublicAgentChannelSiblingGridHubTitle,
	buildPublicAgentChannelSiblingGridTitle,
	buildPublicChannelSiblingGridCardDescription,
	buildPublicChannelSiblingGridDescription,
	buildPublicChannelSiblingGridTitle
} from '$lib/content/utils/buildPublicChannelSiblingGridCopy';

describe('buildPublicChannelSiblingGridCopy', () => {
	it('builds platform-specific section title and description', () => {
		expect(buildPublicChannelSiblingGridTitle('TikTok')).toBe(
			'Beyond TikTok: Every Supported Platform'
		);
		expect(buildPublicChannelSiblingGridDescription('TikTok')).toBe(
			'Start with TikTok, then add Instagram, Threads, and every other supported network from one workspace. Schedule each network from the dashboard, public API, or an agent host.'
		);
		expect(buildPublicChannelSiblingGridDescription('X', 'x')).toContain('Grok Bot');
	});

	it('builds card descriptions for live and coming-soon channels', () => {
		expect(buildPublicChannelSiblingGridCardDescription('Instagram', true)).toBe(
			'Schedule Instagram posts from one workspace.'
		);
		expect(buildPublicChannelSiblingGridCardDescription('Pinterest', false)).toBe(
			'Preview the Pinterest scheduler — coming soon.'
		);
	});

	it('builds agent channel section and card copy', () => {
		expect(buildPublicAgentChannelSiblingGridTitle('Facebook', 'Grok Bot')).toBe(
			'Beyond Facebook: Every Supported Platform for Grok Bot'
		);
		expect(buildPublicAgentChannelSiblingGridHubTitle('Grok Bot')).toBe(
			'Grok Bot: Every Supported Channels'
		);
		expect(buildPublicAgentChannelSiblingGridHubDescription('Grok Bot')).toBe(
			'Pick a channel for Grok Bot workflows, CLI or MCP examples, and platform FAQs.'
		);
		expect(buildPublicAgentChannelSiblingGridDescription('Facebook', 'Grok Bot')).toBe(
			'Start with Facebook, then schedule every other network from Grok Bot.'
		);
		expect(buildPublicAgentChannelSiblingGridCardDescription('Facebook', 'Grok Bot', true)).toBe(
			'Schedule Facebook from Grok Bot.'
		);
	});

	describe('ecosystem-aware agent hub grid copy', () => {
		it('emphasizes Meta-owned networks for Meta Muse', () => {
			expect(
				buildAgentHostEcosystemChannelSiblingGridHubTitle('Meta Muse', 'meta-muse')
			).toContain('Meta channels first');
			expect(
				buildAgentHostEcosystemChannelSiblingGridHubDescription('Meta Muse', 'meta-muse')
			).toContain('Facebook, Instagram, and Threads');
		});

		it('emphasizes X for Grok Bot hub copy', () => {
			expect(buildAgentHostEcosystemChannelSiblingGridHubTitle('Grok Bot', 'grok-bot')).toContain(
				'X first'
			);
			expect(
				buildAgentHostEcosystemChannelSiblingGridHubDescription('Grok Bot', 'grok-bot')
			).toContain('Start with X');
		});

		it('falls back to default hub copy for hosts outside the ecosystem map', () => {
			expect(buildAgentHostEcosystemChannelSiblingGridHubTitle('Hermes', 'hermes')).toBe(
				buildPublicAgentChannelSiblingGridHubTitle('Hermes')
			);
			expect(
				buildAgentHostEcosystemChannelSiblingGridHubDescription('Hermes', 'hermes')
			).toBe(buildPublicAgentChannelSiblingGridHubDescription('Hermes'));
		});
	});
});
