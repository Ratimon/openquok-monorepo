<script lang="ts">
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';
	import { DownloadStatus, DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';
	import { imageRepository } from '$lib/core/index';
	import * as Avatar from '$lib/ui/components/avatar';
	import { cn } from '$lib/ui/helpers/common';
	import { untrack } from 'svelte';

	type Props = {
		url: string | null | undefined;
		size: number;
		class?: string;
		alt?: string;
		/**
		 * When true, render only `Avatar.Image` for use inside a parent `Avatar.Root`
		 * (e.g. with `Avatar.Fallback` as a sibling). Default renders a full avatar.
		 */
		imageOnly?: boolean;
	};

	let {
		url,
		size,
		class: className = '',
		alt = 'User avatar',
		imageOnly = false
	}: Props = $props();

	const imageItemPresenter = new DownloadImagePresenter(imageRepository);

	/** Prevents re-running `loadImage` for the same storage path when presenter state updates (avoids 500 retry loops after delete). */
	let lastFetchedPath: string | null = null;

	function revokeCurrentBlobIfAny() {
		const u = imageItemPresenter.imageVm.imageUrl;
		if (u?.startsWith('blob:')) URL.revokeObjectURL(u);
	}

	let trimmedUrl = $derived(typeof url === 'string' ? url.trim() : '');
	let isAbsolute = $derived(/^https?:\/\//i.test(trimmedUrl));

	let status = $derived(imageItemPresenter.imageVm.status);
	let blobUrl = $derived(imageItemPresenter.imageVm.imageUrl);

	let avatarSrc = $derived.by(() => {
		if (!trimmedUrl) return '/placeholder.png';
		if (isAbsolute) return trimmedUrl;
		if (blobUrl) return blobUrl;
		return '/placeholder.png';
	});

	let isLoading = $derived(
		!isAbsolute && Boolean(trimmedUrl) && status === DownloadStatus.LOADING
	);

	$effect(() => {
		const path = trimmedUrl;
		const absolute = isAbsolute;
		if (!path || absolute) {
			if (!path) {
				lastFetchedPath = null;
				// Read/write imageVm must not be tracked here or the effect re-runs (effect_update_depth_exceeded).
				untrack(() => {
					revokeCurrentBlobIfAny();
					imageItemPresenter.imageVm = { imageUrl: null, status: DownloadStatus.UNKNOWN };
				});
			}
			return;
		}
		if (path === lastFetchedPath) return;
		lastFetchedPath = path;
		untrack(() => {
			void imageItemPresenter.loadImage('avatars' as DatabaseName, path);
		});
	});
</script>

{#if imageOnly}
	<Avatar.Image
		src={avatarSrc}
		{alt}
		class={cn(isLoading && 'animate-pulse', 'object-cover', className)}
	/>
{:else}
	<Avatar.Root
		class={cn(isLoading && 'animate-pulse', className)}
		style={`width: ${size}px; height: ${size}px`}
	>
		<Avatar.Image src={avatarSrc} {alt} class="object-cover" />
		<Avatar.Fallback />
	</Avatar.Root>
{/if}
