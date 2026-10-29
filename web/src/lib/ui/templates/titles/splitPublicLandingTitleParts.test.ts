import { describe, expect, it } from 'vitest';

import {
	landingTitleHasMultipleParts,
	splitPublicHeroTitleLines,
	splitPublicLandingTitleParts
} from '$lib/ui/templates/titles/splitPublicLandingTitleParts';

describe('splitPublicLandingTitleParts', () => {
	it('splits on newlines before commas', () => {
		expect(
			splitPublicLandingTitleParts('Reminded in OpenQuok\nyou post on reddit.com yourself')
		).toEqual(['Reminded in OpenQuok', 'you post on reddit.com yourself']);
	});

	it('splits on commas when present and commaSeparated is not false', () => {
		expect(splitPublicLandingTitleParts('Line one, line two')).toEqual(['Line one', 'line two']);
	});

	it('does not split on commas when commaSeparated is false', () => {
		expect(splitPublicLandingTitleParts('Line one, line two', false)).toEqual([
			'Line one, line two'
		]);
	});

	it('treats newline titles as multi-part', () => {
		expect(landingTitleHasMultipleParts('Line one\nLine two')).toBe(true);
	});

	it('splits hero titles on newlines only', () => {
		expect(splitPublicHeroTitleLines('Draft in OpenQuok\npost on reddit.com')).toEqual([
			'Draft in OpenQuok',
			'post on reddit.com'
		]);
		expect(splitPublicHeroTitleLines('One line, with comma')).toEqual(['One line, with comma']);
	});
});
