import { describe, expect, it } from 'vitest';

import {
	GUEST_COMPOSER_LOCK_ACTIONS,
	GUEST_COMPOSER_LOCK_COPY
} from '$lib/posts/constants/guestComposerLock';
import { buildGuestComposerAuthHrefs } from '$lib/posts/utils/buildGuestComposerAuthHrefs';

describe('GUEST_COMPOSER_LOCK_COPY', () => {
	it('covers every lock action with a title and description', () => {
		for (const action of GUEST_COMPOSER_LOCK_ACTIONS) {
			const copy = GUEST_COMPOSER_LOCK_COPY[action];
			expect(copy.title.length).toBeGreaterThan(0);
			expect(copy.description.length).toBeGreaterThan(0);
			expect(copy.title.toLowerCase()).toContain('sign in');
			expect(copy.description.toLowerCase()).toMatch(/sign in/);
			expect(copy.description.toLowerCase()).toMatch(/sign up/);
		}
	});
});

describe('buildGuestComposerAuthHrefs', () => {
	it('appends redirectURL for the current tool path on both auth links', () => {
		const hrefs = buildGuestComposerAuthHrefs({
			signInPath: '/sign-in',
			signUpPath: '/sign-up',
			currentPathAndSearch: '/tools/humanizer/linkedin?ref=hub'
		});
		expect(hrefs.signInHref).toBe(
			'/sign-in?redirectURL=%2Ftools%2Fhumanizer%2Flinkedin%3Fref%3Dhub'
		);
		expect(hrefs.signUpHref).toBe(
			'/sign-up?redirectURL=%2Ftools%2Fhumanizer%2Flinkedin%3Fref%3Dhub'
		);
	});

	it('falls back to root when the current path is empty', () => {
		const hrefs = buildGuestComposerAuthHrefs({
			signInPath: '/sign-in',
			signUpPath: '/sign-up',
			currentPathAndSearch: '   '
		});
		expect(hrefs.signInHref).toBe('/sign-in?redirectURL=%2F');
		expect(hrefs.signUpHref).toBe('/sign-up?redirectURL=%2F');
	});
});
