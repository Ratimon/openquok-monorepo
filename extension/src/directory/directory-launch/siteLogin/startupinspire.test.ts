import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	isStartupinspireLoggedIn,
	STARTUPINSPIRE_LOGIN_NAV_SELECTOR,
	STARTUPINSPIRE_LOGIN_URL,
} from './startupinspire.js';

describe('isStartupinspireLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		localStorage.clear();
	});

	afterEach(() => {
		document.body.innerHTML = '';
		localStorage.clear();
	});

	it('returns false on the login auth gate', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/login' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<h1>Log in</h1>
			<p>Register here!</p>
			<input type="email" placeholder="Email" />
			<input type="password" placeholder="Password" />
		`;
		expect(isStartupinspireLoggedIn()).toBe(false);
	});

	it('returns false when the header login link is present', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/pricing' } },
			configurable: true,
		});
		document.body.innerHTML = `<nav><a href="/login">Log in</a></nav>`;
		expect(isStartupinspireLoggedIn()).toBe(false);
	});

	it('returns true on pricing when currentUser is stored', () => {
		Object.defineProperty(document, 'defaultView', {
			value: window,
			configurable: true,
		});
		Object.defineProperty(window, 'location', {
			value: { pathname: '/pricing' },
			configurable: true,
		});
		localStorage.setItem('currentUser', JSON.stringify({ token: 'session-token', user: { id: 42 } }));
		document.body.innerHTML = `
			<header><a href="/dashboard" class="btn-account">Account</a></header>
			<h1>Choose your plan</h1>
		`;
		expect(isStartupinspireLoggedIn()).toBe(true);
	});

	it('returns true on pricing when the account link targets /dashboard/account', () => {
		Object.defineProperty(document, 'defaultView', {
			value: window,
			configurable: true,
		});
		Object.defineProperty(window, 'location', {
			value: { pathname: '/pricing' },
			configurable: true,
		});
		document.body.innerHTML = `
			<header><a href="/dashboard/account">Account</a></header>
			<h1>Pricing</h1>
			<footer><a href="/login">Log in</a></footer>
		`;
		expect(isStartupinspireLoggedIn()).toBe(true);
	});

	it('returns true when the startup form is visible on the dashboard wizard', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/dashboard/startup/create' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<input formcontrolname="startup_name" placeholder="Startup name" />
			<input formcontrolname="startup_headline" placeholder="Headline" />
		`;
		expect(isStartupinspireLoggedIn()).toBe(true);
	});

	it('returns false on pricing without a session (public page)', () => {
		Object.defineProperty(document, 'defaultView', {
			value: window,
			configurable: true,
		});
		Object.defineProperty(window, 'location', {
			value: { pathname: '/pricing' },
			configurable: true,
		});
		document.body.innerHTML = `
			<header><a href="/dashboard" class="btn-account">Account</a></header>
			<h1>Choose your plan</h1>
		`;
		expect(isStartupinspireLoggedIn()).toBe(false);
	});

	it('uses the reference selector and login URL', () => {
		expect(STARTUPINSPIRE_LOGIN_NAV_SELECTOR).toContain('/login');
		expect(STARTUPINSPIRE_LOGIN_URL).toBe('https://www.startupinspire.com/login');
	});
});