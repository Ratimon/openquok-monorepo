import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	isPeerPushLoggedIn,
	PEERPUSH_LOGIN_NAV_SELECTOR,
	PEERPUSH_LOGIN_URL
} from './peerpush.js';

describe('isPeerPushLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns false when the nav login link is present', () => {
		document.body.innerHTML = `<nav><a href="/auth/login">Log in</a></nav>`;
		expect(isPeerPushLoggedIn()).toBe(false);
	});

	it('returns true when the nav login link is absent', () => {
		document.body.innerHTML = `<nav><a href="/dashboard">Dashboard</a></nav>`;
		expect(isPeerPushLoggedIn()).toBe(true);
	});

	it('uses the reference selector', () => {
		expect(PEERPUSH_LOGIN_NAV_SELECTOR).toBe('a[href="/auth/login"]');
		expect(PEERPUSH_LOGIN_URL).toBe('https://peerpush.com/auth/login');
	});
});
