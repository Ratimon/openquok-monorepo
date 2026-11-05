<script lang="ts">
	import type {
		CompareHubSectionViewModel,
		CompareHubViewModel
	} from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';

	import {
		landingHeroTheme,
		PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS
	} from '$lib/ui/templates/landing-page/landingHeroTheme';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import PublicCompareHubProductPicker from '$lib/ui/components/compare/PublicCompareHubProductPicker.svelte';
	import PublicCompareHubSectionHeading from '$lib/ui/components/compare/PublicCompareHubSectionHeading.svelte';
	import PublicCompareLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicCompareLandingBreadcrumb.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';

	type ProductIconStyle = {
		containerClass: string;
		iconClass?: string;
	};

	type Props = {
		hubVm: CompareHubViewModel;
		selectedBaseSlug: CompareProductSlug;
		onSelectBaseProduct: (slug: CompareProductSlug) => void;
		iconStyleForProduct: (slug: CompareProductSlug) => ProductIconStyle;
	};

	let { hubVm, selectedBaseSlug, onSelectBaseProduct, iconStyleForProduct }: Props = $props();

	const headingId = 'public-compare-hub-heading';

	const cardGridHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase'
	};

	const heroHighlightGradientClass = $derived(
		landingHeroTheme.titleSegmentClassWithOffset(
			0,
			[{ text: hubVm.heroHighlightText, highlight: false }],
			1
		)
	);

	function pairCardItems(section: CompareHubSectionViewModel) {
		return section.pairs.map((pair) => ({
			id: pair.slug,
			title: `vs. ${pair.name}`,
			iconName: pair.icon,
			iconContainerClass: iconStyleForProduct(pair.slug as CompareProductSlug).containerClass,
			iconClass: iconStyleForProduct(pair.slug as CompareProductSlug).iconClass,
			href: pair.href,
			description: pair.description,
			ctaLabel: 'Open'
		}));
	}
</script>

<section class="py-10 md:py-14" aria-labelledby={headingId}>
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<div class="flex justify-center">
			<PublicCompareLandingBreadcrumb variant="hub" />
		</div>
		<h1
			id={headingId}
			class={`flex flex-wrap items-center justify-center gap-x-2 gap-y-3 ${PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS}`}
		>
			<PublicCompareHubProductPicker
				variant="hero"
				products={hubVm.products}
				selectedSlug={selectedBaseSlug}
				selectedName={hubVm.baseProductName}
				selectedIcon={hubVm.products.find((product) => product.slug === selectedBaseSlug)?.icon ??
					hubVm.products[0]!.icon}
				onSelect={onSelectBaseProduct}
				{iconStyleForProduct}
				ariaLabel="Choose the main product to compare"
			/>
			<span class="text-base-content">vs.</span>
			<span class={heroHighlightGradientClass}>{hubVm.heroHighlightText}</span>
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{hubVm.description}
		</p>
	</header>

	<div class="mt-12">
		<PublicCompareHubSectionHeading
			section={hubVm.socialSection}
			{selectedBaseSlug}
			{onSelectBaseProduct}
			{iconStyleForProduct}
		/>

		<SimpleCardGrid
			heroTheme={cardGridHeroTheme}
			headingId="public-compare-social-grid-heading"
			title=""
			items={pairCardItems(hubVm.socialSection)}
			getItemKey={(item) => item.id}
			sectionClass="pt-10 pb-0"
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

		<p class="mx-auto mt-8 max-w-5xl text-center">
			<InternalLink
				href={hubVm.socialSection.learnMoreHref}
				class="text-sm font-semibold text-primary hover:underline"
			>
				{hubVm.socialSection.learnMoreLabel}
			</InternalLink>
		</p>
	</div>

	<div class="mt-12 border-t border-base-content/10 pt-10 md:mt-14 md:pt-14">
		<PublicCompareHubSectionHeading
			section={hubVm.directorySection}
			{selectedBaseSlug}
			{onSelectBaseProduct}
			{iconStyleForProduct}
		/>

		<SimpleCardGrid
			heroTheme={cardGridHeroTheme}
			headingId="public-compare-directory-grid-heading"
			title=""
			items={pairCardItems(hubVm.directorySection)}
			getItemKey={(item) => item.id}
			sectionClass="pt-10 pb-0"
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

		<p class="mx-auto mt-8 max-w-5xl text-center">
			<InternalLink
				href={hubVm.directorySection.learnMoreHref}
				class="text-sm font-semibold text-primary hover:underline"
			>
				{hubVm.directorySection.learnMoreLabel}
			</InternalLink>
		</p>
	</div>
</section>
