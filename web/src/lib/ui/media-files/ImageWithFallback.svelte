<script lang="ts">
	import type { IconName } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		src: string | null;
		alt?: string;
		/** Tailwind / layout classes for the image (object-cover, rounded, size). */
		class?: string;
		fallbackIcon: IconName;
	};

	let { src, alt = '', class: className = '', fallbackIcon }: Props = $props();

	let failed = $state(false);
	let showPicture = $derived(Boolean(src?.trim()) && !failed);
</script>

{#if showPicture}
	<img
		src={src!}
		{alt}
		class={className}
		onerror={() => {
			failed = true;
		}}
	/>
{:else}
	<div class="grid h-full w-full place-items-center bg-base-300/80 {className}">
		<AbstractIcon name={fallbackIcon} class="h-1/2 w-1/2 max-h-8 max-w-8 opacity-60" width="32" height="32" />
	</div>
{/if}
