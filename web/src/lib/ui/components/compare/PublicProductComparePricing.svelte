<script lang="ts">
	import type { ComparePricingPlanViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { ComparePricingUnit, CompareProductSlug } from '$lib/content/constants/competitors/types';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import {
		comparePricingNeedsChannelContext,
		expressFlatComparePlansPerChannel,
		resolveComparePricingDefaultChannelCount,
		scaleComparePlansToChannelTotal
	} from '$lib/content/constants/competitors/utils/comparePricing';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	type Props = {
		heroTheme: LandingHeroTheme;
		headingId: string;
		subtitle: string;
		title: string;
		description: string;
		leftProductSlug: CompareProductSlug;
		rightProductSlug: CompareProductSlug;
		leftProductName: string;
		rightProductName: string;
		leftPricingUnit: ComparePricingUnit;
		rightPricingUnit: ComparePricingUnit;
		leftPlansVm: ComparePricingPlanViewModel[];
		rightPlansVm: ComparePricingPlanViewModel[];
	};

	let {
		heroTheme,
		headingId,
		subtitle,
		title,
		description,
		leftProductSlug,
		rightProductSlug,
		leftProductName,
		rightProductName,
		leftPricingUnit,
		rightPricingUnit,
		leftPlansVm,
		rightPlansVm
	}: Props = $props();

	const MIN_CHANNEL_COUNT = 1;
	const MAX_CHANNEL_COUNT = 30;

	let defaultChannelCount = $derived(
		resolveComparePricingDefaultChannelCount(
			leftProductSlug,
			rightProductSlug,
			leftPricingUnit,
			rightPricingUnit
		)
	);

	let showChannelControls = $derived(
		comparePricingNeedsChannelContext(leftPricingUnit, rightPricingUnit)
	);

	let channelCount = $state(1);

	$effect(() => {
		leftProductSlug;
		rightProductSlug;
		channelCount = defaultChannelCount;
	});

	let pricingDescription = $derived(
		showChannelControls
			? `${description} Prices below assume ${channelCount} connected social channels so flat and per-channel plans are comparable.`
			: description
	);

	let totalLeftPlans = $derived(
		scaleComparePlansToChannelTotal(leftPlansVm, leftPricingUnit, channelCount)
	);
	let totalRightPlans = $derived(
		scaleComparePlansToChannelTotal(rightPlansVm, rightPricingUnit, channelCount)
	);

	let perChannelLeftPlans = $derived(
		leftPricingUnit === 'per_channel'
			? leftPlansVm
			: expressFlatComparePlansPerChannel(leftPlansVm, leftPricingUnit, channelCount)
	);
	let perChannelRightPlans = $derived(
		rightPricingUnit === 'per_channel'
			? rightPlansVm
			: expressFlatComparePlansPerChannel(rightPlansVm, rightPricingUnit, channelCount)
	);

	function formatPrice(plan: ComparePricingPlanViewModel): string {
		if (plan.monthlyPrice == null) return 'Custom';
		return `$${plan.monthlyPrice.toLocaleString('en-US')}`;
	}

	function priceSuffix(plan: ComparePricingPlanViewModel, mode: 'total' | 'per_channel'): string | null {
		if (plan.monthlyPrice == null) return null;
		if (plan.pricePeriod === 'one_time') return 'one-time';
		if (mode === 'per_channel') return '/channel /mo';
		return '/mo';
	}

	function decreaseChannels() {
		channelCount = Math.max(MIN_CHANNEL_COUNT, channelCount - 1);
	}

	function increaseChannels() {
		channelCount = Math.min(MAX_CHANNEL_COUNT, channelCount + 1);
	}
</script>

<section class="scroll-mt-24">
	<FeaturesSectionHeader {heroTheme} {headingId} {subtitle} {title} description={pricingDescription} />

	{#if showChannelControls}
		<div
			class="mt-8 flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-200/40 p-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<p class="text-sm font-semibold text-base-content">Connected channels</p>
				<p class="text-xs text-base-content/60">
					Set how many social accounts you manage. We scale per-channel list prices to this count.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost border border-base-content/15"
					aria-label="Decrease channel count"
					disabled={channelCount <= MIN_CHANNEL_COUNT}
					onclick={decreaseChannels}
				>
					−
				</button>
				<span class="min-w-10 text-center text-lg font-bold tabular-nums text-base-content">
					{channelCount}
				</span>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost border border-base-content/15"
					aria-label="Increase channel count"
					disabled={channelCount >= MAX_CHANNEL_COUNT}
					onclick={increaseChannels}
				>
					+
				</button>
			</div>
		</div>
	{/if}

	<div class="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<div class="rounded-2xl border border-primary/20 bg-primary/5 p-6">
			<h3 class="text-xl font-semibold text-base-content">
				{leftProductName}
				{#if showChannelControls}
					<span class="text-sm font-normal text-base-content/60">· {channelCount} channels</span>
				{/if}
			</h3>
			<ul class="mt-6 space-y-4">
				{#each totalLeftPlans as planVm (planVm.name)}
					<li class="rounded-xl border border-base-content/10 bg-base-100 p-4">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<span class="font-semibold text-base-content">{planVm.name}</span>
							<span class="text-2xl font-bold tabular-nums text-base-content">
								{formatPrice(planVm)}
								{#if priceSuffix(planVm, 'total')}
									<span class="text-sm font-normal text-base-content/60">
										{priceSuffix(planVm, 'total')}
									</span>
								{/if}
							</span>
						</div>
						<p class="mt-2 text-sm text-base-content/70">
							{planVm.tagline}
						</p>
						{#if planVm.footnote}
							<p class="mt-2 text-xs text-base-content/50">
								{planVm.footnote}
							</p>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-2xl border border-base-content/10 bg-base-200/40 p-6">
			<h3 class="text-xl font-semibold text-base-content">
				{rightProductName}
				{#if showChannelControls}
					<span class="text-sm font-normal text-base-content/60">· {channelCount} channels</span>
				{/if}
			</h3>
			<ul class="mt-6 space-y-4">
				{#each totalRightPlans as plan (plan.name)}
					<li class="rounded-xl border border-base-content/10 bg-base-100 p-4">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<span class="font-semibold text-base-content">{plan.name}</span>
							<span class="text-2xl font-bold tabular-nums text-base-content">
								{formatPrice(plan)}
								{#if priceSuffix(plan, 'total')}
									<span class="text-sm font-normal text-base-content/60">{priceSuffix(plan, 'total')}</span>
								{/if}
							</span>
						</div>
						<p class="mt-2 text-sm text-base-content/70">{plan.tagline}</p>
						{#if plan.footnote}
							<p class="mt-2 text-xs text-base-content/50">{plan.footnote}</p>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>

	{#if showChannelControls}
		<div class="mt-12">
			<h3 class="text-lg font-semibold text-base-content">List price per channel</h3>
			<p class="mt-1 text-sm text-base-content/65">
				Native per-channel list rates before volume discounts. OpenQuok flat plans are split across
				{channelCount} channels for reference.
			</p>
			<div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div class="rounded-2xl border border-primary/15 bg-primary/5 p-6">
					<h4 class="text-base font-semibold text-base-content">{leftProductName}</h4>
					<ul class="mt-4 space-y-3">
						{#each perChannelLeftPlans as planVm (planVm.name)}
							<li class="rounded-lg border border-base-content/10 bg-base-100 p-3">
								<div class="flex flex-wrap items-baseline justify-between gap-2">
									<span class="font-medium text-base-content">{planVm.name}</span>
									<span class="text-lg font-bold tabular-nums text-base-content">
										{formatPrice(planVm)}
										{#if priceSuffix(planVm, 'per_channel')}
											<span class="text-xs font-normal text-base-content/60">
												{priceSuffix(planVm, 'per_channel')}
											</span>
										{/if}
									</span>
								</div>
								{#if planVm.footnote}
									<p class="mt-1 text-xs text-base-content/50">{planVm.footnote}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
				<div class="rounded-2xl border border-base-content/10 bg-base-200/40 p-6">
					<h4 class="text-base font-semibold text-base-content">{rightProductName}</h4>
					<ul class="mt-4 space-y-3">
						{#each perChannelRightPlans as plan (plan.name)}
							<li class="rounded-lg border border-base-content/10 bg-base-100 p-3">
								<div class="flex flex-wrap items-baseline justify-between gap-2">
									<span class="font-medium text-base-content">{plan.name}</span>
									<span class="text-lg font-bold tabular-nums text-base-content">
										{formatPrice(plan)}
										{#if priceSuffix(plan, 'per_channel')}
											<span class="text-xs font-normal text-base-content/60">
												{priceSuffix(plan, 'per_channel')}
											</span>
										{/if}
									</span>
								</div>
								{#if plan.footnote}
									<p class="mt-1 text-xs text-base-content/50">{plan.footnote}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</section>
