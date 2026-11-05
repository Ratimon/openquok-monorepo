<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
	import type {
		CompareDetailLongFormViewModel,
		CompareLongFormSection,
		CompareProductSlug
	} from '$lib/content/constants/competitors/types';
	import type {
		CompareFeatureRowViewModel,
		CompareProductSummaryViewModel
	} from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import { COMPARE_PRODUCT_ICON_STYLES_CARD } from '$lib/content/constants/competitors/compareProductIconStyles';
	import { getCompareProduct } from '$lib/content/constants/competitors';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import CompareProductLink from '$lib/ui/links/CompareProductLink.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import PublicProductComparePricing from '$lib/ui/components/compare/PublicProductComparePricing.svelte';
	import PublicProductCompareSection from '$lib/ui/components/compare/PublicProductCompareSection.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import PublicCompareDirectoryCoverageSection from '$lib/ui/components/compare/PublicCompareDirectoryCoverageSection.svelte';
	import CompareLongFormBodyList from '$lib/ui/components/compare/CompareLongFormBodyList.svelte';
	import WithWithout from '$lib/ui/templates/WithWithout.svelte';
	import type { CompareDirectoryCoverageViewModel } from '$lib/content/constants/competitors/utils/compareChannelSections';

	type Props = {
		longForm: CompareDetailLongFormViewModel;
		heroTheme: LandingHeroTheme;
		benefitsHeroTheme: LandingHeroTheme;
		leftProduct: CompareProductSummaryViewModel;
		rightProduct: CompareProductSummaryViewModel;
		compareRows: CompareFeatureRowViewModel[];
		channelsSection: PublicAgentComparisonSection | null;
		directoryCoverageSection: CompareDirectoryCoverageViewModel | null;
		withWithoutSection: PublicAgentComparisonSection;
		isDirectoryCompare: boolean;
		compareNamePrimaryClass: string;
		compareNameAccentClass: string;
		iconStyleForProduct: (slug: CompareProductSlug) => {
			cardContainerClass: string;
			iconClass?: string;
		};
		/** Ranked alternatives list rendered inside “Your options”. */
		yourOptionsExtra?: Snippet;
		/** `/alternatives/[slug]`: skip pricing, channel matrices, feature table, with/without, and other-alternatives block. */
		omitCompareMatrixSections?: boolean;
	};

	let {
		longForm,
		heroTheme,
		benefitsHeroTheme,
		leftProduct,
		rightProduct,
		compareRows,
		channelsSection,
		directoryCoverageSection,
		withWithoutSection,
		isDirectoryCompare,
		compareNamePrimaryClass,
		compareNameAccentClass,
		iconStyleForProduct,
		yourOptionsExtra,
		omitCompareMatrixSections = false
	}: Props = $props();

	const peerCards = $derived(
		longForm.otherAlternativePeers.map((peer) => {
			const product = getCompareProduct(peer.slug);
			return {
				id: `${peer.slug}::${peer.href}`,
				title: peer.name,
				iconName: product?.icon,
				iconContainerClass:
					COMPARE_PRODUCT_ICON_STYLES_CARD[peer.slug as CompareProductSlug]?.cardContainerClass ??
					'bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 text-primary ring-primary/25',
				href: peer.href,
				description: peer.description,
				ctaLabel: peer.href.includes('/alternatives/') ? 'Open' : 'Compare'
			};
		})
	);

	const featureComparisonTitle = $derived(
		isDirectoryCompare ? 'Directory launch features' : 'Feature comparison'
	);
	const featureComparisonDescription = $derived(
		isDirectoryCompare
			? 'See which directory tools each option includes.'
			: 'See which features each product includes, limits, or omits.'
	);
</script>

