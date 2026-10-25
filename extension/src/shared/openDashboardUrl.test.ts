import { describe, expect, it } from 'vitest';

import {
	parseDashboardSignInInput,
	preferHttpsLocalDevSignInUrl,
} from './openDashboardUrl.js';

describe('preferHttpsLocalDevSignInUrl', () => {
	it('upgrades http localhost:5173 sign-in to https', () => {
		expect(preferHttpsLocalDevSignInUrl('http://localhost:5173/sign-in')).toBe(
			'https://localhost:5173/sign-in'
		);
	});

	it('leaves production and already-https URLs unchanged', () => {
		expect(preferHttpsLocalDevSignInUrl('https://www.openquok.com/sign-in')).toBe(
			'https://www.openquok.com/sign-in'
		);
		expect(preferHttpsLocalDevSignInUrl('http://127.0.0.1:5173/sign-in')).toBe(
			'http://127.0.0.1:5173/sign-in'
		);
	});
});

describe('parseDashboardSignInInput', () => {
	it('builds https sign-in for localhost:5173', () => {
		expect(parseDashboardSignInInput('localhost:5173')).toBe('https://localhost:5173/sign-in');
	});

	it('normalizes a full dashboard origin', () => {
		expect(parseDashboardSignInInput('https://my.openquok.example/')).toBe(
			'https://my.openquok.example/sign-in'
		);
	});

	it('returns null for empty input', () => {
		expect(parseDashboardSignInInput('   ')).toBeNull();
	});
});
