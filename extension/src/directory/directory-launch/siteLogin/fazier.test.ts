import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FAZIER_LOGIN_NAV_SELECTOR, FAZIER_LOGIN_URL, isFazierLoggedIn } from './fazier.js';

describe('isFazierLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns false when the header login link is present', () => {
		document.body.innerHTML = `<nav><a href="/login">Sign In</a></nav>`;
		expect(isFazierLoggedIn()).toBe(false);
	});

	it('returns false on the login auth gate', () => {
		document.body.innerHTML = `
			<h2>Login to Fazier</h2>
			<button>Continue with Google</button>
			<button>Continue with Email</button>
			<p>New to Fazier? Sign Up</p>
		`;
		expect(isFazierLoggedIn()).toBe(false);
	});

	it('returns true when the page wizard form is present without auth chrome', () => {
		document.body.innerHTML = `
			<form>
				<input name="name" placeholder="Organization name" />
				<input name="company" placeholder="company-slug" />
				<input name="website" type="url" placeholder="https://" />
			</form>
		`;
		expect(isFazierLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(FAZIER_LOGIN_NAV_SELECTOR).toBe('a[href="/login"]');
		expect(FAZIER_LOGIN_URL).toBe('https://fazier.com/login');
	});
});