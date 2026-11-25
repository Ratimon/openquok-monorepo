import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	ALTERNATIVETO_LOGIN_NAV_SELECTOR,
	ALTERNATIVETO_LOGIN_URL,
	isAlternativetoLoggedIn,
} from './alternativeto.js';

describe('isAlternativetoLoggedIn', () => {
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

	it('returns false when the header sign-in link is present', () => {
		document.body.innerHTML = `<nav><a href="/login/">Sign in</a></nav>`;
		expect(isAlternativetoLoggedIn()).toBe(false);
	});

	it('returns false on the login gate with OAuth and email', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/login/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<p>Sign in to AlternativeTo</p>
			<button>Continue with Google</button>
			<button>Continue with GitHub</button>
			<input type="email" />
			<input type="password" />
		`;
		expect(isAlternativetoLoggedIn()).toBe(false);
	});

	it('returns false on /manage-item when only the login card is shown', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/manage-item/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<p>Continue with Google</p>
			<input type="email" />
			<input type="password" />
		`;
		expect(isAlternativetoLoggedIn()).toBe(false);
	});

	it('returns true on /manage-item when listing fields are in the DOM', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/manage-item/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<label>Application name</label>
			<input name="product_name" aria-label="Application name" />
			<label>Website</label>
			<input type="url" name="websiteUrl" />
			<textarea name="shortDescription"></textarea>
			<input type="file" name="applicationIcon" accept="image/*" />
		`;
		expect(isAlternativetoLoggedIn()).toBe(true);
	});

	it('returns true on /user/edit when profile social fields are in the DOM', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/user/edit/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<label>Twitter</label>
			<input name="twitter" aria-label="Twitter" />
			<label>GitHub</label>
			<input name="github" aria-label="GitHub" />
		`;
		expect(isAlternativetoLoggedIn()).toBe(true);
	});

	it('returns true on a generic signed-in page without auth chrome', () => {
		document.body.innerHTML = `<main><p>Featured software</p></main>`;
		expect(isAlternativetoLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(ALTERNATIVETO_LOGIN_NAV_SELECTOR).toContain('/login');
		expect(ALTERNATIVETO_LOGIN_URL).toBe(
			'https://alternativeto.net/login/?returnUrl=/manage-item/'
		);
	});
});