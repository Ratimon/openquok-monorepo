import { imageRepository } from '$lib/core/index';

/** In-flight + settled proxy fetches keyed by remote URL (dedupes calendar channel avatars). */
const proxyBlobByUrl = new Map<string, Promise<Blob | null>>();

/** In-flight + settled storage downloads keyed by `integration-profiles/...` path. */
const storageBlobByPath = new Map<string, Promise<Blob | null>>();

/** In-flight + settled provider OAuth avatar fetches keyed by `organizationId:integrationId`. */
const integrationAvatarBlobByKey = new Map<string, Promise<Blob | null>>();

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

export function fetchIntegrationProfileStorageBlobCached(storagePath: string): Promise<Blob | null> {
	const key = storagePath.trim();
	if (!key) return Promise.resolve(null);

	return cacheBlobPromise(storageBlobByPath, key, async () => {
		const result = await imageRepository.getImageBlobByUrl('avatars', key);
		return result?.blob ?? null;
	});
}

export function fetchExternalProxiedImageBlobCached(remoteUrl: string): Promise<Blob | null> {
	const key = remoteUrl.trim();
	if (!key) return Promise.resolve(null);

	return cacheBlobPromise(proxyBlobByUrl, key, () => imageRepository.fetchExternalProxiedImageBlob(key));
}

export function fetchIntegrationAvatarBlobCached(
	organizationId: string,
	integrationId: string
): Promise<Blob | null> {
	const org = organizationId.trim();
	const integration = integrationId.trim();
	if (!org || !integration) return Promise.resolve(null);

	const key = `${org}:${integration}`;
	return cacheBlobPromise(integrationAvatarBlobByKey, key, () =>
		imageRepository.fetchIntegrationAvatarBlob(org, integration)
	);
}
