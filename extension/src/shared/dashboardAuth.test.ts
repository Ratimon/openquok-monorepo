import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { hasDashboardSessionCookie, isDashboardLoggedIn } from './dashboardAuth.js';

function mockVerifyRefreshOk(): void {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: { valid: true } }),
		})
	);
}

describe('dashboardAuth', () => {
	beforeEach(() => {
		mockVerifyRefreshOk();
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

	it('falls back to /auth/refresh when verify-refresh is missing on all hosts', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
				const url = String(input);
				if (url.includes('/auth/verify-refresh')) {
					return { ok: false, status: 404, json: async () => ({}) };
				}
				if (url.includes('/auth/refresh')) {
					return {
						ok: true,
						status: 200,
						json: async () => ({ data: { accessToken: 'at-fallback' } }),
					};
				}
				return { ok: false, status: 404, json: async () => ({}) };
			})
		);
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

	it('falls back to dashboard API origin when api host returns 404 for verify-refresh', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
				const url = String(input);
				if (url.includes('api.openquok.com') && url.includes('/auth/verify-refresh')) {
					return { ok: false, status: 404, json: async () => ({}) };
				}
				if (url.includes('www.openquok.com') && url.includes('/auth/verify-refresh')) {
					return { ok: true, status: 200, json: async () => ({ success: true, data: { valid: true } }) };
				}
				return { ok: false, status: 404, json: async () => ({}) };
			})
		);
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

	it('isDashboardLoggedIn is false when verify-refresh rejects a stale cookie', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				json: async () => ({ success: false }),
			})
		);
		vi.mocked(chrome.cookies.getAll).mockResolvedValue([
			{ name: 'refreshToken', value: 'revoked' } as chrome.cookies.Cookie,
		]);

		await expect(isDashboardLoggedIn()).resolves.toMatchObject({ loggedIn: false });
	});
});
