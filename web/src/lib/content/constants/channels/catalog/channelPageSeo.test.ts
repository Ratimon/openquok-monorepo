import { describe, expect, it } from 'vitest';

import {
	buildPublicChannelAgentAudienceTailoredCard,
	buildPublicChannelAudienceSubtitle,
	buildPublicChannelAudienceTitle,
	sortChannelPageAgentIntegrations
} from '$lib/content/constants/channels/catalog/channelPageSeo';
import {
	getPublicChannelBySlug,
	listPublicChannelsForHub,
	listPublicDirectoryChannelsForHub
} from '$lib/content/constants/channels';
import { PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS } from '$lib/content/constants/faq';

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
		expect(page?.faqItems[0]?.id).toBe('what-is-channel');
		expect(page?.faqItems[PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS.length]?.title).toBe(
			'Which agent is first-class for X?'
		);
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

	it('resolves directory channel slugs without social ecosystem merges', () => {
		const peerpush = getPublicChannelBySlug('peerpush');
		expect(peerpush?.channelKind).toBe('directory');
		expect(peerpush?.audienceTitle).toBe('Who launches on PeerPush with OpenQuok?');
		expect(peerpush?.audienceCards).toHaveLength(3);
		expect(peerpush?.processSection?.steps).toHaveLength(5);
		expect(peerpush?.featureSections.map((s) => s.bentoId)).toEqual([
			'directory-profile-cases',
			'directory-extension-autofill',
			'directory-track-status'
		]);
		expect(peerpush?.faqItems.some((item) => item.title.includes('Grok Bot'))).toBe(false);

		const socialSlugs = new Set(listPublicChannelsForHub().map((c) => c.slug));
		expect(socialSlugs.has('peerpush')).toBe(false);
		expect(socialSlugs.has('uneed')).toBe(false);
		expect(listPublicDirectoryChannelsForHub().map((c) => c.slug)).toEqual(['peerpush', 'uneed']);
	});
});
