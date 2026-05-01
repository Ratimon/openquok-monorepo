<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		/** Pencil badge surface; match the parent control background so the chip does not read as a separate patch. */
		badgeSurfaceClass?: string;
	};

	let {
		badgeSurfaceClass = 'rounded-sm bg-base-100/95 shadow-sm ring-1 ring-base-300/80'
	}: Props = $props();
</script>

<span class="relative inline-flex size-6 items-center justify-center">
	<AbstractIcon name={icons.Image.name} class="size-6" width="24" height="24" />
	<span
		class="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center {badgeSurfaceClass}"
		aria-hidden="true"
	>
		<AbstractIcon name={icons.Pencil.name} class="size-3" width="12" height="12" />
	</span>
</span>
