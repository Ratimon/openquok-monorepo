import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	isOpenLaunchLoggedIn,
	OPEN_LAUNCH_LOGIN_NAV_SELECTOR,
	OPEN_LAUNCH_LOGIN_URL,
} from './open-launch.js';

describe('isOpenLaunchLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns false when the header sign-in link is present', () => {
		document.body.innerHTML = `<nav><a href="/sign-in">Sign in</a></nav>`;
		expect(isOpenLaunchLoggedIn()).toBe(false);
	});

	it('returns false on the submit auth gate (password + sign up)', () => {
		document.body.innerHTML = `
			<h1>Welcome back</h1>
			<p>Login with Google</p>
			<input type="email" />
			<input type="password" />
			<a href="/sign-up">Sign up</a>
		`;
		expect(isOpenLaunchLoggedIn()).toBe(false);
	});

	it('returns true when session chrome is present without auth gate', () => {
		document.body.innerHTML = `
			<form>
				<input name="name" placeholder="Project name" />
				<input type="url" name="website" />
			</form>
		`;
		expect(isOpenLaunchLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(OPEN_LAUNCH_LOGIN_NAV_SELECTOR).toBe('a[href="/sign-in"]');
		expect(OPEN_LAUNCH_LOGIN_URL).toBe('https://open-launch.com/sign-in');
	});
});
