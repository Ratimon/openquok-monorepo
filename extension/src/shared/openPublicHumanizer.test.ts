import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	buildPublicHumanizerUrl,
	openPublicHumanizerTab,
	resolveDashboardOriginForHumanizerTab,
} from './openPublicHumanizer.js';

vi.mock('./dashboardActiveTab.js', () => ({
	isLocalDashboardOrigin: (origin: string) => origin.includes('localhost'),
	listOpenDashboardTabOrigins: vi.fn(),
	readDashboardOriginFromUrl: vi.fn(),
}));

vi.mock('./dashboardApiOrigin.js', () => ({
	listAuthCheckOrigins: vi.fn(),
}));

vi.mock('./dashboardBridgeStorage.js', () => ({
	findDashboardBridgeSession: vi.fn(),
}));

vi.mock('./dashboardAuth.js', () => ({
	hasDashboardSessionCookie: vi.fn(),
	isDashboardLoggedIn: vi.fn(),
}));

vi.mock('./dashboardOriginStorage.js', () => ({
	getPreferredDashboardOrigin: vi.fn(),
	listDashboardOriginCandidates: vi.fn(),
}));

vi.mock('./dashboardSocialDisconnect.js', () => ({
	listPausedSocialDashboardOrigins: vi.fn(),
}));

import { listAuthCheckOrigins } from './dashboardApiOrigin.js';
import { listOpenDashboardTabOrigins, readDashboardOriginFromUrl } from './dashboardActiveTab.js';
import { findDashboardBridgeSession } from './dashboardBridgeStorage.js';
import { hasDashboardSessionCookie, isDashboardLoggedIn } from './dashboardAuth.js';
import {
	getPreferredDashboardOrigin,
	listDashboardOriginCandidates,
} from './dashboardOriginStorage.js';
import { listPausedSocialDashboardOrigins } from './dashboardSocialDisconnect.js';

describe('buildPublicHumanizerUrl', () => {
	it('builds production humanizer URL', () => {
		expect(buildPublicHumanizerUrl('https://www.openquok.com')).toBe(
			'https://www.openquok.com/tools/humanizer'
		);
	});

	it('builds localhost dev humanizer URL', () => {
		expect(buildPublicHumanizerUrl('https://localhost:5173')).toBe(
			'https://localhost:5173/tools/humanizer'
		);
	});

	it('normalizes trailing slash or path on the dashboard origin', () => {
		expect(buildPublicHumanizerUrl('https://www.openquok.com/')).toBe(
			'https://www.openquok.com/tools/humanizer'
		);
		expect(buildPublicHumanizerUrl('https://localhost:5173/account')).toBe(
			'https://localhost:5173/tools/humanizer'
		);
	});

	it('appends a text query param when selection is present', () => {
		const href = buildPublicHumanizerUrl('https://www.openquok.com', 'Line one\n\nLine two');
		const url = new URL(href);
		expect(url.pathname).toBe('/tools/humanizer');
		expect(url.searchParams.get('text')).toBe('Line one\n\nLine two');
	});
});

describe('resolveDashboardOriginForHumanizerTab', () => {
	beforeEach(() => {
		vi.mocked(listOpenDashboardTabOrigins).mockResolvedValue([]);
		vi.mocked(listAuthCheckOrigins).mockResolvedValue([
			'https://www.openquok.com',
			'https://localhost:5173',
		]);
		vi.mocked(listDashboardOriginCandidates).mockResolvedValue(['https://www.openquok.com']);
		vi.mocked(listPausedSocialDashboardOrigins).mockResolvedValue(new Set());
		vi.mocked(hasDashboardSessionCookie).mockResolvedValue(false);
		vi.mocked(findDashboardBridgeSession).mockResolvedValue(null);
		vi.mocked(readDashboardOriginFromUrl).mockReturnValue(null);
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: false,
			loginUrl: 'https://www.openquok.com/sign-in',
		});
		vi.mocked(getPreferredDashboardOrigin).mockResolvedValue('https://www.openquok.com');
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('prefers an open localhost dashboard tab over remembered production', async () => {
		vi.mocked(listOpenDashboardTabOrigins).mockResolvedValue([
			'https://www.openquok.com',
			'https://localhost:5173',
		]);

		await expect(resolveDashboardOriginForHumanizerTab()).resolves.toBe('https://localhost:5173');
	});

	it('prefers a localhost session cookie over production', async () => {
		vi.mocked(hasDashboardSessionCookie).mockImplementation(async (origin) =>
			origin.includes('localhost')
		);
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: true,
			loginUrl: 'https://www.openquok.com/sign-in',
		});

		await expect(resolveDashboardOriginForHumanizerTab()).resolves.toBe('https://localhost:5173');
		expect(isDashboardLoggedIn).not.toHaveBeenCalled();
	});

	it('prefers a localhost bridge session over production loginUrl', async () => {
		vi.mocked(findDashboardBridgeSession).mockResolvedValue({
			dashboardOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: 'org',
			updatedAt: Date.now(),
		});
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: true,
			loginUrl: 'https://www.openquok.com/sign-in',
		});

		await expect(resolveDashboardOriginForHumanizerTab()).resolves.toBe('https://localhost:5173');
		expect(isDashboardLoggedIn).not.toHaveBeenCalled();
	});

	it('uses the signed-in dashboard host when no local tab is open', async () => {
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: true,
			loginUrl: 'https://localhost:5173/sign-in',
		});

		await expect(resolveDashboardOriginForHumanizerTab()).resolves.toBe('https://localhost:5173');
	});
});

describe('openPublicHumanizerTab', () => {
	beforeEach(() => {
		vi.stubGlobal('chrome', {
			tabs: {
				create: vi.fn().mockResolvedValue({}),
				query: vi.fn().mockResolvedValue([]),
			},
		});
		vi.mocked(listOpenDashboardTabOrigins).mockResolvedValue([]);
		vi.mocked(listAuthCheckOrigins).mockResolvedValue(['https://localhost:5173']);
		vi.mocked(listDashboardOriginCandidates).mockResolvedValue(['https://localhost:5173']);
		vi.mocked(listPausedSocialDashboardOrigins).mockResolvedValue(new Set());
		vi.mocked(hasDashboardSessionCookie).mockResolvedValue(true);
		vi.mocked(findDashboardBridgeSession).mockResolvedValue(null);
		vi.mocked(readDashboardOriginFromUrl).mockReturnValue(null);
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: true,
			loginUrl: 'https://localhost:5173/sign-in',
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('opens a tab at the resolved dashboard origin', async () => {
		await openPublicHumanizerTab();

		expect(chrome.tabs.create).toHaveBeenCalledWith({
			url: 'https://localhost:5173/tools/humanizer',
			active: true,
		});
	});

	it('passes trimmed selection into the humanizer URL', async () => {
		vi.mocked(isDashboardLoggedIn).mockResolvedValue({
			loggedIn: true,
			loginUrl: 'https://www.openquok.com/sign-in',
		});

		await openPublicHumanizerTab('  Draft body  ');

		const call = vi.mocked(chrome.tabs.create).mock.calls[0]?.[0];
		expect(call?.active).toBe(true);
		const url = new URL(String(call?.url));
		expect(url.searchParams.get('text')).toBe('Draft body');
	});
});
