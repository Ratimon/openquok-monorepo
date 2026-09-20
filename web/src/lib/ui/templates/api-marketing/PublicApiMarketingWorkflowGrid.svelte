<script lang="ts">
	import type { PublicApiCapability } from '$lib/content/constants/apis/types';

	import { page } from '$app/state';
	import { getPublicApiHubWorkflowSection } from '$lib/content/constants/apis/publicApiCapabilityHubWorkflowConfig';
	import { cardPatternAtIndex } from '$lib/ui/patterns';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import type { SimpleLinkCardItem } from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';

	type Props = {
		capability: PublicApiCapability;
	};

	let { capability }: Props = $props();

	const section = $derived(getPublicApiHubWorkflowSection(capability));
	const headingId = 'public-api-marketing-workflow-grid-heading';

	const cardItems = $derived(
		section.cards.map(
			(card): SimpleLinkCardItem => ({
				id: card.id,
				title: card.title,
				description: card.description,
				href: hostedMarketingHref(route(card.href), page.url.origin),
				ctaLabel: card.ctaLabel,
				iconName: card.iconName,
				iconContainerClass: 'bg-primary/10 text-primary ring-primary/15'
			})
		)
	);
</script>

<section class="bg-base-100 py-12 md:py-16" aria-labelledby={headingId}>
	<div class="container mx-auto px-4">
		<FeaturesSectionHeader
			heroTheme={landingHeroTheme}
			{headingId}
			title={section.sectionTitle}
			description={section.sectionDescription}
		/>

		<ul
			class="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2"
			aria-label="Related OpenQuok API workflows"
		>
			{#each cardItems as item, index (item.id)}
				<li>
					<SimpleLinkCard
						{item}
						pattern={cardPatternAtIndex(index)}
						patternComponent={StripedPattern}
						patternClass="text-primary/12 stroke-[0.75]"
					/>
				</li>
			{/each}
		</ul>
	</div>
</section>
