import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	isTinylaunchLoggedIn,
	TINYLAUNCH_LOGIN_NAV_SELECTOR,
	TINYLAUNCH_LOGIN_URL,
} from './tinylaunch.js';

describe('isTinylaunchLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns false when the header login link is present', () => {
		document.body.innerHTML = `<nav><a href="/login">Log in</a></nav>`;
		expect(isTinylaunchLoggedIn()).toBe(false);
	});

	it('returns false on the login auth gate (welcome back + Google)', () => {
		document.body.innerHTML = `
			<h1>Welcome Back</h1>
			<p>Login with Google</p>
			<input type="email" />
		`;
		expect(isTinylaunchLoggedIn()).toBe(false);
	});

	it('returns true when the create-startup form is present without auth chrome', () => {
		document.body.innerHTML = `
			<form>
				<input name="name" placeholder="Startup name" />
				<input name="tagline" placeholder="Tagline" />
			</form>
		`;
		expect(isTinylaunchLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(TINYLAUNCH_LOGIN_NAV_SELECTOR).toBe('a[href="/login"]');
		expect(TINYLAUNCH_LOGIN_URL).toBe('https://www.tinylaunch.com/login');
	});
});