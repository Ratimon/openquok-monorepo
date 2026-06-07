<script lang="ts">
	import type { PageData } from './$types';

	import type { SubscriptionPeriod } from 'openquok-common';

	import PublicPricingCompareSection from '$lib/ui/components/pricing/PublicPricingCompareSection.svelte';
	import PublicFaq from '$lib/ui/templates/PublicFaq.svelte';
	import PublicPricingHero from '$lib/ui/components/pricing/PublicPricingHero.svelte';
	import PublicPricingPlanCards from '$lib/ui/components/pricing/PublicPricingPlanCards.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let isLoggedIn = $derived(data.isLoggedIn ?? false);
	let pageVmMonthly = $derived(data.pageVmMonthly);
	let pageVmYearly = $derived(data.pageVmYearly);
	let publicFaqItemsVm = $derived(data.publicFaqItemsVm ?? []);
	let schemaData = $derived(data.schemaData);

	let initialPeriod = $derived.by((): SubscriptionPeriod => data.defaultPeriod ?? 'MONTHLY');
	let period = $state<SubscriptionPeriod>('MONTHLY');
	let hasUserChosenPeriod = $state(false);
	let effectivePeriod = $derived.by(() => (hasUserChosenPeriod ? period : initialPeriod));

	let pageVm = $derived.by(() => (effectivePeriod === 'YEARLY' ? pageVmYearly : pageVmMonthly));
	let ctaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	let ctaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');

	const LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS =
		'bg-white text-black px-3 py-1 rounded-md -rotate-1 inline-block';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	const TITLE_PART_HIGHLIGHT_PHRASE =
		/^(?:minimal|in action|effortlessly|confidently|efficiently|correctly|channels|plan|perfect plan|questions)$/i;

	function parseLandingHeroTitlePartSegments(text: string): LandingHeroTitleSegment[] {
		if (!text) return [];
		const parts = text.split(
			/\b(minimal|in action|effortlessly|confidently|efficiently|correctly|channels|perfect plan|plan|questions)\b/gi
		);
		const out: LandingHeroTitleSegment[] = [];
		for (const p of parts) {
			if (p === '') continue;
			out.push({ text: p, highlight: TITLE_PART_HIGHLIGHT_PHRASE.test(p) });
		}
		return out;
	}

	function landingHeroTitlePartHasHighlight(segments: LandingHeroTitleSegment[]): boolean {
		return segments.some((segment) => segment.highlight);
	}

	const faqHeroTheme = {
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg',
		titlePartClass: (index: number, total: number) => {
			const primaryGradient =
				'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';
			const accentGradient =
				'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

			if (index === 0) return 'text-base-content';
			if (total >= 3 && index === total - 1) return accentGradient;
			return primaryGradient;
		},
		titleHighlightPillClass: LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS,
		parseLandingHeroTitlePartSegments,
		landingHeroTitlePartHasHighlight
	};
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

<SectionOuterContainer class="py-10 md:py-16">
	<PublicPricingHero
		period={effectivePeriod}
		onPeriodChange={(next) => {
			period = next;
			hasUserChosenPeriod = true;
		}}
	/>

	<PublicPricingPlanCards plans={pageVm.plans} {ctaHref} {ctaLabel} />

	<PublicPricingCompareSection
		plans={pageVm.plans}
		compareRows={pageVm.compareRows}
		featuredTier={pageVm.featuredTier}
		period={effectivePeriod}
		onPeriodChange={(next) => {
			period = next;
			hasUserChosenPeriod = true;
		}}
		{ctaHref}
	/>

	<PublicFaq
		heroTheme={faqHeroTheme}
		faqConfigVm={data.publicFaqConfigPm}
		faqItems={publicFaqItemsVm}
	/>
</SectionOuterContainer>
