import { describe, expect, it } from 'vitest';

import { PUBLIC_AGENTS_HUB } from '$lib/content/constants/agents/hub';
import { PUBLIC_CHANNELS_HUB_FAQ } from '$lib/content/constants/publicChannelsHubFaqConfig';
import {
	PUBLIC_API_POSTING_HUB_FAQ,
	PUBLIC_API_SCHEDULING_HUB_FAQ
} from '$lib/content/constants/apis/publicApiCapabilityHubFaqConfig';
import { PUBLIC_COMPARE_HUB_FAQ } from '$lib/content/constants/publicCompareHubFaqConfig';
import { PUBLIC_CREATORS_HUB_FAQ } from '$lib/content/constants/publicCreatorsHubFaqConfig';
import {
	PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS,
	PUBLIC_API_POSTING_HUB_FAQ_ITEM_IDS,
	PUBLIC_API_SCHEDULING_HUB_FAQ_ITEM_IDS,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS,
	PUBLIC_COMPARE_HUB_FAQ_ITEM_IDS,
	PUBLIC_CREATORS_HUB_FAQ_ITEM_IDS,
	PUBLIC_LISTINGS_HUB_FAQ_ITEM_IDS,
	PUBLIC_ROADMAP_HUB_FAQ_ITEM_IDS,
	PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';
import { PUBLIC_ROADMAP_HUB_FAQ } from '$lib/content/constants/publicRoadmapHubFaqConfig';
import { PUBLIC_TOOLS_HUB_FAQ } from '$lib/content/constants/publicToolsHubFaqConfig';
import {
	PUBLIC_BUILDING_BLOCKS_HUB,
	PUBLIC_PLAYBOOKS_HUB
} from '$lib/listings/constants/publicListingsHubConfig';
import {
	assertNoNofollowOnFirstPartyFaqLinks,
	assertSelfHostLabelsOnSocialIntegrationLinks
} from '$lib/content/utils/publicFaqFunnel.test-utils';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

const HUB_FAQ_SECTIONS = [
	{ name: '/agents hub', section: PUBLIC_AGENTS_HUB.faqSection, ids: PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS },
	{ name: '/channels hub', section: PUBLIC_CHANNELS_HUB_FAQ, ids: PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS },
	{ name: '/tools hub', section: PUBLIC_TOOLS_HUB_FAQ, ids: PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS },
	{ name: '/compare hub', section: PUBLIC_COMPARE_HUB_FAQ, ids: PUBLIC_COMPARE_HUB_FAQ_ITEM_IDS },
	{ name: '/creators hub', section: PUBLIC_CREATORS_HUB_FAQ, ids: PUBLIC_CREATORS_HUB_FAQ_ITEM_IDS },
	{ name: '/roadmap hub', section: PUBLIC_ROADMAP_HUB_FAQ, ids: PUBLIC_ROADMAP_HUB_FAQ_ITEM_IDS },
	{ name: '/social-media-posting-api hub', section: PUBLIC_API_POSTING_HUB_FAQ, ids: PUBLIC_API_POSTING_HUB_FAQ_ITEM_IDS },
	{
		name: '/social-media-scheduling-api hub',
		section: PUBLIC_API_SCHEDULING_HUB_FAQ,
		ids: PUBLIC_API_SCHEDULING_HUB_FAQ_ITEM_IDS
	},
	{
		name: '/playbooks hub',
		section: PUBLIC_PLAYBOOKS_HUB.faqSection,
		ids: PUBLIC_LISTINGS_HUB_FAQ_ITEM_IDS
	},
	{
		name: '/building-blocks hub',
		section: PUBLIC_BUILDING_BLOCKS_HUB.faqSection,
		ids: PUBLIC_LISTINGS_HUB_FAQ_ITEM_IDS
	}
] as const;

describe('pSEO hub FAQ funnel links', () => {
	for (const { name, section, ids } of HUB_FAQ_SECTIONS) {
		describe(name, () => {
			it('appends curated git-default FAQ items after tailored copy', () => {
				expect(section.faqItems.length).toBeGreaterThan(ids.length);
				for (const id of ids) {
					expect(section.faqItems.some((item) => item.id === id)).toBe(true);
				}
			});

			it('labels social-integration links with self-host', () => {
				assertSelfHostLabelsOnSocialIntegrationLinks(section.faqItems);
			});

			it('avoids nofollow on first-party anchors', () => {
				assertNoNofollowOnFirstPartyFaqLinks(section.faqItems);
			});
		});
	}

	it('compare hub links buffer compare and pricing from git-default copy', () => {
		const html = PUBLIC_COMPARE_HUB_FAQ.faqItems.map((item) => item.description).join('\n');
		expect(html).toContain(`href="${publicFaqHref.compareOpenquokBuffer}"`);
		expect(html).toContain(`href="${publicFaqHref.pricing}"`);
	});

	it('channels hub links connect guide and trial pricing', () => {
		const html = PUBLIC_CHANNELS_HUB_FAQ.faqItems.map((item) => item.description).join('\n');
		expect(html).toContain(`href="${publicFaqHref.connectChannelsGuide}"`);
		expect(html).toContain(`href="${publicFaqHref.pricing}"`);
	});

	it('API marketing hubs link pricing from git-default trial and OAuth copy', () => {
		for (const section of [PUBLIC_API_POSTING_HUB_FAQ, PUBLIC_API_SCHEDULING_HUB_FAQ]) {
			const html = section.faqItems.map((item) => item.description).join('\n');
			expect(html).toContain(`href="${publicFaqHref.pricing}"`);
		}
	});

	it('playbooks hub links account Playbooks docs from tailored copy', () => {
		const html = PUBLIC_PLAYBOOKS_HUB.faqSection.faqItems
			.map((item) => item.description)
			.join('\n');
		expect(html).toContain(`href="${publicFaqHref.docsPlaybooks}"`);
		expect(html).toContain(`href="${publicFaqHref.docsPlaybooksExplore}"`);
		expect(html).toContain('href="/account/playbooks"');
	});

	it('building-blocks hub links My Playbooks library docs from tailored copy', () => {
		const html = PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqItems
			.map((item) => item.description)
			.join('\n');
		expect(html).toContain(`href="${publicFaqHref.docsPlaybooksMyLibrary}"`);
	});
});
