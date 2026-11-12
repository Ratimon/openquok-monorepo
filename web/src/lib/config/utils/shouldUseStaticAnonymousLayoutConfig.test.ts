import { describe, expect, it } from 'vitest';

import {
	pathnameMatchesStaticAnonymousLayoutAllowlist,
	shouldUseStaticAnonymousLayoutConfig
} from '$lib/config/utils/shouldUseStaticAnonymousLayoutConfig';

describe('pathnameMatchesStaticAnonymousLayoutAllowlist', () => {
	it('matches compare detail and hub paths', () => {
		expect(pathnameMatchesStaticAnonymousLayoutAllowlist('/compare')).toBe(true);
		expect(pathnameMatchesStaticAnonymousLayoutAllowlist('/compare/openquok/buffer')).toBe(true);
	});

	it('does not match homepage or account routes', () => {
		expect(pathnameMatchesStaticAnonymousLayoutAllowlist('/')).toBe(false);
		expect(pathnameMatchesStaticAnonymousLayoutAllowlist('/account')).toBe(false);
	});
});

describe('shouldUseStaticAnonymousLayoutConfig', () => {
	it('requires env flag and anonymous session', () => {
		expect(
			shouldUseStaticAnonymousLayoutConfig({
				pathname: '/compare/openquok/buffer',
				envEnabled: '1',
				isLoggedIn: false
			})
		).toBe(true);
		expect(
			shouldUseStaticAnonymousLayoutConfig({
				pathname: '/compare/openquok/buffer',
				envEnabled: '1',
				isLoggedIn: true
			})
		).toBe(false);
		expect(
			shouldUseStaticAnonymousLayoutConfig({
				pathname: '/',
				envEnabled: '1',
				isLoggedIn: false
			})
		).toBe(false);
		expect(
			shouldUseStaticAnonymousLayoutConfig({
				pathname: '/compare/openquok/buffer',
				envEnabled: undefined,
				isLoggedIn: false
			})
		).toBe(false);
	});
});
