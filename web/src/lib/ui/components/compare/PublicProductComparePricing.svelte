<script lang="ts">
	import type { ComparePricingPlanViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	type Props = {
		heroTheme: LandingHeroTheme;
		headingId: string;
		subtitle: string;
		title: string;
		description: string;
		leftProductName: string;
		rightProductName: string;
		leftPlansVm: ComparePricingPlanViewModel[];
		rightPlansVm: ComparePricingPlanViewModel[];
	};

	let {
		heroTheme,
		headingId,
		subtitle,
		title,
		description,
		leftProductName,
		rightProductName,
		leftPlansVm,
		rightPlansVm
	}: Props = $props();

	function formatPrice(plan: ComparePricingPlanViewModel): string {
		if (plan.monthlyPrice == null) return 'Custom';
		return `$${plan.monthlyPrice}`;
	}
</script>

<section class="scroll-mt-24">
	<FeaturesSectionHeader {heroTheme} {headingId} {subtitle} {title} {description} />

	<div class="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<div class="rounded-2xl border border-primary/20 bg-primary/5 p-6">
			<h3 class="text-xl font-semibold text-base-content">{leftProductName}</h3>
			<ul class="mt-6 space-y-4">
				{#each leftPlansVm as planVm (planVm.name)}
					<li class="rounded-xl border border-base-content/10 bg-base-100 p-4">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<span class="font-semibold text-base-content">{planVm.name}</span>
							<span class="text-2xl font-bold tabular-nums text-base-content">
								{formatPrice(planVm)}
								{#if planVm.monthlyPrice != null}
									<span class="text-sm font-normal text-base-content/60">/mo</span>
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
			<h3 class="text-xl font-semibold text-base-content">{rightProductName}</h3>
			<ul class="mt-6 space-y-4">
				{#each rightPlansVm as plan (plan.name)}
					<li class="rounded-xl border border-base-content/10 bg-base-100 p-4">
						<div class="flex flex-wrap items-baseline justify-between gap-2">
							<span class="font-semibold text-base-content">{plan.name}</span>
							<span class="text-2xl font-bold tabular-nums text-base-content">
								{formatPrice(plan)}
								{#if plan.monthlyPrice != null}
									<span class="text-sm font-normal text-base-content/60">/mo</span>
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
</section>
