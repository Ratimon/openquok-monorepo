<script lang="ts">
	import type { DirectoryAddChannelTileVm } from '$lib/auto-launch/buildDirectoryAddChannelTiles';

	import { directoryAddChannelLogoFallbackLabel } from '$lib/auto-launch/buildDirectoryAddChannelTiles';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		tile: DirectoryAddChannelTileVm;
		showLogo: boolean;
		onLogoError: () => void;
	};

	let { tile, showLogo, onLogoError }: Props = $props();
</script>

{#if showLogo && tile.logoUrl}
	<img
		src={tile.logoUrl}
		alt=""
		class="h-6 w-6 rounded object-contain"
		width="24"
		height="24"
		onerror={onLogoError}
	/>
{:else if tile.brandedIconName}
	<AbstractIcon
		name={tile.brandedIconName}
		class="h-6 w-6"
		width="24"
		height="24"
		aria-hidden="true"
	/>
{:else}
	<span class="text-xs font-semibold tracking-tight text-base-content/80" aria-hidden="true">
		{directoryAddChannelLogoFallbackLabel(tile.label)}
	</span>
{/if}
