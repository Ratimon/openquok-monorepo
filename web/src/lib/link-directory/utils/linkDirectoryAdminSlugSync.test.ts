import { describe, expect, it } from 'vitest';

import {
	shouldSyncSlugFromTitle,
	slugFromTitle
} from '$lib/link-directory/utils/linkDirectoryAdminSlugSync';

describe('slugFromTitle', () => {
	it('slugifies titles with the shared stringToSlug rules', () => {
		expect(slugFromTitle('Bluesky')).toBe('bluesky');
		expect(slugFromTitle('This is a Header!')).toBe('this-is-a-header-');
	});
});

describe('shouldSyncSlugFromTitle', () => {
	it('syncs for new records until the slug field is manually edited', () => {
		expect(
			shouldSyncSlugFromTitle({
				slug: '',
				title: 'Bluesky',
				slugManuallyEdited: false
			})
		).toBe(true);

		expect(
			shouldSyncSlugFromTitle({
				slug: 'bluesky',
				title: 'Bluesky Network',
				slugManuallyEdited: false
			})
		).toBe(true);
	});

	it('does not sync after the slug was manually edited', () => {
		expect(
			shouldSyncSlugFromTitle({
				slug: 'custom-slug',
				title: 'Updated title',
				slugManuallyEdited: true
			})
		).toBe(false);

		expect(
			shouldSyncSlugFromTitle({
				slug: '',
				title: 'Updated title',
				slugManuallyEdited: true
			})
		).toBe(false);
	});
});
