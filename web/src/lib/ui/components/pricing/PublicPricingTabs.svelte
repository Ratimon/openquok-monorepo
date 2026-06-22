<script lang="ts">
	import type { PublicPricingPlanCardViewModel } from '$lib/billing/GetPublicPricing.presenter.svelte';
	import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

	import { icons } from '$data/icons';
	import { getPublicPricingPresenter } from '$lib/billing';
	import {
		PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT,
		PUBLIC_PRICING_LANDING_TAB_ICONS,
		PUBLIC_PRICING_PLAN_META,
		PUBLIC_PRICING_TIER_ORDER
	} from '$lib/billing/constants/publicPricingCatalog';

    import AuroraWobbleCard from '$lib/ui/card-wobble/AuroraWobbleCard.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import Background from '$lib/ui/background/Background.svelte';

	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	const TIER_ICON_CLASS: Record<PaidSubscriptionTier, string> = {
		SOLO: 'text-emerald-400',
		TEAM: 'text-lime-400',
		ULTIMATE: 'text-primary',
		MAX: 'text-amber-400'
	};

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass: string;
		descriptionClass: string;
		ctaButtonClass: string;
		imageClass: string;
		titlePartClass: (index: number, total: number) => string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
		landingHeroTitlePartHasHighlight: (segments: LandingHeroTitleSegment[]) => boolean;
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;
		ctaHref?: string;
		ctaLabel?: string;
		secondaryCtaHref?: string;
		secondaryCtaLabel?: string;
		plans?: PublicPricingPlanCardViewModel[];
		period?: SubscriptionPeriod;
		onPeriodChange?: (period: SubscriptionPeriod) => void;
		showSectionHeader?: boolean;
		showPeriodToggle?: boolean;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		ctaHref = '/sign-up',
		ctaLabel = 'Start for $0',
		secondaryCtaHref,
		secondaryCtaLabel,
		plans: plansProp,
		period: controlledPeriod,
		onPeriodChange,
		showSectionHeader = true,
		showPeriodToggle = true
	}: Props = $props();

	const showSecondaryCta = $derived(
		Boolean(secondaryCtaHref?.trim() && secondaryCtaLabel?.trim())
	);

	const headingId = 'landing-pricing-tabs-heading';
	const tabListId = 'landing-pricing-tablist';

	let localPeriod = $state<SubscriptionPeriod>('MONTHLY');
	let selectedTier = $state<PaidSubscriptionTier>(PUBLIC_PRICING_TIER_ORDER[0]);

	const period = $derived(controlledPeriod ?? localPeriod);

	function setPeriod(next: SubscriptionPeriod) {
		if (onPeriodChange) {
			onPeriodChange(next);
		} else {
			localPeriod = next;
		}
	}

	const pageVm = $derived(getPublicPricingPresenter.buildPageVm(period));
	const plans = $derived(plansProp ?? pageVm.plans);

	const selectedPlan = $derived(
		plans.find((plan) => plan.tier === selectedTier) ?? plans[0]
	);

	const selectedTabFeatures = $derived(
		selectedPlan ? selectedPlan.features.slice(0, PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT) : []
	);

	const selectedTabIcon = $derived(
		selectedPlan ? PUBLIC_PRICING_LANDING_TAB_ICONS[selectedPlan.tier] : null
	);

	const titleParts = $derived(
		landingTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);

	function selectTier(tier: PaidSubscriptionTier) {
		selectedTier = tier;
	}
</script>

