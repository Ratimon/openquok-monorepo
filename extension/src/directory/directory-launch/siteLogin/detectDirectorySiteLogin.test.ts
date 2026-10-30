import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { detectDirectorySiteLogin } from './detectDirectorySiteLogin.js';
import { PEERPUSH_LOGIN_URL } from './peerpush.js';
import { UNEED_LOGIN_URL } from './uneed.js';

describe('detectDirectorySiteLogin', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('dispatches to the peerpush adapter', () => {
		document.body.innerHTML = `<a href="/auth/login">Log in</a>`;
		expect(detectDirectorySiteLogin('peerpush')).toEqual({
			loggedIn: false,
			loginUrl: PEERPUSH_LOGIN_URL
		});
	});

	it('dispatches to the uneed adapter', () => {
		document.body.innerHTML = `<a href="/login">Log in</a>`;
		expect(detectDirectorySiteLogin('uneed')).toEqual({
			loggedIn: false,
			loginUrl: UNEED_LOGIN_URL
		});
	});

	it('defaults to logged in for unknown site keys', () => {
		expect(detectDirectorySiteLogin('future-directory')).toEqual({
			loggedIn: true,
			loginUrl: ''
		});
	});
});
