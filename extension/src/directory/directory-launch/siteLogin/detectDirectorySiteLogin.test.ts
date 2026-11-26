import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { detectDirectorySiteLogin } from './detectDirectorySiteLogin.js';
import { DEVHUNT_LOGIN_URL } from './devhunt.js';
import { FAZIER_LOGIN_URL } from './fazier.js';
import { ALTERNATIVETO_LOGIN_URL } from './alternativeto.js';
import { TRUSTPILOT_LOGIN_URL } from './trustpilot.js';
import { INDIEHUB_LOGIN_URL } from './indiehub.js';
import { NICK_LAUNCHES_LOGIN_URL } from './nick-launches.js';
import { OPEN_LAUNCH_LOGIN_URL } from './open-launch.js';
import { PEERPUSH_LOGIN_URL } from './peerpush.js';
import { TINYLAUNCH_LOGIN_URL } from './tinylaunch.js';
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

	it('dispatches to the open-launch adapter', () => {
		document.body.innerHTML = `<a href="/sign-in">Sign in</a>`;
		expect(detectDirectorySiteLogin('open-launch')).toEqual({
			loggedIn: false,
			loginUrl: OPEN_LAUNCH_LOGIN_URL
		});
	});

	it('dispatches to the tinylaunch adapter', () => {
		document.body.innerHTML = `<a href="/login">Log in</a>`;
		expect(detectDirectorySiteLogin('tinylaunch')).toEqual({
			loggedIn: false,
			loginUrl: TINYLAUNCH_LOGIN_URL
		});
	});

	it('dispatches to the fazier adapter', () => {
		document.body.innerHTML = `<a href="/login">Sign In</a>`;
		expect(detectDirectorySiteLogin('fazier')).toEqual({
			loggedIn: false,
			loginUrl: FAZIER_LOGIN_URL
		});
	});

	it('dispatches to the devhunt adapter', () => {
		document.body.innerHTML = `<a href="/login?next=submit">Log in</a>`;
		expect(detectDirectorySiteLogin('devhunt')).toEqual({
			loggedIn: false,
			loginUrl: DEVHUNT_LOGIN_URL
		});
	});

	it('dispatches to the nick-launches adapter', () => {
		document.body.innerHTML = `<nav><a data-cta="nav_sign_in" href="/signin/">Sign in</a></nav>`;
		expect(detectDirectorySiteLogin('nick-launches')).toEqual({
			loggedIn: false,
			loginUrl: NICK_LAUNCHES_LOGIN_URL
		});
	});

	it('dispatches to the indiehub adapter', () => {
		document.body.innerHTML = `<nav><a href="/auth/login">Sign in</a></nav>`;
		expect(detectDirectorySiteLogin('indiehub')).toEqual({
			loggedIn: false,
			loginUrl: INDIEHUB_LOGIN_URL
		});
	});

	it('dispatches to the alternativeto adapter', () => {
		document.body.innerHTML = `<nav><a href="/login/">Sign in</a></nav>`;
		expect(detectDirectorySiteLogin('alternativeto')).toEqual({
			loggedIn: false,
			loginUrl: ALTERNATIVETO_LOGIN_URL
		});
	});

	it('dispatches to the trustpilot adapter', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/company-settings/' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<p>Log in to Trustpilot</p>
			<input type="email" />
			<input type="password" />
		`;
		expect(detectDirectorySiteLogin('trustpilot')).toEqual({
			loggedIn: false,
			loginUrl: TRUSTPILOT_LOGIN_URL
		});
	});

	it('defaults to logged in for unknown site keys', () => {
		expect(detectDirectorySiteLogin('future-directory')).toEqual({
			loggedIn: true,
			loginUrl: ''
		});
	});
});
