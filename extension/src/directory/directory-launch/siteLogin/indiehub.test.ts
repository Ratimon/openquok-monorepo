import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	INDIEHUB_LOGIN_NAV_SELECTOR,
	INDIEHUB_LOGIN_URL,
	isIndiehubLoggedIn,
} from './indiehub.js';

describe('isIndiehubLoggedIn', () => {
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
		document.body.innerHTML = `<nav><a href="/auth/login">Sign in</a></nav>`;
		expect(isIndiehubLoggedIn()).toBe(false);
	});

	it('returns false on the auth login gate', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/auth/login' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<p>Welcome back</p>
			<input type="email" />
			<input type="password" />
			<button>Continue with GitHub</button>
		`;
		expect(isIndiehubLoggedIn()).toBe(false);
	});

	it('returns false on /submit when only the login card is shown', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/submit' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<p>Welcome back</p>
			<input type="email" />
			<button>Continue with GitHub</button>
		`;
		expect(isIndiehubLoggedIn()).toBe(false);
	});

	it('returns true on /submit when Details fields are in the DOM', () => {
		Object.defineProperty(document, 'defaultView', {
			value: { location: { pathname: '/submit' } },
			configurable: true,
		});
		document.body.innerHTML = `
			<ol>
				<li>Details</li>
				<li>Payment</li>
				<li>Publish</li>
			</ol>
			<label>Link</label>
			<input type="url" placeholder="https://" />
			<label>Name</label>
			<input name="name" />
			<section>
				<label>Categories</label>
				<input role="combobox" aria-label="Categories" />
			</section>
			<label>Description</label>
			<textarea name="shortDescription"></textarea>
			<div class="ProseMirror" contenteditable="true"></div>
			<input type="file" name="icon" accept="image/*" />
			<input type="file" name="cover" accept="image/*" />
		`;
		expect(isIndiehubLoggedIn()).toBe(true);
	});

	it('returns true on a generic signed-in page without auth chrome', () => {
		document.body.innerHTML = `<main><p>Featured products</p></main>`;
		expect(isIndiehubLoggedIn()).toBe(true);
	});

	it('uses the reference selector and login URL', () => {
		expect(INDIEHUB_LOGIN_NAV_SELECTOR).toContain('/auth/login');
		expect(INDIEHUB_LOGIN_URL).toBe(
			'https://indiehub.best/auth/login?callbackUrl=/submit'
		);
	});
});