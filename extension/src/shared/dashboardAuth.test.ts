import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	hasDashboardSessionCookie,
	isDashboardLoggedIn,
	readAccessTokenCookie,
} from './dashboardAuth.js';

describe('dashboardAuth', () => {
	beforeEach(() => {
		vi.stubGlobal('chrome', {
			cookies: {
				getAll: vi.fn(),
			},
			storage: {
				local: {
					get: vi.fn().mockImplementation(async (keys?: string | string[] | null) => {
						if (keys === null) return {};
						return {};
					}),
					set: vi.fn().mockResolvedValue(undefined),
				},
			},
			tabs: {
				query: vi.fn().mockResolvedValue([]),
			},
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('hasDashboardSessionCookie is true for refreshToken', async () => {
		vi.mocked(chrome.cookies.getAll).mockResolvedValue([
			{ name: 'refreshToken', value: 'rt-abc' } as chrome.cookies.Cookie,
		]);

		await expect(hasDashboardSessionCookie('https://localhost:5173')).resolves.toBe(true);
	});

	it('hasDashboardSessionCookie is false with no session cookies', async () => {
		vi.mocked(chrome.cookies.getAll).mockResolvedValue([]);

		await expect(hasDashboardSessionCookie('https://localhost:5173')).resolves.toBe(false);
	});

	it('isDashboardLoggedIn uses refreshToken on www dashboard origin in production', async () => {
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://www.openquok.com') {
				return [{ name: 'refreshToken', value: 'rt-prod' } as chrome.cookies.Cookie];
			}
			return [];
		});

		await expect(isDashboardLoggedIn()).resolves.toEqual({
			loggedIn: true,
			loginUrl: 'https://www.openquok.com/sign-in',
		});
	});

	it('isDashboardLoggedIn uses refreshToken on dashboard origin', async () => {
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://localhost:5173') {
				return [{ name: 'refreshToken', value: 'rt-abc' } as chrome.cookies.Cookie];
			}
			return [];
		});

		await expect(isDashboardLoggedIn()).resolves.toEqual({
			loggedIn: true,
			loginUrl: 'https://localhost:5173/sign-in',
		});
	});

	it('clears a paused origin when session cookies are present again', async () => {
		vi.mocked(chrome.storage.local.get).mockImplementation(async (keys?: string | string[] | null) => {
			if (
				keys === 'openquok:social-paused-origins' ||
				(Array.isArray(keys) && keys.includes('openquok:social-paused-origins'))
			) {
				return { 'openquok:social-paused-origins': ['https://localhost:5173'] };
			}
			return {};
		});
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://localhost:5173') {
				return [{ name: 'refreshToken', value: 'rt-local' } as chrome.cookies.Cookie];
			}
			return [];
		});

		await expect(isDashboardLoggedIn()).resolves.toEqual({
			loggedIn: true,
			loginUrl: 'https://localhost:5173/sign-in',
		});
		expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'openquok:social-paused-origins': [] });
	});

	it('binds session to the cookie origin, not a stale remembered production host', async () => {
		vi.mocked(chrome.storage.local.get).mockImplementation(async (keys?: string | string[] | null) => {
			if (keys === null) return {};
			const keyList = Array.isArray(keys) ? keys : [keys];
			if (keyList.includes('openquok:last-dashboard-origin')) {
				return { 'openquok:last-dashboard-origin': 'https://www.openquok.com' };
			}
			return {};
		});
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://www.openquok.com') return [];
			if (url === 'https://localhost:5173') {
				return [{ name: 'refreshToken', value: 'rt-local' } as chrome.cookies.Cookie];
			}
			return [];
		});

		await expect(isDashboardLoggedIn()).resolves.toEqual({
			loggedIn: true,
			loginUrl: 'https://localhost:5173/sign-in',
		});
	});

	it('readAccessTokenCookie mints via /auth/refresh once', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ data: { accessToken: 'at-minted' } }),
		});
		vi.stubGlobal('fetch', fetchMock);
		vi.mocked(chrome.cookies.getAll).mockResolvedValue([
			{ name: 'refreshToken', value: 'rt-abc' } as chrome.cookies.Cookie,
		]);

		await expect(readAccessTokenCookie('https://localhost:5173')).resolves.toEqual({
			accessToken: 'at-minted',
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/auth/refresh');
	});

	it('readAccessTokenCookie surfaces refresh failures', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => ({ message: 'Internal error' }),
			})
		);
		vi.mocked(chrome.cookies.getAll).mockResolvedValue([
			{ name: 'refreshToken', value: 'rt-abc' } as chrome.cookies.Cookie,
		]);

		await expect(readAccessTokenCookie('https://localhost:5173')).resolves.toEqual({
			error: 'Internal error',
		});
	});
});
