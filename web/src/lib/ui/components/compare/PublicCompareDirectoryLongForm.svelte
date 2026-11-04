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
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import { COMPARE_PRODUCT_ICON_STYLES_CARD } from '$lib/content/constants/competitors/compareProductIconStyles';
	import { getCompareProduct } from '$lib/content/constants/competitors';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import PublicProductComparePricing from '$lib/ui/components/compare/PublicProductComparePricing.svelte';
	import PublicProductCompareSection from '$lib/ui/components/compare/PublicProductCompareSection.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';

	type Props = {
		longForm: CompareDetailLongFormViewModel;
		heroTheme: LandingHeroTheme;
		leftProduct: CompareProductSummaryViewModel;
		rightProduct: CompareProductSummaryViewModel;
		compareRows: CompareFeatureRowViewModel[];
		signUpPath: string;
	};

	let {
		longForm,
		heroTheme,
		leftProduct,
		rightProduct,
		compareRows,
		signUpPath
	}: Props = $props();

	const peerCards = $derived(
		longForm.otherAlternativePeers.map((peer) => {
			const product = getCompareProduct(peer.slug);
			return {
				id: peer.slug,
				title: peer.name,
				iconName: product?.icon,
				iconContainerClass:
					COMPARE_PRODUCT_ICON_STYLES_CARD[peer.slug as CompareProductSlug]?.cardContainerClass ??
					'bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 text-primary ring-primary/25',
				href: peer.href,
				description: peer.description,
				ctaLabel: 'Compare'
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
		<div class="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-base-content/80">
			{#each section.body as paragraph, index (index)}
				<p>{paragraph}</p>
			{/each}
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
	<div class="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-base-content/80">
		{#each longForm.whyPeopleLook.body as paragraph, index (index)}
			<p>{paragraph}</p>
		{/each}
	</div>
</section>

<section id={longForm.yourOptions.id} class="mt-20 scroll-mt-24" aria-labelledby="your-options-heading">
	<FeaturesSectionHeader
		{heroTheme}
		headingId="your-options-heading"
		subtitle={longForm.yourOptions.subtitle}
		title={longForm.yourOptions.title}
	/>
	<div class="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-base-content/80">
		{#each longForm.yourOptions.body as paragraph, index (index)}
			<p>{paragraph}</p>
		{/each}
	</div>

	<div class="mt-12">
		<PublicProductComparePricing
			{heroTheme}
			headingId="compare-directory-pricing"
			subtitle="pricing"
			title="Pricing snapshot"
			description={`Compare one-time packages from ${longForm.competitorName} with ${longForm.openQuokName} workspace pricing.`}
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

	<div class="mt-12">
		<PublicProductCompareSection
			{heroTheme}
			headingId="compare-directory-features"
			subtitle="features"
			title="Directory launch features"
			description="See which directory tools each option includes."
			leftProductName={leftProduct.name}
			rightProductName={rightProduct.name}
			rowsVm={compareRows}
		/>
	</div>
</section>

{@render longFormSection(longForm.switchingChecklist, 'mt-20 scroll-mt-24')}

<section
	id={longForm.openQuokAlternative.id}
	class="mt-20 scroll-mt-24"
	aria-labelledby="openquok-alternative-heading"
>
	<FeaturesSectionHeader
		{heroTheme}
		headingId="openquok-alternative-heading"
		subtitle={longForm.openQuokAlternative.subtitle}
		title={longForm.openQuokAlternative.title}
	/>
	<div class="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-base-content/80">
		{#each longForm.openQuokAlternative.body as paragraph, index (index)}
			<p>{paragraph}</p>
		{/each}
	</div>
	<div class="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:flex-wrap">
		<InternalLink
			href={longForm.directorySubmissionToolPath}
			class="btn btn-primary rounded-full px-6"
		>
			Directory submission tool
		</InternalLink>
		<InternalLink
			href={longForm.chromeExtensionDocsPath}
			class="btn btn-outline rounded-full px-6"
		>
			Chrome extension setup
		</InternalLink>
		<InternalLink href={signUpPath} class="btn btn-ghost rounded-full px-6">
			Start free trial
		</InternalLink>
	</div>
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
	<div class="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-base-content/80">
		{#each longForm.otherAlternatives.body as paragraph, index (index)}
			<p>{paragraph}</p>
		{/each}
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
