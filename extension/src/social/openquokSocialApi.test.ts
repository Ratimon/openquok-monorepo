import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	mockCookiesGetAll,
	stubDefaultTestChrome,
	testChrome,
	type TestChrome,
} from '../test/chromeVitestMock.js';
import { uploadComposerMediaMultipart } from './composerMediaUpload.js';
import {
	createSocialPost,
	datetimeLocalToIso,
	isSocialComposerChannel,
	listSocialIntegrations,
	mapIntegrationRow,
	resolveSocialSession,
	uploadComposerMediaFile,
	uploadComposerMediaFromUrl,
} from './openquokSocialApi.js';

type MockXhrInstance = {
	open: ReturnType<typeof vi.fn>;
	setRequestHeader: ReturnType<typeof vi.fn>;
	send: ReturnType<typeof vi.fn>;
	upload: { addEventListener: ReturnType<typeof vi.fn> };
	addEventListener: ReturnType<typeof vi.fn>;
	status: number;
	responseText: string;
};

function installMockXhr(defaults: { status?: number; responseText?: string } = {}): {
	instances: MockXhrInstance[];
} {
	const instances: MockXhrInstance[] = [];
	const XhrCtor = vi.fn(function MockXHR(this: MockXhrInstance) {
		const xhr: MockXhrInstance = {
			open: vi.fn(),
			setRequestHeader: vi.fn(),
			send: vi.fn(),
			upload: { addEventListener: vi.fn() },
			addEventListener: vi.fn(),
			status: defaults.status ?? 200,
			responseText:
				defaults.responseText ??
				JSON.stringify({
					success: true,
					data: { id: 'media-id', filePath: 'org/media.png', publicUrl: 'https://cdn/x.png' },
				}),
		};
		xhr.send = vi.fn(() => {
			for (const call of xhr.addEventListener.mock.calls) {
				if (call[0] !== 'load') continue;
				const handler = call[1];
				if (typeof handler === 'function') handler();
			}
		});
		instances.push(xhr);
		return xhr;
	});
	vi.stubGlobal('XMLHttpRequest', XhrCtor);
	return { instances };
}

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
		stubDefaultTestChrome();
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
		mockCookiesGetAll().mockImplementation(async (details) => {
			if (details.url === 'https://localhost:5173') {
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
		mockCookiesGetAll().mockImplementation(async (details) => {
			if (details.url === 'https://localhost:5173') {
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
		mockCookiesGetAll().mockImplementation(async (details) => {
			if (details.url === 'https://localhost:5173') {
				return [{ name: 'refreshToken', value: 'rt-new' } as chrome.cookies.Cookie];
			}
			return [];
		});
		const chromeBase = testChrome();
		vi.stubGlobal('chrome', {
			...chromeBase,
			storage: {
				local: chromeBase.storage.local,
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
		} satisfies TestChrome);

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
		mockCookiesGetAll().mockImplementation(async (details) => {
			if (details.url === 'https://localhost:5173') {
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
		).resolves.toEqual({ ok: false, error: 'Write something to post or attach media.' });
	});

	it('createSocialPost sends media and allows empty body when media is present', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				success: true,
				data: { postGroup: { id: 'pg-1' } },
			}),
		});
		vi.stubGlobal('fetch', fetchMock);

		const session = {
			dashboardOrigin: 'https://localhost:5173',
			apiOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: '33333333-3333-4333-8333-333333333333',
		};

		const scheduledAtIso = datetimeLocalToIso('2030-01-01T10:00') ?? '';
		const result = await createSocialPost(session, {
			body: '  ',
			integrationIds: ['11111111-1111-4111-8111-111111111111'],
			scheduledAtIso,
			status: 'scheduled',
			media: [{ id: 'mid-1', path: ' workspace/file.jpg ' }],
		});

		expect(result).toEqual({ ok: true, postGroupId: 'pg-1' });
		expect(fetchMock).toHaveBeenCalledWith(
			'https://localhost:5173/api/v1/posts',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					organizationId: session.organizationId,
					body: '',
					integrationIds: ['11111111-1111-4111-8111-111111111111'],
					isGlobal: true,
					scheduledAt: scheduledAtIso,
					repeatInterval: null,
					tagNames: [],
					status: 'scheduled',
					media: [{ id: 'mid-1', path: 'workspace/file.jpg' }],
				}),
			})
		);
	});

	it('uploadComposerMediaFile maps multipart upload response to id and path', async () => {
		const { instances } = installMockXhr();
		const session = {
			dashboardOrigin: 'https://localhost:5173',
			apiOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: '33333333-3333-4333-8333-333333333333',
		};
		const file = new File(['x'], 'photo.png', { type: 'image/png' });

		const result = await uploadComposerMediaFile(session, file, { virtualPath: 'composer' });

		expect(result).toEqual({
			ok: true,
			id: 'media-id',
			path: 'org/media.png',
			publicUrl: 'https://cdn/x.png',
		});
		expect(instances[0]?.open).toHaveBeenCalledWith(
			'POST',
			'https://localhost:5173/api/v1/media/upload'
		);
		expect(instances[0]?.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token');
	});

	it('uploadComposerMediaMultipart surfaces API error bodies', async () => {
		installMockXhr({
			status: 400,
			responseText: JSON.stringify({ success: false, message: 'File too large' }),
		});

		const result = await uploadComposerMediaMultipart(
			'https://localhost:5173',
			'token',
			'org-id',
			new File(['x'], 'big.mp4', { type: 'video/mp4' })
		);

		expect(result).toEqual({ ok: false, error: 'File too large' });
	});

	it('uploadComposerMediaFromUrl rejects non-http URLs and failed fetch', async () => {
		const session = {
			dashboardOrigin: 'https://localhost:5173',
			apiOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: '33333333-3333-4333-8333-333333333333',
		};

		await expect(uploadComposerMediaFromUrl(session, 'ftp://example.com/x.png')).resolves.toEqual({
			ok: false,
			error: 'Only http(s) image URLs can be attached.',
		});

		const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404, blob: async () => new Blob() });
		vi.stubGlobal('fetch', fetchMock);

		await expect(
			uploadComposerMediaFromUrl(session, 'https://example.com/missing.png')
		).resolves.toEqual({
			ok: false,
			error: 'Could not download the image (404).',
		});
	});

	it('uploadComposerMediaFromUrl downloads and uploads via session media API', async () => {
		installMockXhr();
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			headers: { get: () => 'image/jpeg' },
			blob: async () => new Blob(['img'], { type: 'image/jpeg' }),
		});
		vi.stubGlobal('fetch', fetchMock);

		const session = {
			dashboardOrigin: 'https://localhost:5173',
			apiOrigin: 'https://localhost:5173',
			accessToken: 'token',
			organizationId: '33333333-3333-4333-8333-333333333333',
		};

		const result = await uploadComposerMediaFromUrl(session, 'https://example.com/photo.jpg');

		expect(fetchMock).toHaveBeenCalledWith('https://example.com/photo.jpg');
		expect(result).toMatchObject({ ok: true, id: 'media-id', path: 'org/media.png' });
	});
});