{#snippet longFormSection(section: CompareLongFormSection, sectionClass = 'scroll-mt-24')}
	<section id={section.id} class={sectionClass} aria-labelledby={`${section.id}-heading`}>
		<FeaturesSectionHeader
			{heroTheme}
			headingId={`${section.id}-heading`}
			subtitle={section.subtitle}
			title={section.title}
		/>
		<div class="mt-8">
			<CompareLongFormBodyList sectionId={section.id} paragraphs={section.body} />
		</div>
	</section>
{/snippet}

<section id="compare-platform-overview" class="scroll-mt-24" aria-labelledby="compare-platform-overview">
	<FeaturesSectionHeader
		{heroTheme}
		headingId="compare-platform-overview"
		subtitle="Platform overview"
		title="Platform overview"
		description={`Read a short summary of ${leftProduct.name} and ${rightProduct.name}. Then compare prices, channels, and features.`}
	/>
	<div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<article class="rounded-2xl border border-primary/20 bg-primary/5 p-6">
			<div class="flex items-center gap-3">
				<div
					class={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${iconStyleForProduct(leftProduct.slug).cardContainerClass}`}
				>
					<AbstractIcon
						name={leftProduct.icon}
						width="22"
						height="22"
						class={iconStyleForProduct(leftProduct.slug).iconClass ?? 'size-5.5'}
						focusable="false"
					/>
				</div>
				<h3 class="text-xl font-semibold">
					<CompareProductLink slug={leftProduct.slug} class={compareNamePrimaryClass}>
						{leftProduct.name}
					</CompareProductLink>
				</h3>
			</div>
			<p class="mt-2 text-sm font-medium text-primary">{leftProduct.tagline}</p>
			<p class="mt-4 text-base leading-relaxed text-base-content/80">{leftProduct.overview}</p>
			<div class="mt-6">
				<CompareProductLink
					slug={leftProduct.slug}
					class="btn btn-outline btn-sm justify-center sm:w-auto"
					ariaLabel={`Visit ${leftProduct.name} official site`}
				>
					Visit official site
				</CompareProductLink>
			</div>
		</article>
		<article class="rounded-2xl border border-base-content/10 bg-base-200/40 p-6">
			<div class="flex items-center gap-3">
				<div
					class={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${iconStyleForProduct(rightProduct.slug).cardContainerClass}`}
				>
					<AbstractIcon
						name={rightProduct.icon}
						width="22"
						height="22"
						class={iconStyleForProduct(rightProduct.slug).iconClass ?? 'size-5.5'}
						focusable="false"
					/>
				</div>
				<h3 class="text-xl font-semibold">
					<CompareProductLink slug={rightProduct.slug} class={compareNameAccentClass}>
						{rightProduct.name}
					</CompareProductLink>
				</h3>
			</div>
			<p class="mt-2 text-sm font-medium text-base-content/70">{rightProduct.tagline}</p>
			<p class="mt-4 text-base leading-relaxed text-base-content/80">{rightProduct.overview}</p>
			<div class="mt-6">
				<CompareProductLink
					slug={rightProduct.slug}
					class="btn btn-outline btn-sm justify-center sm:w-auto"
					ariaLabel={`Visit ${rightProduct.name} official site`}
				>
					Visit official site
				</CompareProductLink>
			</div>
		</article>
	</div>
</section>

{@render longFormSection(longForm.whyPeopleLook, 'mt-20 scroll-mt-24')}

<section id={longForm.yourOptions.id} class="mt-20 scroll-mt-24" aria-labelledby="your-options-heading">
	<FeaturesSectionHeader
		{heroTheme}
		headingId="your-options-heading"
		subtitle={longForm.yourOptions.subtitle}
		title={longForm.yourOptions.title}
	/>
	<div class="mt-8">
		<CompareLongFormBodyList sectionId={longForm.yourOptions.id} paragraphs={longForm.yourOptions.body} />
	</div>
	{#if yourOptionsExtra}
		<div class="mt-12">
			{@render yourOptionsExtra()}
		</div>
	{/if}
</section>

{#if !omitCompareMatrixSections}
	<div class="mt-20 scroll-mt-24" id="compare-pricing-plans">
		<PublicProductComparePricing
			{heroTheme}
			headingId="compare-pricing-plans"
			subtitle="Pricing & plans"
			title="Pricing & plans"
			description={`Compare the plans and prices for ${leftProduct.name} and ${rightProduct.name}.`}
			leftProductSlug={leftProduct.slug}
			rightProductSlug={rightProduct.slug}
			leftProductName={leftProduct.name}
			rightProductName={rightProduct.name}
			leftPricingUnit={leftProduct.pricingUnit}
			rightPricingUnit={rightProduct.pricingUnit}
			leftPlansVm={leftProduct.pricingPlans}
			rightPlansVm={rightProduct.pricingPlans}
		/>
	</div>

	{#if channelsSection}
		<WithWithout
			heroTheme={benefitsHeroTheme}
			headingId="compare-social-channels"
			withOnLeft
			landingSubtitle={channelsSection.subtitle}
			landingTitle={channelsSection.title}
			landingDescription={channelsSection.description}
			withoutTitle={channelsSection.withoutTitle}
			withTitle={channelsSection.withTitle}
			points={channelsSection.points}
			sectionClass="mt-20 scroll-mt-24"
		/>
	{/if}

	{#if directoryCoverageSection}
		<PublicCompareDirectoryCoverageSection
			heroTheme={benefitsHeroTheme}
			coverage={directoryCoverageSection}
		/>
	{/if}

	<div class="mt-20 scroll-mt-24" id="compare-feature-comparison">
		<PublicProductCompareSection
			{heroTheme}
			headingId="compare-feature-comparison"
			subtitle="Feature comparison"
			title={featureComparisonTitle}
			description={featureComparisonDescription}
			leftProductName={leftProduct.name}
			rightProductName={rightProduct.name}
			rowsVm={compareRows}
		/>
	</div>

	<WithWithout
		heroTheme={benefitsHeroTheme}
		headingId="compare-benefits"
		withOnLeft
		landingSubtitle={withWithoutSection.subtitle}
		landingTitle={withWithoutSection.title}
		landingDescription={withWithoutSection.description}
		withoutTitle={withWithoutSection.withoutTitle}
		withTitle={withWithoutSection.withTitle}
		points={withWithoutSection.points}
		sectionClass="mt-20 scroll-mt-24 bg-base-200 py-16 sm:py-20"
	/>
{/if}

{@render longFormSection(longForm.whenTheyWin, 'mt-20 scroll-mt-24')}

{#if !omitCompareMatrixSections}
	<section
		id={longForm.otherAlternatives.id}
		class="mt-20 scroll-mt-24"
		aria-labelledby="other-alternatives-heading"
	>
		<FeaturesSectionHeader
			{heroTheme}
			headingId="other-alternatives-heading"
			subtitle={longForm.otherAlternatives.subtitle}
			title={longForm.otherAlternatives.title}
		/>
		<div class="mt-8">
			<CompareLongFormBodyList
				sectionId={longForm.otherAlternatives.id}
				paragraphs={longForm.otherAlternatives.body}
			/>
		</div>

		{#if peerCards.length > 0}
			<ul class="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
				{#each peerCards as item (item.id)}
					<li>
						<SimpleLinkCard
							{item}
							pattern={null}
							patternComponent={StripedPattern}
							patternClass="text-primary/12 stroke-[0.75]"
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