<Background color="bg-base-100">
	<section
		class="relative isolate z-10 w-full overflow-hidden"
		aria-labelledby={headingId}
	>
		<div class="relative z-10 w-full px-6 py-16 sm:py-20">
			<div class="mx-auto max-w-7xl">
				<div class="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
					<div class="space-y-8 lg:sticky lg:top-24">
						{#if showSectionHeader}
						<div class="space-y-6 text-center lg:text-left">
							{#if landingSubtitle}
								<p class={heroTheme.subtitleClass}>
									{landingSubtitle}
								</p>
							{/if}

							{#if landingTitle}
								<h2
									id={headingId}
									class="text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl"
								>
									{#each titleParts as part, index (index)}
										{@const partClass = heroTheme.titlePartClass(index, titleParts.length)}
										{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
										{@const layoutClass =
											titleParts.length >= 3 ? 'block' : index > 0 ? 'block sm:inline' : ''}
										{#if heroTheme.landingHeroTitlePartHasHighlight(segments)}
											<span class={layoutClass}>
												{#each segments as seg, segmentIndex (segmentIndex)}
													{#if seg.highlight}
														<span class={heroTheme.titleHighlightPillClass}>{seg.text}</span>
													{:else}
														<span class={partClass}>{seg.text}</span>
													{/if}
												{/each}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
											</span>
										{:else}
											<span class="{partClass} {layoutClass}">
												{part}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
											</span>
										{/if}
									{/each}
								</h2>
							{/if}

							{#if landingDescription}
								<p class={heroTheme.descriptionClass}>
									{landingDescription}
								</p>
							{/if}
						</div>
						{/if}

						{#if showPeriodToggle}
							<div class="flex justify-center lg:justify-start">
								<BillingPeriodToggle
									{period}
									onPeriodChange={setPeriod}
								/>
							</div>
						{/if}

						<div
							id={tabListId}
							class="flex flex-col gap-3"
							role="tablist"
							aria-label="Pricing plans"
						>
							{#each plans as plan (plan.tier)}
								{@const isSelected = plan.tier === selectedTier}
								{@const meta = PUBLIC_PRICING_PLAN_META[plan.tier]}
								<button
									type="button"
									role="tab"
									id="landing-pricing-tab-{plan.tier}"
									aria-selected={isSelected}
									aria-controls="landing-pricing-panel"
									tabindex={isSelected ? 0 : -1}
									class={cn(
										'flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors',
										isSelected
											? 'border-primary bg-base-200 shadow-md shadow-primary/10'
											: 'border-base-300 bg-base-200/60 hover:border-base-content/20 hover:bg-base-200'
									)}
									onclick={() => selectTier(plan.tier)}
								>
									<span class="min-w-0 space-y-0.5">
										<span class="block text-base font-semibold text-base-content sm:text-lg">
											{plan.name}
											{#if plan.isFeatured}
												<span
													class="ms-2 align-middle text-xs font-semibold uppercase tracking-wide text-primary"
												>
													Popular
												</span>
											{/if}
										</span>
										<span class="block text-sm text-base-content/65">
											{meta.tagline}
										</span>
									</span>
									<span
										class={cn(
											'flex size-9 shrink-0 items-center justify-center rounded-full border',
											isSelected
												? 'border-primary bg-primary text-primary-content'
												: 'border-base-300 bg-base-100 text-base-content/50'
										)}
										aria-hidden="true"
									>
										{#if isSelected}
											<AbstractIcon name={icons.Check.name} class="size-4" width="16" height="16" />
										{:else}
											<AbstractIcon
												name={icons.ChevronRight.name}
												class="size-4"
												width="16"
												height="16"
											/>
										{/if}
									</span>
								</button>
							{/each}
						</div>
					</div>

					{#if selectedPlan && selectedTabIcon}
						{@const selectedMeta = PUBLIC_PRICING_PLAN_META[selectedPlan.tier]}
						{@const tierIconClass = TIER_ICON_CLASS[selectedPlan.tier]}
						<div
							id="landing-pricing-panel"
							role="tabpanel"
							aria-labelledby="landing-pricing-tab-{selectedPlan.tier}"
							class="h-full min-h-0"
						>
							<AuroraWobbleCard
								containerClass={cn(
									'h-full',
									selectedPlan.isFeatured && 'ring-1 ring-primary/50'
								)}
								class="flex h-full flex-col gap-5 px-5 py-6 sm:px-6 sm:py-8"
							>
								<div class="flex items-center gap-2">
									<AbstractIcon
										name={selectedTabIcon}
										class="size-6 shrink-0 sm:size-7 {tierIconClass}"
										width="28"
										height="28"
									/>
									<h3 class="text-lg font-semibold tracking-tight text-white sm:text-xl">
										{selectedPlan.name}
									</h3>
								</div>

								<div class="flex flex-wrap items-end gap-1">
									<span
										class="text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl"
									>
										${selectedPlan.displayPrice}
									</span>
									<span class="pb-1 text-sm text-neutral-300">
										{selectedPlan.periodLabel}
									</span>
								</div>

								<p
									class="text-base font-semibold leading-snug text-balance text-neutral-200 sm:text-lg"
								>
									{selectedMeta.tabHeadline}
								</p>

								<div class="flex flex-col gap-3">
									<ButtonGlitchBrightness
										class={cn(heroTheme.ctaButtonClass, '!my-0 !max-w-none w-full')}
										variant="primary"
										size="lg"
										href={url(ctaHref)}
										preload="off"
									>
										{ctaLabel}
									</ButtonGlitchBrightness>

									{#if showSecondaryCta}
										<ButtonGlitchBrightness
											class={cn(heroTheme.ctaButtonClass, '!my-0 !max-w-none w-full')}
											variant="ghost"
											size="lg"
											href={url(secondaryCtaHref!)}
											preload="off"
										>
											{secondaryCtaLabel}
										</ButtonGlitchBrightness>
									{/if}
								</div>

								<hr class="border-neutral-700" />

								<div>
									<p class="text-sm font-semibold text-neutral-300">Features</p>
									<ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
										{#each selectedTabFeatures as feature (feature)}
											<li class="flex gap-2.5 text-sm text-neutral-200">
												<AbstractIcon
													name={icons.CircleCheck.name}
													class="size-5 shrink-0 text-success"
													width="20"
													height="20"
												/>
												<span>{feature}</span>
											</li>
										{/each}
									</ul>
								</div>

								<div
									class="flex items-center justify-center gap-2 rounded-full border border-neutral-600/80 bg-neutral-900/50 px-4 py-2.5 text-center text-xs text-neutral-300 sm:text-sm"
								>
									<AbstractIcon
										name={icons.Info.name}
										class="size-4 shrink-0 text-neutral-400"
										width="16"
										height="16"
									/>
									<span>7-day free trial — no credit card required to start</span>
								</div>
							</AuroraWobbleCard>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>
</Background>
