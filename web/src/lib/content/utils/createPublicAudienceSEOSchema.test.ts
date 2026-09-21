import { describe, expect, it } from 'vitest';

import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import {
	buildSchemaOrgAudienceFromCards,
	createPublicAudienceSectionSEOSchema,
	resolveAudienceSchemaType,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';

const SAMPLE_CARDS: readonly AudienceCard[] = [
	{
		iconName: 'Sparkles',
		iconClass: 'text-emerald-400',
		title: 'Vibe coders',
		description: 'Connect your own channels. Complete OAuth yourself. Then publish with curl or MCP.',
		containerClass: 'h-full'
	},
	{
		iconName: 'Code',
		iconClass: 'text-lime-400',
		title: 'CLI and SDK users',
		description: 'Call POST /public/posts from a script. Plan caps still apply.',
		containerClass: 'h-full'
	},
	{
		iconName: 'Rocket',
		iconClass: 'text-rose-400',
		title: 'Agent operators',
		description: 'Point an MCP host at your workspace. Post only to accounts you authorized.',
		containerClass: 'h-full'
	}
];

describe('createPublicAudienceSEOSchema', () => {
	it('classifies business vs people audience types', () => {
		expect(resolveAudienceSchemaType('SaaS developers')).toBe('BusinessAudience');
		expect(resolveAudienceSchemaType('Startup teams')).toBe('BusinessAudience');
		expect(resolveAudienceSchemaType('Vibe coders')).toBe('PeopleAudience');
		expect(resolveAudienceSchemaType('CLI and SDK users')).toBe('PeopleAudience');
		expect(resolveAudienceSchemaType('Agent operators')).toBe('PeopleAudience');
	});

	it('builds Audience nodes with stable fragment ids', () => {
		const audience = buildSchemaOrgAudienceFromCards(
			SAMPLE_CARDS,
			'https://www.openquok.com/social-media-posting-api'
		);

		expect(audience).toHaveLength(3);
		expect(audience[0]).toMatchObject({
			'@type': 'PeopleAudience',
			'@id': 'https://www.openquok.com/social-media-posting-api#audience-vibe-coders',
			name: 'Vibe coders',
			audienceType: 'Vibe coders'
		});
	});

	it('emits ItemList section schema for WhoIsFor', () => {
		const node = createPublicAudienceSectionSEOSchema({
			pageUrl: 'https://www.openquok.com/social-media-posting-api',
			sectionTitle: 'Who builds with,the posting API?',
			sectionSubtitle: 'Built for people who connect their own channels',
			cards: SAMPLE_CARDS
		});

		expect(node).toMatchObject({
			'@type': 'ItemList',
			'@id': 'https://www.openquok.com/social-media-posting-api#audience',
			name: 'Who builds with the posting API?',
			description: 'Built for people who connect their own channels',
			numberOfItems: 3
		});
	});

	it('returns empty object when cards are missing', () => {
		expect(createPublicAudienceSectionSEOSchema({ pageUrl: 'https://example.com', cards: [] })).toEqual(
			{}
		);
	});

	it('merges audience onto SoftwareApplication nodes', () => {
		const software = withSchemaOrgAudience(
			{
				'@type': 'SoftwareApplication',
				'@id': 'https://www.openquok.com/social-media-posting-api/tiktok#software',
				name: 'TikTok Posting API'
			},
			{ cards: SAMPLE_CARDS },
			'https://www.openquok.com/social-media-posting-api/tiktok'
		);

		expect(software.audience).toHaveLength(3);
	});
});
