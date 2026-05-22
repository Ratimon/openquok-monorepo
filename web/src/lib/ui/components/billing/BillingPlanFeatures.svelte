<script lang="ts">
	import type { BillingPlanViewModel } from '$lib/billing';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		planVm: BillingPlanViewModel;
	};

	let { planVm }: Props = $props();
</script>

<Tooltip.Provider delayDuration={200}>
	<div class="flex flex-col justify-center gap-2.5 text-base text-base-content/80">
		{#each planVm.featureLines as feature (feature.label)}
			<div class="flex gap-5 max-lg:justify-center">
				<AbstractIcon
					name={icons.CircleCheck.name}
					class="shrink-0 text-[#06ff00]"
					width="24"
					height="24"
				/>
				<div class="flex items-center gap-1.5">
					<span>{feature.label}</span>
					{#if feature.tooltip}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props: triggerProps })}
									{@const { class: tipClass, ...tipRest } = triggerProps}
									<span
										{...tipRest}
										class={`inline-flex shrink-0 ${String(tipClass ?? '')} cursor-help text-base-content/50`}
										aria-label="More info"
									>
										<AbstractIcon
											name={icons.Info.name}
											class="size-4"
											width="16"
											height="16"
										/>
									</span>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content side="top" sideOffset={8}>{feature.tooltip}</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</Tooltip.Provider>
