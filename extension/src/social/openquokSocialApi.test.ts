import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	createSocialPost,
	datetimeLocalToIso,
	isSocialComposerChannel,
	listSocialIntegrations,
	resolveSocialSession,
} from './openquokSocialApi.js';

function mockVerifyRefreshOk(): void {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: { valid: true } }),
		})
	);
}

describe('openquokSocialApi', () => {
	beforeEach(() => {
		mockVerifyRefreshOk();
		vi.stubGlobal('chrome', {
			cookies: {
				getAll: vi.fn(),
			},
			storage: {
				local: {
					get: vi.fn().mockResolvedValue({}),
					set: vi.fn().mockResolvedValue(undefined),
				},
			},
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('isSocialComposerChannel excludes directory and broken channels', () => {
		expect(
			isSocialComposerChannel({
				id: '1',
				name: 'Threads',
				identifier: 'threads',
				disabled: false,
				inBetweenSteps: false,
				refreshNeeded: false,
			})
		).toBe(true);
		expect(
			isSocialComposerChannel({
				id: '2',
				name: 'PeerPush',
				identifier: 'peerpush-standard-launch',
				disabled: false,
				inBetweenSteps: false,
				refreshNeeded: false,
			})
		).toBe(false);
		expect(
			isSocialComposerChannel({
				id: '3',
				name: 'Skool',
				identifier: 'skool',
				disabled: false,
				inBetweenSteps: false,
				refreshNeeded: true,
			})
		).toBe(false);
	});

	it('resolveSocialSession returns workspace error without showorg', async () => {
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://localhost:5173') {
				return [
					{ name: 'refreshToken', value: 'rt' } as chrome.cookies.Cookie,
					{ name: 'access_token', value: 'at' } as chrome.cookies.Cookie,
				];
			}
			return [];
		});

		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.includes('/auth/verify-refresh')) {
				return { ok: true, json: async () => ({ success: true }) };
			}
			if (url.includes('/users/me')) {
				return { ok: true, json: async () => ({ success: true, data: { email: 'a@b.com' } }) };
			}
			return { ok: false, status: 404, json: async () => ({}) };
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await resolveSocialSession();
		expect(result).toEqual({
			ok: false,
			error: 'Pick a workspace in the OpenQuok dashboard, then refresh this panel.',
		});
	});

	it('listSocialIntegrations filters to social posting providers', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				success: true,
				data: {
					integrations: [
						{
							id: '11111111-1111-4111-8111-111111111111',
							name: 'Threads',
							identifier: 'threads',
							disabled: false,
							inBetweenSteps: false,
							refreshNeeded: false,
						},
						{
							id: '22222222-2222-4222-8222-222222222222',
							name: 'PeerPush',
							identifier: 'peerpush-standard-launch',
							disabled: false,
							inBetweenSteps: false,
							refreshNeeded: false,
						},
					],
				},
			}),
		});
		vi.stubGlobal('fetch', fetchMock);

		const session = {
			dashboardOrigin: 'https://localhost:5173',
			apiOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: '33333333-3333-4333-8333-333333333333',
		};

		const result = await listSocialIntegrations(session);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.channels).toHaveLength(1);
			expect(result.channels[0]?.identifier).toBe('threads');
		}
	});

	it('createSocialPost validates body and channels', async () => {
		const session = {
			dashboardOrigin: 'https://localhost:5173',
			apiOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: '33333333-3333-4333-8333-333333333333',
		};

		await expect(
			createSocialPost(session, {
				body: '',
				integrationIds: ['11111111-1111-4111-8111-111111111111'],
				scheduledAtIso: datetimeLocalToIso('2030-01-01T10:00') ?? '',
				status: 'draft',
			})
		).resolves.toEqual({ ok: false, error: 'Write something to post.' });
	});
});
