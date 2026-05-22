<script lang="ts">
	import type { BillingPlanDto } from '$lib/billing';
	import { icons } from '$data/icons';
	import { buildPlanFeatureLines } from '$lib/ui/components/billing/buildPlanFeatureLines';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		plan: BillingPlanDto;
	};

	let { plan }: Props = $props();

	const features = $derived(buildPlanFeatureLines(plan));
</script>

<Tooltip.Provider delayDuration={200}>
	<div class="flex flex-col justify-center gap-2.5 text-base text-base-content/80">
		{#each features as feature (feature.label)}
			<div class="flex gap-5 max-lg:justify-center">
				<AbstractIcon
					name={icons.CircleCheck.name}
					class="shrink-0 text-[#06ff00]"
					width="24"
					height="24"
				/>
				{#if feature.tooltip}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: triggerProps })}
								<span
									{...triggerProps}
									class="cursor-help underline decoration-dotted decoration-base-content/40 underline-offset-2"
								>
									{feature.label}
								</span>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" sideOffset={8}>{feature.tooltip}</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<span>{feature.label}</span>
				{/if}
			</div>
		{/each}
	</div>
</Tooltip.Provider>
