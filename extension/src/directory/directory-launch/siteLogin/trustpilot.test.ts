import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isTrustpilotLoggedIn } from './trustpilot.js';

function withPathname(pathname: string): void {
	Object.defineProperty(document, 'defaultView', {
		value: { location: { pathname } },
		configurable: true,
	});
}

describe('isTrustpilotLoggedIn', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		withPathname('/');
	});

	afterEach(() => {
		document.body.innerHTML = '';
		Object.defineProperty(document, 'defaultView', {
			value: window,
			configurable: true,
		});
	});

	it('returns false on the login gate with email and password', () => {
		withPathname('/login');
		document.body.innerHTML = `
			<p>Sign in to Trustpilot Business</p>
			<input type="email" />
			<input type="password" />
		`;
		expect(isTrustpilotLoggedIn()).toBe(false);
	});

	it('returns false on company-settings when only the login gate is shown', () => {
		withPathname('/company-settings/');
		document.body.innerHTML = `
			<p>Sign in to Trustpilot Business</p>
			<input type="email" />
			<input type="password" />
		`;
		expect(isTrustpilotLoggedIn()).toBe(false);
	});

	it('returns true on company-settings when profile fields are in the DOM', () => {
		withPathname('/company-settings/');
		document.body.innerHTML = `
			<label>Company name</label>
			<input aria-label="Company name" />
			<label>Company domain</label>
			<input aria-label="Company domain" name="domain" />
			<label>Describe your company</label>
			<textarea aria-label="Describe your company" name="description"></textarea>
			<input type="file" accept="image/png,image/jpeg" />
		`;
		expect(isTrustpilotLoggedIn()).toBe(true);
	});

	it('returns true on company-settings with settings shell and only contact info visible', () => {
		withPathname('/company-settings/');
		document.body.innerHTML = `
			<aside>
				<p>About your business</p>
				<p>Company description</p>
				<p>Contact info</p>
			</aside>
			<main>
				<h2>Contact info</h2>
				<p>Log in to Trustpilot</p>
			</main>
		`;
		expect(isTrustpilotLoggedIn()).toBe(true);
	});

	it('returns true when a single section field is mounted (SPA)', () => {
		withPathname('/company-settings/');
		document.body.innerHTML = `
			<nav>About your business</nav>
			<nav>Company description</nav>
			<textarea aria-label="Describe your company"></textarea>
		`;
		expect(isTrustpilotLoggedIn()).toBe(true);
	});
});