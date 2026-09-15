<script lang="ts">
	import type { IconName } from '$data/icons';

	import { imageRepository } from '$lib/core';
	import { fetchExternalProxiedImageBlobCached } from '$lib/core/externalProxiedImageCache';
	import {
		integrationProfilePictureNeedsAuthenticatedProxy,
		isIntegrationProfileStoragePath
	} from '$lib/core/Image.repository.svelte';

	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';

	type Props = {
		/** Raw profile picture URL from the integration API (storage key, Graph `/picture`, or CDN URL). */
		profilePictureUrl: string | null | undefined;
		fallbackIcon: IconName;
		alt?: string;
		class?: string;
	};

	let { profilePictureUrl, fallbackIcon, alt = '', class: className = '' }: Props = $props();

	let resolvedSrc = $state<string | null>(null);
	let proxyAttemptedForUrl = $state<string | null>(null);
	let blobObjectUrl = $state<string | null>(null);

	function revokeBlobUrl(): void {
		if (blobObjectUrl) {
			URL.revokeObjectURL(blobObjectUrl);
			blobObjectUrl = null;
		}
	}

	function setBlobSrc(blob: Blob): void {
		revokeBlobUrl();
		const u = URL.createObjectURL(blob);
		blobObjectUrl = u;
		resolvedSrc = u;
	}

	$effect(() => {
		const raw = typeof profilePictureUrl === 'string' ? profilePictureUrl.trim() : '';
		proxyAttemptedForUrl = null;
		revokeBlobUrl();

		if (!raw) {
			resolvedSrc = null;
			return;
		}

		let cancelled = false;

		if (isIntegrationProfileStoragePath(raw)) {
			void (async () => {
				const result = await imageRepository.getImageBlobByUrl('avatars', raw);
				if (cancelled) return;
				if (!result?.blob) {
					resolvedSrc = null;
					return;
				}
				setBlobSrc(result.blob);
			})();
		} else if (!/^https?:\/\//i.test(raw)) {
			resolvedSrc = raw;
		} else {
			// Instagram / LinkedIn CDNs: browser first (`referrerpolicy="no-referrer"` on the img).
			// Server proxy often 403s from datacenter IPs; only try after a direct load fails.
			resolvedSrc = raw;
		}

		return () => {
			cancelled = true;
			revokeBlobUrl();
		};
	});

	function handleImageError(failedUrl: string) {
		const raw = typeof profilePictureUrl === 'string' ? profilePictureUrl.trim() : '';
		if (!raw || failedUrl !== raw || !integrationProfilePictureNeedsAuthenticatedProxy(raw)) {
			resolvedSrc = null;
			return;
		}
		if (proxyAttemptedForUrl === raw) {
			resolvedSrc = null;
			return;
		}
		proxyAttemptedForUrl = raw;

		void (async () => {
			const blob = await fetchExternalProxiedImageBlobCached(raw);
			if (proxyAttemptedForUrl !== raw) return;
			if (blob) {
				setBlobSrc(blob);
				return;
			}
			resolvedSrc = null;
		})();
	}
</script>

<!-- Fixed-size shell: prevents flex min-width:auto from expanding on wide logos/images. -->
<div class="inline-flex flex-none overflow-hidden {className}">
	<ImageWithFallback src={resolvedSrc} {fallbackIcon} {alt} onImageError={handleImageError} />
</div>
