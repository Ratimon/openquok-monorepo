<script lang="ts">
	import type {
		PublicPricingCompareRowViewModel,
		PublicPricingPlanCardViewModel
	} from '$lib/billing/GetPublicPricing.presenter.svelte';
	import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

	import { icons } from '$data/icons';
	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Table from '$lib/ui/table';
	import * as Tooltip from '$lib/ui/tooltip';
	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	type Props = {
		plans: PublicPricingPlanCardViewModel[];
		compareRows: PublicPricingCompareRowViewModel[];
		featuredTier: PaidSubscriptionTier;
		period: SubscriptionPeriod;
		onPeriodChange: (period: SubscriptionPeriod) => void;
		ctaHref: string;
	};

	let { plans, compareRows, featuredTier, period, onPeriodChange, ctaHref }: Props = $props();

	function isFeaturedColumn(tier: PaidSubscriptionTier): boolean {
		return tier === featuredTier;
	}
</script>

<section class="mt-24">
	<h2 class="text-center text-2xl font-bold text-base-content sm:text-3xl">
		Compare and explore the features of each plan
	</h2>

	<div class="mt-10 overflow-x-auto">
		<Table.Root class="min-w-[56rem] border-separate border-spacing-x-2 border-spacing-y-2">
			<Table.Header>
				<Table.Row class="border-0 hover:bg-transparent">
					<Table.Head class="w-[18rem] min-w-[18rem] align-bottom border-0 bg-transparent p-3">
						<div class="text-lg font-bold">Plans</div>
						<p class="mt-1 text-sm font-normal text-base-content/60">Save with yearly billing</p>
						<div class="mt-4 w-max">
							<BillingPeriodToggle {period} {onPeriodChange} />
						</div>
					</Table.Head>
					{#each plans as plan (plan.tier)}
						{@const featured = isFeaturedColumn(plan.tier)}
						<Table.Head
							class={cn(
								'min-w-[10rem] rounded-2xl border-0 p-4 align-top',
								featured ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'
							)}
						>
							<div class="flex items-start justify-between gap-2">
								<span class="text-lg font-semibold">{plan.name}</span>
								{#if featured}
									<span class="rounded-full bg-primary-content/20 px-2 py-0.5 text-xs font-semibold">
										Popular
									</span>
								{/if}
							</div>
							<div class="mt-3 flex items-end gap-1">
								<span class="text-3xl font-bold tabular-nums">${plan.displayPrice}</span>
								<span class={cn('pb-0.5 text-xs', featured ? 'text-primary-content/80' : 'text-base-content/60')}>
									{plan.periodLabel}
								</span>
							</div>
							<Button
								href={url(ctaHref)}
								variant={featured ? 'ghost' : 'outline'}
								class={cn(
									'mt-4 w-full !rounded-full text-sm',
									featured &&
										'!border-transparent !bg-primary-content !text-primary hover:!bg-primary-content/90'
								)}
							>
								Get started
							</Button>
							{#if plan.compareFootnote}
								<p class={cn('mt-2 text-xs', featured ? 'text-primary-content/80' : 'text-warning')}>
									{plan.compareFootnote}
								</p>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Tooltip.Provider delayDuration={200}>
					{#each compareRows as row (row.id)}
						<Table.Row class="border-0 hover:bg-transparent">
							<Table.Cell class="rounded-xl border-0 bg-base-200/80 p-4 align-middle font-medium">
								<div class="flex items-center gap-1.5">
									<span>{row.label}</span>
									{#if row.tooltip}
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
											<Tooltip.Content
												side="top"
												sideOffset={8}
												class="max-w-sm whitespace-pre-line"
											>
												{row.tooltip}
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</div>
							</Table.Cell>
							{#each plans as plan (plan.tier)}
								{@const featured = isFeaturedColumn(plan.tier)}
								{@const cell = row.cells[plan.tier]}
								<Table.Cell
									class={cn(
										'rounded-xl border-0 p-4 text-center align-middle',
										featured ? 'bg-primary/15 font-medium' : 'bg-base-200/60'
									)}
								>
									{#if cell.kind === 'text'}
										<span class="tabular-nums">{cell.text}</span>
									{:else if cell.kind === 'included'}
										<span class="mx-auto inline-flex" aria-label="Included">
											<AbstractIcon
												name={icons.CircleCheck.name}
												class="size-5 text-success"
												width="20"
												height="20"
											/>
										</span>
									{:else}
										<span class="mx-auto inline-flex" aria-label="Not included">
											<AbstractIcon
												name={icons.CircleX.name}
												class="size-5 text-error"
												width="20"
												height="20"
											/>
										</span>
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Tooltip.Provider>
			</Table.Body>
		</Table.Root>
	</div>
</section>
