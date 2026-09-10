<script lang="ts">
	import type { IconName } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		src: string | null;
		alt?: string;
		fallbackIcon: IconName;
	};

	let { src, alt = '', fallbackIcon }: Props = $props();

	let failedSrc = $state<string | null>(null);
	let showPicture = $derived(Boolean(src?.trim()) && failedSrc !== src);
</script>

{#if showPicture}
	<img
		src={src!}
		{alt}
		class="block h-full w-full object-cover"
		referrerpolicy="no-referrer"
		onerror={() => {
			failedSrc = src ?? null;
		}}
	/>
{:else}
	<div class="grid h-full w-full place-items-center bg-base-300/80">
		<AbstractIcon name={fallbackIcon} class="size-1/2 max-h-8 max-w-8 opacity-60" width="32" height="32" />
	</div>
{/if}
