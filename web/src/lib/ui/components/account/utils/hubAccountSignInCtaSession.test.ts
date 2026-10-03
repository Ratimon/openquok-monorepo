import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import {
	markHubAccountSignInCtaShown,
	offerHubAccountSignInCtaAfterBookmark,
	wasHubAccountSignInCtaShown
} from '$lib/ui/components/account/utils/hubAccountSignInCtaSession';

describe('hubAccountSignInCtaSession', () => {
	const storage = new Map<string, string>();

	beforeEach(() => {
		storage.clear();
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => {
				storage.set(key, value);
			},
			removeItem: (key: string) => {
				storage.delete(key);
			},
			clear: () => {
				storage.clear();
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('offers CTA once per variant after a logged-out bookmark add', () => {
		expect(
			offerHubAccountSignInCtaAfterBookmark({
				variant: 'listings',
				isLoggedIn: false,
				addedBookmark: true
			})
		).toBe(true);
		expect(wasHubAccountSignInCtaShown('listings')).toBe(true);
		expect(
			offerHubAccountSignInCtaAfterBookmark({
				variant: 'listings',
				isLoggedIn: false,
				addedBookmark: true
			})
		).toBe(false);
	});

	it('does not offer when signed in or when removing a bookmark', () => {
		expect(
			offerHubAccountSignInCtaAfterBookmark({
				variant: 'backlinks',
				isLoggedIn: true,
				addedBookmark: true
			})
		).toBe(false);
		expect(
			offerHubAccountSignInCtaAfterBookmark({
				variant: 'backlinks',
				isLoggedIn: false,
				addedBookmark: false
			})
		).toBe(false);
	});

	it('tracks listings and backlinks separately', () => {
		markHubAccountSignInCtaShown('listings');
		expect(wasHubAccountSignInCtaShown('listings')).toBe(true);
		expect(wasHubAccountSignInCtaShown('backlinks')).toBe(false);
	});
});
