import { describe, expect, it } from 'vitest';

import { resolveDirectoryLinkTypeDisplay } from '$lib/auto-launch/utils/resolveDirectoryLinkTypeDisplay';

describe('resolveDirectoryLinkTypeDisplay', () => {
	it('uses listing evidence when completed', () => {
		expect(
			resolveDirectoryLinkTypeDisplay({
				submissionStatus: 'completed',
				listingDofollow: true,
				opportunityDofollow: 'nofollow'
			})
		).toBe('Dofollow');
	});

	it('falls back to catalog when not completed', () => {
		expect(
			resolveDirectoryLinkTypeDisplay({
				submissionStatus: 'none',
				listingDofollow: false,
				opportunityDofollow: 'unknown'
			})
		).toBe('Link type unknown');
	});
});
