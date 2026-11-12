import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	dashboardApiV1Root,
	deriveApiOriginFromDashboard,
	listAuthApiOriginsForDashboard,
	resolveApiOriginForDashboard,
	resolveDashboardPageApiOrigin,
} from './dashboardApiOrigin.js';

describe('resolveDashboardPageApiOrigin', () => {
	it('maps www production dashboard to api host', () => {
		expect(resolveDashboardPageApiOrigin('https://www.openquok.com')).toBe(
			'https://api.openquok.com'
		);
	});

	it('keeps local Vite origin (same-origin /api proxy)', () => {
		expect(resolveDashboardPageApiOrigin('https://localhost:5173')).toBe(
			'https://localhost:5173'
		);
	});
});

describe('dashboardApiV1Root', () => {
	it('appends /api/v1 without double slashes', () => {
		expect(dashboardApiV1Root('https://api.openquok.com/')).toBe(
			'https://api.openquok.com/api/v1'
		);
	});
});

describe('deriveApiOriginFromDashboard', () => {
	it('maps www production dashboard to api host', () => {
		expect(deriveApiOriginFromDashboard('https://www.openquok.com')).toBe(
			'https://api.openquok.com'
		);
	});

	it('returns null for local Vite origin (same-origin /api proxy)', () => {
		expect(deriveApiOriginFromDashboard('https://localhost:5173')).toBeNull();
		expect(deriveApiOriginFromDashboard('http://127.0.0.1:5173')).toBeNull();
	});
});

describe('listAuthApiOriginsForDashboard', () => {
	beforeEach(() => {
		vi.stubGlobal('chrome', {
			storage: {
				local: {
					get: vi.fn().mockResolvedValue({}),
				},
			},
		});
	});

	it('lists dashboard origin before api host for production www', async () => {
		await expect(listAuthApiOriginsForDashboard('https://www.openquok.com')).resolves.toEqual([
			'https://www.openquok.com',
			'https://api.openquok.com',
		]);
	});

	it('lists only the Vite dashboard origin for local dev (API is proxied on /api)', async () => {
		await expect(listAuthApiOriginsForDashboard('https://localhost:5173')).resolves.toEqual([
			'https://localhost:5173',
		]);
	});
});

describe('resolveApiOriginForDashboard', () => {
	beforeEach(() => {
		vi.stubGlobal('chrome', {
			storage: {
				local: {
					get: vi.fn().mockResolvedValue({
						'openquok:last-auth-api-origin': 'https://api.openquok.com',
					}),
				},
			},
		});
	});

	it('ignores stored production api host when dashboard is local Vite', async () => {
		await expect(resolveApiOriginForDashboard('https://localhost:5173')).resolves.toBe(
			'https://localhost:5173'
		);
	});
});
