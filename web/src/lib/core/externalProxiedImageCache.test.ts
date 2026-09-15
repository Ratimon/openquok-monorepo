import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getImageBlobByUrl, fetchExternalProxiedImageBlob } = vi.hoisted(() => ({
	getImageBlobByUrl: vi.fn(),
	fetchExternalProxiedImageBlob: vi.fn()
}));

vi.mock('$lib/core/index', () => ({
	imageRepository: {
		getImageBlobByUrl,
		fetchExternalProxiedImageBlob
	}
}));

import {
	fetchExternalProxiedImageBlobCached,
	fetchIntegrationProfileStorageBlobCached
} from '$lib/core/externalProxiedImageCache';

describe('integration profile image cache', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('dedupes storage path downloads', async () => {
		const blob = new Blob(['x']);
		getImageBlobByUrl.mockResolvedValue({ blob });

		const path = 'integration-profiles/org/a.jpg';
		const [a, b] = await Promise.all([
			fetchIntegrationProfileStorageBlobCached(path),
			fetchIntegrationProfileStorageBlobCached(path)
		]);

		expect(a).toBe(blob);
		expect(b).toBe(blob);
		expect(getImageBlobByUrl).toHaveBeenCalledTimes(1);
	});

	it('dedupes external proxy fetches', async () => {
		const blob = new Blob(['x']);
		fetchExternalProxiedImageBlob.mockResolvedValue(blob);

		const url = 'https://media.licdn.com/dms/image/v2/abc.jpg';
		const [a, b] = await Promise.all([
			fetchExternalProxiedImageBlobCached(url),
			fetchExternalProxiedImageBlobCached(url)
		]);

		expect(a).toBe(blob);
		expect(b).toBe(blob);
		expect(fetchExternalProxiedImageBlob).toHaveBeenCalledTimes(1);
	});

	it('drops failed storage downloads from cache so retries can refetch', async () => {
		getImageBlobByUrl.mockResolvedValue(null);

		const path = 'integration-profiles/org/missing.jpg';
		expect(await fetchIntegrationProfileStorageBlobCached(path)).toBeNull();
		expect(await fetchIntegrationProfileStorageBlobCached(path)).toBeNull();
		expect(getImageBlobByUrl).toHaveBeenCalledTimes(2);
	});
});
