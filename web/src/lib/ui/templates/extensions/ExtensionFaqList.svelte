<script lang="ts">
	import type { ListingFaqItemProgrammerModel } from '$lib/listings/listing.types';

	type Props = {
		items: ListingFaqItemProgrammerModel[];
	};

	let { items }: Props = $props();
</script>

{#if items.length > 0}
	<div class="space-y-4">
		{#each items as item, index (index)}
			<div class="rounded-lg border border-base-content/10 p-4">
				<h3 class="font-semibold text-base-content">{item.question}</h3>
				<p class="mt-2 text-base-content/75">{item.answer}</p>
			</div>
		{/each}
	</div>
{/if}
