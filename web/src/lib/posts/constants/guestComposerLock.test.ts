import { describe, expect, it } from 'vitest';

import {
	GUEST_COMPOSER_LOCK_ACTIONS,
	GUEST_COMPOSER_LOCK_COPY,
	resolveGuestComposerLockCopy
} from '$lib/posts/constants/guestComposerLock';
import { buildGuestComposerAuthHrefs } from '$lib/posts/utils/buildGuestComposerAuthHrefs';

describe('GUEST_COMPOSER_LOCK_COPY', () => {
	it('covers every lock action with guest and logged-in copy', () => {
		for (const action of GUEST_COMPOSER_LOCK_ACTIONS) {
			const copy = GUEST_COMPOSER_LOCK_COPY[action];
			expect(copy.title.length).toBeGreaterThan(0);
			expect(copy.description.length).toBeGreaterThan(0);
			expect(copy.loggedInTitle.length).toBeGreaterThan(0);
			expect(copy.loggedInDescription.length).toBeGreaterThan(0);

			const guest = resolveGuestComposerLockCopy(action, false);
			expect(guest.title).toBe(copy.title);
			expect(guest.description.toLowerCase()).toMatch(/sign in/);
			expect(guest.description.toLowerCase()).toMatch(/sign up/);

			const loggedIn = resolveGuestComposerLockCopy(action, true);
			expect(loggedIn.title).toBe(copy.loggedInTitle);
			expect(loggedIn.description.toLowerCase()).not.toMatch(/sign in/);
			expect(loggedIn.description.toLowerCase()).not.toMatch(/sign up/);
		}
	});

	it('labels connect-channels as samples for guests', () => {
		const guest = resolveGuestComposerLockCopy('connect-channels', false);
		expect(guest.title).toBe('Connect your social accounts');
		expect(guest.description.toLowerCase()).toMatch(/sample/);
		expect(guest.description.toLowerCase()).toMatch(/without an account/);

		const loggedIn = resolveGuestComposerLockCopy('connect-channels', true);
		expect(loggedIn.title).toBe('Connect your social accounts');
		expect(loggedIn.description.toLowerCase()).toMatch(/workspace/);
		expect(loggedIn.description.toLowerCase()).toMatch(/channel/);
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
