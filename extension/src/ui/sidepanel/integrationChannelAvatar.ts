import type {
	SocialIntegrationChannel,
	SocialSessionContext,
} from '../../social/openquokSocialApi.js';

/** Mirrored integration avatars in the `avatars` bucket (`integration-profiles/...`). */
export const INTEGRATION_PROFILE_STORAGE_PREFIX = 'integration-profiles';

const AVATARS_DATABASE_NAME = 'avatars';

const proxyBlobByUrl = new Map<string, Promise<Blob | null>>();
const storageBlobByPath = new Map<string, Promise<Blob | null>>();
const integrationAvatarBlobByKey = new Map<string, Promise<Blob | null>>();

/** Blob URLs created for channel avatars — revoked via {@link revokeAvatarObjectUrls}. */
const trackedObjectUrls = new Set<string>();

/** Per `integrationId:rawPicture` — avoid duplicate proxy/oauth attempts after img error. */
const proxyAttemptedKeys = new Set<string>();

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

export function isIntegrationProfileStoragePath(url: string | null | undefined): boolean {
	return typeof url === 'string' && url.startsWith(`${INTEGRATION_PROFILE_STORAGE_PREFIX}/`);
}

function hostnameIsOrUnder(hostname: string, root: string): boolean {
	return hostname === root || hostname.endsWith(`.${root}`);
}

/**
 * Instagram and LinkedIn CDN avatars often 403 when hotlinked from the browser.
 * Fetch them via authenticated API proxy after a direct load fails.
 *
 * Keep host matching in sync with backend allowlist for external image hosts.
 */
export function integrationProfilePictureNeedsAuthenticatedProxy(url: string): boolean {
	try {
		const h = new URL(url).hostname.toLowerCase();
		return hostnameIsOrUnder(h, 'cdninstagram.com') || hostnameIsOrUnder(h, 'licdn.com');
	} catch {
		return false;
	}
}

function cacheBlobPromise(
	cache: Map<string, Promise<Blob | null>>,
	key: string,
	fetch: () => Promise<Blob | null>
): Promise<Blob | null> {
	const existing = cache.get(key);
	if (existing) return existing;

	const pending = fetch();
	cache.set(key, pending);
	void pending.then((blob) => {
		if (!blob) cache.delete(key);
	});
	return pending;
}

async function authorizedBlobGet(
	session: SocialSessionContext,
	path: string,
	query?: Record<string, string>
): Promise<Blob | null> {
	const url = new URL(`${apiRoot(session.apiOrigin)}${path}`);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			url.searchParams.set(key, value);
		}
	}
	try {
		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
				Accept: '*/*',
			},
		});
		if (!response.ok) return null;
		return await response.blob();
	} catch {
		return null;
	}
}

async function authorizedBlobPost(
	session: SocialSessionContext,
	path: string,
	body: Record<string, unknown>
): Promise<Blob | null> {
	try {
		const response = await fetch(`${apiRoot(session.apiOrigin)}${path}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		if (!response.ok) return null;
		return await response.blob();
	} catch {
		return null;
	}
}

function fetchIntegrationProfileStorageBlobCached(
	session: SocialSessionContext,
	storagePath: string
): Promise<Blob | null> {
	const key = storagePath.trim();
	if (!key) return Promise.resolve(null);

	return cacheBlobPromise(storageBlobByPath, key, () =>
		authorizedBlobGet(session, '/image/download', {
			databaseName: AVATARS_DATABASE_NAME,
			imageUrl: key,
		})
	);
}

function fetchExternalProxiedImageBlobCached(
	session: SocialSessionContext,
	remoteUrl: string
): Promise<Blob | null> {
	const key = remoteUrl.trim();
	if (!key) return Promise.resolve(null);

	return cacheBlobPromise(proxyBlobByUrl, key, () =>
		authorizedBlobPost(session, '/image/external-proxy', { url: key })
	);
}

function fetchIntegrationAvatarBlobCached(
	session: SocialSessionContext,
	organizationId: string,
	integrationId: string
): Promise<Blob | null> {
	const org = organizationId.trim();
	const integration = integrationId.trim();
	if (!org || !integration) return Promise.resolve(null);

	const key = `${org}:${integration}`;
	return cacheBlobPromise(integrationAvatarBlobByKey, key, () =>
		authorizedBlobGet(session, '/image/integration-avatar', {
			organizationId: org,
			integrationId: integration,
		})
	);
}

export function createAvatarObjectUrl(blob: Blob): string {
	const url = URL.createObjectURL(blob);
	trackedObjectUrls.add(url);
	return url;
}

/** Revoke every blob URL created for channel avatars (call before remounting the picker). */
export function revokeAvatarObjectUrls(): void {
	for (const url of trackedObjectUrls) {
		URL.revokeObjectURL(url);
	}
	trackedObjectUrls.clear();
}

function rawPictureFromChannel(channel: SocialIntegrationChannel): string {
	const picture = channel.picture;
	return typeof picture === 'string' ? picture.trim() : '';
}

/**
 * Initial avatar `src` for a channel chip — storage paths become authenticated blob URLs;
 * absolute http(s) URLs are returned for direct browser load (with `referrerPolicy` on the img).
 */
export async function resolveIntegrationChannelAvatarSrc(
	session: SocialSessionContext,
	channel: SocialIntegrationChannel
): Promise<string | null> {
	const raw = rawPictureFromChannel(channel);
	if (!raw) return null;

	if (isIntegrationProfileStoragePath(raw)) {
		const blob = await fetchIntegrationProfileStorageBlobCached(session, raw);
		if (!blob) return null;
		return createAvatarObjectUrl(blob);
	}

	if (!/^https?:\/\//i.test(raw)) {
		return raw;
	}

	return raw;
}

/**
 * After `<img>` error on a hotlinked CDN URL, try provider OAuth avatar then external proxy.
 * Mirrors dashboard `IntegrationChannelPicture` fallback order.
 */
export async function retryIntegrationChannelAvatarSrc(
	session: SocialSessionContext,
	channel: SocialIntegrationChannel,
	failedUrl: string
): Promise<string | null> {
	const raw = rawPictureFromChannel(channel);
	if (
		!raw ||
		failedUrl.startsWith('blob:') ||
		failedUrl !== raw ||
		!integrationProfilePictureNeedsAuthenticatedProxy(raw)
	) {
		return null;
	}

	const attemptKey = `${channel.id}:${raw}`;
	if (proxyAttemptedKeys.has(attemptKey)) return null;
	proxyAttemptedKeys.add(attemptKey);

	const orgId = session.organizationId.trim();
	const channelId = channel.id.trim();
	if (orgId && channelId) {
		const oauthBlob = await fetchIntegrationAvatarBlobCached(session, orgId, channelId);
		if (oauthBlob) return createAvatarObjectUrl(oauthBlob);
	}

	const proxyBlob = await fetchExternalProxiedImageBlobCached(session, raw);
	if (proxyBlob) return createAvatarObjectUrl(proxyBlob);

	return null;
}

/** Test-only: reset in-memory caches between cases. */
export function resetIntegrationChannelAvatarCachesForTests(): void {
	proxyBlobByUrl.clear();
	storageBlobByPath.clear();
	integrationAvatarBlobByKey.clear();
	proxyAttemptedKeys.clear();
	revokeAvatarObjectUrls();
}
