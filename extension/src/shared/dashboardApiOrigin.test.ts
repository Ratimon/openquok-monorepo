import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	deriveApiOriginFromDashboard,
	listAuthApiOriginsForDashboard,
	resolveApiOriginForDashboard,
} from './dashboardApiOrigin.js';

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

	it('lists only dashboard origin for local Vite', async () => {
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
