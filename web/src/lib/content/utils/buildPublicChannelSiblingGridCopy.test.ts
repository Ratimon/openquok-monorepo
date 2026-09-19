import { describe, expect, it } from 'vitest';

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
			'Start with TikTok, then schedule every other network from the same workspace.'
		);
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
			'Every Supported Platform for Grok Bot'
		);
		expect(buildPublicAgentChannelSiblingGridHubDescription()).toBe(
			'Choose a channel for platform-specific workflows, examples, and FAQs.'
		);
		expect(buildPublicAgentChannelSiblingGridDescription('Facebook', 'Grok Bot')).toBe(
			'Start with Facebook, then schedule every other network from Grok Bot.'
		);
		expect(buildPublicAgentChannelSiblingGridCardDescription('Facebook', 'Grok Bot', true)).toBe(
			'Schedule Facebook from Grok Bot.'
		);
	});
});
