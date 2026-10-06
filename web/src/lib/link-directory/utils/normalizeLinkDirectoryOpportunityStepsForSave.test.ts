import { describe, expect, it } from 'vitest';

import { normalizeLinkDirectoryOpportunityStepsForSave } from '$lib/link-directory/utils/normalizeLinkDirectoryOpportunityStepsForSave';

describe('normalizeLinkDirectoryOpportunityStepsForSave', () => {
	it('sorts, trims, drops empty rows, and renumbers order', () => {
		expect(
			normalizeLinkDirectoryOpportunityStepsForSave([
				{ order: 3, title: ' Third ', body: ' body three ' },
				{ order: 1, title: ' ', body: 'skip' },
				{ order: 2, title: 'Second', body: 'Two' }
			])
		).toEqual([
			{ order: 1, title: 'Second', body: 'Two' },
			{ order: 2, title: 'Third', body: 'body three' }
		]);
	});
});
