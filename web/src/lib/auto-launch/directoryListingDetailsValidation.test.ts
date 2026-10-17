import { describe, expect, it } from 'vitest';

import {
	hasDirectoryListingDetailsFieldErrors,
	validateDirectoryListingDetailsForComplete
} from '$lib/auto-launch/directoryListingDetailsValidation';

describe('validateDirectoryListingDetailsForComplete', () => {
	it('requires list URL and auth email', () => {
		const errors = validateDirectoryListingDetailsForComplete({
			listingUrl: '',
			authEmail: ''
		});
		expect(errors.listingUrl).toBeTruthy();
		expect(errors.authEmail).toBeTruthy();
		expect(hasDirectoryListingDetailsFieldErrors(errors)).toBe(true);
	});

	it('accepts valid URL and email', () => {
		const errors = validateDirectoryListingDetailsForComplete({
			listingUrl: 'https://peerpush.com/p/acme',
			authEmail: 'user@openquok.test'
		});
		expect(hasDirectoryListingDetailsFieldErrors(errors)).toBe(false);
	});
});
