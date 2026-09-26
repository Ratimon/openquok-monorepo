import type { Question } from 'schema-dts';

import { describe, expect, it } from 'vitest';

import {
	appendPublicGeneralFaqItems,
	getPublicAgentsHubFaqItems,
	getPublicApiPlatformFaqItems,
	getPublicChannelsHubFaqItems,
	getPublicPricingFaqItems,
	PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS,
	PUBLIC_API_PLATFORM_FAQ_ITEM_IDS,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS,
	PUBLIC_FAQ_ITEMS,
	PUBLIC_PRICING_FAQ_ITEM_IDS,
	PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS,
	resolvePublicFaqItemsByIds
} from '$lib/content/constants/publicFaqConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { resolvePublicFaqItemsVm } from '$lib/content/utils/parsePublicFaqConfig';
import { assertNoNofollowOnFirstPartyFaqLinks } from '$lib/content/utils/publicFaqFunnel.test-utils';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

function firstFaqAnswerPlainText(schema: ReturnType<typeof createPublicFaqSEOSchema>): string {
	if (schema['@type'] !== 'FAQPage' || !schema.mainEntity) {
		return '';
	}

	const first = Array.isArray(schema.mainEntity) ? schema.mainEntity[0] : schema.mainEntity;
	const question = first as Question | undefined;
	const accepted = question?.acceptedAnswer;

	if (!accepted || typeof accepted !== 'object' || !('text' in accepted)) {
		return '';
	}

	return typeof accepted.text === 'string' ? accepted.text : '';
}

describe('appendPublicGeneralFaqItems', () => {
	it('keeps tailored items first and appends git-default copy by id', () => {
		const tailored = [{ title: 'Custom?', description: 'Tailored answer.' }];
		const merged = appendPublicGeneralFaqItems(tailored, PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS);

		expect(merged[0]?.title).toBe('Custom?');
		expect(merged.length).toBe(1 + PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS.length);
		expect(merged.at(-1)?.id).toBe(PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS.at(-1));
	});

	it('skips general items already present by id', () => {
		const tryFree = PUBLIC_FAQ_ITEMS.find((item) => item.id === 'try-free');
		const merged = appendPublicGeneralFaqItems(
			tryFree ? [tryFree] : [],
			PUBLIC_TOOLS_HUB_FAQ_ITEM_IDS
		);

		expect(merged.filter((item) => item.id === 'try-free')).toHaveLength(1);
	});
});

describe('resolvePublicFaqItemsVm', () => {
	it('falls back to git defaults when the route passes no items', () => {
		expect(resolvePublicFaqItemsVm([])).toEqual([...PUBLIC_FAQ_ITEMS]);
		expect(resolvePublicFaqItemsVm(undefined)).toEqual([...PUBLIC_FAQ_ITEMS]);
	});

	it('keeps CMS items when present', () => {
		const custom = [{ title: 'Custom?', description: 'Custom answer.' }];
		expect(resolvePublicFaqItemsVm(custom)).toEqual(custom);
	});
});

describe('public landing hub FAQ getters', () => {
	it('resolves three agents hub items from PUBLIC_FAQ_ITEMS', () => {
		const items = getPublicAgentsHubFaqItems();
		expect(items).toHaveLength(3);
		expect(items.map((item) => item.id)).toEqual([...PUBLIC_AGENTS_HUB_FAQ_ITEM_IDS]);
	});

	it('resolves channels and API platform sets with stable ids', () => {
		expect(getPublicChannelsHubFaqItems().map((item) => item.id)).toEqual([
			...PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
		]);
		expect(getPublicApiPlatformFaqItems().map((item) => item.id)).toEqual([
			...PUBLIC_API_PLATFORM_FAQ_ITEM_IDS
		]);
	});
});

