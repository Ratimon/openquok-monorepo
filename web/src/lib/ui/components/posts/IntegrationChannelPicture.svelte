<script lang="ts">
	import type { IconName } from '$data/icons';

	import { imageRepository } from '$lib/core';
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

	$effect(() => {
		const raw = typeof profilePictureUrl === 'string' ? profilePictureUrl.trim() : '';
		if (!raw) {
			resolvedSrc = null;
			return;
		}

		let cancelled = false;
		let blobObjectUrl: string | null = null;

		const setBlobSrc = (blob: Blob) => {
			const u = URL.createObjectURL(blob);
			if (cancelled) {
				URL.revokeObjectURL(u);
				return;
			}
			blobObjectUrl = u;
			resolvedSrc = u;
		};

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
		} else if (!integrationProfilePictureNeedsAuthenticatedProxy(raw)) {
			resolvedSrc = raw;
		} else {
			void (async () => {
				const blob = await imageRepository.fetchExternalProxiedImageBlob(raw);
				if (cancelled) return;
				if (blob) {
					setBlobSrc(blob);
					return;
				}
				// Proxy 403 (WAF or datacenter IP): try the signed URL in the browser with no Referer.
				resolvedSrc = raw;
			})();
		}

		return () => {
			cancelled = true;
			if (blobObjectUrl) {
				URL.revokeObjectURL(blobObjectUrl);
				blobObjectUrl = null;
			}
		};
	});
</script>

<ImageWithFallback src={resolvedSrc} {fallbackIcon} class={className} {alt} />
