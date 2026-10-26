import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	createSocialPost,
	datetimeLocalToIso,
	isSocialComposerChannel,
	listSocialIntegrations,
	mapIntegrationRow,
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

	const schedulableThreadsChannel = {
		id: '1',
		name: 'Threads',
		identifier: 'threads',
		picture: null,
		group: null,
		disabled: false,
		inBetweenSteps: false,
		refreshNeeded: false,
		unschedulableReason: null,
	};

	it('isSocialComposerChannel excludes directory and broken channels', () => {
		expect(isSocialComposerChannel(schedulableThreadsChannel)).toBe(true);
		expect(
			isSocialComposerChannel({
				...schedulableThreadsChannel,
				id: '2',
				name: 'PeerPush',
				identifier: 'peerpush-standard-launch',
			})
		).toBe(false);
		expect(
			isSocialComposerChannel({
				...schedulableThreadsChannel,
				id: '3',
				name: 'Skool',
				identifier: 'skool',
				refreshNeeded: true,
				unschedulableReason: 'Reconnect this channel first.',
			})
		).toBe(false);
	});

	it('mapIntegrationRow maps picture and unschedulableReason from list rows', () => {
		expect(
			mapIntegrationRow({
				id: 'ch-1',
				identifier: 'threads',
				name: 'My Threads',
				picture: ' integration-profiles/abc.png ',
				disabled: false,
				inBetweenSteps: false,
				refreshNeeded: false,
			})
		).toEqual({
			id: 'ch-1',
			name: 'My Threads',
			identifier: 'threads',
			picture: 'integration-profiles/abc.png',
			group: null,
			disabled: false,
			inBetweenSteps: false,
			refreshNeeded: false,
			unschedulableReason: null,
		});

		expect(
			mapIntegrationRow({
				id: 'ch-g',
				identifier: 'facebook',
				customer: { id: 'grp-1', name: 'Client A' },
			})
		).toMatchObject({
			group: { id: 'grp-1', name: 'Client A' },
		});

		expect(
			mapIntegrationRow({
				id: 'ch-2',
				identifier: 'skool',
				picture: '   ',
				refreshNeeded: true,
			})
		).toMatchObject({
			picture: null,
			refreshNeeded: true,
			unschedulableReason: 'Reconnect this channel first.',
		});

		expect(
			mapIntegrationRow({
				id: 'ch-3',
				identifier: 'facebook',
				inBetweenSteps: true,
			})
		).toMatchObject({
			unschedulableReason: 'Finish connecting this channel first.',
		});

		expect(
			mapIntegrationRow({
				id: 'ch-4',
				identifier: 'instagram',
				disabled: true,
			})
		).toMatchObject({
			unschedulableReason: 'This channel is disabled.',
		});

		expect(mapIntegrationRow({ identifier: 'threads' })).toBeNull();
	});

	it('resolveSocialSession does not treat /users/me profile id as workspace id', async () => {
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://localhost:5173') {
				return [{ name: 'access_token', value: 'at' } as chrome.cookies.Cookie];
			}
			return [];
		});

		const userId = '2f5821aa-79ea-4486-b45e-2271b99bf012';
		const orgId = '7339963e-e508-42ea-9fd0-74acfb7dad30';

		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.includes('/users/me')) {
				return {
					ok: true,
					json: async () => ({
						success: true,
						data: { id: userId, email: 'a@b.com' },
					}),
				};
			}
			if (url.includes('/users/organizations')) {
				return {
					ok: true,
					json: async () => ({
						success: true,
						data: [{ id: orgId, name: 'Main' }],
					}),
				};
			}
			return { ok: false, status: 404, json: async () => ({}) };
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await resolveSocialSession();
		expect(result).toMatchObject({ organizationId: orgId, accessToken: 'at' });
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
			if (url.includes('/users/organizations')) {
				return { ok: true, json: async () => ({ success: true, data: [] }) };
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
			error: 'No workspace found. Create or join a workspace in the dashboard, then refresh this panel.',
		});
	});

	it('resolveSocialSession mints from refresh cookie instead of a stale bridge token', async () => {
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://localhost:5173') {
				return [{ name: 'refreshToken', value: 'rt-new' } as chrome.cookies.Cookie];
			}
			return [];
		});
		vi.stubGlobal('chrome', {
			...chrome,
			storage: {
				local: { get: vi.fn().mockResolvedValue({}), set: vi.fn().mockResolvedValue(undefined) },
				session: {
					get: vi.fn().mockResolvedValue({
						'openquok:dashboard-bridge-sessions': [
							{
								dashboardOrigin: 'https://localhost:5173',
								accessToken: 'stale-bridge-token',
								organizationId: 'org-bridge',
								updatedAt: Date.now(),
							},
						],
					}),
					set: vi.fn().mockResolvedValue(undefined),
				},
			},
		});

		const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
			if (url.includes('/auth/refresh')) {
				return {
					ok: true,
					json: async () => ({ data: { accessToken: 'fresh-minted' } }),
				};
			}
			if (url.includes('/users/organizations')) {
				expect(init?.headers).toMatchObject({ Authorization: 'Bearer fresh-minted' });
				return {
					ok: true,
					json: async () => ({
						success: true,
						data: [{ id: 'org-from-list', name: 'Main' }],
					}),
				};
			}
			return { ok: false, status: 404, json: async () => ({}) };
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await resolveSocialSession();
		expect(result).toMatchObject({ accessToken: 'fresh-minted', organizationId: 'org-from-list' });
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/auth/refresh'),
			expect.anything()
		);
	});

	it('resolveSocialSession uses first workspace from /users/organizations', async () => {
		vi.mocked(chrome.cookies.getAll).mockImplementation(async ({ url }) => {
			if (url === 'https://localhost:5173') {
				return [{ name: 'access_token', value: 'at' } as chrome.cookies.Cookie];
			}
			return [];
		});

		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.includes('/users/me')) {
				return { ok: true, json: async () => ({ success: true, data: { email: 'a@b.com' } }) };
			}
			if (url.includes('/users/organizations')) {
				return {
					ok: true,
					json: async () => ({
						success: true,
						data: [{ id: 'org-first', name: 'Main' }],
					}),
				};
			}
			return { ok: false, status: 404, json: async () => ({}) };
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await resolveSocialSession();
		expect(result).toMatchObject({
			organizationId: 'org-first',
			accessToken: 'at',
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
							picture: 'https://graph.facebook.com/me/picture',
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
			expect(result.channels[0]).toMatchObject({
				identifier: 'threads',
				picture: 'https://graph.facebook.com/me/picture',
				unschedulableReason: null,
			});
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
