import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isUneedLoggedIn, UNEED_LOGIN_NAV_SELECTOR, UNEED_LOGIN_URL } from './uneed.js';

describe('isUneedLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns false when the header login link is present', () => {
		document.body.innerHTML = `<header><a href="/login">Log in</a><a href="/register">Register</a></header>`;
		expect(isUneedLoggedIn()).toBe(false);
	});

	it('returns true when the header login link is absent', () => {
		document.body.innerHTML = `<header><a href="/profile">My profile</a></header>`;
		expect(isUneedLoggedIn()).toBe(true);
	});

	it('uses the live-verified selector and login URL', () => {
		expect(UNEED_LOGIN_NAV_SELECTOR).toBe('a[href="/login"]');
		expect(UNEED_LOGIN_URL).toBe('https://uneed.best/login');
	});
});
