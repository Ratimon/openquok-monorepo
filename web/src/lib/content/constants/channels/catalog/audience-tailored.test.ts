import { describe, expect, it } from 'vitest';

import {
	getPublicChannelAudienceTailoredCard,
	resolvePublicChannelAudienceCards
} from '$lib/content/constants/channels/catalog/audience-tailored';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { icons } from '$data/icons';

const BASE_CARD: AudienceCard = {
	iconName: icons.CustomizedDrawnHouse.name,
	iconClass: 'text-rose-400',
	title: 'Base',
	description: 'Base persona.',
	containerClass: 'h-full min-h-[18rem]'
};

describe('publicChannelAudienceTailoredCards', () => {
	it('returns a fourth card for bluesky and linkedin slugs', () => {
		expect(getPublicChannelAudienceTailoredCard('bluesky')?.title).toBe(
			'Federated & custom-PDS users'
		);
		expect(getPublicChannelAudienceTailoredCard('linkedin')?.title).toBe(
			'B2B go-to-market teams'
		);
	});

	it('leaves three cards when no tailored entry exists', () => {
		const cards = resolvePublicChannelAudienceCards([BASE_CARD, BASE_CARD, BASE_CARD], 'tiktok');
		expect(cards).toHaveLength(3);
	});

	it('appends tailored card as the fourth entry', () => {
		const cards = resolvePublicChannelAudienceCards([BASE_CARD, BASE_CARD, BASE_CARD], 'bluesky');
		expect(cards).toHaveLength(4);
		expect(cards[3]?.title).toBe('Federated & custom-PDS users');
	});
});
