import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	DEVHUNT_LOGIN_NAV_SELECTOR,
	DEVHUNT_LOGIN_URL,
	isDevhuntLoggedIn,
} from './devhunt.js';

describe('isDevhuntLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
		Object.defineProperty(document, 'defaultView', {
			value: window,
			configurable: true,
		});
	});

	it('returns false when the header login link is present', () => {
		document.body.innerHTML = `<nav><a href="/login?next=submit">Log in</a></nav>`;
		expect(isDevhuntLoggedIn()).toBe(false);
	});

	it('returns false on the login auth gate', () => {
		document.body.innerHTML = `
			<h1>Log in to launch your tool</h1>
			<p>Continue with GitHub</p>
		`;
		expect(isDevhuntLoggedIn()).toBe(false);
	});

	it('returns true when the new-tool form container is visible on account/tools', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/account/tools/new' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<div id="form-container">
				<input placeholder="My Awesome Dev Tool" />
			</div>
		`;
		expect(isDevhuntLoggedIn()).toBe(true);
	});

	it('returns true on a generic signed-in page without auth chrome', () => {
		document.body.innerHTML = `<main><p>Weekly launches</p></main>`;
		expect(isDevhuntLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(DEVHUNT_LOGIN_NAV_SELECTOR).toBe('a[href^="/login"]');
		expect(DEVHUNT_LOGIN_URL).toBe('https://devhunt.org/login');
	});
});