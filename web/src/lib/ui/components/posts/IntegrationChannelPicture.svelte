<script lang="ts">
	import type { IconName } from '$data/icons';

	import {
		fetchExternalProxiedImageBlobCached,
		fetchIntegrationAvatarBlobCached,
		fetchIntegrationProfileStorageBlobCached
	} from '$lib/core/externalProxiedImageCache';
	import {
		integrationProfilePictureNeedsAuthenticatedProxy,
		isIntegrationProfileStoragePath
	} from '$lib/core/Image.repository.svelte';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';

	type Props = {
		/** Raw profile picture URL from the integration API (storage key, Graph `/picture`, or CDN URL). */
		profilePictureUrl: string | null | undefined;
		/** Connected channel id — enables provider OAuth avatar fallback for expired CDN URLs. */
		integrationId?: string | null;
		fallbackIcon: IconName;
		alt?: string;
		class?: string;
	};

	let {
		profilePictureUrl,
		integrationId = null,
		fallbackIcon,
		alt = '',
		class: className = ''
	}: Props = $props();

	const organizationId = $derived(
		integrationId?.trim() ? workspaceSettingsPresenter.currentWorkspaceId : null
	);

	let resolvedSrc = $state<string | null>(null);
	let proxyAttemptedForUrl = $state<string | null>(null);
	/** Plain let — must not be $state or $effect re-runs when we create a blob URL and revokes it. */
	let blobObjectUrl: string | null = null;

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
			resolvedSrc = null;
			void (async () => {
				const blob = await fetchIntegrationProfileStorageBlobCached(raw);
				if (cancelled) return;
				if (!blob) {
					resolvedSrc = null;
					return;
				}
				setBlobSrc(blob);
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
		// Revoked or stale blob URLs must not re-trigger proxy / storage fetches.
		if (
			!raw ||
			failedUrl.startsWith('blob:') ||
			failedUrl !== raw ||
			!integrationProfilePictureNeedsAuthenticatedProxy(raw)
		) {
			resolvedSrc = null;
			return;
		}
		if (proxyAttemptedForUrl === raw) {
			resolvedSrc = null;
			return;
		}
		proxyAttemptedForUrl = raw;

		void (async () => {
			const orgId = organizationId?.trim();
			const channelId = integrationId?.trim();
			if (orgId && channelId) {
				const oauthBlob = await fetchIntegrationAvatarBlobCached(orgId, channelId);
				if (proxyAttemptedForUrl !== raw) return;
				if (oauthBlob) {
					setBlobSrc(oauthBlob);
					return;
				}
			}

			const proxyBlob = await fetchExternalProxiedImageBlobCached(raw);
			if (proxyAttemptedForUrl !== raw) return;
			if (proxyBlob) {
				setBlobSrc(proxyBlob);
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
