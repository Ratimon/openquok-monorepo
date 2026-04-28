<script lang="ts">
	import type { IconName } from '$data/icon';

	import { imageRepository } from '$lib/core';
	import { instagramProfilePictureNeedsAuthenticatedProxy } from '$lib/core/Image.repository.svelte';

	import ImageWithFallback from '$lib/ui/images/ImageWithFallback.svelte';

	type Props = {
		/** Raw profile picture URL from the integration API (may be an Instagram CDN URL). */
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
		if (!/^https?:\/\//i.test(raw)) {
			resolvedSrc = raw;
			return;
		}
		if (!instagramProfilePictureNeedsAuthenticatedProxy(raw)) {
			resolvedSrc = raw;
			return;
		}

		let cancelled = false;
		let blobObjectUrl: string | null = null;

		void (async () => {
			const blob = await imageRepository.fetchExternalProxiedImageBlob(raw);
			if (cancelled) return;
			if (!blob) {
				resolvedSrc = null;
				return;
			}
			const u = URL.createObjectURL(blob);
			if (cancelled) {
				URL.revokeObjectURL(u);
				return;
			}
			blobObjectUrl = u;
			resolvedSrc = u;
		})();

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
