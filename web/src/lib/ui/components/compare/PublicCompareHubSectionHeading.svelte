<script lang="ts">
	import type { CompareHubSectionViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import PublicCompareHubProductPicker from '$lib/ui/components/compare/PublicCompareHubProductPicker.svelte';

	type ProductIconStyle = {
		containerClass: string;
		iconClass?: string;
	};

	type Props = {
		section: CompareHubSectionViewModel;
		selectedBaseSlug: CompareProductSlug;
		onSelectBaseProduct: (slug: CompareProductSlug) => void;
		iconStyleForProduct: (slug: CompareProductSlug) => ProductIconStyle;
		titleClass?: string;
	};

	let {
		section,
		selectedBaseSlug,
		onSelectBaseProduct,
		iconStyleForProduct,
		titleClass = 'text-2xl font-black tracking-tight text-balance sm:text-3xl'
	}: Props = $props();

	const selectedProduct = $derived(
		section.products.find((product) => product.slug === selectedBaseSlug) ??
			section.products.find((product) => product.slug === section.baseSlug) ??
			section.products[0]
	);

	const peerSuffixGradientClass = $derived(
		landingHeroTheme.titleSegmentClassWithOffset(
			0,
			[{ text: section.titlePeerSuffix, highlight: false }],
			1
		)
	);
</script>

<div class="mx-auto max-w-3xl space-y-4 text-center">
	<p class={landingHeroTheme.subtitleClass}>
		{section.subtitle}
	</p>
	<h2 id={section.sectionId} class={`flex flex-wrap items-center justify-center gap-x-2 gap-y-2 ${titleClass}`}>
		{#if selectedProduct}
			<PublicCompareHubProductPicker
				variant="section"
				products={section.products}
				selectedSlug={selectedProduct.slug}
				selectedName={selectedProduct.name}
				selectedIcon={selectedProduct.icon}
				onSelect={onSelectBaseProduct}
				{iconStyleForProduct}
				ariaLabel={`Choose the product to compare in ${section.subtitle}`}
			/>
		{/if}
		<LandingHeroHighlightedText>vs</LandingHeroHighlightedText>
		<span class={peerSuffixGradientClass}>{section.titlePeerSuffix}</span>
	</h2>
	<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
		{section.description}
	</p>
</div>
