import { describe, expect, it } from 'vitest';

import {
	activeTabMatchesDashboardConnectTarget,
	DEFAULT_SELF_HOST_DASHBOARD_INPUT,
	dashboardConnectTargetKey,
	normalizeSelfHostDashboardInput,
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

describe('normalizeSelfHostDashboardInput', () => {
	it('defaults empty input to https localhost dev origin', () => {
		expect(normalizeSelfHostDashboardInput('')).toBe(DEFAULT_SELF_HOST_DASHBOARD_INPUT);
		expect(DEFAULT_SELF_HOST_DASHBOARD_INPUT).toBe('https://localhost:5173');
	});

	it('expands bare port 5173 to https://localhost:5173', () => {
		expect(normalizeSelfHostDashboardInput('5173')).toBe('https://localhost:5173');
	});

	it('prepends https to localhost:5173', () => {
		expect(normalizeSelfHostDashboardInput('localhost:5173')).toBe('https://localhost:5173');
	});

	it('upgrades http localhost:5173 to https', () => {
		expect(normalizeSelfHostDashboardInput('http://localhost:5173')).toBe('https://localhost:5173');
	});

	it('preserves custom self-host origins', () => {
		expect(normalizeSelfHostDashboardInput('https://my.openquok.example')).toBe(
			'https://my.openquok.example'
		);
	});
});

describe('parseDashboardSignInInput', () => {
	it('builds https sign-in for localhost:5173', () => {
		expect(parseDashboardSignInInput('localhost:5173')).toBe('https://localhost:5173/sign-in');
	});

	it('builds sign-in for bare port 5173', () => {
		expect(parseDashboardSignInInput('5173')).toBe('https://localhost:5173/sign-in');
	});

	it('normalizes a full dashboard origin', () => {
		expect(parseDashboardSignInInput('https://my.openquok.example/')).toBe(
			'https://my.openquok.example/sign-in'
		);
	});

	it('returns null for whitespace-only input', () => {
		expect(parseDashboardSignInInput('   ')).toBe('https://localhost:5173/sign-in');
	});
});

describe('dashboardConnectTargetKey', () => {
	it('treats production hosts as one target', () => {
		expect(dashboardConnectTargetKey('https://www.openquok.com/sign-in')).toBe(
			dashboardConnectTargetKey('https://openquok.com/account')
		);
	});

	it('normalizes local Vite dev to https localhost:5173', () => {
		expect(dashboardConnectTargetKey('http://localhost:5173/')).toBe('https://localhost:5173');
		expect(dashboardConnectTargetKey('https://localhost:5173/sign-in')).toBe('https://localhost:5173');
	});
});

describe('activeTabMatchesDashboardConnectTarget', () => {
	it('matches when already on local dashboard and connecting to self host', () => {
		expect(
			activeTabMatchesDashboardConnectTarget(
				'https://localhost:5173/account',
				'https://localhost:5173/sign-in'
			)
		).toBe(true);
	});

	it('matches when already on production and connecting to cloud', () => {
		expect(
			activeTabMatchesDashboardConnectTarget(
				'https://www.openquok.com/',
				'https://www.openquok.com/sign-in'
			)
		).toBe(true);
	});

	it('does not match when on a different site', () => {
		expect(
			activeTabMatchesDashboardConnectTarget(
				'https://example.com/',
				'https://localhost:5173/sign-in'
			)
		).toBe(false);
	});

	it('does not match local dev tab when connecting to production', () => {
		expect(
			activeTabMatchesDashboardConnectTarget(
				'https://localhost:5173/',
				'https://www.openquok.com/sign-in'
			)
		).toBe(false);
	});
});
