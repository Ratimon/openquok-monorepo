<script lang="ts">
	import type { SubscriptionPeriod } from 'openquok-common';

	import * as Tabs from '$lib/ui/tabs';

	type Props = {
		period: SubscriptionPeriod;
		onPeriodChange: (period: SubscriptionPeriod) => void;
	};

	let { period, onPeriodChange }: Props = $props();

	let tabValue = $state<SubscriptionPeriod>('MONTHLY');

	$effect(() => {
		tabValue = period;
	});

	$effect(() => {
		if (tabValue !== period) {
			onPeriodChange(tabValue);
		}
	});
</script>

<Tabs.Root bind:value={tabValue} defaultValue="MONTHLY" class="inline-flex">
	<Tabs.List
		class="inline-flex gap-0 rounded-full border border-base-content/15 bg-base-300 p-1 !border-solid"
	>
		<Tabs.Trigger
			value="MONTHLY"
			class="billing-period-tab rounded-full border-0 px-5 py-2 text-sm font-medium capitalize"
		>
			Monthly
		</Tabs.Trigger>
		<Tabs.Trigger
			value="YEARLY"
			class="billing-period-tab rounded-full border-0 px-5 py-2 text-sm font-medium capitalize"
		>
			<span class="inline-flex items-center gap-2">
				Yearly
				<span
					class="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold normal-case text-primary-content"
				>
					20% Off
				</span>
			</span>
		</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>

<style>
	:global(.billing-period-tab.tab) {
		height: auto;
		min-height: 0;
		border-bottom: none !important;
		background-color: transparent;
		color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
	}

	:global(.billing-period-tab.tab:hover) {
		color: var(--color-base-content);
	}

	:global(.billing-period-tab.tab.tab-active) {
		background-color: var(--color-base-100);
		color: var(--color-base-content);
		box-shadow: none;
	}
</style>
