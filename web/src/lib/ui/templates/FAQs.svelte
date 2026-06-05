<script lang="ts">
	import { PUBLIC_PRICING_FAQ_ITEMS } from '$lib/billing/constants/publicPricingCatalog';

	import BillingFaqAccordion from '$lib/ui/components/billing/BillingFaqAccordion.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass: string;
		descriptionClass: string;
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
	};

	let { heroTheme, landingSubtitle, landingTitle, landingDescription }: Props = $props();

	const headingId = 'landing-faq-heading';

	const titleParts = $derived(
		landingTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);
</script>

<section
	class="relative isolate bg-base-100 py-16 sm:py-20"
	aria-labelledby={headingId}
>
	<div class="container mx-auto px-4">
		<div
			class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-14"
		>
			<div class="space-y-6 text-center lg:sticky lg:top-24 lg:text-left">
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
									{#each segments as seg (seg.text + String(seg.highlight))}
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

			<div class="flex flex-col gap-4">
				{#each PUBLIC_PRICING_FAQ_ITEMS as item, index (index)}
					<BillingFaqAccordion title={item.title} description={item.description} />
				{/each}
			</div>
		</div>
	</div>
</section>
