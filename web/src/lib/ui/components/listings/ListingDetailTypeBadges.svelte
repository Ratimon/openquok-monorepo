<script lang="ts">
	import { resolveListingDetailTypeLabels } from '$lib/listings/utils/resolveListingDetailTypeLabels';

	type Props = {
		listingKind?: string | null;
		extensionType?: string | null;
	};

	let { listingKind = null, extensionType = null }: Props = $props();

	const labels = $derived(resolveListingDetailTypeLabels({ listingKind, extensionType }));
</script>

{#if labels.length > 0}
	{#each labels as label (label)}
		<span class="badge badge-secondary">
			{label}
		</span>
	{/each}
{/if}
