<script lang="ts">
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import { PUBLIC_FAQ_ITEMS, type PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
	import { getPublicFaqConfigDefaults } from '$lib/config/constants/config';

	import FaqAccordion from '$lib/ui/templates/faq/FaqAccordion.svelte';
	import PublicLandingSectionHeading from '$lib/ui/templates/landing-page/PublicLandingSectionHeading.svelte';

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
				<PublicLandingSectionHeading
					{headingId}
					title={faqTitle}
					{heroTheme}
					commaSeparated={true}
					gradientMode="part"
				/>
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
