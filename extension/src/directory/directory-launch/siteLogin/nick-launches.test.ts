import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	isNickLaunchesLoggedIn,
	NICK_LAUNCHES_LOGIN_NAV_SELECTOR,
	NICK_LAUNCHES_LOGIN_URL,
} from './nick-launches.js';

describe('isNickLaunchesLoggedIn', () => {
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

	it('returns false when the header sign-in CTA is present', () => {
		document.body.innerHTML = `<nav><a data-cta="nav_sign_in" href="/signin/">Sign in</a></nav>`;
		expect(isNickLaunchesLoggedIn()).toBe(false);
	});

	it('returns true on /submit/new when the listing editor is visible but footer still links to signin', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/submit/new/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<nav><button type="button" aria-label="Open menu"></button></nav>
			<main>
				<input name="name" />
				<textarea name="description"></textarea>
			</main>
			<footer><a href="/signin/?callbackUrl=/submit/">Submit</a></footer>
		`;
		expect(isNickLaunchesLoggedIn()).toBe(true);
	});

	it('returns false on the sign-in auth gate', () => {
		document.body.innerHTML = `
			<h1>Welcome back</h1>
			<p>Sign in with Google</p>
			<input type="password" />
			<a href="/sign-up">Sign up</a>
		`;
		expect(isNickLaunchesLoggedIn()).toBe(false);
	});

	it('returns false on /submit/new when the listing form is not in the DOM', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/submit/new/' } },
			configurable: true,
		});
		document.body.innerHTML = `<main><p>Sign in to submit your product</p></main>`;
		expect(isNickLaunchesLoggedIn()).toBe(false);
	});

	it('returns true on /submit/new when listing fields are present without a form wrapper', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/submit/new/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<main>
				<input type="text" name="name" />
				<textarea name="description"></textarea>
			</main>
		`;
		expect(isNickLaunchesLoggedIn()).toBe(true);
	});

	it('returns true on a generic signed-in page without auth chrome', () => {
		document.body.innerHTML = `<main><p>Featured launches</p></main>`;
		expect(isNickLaunchesLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(NICK_LAUNCHES_LOGIN_NAV_SELECTOR).toBe('a[data-cta="nav_sign_in"]');
		expect(NICK_LAUNCHES_LOGIN_URL).toBe(
			'https://nicklaunches.com/signin/?callbackUrl=/submit/new/'
		);
	});
});