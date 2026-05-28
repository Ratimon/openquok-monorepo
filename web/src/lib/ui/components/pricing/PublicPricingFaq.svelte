<script lang="ts">
	import { PUBLIC_PRICING_FAQ_ITEMS } from 'openquok-common';

	import BillingFaqAccordion from '$lib/ui/components/billing/BillingFaqAccordion.svelte';
</script>

<section class="mt-24 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
	<h2 class="text-3xl font-extrabold leading-tight text-base-content">
		Frequently asked
		<span class="relative inline-block">
			<span class="relative z-10">questions</span>
			<span
				class="pointer-events-none absolute -inset-x-1 -bottom-0.5 z-0 h-2.5 rounded-full bg-primary/35"
				aria-hidden="true"
			></span>
		</span>
	</h2>

	<div class="flex flex-col gap-4">
		{#each PUBLIC_PRICING_FAQ_ITEMS as item, index (index)}
			<BillingFaqAccordion title={item.title} description={item.description} />
		{/each}
	</div>
</section>
