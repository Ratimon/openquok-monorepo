<script lang="ts">
	import type {
		CompareDetailLongFormViewModel,
		CompareLongFormSection,
		CompareProductSlug
	} from '$lib/content/constants/competitors/types';
	import type {
		CompareFeatureRowViewModel,
		CompareProductSummaryViewModel
	} from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { AlternativesListingViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import { COMPARE_PRODUCT_ICON_STYLES_CARD } from '$lib/content/constants/competitors/compareProductIconStyles';
	import { getCompareProduct } from '$lib/content/constants/competitors';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import PublicAlternativesListingCard from '$lib/ui/components/alternatives/PublicAlternativesListingCard.svelte';
	import CompareLongFormBodyList from '$lib/ui/components/compare/CompareLongFormBodyList.svelte';
	import PublicProductComparePricing from '$lib/ui/components/compare/PublicProductComparePricing.svelte';
	import PublicProductCompareSection from '$lib/ui/components/compare/PublicProductCompareSection.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';

	type Props = {
		longForm: CompareDetailLongFormViewModel;
		heroTheme: LandingHeroTheme;
		targetName: string;
		listings: readonly AlternativesListingViewModel[];
		isDirectoryTarget: boolean;
		openQuokProduct: CompareProductSummaryViewModel;
		targetProduct: CompareProductSummaryViewModel;
		compareRows: CompareFeatureRowViewModel[];
		signUpPath: string;
		iconContainerClassFor: (slug: CompareProductSlug) => string;
		iconClassFor: (slug: CompareProductSlug) => string | undefined;
	};

	let {
		longForm,
		heroTheme,
		targetName,
		listings,
		isDirectoryTarget,
		openQuokProduct,
		targetProduct,
		compareRows,
		signUpPath,
		iconContainerClassFor,
		iconClassFor
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

<section id={longForm.whyPeopleLook.id} class="scroll-mt-24" aria-labelledby="why-people-look-heading">
	<FeaturesSectionHeader
		{heroTheme}
		headingId="why-people-look-heading"
		subtitle={longForm.whyPeopleLook.subtitle}
		title={longForm.whyPeopleLook.title}
	/>
	<div class="mt-8">
		<CompareLongFormBodyList
			sectionId={longForm.whyPeopleLook.id}
			paragraphs={longForm.whyPeopleLook.body}
		/>
	</div>
</section>

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

	<div id="alternatives-best-list" class="mt-12 scroll-mt-24">
		<FeaturesSectionHeader
			{heroTheme}
			headingId="alternatives-best-list-heading"
			subtitle="ranked picks"
			title={`Best alternatives to ${targetName}`}
			description={`See alternatives to ${targetName}. You can compare prices, channels, and features.`}
		/>
		<div class="mt-10 space-y-6">
			{#each listings as listing (listing.slug)}
				<PublicAlternativesListingCard
					listingVm={listing}
					{targetName}
					iconContainerClass={iconContainerClassFor(listing.slug)}
					iconClass={iconClassFor(listing.slug)}
				/>
			{/each}
		</div>
	</div>

	{#if isDirectoryTarget}
		<div class="mt-12">
			<PublicProductComparePricing
				{heroTheme}
				headingId="alternatives-directory-pricing"
				subtitle="pricing"
				title="Pricing snapshot"
				description={`Compare one-time packages from ${longForm.competitorName} with ${longForm.openQuokName} workspace pricing.`}
				leftProductSlug={openQuokProduct.slug}
				rightProductSlug={targetProduct.slug}
				leftProductName={openQuokProduct.name}
				rightProductName={targetProduct.name}
				leftPricingUnit={openQuokProduct.pricingUnit}
				rightPricingUnit={targetProduct.pricingUnit}
				leftPlansVm={openQuokProduct.pricingPlans}
				rightPlansVm={targetProduct.pricingPlans}
			/>
		</div>

		<div class="mt-12">
			<PublicProductCompareSection
				{heroTheme}
				headingId="alternatives-directory-features"
				subtitle="features"
				title="Directory launch features"
				description="See which directory tools each option includes."
				leftProductName={openQuokProduct.name}
				rightProductName={targetProduct.name}
				rowsVm={compareRows}
			/>
		</div>
	{/if}
</section>

{@render longFormSection(longForm.whenTheyWin, 'mt-20 scroll-mt-24')}

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
