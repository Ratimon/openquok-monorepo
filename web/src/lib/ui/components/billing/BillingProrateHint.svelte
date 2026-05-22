<script lang="ts">
	import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

	type Props = {
		tier: PaidSubscriptionTier;
		period: SubscriptionPeriod;
		previewProrate: (tier: PaidSubscriptionTier, period: SubscriptionPeriod) => Promise<number>;
	};

	let { tier, period, previewProrate }: Props = $props();

	let price = $state<number | false>(0);
	let loading = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	async function calculatePrice(): Promise<void> {
		loading = true;
		try {
			const value = await previewProrate(tier, period);
			price = value;
		} finally {
			loading = false;
		}
	}

	function scheduleCalculate(): void {
		price = false;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			void calculatePrice();
		}, 500);
	}

	$effect(() => {
		tier;
		period;
		scheduleCalculate();
		return () => clearTimeout(debounceTimer);
	});
</script>

{#if loading}
	<div class="pt-3">
		<span class="loading loading-spinner loading-sm text-primary"></span>
	</div>
{:else if price !== false}
	<div class="pt-3 text-xs text-base-content/70">
		(Pay Today ${(price < 0 ? 0 : price).toFixed(1)})
	</div>
{/if}