describe('getPublicPricingFaqItems', () => {
	it('uses git-default copy from PUBLIC_FAQ_ITEMS with doc links', () => {
		const items = getPublicPricingFaqItems();
		const tryFree = PUBLIC_FAQ_ITEMS.find((item) => item.id === 'try-free');

		expect(items.length).toBe(PUBLIC_PRICING_FAQ_ITEM_IDS.length);
		expect(items[0]?.title).toBe(tryFree?.title);
		expect(items[0]?.description).toBe(tryFree?.description);
		expect(items[0]?.description).toContain('href="/docs/');
	});

	it('keeps first-party FAQ links followable', () => {
		assertNoNofollowOnFirstPartyFaqLinks(getPublicPricingFaqItems());
	});

	it('omits general how-to and MCP-only landing questions', () => {
		const titles = getPublicPricingFaqItems().map((item) => item.title);

		expect(titles).not.toContain('Why switch from Buffer or Hootsuite?');
		expect(titles).not.toContain('How do I schedule social media posts with OpenQuok?');
		expect(titles).not.toContain('What is MCP and how does OpenQuok use it?');
	});

	it('links team collaboration walkthrough on pricing FAQ', () => {
		const teamMembers =
			getPublicPricingFaqItems().find((item) => item.id === 'team-members')?.description ?? '';

		expect(teamMembers).toContain(publicFaqHref.blogTeamCollaboration);
		expect(teamMembers).toContain(publicFaqHref.docsApprovals);
	});
});

describe('PUBLIC_FAQ_ITEMS', () => {
	it('resolves compare-page FAQ items by stable ids', () => {
		const items = resolvePublicFaqItemsByIds([
			'switch-from-buffer-hootsuite',
			'try-free',
			'multi-workspace'
		]);

		expect(items.map((item) => item.title)).toEqual([
			'Why switch from Buffer or Hootsuite?',
			'Can I try OpenQuok for free?',
			"Why should I use OpenQuok's multi-workspace?"
		]);
	});

	it('keeps first-party FAQ links followable', () => {
		assertNoNofollowOnFirstPartyFaqLinks(PUBLIC_FAQ_ITEMS);
	});

	it('links self-host FAQ answer to all three operator paths', () => {
		const description =
			PUBLIC_FAQ_ITEMS.find((item) => item.title === 'Can I self-host OpenQuok?')?.description ??
			'';

		expect(description).toContain(publicFaqHref.selfHostingLanding);
		expect(description).toContain('free alternative social media scheduler');
		expect(description).toContain('hosted cloud plan');
		expect(description).toContain(publicFaqHref.cloud);
		expect(description).toContain(publicFaqHref.billing);
		expect(description).toContain('Docker Compose self-host');
		expect(description).toContain(publicFaqHref.productionDeployment);
		expect(description).toContain('production deployment on your own cloud');
		expect(description).toContain('CLI device-login walkthrough');
	});

	it('links repeated posts to scheduling anchor and kanban docs', () => {
		const description =
			PUBLIC_FAQ_ITEMS.find((item) => item.title === 'How does repeated posts work')?.description ??
			'';

		expect(description).toContain(publicFaqHref.docsSchedulingRepeat);
		expect(publicFaqHref.docsSchedulingRepeat).toContain('#repeating-a-post');
		expect(description).toContain(publicFaqHref.docsKanban);
	});

	it('documents cloud billing in a dedicated FAQ answer', () => {
		const description =
			PUBLIC_FAQ_ITEMS.find((item) => item.title === 'Where do I manage OpenQuok Cloud billing?')
				?.description ?? '';

		expect(description).toContain('href="/account/billing"');
		expect(description).toContain(publicFaqHref.billing);
		expect(description).toContain(publicFaqHref.billingSubscription);
		expect(description).toContain(publicFaqHref.billingLimits);
		expect(description).toContain(publicFaqHref.cloud);
	});
});

describe('createPublicFaqSEOSchema', () => {
	it('stores FAQ answers as plain text while keeping link labels', () => {
		const schema = createPublicFaqSEOSchema({
			pageUrl: 'https://www.openquok.com/#faq',
			items: [
				{
					title: 'Can I self-host OpenQuok?',
					description: PUBLIC_FAQ_ITEMS.find((item) => item.title === 'Can I self-host OpenQuok?')
						?.description ?? ''
				}
			]
		});

		expect(schema['@type']).toBe('FAQPage');
		const answer = firstFaqAnswerPlainText(schema);
		expect(answer).toContain('open source on GitHub');
		expect(answer).toContain('free alternative social media scheduler');
		expect(answer).toContain('hosted cloud plan');
		expect(answer).toContain('Docker Compose self-host');
		expect(answer).toContain('production deployment on your own cloud');
		expect(answer).not.toContain('<a');
		expect(answer).not.toContain('href=');
	});
});
