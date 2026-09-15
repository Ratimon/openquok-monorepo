import { imageRepository } from '$lib/core/index';

/** In-flight + settled proxy fetches keyed by remote URL (dedupes calendar channel avatars). */
const proxyBlobByUrl = new Map<string, Promise<Blob | null>>();

export function fetchExternalProxiedImageBlobCached(remoteUrl: string): Promise<Blob | null> {
	const key = remoteUrl.trim();
	if (!key) return Promise.resolve(null);

	const existing = proxyBlobByUrl.get(key);
	if (existing) return existing;

	const pending = imageRepository.fetchExternalProxiedImageBlob(key);
	proxyBlobByUrl.set(key, pending);
	void pending.then((blob) => {
		if (!blob) proxyBlobByUrl.delete(key);
	});
	return pending;
}
