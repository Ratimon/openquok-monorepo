import { describe, expect, it } from 'vitest';

import { resolvePublicFaqItemsByIds } from '$lib/content/constants/competitors';
import { PUBLIC_FAQ_ITEMS } from '$lib/content/constants/publicFaqConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { assertNoNofollowOnFirstPartyFaqLinks } from '$lib/content/utils/publicFaqFunnel.test-utils';

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
		expect(answer).toContain('Docker Compose self-host guide');
		expect(answer).not.toContain('<a');
		expect(answer).not.toContain('href=');
	});
});
