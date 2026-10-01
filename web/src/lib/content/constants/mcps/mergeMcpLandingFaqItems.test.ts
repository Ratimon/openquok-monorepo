import { describe, expect, it } from 'vitest';

import { mergeMcpLandingFaqItems } from '$lib/content/constants/mcps/mergeMcpLandingFaqItems';

const defaults: { title: string; description: string }[] = [
	{ title: 'First?', description: 'first answer' },
	{ title: 'Second?', description: 'second answer' },
	{ title: 'Third?', description: 'third answer' }
];

describe('mergeMcpLandingFaqItems', () => {
	it('returns defaults when overrides are missing', () => {
		expect(mergeMcpLandingFaqItems(defaults, undefined)).toEqual(defaults);
		expect(mergeMcpLandingFaqItems(defaults, null)).toEqual(defaults);
	});

	it('replaces the list when faqItems is set', () => {
		const replacement = [{ title: 'Only?', description: 'one' }];
		expect(mergeMcpLandingFaqItems(defaults, { faqItems: replacement })).toEqual(replacement);
	});

	it('patches by title, inserts after first, prepends, and inserts before match', () => {
		const merged = mergeMcpLandingFaqItems(defaults, {
			faqPatchesByTitle: { 'Second?': { description: 'patched second' } },
			faqItemsAfterFirst: [{ title: 'After first?', description: 'inserted' }],
			faqItemsPrepend: [{ title: 'Prepended?', description: 'top' }],
			faqItemsBeforeTitle: {
				matchTitle: 'Third?',
				items: [{ title: 'Before third?', description: 'middle' }]
			}
		});

		expect(merged.map((item) => item.title)).toEqual([
			'Prepended?',
			'First?',
			'After first?',
			'Second?',
			'Before third?',
			'Third?'
		]);
		expect(merged.find((item) => item.title === 'Second?')?.description).toBe('patched second');
	});
});
