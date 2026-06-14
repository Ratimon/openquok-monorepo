<script lang="ts">
	import { PUBLIC_FAQ_ITEMS, type PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
	import { getPublicFaqConfigDefaults } from '$lib/config/constants/config';

	import FaqAccordion from '$lib/ui/templates/faq/FaqAccordion.svelte';

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
		faqSubtitle?: string;
		faqTitle?: string;
		faqDescription?: string;
		faqConfigVm?: Record<string, string>;
		faqItems?: PublicFaqItem[];
		sectionClass?: string;
	};

	let {
		heroTheme,
		faqSubtitle: faqSubtitleProp,
		faqTitle: faqTitleProp,
		faqDescription: faqDescriptionProp,
		faqConfigVm = {},
		faqItems = [],
		sectionClass = 'mt-24'
	}: Props = $props();

	const headingId = 'public-faq-heading';
	const faqDefaults = getPublicFaqConfigDefaults();
	const resolvedFaqItems = $derived(
		faqItems.length > 0 ? faqItems : [...PUBLIC_FAQ_ITEMS]
	);

	const faqSubtitle = $derived(
		faqSubtitleProp || faqConfigVm.SUBTITLE || faqDefaults.SUBTITLE
	);
	const faqTitle = $derived(faqTitleProp || faqConfigVm.TITLE || faqDefaults.TITLE);
	const faqDescription = $derived(
		faqDescriptionProp || faqConfigVm.DESCRIPTION || faqDefaults.DESCRIPTION
	);

	const titleParts = $derived(
		faqTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);
</script>

<section
	id="faq"
	class="{sectionClass} relative isolate"
	aria-labelledby={headingId}
>
	<div
		class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-14"
	>
		<div class="space-y-6 text-center lg:sticky lg:top-24 lg:text-left">
			{#if faqSubtitle}
				<p class={heroTheme.subtitleClass}>
					{faqSubtitle}
				</p>
			{/if}

			{#if faqTitle}
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

			{#if faqDescription}
				<p class={heroTheme.descriptionClass}>
					{faqDescription}
				</p>
			{/if}
		</div>

		<div class="flex flex-col gap-4">
			{#each resolvedFaqItems as item, index (index)}
				<FaqAccordion title={item.title} description={item.description} />
			{/each}
		</div>
	</div>
</section>
