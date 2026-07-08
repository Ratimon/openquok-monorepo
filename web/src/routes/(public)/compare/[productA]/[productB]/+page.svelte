<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSummaryViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';

	import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicProductComparePricing from '$lib/ui/components/compare/PublicProductComparePricing.svelte';
	import PublicProductCompareSection from '$lib/ui/components/compare/PublicProductCompareSection.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import WithWithout from '$lib/ui/templates/WithWithout.svelte';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let detailVm = $derived(data.detailVm);
	let schemaData = $derived(data.schemaData);

	let leftProductVm: CompareProductSummaryViewModel = $derived(detailVm.leftProduct);
	let rightProductVm: CompareProductSummaryViewModel = $derived(detailVm.rightProduct);
	let compareRows = $derived(detailVm.compareRows);
	let channelsSection = $derived(detailVm.channelsSection);
	let withWithoutSection = $derived(detailVm.withWithoutSection);
	let faqItems = $derived(detailVm.faqItems);
	let relatedPairs = $derived(detailVm.relatedPairs);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /compare
	const rootPathCompare = getRootPathPublicCompare();
	const compareHubPath = route(rootPathCompare);

	let moreComparisonItems = $derived([
		{
			id: 'all-comparisons',
			title: 'All comparisons',
			href: compareHubPath,
			description: 'Browse the full comparison hub to explore every head-to-head scheduling matchup.',
			ctaLabel: 'Open'
		},
		...relatedPairs.map((pair) => ({
			id: pair.slug,
			title: `vs. ${pair.name}`,
			href: pair.href,
			description: `Compare OpenQuok and ${pair.name} across pricing, features, and supported channels.`,
			ctaLabel: 'Open'
		}))
	]);

	// /pricing
	const pricingPath = route('pricing');
	const compareHeroCtaText = 'Or Start Using OpenQuok For Free';

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const compareNamePrimaryClass =
		'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';
	const compareNameAccentClass =
		'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

	const compareSectionHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		parseLandingHeroTitlePartSegments: (text: string) => {
			const trimmedText = text.trim();
			const highlightByTitle: Record<string, string> = {
				'Platform overview': 'overview',
				'Pricing & plans': 'plans',
				'Feature comparison': 'comparison',
				'More comparisons': 'comparisons'
			};
			const highlightText = highlightByTitle[trimmedText];
			if (!highlightText) return [{ text, highlight: false }];

			const highlightStart = text.lastIndexOf(highlightText);
			if (highlightStart < 0) return [{ text, highlight: false }];

			const before = text.slice(0, highlightStart);
			const after = text.slice(highlightStart + highlightText.length);

			return [
				before ? { text: before, highlight: false } : null,
				{ text: highlightText, highlight: true },
				after ? { text: after, highlight: false } : null
			].filter((segment): segment is { text: string; highlight: boolean } => segment !== null);
		}
	};
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Compare</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			<span class={compareNamePrimaryClass}>{leftProductVm.name}</span>
			<span class="px-2 text-base-content/80">vs</span>
			<span class={compareNameAccentClass}>{rightProductVm.name}</span>
			<span class="pl-2 text-base-content">comparison</span>
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{detailVm.heroDescription}
		</p>
		<div class="flex justify-center pt-2">
			<ButtonGlitchBrightness
				class="my-2 w-full max-w-sm justify-center rounded-full px-8 text-sm sm:w-auto sm:max-w-none sm:px-10 sm:text-base"
				variant="primary"
				size="lg"
				href={signUpPath}
				preload="off"
			>
				{compareHeroCtaText}
			</ButtonGlitchBrightness>
		</div>
	</header>

	<section class="container mx-auto mt-16 max-w-5xl scroll-mt-24 px-4">
		<FeaturesSectionHeader
			heroTheme={compareSectionHeroTheme}
			headingId="compare-platform-overview"
			subtitle="overview"
			title="Platform overview"
			description={`See how ${leftProductVm.name} and ${rightProductVm.name} position themselves before diving into pricing, channels, and feature tradeoffs.`}
		/>
		<div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<article class="rounded-2xl border border-primary/20 bg-primary/5 p-6">
				<h3 class="text-xl font-semibold">
					<span class={compareNamePrimaryClass}>
					{leftProductVm.name}
					</span>
				</h3>
				<p class="mt-2 text-sm font-medium text-primary">
					{leftProductVm.tagline}
				</p>
				<p class="mt-4 text-base leading-relaxed text-base-content/80">
					{leftProductVm.overview}
				</p>
			</article>
			<article class="rounded-2xl border border-base-content/10 bg-base-200/40 p-6">
				<h3 class="text-xl font-semibold">
					<span class={compareNameAccentClass}>
					{rightProductVm.name}
					</span>
				</h3>
				<p class="mt-2 text-sm font-medium text-base-content/70">
					{rightProductVm.tagline}
				</p>
				<p class="mt-4 text-base leading-relaxed text-base-content/80">
					{rightProductVm.overview}
				</p>
			</article>
		</div>
	</section>

	<div class="container mx-auto mt-20 max-w-5xl px-4">
		<PublicProductComparePricing
			heroTheme={compareSectionHeroTheme}
			headingId="compare-pricing-plans"
			subtitle="pricing"
			title="Pricing & plans"
			description={`Review how ${leftProductVm.name} and ${rightProductVm.name} package their plans, price points, and upgrade paths side by side.`}
			leftProductName={leftProductVm.name}
			rightProductName={rightProductVm.name}
			leftPlansVm={leftProductVm.pricingPlans}
			rightPlansVm={rightProductVm.pricingPlans}
		/>
	</div>

	<WithWithout
		heroTheme={landingHeroTheme}
		headingId="compare-channels"
		withOnLeft
		landingSubtitle={channelsSection.subtitle}
		landingTitle={channelsSection.title}
		landingDescription={channelsSection.description}
		withoutTitle={channelsSection.withoutTitle}
		withTitle={channelsSection.withTitle}
		points={channelsSection.points}
		sectionClass="mt-20 scroll-mt-24"
	/>

	<div class="container mx-auto mt-20 max-w-5xl px-4">
		<PublicProductCompareSection
			heroTheme={compareSectionHeroTheme}
			headingId="compare-feature-comparison"
			subtitle="features"
			title="Feature comparison"
			description="Scan the feature matrix to spot where each product includes, limits, or leaves out the capabilities your workflow depends on."
			leftProductName={leftProductVm.name}
			rightProductName={rightProductVm.name}
			rowsVm={compareRows}
		/>
	</div>

	<WithWithout
		heroTheme={landingHeroTheme}
		headingId="compare-benefits"
		withOnLeft
		landingSubtitle={withWithoutSection.subtitle}
		landingTitle={withWithoutSection.title}
		landingDescription={withWithoutSection.description}
		withoutTitle={withWithoutSection.withoutTitle}
		withTitle={withWithoutSection.withTitle}
		points={withWithoutSection.points}
		sectionClass="mt-20 bg-base-200 py-16 sm:py-20"
	/>

	{#if faqItems.length > 0}
		<div class="container mx-auto max-w-5xl px-4">
			<PublicFaq heroTheme={faqHeroTheme} {faqItems} sectionClass="mt-20" />
		</div>
	{/if}

	<SimpleCardGrid
		heroTheme={compareSectionHeroTheme}
		headingId="compare-more-comparisons"
		subtitle="next steps"
		title="More comparisons"
		description="Explore the full comparison hub or jump into related head-to-head matchups if you want to benchmark more options before choosing a workflow."
		items={moreComparisonItems}
		getItemKey={(item) => item.id}
		sectionClass="pt-20 pb-0"
		patternComponent={StripedPattern}
		patternClass="text-primary/12 stroke-[0.75]"
	>
		{#snippet card(item, context)}
			<SimpleLinkCard
				{item}
				pattern={context.pattern}
				patternComponent={context.patternComponent}
				patternClass={context.patternClass}
			/>
		{/snippet}
	</SimpleCardGrid>

	<div class="container mx-auto px-4">
		<AccentSplitCtaBanner
			title="See plans and pricing"
			description="Compare the feature differences above, then review OpenQuok pricing to pick the right plan for your team."
			ctaText="View pricing"
			ctaHref={pricingPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
