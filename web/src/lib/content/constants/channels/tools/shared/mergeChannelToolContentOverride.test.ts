import { describe, expect, it } from 'vitest';

import {
	getChannelToolContentOverride,
	mergeChannelToolContentOverride
} from '$lib/content/constants/channels/tools/shared/mergeChannelToolContentOverride';

describe('mergeChannelToolContentOverride', () => {
	const base = {
		channelSlug: 'bluesky',
		metaTitle: 'Default title',
		metaDescription: 'Default description',
		hubDescription: 'Default hub'
	};

	it('returns base unchanged when override is missing', () => {
		expect(mergeChannelToolContentOverride(base, undefined)).toEqual(base);
		expect(mergeChannelToolContentOverride(base, null)).toEqual(base);
	});

	it('merges only defined override fields', () => {
		const merged = mergeChannelToolContentOverride(base, {
			metaTitle: 'CTR title',
			heroLead: 'Studies disagree; run a test plan.'
		});

		expect(merged.metaTitle).toBe('CTR title');
		expect(merged.metaDescription).toBe('Default description');
		expect(merged.hubDescription).toBe('Default hub');
		expect(merged.heroLead).toBe('Studies disagree; run a test plan.');
		expect(merged.seoIntro).toBeUndefined();
		expect(merged.channelSlug).toBe('bluesky');
	});
});

describe('getChannelToolContentOverride', () => {
	const map = {
		bluesky: { metaTitle: 'Bluesky override' }
	};

	it('normalizes slug casing and whitespace', () => {
		expect(getChannelToolContentOverride(' Bluesky ', map)?.metaTitle).toBe('Bluesky override');
		expect(getChannelToolContentOverride('unknown', map)).toBeUndefined();
	});
});
