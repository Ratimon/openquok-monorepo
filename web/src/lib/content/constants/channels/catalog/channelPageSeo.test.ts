import { describe, expect, it } from 'vitest';

import {
	buildPublicChannelAgentAudienceTailoredCard,
	buildPublicChannelAudienceSubtitle,
	buildPublicChannelAudienceTitle,
	sortChannelPageAgentIntegrations
} from '$lib/content/constants/channels/catalog/channelPageSeo';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';

describe('channelPageSeo', () => {
	it('builds WhoIsFor title and subtitle from the platform label', () => {
		expect(buildPublicChannelAudienceTitle('X')).toBe('Who schedules X with OpenQuok?');
		expect(buildPublicChannelAudienceSubtitle('X')).toBe('Built for X');
	});

	it('adds an xAI ecosystem fourth WhoIsFor card on /channels/x', () => {
		const page = getPublicChannelBySlug('x');
		expect(page?.audienceTitle).toBe('Who schedules X with OpenQuok?');
		expect(page?.audienceCards.length).toBeGreaterThanOrEqual(4);
		expect(page?.audienceCards.at(-1)?.title).toBe('Grok Bot & xAI cloud desktop');
		expect(page?.audienceCards[0]?.description).toContain('first-class for Grok Bot');
		expect(page?.faqItems[0]?.title).toBe('Which agent is first-class for X?');
	});

	it('sorts pinned agent hosts for channel integration grids', () => {
		const items = [
			{ slug: 'openclaw' },
			{ slug: 'grok-bot' },
			{ slug: 'dots' }
		];
		expect(sortChannelPageAgentIntegrations(items, 'x').map((item) => item.slug)).toEqual([
			'grok-bot',
			'openclaw',
			'dots'
		]);
	});

	it('buildPublicChannelAgentAudienceTailoredCard mentions MCP clients', () => {
		expect(buildPublicChannelAgentAudienceTailoredCard('Threads').description).toContain('MCP');
	});
});
