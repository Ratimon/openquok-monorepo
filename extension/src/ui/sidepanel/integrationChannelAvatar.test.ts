import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SocialIntegrationChannel, SocialSessionContext } from '../../social/openquokSocialApi.js';

import {
	createAvatarObjectUrl,
	integrationProfilePictureNeedsAuthenticatedProxy,
	isIntegrationProfileStoragePath,
	resetIntegrationChannelAvatarCachesForTests,
	resolveIntegrationChannelAvatarSrc,
	retryIntegrationChannelAvatarSrc,
	revokeAvatarObjectUrls,
} from './integrationChannelAvatar.js';

const session: SocialSessionContext = {
	dashboardOrigin: 'https://localhost:5173',
	apiOrigin: 'https://localhost:5173',
	accessToken: 'test-token',
	organizationId: 'org-1',
};

function channel(overrides: Partial<SocialIntegrationChannel> = {}): SocialIntegrationChannel {
	return {
		id: 'int-1',
		name: 'Test Channel',
		identifier: 'facebook',
		picture: null,
		disabled: false,
		inBetweenSteps: false,
		refreshNeeded: false,
		unschedulableReason: null,
		...overrides,
	};
}

describe('integrationChannelAvatar helpers', () => {
	it('detects integration profile storage paths', () => {
		expect(isIntegrationProfileStoragePath('integration-profiles/org/u.webp')).toBe(true);
		expect(isIntegrationProfileStoragePath('https://cdn.example/x.jpg')).toBe(false);
	});

	it('flags Instagram and LinkedIn CDN hosts for authenticated proxy', () => {
		expect(
			integrationProfilePictureNeedsAuthenticatedProxy('https://scontent.cdninstagram.com/v/x.jpg')
		).toBe(true);
		expect(
			integrationProfilePictureNeedsAuthenticatedProxy('https://media.licdn.com/dms/image/x.jpg')
		).toBe(true);
		expect(integrationProfilePictureNeedsAuthenticatedProxy('https://graph.facebook.com/picture')).toBe(
			false
		);
	});
});

describe('resolveIntegrationChannelAvatarSrc', () => {
	beforeEach(() => {
		resetIntegrationChannelAvatarCachesForTests();
		vi.stubGlobal('URL', globalThis.URL);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		resetIntegrationChannelAvatarCachesForTests();
	});

	it('returns null when picture is empty', async () => {
		await expect(resolveIntegrationChannelAvatarSrc(session, channel())).resolves.toBeNull();
	});

	it('returns absolute URLs unchanged', async () => {
		const url = 'https://graph.facebook.com/123/picture?type=large';
		await expect(
			resolveIntegrationChannelAvatarSrc(session, channel({ picture: url }))
		).resolves.toBe(url);
	});

	it('downloads storage paths with Bearer auth and returns a blob URL', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			blob: async () => new Blob(['x'], { type: 'image/png' }),
		});
		vi.stubGlobal('fetch', fetchMock);

		const storagePath = 'integration-profiles/org-1/int-1.png';
		const src = await resolveIntegrationChannelAvatarSrc(session, channel({ picture: storagePath }));

		expect(src).toMatch(/^blob:/);
		expect(fetchMock).toHaveBeenCalledOnce();
		const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(calledUrl).toContain('/api/v1/image/download?');
		expect(calledUrl).toContain('databaseName=avatars');
		expect(calledUrl).toContain(encodeURIComponent(storagePath));
		expect(init?.headers).toMatchObject({ Authorization: 'Bearer test-token' });
	});
});

describe('retryIntegrationChannelAvatarSrc', () => {
	beforeEach(() => {
		resetIntegrationChannelAvatarCachesForTests();
	});

	afterEach(() => {
		resetIntegrationChannelAvatarCachesForTests();
	});

	it('tries integration-avatar then external-proxy for LinkedIn CDN failures', async () => {
		const cdnUrl = 'https://media.licdn.com/dms/image/profile.jpg';
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				blob: async () => new Blob(['oauth'], { type: 'image/jpeg' }),
			})
			.mockResolvedValueOnce({
				ok: true,
				blob: async () => new Blob(['proxy'], { type: 'image/jpeg' }),
			});
		vi.stubGlobal('fetch', fetchMock);

		const src = await retryIntegrationChannelAvatarSrc(
			session,
			channel({ picture: cdnUrl }),
			cdnUrl
		);

		expect(src).toMatch(/^blob:/);
		expect(fetchMock).toHaveBeenCalledOnce();
		const [oauthUrl] = fetchMock.mock.calls[0] as [string];
		expect(oauthUrl).toContain('/api/v1/image/integration-avatar?');
		expect(oauthUrl).toContain('organizationId=org-1');
		expect(oauthUrl).toContain('integrationId=int-1');
	});

	it('does not retry for Facebook Graph picture URLs', async () => {
		const graphUrl = 'https://graph.facebook.com/v1/123/picture';
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		await expect(
			retryIntegrationChannelAvatarSrc(session, channel({ picture: graphUrl }), graphUrl)
		).resolves.toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('revokeAvatarObjectUrls', () => {
	it('revokes tracked blob URLs', () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const blob = new Blob(['x'], { type: 'image/png' });
		const url = createAvatarObjectUrl(blob);
		revokeAvatarObjectUrls();
		expect(revoke).toHaveBeenCalledWith(url);
		revoke.mockRestore();
	});
});
