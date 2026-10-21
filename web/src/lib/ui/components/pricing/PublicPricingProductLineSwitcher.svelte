<script lang="ts">
	import type { PublicPricingProductLine } from '$lib/billing/constants/publicPricingProductLines';

	import * as Tabs from '$lib/ui/tabs';

	type ProductLineOption = {
		value: PublicPricingProductLine;
		title: string;
		subtitle?: string;
	};

	type Props = {
		value: PublicPricingProductLine;
		onChange: (line: PublicPricingProductLine) => void;
		ariaLabel?: string;
	};

	const PRODUCT_LINE_OPTIONS: ProductLineOption[] = [
		{ value: 'all', title: 'All Features', subtitle: 'For all channels' },
		{ value: 'social', title: 'Social Scheduler', subtitle: 'For social channels' },
		{ value: 'directory', title: 'Auto Submit', subtitle: 'For directory channels' }
	];

	let { value, onChange, ariaLabel = 'Pricing product line' }: Props = $props();

	let tabValue = $state<PublicPricingProductLine>('all');

	$effect(() => {
		tabValue = value;
	});

	$effect(() => {
		if (tabValue !== value) {
			onChange(tabValue);
		}
	});

	const triggerClass =
		'h-auto min-h-0 shrink-0 rounded-full border-0 !border-b-0 bg-transparent px-3 py-2 text-sm font-medium text-base-content/55 hover:text-base-content sm:px-4 [&.tab-active]:bg-base-100 [&.tab-active]:text-base-content [&.tab-active]:shadow-none';
</script>

<div
	class="inline-flex max-w-full justify-center"
	role="group"
	aria-label={ariaLabel}
>
	<Tabs.Root bind:value={tabValue} defaultValue="all" class="inline-flex max-w-full">
		<Tabs.List
			class="inline-flex max-w-full flex-nowrap gap-0 overflow-x-auto rounded-full border border-base-content/15 bg-base-300 p-1 !border-solid [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center [&::-webkit-scrollbar]:hidden"
		>
			{#each PRODUCT_LINE_OPTIONS as option (option.value)}
				<Tabs.Trigger value={option.value} class={triggerClass}>
					<span class="flex flex-col items-center gap-0.5 text-center leading-tight">
						<span class="whitespace-nowrap">{option.title}</span>
						{#if option.subtitle}
							<span
								class="text-[0.6875rem] font-normal normal-case tracking-normal text-base-content/45 sm:text-xs"
							>
								{option.subtitle}
							</span>
						{/if}
					</span>
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
