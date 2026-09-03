import { describe, expect, it } from 'vitest';

import { resolvePublicFaqItemsByIds } from '$lib/content/constants/competitors';
import { PUBLIC_FAQ_ITEMS } from '$lib/content/constants/publicFaqConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { assertNoNofollowOnFirstPartyFaqLinks } from '$lib/content/utils/publicFaqFunnel.test-utils';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

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
		expect(description).toContain('Docker Compose self-host');
		expect(description).toContain(publicFaqHref.productionDeployment);
		expect(description).toContain('production deployment on your own cloud');
		expect(description).toContain('CLI device-login walkthrough');
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
		const answer = (schema.mainEntity as { acceptedAnswer: { text: string } }[])[0]
			?.acceptedAnswer.text;
		expect(answer).toContain('open source on GitHub');
		expect(answer).toContain('free alternative social media scheduler');
		expect(answer).toContain('hosted cloud plan');
		expect(answer).toContain('Docker Compose self-host');
		expect(answer).toContain('production deployment on your own cloud');
		expect(answer).not.toContain('<a');
		expect(answer).not.toContain('href=');
	});
});
