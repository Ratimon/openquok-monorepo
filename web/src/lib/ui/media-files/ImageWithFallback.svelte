<script lang="ts">
	import type { IconName } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		src: string | null;
		alt?: string;
		fallbackIcon: IconName;
		/** Fires when the current `src` fails to load (before switching to the fallback icon). */
		onImageError?: (failedUrl: string) => void;
	};

	let { src, alt = '', fallbackIcon, onImageError }: Props = $props();

	let failedSrc = $state<string | null>(null);
	let showPicture = $derived(Boolean(src?.trim()) && failedSrc !== src);

	$effect(() => {
		void src;
		failedSrc = null;
	});
</script>

{#if showPicture}
	<img
		src={src!}
		{alt}
		class="block h-full w-full object-cover"
		referrerpolicy="no-referrer"
		onerror={() => {
			const failed = src ?? '';
			failedSrc = failed;
			if (failed) onImageError?.(failed);
		}}
	/>
{:else}
	<div class="grid h-full w-full place-items-center bg-base-300/80">
		<AbstractIcon name={fallbackIcon} class="size-1/2 max-h-8 max-w-8 opacity-60" width="32" height="32" />
	</div>
{/if}
