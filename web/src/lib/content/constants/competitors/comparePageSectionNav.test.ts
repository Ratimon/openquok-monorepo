import { describe, expect, it } from 'vitest';

import { getCompareProduct } from '$lib/content/constants/competitors';
import { buildAlternativesLongFormViewModel } from '$lib/content/constants/competitors/buildAlternativesLongForm';
import { buildAlternativesDetailNavSections } from '$lib/content/constants/competitors/comparePageSectionNav';

describe('buildAlternativesDetailNavSections', () => {
	it('lists narrative sections and ranked picks, not pair-compare matrices', () => {
		const target = getCompareProduct('hootsuite');
		expect(target).toBeDefined();

		const longForm = buildAlternativesLongFormViewModel(target!);
		const nav = buildAlternativesDetailNavSections(longForm, true);
		const labels = nav.map((item) => item.navLabel);

		expect(labels).toEqual([
			'Platform overview',
			longForm.whyPeopleLook.navLabel,
			longForm.yourOptions.navLabel,
			'Ranked picks',
			longForm.whenTheyWin.navLabel,
			'Questions'
		]);

		expect(labels).not.toContain('Pricing & plans');
		expect(labels).not.toContain('Feature comparison');
		expect(labels).not.toContain('With vs without');
		expect(labels).not.toContain(longForm.otherAlternatives.navLabel);
	});
});
